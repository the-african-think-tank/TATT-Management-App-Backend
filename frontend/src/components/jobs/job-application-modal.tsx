"use client";

import { useState, useRef } from "react";
import api from "@/services/api";
import { X, Upload, Loader2 } from "lucide-react";
import type { JobListing, ApplyJobPayload } from "@/types/jobs";
import type { User } from "@/context/auth-context";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [".pdf", ".doc", ".docx"];

type JobApplicationModalProps = {
  job: JobListing;
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function JobApplicationModal({
  job,
  user,
  onClose,
  onSuccess,
}: JobApplicationModalProps) {
  const [fullName, setFullName] = useState(
    user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : ""
  );
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);
    if (!file) {
      setResumeFile(null);
      setResumeUrl(null);
      return;
    }
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_TYPES.includes(ext)) {
      setUploadError("Please upload PDF, DOC, or DOCX.");
      setResumeFile(null);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("Maximum file size: 5MB.");
      setResumeFile(null);
      return;
    }
    setResumeFile(file);
    setResumeUrl(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setUploadError(null);
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_TYPES.includes(ext)) {
      setUploadError("Please upload PDF, DOC, or DOCX.");
      setResumeFile(null);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("Maximum file size: 5MB.");
      setResumeFile(null);
      return;
    }
    setResumeFile(file);
    setResumeUrl(null);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || !email.trim()) {
      setError("Full name and email are required.");
      return;
    }
    let finalResumeUrl = resumeUrl;
    if (resumeFile && !resumeUrl) {
      const formData = new FormData();
      formData.append("files", resumeFile);
      try {
        const { data } = await api.post<{ urls: string[] }>("/uploads/media", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        finalResumeUrl = data.urls?.[0] ?? null;
      } catch (err) {
        setError("Failed to upload resume. Try again.");
        return;
      }
    }
    setSubmitting(true);
    try {
      const payload: ApplyJobPayload = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        resumeUrl: finalResumeUrl || undefined,
        coverLetter: coverLetter.trim() || undefined,
      };
      await api.post(`/jobs/${job.id}/apply`, payload);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const res =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
          : undefined;
      setError(res?.data?.message ?? "Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tatt-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="application-modal-title"
    >
      <div
        className="bg-surface rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-surface border-b border-border px-4 sm:px-6 py-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="application-modal-title" className="text-xl font-bold text-foreground">
              Applying for {job.title}
            </h2>
            <p className="text-tatt-gray text-sm mt-0.5">{job.companyName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-background text-tatt-gray hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <h3 className="font-bold text-foreground mb-3">Your Details</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="job-fullname" className="block text-sm font-medium text-foreground mb-1">
                  Full name
                </label>
                <input
                  id="job-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-tatt-gray focus:outline-none focus:ring-2 focus:ring-tatt-lime"
                  required
                />
              </div>
              <div>
                <label htmlFor="job-email" className="block text-sm font-medium text-foreground mb-1">
                  Email address
                </label>
                <input
                  id="job-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-tatt-gray focus:outline-none focus:ring-2 focus:ring-tatt-lime"
                  required
                />
              </div>
              <div>
                <label htmlFor="job-phone" className="block text-sm font-medium text-foreground mb-1">
                  Phone number
                </label>
                <input
                  id="job-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-tatt-gray focus:outline-none focus:ring-2 focus:ring-tatt-lime"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-2">Upload Resume/CV</h3>
            <p className="text-tatt-gray text-sm mb-2">
              Attach your resume or CV here. PDF, DOCX, or DOC format preferred.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-tatt-lime/50 transition-colors"
            >
              <Upload className="h-10 w-10 mx-auto text-tatt-gray mb-2" />
              <p className="text-sm text-foreground">
                Drag and drop your resume here, or{" "}
                <span className="text-tatt-lime font-medium">browse files</span>
              </p>
              <p className="text-xs text-tatt-gray mt-1">Maximum file size: 5MB</p>
              {resumeFile && (
                <p className="text-tatt-lime text-sm mt-2 font-medium">{resumeFile.name}</p>
              )}
              {uploadError && (
                <p className="text-red-600 text-sm mt-2">{uploadError}</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-2">Cover Letter (Optional)</h3>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Write your cover letter here..."
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-tatt-gray focus:outline-none focus:ring-2 focus:ring-tatt-lime resize-none"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-6 py-2.5 rounded-lg font-bold text-foreground bg-tatt-gray/20 hover:bg-tatt-gray/30 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="min-h-[44px] px-6 py-2.5 rounded-lg font-bold bg-tatt-lime text-tatt-black hover:brightness-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
