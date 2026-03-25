import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from './messages.service';
import { MessageStatus } from './entities/direct-message.entity';

// Use same CORS origins as REST (main.ts) so WebSocket upgrade is not blocked
@WebSocketGateway({
    cors: { 
        origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
            const origins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://127.0.0.1:3000')
                .split(',')
                .map((o) => o.trim())
                .filter(Boolean);
            if (!origin || origins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true
    },
    namespace: 'messages',
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(MessagesGateway.name);

    /** Map to track connected users and their socket IDs */
    private connectedUsers = new Map<string, string>();

    constructor(
        private readonly messagesService: MessagesService,
        private readonly jwtService: JwtService,
    ) { }

    /**
     * Authenticate Socket connection using JWT
     */
    async handleConnection(client: Socket) {
        this.logger.log(`Incoming connection attempt: socket ${client.id}`);
        try {
            const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
            if (!token) {
                this.logger.warn(`No token provided for socket ${client.id}. Handshake auth: ${JSON.stringify(client.handshake.auth)}`);
                client.disconnect();
                return;
            }

            this.logger.log(`Authenticating socket ${client.id} with token...`);
            const payload = await this.jwtService.verifyAsync(token);
            const userId = payload.sub;

            if (!userId) {
                this.logger.error(`Token verified but no sub/userId found in payload: ${JSON.stringify(payload)}`);
                client.disconnect();
                return;
            }

            this.connectedUsers.set(userId, client.id);
            client.data.userId = userId;

            this.logger.log(`User ${userId} successfully authenticated for socket ${client.id}`);
        } catch (error) {
            this.logger.error(`Authentication failed for socket ${client.id}: ${error.message}`);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const userId = client.data.userId;
        if (userId) {
            this.connectedUsers.delete(userId);
            this.logger.log(`User ${userId} disconnected`);
        }
    }

    /**
     * Join a specific conversation room
     */
    @SubscribeMessage('join_conversation')
    async handleJoinConversation(
        @ConnectedSocket() client: Socket,
        @MessageBody('connectionId') connectionId: string,
    ) {
        const userId = client.data.userId;
        try {
            await this.messagesService.assertConnectedParticipant(userId, connectionId);
            client.join(connectionId);
            this.logger.log(`User ${userId} joined room ${connectionId}`);
        } catch (error) {
            client.emit('error', { message: error.message });
        }
    }

    /**
     * Leave a specific conversation room
     */
    @SubscribeMessage('leave_conversation')
    handleLeaveConversation(
        @ConnectedSocket() client: Socket,
        @MessageBody('connectionId') connectionId: string,
    ) {
        client.leave(connectionId);
        this.logger.log(`User ${client.data.userId} left room ${connectionId}`);
    }

    /**
     * Sends typing status to the partner
     */
    @SubscribeMessage('typing')
    async handleTyping(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { connectionId: string; isTyping: boolean },
    ) {
        const userId = client.data.userId;
        client.to(data.connectionId).emit('typing_status', {
            connectionId: data.connectionId,
            userId,
            isTyping: data.isTyping,
        });
    }

    /**
     * Bridge method to emit new message to recipient in real-time
     */
    async broadcastNewMessage(message: any) {
        const receiverSocketId = this.connectedUsers.get(message.receiverId);

        // If receiver is online, emit to their individual socket
        if (receiverSocketId) {
            this.server.to(receiverSocketId).emit('new_message', message);

            // Auto mark as delivered if socket received it
            await this.messagesService.markDelivered([message.id]);

            // Notify sender that message was delivered
            const senderSocketId = this.connectedUsers.get(message.senderId);
            if (senderSocketId) {
                this.server.to(senderSocketId).emit('message_status_update', {
                    messageId: message.id,
                    status: MessageStatus.DELIVERED,
                    deliveredAt: new Date(),
                });
            }
        }
    }

    /**
     * Bridge method to emit read receipts
     */
    broadcastReadReceipt(connectionId: string, recipientId: string, messageIds: string[]) {
        const socketId = this.connectedUsers.get(recipientId);
        if (socketId) {
            this.server.to(socketId).emit('messages_read', {
                connectionId,
                messageIds,
                readAt: new Date(),
            });
        }
    }
}
