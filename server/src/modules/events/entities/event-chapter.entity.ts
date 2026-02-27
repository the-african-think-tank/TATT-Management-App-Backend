import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Event } from './event.entity';
import { Chapter } from '../../chapters/entities/chapter.entity';

@Table({
    tableName: 'event_chapters',
    timestamps: true,
})
export class EventChapter extends Model<EventChapter> {
    @ForeignKey(() => Event)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    eventId: string;

    @ForeignKey(() => Chapter)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    chapterId: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    address: string;

    @BelongsTo(() => Event)
    event: Event;

    @BelongsTo(() => Chapter)
    chapter: Chapter;
}
