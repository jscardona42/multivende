import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthenticationService } from './authentication/authentication.service';
import { CatalogsService } from './catalogs/catalogs.service';
import { CatalogsController } from './catalogs/catalogs.controller';
import { AuthenticationController } from './authentication/authentication.controller';
import { OAuthStrategy } from './authentication/strategies/oauth.strategy';
import { RabbitmqService } from './rabbitmq/rabbitmq.service';

@Module({
  imports: [],
  controllers: [AppController, AuthenticationController, CatalogsController],
  providers: [AppService, OAuthStrategy, AuthenticationService, CatalogsService, PrismaService, RabbitmqService],
})
export class AppModule { }
