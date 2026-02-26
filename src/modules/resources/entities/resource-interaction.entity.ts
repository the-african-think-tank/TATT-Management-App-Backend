import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Resource } from './resource.entity';
import { User } from '../../iam/entities/user.entity';

export enum ResourceInteractionAction {
    VIEW = 'VIEW',
    READ = 'READ',
    ACTIVATE = 'ACTIVATE',
}

@Table({
    tableName: 'resource_interactions',
    timestamps: true,
    updatedAt: false,
})
export class ResourceInteraction extends Model<ResourceInteraction> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id: string;

    @ForeignKey(() => Resource)
    @Column({ type: DataType.UUID, allowNull: false })
    resourceId: string;

    @BelongsTo(() => Resource, 'resourceId')
    resource: Resource;

    @ForeignKey(() => User)
    @Column({ type: DataType.UUID, allowNull: false })
    userId: string;

    @BelongsTo(() => User, 'userId')
    user: User;

    @Column({
        type: DataType.ENUM(...Object.values(ResourceInteractionAction)),
        allowNull: false,
    })
    action: ResourceInteractionAction;
}
