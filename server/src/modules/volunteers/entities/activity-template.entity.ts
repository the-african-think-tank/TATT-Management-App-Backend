import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Chapter } from '../../chapters/entities/chapter.entity';

@Table({
    tableName: 'volunteer_activity_templates',
    timestamps: true,
})
export class ActivityTemplate extends Model<ActivityTemplate> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    title: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    description: string;

    @ForeignKey(() => Chapter)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    chapterId: string;

    @BelongsTo(() => Chapter)
    chapter: Chapter;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 1,
    })
    estimatedHours: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 20,
    })
    impactPoints: number;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: true,
    })
    isActive: boolean;
}
