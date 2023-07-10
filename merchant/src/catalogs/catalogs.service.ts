import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import axios from 'axios';
import * as CryptoJS from 'crypto-js';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { CreateAuthenticationDto } from 'src/authentication/dto/authentication.dto';
const fs = require('fs');

@Injectable()
export class CatalogsService {
  constructor(
    private prismaService: PrismaService,
    private authenticationService: AuthenticationService) {

  }

  async getStoresAndWareHouses() {
    let authorization = await this.prismaService.authorizationtoken.findFirst({
      where: { name: "token" },
      select: { merchant_id: true, token: true, expires_at: true }
    });

    if (authorization.expires_at < new Date()) {
      let responseData = await this.setRefreshToken();
      const token_id = await this.authenticationService.getTokenIdByName('token');

      let tokenEncrypt = CryptoJS.AES.encrypt(responseData.token, process.env.KEY_CRYPTO).toString();

      const tokenFields: CreateAuthenticationDto = {
        name: 'token',
        token: tokenEncrypt,
        expires_at: responseData.expiresAt,
        refresh_token: responseData.refreshToken,
        merchant_id: responseData.MerchantId,
      };

      await this.authenticationService.saveData(token_id, tokenFields);

      authorization = await this.prismaService.authorizationtoken.findFirst({
        where: { name: "token" },
        select: { merchant_id: true, token: true, expires_at: true }
      });
    }

    let merchant_id = authorization.merchant_id;
    let token = CryptoJS.AES.decrypt(authorization.token, process.env.KEY_CRYPTO).toString(CryptoJS.enc.Utf8);

    const baseUrl = 'https://app.multivende.com';
    const endpoint = `/api/m/${merchant_id}/stores-and-warehouses`

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    try {
      const response = await axios.get(baseUrl + endpoint, { headers });
      return response.data;
    } catch (error) {
      throw new Error(error);
    }
  }

  async processRecords(warehouse_id, records) {
    try {
      await this.sendDataRecords(warehouse_id, records);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  async sendDataRecords(warehouse_id: string, records: any[]) {
    const batchSize = 1000;
    const dataPackages = this.splitIntoPackages(records, batchSize);
    let packageCount = 0;
    let successCount = 0;
    let errorCount = 0;
    let attempt = 0;

    for (let i = 0; i < dataPackages.length; i++) {
      const dataPackage = dataPackages[i];
      let success = false;

      while (attempt < 5 && !success) {
        try {
          await this.updateBulkStock(warehouse_id, dataPackage);
          success = true;
          packageCount++;
          successCount += dataPackage.length;
          console.log(`Actualización de stock exitosa para el paquete ${i + 1}`);
        } catch (error) {
          console.error(`Error al procesar el paquete ${i + 1}:`, error);
          errorCount++;
          this.logError(`Error al procesar el paquete ${i + 1}: ${error.message}`);
          await this.delay(5000);
          attempt++;
        }
      }
    }

    console.log(`Procesamiento completo. Registros exitosos: ${successCount}, Registros con error: ${errorCount}`);
  }

  splitIntoPackages(data: any[], batchSize: number): any[][] {
    const packages = [];
    for (let i = 0; i < data.length; i += batchSize) {
      const package1 = data.slice(i, i + batchSize);
      packages.push(package1);

    }
    return packages;
  }

  async processDataPackages(warehouse_id, dataPackages: any[][]) {
    for (const dataPackage of dataPackages) {
      try {
        await this.updateBulkStock(warehouse_id, dataPackage);
      } catch (error) {
        console.error('Error al procesar el paquete de datos:', error);
        throw error;
      }
    }
  }

  async updateBulkStock(warehouse_id: string, data: any) {
    let authorization = await this.prismaService.authorizationtoken.findFirst({
      where: { name: "token" },
      select: { merchant_id: true, token: true }
    });

    let token = CryptoJS.AES.decrypt(authorization.token, process.env.KEY_CRYPTO,).toString(CryptoJS.enc.Utf8);

    const endpoint = `/api/product-stocks/stores-and-warehouses/${warehouse_id}/bulk-set`;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    try {
      const response = await axios.post(process.env.BASE_URL + endpoint, data, { headers });
      return response.data;
    } catch (error) {
      throw new Error(`Error en la actualización de stock: ${error.message}`);
    }
  }

  async setRefreshToken() {
    let authorization = await this.prismaService.authorizationtoken.findFirst({
      where: { name: "token" },
      select: { refresh_token: true }
    });

    const endpoint = '/oauth/access-token';

    const data = {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: authorization.refresh_token,
    };

    const headers = {
      'Content-Type': 'application/json',
    };

    try {
      const response = await axios.post(process.env.BASE_URL + endpoint, data, { headers });
      return response.data;
    } catch (error) {
      throw new Error(error);
    }
  }

  logError(error: string) {
    const logMessage = `${new Date().toISOString()} - ${error}\n`;

    fs.appendFile('error.log', logMessage, (err) => {
      if (err) {
        console.error('Error al guardar el log de error:', err);
      }
    });
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
