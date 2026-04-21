import { useEffect, useMemo, useRef } from "react";
import { Clock, Info, X } from "lucide-react";
import { HISTORY_DEDUPE_HINT } from "@/lib/normalize-query";

// ブラウザの localStorage には実装上の上限（多くは ~5MB/オリジン）があるため、
// 履歴単体ではまず到達しないが、目安として 4KB を「警戒ライン」として扱う。
const BYTE_SOFT_LIMIT = 4 * 1024;

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  return `${(n / 1024).toFixed(n < 1024 * 10 ? 2 : 1)} KB`;
}

export function SearchHistoryDropdown({
  history,
  activeIndex = -1,
  limit,
  onSelect,
  onRemove,
  onClear,
  onHover,
}: {
  history: string[];
  activeIndex?: number;
  /** 保存件数の上限。表示と「次に消える項目」の予告に使用 */
  limit?: number;
  onSelect: (q: string) => void;
  onRemove: (q: string) => void;
  onClear: () => void;
  onHover?: (index: number) => void;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const activeItemRef = useRef<HTMLLIElement>(null);

  // 履歴全体のおおよそのバイト数（UTF-8）。JSON 化したサイズで概算する。
  const byteSize = useMemo(() => {
    try {
      const json = JSON.stringify(history);
      return typeof TextEncoder !== "undefined"
        ? new TextEncoder().encode(json).length
        : json.length;
    } catch {
      return 0;
    }
  }, [history]);
  const bytePct = Math.min(100, Math.round((byteSize / BYTE_SOFT_LIMIT) * 100));
  const byteWarn = byteSize >= BYTE_SOFT_LIMIT * 0.75;

  // ↑↓ で activeIndex が変わったら、その項目をリスト内で確実に表示する
  useEffect(() => {
    const list = listRef.current;
    const item = activeItemRef.current;
    if (!list || !item || activeIndex < 0) return;
    const itemTop = item.offsetTop;
    const itemBottom = itemTop + item.offsetHeight;
    const viewTop = list.scrollTop;
    const viewBottom = viewTop + list.clientHeight;
    if (itemTop < viewTop) {
      list.scrollTop = itemTop;
    } else if (itemBottom > viewBottom) {
      list.scrollTop = itemBottom - list.clientHeight;
    }
  }, [activeIndex]);

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
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-1.5">
        <span className="flex min-w-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          <span>最近の検索</span>
          {typeof limit === "number" && (
            <span
              className="rounded-sm bg-slate-100 px-1.5 py-px font-mono text-[10px] font-medium tracking-normal text-slate-600"
              title={`最大 ${limit} 件まで保存。上限を超えると古い履歴から自動削除されます。`}
              aria-label={`現在 ${history.length} 件 / 最大 ${limit} 件`}
            >
              {history.length}/{limit}
            </span>
          )}
          <span
            className={`rounded-sm px-1.5 py-px font-mono text-[10px] font-medium tracking-normal ${
              byteWarn ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
            }`}
            title={`履歴データのおおよそのサイズ: ${formatBytes(byteSize)} / 目安 ${formatBytes(BYTE_SOFT_LIMIT)} (${bytePct}%)`}
            aria-label={`データサイズ ${formatBytes(byteSize)}、目安の${bytePct}パーセント`}
          >
            {formatBytes(byteSize)}
          </span>
          <span
            tabIndex={0}
            aria-label={HISTORY_DEDUPE_HINT}
            title={HISTORY_DEDUPE_HINT}
            className="inline-flex h-3.5 w-3.5 cursor-help items-center justify-center text-slate-400 hover:text-slate-600"
          >
            <Info className="h-3 w-3" aria-hidden="true" />
          </span>
        </span>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onClear();
          }}
          className="shrink-0 text-[11px] font-medium text-slate-500 hover:text-slate-900"
        >
          履歴を消去
        </button>
      </div>
      {typeof limit === "number" && history.length >= limit && (
        <div className="border-b border-slate-100 bg-amber-50/60 px-3 py-1 text-[10.5px] text-amber-800">
          上限 {limit} 件に到達。次に検索すると一番古い履歴が削除されます。
        </div>
      )}
      <ul ref={listRef} className="max-h-64 overflow-y-auto py-1" onMouseLeave={() => onHover?.(-1)}>
        {history.map((q, i) => {
          const isActive = i === activeIndex;
          // 上限到達時、最末尾(=最古)は次に削除される項目として薄く表示し title で予告
          const willBeEvicted =
            typeof limit === "number" && history.length >= limit && i === history.length - 1;
          return (
            <li
              key={q}
              role="option"
              aria-selected={isActive}
              ref={isActive ? activeItemRef : undefined}
              onMouseEnter={() => onHover?.(i)}
              onMouseMove={() => { if (i !== activeIndex) onHover?.(i); }}
              title={willBeEvicted ? "次に新しい検索を行うと削除されます" : undefined}
              className={`group flex items-center ${isActive ? "bg-blue-50" : ""} ${willBeEvicted ? "opacity-60" : ""}`}
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
