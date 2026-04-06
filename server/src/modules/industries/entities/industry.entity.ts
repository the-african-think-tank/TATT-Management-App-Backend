import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { User } from '../../iam/entities/user.entity';

@Table({
    tableName: 'community_industries',
    timestamps: true,
})
export class CommunityIndustry extends Model<CommunityIndustry> {
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
    name: string; // e.g., 'Agriculture', 'Aviation', 'Public Service'

    @HasMany(() => User, 'industryId')
    users: User[];
}
