import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../../iam/entities/user.entity';
import { VolunteerTrainingResource } from './volunteer-training.entity';

@Table({
    tableName: 'volunteer_training_progress',
    timestamps: true,
})
export class VolunteerTrainingProgress extends Model<VolunteerTrainingProgress> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    userId: string;

    @BelongsTo(() => User)
    user: User;

    @ForeignKey(() => VolunteerTrainingResource)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    resourceId: string;

    @BelongsTo(() => VolunteerTrainingResource)
    resource: VolunteerTrainingResource;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false,
    })
    isCompleted: boolean;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    completedAt?: Date;
}
