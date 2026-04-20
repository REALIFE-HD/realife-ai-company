import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  formatDateTime,
  STATUS_BADGE,
  STATUS_LABEL,
  updateInstructionStatus,
  type Instruction,
  type InstructionStatus,
} from "@/lib/instructions";
import { DEPARTMENTS } from "@/data/departments";

type Props = {
  instructions: Instruction[];
  onChange?: () => void;
};

export function InstructionList({ instructions, onChange }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const changeStatus = async (id: string, status: InstructionStatus) => {
    try {
      await updateInstructionStatus(id, status);
      toast.success("ステータスを更新しました");
      onChange?.();
    } catch {
      toast.error("エラーが発生しました");
    }
  };

  if (instructions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="text-sm text-slate-600">まだ指示はありません</p>
        <p className="mt-1 text-xs text-slate-500">
          上の「この部門へ指示を出す」ボタンから最初の指示を作成しましょう。
        </p>
      </div>
    );
  }

  return (
    <ol className="space-y-3">
      {instructions.map((i) => {
        const isExpanded = expanded.has(i.id);
        const dept = DEPARTMENTS.find((d) => d.id === i.department_code);
        const deptLabel =
          i.department_code === "all" ? "全部門向け" : dept ? dept.name : i.department_code;
        return (
          <li
            key={i.id}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_BADGE[i.status]}`}
                >
                  {STATUS_LABEL[i.status]}
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                  {deptLabel}
                </span>
              </div>
              <span className="font-mono text-[11px] text-slate-500 whitespace-nowrap">
                {formatDateTime(i.created_at)}
              </span>
            </div>

            <h4 className="mt-3 text-base font-semibold text-slate-950">{i.title}</h4>
            {i.content && (
              <button
                type="button"
                onClick={() => toggle(i.id)}
                className={`mt-1.5 block w-full text-left text-sm leading-relaxed text-slate-600 ${
                  isExpanded ? "" : "line-clamp-2"
                }`}
                title={isExpanded ? "折りたたむ" : "全文表示"}
              >
                {i.content}
              </button>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <p className="text-[11px] text-slate-500">発信: {i.created_by}</p>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700 transition-colors hover:border-slate-400"
                  >
                    ステータス変更
                    <ChevronDown className="h-3 w-3" aria-hidden="true" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {(Object.keys(STATUS_LABEL) as InstructionStatus[]).map((s) => (
                    <DropdownMenuItem
                      key={s}
                      onClick={() => changeStatus(i.id, s)}
                      disabled={s === i.status}
                    >
                      {STATUS_LABEL[s]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
