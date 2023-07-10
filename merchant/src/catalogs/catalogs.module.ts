import { Module } from '@nestjs/common';

import { PrismaService } from 'src/prisma.service';
import { CatalogsService } from './catalogs.service';
import { CatalogsController } from './catalogs.controller';
import { AuthenticationService } from 'src/authentication/authentication.service';

@Module({
    imports: [],
    controllers: [CatalogsController],
    providers: [PrismaService, CatalogsService, AuthenticationService],
})
export class CatalogsModule { }
