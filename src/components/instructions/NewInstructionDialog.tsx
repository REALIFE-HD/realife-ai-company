import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEPARTMENTS } from "@/data/departments";
import {
  addInstruction,
  STATUS_LABEL,
  type Instruction,
  type InstructionStatus,
} from "@/lib/instructions";

type Props = {
  /** When set, the department selector is hidden and this code is used. */
  fixedDepartmentCode?: string;
  /** Custom trigger button. If omitted, no trigger is rendered (use controlled props). */
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCreated?: (instruction: Instruction) => void;
};

export function NewInstructionDialog({
  fixedDepartmentCode,
  trigger,
  open: controlledOpen,
  onOpenChange,
  onCreated,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (v: boolean) => {
    if (onOpenChange) onOpenChange(v);
    else setInternalOpen(v);
  };

  const [department, setDepartment] = useState<string>(fixedDepartmentCode ?? "all");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<InstructionStatus>("open");

  // Reset form when opening
  useEffect(() => {
    if (open) {
      setDepartment(fixedDepartmentCode ?? "all");
      setTitle("");
      setContent("");
      setStatus("open");
    }
  }, [open, fixedDepartmentCode]);

  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || submitting) return;
    setSubmitting(true);
    try {
      const created = await addInstruction({
        department_code: department,
        title,
        content,
        status,
      });
      toast.success("指示を保存しました");
      onCreated?.(created);
      setOpen(false);
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  const fixedDept = fixedDepartmentCode
    ? DEPARTMENTS.find((d) => d.id === fixedDepartmentCode)
    : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {fixedDept ? `${fixedDept.name} へ指示` : "新規指示"}
            </DialogTitle>
            <DialogDescription>
              {fixedDept
                ? "この部門の指示履歴に保存されます。"
                : "対象部門を選択して指示を作成します。"}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {!fixedDepartmentCode && (
              <div className="space-y-1.5">
                <Label htmlFor="i-dept">対象部門</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger id="i-dept">
                    <SelectValue placeholder="部門を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部門向け</SelectItem>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.id} {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="i-title">
                タイトル <span className="text-red-600">*</span>
              </Label>
              <Input
                id="i-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例:今週の優先案件3件を共有"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="i-content">
                内容 <span className="text-red-600">*</span>
              </Label>
              <Textarea
                id="i-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="指示の詳細を記入"
                rows={5}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="i-status">ステータス</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as InstructionStatus)}
              >
                <SelectTrigger id="i-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_LABEL) as InstructionStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:border-slate-900"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {submitting ? "保存中..." : "指示を保存"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
