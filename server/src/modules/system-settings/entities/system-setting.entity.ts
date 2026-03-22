import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
    tableName: 'system_settings',
    timestamps: true,
})
export class SystemSetting extends Model<SystemSetting> {
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
    key: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: 'GENERAL', // e.g., 'SMTP', 'STRIPE', 'GENERAL'
    })
    category: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    value: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    description?: string;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false,
    })
    isSecret: boolean;
}
