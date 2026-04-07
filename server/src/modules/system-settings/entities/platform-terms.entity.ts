import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../../iam/entities/user.entity';

@Table({
    tableName: 'platform_terms',
    timestamps: true,
})
export class PlatformTerms extends Model<PlatformTerms> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    content: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 1,
    })
    version: number;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    updatedById: string;

    @BelongsTo(() => User)
    updatedBy: User;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: true,
    })
    isActive: boolean;
}
