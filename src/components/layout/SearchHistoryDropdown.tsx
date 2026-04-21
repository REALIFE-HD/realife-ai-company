import { Clock, X } from "lucide-react";

export function SearchHistoryDropdown({
  history,
  activeIndex = -1,
  onSelect,
  onRemove,
  onClear,
  onHover,
}: {
  history: string[];
  activeIndex?: number;
  onSelect: (q: string) => void;
  onRemove: (q: string) => void;
  onClear: () => void;
  onHover?: (index: number) => void;
}) {
  if (history.length === 0) {
    return (
      <div className="absolute left-0 right-0 top-full z-30 mt-1 rounded-md border border-slate-200 bg-white p-3 text-[12px] text-slate-500 shadow-lg">
        検索履歴はまだありません
      </div>
    );
  }

  return (
    <div
      role="listbox"
      aria-label="検索履歴"
      className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg"
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          最近の検索
        </span>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onClear();
          }}
          className="text-[11px] font-medium text-slate-500 hover:text-slate-900"
        >
          履歴を消去
        </button>
      </div>
      <ul className="max-h-64 overflow-y-auto py-1">
        {history.map((q, i) => {
          const isActive = i === activeIndex;
          return (
            <li
              key={q}
              role="option"
              aria-selected={isActive}
              onMouseEnter={() => onHover?.(i)}
              className={`group flex items-center ${
                isActive ? "bg-blue-50" : ""
              }`}
            >
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(q);
                }}
                className={`flex flex-1 items-center gap-2 px-3 py-1.5 text-left text-[13px] ${
                  isActive ? "text-blue-900" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Clock
                  className={`h-3.5 w-3.5 ${isActive ? "text-blue-500" : "text-slate-400"}`}
                  aria-hidden="true"
                />
                <span className="truncate">{q}</span>
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onRemove(q);
                }}
                aria-label={`${q} を履歴から削除`}
                className="mr-1 inline-flex h-6 w-6 items-center justify-center rounded text-slate-400 opacity-0 transition-opacity hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
