import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import axios from 'axios';
import * as CryptoJS from 'crypto-js';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { CreateAuthenticationDto } from 'src/authentication/dto/authentication.dto';
import { RabbitmqService } from 'src/rabbitmq/rabbitmq.service';
const fs = require('fs');

@Injectable()
export class CatalogsService {
  constructor(
    private prismaService: PrismaService,
    private authenticationService: AuthenticationService, 
    private rabbitmqService: RabbitmqService) {

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

  async saveBulkStock(data: any[]): Promise<void> {
    const batchSize = 1000;
    const recordBatches = [];
    while (data.length) {
      recordBatches.push(data.splice(0, batchSize));
    }
  
    for (const batch of recordBatches) {
      await this.rabbitmqService.sendMessage(batch);
    }

    let warehouses = await this.getStoresAndWareHouses();

    let warehouse_id = warehouses.entries[0]._id;
    await this.processRecords(warehouse_id);
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

  async processRecords(warehouse_id: number): Promise<void> {
    let packageCount = 0;
    let successCount = 0;
    let errorCount = 0;
    let attempt = 0;

    let i = 0;
    try {
      while (attempt < 5 && true) {
        i++;
        const record = await this.rabbitmqService.receiveMessage();
        if (!record) {
          break;
        }
        packageCount++;
        successCount += record.length;
        console.log(`Actualización de stock exitosa para el paquete ${i}`);
        await this.sendRecordToEndpoint(record, warehouse_id);
      }
    } catch (error) {
      console.error(`Error al procesar el paquete ${i}:`, error);
      errorCount++;
      this.logError(`Error al procesar el paquete ${i}: ${error.message}`);
      await this.delay(5000);
      attempt++;
    }
    console.log(`Procesamiento completo. Registros exitosos: ${successCount}, Registros con error: ${errorCount}`);
  }

  private async sendRecordToEndpoint(record: any, warehouse_id: number): Promise<void> {

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
      const response = await axios.post(process.env.BASE_URL + endpoint, record, { headers });
      return response.data;
    } catch (error) {
      throw new Error(`Error en la actualización de stock: ${error.message}`);
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
