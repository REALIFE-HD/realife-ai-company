export const INSTRUCTION_STORAGE_KEY = "realife_instructions";
export const DEFAULT_AUTHOR = "外山滉樹";

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

export function loadInstructions(): Instruction[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(INSTRUCTION_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Instruction[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveInstructions(list: Instruction[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(INSTRUCTION_STORAGE_KEY, JSON.stringify(list));
}

export function addInstruction(input: {
  department_code: string;
  title: string;
  content: string;
  status?: InstructionStatus;
}): Instruction {
  const created: Instruction = {
    id:
      isBrowser() && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `inst_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    department_code: input.department_code,
    title: input.title.trim(),
    content: input.content.trim(),
    created_by: DEFAULT_AUTHOR,
    created_at: new Date().toISOString(),
    status: input.status ?? "open",
  };
  const list = loadInstructions();
  list.unshift(created);
  saveInstructions(list);
  return created;
}

export function updateInstructionStatus(id: string, status: InstructionStatus) {
  const list = loadInstructions().map((i) =>
    i.id === id ? { ...i, status } : i,
  );
  saveInstructions(list);
  return list;
}

/** Returns instructions for a given department, including "all" broadcasts. Sorted newest first. */
export function getInstructionsForDepartment(code: string): Instruction[] {
  return loadInstructions()
    .filter((i) => i.department_code === code || i.department_code === "all")
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
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
