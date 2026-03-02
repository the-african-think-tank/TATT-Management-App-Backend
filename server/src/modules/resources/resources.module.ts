import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Resource } from './entities/resource.entity';
import { ResourceInteraction } from './entities/resource-interaction.entity';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';

@Module({
    imports: [
        SequelizeModule.forFeature([Resource, ResourceInteraction]),
    ],
    controllers: [ResourcesController],
    providers: [ResourcesService],
    exports: [ResourcesService],
})
export class ResourcesModule { }
