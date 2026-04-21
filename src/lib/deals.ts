import { supabase } from "@/integrations/supabase/client";

export type DealStage = "見積中" | "提案中" | "見積提出" | "受注" | "失注";
export type DealActivityKind = "メモ" | "電話" | "訪問" | "メール" | "その他";

export type Deal = {
  id: string;
  code: string;
  client: string;
  title: string;
  amount: number;
  stage: DealStage;
  probability: number;
  owner: string;
  next_action: string;
  due: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type DealActivity = {
  id: string;
  deal_id: string;
  kind: DealActivityKind;
  content: string;
  created_by: string;
  created_at: string;
};

export const STAGE_STYLE: Record<DealStage, string> = {
  見積中: "border-border bg-muted text-muted-foreground",
  提案中: "border-blue-200 bg-blue-50 text-blue-700",
  見積提出: "border-amber-200 bg-amber-50 text-amber-700",
  受注: "border-emerald-200 bg-emerald-50 text-emerald-700",
  失注: "border-red-200 bg-red-50 text-red-700",
};

export const STAGES: DealStage[] = ["見積中", "提案中", "見積提出", "受注", "失注"];

/**
 * 金額を ¥ + カンマ区切りで整形。
 * compact=true の場合は M(百万)/K(千) で略記。
 */
export function formatAmount(n: number, opts?: { compact?: boolean }): string {
  if (n == null || Number.isNaN(n)) return "¥0";
  if (opts?.compact) {
    if (Math.abs(n) >= 100_000_000) return `¥${(n / 100_000_000).toFixed(1)}億`;
    if (Math.abs(n) >= 10_000) return `¥${(n / 10_000).toFixed(1)}万`;
    if (Math.abs(n) >= 1_000) return `¥${(n / 1_000).toFixed(1)}K`;
  }
  return `¥${Math.round(n).toLocaleString("ja-JP")}`;
}

export async function listDeals(): Promise<Deal[]> {
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Deal[];
}

export async function getDealByCode(code: string): Promise<Deal | null> {
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("code", code)
    .maybeSingle();
  if (error) throw error;
  return (data as Deal) ?? null;
}

export async function updateDeal(id: string, patch: Partial<Deal>): Promise<Deal> {
  const { data, error } = await supabase
    .from("deals")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Deal;
}

export async function listActivities(dealId: string): Promise<DealActivity[]> {
  const { data, error } = await supabase
    .from("deal_activities")
    .select("*")
    .eq("deal_id", dealId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DealActivity[];
}

export async function addActivity(input: {
  deal_id: string;
  kind: DealActivityKind;
  content: string;
  created_by?: string;
}): Promise<DealActivity> {
  const { data, error } = await supabase
    .from("deal_activities")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as DealActivity;
}

export async function deleteActivity(id: string): Promise<void> {
  const { error } = await supabase.from("deal_activities").delete().eq("id", id);
  if (error) throw error;
}
