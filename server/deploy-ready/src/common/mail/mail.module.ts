import { Module, Global } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

@Global()
@Module({
    imports: [
        MailerModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                transport: {
                    host: config.get<string>('MAIL_HOST', 'smtp.gmail.com'),
                    port: config.get<number>('MAIL_PORT', 587),
                    secure: config.get<boolean>('MAIL_SECURE', false),
                    auth: {
                        user: config.get<string>('MAIL_USER', 'test@example.com'),
                        pass: config.get<string>('MAIL_PASS', 'passwordPlaceholder'),
                    },
                },
                defaults: {
                    from: `"No Reply" <${config.get<string>('MAIL_FROM', 'noreply@tatt.org')}>`,
                },
            }),
        }),
    ],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule { }
