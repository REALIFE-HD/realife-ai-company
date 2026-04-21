import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { STAGES, STAGE_STYLE, updateDeal, type Deal, type DealStage } from "@/lib/deals";
import { Money } from "@/components/ui/money";

type Props = {
  deals: Deal[];
  onDealsChange: (deals: Deal[]) => void;
};

export function KanbanBoard({ deals, onDealsChange }: Props) {
  // ドラッグ中の案件 id
  const draggingId = useRef<string | null>(null);
  // ドロップ先ステージのハイライト
  const [overStage, setOverStage] = useState<DealStage | null>(null);

  const byStage = (stage: DealStage) => deals.filter((d) => d.stage === stage);

  const onDragStart = (e: React.DragEvent, id: string) => {
    draggingId.current = id;
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent, stage: DealStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverStage(stage);
  };

  const onDragLeave = () => setOverStage(null);

  const onDrop = async (e: React.DragEvent, stage: DealStage) => {
    e.preventDefault();
    setOverStage(null);
    const id = draggingId.current;
    draggingId.current = null;
    if (!id) return;
    const deal = deals.find((d) => d.id === id);
    if (!deal || deal.stage === stage) return;

    // Optimistic update
    const next = deals.map((d) => (d.id === id ? { ...d, stage } : d));
    onDealsChange(next);

    try {
      await updateDeal(id, { stage });
    } catch (err) {
      console.error(err);
      // Rollback
      onDealsChange(deals);
    }
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {STAGES.map((stage) => {
        const cards = byStage(stage);
        const isOver = overStage === stage;
        return (
          <div
            key={stage}
            onDragOver={(e) => onDragOver(e, stage)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, stage)}
            className={`flex min-h-[24rem] w-56 flex-none flex-col rounded-2xl border transition-colors ${
              isOver ? "border-blue-400 bg-blue-50/60" : "border-border bg-muted/40"
            }`}
          >
            {/* カラムヘッダー */}
            <div className="flex items-center justify-between px-3 py-2.5">
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${STAGE_STYLE[stage]}`}
              >
                {stage}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">{cards.length}</span>
            </div>

            {/* カード一覧 */}
            <div className="flex flex-1 flex-col gap-2 px-2 pb-3">
              {cards.map((d) => (
                <DealCard key={d.id} deal={d} onDragStart={onDragStart} />
              ))}
              {cards.length === 0 && (
                <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border py-6 text-[11px] text-muted-foreground">
                  案件なし
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DealCard({
  deal,
  onDragStart,
}: {
  deal: Deal;
  onDragStart: (e: React.DragEvent, id: string) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, deal.id)}
      className="cursor-grab rounded-xl border border-border bg-card px-3 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-md active:cursor-grabbing"
    >
      <Link to="/deals/$dealCode" params={{ dealCode: deal.code }}>
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{deal.code}</p>
        <p className="mt-0.5 line-clamp-2 text-[12px] font-medium text-foreground">{deal.title}</p>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{deal.client}</p>
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-foreground">
          <Money amount={deal.amount} />
        </span>
        <span className="text-[11px] text-muted-foreground">{deal.probability}%</span>
      </div>
      {deal.owner && (
        <p className="mt-1 truncate text-[10px] text-muted-foreground">👤 {deal.owner}</p>
      )}
      {deal.due && (
        <p className="mt-0.5 text-[10px] text-muted-foreground">📅 {deal.due}</p>
      )}
    </div>
  );
}
