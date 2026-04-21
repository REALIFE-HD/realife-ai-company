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

export type MonthlyRevenueStat = {
  month: string; // "YYYY-MM"
  revenue: number; // 百万円単位
  deals: number; // 件数
};

/**
 * 直近 `months` ヶ月の受注案件を月別に集計して返す。
 * データが存在しない月は revenue=0, deals=0 で補完する。
 */
export async function aggregateMonthlyRevenue(months = 6): Promise<MonthlyRevenueStat[]> {
  const since = new Date();
  since.setMonth(since.getMonth() - (months - 1));
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("deals")
    .select("amount, created_at")
    .eq("stage", "受注")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true });
  if (error) throw error;

  // 直近 months ヶ月のキーを先に生成（空補完のため）
  const map = new Map<string, { revenue: number; deals: number }>();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    map.set(key, { revenue: 0, deals: 0 });
  }

  for (const row of data ?? []) {
    const d = new Date(row.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const cur = map.get(key);
    if (cur) {
      map.set(key, {
        revenue: cur.revenue + (row.amount ?? 0) / 1_000_000,
        deals: cur.deals + 1,
      });
    }
  }

  return Array.from(map.entries()).map(([month, v]) => ({
    month,
    revenue: Math.round(v.revenue * 10) / 10,
    deals: v.deals,
  }));
}
