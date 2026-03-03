import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as path from 'path';
import * as fs from 'fs';

import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        cors: false, // we configure CORS explicitly below so one source of truth
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
        rawBody: true,
    });

    const configService = app.get(ConfigService);

    // ── CORS: single source of truth from env ────────────────────────────────────
    // Browsers treat http://localhost and http://127.0.0.1 as different origins.
    // Set CORS_ORIGINS in .env (comma-separated), e.g.:
    //   CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://192.168.1.231:3000
    const corsOriginsRaw = process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://127.0.0.1:3000';
    const allowedOrigins = corsOriginsRaw.split(',').map((o) => o.trim()).filter(Boolean);
    app.enableCors({
        origin: allowedOrigins,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });

    // ── Security Edge Middleware ────────────────────────────────────────────────
    app.use(helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));


    // ── Static file serving for uploaded media ──────────────────────────────────
    const uploadDir = path.resolve(process.env.UPLOAD_DIR ?? './uploads');
    fs.mkdirSync(uploadDir, { recursive: true }); // ensure dir exists on cold start
    app.useStaticAssets(uploadDir, {
        prefix: '/uploads/',
        // Set cache headers: 30 days for uploaded media (they use UUID names — immutable)
        maxAge: '30d',
        etag: true,
    });

    // ── Global validation pipeline ──────────────────────────────────────────────
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // ── Swagger / OpenAPI documentation ─────────────────────────────────────────
    const swaggerConfig = new DocumentBuilder()
        .setTitle('TATT Management Platform API')
        .setDescription(
            `## The African Think Tank — Backend API\n\n` +
            `This is the OpenAPI documentation for the TATT Management App REST API.\n\n` +
            `### Authentication\n` +
            `All protected endpoints require a **Bearer JWT** in the \`Authorization\` header.\n` +
            `Obtain a token from \`POST /auth/signin\` or the OAuth provider flows.\n\n` +
            `### 2FA & Sign-In Flow\n` +
            `The sign-in endpoint returns one of four shapes:\n` +
            `- **Full JWT** — login complete, no 2FA required.\n` +
            `- \`requiresTwoFactor: true\` + \`partialToken\` — complete at \`POST /auth/2fa/complete\`.\n` +
            `- \`requiresTwoFactorSetup: true\` + \`setupToken\` — set up 2FA at \`/security/2fa/...\`.\n` +
            `- \`requiresPasswordRotation: true\` + \`rotationToken\` — rotate at \`POST /auth/password/rotate\`.\n\n` +
            `### File Uploads\n` +
            `Upload files via \`POST /uploads/media\` (multipart/form-data, field: \`files\`). ` +
            `The response includes public URLs — pass them into \`mediaUrls[]\` when creating or editing a post.\n\n` +
            `| Tier | Access |\n` +
            `|---|---|\n` +
            `| \`FREE\` | Browse full feed, create regular posts, locked premium content, no connection requests |\n` +
            `| \`UBUNTU\` | Full feed, connection requests, premium content access/creation |\n` +
            `| \`IMANI\` | All Ubuntu features |\n` +
            `| \`KIONGOZI\` | All features, leadership access |\n\n` +
            `### Real-time Messaging & WebSockets\n` +
            `Platform messaging is handled via a hybrid approach:\n` +
            `- **REST API** for history, conversation lists, and initial message sending.\n` +
            `- **WebSockets (Socket.IO)** for real-time delivery, typing indicators, and status updates.\n\n` +
            `#### WebSocket Connection\n` +
            `- **Namespace**: \`/messages\`\n` +
            `- **Auth**: Pass JWT in \`handshake.auth.token\`.\n\n` +
            `#### Socket Events (Incoming)\n` +
            `- \`new_message\`: Emitted when a partner sends you a message.\n` +
            `- \`typing_status\`: \`{ connectionId, userId, isTyping }\`.\n` +
            `- \`message_status_update\`: \`{ messageId, status: "DELIVERED" | "READ" }\`.\n` +
            `- \`messages_read\`: Bulk delivery of read receipts for a conversation.`,
        )
        .setVersion('2.0')
        .setContact('TATT Platform Team', 'https://tatt.org', 'tech@tatt.org')
        .setLicense('Proprietary', 'https://tatt.org/terms')
        .addServer(process.env.API_BASE_URL || 'http://localhost:3000', 'Active server')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'Authorization',
                description: 'Enter your JWT token (obtained from POST /auth/signin)',
                in: 'header',
            },
            'bearer',
        )
        .addTag('Authentication', 'Sign-in, sign-up, password management, and 2FA completion flow')
        .addTag('Security & Settings', 'Admin 2FA policy management and user self-service 2FA setup')
        .addTag('TATT Feed', 'Community feed — posts, rich text, likes, and comments')
        .addTag('Direct Messaging', 'Private real-time communication between connected members')
        .addTag('Volunteers & Impact', 'Recruitment, role management, volunteer activities, and impact tracking')
        .addTag('Media Uploads', 'File uploads for post attachments and chat messages (images, video, audio, documents)')
        .addTag('Connections', 'Member networking — connection requests, network view, and TATT Connect Recommender')
        .addTag('Chapters', 'TATT regional chapters management')
        .addTag('Knowledge & Resource Hub', 'Educational content, guides, documents, and partnership deals — visibility and access gated by tier and chapter')
        .addTag('Professional Interests', 'Professional interests and skills taxonomy')
        .addTag('Billing & Subscriptions', 'Subscription management, Stripe webhooks, and revenue metrics')
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api-docs', app, document, {
        customSiteTitle: 'TATT API Docs',
        swaggerOptions: {
            docExpansion: 'none',
            defaultModelsExpandDepth: 2,
            displayRequestDuration: true,
            persistAuthorization: true,
            operationsSorter: 'method',
            syntaxHighlight: { activate: true, theme: 'monokai' },
        },
    });

    const port = process.env.PORT || 5000;
    await app.listen(port);
    console.log(`[TATT-Management-App] Core Platform running on port ${port}`);
    console.log(`[TATT-Management-App] Swagger UI  → http://localhost:${port}/api-docs`);
    console.log(`[TATT-Management-App] Upload dir  → ${uploadDir}`);
}

bootstrap();
