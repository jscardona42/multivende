import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { PrismaService } from 'src/prisma.service';
import { AuthenticationService } from './authentication.service';;

@Module({
    imports: [],
    controllers: [AuthenticationController],
    providers: [PrismaService, AuthenticationService],
})
export class AuthenticationModule { }
