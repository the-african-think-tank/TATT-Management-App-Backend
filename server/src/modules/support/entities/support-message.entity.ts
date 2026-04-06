import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { SupportTicket } from './support-ticket.entity';
import { User } from '../../iam/entities/user.entity';

@Table({ tableName: 'support_messages' })
export class SupportMessage extends Model<SupportMessage> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id: string;

    @ForeignKey(() => SupportTicket)
    @Column({ type: DataType.UUID, allowNull: false })
    ticketId: string;

    @BelongsTo(() => SupportTicket)
    ticket: SupportTicket;

    @ForeignKey(() => User)
    @Column({ type: DataType.UUID, allowNull: false })
    senderId: string;

    @BelongsTo(() => User)
    sender: User;

    @Column({ type: DataType.TEXT, allowNull: false })
    message: string;

    @Column({ type: DataType.JSONB, allowNull: true })
    attachments: string[];

    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    isAdminResponse: boolean;
}
