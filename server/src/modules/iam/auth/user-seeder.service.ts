import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { SystemRole, CommunityTier } from '../enums/roles.enum';

@Injectable()
export class UserSeederService implements OnApplicationBootstrap {
    private readonly logger = new Logger(UserSeederService.name);

    constructor(
        @InjectModel(User) private userRepository: typeof User,
        private configService: ConfigService,
    ) { }

    async onApplicationBootstrap() {
        this.logger.log('Starting User Seeding process...');
        await this.seedDefaultAdmin();
    }


    private async seedDefaultAdmin() {
        const email = this.configService.get<string>('DEFAULT_ADMIN_EMAIL');
        const password = this.configService.get<string>('DEFAULT_ADMIN_PASS');
        const firstName = this.configService.get<string>('DEFAULT_ADMIN_FIRSTNAME', 'TATT');
        const lastName = this.configService.get<string>('DEFAULT_ADMIN_LASTNAME', 'Admin');

        if (!email || !password) {
            this.logger.warn('Default admin credentials not set in environment variables. Skipping seeding.');
            return;
        }

        try {
            const adminUser = await this.userRepository.findOne({
                where: { email },
            });

            if (!adminUser) {
                this.logger.log(`Seeding default admin user: ${email}`);
                const hashedPassword = await bcrypt.hash(password, 12);
                await this.userRepository.create({
                    email,
                    password: hashedPassword,
                    firstName,
                    lastName,
                    systemRole: SystemRole.SUPERADMIN,
                    communityTier: CommunityTier.FREE,
                    isActive: true,
                    isApproved: true,
                    passwordChangedAt: new Date(),
                } as any);
                this.logger.log('Default admin user created successfully.');
            } else {
                this.logger.debug('Default admin user already exists.');
            }
        } catch (error) {
            this.logger.error('Failed to seed default admin user:', error.message);
        }
    }
}
