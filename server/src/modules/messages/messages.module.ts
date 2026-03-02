import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { DirectMessage } from './entities/direct-message.entity';
import { Connection } from '../connections/entities/connection.entity';
import { User } from '../iam/entities/user.entity';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MessagesGateway } from './messages.gateway';

@Module({
    imports: [
        SequelizeModule.forFeature([DirectMessage, Connection, User]),
        JwtModule.register({}), // Handled by global config but needed locally for injection in Gateway
    ],
    controllers: [MessagesController],
    providers: [MessagesService, MessagesGateway],
    exports: [MessagesService],
})
export class MessagesModule { }
