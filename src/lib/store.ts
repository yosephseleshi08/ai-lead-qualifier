"use client";

import { create } from "zustand";
import { Lead, PipelineColumn, DashboardStats, TeamMember, Sequence } from "@/types";
import { mockLeads, mockPipelineColumns, mockStats, mockTeam, mockSequences } from "./mock-data";

interface AppState {
  leads: Lead[];
  pipeline: PipelineColumn[];
  stats: DashboardStats;
  team: TeamMember[];
  sequences: Sequence[];
  selectedLead: Lead | null;
  isLeadDetailOpen: boolean;
  searchQuery: string;
  statusFilter: string;
  scoreFilter: [number, number];

  // Actions
  setSelectedLead: (lead: Lead | null) => void;
  setLeadDetailOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  setScoreFilter: (range: [number, number]) => void;
  moveLead: (leadId: string, fromStatus: string, toStatus: string) => void;
  updateLeadScore: (leadId: string, newScore: number) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  leads: mockLeads,
  pipeline: mockPipelineColumns,
  stats: mockStats,
  team: mockTeam,
  sequences: mockSequences,
  selectedLead: null,
  isLeadDetailOpen: false,
  searchQuery: "",
  statusFilter: "all",
  scoreFilter: [0, 100],

  setSelectedLead: (lead) => set({ selectedLead: lead }),
  setLeadDetailOpen: (open) => set({ isLeadDetailOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setScoreFilter: (range) => set({ scoreFilter: range }),

  moveLead: (leadId, fromStatus, toStatus) => {
    const { leads, pipeline } = get();
    const updatedLeads = leads.map((l) =>
      l.id === leadId ? { ...l, status: toStatus as Lead["status"] } : l
    );

    const updatedPipeline = pipeline.map((col) => {
      if (col.status === fromStatus) {
        return { ...col, leads: col.leads.filter((l) => l.id !== leadId) };
      }
      if (col.status === toStatus) {
        const movedLead = updatedLeads.find((l) => l.id === leadId)!;
        return { ...col, leads: [...col.leads, movedLead] };
      }
      return col;
    });

    set({ leads: updatedLeads, pipeline: updatedPipeline });
  },

  updateLeadScore: (leadId, newScore) => {
    const { leads } = get();
    const updatedLeads = leads.map((l) =>
      l.id === leadId ? { ...l, score: newScore } : l
    );
    set({ leads: updatedLeads });
  },
}));
