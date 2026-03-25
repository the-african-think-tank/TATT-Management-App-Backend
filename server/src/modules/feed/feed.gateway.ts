import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

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
    namespace: 'feed',
})
export class FeedGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(FeedGateway.name);

    constructor(private readonly jwtService: JwtService) { }

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
            if (!token) {
                this.logger.warn(`No token for feed socket ${client.id}`);
                // For public feed, we might allow unauthenticated connections to listen
                // but let's keep it simple: if token exists, we join them to chapter rooms.
                return;
            }

            const payload = await this.jwtService.verifyAsync(token);
            const chapterId = payload.chapterId;

            if (chapterId) {
                client.join(`chapter:${chapterId}`);
                this.logger.log(`Socket ${client.id} joined chapter room: ${chapterId}`);
            }
            
            // Everyone joins the global room
            client.join('global');
        } catch (e) {
            this.logger.error(`Feed connection auth failed: ${e.message}`);
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Socket ${client.id} disconnected from feed`);
    }

    /**
     * Notify users of a new post
     */
    broadcastNewPost(post: any) {
        const payload = {
            id: post.id,
            title: post.title,
            authorName: `${post.author?.firstName} ${post.author?.lastName}`,
            chapterId: post.chapterId,
            type: post.type,
            createdAt: post.createdAt,
        };

        if (post.chapterId) {
            // Emit to specific chapter and global
            this.server.to(`chapter:${post.chapterId}`).emit('new_post', payload);
            this.server.to('global').emit('new_post', payload);
        } else {
            // Global only
            this.server.to('global').emit('new_post', payload);
        }
    }

    /**
     * Notify users of a new comment
     */
    broadcastNewComment(postId: string, comment: any) {
        this.server.to('global').emit('new_comment', {
            postId,
            commentId: comment.id,
            authorName: `${comment.author?.firstName} ${comment.author?.lastName}`,
        });
    }
}
