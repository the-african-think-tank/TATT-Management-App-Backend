import {
    Table, Column, Model, DataType, Default,
    ForeignKey, BelongsTo, Index,
} from 'sequelize-typescript';
import { User } from '../../iam/entities/user.entity';
import { Connection } from '../../connections/entities/connection.entity';

export enum MessageStatus {
    /** Saved on server, not yet seen by recipient's socket */
    SENT = 'SENT',
    /** Recipient's WebSocket connection received the message in real-time */
    DELIVERED = 'DELIVERED',
    /** Recipient opened the conversation and the message was visible */
    READ = 'READ',
}

@Table({
    tableName: 'direct_messages',
    timestamps: true,
    paranoid: true,     // Soft delete — preserves thread integrity
})
export class DirectMessage extends Model<DirectMessage> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id: string;

    // ─── Conversation scoping ─────────────────────────────────────────────────
    /**
     * Messages live under an accepted Connection.
     * The connectionId doubles as the "conversation ID" the frontend uses.
     */
    @ForeignKey(() => Connection)
    @Index
    @Column({ type: DataType.UUID, allowNull: false })
    connectionId: string;

    @BelongsTo(() => Connection, 'connectionId')
    connection: Connection;

    // ─── Participants ─────────────────────────────────────────────────────────
    @ForeignKey(() => User)
    @Column({ type: DataType.UUID, allowNull: false })
    senderId: string;

    @BelongsTo(() => User, 'senderId')
    sender: User;

    @ForeignKey(() => User)
    @Column({ type: DataType.UUID, allowNull: false })
    receiverId: string;

    @BelongsTo(() => User, 'receiverId')
    receiver: User;

    // ─── Content ─────────────────────────────────────────────────────────────
    /** Plain text body. Nullable only when the message is attachment-only. */
    @Column({ type: DataType.TEXT, allowNull: true })
    content?: string;

    /**
     * File attachment URLs (same URL format returned by POST /uploads/media).
     * Each item is a public URL to an uploaded file.
     */
    @Column({ type: DataType.ARRAY(DataType.TEXT), defaultValue: [] })
    mediaUrls: string[];

    // ─── Status & receipts ────────────────────────────────────────────────────
    @Default(MessageStatus.SENT)
    @Column({
        type: DataType.ENUM(...Object.values(MessageStatus)),
        allowNull: false,
    })
    status: MessageStatus;

    /** When the message was delivered to the recipient's socket */
    @Column({ type: DataType.DATE, allowNull: true })
    deliveredAt?: Date;

    /** When the recipient marked the message as read */
    @Column({ type: DataType.DATE, allowNull: true })
    readAt?: Date;

    /**
     * Manually marked as unread by the recipient even after being READ.
     * This is the "mark as unread" feature — UI shows an unread badge again.
     */
    @Default(false)
    @Column(DataType.BOOLEAN)
    isManuallyUnread: boolean;

    // ─── Queue / resend deduplication ─────────────────────────────────────────
    /**
     * Optional client-generated UUID. If the same (senderId + clientMessageId)
     * pair already exists in the DB, the existing message is returned instead
     * of creating a duplicate — enabling safe retry/resend from the frontend queue.
     */
    @Column({ type: DataType.STRING, allowNull: true })
    clientMessageId?: string;
}
