"use client";

import { getSession } from "next-auth/react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ApiOptions extends RequestInit {
  params?: Record<string, string>;
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const session = await getSession();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (session?.user) {
    headers["Authorization"] = `Bearer ${(session.user as any).accessToken || ""}`;
  }
  return headers;
}

export async function apiClient<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { params, ...rest } = options;

  let url = `${API_BASE}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const headers = await getAuthHeaders();

  const response = await fetch(url, {
    ...rest,
    headers: {
      ...headers,
      ...rest.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

// Lead API
export const leadsApi = {
  getAll: (params?: { search?: string; status?: string; page?: string; limit?: string }) =>
    apiClient("/api/leads", { params }),
  getById: (id: string) => apiClient(`/api/leads/${id}`),
  create: (data: any) => apiClient("/api/leads", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiClient(`/api/leads/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiClient(`/api/leads/${id}`, { method: "DELETE" }),
  getAnalytics: () => apiClient("/api/leads/analytics/dashboard"),
  applyDecay: () => apiClient("/api/leads/decay/apply", { method: "POST" }),
};

// AI API
export const aiApi = {
  scoreLead: (leadId: string) => apiClient(`/api/leads/${leadId}/score`, { method: "POST" }),
  getInsights: (leadId: string) => apiClient(`/api/leads/${leadId}/insights`),
  generateEmail: (leadId: string, context: string) =>
    apiClient("/api/ai/generate-email", { method: "POST", body: JSON.stringify({ leadId, context }) }),
  copilotChat: (message: string, context?: any) =>
    apiClient("/api/ai/copilot", { method: "POST", body: JSON.stringify({ message, context }) }),
  forecastRevenue: () => apiClient("/api/ai/forecast"),
  getRecommendations: () => apiClient("/api/ai/recommendations"),
};

// Pipeline API
export const pipelineApi = {
  getColumns: () => apiClient("/api/pipeline"),
  moveLead: (leadId: string, status: string) =>
    apiClient(`/api/leads/${leadId}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
};

// Sequence API
export const sequencesApi = {
  getAll: () => apiClient("/api/sequences"),
  create: (data: any) => apiClient("/api/sequences", { method: "POST", body: JSON.stringify(data) }),
  enroll: (id: string, leadIds: string[]) =>
    apiClient(`/api/sequences/${id}/enroll`, { method: "POST", body: JSON.stringify({ leadIds }) }),
};

// Billing API
export const billingApi = {
  getPlans: () => apiClient("/api/billing/plans"),
  createCheckout: (planId: string) =>
    apiClient("/api/billing/checkout", { method: "POST", body: JSON.stringify({ planId }) }),
  getPortal: () => apiClient("/api/billing/portal"),
};

// Settings API
export const settingsApi = {
  getTeam: () => apiClient("/api/settings/team"),
  update: (data: any) => apiClient("/api/settings/team/settings", { method: "PATCH", body: JSON.stringify(data) }),
  invite: (email: string, role: string) =>
    apiClient("/api/settings/team/invite", { method: "POST", body: JSON.stringify({ email, role }) }),
};
