export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "owner" | "admin" | "manager" | "sales" | "viewer";
  tenantId: string;
}

export interface Tenant {
  id: string;
  name: string;
  domain?: string;
  logo?: string;
  primaryColor: string;
  plan: "starter" | "growth" | "enterprise";
  billingModel: "seat" | "usage";
  targetIndustries: string[];
  targetCompanySize: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company: string;
  title: string;
  industry: string;
  companySize: string;
  budget: string;
  source: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "closed_won" | "closed_lost" | "nurture";
  score: number;
  aiInsights?: AIInsight;
  estimatedValue: number;
  assignedTo?: string;
  tags: string[];
  lastActivityAt: string;
  createdAt: string;
  activities: LeadActivity[];
}

export interface AIInsight {
  score: number;
  conversionProbability: number;
  estimatedValue: number;
  reasons: string[];
  recommendedAction: string;
  riskFactors: string[];
  similarDeals: SimilarDeal[];
  personalityProfile?: string;
  bestContactTime?: string;
  sentiment: "positive" | "neutral" | "negative";
}

export interface SimilarDeal {
  dealValue: number;
  closeTime: string;
  pattern: string;
  similarity: number;
}

export interface LeadActivity {
  id: string;
  type: "email_opened" | "email_clicked" | "page_view" | "form_submitted" | "meeting_booked" | "call_made" | "note_added" | "score_changed";
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
  userId?: string;
}

export interface PipelineColumn {
  id: string;
  title: string;
  status: Lead["status"];
  leads: Lead[];
  totalValue: number;
  color: string;
}

export interface DashboardStats {
  totalLeads: number;
  qualifiedLeads: number;
  conversionRate: number;
  totalRevenue: number;
  avgDealSize: number;
  aiAccuracy: number;
  leadsThisMonth: number;
  revenueThisMonth: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  leadsAssigned: number;
  dealsClosed: number;
  revenueGenerated: number;
  conversionRate: number;
  status: "active" | "away" | "offline";
}

export interface Sequence {
  id: string;
  name: string;
  description: string;
  steps: SequenceStep[];
  enrolledCount: number;
  conversionRate: number;
  isActive: boolean;
}

export interface SequenceStep {
  id: string;
  type: "email" | "call" | "task" | "wait";
  subject?: string;
  content?: string;
  delayDays: number;
  order: number;
}

export interface BillingUsage {
  leadsScored: number;
  apiCalls: number;
  storageUsed: number;
  aiTokensConsumed: number;
  month: string;
}

export interface WhiteLabelConfig {
  primaryColor: string;
  logo?: string;
  favicon?: string;
  customDomain?: string;
  emailSenderName: string;
  emailSenderAddress: string;
}
