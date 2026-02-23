import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { User } from '../../modules/iam/entities/user.entity';
import { Chapter } from '../../modules/chapters/entities/chapter.entity';
import { ProfessionalInterest } from '../../modules/interests/entities/interest.entity';
import { UserInterest } from '../../modules/interests/entities/user-interest.entity';
import { Connection } from '../../modules/connections/entities/connection.entity';
import { SecurityPolicy } from '../../modules/security/entities/security-policy.entity';
import { PasswordHistory } from '../../modules/security/entities/password-history.entity';
import { EmailOtp } from '../../modules/security/entities/email-otp.entity';
import { Post } from '../../modules/feed/entities/post.entity';
import { PostLike } from '../../modules/feed/entities/post-like.entity';
import { PostComment } from '../../modules/feed/entities/post-comment.entity';
import { DirectMessage } from '../../modules/messages/entities/direct-message.entity';

@Module({
    imports: [
        SequelizeModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                dialect: 'postgres',
                host: config.get<string>('DB_HOST', 'localhost'),
                port: config.get<number>('DB_PORT', 5432),
                username: config.get<string>('DB_USER', 'postgres'),
                password: config.get<string>('DB_PASS', 'postgres'),
                database: config.get<string>('DB_NAME', 'tatt_db'),
                models: [
                    User, Chapter, ProfessionalInterest, UserInterest, Connection,
                    SecurityPolicy, PasswordHistory, EmailOtp,
                    Post, PostLike, PostComment, DirectMessage,
                ],
                autoLoadModels: true,
                synchronize: false, // Changed from true to avoid Sequelize alter bugs with enums/arrays
                logging: config.get<string>('NODE_ENV') === 'development' ? console.log : false,
            }),
        }),
    ],
})
export class DatabaseModule { }
