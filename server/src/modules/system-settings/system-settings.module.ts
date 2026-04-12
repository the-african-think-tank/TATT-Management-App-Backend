import { Module, Global, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SystemSetting } from './entities/system-setting.entity';
import { PlatformTerms } from './entities/platform-terms.entity';
import { SystemSettingsService } from './system-settings.service';
import { SystemSettingsController } from './system-settings.controller';
import { TermsController } from './terms.controller';
import { TermsService } from './terms.service';
import { SystemSettingsSeeder } from './system-settings-seeder.service';
import { IamModule } from '../iam/iam.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { User } from '../iam/entities/user.entity';

@Global()
@Module({
    imports: [
        SequelizeModule.forFeature([SystemSetting, PlatformTerms, User]),
        IamModule,
        forwardRef(() => NotificationsModule),
    ],
    providers: [SystemSettingsService, SystemSettingsSeeder, TermsService],
    controllers: [SystemSettingsController, TermsController],
    exports: [SystemSettingsService, TermsService],
})
export class SystemSettingsModule { }
