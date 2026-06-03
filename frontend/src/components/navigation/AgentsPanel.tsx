"use client";

import React from "react";
import { Radar, Cpu, Mail } from "lucide-react";

interface AgentsPanelProps {
  isCollapsed?: boolean;
}

export function AgentsPanel({ isCollapsed = false }: AgentsPanelProps) {
  const agents = [
    {
      name: "Lead Discovery Agent",
      status: "Running",
      icon: Radar,
      color: "bg-success",
      pulse: true,
      description: "Scanning Yelp & Apify for catering leads",
    },
    {
      name: "Qualification Agent",
      status: "Running",
      icon: Cpu,
      color: "bg-success",
      pulse: true,
      description: "Scoring domains & social relevance",
    },
    {
      name: "Outreach Agent",
      status: "Idle",
      icon: Mail,
      color: "bg-muted-foreground",
      pulse: false,
      description: "Waiting for qualified lead batch",
    },
  ];

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 border-t border-border/40">
        {agents.map((agent, index) => {
          const Icon = agent.icon;
          return (
            <div key={index} className="relative group">
              <div className="p-2 rounded-lg bg-secondary/50 dark:bg-secondary/30 text-muted-foreground hover:text-accent transition-colors duration-200">
                <Icon className="w-4 h-4" />
              </div>
              <span className={`absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border-2 border-primary ${agent.color} ${agent.pulse ? "animate-pulse-slow" : ""}`} />
              
              {/* Tooltip */}
              <div className="absolute left-12 top-1/2 -translate-y-1/2 ml-2 w-48 px-3 py-2 bg-secondary text-secondary-foreground text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 border border-border">
                <p className="font-semibold">{agent.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{agent.status} • {agent.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-border/10">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
          AI Automations
        </span>
      </div>
      <div className="space-y-2">
        {agents.map((agent, index) => {
          return (
            <div key={index} className="flex items-center justify-between text-xs py-0.5">
              <div className="flex items-center gap-2 text-white/70">
                <span className={`w-1.5 h-1.5 rounded-full ${agent.color === "bg-success" ? "bg-success" : "bg-neutral-500"} ${agent.pulse ? "animate-pulse-slow" : ""}`} />
                <span className="truncate max-w-[140px] font-medium">{agent.name.replace(" Agent", "")}</span>
              </div>
              <span className={`text-[10px] font-mono font-semibold ${agent.color === "bg-success" ? "text-success" : "text-white/40"}`}>
                {agent.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
