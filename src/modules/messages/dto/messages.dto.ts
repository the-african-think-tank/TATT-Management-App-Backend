import { IsString, IsOptional, IsArray, IsUrl, ArrayMaxSize, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, Min, Max } from 'class-validator';

// ─── Send a message ───────────────────────────────────────────────────────────

export class SendMessageDto {
    @ApiPropertyOptional({
        description: 'Text content of the message. Required if no mediaUrls are provided.',
        example: 'Looking forward to discussing the Pan-African Investment Forum!',
    })
    @IsOptional()
    @IsString()
    content?: string;

    @ApiPropertyOptional({
        type: [String],
        description:
            'File attachment URLs. Obtain these from `POST /uploads/media` first, ' +
            'then pass the returned URLs here. Up to 10 attachments per message.',
        example: ['https://api.tatt.org/uploads/documents/2026/02/22/a1b2c3d4.pdf'],
    })
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(10)
    @IsString({ each: true })
    mediaUrls?: string[];

    @ApiPropertyOptional({
        description:
            'Client-generated UUID for this message. ' +
            'If you send the same `clientMessageId` twice (e.g. on retry after a network failure), ' +
            'the server returns the already-stored message instead of creating a duplicate. ' +
            'Omit if not implementing a message queue.',
        example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        format: 'uuid',
    })
    @IsOptional()
    @IsUUID()
    clientMessageId?: string;
}

// ─── Mark as read / unread ────────────────────────────────────────────────────

export class MarkReadDto {
    @ApiProperty({
        type: [String],
        description: 'UUIDs of messages to mark as read.',
        example: ['msg-uuid-1', 'msg-uuid-2'],
    })
    @IsArray()
    @IsUUID('all', { each: true })
    messageIds: string[];
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export class MessageHistoryQueryDto {
    @ApiPropertyOptional({ description: 'Page number (1-based)', example: 1, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Messages per page (1–100)', example: 30, minimum: 1, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 30;
}

// ─── Swagger response schemas ─────────────────────────────────────────────────

export class ChatPartnerProfileSchema {
    @ApiProperty({ example: 'b2c9f1a0-...', format: 'uuid' })
    id: string;

    @ApiProperty({ example: 'Jane' })
    firstName: string;

    @ApiProperty({ example: 'Doe' })
    lastName: string;

    @ApiProperty({ example: 'https://cdn.tatt.org/avatars/jane.jpg', nullable: true })
    profilePicture: string | null;

    @ApiProperty({ example: 'Senior Strategy Consultant', nullable: true })
    professionTitle: string | null;

    @ApiProperty({ example: 'AfriGrowth Capital', nullable: true, description: 'Place of work / company.' })
    companyName: string | null;

    @ApiProperty({ example: 'UBUNTU', enum: ['FREE', 'UBUNTU', 'IMANI', 'KIONGOZI'], description: 'Membership tier.' })
    communityTier: string;

    @ApiProperty({ example: 'TATT-NBO-0042' })
    tattMemberId: string;

    @ApiProperty({
        nullable: true,
        description: 'Chapter the partner belongs to.',
        example: { id: 'chap-uuid', name: 'Nairobi Chapter', code: 'NBO' },
    })
    chapter: { id: string; name: string; code: string } | null;
}

export class DirectMessageSchema {
    @ApiProperty({ example: 'msg-uuid-1', format: 'uuid' })
    id: string;

    @ApiProperty({ example: 'conn-uuid-1', format: 'uuid' })
    connectionId: string;

    @ApiProperty({ example: 'sender-uuid', format: 'uuid' })
    senderId: string;

    @ApiProperty({ example: 'receiver-uuid', format: 'uuid' })
    receiverId: string;

    @ApiProperty({ nullable: true, example: 'Looking forward to connecting!' })
    content: string | null;

    @ApiProperty({ type: [String], example: ['https://api.tatt.org/uploads/documents/.../report.pdf'] })
    mediaUrls: string[];

    @ApiProperty({ enum: ['SENT', 'DELIVERED', 'READ'], example: 'DELIVERED' })
    status: string;

    @ApiProperty({ nullable: true, example: '2026-02-22T19:10:00.000Z', format: 'date-time' })
    deliveredAt: string | null;

    @ApiProperty({ nullable: true, example: '2026-02-22T19:12:00.000Z', format: 'date-time' })
    readAt: string | null;

    @ApiProperty({ example: false, description: 'True when the recipient manually marked this message as unread.' })
    isManuallyUnread: boolean;

    @ApiProperty({ example: '2026-02-22T19:09:00.000Z', format: 'date-time' })
    createdAt: string;
}

export class ConversationListItemSchema {
    @ApiProperty({ example: 'conn-uuid-1', format: 'uuid', description: 'The connection ID doubles as the conversation ID.' })
    connectionId: string;

    @ApiProperty({ type: () => ChatPartnerProfileSchema })
    partner: ChatPartnerProfileSchema;

    @ApiProperty({ type: () => DirectMessageSchema, nullable: true, description: 'Most recent message, or null if none yet.' })
    lastMessage: DirectMessageSchema | null;

    @ApiProperty({ example: 3, description: 'Number of unread messages from the partner.' })
    unreadCount: number;

    @ApiProperty({ example: '2026-02-22T19:09:00.000Z', format: 'date-time' })
    lastActivityAt: string;
}

export class MessageHistoryResponseSchema {
    @ApiProperty({ type: [DirectMessageSchema] })
    data: DirectMessageSchema[];

    @ApiProperty({ example: { total: 142, page: 1, limit: 30, totalPages: 5 } })
    meta: { total: number; page: number; limit: number; totalPages: number };
}

// ─── WebSocket event payload shapes (for documentation purposes) ──────────────

export class WsTypingPayloadSchema {
    @ApiProperty({ example: 'conn-uuid-1', description: 'Which conversation this typing event belongs to.' })
    connectionId: string;
}

export class WsReadReceiptPayloadSchema {
    @ApiProperty({ type: [String], example: ['msg-uuid-1', 'msg-uuid-2'] })
    messageIds: string[];

    @ApiProperty({ example: 'conn-uuid-1' })
    connectionId: string;
}
