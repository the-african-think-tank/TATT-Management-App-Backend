import { Table, Column, Model, DataType, Default } from 'sequelize-typescript';

@Table({
    tableName: 'feed_prompts',
    timestamps: true,
})
export class FeedPrompt extends Model<FeedPrompt> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id: string;

    @Column({ type: DataType.TEXT, allowNull: false })
    prompt: string;

    @Default(0)
    @Column(DataType.INTEGER)
    messageCount: number;

    @Default(0)
    @Column(DataType.INTEGER)
    zapCount: number;

    @Default(false)
    @Column(DataType.BOOLEAN)
    isActive: boolean;
}
