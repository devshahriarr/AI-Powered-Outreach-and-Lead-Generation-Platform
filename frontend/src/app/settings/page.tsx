"use client";

import React from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Settings } from "lucide-react";
import { PlatformSettingsForm } from "@/components/settings/PlatformSettingsForm";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & Brand Profile"
        description="Configure default sender identities, brand voice criteria, and API integrations."
      />

      <div className="py-2">
        <PlatformSettingsForm />
      </div>
    </div>
  );
}
