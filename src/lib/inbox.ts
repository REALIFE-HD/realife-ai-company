import { supabase } from "@/integrations/supabase/client";

export type InboxStatus = "unassigned" | "assigned" | "archived";
export type InboxRouteMethod = "rule" | "ai" | "manual" | "pending";

export type InboxMessage = {
  id: string;
  subject: string;
  body: string;
  sender: string;
  status: InboxStatus;
  assigned_department: string | null;
  route_method: InboxRouteMethod;
  route_confidence: number;
  route_reason: string;
  created_at: string;
  updated_at: string;
};

export const STATUS_LABEL: Record<InboxStatus, string> = {
  unassigned: "未割当",
  assigned: "割当済",
  archived: "アーカイブ",
};

export const METHOD_LABEL: Record<InboxRouteMethod, string> = {
  rule: "ルール",
  ai: "AI",
  manual: "手動",
  pending: "保留",
};

// キーワード→部門コードのルール辞書
export const ROUTING_RULES: { keywords: string[]; department: string; reason: string }[] = [
  { keywords: ["見積", "積算", "原価", "ダブルチェック"], department: "03", reason: "見積・積算キーワード" },
  { keywords: ["新規", "営業", "商談", "アポ", "リード", "受注"], department: "02", reason: "営業キーワード" },
  { keywords: ["現場", "施工", "工程", "監督", "品質"], department: "04", reason: "施工管理キーワード" },
  { keywords: ["発注", "材料", "協力会社", "BOARD", "購買"], department: "05", reason: "調達購買キーワード" },
  { keywords: ["LP", "SNS", "広告", "ブランディング", "マーケ"], department: "06", reason: "マーケキーワード" },
  { keywords: ["問合せ", "クレーム", "アフター", "顧客満足", "CS"], department: "07", reason: "CSキーワード" },
  { keywords: ["請求", "入金", "支払", "経理", "freee", "仕訳"], department: "08", reason: "経理キーワード" },
  { keywords: ["契約書", "規程", "コンプライアンス", "法務", "NDA"], department: "09", reason: "法務キーワード" },
  { keywords: ["バグ", "障害", "セキュリティ", "クラウド", "システム", "API"], department: "10", reason: "情シスキーワード" },
  { keywords: ["採用", "面接", "労務", "給与", "人事"], department: "11", reason: "人事キーワード" },
  { keywords: ["リベルテ", "EC", "新規事業"], department: "12", reason: "新規事業キーワード" },
  { keywords: ["IPO", "戦略", "KPI", "経営"], department: "01", reason: "経営戦略キーワード" },
];

export function applyRules(subject: string, body: string): { dept: string; reason: string } | null {
  const text = `${subject} ${body}`.toLowerCase();
  for (const r of ROUTING_RULES) {
    const hit = r.keywords.find((k) => text.includes(k.toLowerCase()));
    if (hit) return { dept: r.department, reason: `${r.reason}「${hit}」` };
  }
  return null;
}

export async function listInbox(status?: InboxStatus): Promise<InboxMessage[]> {
  let q = supabase.from("inbox_messages").select("*").order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as InboxMessage[];
}

export async function createInboxMessage(input: {
  subject: string;
  body: string;
  sender?: string;
}): Promise<InboxMessage> {
  const { data, error } = await supabase
    .from("inbox_messages")
    .insert({ subject: input.subject, body: input.body, sender: input.sender ?? "" })
    .select()
    .single();
  if (error) throw error;
  return data as InboxMessage;
}

export async function updateInboxMessage(
  id: string,
  patch: Partial<InboxMessage>,
): Promise<InboxMessage> {
  const { data, error } = await supabase
    .from("inbox_messages")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as InboxMessage;
}

export async function deleteInboxMessage(id: string): Promise<void> {
  const { error } = await supabase.from("inbox_messages").delete().eq("id", id);
  if (error) throw error;
}

export type ActionSuggestion = { title: string; detail: string };

export type ClassifyResult = {
  department: string | null;
  confidence: number;
  reason: string;
  title: string;
  suggestions: ActionSuggestion[];
};

/** AI振り分け呼び出し(エッジ関数) */
export async function classifyWithAI(subject: string, body: string): Promise<ClassifyResult> {
  const { data, error } = await supabase.functions.invoke("inbox-classify", {
    body: { subject, body },
  });
  if (error) throw error;
  return {
    department: data?.department ?? null,
    confidence: data?.confidence ?? 0,
    reason: data?.reason ?? "",
    title: data?.title ?? "",
    suggestions: Array.isArray(data?.suggestions) ? data.suggestions : [],
  };
}
