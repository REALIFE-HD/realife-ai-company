import { DEPARTMENTS } from "@/data/departments";

// Donut chart — status distribution
function Donut() {
  const segments = [
    { label: "稼働中", value: 1, color: "#0071E3" },
    { label: "標準運用", value: 10, color: "#1D1D1F" },
    { label: "構築中", value: 1, color: "#D2D2D7" },
  ];
  const total = segments.reduce((a, b) => a + b.value, 0);
  const radius = 56;
  const circ = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <div className="flex items-center gap-7">
      <div className="relative">
        <svg viewBox="0 0 160 160" className="h-40 w-40 -rotate-90" aria-hidden="true">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="18" />
          {segments.map((s) => {
            const len = (s.value / total) * circ;
            const dash = `${len} ${circ - len}`;
            const el = (
              <circle
                key={s.label}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={s.color}
                strokeWidth="18"
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="num text-[1.75rem] font-semibold leading-none tracking-tight text-foreground">{total}</span>
          <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">部門</span>
        </div>
      </div>
      <ul className="space-y-2.5 text-[13px]">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} aria-hidden="true" />
            <span className="text-muted-foreground">{s.label}</span>
            <span className="num ml-auto pl-3 font-semibold text-foreground">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Bars — tasks per department (top 8)
function Bars() {
  const data = DEPARTMENTS.slice(0, 8).map((d) => ({
    name: d.name.replace("部", "").replace("室", "").slice(0, 4),
    value: d.tasks,
  }));
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div>
      <div className="flex h-44 items-end gap-3">
        {data.map((d) => {
          const h = (d.value / max) * 100;
          return (
            <div key={d.name} className="group flex flex-1 flex-col items-center gap-2">
              <div className="relative flex h-full w-full items-end">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-300 group-hover:from-blue-700 group-hover:to-blue-500"
                  style={{ height: `${h}%` }}
                  aria-label={`${d.name} ${d.value} タスク`}
                />
              </div>
              <span className="num text-[10px] font-medium text-muted-foreground transition-colors group-hover:text-foreground">{d.value}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-3">
        {data.map((d) => (
          <span key={d.name} className="flex-1 truncate text-center text-[10px] text-muted-foreground">
            {d.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-border/80 bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-semibold tracking-tight text-foreground">部門ステータス分布</h3>
          <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">12 Departments</span>
        </div>
        <div className="mt-6">
          <Donut />
        </div>
      </div>
      <div className="rounded-xl border border-border/80 bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-semibold tracking-tight text-foreground">部門別タスク負荷</h3>
          <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Top 8</span>
        </div>
        <div className="mt-6">
          <Bars />
        </div>
      </div>
    </div>
  );
}
