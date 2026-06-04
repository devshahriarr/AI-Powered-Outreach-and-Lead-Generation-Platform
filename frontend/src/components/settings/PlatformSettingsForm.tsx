"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { usePlatformSettings, useUpdatePlatformSettings } from "@/hooks/useSettings";
import { useToast } from "@/providers/ToastProvider";
import { Loader2 } from "lucide-react";

const settingsSchema = z.object({
  restaurant_name: z.string().min(1, "Restaurant name is required"),
  restaurant_location: z.string().min(1, "Restaurant location (city/area) is required"),
  sender_name: z.string().min(1, "Sender name is required"),
  reply_email: z.string().email("Invalid reply email address"),
  offer: z.string().min(5, "Offer details must be at least 5 characters"),
  call_to_action: z.string().min(1, "Call-to-action is required"),
  brand_voice: z.string().optional().nullable(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export function PlatformSettingsForm() {
  const { data: settings, isLoading, isError, error } = usePlatformSettings();
  const updateMutation = useUpdatePlatformSettings();
  const { success, error: toastError } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      restaurant_name: "",
      restaurant_location: "",
      sender_name: "",
      reply_email: "",
      offer: "",
      call_to_action: "",
      brand_voice: "",
    },
  });

  // Sync form values when settings data is loaded
  useEffect(() => {
    if (settings) {
      reset({
        restaurant_name: settings.restaurant_name ?? "",
        restaurant_location: settings.restaurant_location ?? "",
        sender_name: settings.sender_name ?? "",
        reply_email: settings.reply_email ?? "",
        offer: settings.offer ?? "",
        call_to_action: settings.call_to_action ?? "",
        brand_voice: settings.brand_voice ?? "",
      });
    }
  }, [settings, reset]);

  const onSubmit = (data: SettingsFormValues) => {
    updateMutation.mutate(data, {
      onSuccess: () => {
        success("Campaign settings saved successfully!");
      },
      onError: (err: any) => {
        toastError(err?.message ?? "Failed to save campaign settings.");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="text-xs text-muted-foreground">Loading campaign settings...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 border border-rose-500/20 bg-rose-500/5 rounded-xl text-center">
        <p className="text-sm font-semibold text-rose-500">Failed to load settings</p>
        <p className="text-xs text-muted-foreground mt-1">{(error as any)?.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-card border border-border/40 p-6 rounded-xl shadow-sm max-w-3xl">
      <div>
        <h2 className="text-lg font-bold text-foreground">Global Outreach Configuration</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Define parameters for AI email generation and default outreach sender profiles.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Restaurant Name */}
          <div className="space-y-1.5">
            <label htmlFor="restaurant_name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Restaurant Name
            </label>
            <input
              id="restaurant_name"
              type="text"
              placeholder="e.g. Gourmet Catering Co."
              {...register("restaurant_name")}
              className={`w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground transition-all duration-200 focus:outline-none focus:ring-2 ${
                errors.restaurant_name ? "border-rose-500 focus:ring-rose-500/20" : "border-border/60 focus:ring-accent/20"
              }`}
            />
            {errors.restaurant_name && (
              <p className="text-xs text-rose-500">{errors.restaurant_name.message}</p>
            )}
          </div>

          {/* Restaurant Location */}
          <div className="space-y-1.5">
            <label htmlFor="restaurant_location" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Restaurant Location (City/Area)
            </label>
            <input
              id="restaurant_location"
              type="text"
              placeholder="e.g. Austin, TX"
              {...register("restaurant_location")}
              className={`w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground transition-all duration-200 focus:outline-none focus:ring-2 ${
                errors.restaurant_location ? "border-rose-500 focus:ring-rose-500/20" : "border-border/60 focus:ring-accent/20"
              }`}
            />
            {errors.restaurant_location && (
              <p className="text-xs text-rose-500">{errors.restaurant_location.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Sender Name */}
          <div className="space-y-1.5">
            <label htmlFor="sender_name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Sender Name (Outreach Identity)
            </label>
            <input
              id="sender_name"
              type="text"
              placeholder="e.g. Sarah Jenkins"
              {...register("sender_name")}
              className={`w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground transition-all duration-200 focus:outline-none focus:ring-2 ${
                errors.sender_name ? "border-rose-500 focus:ring-rose-500/20" : "border-border/60 focus:ring-accent/20"
              }`}
            />
            {errors.sender_name && (
              <p className="text-xs text-rose-500">{errors.sender_name.message}</p>
            )}
          </div>

          {/* Reply Email */}
          <div className="space-y-1.5">
            <label htmlFor="reply_email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Reply Email Address
            </label>
            <input
              id="reply_email"
              type="email"
              placeholder="e.g. sales@gourmetcatering.com"
              {...register("reply_email")}
              className={`w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground transition-all duration-200 focus:outline-none focus:ring-2 ${
                errors.reply_email ? "border-rose-500 focus:ring-rose-500/20" : "border-border/60 focus:ring-accent/20"
              }`}
            />
            {errors.reply_email && (
              <p className="text-xs text-rose-500">{errors.reply_email.message}</p>
            )}
          </div>
        </div>

        {/* Offer */}
        <div className="space-y-1.5">
          <label htmlFor="settings-offer" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Default Catering Offer
          </label>
          <textarea
            id="settings-offer"
            rows={3}
            placeholder="e.g. 10% off your first group office lunch box order of 15+ meals."
            {...register("offer")}
            className={`w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground transition-all duration-200 focus:outline-none focus:ring-2 ${
              errors.offer ? "border-rose-500 focus:ring-rose-500/20" : "border-border/60 focus:ring-accent/20"
            }`}
          />
          {errors.offer && (
            <p className="text-xs text-rose-500">{errors.offer.message}</p>
          )}
        </div>

        {/* Call To Action */}
        <div className="space-y-1.5">
          <label htmlFor="call_to_action" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Call To Action (CTA)
          </label>
          <input
            id="call_to_action"
            type="text"
            placeholder="e.g. Schedule a quick 5-minute phone call next Tuesday"
            {...register("call_to_action")}
            className={`w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground transition-all duration-200 focus:outline-none focus:ring-2 ${
              errors.call_to_action ? "border-rose-500 focus:ring-rose-500/20" : "border-border/60 focus:ring-accent/20"
            }`}
          />
          {errors.call_to_action && (
            <p className="text-xs text-rose-500">{errors.call_to_action.message}</p>
          )}
        </div>

        {/* Brand Voice */}
        <div className="space-y-1.5">
          <label htmlFor="brand_voice" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            AI Brand Voice Guidance (Optional)
          </label>
          <textarea
            id="brand_voice"
            rows={3}
            placeholder="e.g. Warm, professional, supportive, but direct and low pressure. Highlight our local roots."
            {...register("brand_voice")}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border/60 bg-background text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>

        {/* Save Button */}
        <div className="pt-3 border-t border-border/20 flex justify-end">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 disabled:bg-accent/70 text-white rounded-lg text-sm font-semibold shadow-sm transition-all duration-200 cursor-pointer"
          >
            {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
