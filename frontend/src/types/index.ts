// ─── Lead Status Enum ────────────────────────────────────────────────────────

export const LeadStatus = {
  DISCOVERED: "DISCOVERED",
  QUALIFIED: "QUALIFIED",
  REVIEW_REQUIRED: "REVIEW_REQUIRED",
  CONTACTED: "CONTACTED",
  INTERESTED: "INTERESTED",
  MEETING_REQUESTED: "MEETING_REQUESTED",
  BOOKED: "BOOKED",
  CLOSED_WON: "CLOSED_WON",
  CLOSED_LOST: "CLOSED_LOST",
  REJECTED: "REJECTED",
} as const;

export type LeadStatusType = (typeof LeadStatus)[keyof typeof LeadStatus];

export const LEAD_STATUS_LABELS: Record<LeadStatusType, string> = {
  DISCOVERED: "Discovered",
  QUALIFIED: "Qualified",
  REVIEW_REQUIRED: "Review Required",
  CONTACTED: "Contacted",
  INTERESTED: "Interested",
  MEETING_REQUESTED: "Meeting Requested",
  BOOKED: "Booked",
  CLOSED_WON: "Closed Won",
  CLOSED_LOST: "Closed Lost",
  REJECTED: "Rejected",
};

export const ALL_LEAD_STATUSES = Object.values(LeadStatus) as LeadStatusType[];

// ─── Lead DTO (matches backend LeadResponse schema) ──────────────────────────

export interface Lead {
  id: number;
  google_place_id: string;
  name: string;
  business_type: string;
  address: string | null;
  phone_number: string | null;
  website: string | null;
  email: string | null;
  rating: number | null;
  user_ratings_total: number | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  notes: string | null;
  lead_score: number;
  is_qualified: boolean;
  qualification_reason: string | null;
  cleaned_email: string | null;
  cleaned_website: string | null;
  cleaned_phone: string | null;
  review_status: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Lead Update DTO (matches backend LeadUpdate schema) ─────────────────────

export interface LeadUpdate {
  name?: string;
  business_type?: string;
  address?: string;
  phone_number?: string;
  website?: string;
  email?: string;
  status?: string;
  notes?: string;
  lead_score?: number;
  qualification_reason?: string;
}

// ─── Stats DTO (matches backend /api/v1/stats response) ──────────────────────

export interface StatsResponse {
  leads: {
    total: number;
    discovered: number;
    qualified: number;
    review_required: number;
    contacted: number;
  };
  campaigns: {
    total: number;
  };
  outreach_messages: {
    total: number;
    approved: number;
    sent: number;
    replied: number;
  };
}

// ─── API Error ────────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  status: number;
  detail?: string;
}

// ─── Lead List Query Params ───────────────────────────────────────────────────

export interface LeadListParams {
  status?: string;
  business_type?: string;
  skip?: number;
  limit?: number;
}
