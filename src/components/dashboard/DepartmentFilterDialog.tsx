import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export type DeptStatusFilter = "active" | "setup" | "standard";

export type DeptFilters = {
  statuses: DeptStatusFilter[];
  unreadOnly: boolean;
};

export const DEFAULT_DEPT_FILTERS: DeptFilters = {
  statuses: [],
  unreadOnly: false,
};

const STATUS_OPTIONS: { value: DeptStatusFilter; label: string; dot: string }[] = [
  { value: "active", label: "稼働中", dot: "bg-blue-500" },
  { value: "setup", label: "構築中", dot: "bg-amber-500" },
  { value: "standard", label: "通常運用", dot: "bg-muted-foreground" },
];

export function DepartmentFilterDialog({
  open,
  onOpenChange,
  value,
  onChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: DeptFilters;
  onChange: (next: DeptFilters) => void;
}) {
  const toggleStatus = (s: DeptStatusFilter) => {
    const has = value.statuses.includes(s);
    onChange({
      ...value,
      statuses: has ? value.statuses.filter((x) => x !== s) : [...value.statuses, s],
    });
  };

  const reset = () => onChange(DEFAULT_DEPT_FILTERS);
  const activeCount = value.statuses.length + (value.unreadOnly ? 1 : 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>絞り込み</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              ステータス
            </p>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((opt) => {
                const checked = value.statuses.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleStatus(opt.value)}
                    aria-pressed={checked}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                      checked
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-border bg-card text-muted-foreground hover:border-border"
                    }`}
                  >
                    <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${opt.dot}`} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">未選択の場合はすべて表示</p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/60 px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-foreground">未読あり のみ</p>
              <p className="text-[11px] text-muted-foreground">未読件数が1件以上の部門だけを表示</p>
            </div>
            <label className="relative inline-flex shrink-0 cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={value.unreadOnly}
                onChange={(e) => onChange({ ...value, unreadOnly: e.target.checked })}
              />
              <span className="h-5 w-9 rounded-full bg-muted transition-colors peer-checked:bg-primary" />
              <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-card shadow transition-transform peer-checked:translate-x-4" />
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:border-border"
          >
            リセット
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md bg-blue-600 px-4 py-1.5 text-[12px] font-medium text-white hover:bg-blue-700"
          >
            適用 {activeCount > 0 && <span className="num ml-1">({activeCount})</span>}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function applyDeptFilters<T extends { status: DeptStatusFilter; unread?: number }>(
  items: T[],
  filters: DeptFilters,
): T[] {
  return items.filter((d) => {
    if (filters.statuses.length > 0 && !filters.statuses.includes(d.status)) return false;
    if (filters.unreadOnly && !(d.unread && d.unread > 0)) return false;
    return true;
  });
}
