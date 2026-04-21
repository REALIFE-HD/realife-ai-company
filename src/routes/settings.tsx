import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, LogOut, Monitor, Moon, RefreshCw, Sun, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUserSettings } from "@/hooks/use-user-settings";
import { useAuth } from "@/hooks/use-auth";
import { useTheme, type ThemePreference } from "@/hooks/use-theme";
import {
  DATE_FORMAT_OPTIONS,
  DENSITY_OPTIONS,
  formatDate,
  useDisplayPrefs,
  type DateFormat,
  type Density,
} from "@/lib/display-prefs";
import { DEPARTMENTS } from "@/data/departments";
import type { UserSettings } from "@/lib/settings";
import {
  HISTORY_LIMIT_MAX,
  HISTORY_LIMIT_MIN,
  useSearchPrefs,
} from "@/lib/search-prefs";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "設定 — REALIFE Operations" },
      { name: "description", content: "アカウント・外観・検索・危険な操作の設定。" },
      { property: "og:title", content: "設定 — REALIFE Operations" },
      { property: "og:description", content: "アカウント・外観・検索・危険な操作の設定。" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  useRouteMountMark("/settings");
  const { settings: ctxSettings, loading, update } = useUserSettings();
  const { user, signOut } = useAuth();
  const { preference: themePref, setPreference: setThemePref } = useTheme();
  const [displayPrefs, updateDisplayPrefs] = useDisplayPrefs();
  const [searchPrefs, updateSearchPrefs] = useSearchPrefs();

  const [draftName, setDraftName] = useState<string | null>(null);
  const settings: UserSettings = {
    ...ctxSettings,
    display_name: draftName ?? ctxSettings.display_name,
  };

  const [draftLimit, setDraftLimit] = useState<string>(String(searchPrefs.historyLimit));
  useEffect(() => {
    setDraftLimit(String(searchPrefs.historyLimit));
  }, [searchPrefs.historyLimit]);

  const save = async (next: Partial<UserSettings>) => {
    try {
      await update(next);
      toast.success("設定を保存しました");
    } catch {
      toast.error("保存に失敗しました");
    }
  };

  const commitHistoryLimit = (raw: string) => {
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n)) {
      setDraftLimit(String(searchPrefs.historyLimit));
      return;
    }
    const clamped = Math.min(HISTORY_LIMIT_MAX, Math.max(HISTORY_LIMIT_MIN, n));
    if (clamped !== searchPrefs.historyLimit) {
      updateSearchPrefs({ historyLimit: clamped });
      toast.success(`検索履歴の最大件数を ${clamped} 件に変更しました`);
    }
    setDraftLimit(String(clamped));
  };

  const clearAllSearchHistory = () => {
    if (typeof window === "undefined") return;
    const keys: string[] = [];
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const k = window.sessionStorage.key(i);
      if (k && k.startsWith("realife:search-history:")) keys.push(k);
    }
    keys.forEach((k) => window.sessionStorage.removeItem(k));
    toast.success(`全画面の検索履歴を消去しました(${keys.length}件)`);
  };

  const resetLocalPrefs = () => {
    if (typeof window === "undefined") return;
    if (!window.confirm("外観・検索・表示のローカル設定を初期化します。よろしいですか?")) return;
    try {
      window.localStorage.removeItem("realife:theme");
      window.localStorage.removeItem("realife:display-prefs");
      window.localStorage.removeItem("realife:search-prefs");
    } catch {
      /* ignore */
    }
    setThemePref("system");
    updateDisplayPrefs({ density: "comfortable", dateFormat: "ja-long" });
    updateSearchPrefs({ historyLimit: 8 });
    toast.success("ローカル設定を初期化しました");
  };

  const onLogout = async () => {
    await signOut();
    toast.success("ログアウトしました");
  };

  const initials = (settings.display_name || user?.email?.split("@")[0] || "?")
    .trim()
    .slice(0, 2)
    .toUpperCase();

  const themeOptions: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
    { value: "light", label: "Light", Icon: Sun },
    { value: "dark", label: "Dark", Icon: Moon },
    { value: "system", label: "System", Icon: Monitor },
  ];

  return (
    <AppShell title="設定" subtitle="アカウント・外観・検索・危険な操作">
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> ダッシュボードへ戻る
          </Link>
        </div>

        {/* アカウント */}
        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">アカウント</h2>
          <p className="mt-1 text-[12px] text-muted-foreground">プロフィール情報は社内表示や指示の発信者として使用されます。</p>

          <div className="mt-6 flex items-start gap-4">
            <div
              aria-hidden="true"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border bg-blue-50 font-mono text-base font-semibold text-blue-700"
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-foreground">{settings.display_name || "未設定"}</p>
              <p className="truncate text-[12px] text-muted-foreground">{user?.email ?? "未ログイン"}</p>
              {settings.department && (
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">所属: {settings.department}</p>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="display_name">表示名</Label>
              <Input
                id="display_name"
                value={settings.display_name}
                disabled={loading}
                onChange={(e) => setDraftName(e.target.value)}
                onBlur={() => {
                  if (draftName !== null && draftName !== ctxSettings.display_name) {
                    save({ display_name: draftName });
                  }
                  setDraftName(null);
                }}
              />
              <p className="text-[11px] text-muted-foreground">指示の発信者として記録されます。</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="department">所属部門</Label>
              <select
                id="department"
                value={settings.department}
                disabled={loading}
                onChange={(e) => save({ department: e.target.value })}
                className="block h-9 w-full rounded-md border border-border bg-card px-2 text-[13px] text-muted-foreground focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">(未所属)</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.id} {d.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground">部門ヘッドとして表示されます。</p>
            </div>

            <div className="sm:col-span-2 flex items-center justify-between gap-4 rounded-md border border-border px-4 py-3">
              <div>
                <Label htmlFor="notifications" className="text-sm">通知</Label>
                <p className="mt-0.5 text-[11px] text-muted-foreground">指示・ステータス変更の通知を受け取る</p>
              </div>
              <Switch
                id="notifications"
                checked={settings.notifications}
                disabled={loading}
                onCheckedChange={(v) => save({ notifications: v })}
              />
            </div>
          </div>
        </section>

        {/* 外観 */}
        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">外観</h2>
          <p className="mt-1 text-[12px] text-muted-foreground">テーマ・密度・日付フォーマットを変更できます。</p>

          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label>テーマ</Label>
              <div className="inline-flex rounded-md border border-border bg-muted p-1">
                {themeOptions.map(({ value, label, Icon }) => {
                  const active = themePref === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setThemePref(value)}
                      aria-pressed={active}
                      className={`inline-flex items-center gap-1.5 rounded-sm px-3 py-1 text-[12px] font-medium transition-colors ${
                        active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      {label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground">
                System を選ぶと OS の外観設定(ライト/ダーク)に自動で追従します。ヘッダーのアイコンからもいつでも切替できます。
              </p>
            </div>

            <div className="space-y-2">
              <Label>表示密度</Label>
              <div className="grid gap-2 sm:grid-cols-2 max-w-md">
                {DENSITY_OPTIONS.map((opt) => {
                  const active = displayPrefs.density === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateDisplayPrefs({ density: opt.value as Density })}
                      aria-pressed={active}
                      className={`rounded-md border px-3 py-2 text-left transition-colors ${
                        active ? "border-blue-300 bg-blue-50/60" : "border-border bg-card hover:border-border"
                      }`}
                    >
                      <div className="text-[13px] font-medium text-foreground">{opt.label}</div>
                      <div className="text-[11px] text-muted-foreground">{opt.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_format">日付フォーマット</Label>
              <select
                id="date_format"
                value={displayPrefs.dateFormat}
                onChange={(e) => updateDisplayPrefs({ dateFormat: e.target.value as DateFormat })}
                className="block h-9 w-full max-w-md rounded-md border border-border bg-card px-2 text-[13px] text-muted-foreground focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {DATE_FORMAT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} — {opt.sample}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground">
                プレビュー: <span className="font-mono">{formatDate(new Date(), displayPrefs.dateFormat)}</span>
              </p>
            </div>
          </div>
        </section>

        {/* 検索 */}
        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">検索</h2>
          <div className="mt-6 space-y-6 max-w-md">
            <div className="space-y-1.5">
              <Label htmlFor="history_limit">検索履歴の最大件数</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="history_limit"
                  type="number"
                  inputMode="numeric"
                  min={HISTORY_LIMIT_MIN}
                  max={HISTORY_LIMIT_MAX}
                  step={1}
                  value={draftLimit}
                  onChange={(e) => setDraftLimit(e.target.value)}
                  onBlur={(e) => commitHistoryLimit(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitHistoryLimit((e.target as HTMLInputElement).value);
                    }
                  }}
                  className="w-24"
                />
                <span className="text-[12px] text-muted-foreground">
                  件({HISTORY_LIMIT_MIN}〜{HISTORY_LIMIT_MAX})
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                ヘッダー検索バーで保持する履歴の最大件数。<strong className="font-semibold text-muted-foreground">上限を超えると古い履歴から自動的に削除</strong>されます。
              </p>
            </div>
          </div>
        </section>

        {/* 危険な操作ゾーン */}
        <section className="rounded-2xl border border-red-200/70 bg-red-50/30 p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold tracking-tight text-red-900">危険な操作</h2>
          <p className="mt-1 text-[12px] text-red-800/80">これらの操作はすぐに反映され、元に戻せない場合があります。</p>

          <div className="mt-6 space-y-3">
            <DangerRow
              title="検索履歴を全画面で消去"
              description="ダッシュボード・部門・案件など、すべての画面の検索履歴をまとめて削除します。"
              actionLabel="履歴を消去"
              Icon={Trash2}
              onClick={clearAllSearchHistory}
            />
            <DangerRow
              title="ローカル設定を初期化"
              description="テーマ・表示密度・日付形式・検索履歴上限を初期値に戻します。アカウント情報は保持されます。"
              actionLabel="初期化"
              Icon={RefreshCw}
              onClick={resetLocalPrefs}
            />
            <DangerRow
              title="ログアウト"
              description="現在のセッションを終了します。"
              actionLabel="ログアウト"
              Icon={LogOut}
              onClick={onLogout}
            />
          </div>
        </section>
      </div>
      <Footer />
    </AppShell>
  );
}

function DangerRow({
  title,
  description,
  actionLabel,
  Icon,
  onClick,
}: {
  title: string;
  description: string;
  actionLabel: string;
  Icon: typeof LogOut;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-red-200/70 bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-[11.5px] text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-md border border-red-300 bg-card px-3 py-1.5 text-[12px] font-medium text-red-700 hover:bg-red-50 sm:self-auto"
      >
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {actionLabel}
      </button>
    </div>
  );
}
