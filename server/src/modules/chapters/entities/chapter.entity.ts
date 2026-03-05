import { Table, Column, Model, DataType, HasMany, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { User } from '../../iam/entities/user.entity';

@Table({
    tableName: 'chapters',
    timestamps: true,
    paranoid: true,
})
export class Chapter extends Model<Chapter> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id: string;

    @Column({
        type: DataType.STRING(4),
        allowNull: false,
        unique: true,
    })
    code: string; // 4-character ID, e.g., '1001'

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    name: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    description?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    country?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    stateRegion?: string;

    @Column({
        type: DataType.ARRAY(DataType.STRING),
        allowNull: false,
        defaultValue: [],
    })
    cities: string[];

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: true,
    })
    regionalManagerId?: string;

    @BelongsTo(() => User, 'regionalManagerId')
    regionalManager: User;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: true,
    })
    associateRegionalDirectorId?: string;

    @BelongsTo(() => User, 'associateRegionalDirectorId')
    associateRegionalDirector: User;

    @HasMany(() => User, 'chapterId')
    members: User[];
}
