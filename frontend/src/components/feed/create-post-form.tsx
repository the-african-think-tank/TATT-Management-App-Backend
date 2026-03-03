"use client";

import { useState } from "react";
import api from "@/services/api";
import { Send, Loader2 } from "lucide-react";

type CreatePostFormProps = {
    onCreated: () => void;
};

export function CreatePostForm({ onCreated }: CreatePostFormProps) {
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = content.trim();
        if (!trimmed) {
            setError("Write something to post.");
            return;
        }
        setError(null);
        setLoading(true);
        try {
            await api.post("/feed", {
                content: trimmed,
                title: title.trim() || undefined,
                contentFormat: "PLAIN",
            });
            setContent("");
            setTitle("");
            onCreated();
        } catch (err: unknown) {
            const res = err && typeof err === "object" && "response" in err ? (err as { response?: { data?: { message?: string | string[] } } }).response : undefined;
            const msg = res?.data?.message;
            setError(Array.isArray(msg) ? msg[0] : (msg ?? "Failed to create post.") as string);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-surface rounded-xl border border-border p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4">Create a post</h3>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <input
                    type="text"
                    placeholder="Optional title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-tatt-gray text-sm focus:outline-none focus:ring-2 focus:ring-tatt-lime"
                />
                <textarea
                    placeholder="Share an update, resource, or question..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    className="w-full px-3 sm:px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-tatt-gray text-sm focus:outline-none focus:ring-2 focus:ring-tatt-lime resize-y min-h-[100px]"
                />
                {error && (
                    <p className="text-sm font-medium text-foreground">{error}</p>
                )}
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto min-h-[44px] sm:min-h-0 flex items-center justify-center gap-2 px-6 py-2.5 bg-tatt-lime text-tatt-black font-bold rounded-lg text-sm hover:brightness-95 transition-all disabled:opacity-60 touch-manipulation"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                        Post
                    </button>
                </div>
            </form>
        </div>
    );
}
