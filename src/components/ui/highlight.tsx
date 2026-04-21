import { useMemo } from "react";

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 検索文字列に一致する部分を <mark> でハイライト表示する。
 * - 大文字小文字を区別しない
 * - 空クエリは text をそのまま返す
 */
export function Highlight({
  text,
  query,
  className,
}: {
  text: string;
  query?: string;
  className?: string;
}) {
  const parts = useMemo(() => {
    const q = query?.trim();
    if (!q) return null;
    const re = new RegExp(`(${escapeRegExp(q)})`, "ig");
    return text.split(re);
  }, [text, query]);

  if (!parts) return <span className={className}>{text}</span>;

  const q = query!.trim().toLowerCase();
  return (
    <span className={className}>
      {parts.map((p, i) =>
        p.toLowerCase() === q ? (
          <mark
            key={i}
            className="rounded-[3px] bg-blue-100 px-0.5 font-medium text-blue-900 ring-1 ring-inset ring-blue-200/70"
          >
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </span>
  );
}
