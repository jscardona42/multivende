import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthenticationService } from './authentication/authentication.service';
import { CatalogsService } from './catalogs/catalogs.service';
import { CatalogsController } from './catalogs/catalogs.controller';
import { AuthenticationController } from './authentication/authentication.controller';
import { CatalogsModule } from './catalogs/catalogs.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { OAuthStrategy } from './authentication/strategies/oauth.strategy';

@Module({
  imports: [
    // ClientsModule.register([
    //   {
    //     name: 'CATALOGS_SERVICE',
    //     transport: Transport.RMQ,
    //     options: {
    //       urls: ['amqp://admin:1234@localhost:5672'],
    //       queue: 'catalogs_queue',
    //       queueOptions: {
    //         durable: false
    //       },
    //     },
    //   },
    // ]),
  ],
  controllers: [AppController, AuthenticationController, CatalogsController],
  providers: [AppService, OAuthStrategy, AuthenticationService, CatalogsService, PrismaService],
})
export class AppModule { }
