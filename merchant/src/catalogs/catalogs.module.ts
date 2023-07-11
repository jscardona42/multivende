import { Module } from '@nestjs/common';

import { PrismaService } from 'src/prisma.service';
import { CatalogsService } from './catalogs.service';
import { CatalogsController } from './catalogs.controller';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { RabbitmqService } from 'src/rabbitmq/rabbitmq.service';

@Module({
    imports: [],
    controllers: [CatalogsController],
    providers: [PrismaService, CatalogsService, AuthenticationService, RabbitmqService],
})
export class CatalogsModule { }
