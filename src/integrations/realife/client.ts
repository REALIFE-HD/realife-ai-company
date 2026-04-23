import { createClient } from "@supabase/supabase-js";

// REALIFE Supabase project (separate from the primary Lovable Cloud project)
// URL + publishable key are public values; access is gated by RLS policies on the project itself.
const REALIFE_SUPABASE_URL = "https://cdrobplodkxyagzyzvpq.supabase.co";
const REALIFE_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_1O1FHpLpx2s-4RI75PiM-A_yGZPCGFB";

export const realifeSupabase = createClient(
  REALIFE_SUPABASE_URL,
  REALIFE_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: { persistSession: false },
    realtime: { params: { eventsPerSecond: 10 } },
  },
);

// 手書き型定義（REALIFE側のスキーマ生成は後工程）
export type SecretariatUrgency = "S" | "A" | "B" | "C" | "D";
export type SecretariatStatus =
  | "open"
  | "handed_over"
  | "completed"
  | "cancelled"
  | "rejudge_needed";
export type SecretariatSource =
  | "gmail"
  | "phone"
  | "slack"
  | "mail"
  | "visitor"
  | "line_works"
  | "web_form"
  | "other";

export type SecretariatIntake = {
  id: number;
  intake_id: string;
  received_at: string;
  source: SecretariatSource;
  from_name: string | null;
  from_email: string | null;
  from_company: string | null;
  subject: string;
  summary: string | null;
  urgency: SecretariatUrgency;
  confidentiality: "機密" | "社外秘" | "公開";
  main_dept: string;
  sub_depts: string[] | null;
  escalate_to_ceo: boolean;
  sla_deadline: string | null;
  status: SecretariatStatus;
  assignee: string | null;
  notes: string | null;
  ai_judgment_reason: string | null;
  created_by: string;
  updated_at: string;
};
