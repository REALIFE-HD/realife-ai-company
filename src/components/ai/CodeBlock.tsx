import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

type Props = {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
};

/**
 * react-markdown 用カスタム code レンダラ。
 * - インラインコードはそのまま
 * - コードブロックは言語ラベル + コピー ボタン付き
 */
export function CodeBlock({ inline, className, children, ...rest }: Props) {
  const [copied, setCopied] = useState(false);

  if (inline) {
    return (
      <code className={className} {...rest}>
        {children}
      </code>
    );
  }

  const match = /language-(\w+)/.exec(className ?? "");
  const lang = match?.[1] ?? "text";
  const text = String(children ?? "").replace(/\n$/, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("コピーしました");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("コピーに失敗しました");
    }
  };

  return (
    <div className="not-prose my-2 overflow-hidden rounded-md border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border bg-muted px-3 py-1.5">
        <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {lang}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-background hover:text-foreground"
          aria-label="コードをコピー"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "コピー済み" : "コピー"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-[12px] leading-relaxed text-foreground">
        <code className={className}>{text}</code>
      </pre>
    </div>
  );
}
