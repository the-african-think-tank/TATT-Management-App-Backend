import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../../iam/entities/user.entity';

/**
 * Stores hashes of previous passwords so rotation policy can block reuse.
 */
@Table({
    tableName: 'password_history',
    timestamps: true,
    updatedAt: false, // only care about when it was created
})
export class PasswordHistory extends Model<PasswordHistory> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id: string;

    @ForeignKey(() => User)
    @Column({ type: DataType.UUID, allowNull: false })
    userId: string;

    @BelongsTo(() => User)
    user: User;

    /** bcrypt hash of the old password */
    @Column({ type: DataType.STRING, allowNull: false })
    passwordHash: string;
}
