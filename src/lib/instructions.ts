import { supabase } from "@/integrations/supabase/client";

export const DEFAULT_AUTHOR = "外山滉樹";
/** Legacy localStorage key (kept for one-time migration). */
export const INSTRUCTION_STORAGE_KEY = "realife_instructions";

export type InstructionStatus = "open" | "in_progress" | "completed";

export type Instruction = {
  id: string;
  department_code: string; // "01"〜"12" or "all"
  title: string;
  content: string;
  created_by: string;
  created_at: string; // ISO datetime
  status: InstructionStatus;
};

export const STATUS_LABEL: Record<InstructionStatus, string> = {
  open: "未着手",
  in_progress: "進行中",
  completed: "完了",
};

export const STATUS_BADGE: Record<InstructionStatus, string> = {
  open: "bg-blue-50 text-blue-700 border-blue-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const isBrowser = () => typeof window !== "undefined";

type Row = {
  id: string;
  department_code: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  status: InstructionStatus;
};

const toInstruction = (r: Row): Instruction => ({
  id: r.id,
  department_code: r.department_code,
  title: r.title,
  content: r.content ?? "",
  created_by: r.created_by,
  created_at: r.created_at,
  status: r.status,
});

/** Fetch all instructions (newest first). */
export async function loadInstructions(): Promise<Instruction[]> {
  const { data, error } = await supabase
    .from("instructions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => toInstruction(r as Row));
}

/** Fetch instructions for a department (+ "all" broadcasts), newest first. */
export async function getInstructionsForDepartment(
  code: string,
): Promise<Instruction[]> {
  const { data, error } = await supabase
    .from("instructions")
    .select("*")
    .or(`department_code.eq.${code},department_code.eq.all`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => toInstruction(r as Row));
}

export async function addInstruction(input: {
  department_code: string;
  title: string;
  content: string;
  status?: InstructionStatus;
  created_by?: string;
}): Promise<Instruction> {
  const { data, error } = await supabase
    .from("instructions")
    .insert({
      department_code: input.department_code,
      title: input.title.trim(),
      content: input.content.trim(),
      status: input.status ?? "open",
      created_by: input.created_by ?? DEFAULT_AUTHOR,
    })
    .select("*")
    .single();
  if (error) throw error;
  return toInstruction(data as Row);
}

export async function updateInstructionStatus(
  id: string,
  status: InstructionStatus,
): Promise<void> {
  const { error } = await supabase
    .from("instructions")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

/** Subscribe to realtime changes on the instructions table. Returns an unsubscribe fn. */
export function subscribeToInstructions(onChange: () => void): () => void {
  if (!isBrowser()) return () => {};
  const channel = supabase
    .channel("instructions-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "instructions" },
      () => onChange(),
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

/** One-time migration: push any localStorage instructions into the DB, then clear them. */
export async function migrateLocalInstructionsIfAny(): Promise<number> {
  if (!isBrowser()) return 0;
  try {
    const raw = window.localStorage.getItem(INSTRUCTION_STORAGE_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as Array<Partial<Instruction>>;
    if (!Array.isArray(parsed) || parsed.length === 0) {
      window.localStorage.removeItem(INSTRUCTION_STORAGE_KEY);
      return 0;
    }
    const rows = parsed
      .filter((i) => i && i.title && i.department_code)
      .map((i) => ({
        department_code: i.department_code as string,
        title: (i.title as string).trim(),
        content: (i.content ?? "").toString().trim(),
        status: (i.status as InstructionStatus) ?? "open",
        created_by: (i.created_by as string) ?? DEFAULT_AUTHOR,
        created_at: (i.created_at as string) ?? new Date().toISOString(),
      }));
    if (rows.length === 0) {
      window.localStorage.removeItem(INSTRUCTION_STORAGE_KEY);
      return 0;
    }
    const { error } = await supabase.from("instructions").insert(rows);
    if (error) throw error;
    window.localStorage.removeItem(INSTRUCTION_STORAGE_KEY);
    return rows.length;
  } catch {
    return 0;
  }
}

export function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${day} ${hh}:${mm}`;
  } catch {
    return iso;
  }
}
