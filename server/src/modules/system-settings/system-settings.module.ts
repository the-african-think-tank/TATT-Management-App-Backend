import { Module, Global } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SystemSetting } from './entities/system-setting.entity';
import { SystemSettingsService } from './system-settings.service';
import { SystemSettingsController } from './system-settings.controller';
import { SystemSettingsSeeder } from './system-settings-seeder.service';
import { IamModule } from '../iam/iam.module';

@Global()
@Module({
    imports: [
        SequelizeModule.forFeature([SystemSetting]),
        IamModule,
    ],
    providers: [SystemSettingsService, SystemSettingsSeeder],
    controllers: [SystemSettingsController],
    exports: [SystemSettingsService],
})
export class SystemSettingsModule { }
