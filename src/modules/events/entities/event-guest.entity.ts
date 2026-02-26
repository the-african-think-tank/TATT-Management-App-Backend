import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { Event } from './event.entity';
import { User } from '../../iam/entities/user.entity';

@Table({
    tableName: 'event_guests',
    timestamps: false,
})
export class EventGuest extends Model<EventGuest> {
    @ForeignKey(() => Event)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    eventId: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    userId: string;
}
