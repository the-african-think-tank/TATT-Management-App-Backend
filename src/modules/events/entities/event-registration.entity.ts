import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Event } from './event.entity';
import { User } from '../../iam/entities/user.entity';

@Table({
    tableName: 'event_registrations',
    timestamps: true,
})
export class EventRegistration extends Model<EventRegistration> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id: string;

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

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false,
    })
    isBusinessRegistration: boolean;

    @Column({
        type: DataType.DECIMAL(10, 2),
        defaultValue: 0,
    })
    amountPaid: number;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    stripePaymentIntentId?: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: 'PENDING',
    })
    status: string;

    @BelongsTo(() => Event)
    event: Event;

    @BelongsTo(() => User)
    user: User;
}
