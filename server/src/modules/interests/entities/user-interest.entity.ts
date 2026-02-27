import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { User } from '../../iam/entities/user.entity';
import { ProfessionalInterest } from './interest.entity';

@Table({
    tableName: 'user_interests',
    timestamps: false,
})
export class UserInterest extends Model<UserInterest> {
    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        primaryKey: true,
    })
    userId: string;

    @ForeignKey(() => ProfessionalInterest)
    @Column({
        type: DataType.UUID,
        primaryKey: true,
    })
    interestId: string;
}
