import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DirectMessage } from './entities/direct-message.entity';
import { Connection } from '../connections/entities/connection.entity';
import { User } from '../iam/entities/user.entity';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MessagesGateway } from './messages.gateway';

@Module({
    imports: [
        SequelizeModule.forFeature([DirectMessage, Connection, User]),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || process.env.JWT_SECRET || 'fallback_secret_for_dev_only',
                signOptions: { expiresIn: '7d' },
            }),
        }),
    ],
    controllers: [MessagesController],
    providers: [MessagesService, MessagesGateway],
    exports: [MessagesService],
})
export class MessagesModule { }
