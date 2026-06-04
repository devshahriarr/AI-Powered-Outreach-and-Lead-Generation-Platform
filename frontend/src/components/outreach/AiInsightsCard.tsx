"use client";

import React from "react";
import { Sparkles, Shield, BookOpen, AlertCircle, FileText } from "lucide-react";

interface AiInsightsCardProps {
  body: string;
  subject: string;
}

export function AiInsightsCard({ body, subject }: AiInsightsCardProps) {
  // Compute dynamic word count
  const wordCount = body ? body.trim().split(/\s+/).filter(Boolean).length : 0;

  // Simple copy heuristics to make insights feel responsive to changes!
  const hasGreeting = body?.toLowerCase().includes("hi ") || body?.toLowerCase().includes("hello ");
  const hasLeadName = body?.toLowerCase().includes("{") || body?.toLowerCase().includes("[") ? false : true; // Checks if raw templates exist
  
  // Calculate personalization score based on heuristics
  let personalizationScore = 70;
  if (hasGreeting) personalizationScore += 10;
  if (hasLeadName) personalizationScore += 10;
  if (subject?.length > 10) personalizationScore += 5;
  personalizationScore = Math.min(personalizationScore, 98);

  // Readability
  const readability = wordCount > 150 ? "Grade 11 (Complex)" : "Grade 8 (Optimal)";

  // Spam Risk
  const spamKeywords = ["free", "buy", "urgent", "limited time", "cash", "discount"];
  const spamMatches = spamKeywords.filter(keyword => body?.toLowerCase().includes(keyword));
  const spamRisk = spamMatches.length > 2 ? "Medium" : "Low";

  return (
    <div className="bg-card border border-border/40 p-5 rounded-xl shadow-sm space-y-4">
      <div className="flex items-center gap-1.5 border-b border-border/20 pb-3">
        <Sparkles className="w-4 h-4 text-accent animate-pulse" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
          AI Copy Insights
        </h4>
      </div>

      <div className="space-y-4 text-xs">
        {/* Personalization Score */}
        <div className="space-y-1.5">
          <div className="flex justify-between font-semibold">
            <span className="text-muted-foreground">Personalization Score</span>
            <span className="text-accent">{personalizationScore}%</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-500"
              style={{ width: `${personalizationScore}%` }}
            />
          </div>
        </div>

        {/* Spam Risk */}
        <div className="flex justify-between items-center py-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Shield className="w-3.5 h-3.5" />
            <span>Spam Risk</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
              spamRisk === "Low"
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-amber-500/10 text-amber-500"
            }`}
          >
            {spamRisk}
          </span>
        </div>

        {/* Readability */}
        <div className="flex justify-between items-center py-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Readability</span>
          </div>
          <span className="font-semibold text-foreground">{readability}</span>
        </div>

        {/* Length Score */}
        <div className="flex justify-between items-center py-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <FileText className="w-3.5 h-3.5" />
            <span>Length</span>
          </div>
          <div className="text-right">
            <span className="font-semibold text-foreground block">{wordCount} words</span>
            <span
              className={`text-[9px] font-medium block mt-0.5 ${
                wordCount <= 150 ? "text-success" : "text-amber-500"
              }`}
            >
              {wordCount <= 150 ? "Good (Under 150)" : "Long (Ideal is <150)"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
