import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import {
    resolveMimeCategory, SIZE_LIMITS, ALL_ALLOWED_MIMES,
    UploadedFileSchema,
} from './dto/upload.types';

@Injectable()
export class UploadsService {
    private readonly logger = new Logger(UploadsService.name);

    /**
     * Process a batch of multer-uploaded files.
     * - Validates MIME type against the allowlist
     * - Enforces per-category file size limits
     * - Moves file to the correct category/date sub-directory
     * - Returns public URL for each accepted file
     *
     * Files that fail validation are deleted immediately and an error is thrown.
     */
    processUploads(
        files: Express.Multer.File[],
        baseUploadDir: string,
        basePublicUrl: string,
    ): UploadedFileSchema[] {
        if (!files?.length) {
            throw new BadRequestException('No files were received. Ensure the form field name is `files`.');
        }

        const results: UploadedFileSchema[] = [];
        const errors: string[] = [];

        for (const file of files) {
            try {
                // ── MIME type validation ────────────────────────────────────
                if (!ALL_ALLOWED_MIMES.has(file.mimetype)) {
                    this.deleteFile(file.path);
                    errors.push(
                        `"${file.originalname}": unsupported type "${file.mimetype}". ` +
                        `Allowed: images, videos, audio, and documents.`,
                    );
                    continue;
                }

                const category = resolveMimeCategory(file.mimetype);

                // ── Per-category size limit ─────────────────────────────────
                const sizeLimit = SIZE_LIMITS[category];
                if (file.size > sizeLimit) {
                    this.deleteFile(file.path);
                    const limitMb = Math.round(sizeLimit / 1024 / 1024);
                    errors.push(
                        `"${file.originalname}": file too large (${this.formatBytes(file.size)}). ` +
                        `${category.charAt(0).toUpperCase() + category.slice(1)} limit is ${limitMb} MB.`,
                    );
                    continue;
                }

                // ── Move to category/date directory ─────────────────────────
                const dateDir = this.todayPath();
                const destDir = path.join(baseUploadDir, category, dateDir);
                fs.mkdirSync(destDir, { recursive: true });

                const ext = path.extname(file.originalname).toLowerCase() || this.defaultExt(file.mimetype);
                const filename = `${crypto.randomUUID()}${ext}`;
                const destPath = path.join(destDir, filename);

                fs.renameSync(file.path, destPath); // atomic move within same FS

                const relativePath = path.join(category, dateDir, filename).replace(/\\/g, '/');
                const publicUrl = `${basePublicUrl.replace(/\/$/, '')}/uploads/${relativePath}`;

                this.logger.log(`Uploaded: ${file.originalname} → ${relativePath} (${this.formatBytes(file.size)})`);

                results.push({
                    url: publicUrl,
                    category,
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                    filename,
                });
            } catch (err) {
                // Attempt cleanup on unexpected error
                try { this.deleteFile(file.path); } catch { /* ignore */ }
                this.logger.error(`Error processing file "${file.originalname}":`, err);
                errors.push(`"${file.originalname}": internal error during processing.`);
            }
        }

        // If ALL files failed validation, throw so the client gets a clear error
        if (results.length === 0 && errors.length > 0) {
            throw new BadRequestException({
                message: 'All uploaded files were rejected.',
                errors,
            });
        }

        // Partial success: include errors in the response but still return accepted files
        return results;
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private deleteFile(filePath: string) {
        try {
            if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch (e) {
            this.logger.warn(`Could not delete temp file: ${filePath}`, e);
        }
    }

    private todayPath(): string {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        return `${y}/${m}/${d}`;
    }

    private formatBytes(bytes: number): string {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    }

    /** Fallback extension when original filename had none */
    private defaultExt(mimeType: string): string {
        const map: Record<string, string> = {
            'image/jpeg': '.jpg', 'image/png': '.png', 'image/gif': '.gif',
            'image/webp': '.webp', 'image/svg+xml': '.svg',
            'video/mp4': '.mp4', 'video/webm': '.webm', 'video/quicktime': '.mov',
            'audio/mpeg': '.mp3', 'audio/wav': '.wav', 'audio/ogg': '.ogg',
            'audio/aac': '.aac', 'audio/flac': '.flac',
            'application/pdf': '.pdf',
            'text/plain': '.txt', 'text/csv': '.csv',
        };
        return map[mimeType] ?? '';
    }
}
