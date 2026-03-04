"use client";

import { useState } from "react";
import api from "@/services/api";
import { Loader2, CheckCircle2 } from "lucide-react";
import type { ApplyVolunteerPayload } from "@/types/volunteers";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

type VolunteerApplyFormProps = {
  roleId?: string;
  onSuccess?: () => void;
  compact?: boolean;
};

export function VolunteerApplyForm({
  roleId,
  onSuccess,
  compact = false,
}: VolunteerApplyFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [interestsAndSkills, setInterestsAndSkills] = useState("");
  const [hoursAvailablePerWeek, setHoursAvailablePerWeek] = useState(5);
  const [reasonForApplying, setReasonForApplying] = useState("");
  const [questionsForAdmin, setQuestionsForAdmin] = useState("");
  const [weeklyAvailability, setWeeklyAvailability] = useState<
    Record<string, string[]>
  >(
    DAYS.reduce(
      (acc, d) => ({ ...acc, [d]: [] }),
      {} as Record<string, string[]>
    )
  );

  const addSlot = (day: string) => {
    setWeeklyAvailability((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), "09:00-12:00"],
    }));
  };

  const removeSlot = (day: string, idx: number) => {
    setWeeklyAvailability((prev) => ({
      ...prev,
      [day]: (prev[day] || []).filter((_, i) => i !== idx),
    }));
  };

  const updateSlot = (day: string, idx: number, value: string) => {
    setWeeklyAvailability((prev) => ({
      ...prev,
      [day]: (prev[day] || []).map((v, i) => (i === idx ? value : v)),
    }));
  };

  const hasAnyAvailability = Object.values(weeklyAvailability).some(
    (arr) => arr.length > 0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAnyAvailability) {
      setError("Please add at least one availability slot.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload: ApplyVolunteerPayload = {
        roleId: roleId || undefined,
        interestsAndSkills: interestsAndSkills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        weeklyAvailability,
        hoursAvailablePerWeek,
        reasonForApplying,
        questionsForAdmin: questionsForAdmin.trim() || undefined,
      };
      await api.post("/volunteers/apply", payload);
      setSuccess(true);
      onSuccess?.();
    } catch (err: unknown) {
      const res =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
          : undefined;
      setError(res?.data?.message || "Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 sm:p-8 rounded-xl bg-tatt-lime/10 border border-tatt-lime/30 text-center">
        <CheckCircle2 className="h-12 w-12 mx-auto text-tatt-lime mb-4" />
        <h3 className="text-lg font-bold text-foreground mb-2">
          Application submitted
        </h3>
        <p className="text-tatt-gray text-sm">
          Thank you! We&apos;ll review your application and get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Interests & skills (comma-separated)
        </label>
        <input
          type="text"
          value={interestsAndSkills}
          onChange={(e) => setInterestsAndSkills(e.target.value)}
          placeholder="e.g. Project Management, Public Speaking"
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-tatt-lime"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Hours available per week
        </label>
        <input
          type="number"
          min={1}
          max={40}
          value={hoursAvailablePerWeek}
          onChange={(e) =>
            setHoursAvailablePerWeek(parseInt(e.target.value, 10) || 1)
          }
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-tatt-lime"
          required
        />
      </div>

      {!compact && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Weekly availability
          </label>
          <p className="text-xs text-tatt-gray mb-2">
            Add time slots (e.g. 09:00-12:00)
          </p>
          <div className="space-y-2">
            {DAYS.map((day) => (
              <div key={day} className="flex items-center gap-2 flex-wrap">
                <span className="text-sm capitalize w-20 text-tatt-gray">
                  {day}
                </span>
                <div className="flex flex-wrap gap-2">
                  {(weeklyAvailability[day] || []).map((slot, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 bg-background rounded border border-border px-2 py-1"
                    >
                      <input
                        type="text"
                        value={slot}
                        onChange={(e) => updateSlot(day, idx, e.target.value)}
                        placeholder="09:00-12:00"
                        className="w-24 text-sm bg-transparent focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeSlot(day, idx)}
                        className="text-tatt-gray hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addSlot(day)}
                    className="text-sm text-tatt-lime hover:underline"
                  >
                    + Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {compact && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Weekly availability (add at least one slot)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DAYS.map((day) => (
              <div key={day} className="flex items-center gap-2">
                <span className="text-sm capitalize w-16 text-tatt-gray shrink-0">
                  {day.slice(0, 3)}
                </span>
                <div className="flex flex-wrap gap-1 flex-1">
                  {(weeklyAvailability[day] || []).map((slot, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-0.5 bg-background rounded border border-border px-1.5 py-0.5"
                    >
                      <input
                        type="text"
                        value={slot}
                        onChange={(e) => updateSlot(day, idx, e.target.value)}
                        placeholder="09:00-12:00"
                        className="w-20 text-xs bg-transparent focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeSlot(day, idx)}
                        className="text-tatt-gray hover:text-red-500 text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addSlot(day)}
                    className="text-xs text-tatt-lime hover:underline"
                  >
                    + Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Why do you want to volunteer?
        </label>
        <textarea
          value={reasonForApplying}
          onChange={(e) => setReasonForApplying(e.target.value)}
          placeholder="Share your motivation..."
          rows={compact ? 3 : 4}
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-tatt-lime resize-none"
          required
        />
      </div>

      {!compact && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Questions for admin (optional)
          </label>
          <textarea
            value={questionsForAdmin}
            onChange={(e) => setQuestionsForAdmin(e.target.value)}
            placeholder="Any questions?"
            rows={2}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-tatt-lime resize-none"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !hasAnyAvailability}
        className="w-full min-h-[48px] bg-tatt-lime text-tatt-black font-bold rounded-lg hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Submitting...
          </>
        ) : (
          "Submit Application"
        )}
      </button>
    </form>
  );
}
