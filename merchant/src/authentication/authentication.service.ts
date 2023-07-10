import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import * as CryptoJS from 'crypto-js';
import { CreateAuthenticationDto } from './dto/authentication.dto';

const TOKEN_NAME = 'token';
const CODE_NAME = 'authorization_code';

@Injectable()
export class AuthenticationService {
  constructor(private prismaService: PrismaService) { }

  async getTokenIdByName(name: string): Promise<number> {
    let authorization_token_id = 0;

    let authorization = await this.prismaService.authorizationtoken.findFirst({
      where: { name },
      select: { authorization_token_id: true },
    });

    if (authorization !== null) {
      authorization_token_id = authorization.authorization_token_id;
    }
    return authorization_token_id;
  }

  async prepareData(code: string, responseData: any) {
    const token_id = await this.getTokenIdByName(TOKEN_NAME);
    const code_id = await this.getTokenIdByName(CODE_NAME);

    let tokenEncrypt = CryptoJS.AES.encrypt(responseData.token, process.env.KEY_CRYPTO).toString();

    const tokenFields: CreateAuthenticationDto = {
      name: TOKEN_NAME,
      token: tokenEncrypt,
      expires_at: responseData.expiresAt,
      refresh_token: responseData.refreshToken,
      merchant_id: responseData.MerchantId,
    };

    await this.saveData(token_id, tokenFields);

    const codeFields: CreateAuthenticationDto = {
      name: CODE_NAME,
      token: code,
    };

    await this.saveData(code_id, codeFields);
  }

  async saveData(authorization_token_id: number, fields: any) {
    return this.prismaService.authorizationtoken.upsert({
      where: {
        authorization_token_id: authorization_token_id,
      },
      update: fields,
      create: fields,
    });
  }
}
