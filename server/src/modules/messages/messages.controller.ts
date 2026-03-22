import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
    ParseUUIDPipe,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiResponse,
    ApiParam,
    ApiBody,
    ApiExtraModels,
} from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { JwtAuthGuard } from '../iam/auth/guards/jwt-auth.guard';
import {
    SendMessageDto,
    MessageHistoryQueryDto,
    MarkReadDto,
    ConversationListItemSchema,
    MessageHistoryResponseSchema,
    DirectMessageSchema,
    ChatPartnerProfileSchema,
} from './dto/messages.dto';

@ApiTags('Direct Messaging')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiExtraModels(
    SendMessageDto,
    MarkReadDto,
    MessageHistoryQueryDto,
    ConversationListItemSchema,
    MessageHistoryResponseSchema,
    DirectMessageSchema,
    ChatPartnerProfileSchema,
)
@Controller('messages')
export class MessagesController {
    constructor(
        private readonly messagesService: MessagesService,
        private readonly messagesGateway: MessagesGateway,
    ) { }

    @ApiOperation({
        summary: 'Get conversation list',
        description: 'Returns all active conversations for the authenticated user with unread counts and last message.',
    })
    @ApiResponse({
        status: 200,
        description: 'List of conversations.',
        type: [ConversationListItemSchema],
    })
    @Get('conversations')
    async getConversations(@Request() req) {
        return this.messagesService.getConversations(req.user.id);
    }

    @ApiOperation({ summary: 'Get total unread messages count' })
    @ApiResponse({ status: 200, schema: { properties: { count: { type: 'number' } } } })
    @Get('unread-count')
    async getUnreadCount(@Request() req) {
        const count = await this.messagesService.getUnreadCount(req.user.id);
        return { count };
    }

    @ApiOperation({
        summary: 'Get message history for a conversation',
        description: 'Returns paginated message history for a specific connection.',
    })
    @ApiParam({ name: 'connectionId', format: 'uuid' })
    @ApiResponse({
        status: 200,
        description: 'Paginated message history.',
        type: MessageHistoryResponseSchema,
    })
    @Get('history/:connectionId')
    async getHistory(
        @Request() req,
        @Param('connectionId', ParseUUIDPipe) connectionId: string,
        @Query() query: MessageHistoryQueryDto,
    ) {
        return this.messagesService.getHistory(req.user.id, connectionId, query);
    }

    @ApiOperation({
        summary: 'Send a new message',
        description:
            'Sends a private message (text and/or files) to a connected member.\n\n' +
            '### Pre-requisites\n' +
            '1. Both users must have an **ACCEPTED** connection status.\n' +
            '2. If sending files, upload them first via `POST /uploads/media` to get public URLs.\n\n' +
            '### Reliable Messaging (Queue/Resend)\n' +
            'Provide a `clientMessageId` (UUID) to enable client-side retries without duplicates. ' +
            'If the server receives the same `clientMessageId` twice, it will return the existing message instead of creating a new one.',
    })
    @ApiParam({ name: 'connectionId', format: 'uuid', description: 'ID of the connection (conversation)' })
    @ApiBody({ type: SendMessageDto })
    @ApiResponse({
        status: 201,
        description: 'Message sent and broadcast via WebSocket.',
        type: DirectMessageSchema,
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden — users are not connected or connection is pending.',
        schema: { properties: { statusCode: { type: 'integer', example: 403 }, message: { type: 'string', example: 'Messaging is only available between members who have accepted each other\'s connection request.' } } },
    })
    @ApiResponse({ status: 401, description: 'Missing or invalid Bearer token.' })
    @Post(':connectionId')
    @HttpCode(HttpStatus.CREATED)
    async sendMessage(
        @Request() req,
        @Param('connectionId', ParseUUIDPipe) connectionId: string,
        @Body() dto: SendMessageDto,
    ) {
        const message = await this.messagesService.sendMessage(req.user, connectionId, dto);

        // Broadcast in real-time via WebSocket
        await this.messagesGateway.broadcastNewMessage(message);

        return message;
    }

    @ApiOperation({
        summary: 'Mark messages as read',
        description: 'Marks a batch of received messages as read and informs the sender via WebSocket.',
    })
    @ApiParam({ name: 'connectionId', format: 'uuid' })
    @ApiResponse({
        status: 200,
        description: 'Messages marked as read.',
    })
    @Patch('read/:connectionId')
    @HttpCode(HttpStatus.OK)
    async markRead(
        @Request() req,
        @Param('connectionId', ParseUUIDPipe) connectionId: string,
        @Body() dto: MarkReadDto,
    ) {
        const messageIds = await this.messagesService.markRead(req.user.id, connectionId, dto.messageIds);

        // Find the sender of these messages to notify them
        const history = await this.messagesService.getHistory(req.user.id, connectionId, { limit: 1 });
        if (history.data.length > 0) {
            const partnerId = history.data[0].senderId === req.user.id ? history.data[0].receiverId : history.data[0].senderId;
            this.messagesGateway.broadcastReadReceipt(connectionId, partnerId, messageIds);
        }

        return { message: 'Messages marked as read' };
    }

    @ApiOperation({
        summary: 'Mark a message as unread',
        description: 'Manually marks a specific received message as unread.',
    })
    @ApiParam({ name: 'messageId', format: 'uuid' })
    @ApiResponse({ status: 200, description: 'Message marked as unread.' })
    @Patch('unread/:messageId')
    @HttpCode(HttpStatus.OK)
    async markUnread(
        @Request() req,
        @Param('messageId', ParseUUIDPipe) messageId: string,
    ) {
        await this.messagesService.markUnread(req.user.id, messageId);
        return { message: 'Message marked as unread' };
    }

    @ApiOperation({
        summary: 'Delete a message',
        description: 'Soft-deletes a message sent by the user.',
    })
    @ApiParam({ name: 'messageId', format: 'uuid' })
    @ApiResponse({ status: 200, description: 'Message deleted.' })
    @Delete(':messageId')
    @HttpCode(HttpStatus.OK)
    async deleteMessage(
        @Request() req,
        @Param('messageId', ParseUUIDPipe) messageId: string,
    ) {
        await this.messagesService.deleteMessage(req.user.id, messageId);
        return { message: 'Message deleted' };
    }

    @ApiOperation({
        summary: 'Get chat partner profile',
        description: 'Returns the detailed profile of the member you are chatting with.',
    })
    @ApiParam({ name: 'connectionId', format: 'uuid' })
    @ApiResponse({
        status: 200,
        description: 'Partner profile details.',
        type: ChatPartnerProfileSchema,
    })
    @Get('partner/:connectionId')
    async getPartnerProfile(
        @Request() req,
        @Param('connectionId', ParseUUIDPipe) connectionId: string,
    ) {
        return this.messagesService.getPartnerProfile(req.user.id, connectionId);
    }

    @ApiOperation({
        summary: 'Admin initiate conversation without connection',
    })
    @Post('admin/initiate/:targetUserId')
    @HttpCode(HttpStatus.OK)
    async initiateAdminMessage(
        @Request() req,
        @Param('targetUserId', ParseUUIDPipe) targetUserId: string,
    ) {
        return this.messagesService.initiateAdminConversation(req.user, targetUserId);
    }
}
