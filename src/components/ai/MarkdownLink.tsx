import { ExternalLink } from "lucide-react";

type Props = {
  href?: string;
  children?: React.ReactNode;
};

/**
 * react-markdown 用カスタム a レンダラ。
 * - 外部リンクは target="_blank" / rel="noopener noreferrer" を自動付与
 * - 下線スタイルを統一(ライト/ダーク両対応)
 * - 外部リンクには小アイコンを表示
 */
export function MarkdownLink({ href, children, ...rest }: Props) {
  const url = href ?? "";
  const isExternal =
    /^https?:\/\//i.test(url) &&
    (typeof window === "undefined" || !url.startsWith(window.location.origin));

  const className =
    "font-medium text-blue-700 underline decoration-blue-700/40 underline-offset-2 hover:decoration-blue-700 dark:text-blue-300 dark:decoration-blue-300/40 dark:hover:decoration-blue-300";

  if (isExternal) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${className} inline-flex items-center gap-0.5`}
        {...rest}
      >
        {children}
        <ExternalLink className="h-3 w-3" aria-hidden />
        <span className="sr-only"> (新しいタブで開く)</span>
      </a>
    );
  }

  return (
    <a href={url} className={className} {...rest}>
      {children}
    </a>
  );
}
