import { formatAmount } from "@/lib/deals";
import { cn } from "@/lib/utils";

type MoneyProps = {
  amount: number;
  compact?: boolean;
  className?: string;
};

/**
 * 金額表示の統一コンポーネント。
 * - ¥記号 + カンマ区切り(ja-JP)
 * - Inter + tabular-nums (font-mono クラス経由)
 * - compact=true で「億 / 万 / K」略記
 */
export function Money({ amount, compact, className }: MoneyProps) {
  return (
    <span className={cn("font-mono tabular", className)}>
      {formatAmount(amount, { compact })}
    </span>
  );
}
