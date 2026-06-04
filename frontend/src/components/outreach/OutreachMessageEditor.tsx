"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { OutreachMessage } from "@/types";
import { Loader2 } from "lucide-react";

const editSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  body: z.string().min(10, "Body copy must be at least 10 characters"),
  cta: z.string().min(3, "CTA must be at least 3 characters"),
});

type EditFormValues = z.infer<typeof editSchema>;

interface OutreachMessageEditorProps {
  message: OutreachMessage;
  onSave: (data: EditFormValues) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function OutreachMessageEditor({
  message,
  onSave,
  onCancel,
  isSaving = false,
}: OutreachMessageEditorProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      subject: message.subject ?? "",
      body: message.body ?? "",
      cta: message.cta ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4 bg-muted/20 p-4 rounded-lg border border-border/40">
      {/* Subject */}
      <div className="space-y-1">
        <label htmlFor="edit-subject" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Subject Line
        </label>
        <input
          id="edit-subject"
          type="text"
          {...register("subject")}
          className={`w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground transition-all focus:outline-none focus:ring-1 ${
            errors.subject ? "border-rose-500 focus:ring-rose-500/20" : "border-border/60 focus:ring-accent/20 focus:border-accent"
          }`}
        />
        {errors.subject && (
          <p className="text-[10px] text-rose-500 font-medium">{errors.subject.message}</p>
        )}
      </div>

      {/* Body */}
      <div className="space-y-1">
        <label htmlFor="edit-body" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Email Body
        </label>
        <textarea
          id="edit-body"
          rows={6}
          {...register("body")}
          className={`w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground transition-all focus:outline-none focus:ring-1 ${
            errors.body ? "border-rose-500 focus:ring-rose-500/20" : "border-border/60 focus:ring-accent/20 focus:border-accent"
          }`}
        />
        {errors.body && (
          <p className="text-[10px] text-rose-500 font-medium">{errors.body.message}</p>
        )}
      </div>

      {/* CTA */}
      <div className="space-y-1">
        <label htmlFor="edit-cta" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Call To Action (CTA)
        </label>
        <input
          id="edit-cta"
          type="text"
          {...register("cta")}
          className={`w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground transition-all focus:outline-none focus:ring-1 ${
            errors.cta ? "border-rose-500 focus:ring-rose-500/20" : "border-border/60 focus:ring-accent/20 focus:border-accent"
          }`}
        />
        {errors.cta && (
          <p className="text-[10px] text-rose-500 font-medium">{errors.cta.message}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/20">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-3 py-1.5 rounded-lg border border-border/60 hover:bg-muted text-xs font-semibold text-foreground transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent/90 disabled:bg-accent/70 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Save Copy
        </button>
      </div>
    </form>
  );
}
