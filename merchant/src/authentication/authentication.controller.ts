import { Controller, Get, Redirect, Query, Res } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { OAuthStrategy } from './strategies/oauth.strategy';
import { Response } from 'express';

@Controller()
export class AuthenticationController {
  constructor(
    private readonly oauthStrategy: OAuthStrategy,
    private authenticationService: AuthenticationService,
  ) { }

  @Get('authentication')
  @Redirect()
  redirectToAuthorizationUrl(): { url: string } {
    const authorizationUrl = this.oauthStrategy.generateAuthorizationUrl();
    return { url: authorizationUrl };
  }

  @Get('configuration')
  async handleCallback(@Query('code') code: string,@Res() res: Response) {
    
    const token = await this.oauthStrategy.exchangeAuthorizationCodeForToken(code);
    await this.authenticationService.prepareData(code, token);
    return res.redirect('http://localhost:4200/catalogs');
  }
}
