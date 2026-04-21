import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

/**
 * ヘッダー用テーマ切替ボタン。
 * 現在のテーマをアイコン + テキストラベルで明示し、クリックで反転する。
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  const currentLabel = isDark ? "ダーク" : "ライト";
  const actionLabel = isDark ? "ライトモードに切替" : "ダークモードに切替";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={actionLabel}
      title={`${actionLabel}(現在: ${currentLabel})`}
      aria-pressed={isDark}
      className={`relative inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-muted-foreground transition-colors hover:border-border hover:text-foreground ${className}`}
    >
      {isDark ? (
        <Moon className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Sun className="h-4 w-4" aria-hidden="true" />
      )}
      <span
        aria-live="polite"
        className="text-[12px] font-medium tracking-tight text-foreground"
      >
        {currentLabel}
      </span>
      <span className="sr-only">{actionLabel}</span>
    </button>
  );
}
