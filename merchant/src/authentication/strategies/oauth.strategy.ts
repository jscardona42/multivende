import { Injectable } from '@nestjs/common';
import * as querystring from 'querystring';
import axios from 'axios';

@Injectable()
export class OAuthStrategy {
  private readonly multivendeBaseUrl = process.env.BASE_URL;
  private readonly redirectUri = 'http://localhost:3000/configuration';
  private readonly clientId = process.env.CLIENT_ID;
  private readonly scope = 'read:checkouts';

  generateAuthorizationUrl(): string {
    const queryParams = {
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scope,
    };
    return `${this.multivendeBaseUrl}/apps/authorize?${querystring.stringify(queryParams)}`;
  }

  async exchangeAuthorizationCodeForToken(authorizationCode: string): Promise<any> {

    const endpoint = '/oauth/access-token';

    const data = {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: authorizationCode,
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
}
