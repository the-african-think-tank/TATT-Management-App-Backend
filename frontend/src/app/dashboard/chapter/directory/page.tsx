"use client";

import { useAuth } from "@/context/auth-context";
import api from "@/services/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft, Users } from "lucide-react";
import type { ChapterDetail, ChapterMembersResponse } from "@/types/chapter";

export default function ChapterDirectoryPage() {
  const { user } = useAuth();
  const [chapter, setChapter] = useState<ChapterDetail | null>(null);
  const [membersRes, setMembersRes] = useState<ChapterMembersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user?.id || !user.chapterId) {
      setLoading(false);
      setError("You are not assigned to a chapter.");
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [chapterRes, membersResData] = await Promise.all([
          api.get<ChapterDetail>(`/chapters/${user.chapterId}`),
          api.get<ChapterMembersResponse>(`/chapters/${user.chapterId}/members`),
        ]);
        setChapter(chapterRes.data);
        setMembersRes(membersResData.data);
      } catch (err: unknown) {
        const res =
          err && typeof err === "object" && "response" in err
            ? (err as { response?: { data?: { message?: string } } }).response
            : undefined;
        setError(res?.data?.message ?? "Failed to load directory.");
        setChapter(null);
        setMembersRes(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id, user?.chapterId]);

  const filteredMembers = membersRes?.members.filter((m) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    const name = `${m.firstName} ${m.lastName}`.toLowerCase();
    const title = (m.professionTitle ?? "").toLowerCase();
    return name.includes(q) || title.includes(q);
  }) ?? [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-tatt-lime" />
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <p className="text-foreground font-medium mb-4">{error ?? "Chapter not found"}</p>
          <Link href="/dashboard/chapter" className="text-tatt-lime hover:underline inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to My Chapter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="border-b border-border bg-surface px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-[1920px] mx-auto">
          <Link href="/dashboard/chapter" className="inline-flex items-center gap-2 text-tatt-gray hover:text-tatt-lime text-sm font-medium mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to My Chapter
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Chapter Directory</h1>
          <p className="text-tatt-gray text-sm mt-0.5">{chapter.name} — {membersRes?.total ?? 0} members</p>
        </div>
      </div>
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <input
            type="search"
            placeholder="Search by name or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2.5 rounded-lg border border-border bg-surface text-foreground placeholder:text-tatt-gray focus:outline-none focus:ring-2 focus:ring-tatt-lime"
          />
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <li key={member.id} className="bg-surface rounded-xl border border-border p-4 flex items-center gap-4">
              <div className="size-12 rounded-full bg-tatt-gray/20 flex items-center justify-center overflow-hidden shrink-0">
                {member.profilePicture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.profilePicture} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Users className="h-6 w-6 text-tatt-gray" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-foreground truncate">{member.firstName} {member.lastName}</p>
                <p className="text-tatt-gray text-sm truncate">{member.professionTitle ?? "Member"}</p>
              </div>
            </li>
          ))}
        </ul>
        {filteredMembers.length === 0 && (
          <p className="text-tatt-gray text-center py-8">No members match your search.</p>
        )}
      </div>
    </div>
  );
}
