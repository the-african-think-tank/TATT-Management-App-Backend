import { Table, Column, Model, DataType, Default } from 'sequelize-typescript';

@Table({
    tableName: 'feed_insights',
    timestamps: true,
})
export class FeedInsight extends Model<FeedInsight> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id: string;

    @Column({ type: DataType.STRING, allowNull: false })
    title: string;

    @Column({ type: DataType.TEXT, allowNull: false })
    content: string;

    @Column({ type: DataType.DATE, allowNull: true })
    startDate?: Date;

    @Column({ type: DataType.DATE, allowNull: true })
    endDate?: Date;

    @Default(true)
    @Column(DataType.BOOLEAN)
    isActive: boolean;
}
