import { Table, Column, Model, DataType, BelongsToMany } from 'sequelize-typescript';
import { User } from '../../iam/entities/user.entity';
import { UserInterest } from './user-interest.entity';

@Table({
    tableName: 'professional_interests',
    timestamps: true,
})
export class ProfessionalInterest extends Model<ProfessionalInterest> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    name: string; // e.g., 'Finance', 'Tech', 'Healthcare'

    @BelongsToMany(() => User, () => UserInterest)
    users: User[];
}
