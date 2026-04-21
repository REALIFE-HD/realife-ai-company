import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUserSettings } from "@/hooks/use-user-settings";
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
      { name: "description", content: "表示名・通知・テーマの設定。" },
      { property: "og:title", content: "設定 — REALIFE Operations" },
      { property: "og:description", content: "表示名・通知・テーマの設定。" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { settings: ctxSettings, loading, update } = useUserSettings();
  const [draftName, setDraftName] = useState<string | null>(null);
  const settings: UserSettings = {
    ...ctxSettings,
    display_name: draftName ?? ctxSettings.display_name,
  };

  const [searchPrefs, updateSearchPrefs] = useSearchPrefs();
  const [draftLimit, setDraftLimit] = useState<string>(String(searchPrefs.historyLimit));

  const save = async (next: UserSettings) => {
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

  return (
    <AppShell title="設定" subtitle="表示名・通知・テーマ">
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-3.5 w-3.5" /> ダッシュボードへ戻る
          </Link>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold tracking-tight text-slate-900">アカウント</h2>
          <div className="mt-6 space-y-6 max-w-md">
            <div className="space-y-1.5">
              <Label htmlFor="display_name">表示名</Label>
              <Input
                id="display_name"
                value={settings.display_name}
                disabled={loading}
                onChange={(e) => setDraftName(e.target.value)}
                onBlur={() => {
                  if (draftName !== null && draftName !== ctxSettings.display_name) {
                    save({ ...ctxSettings, display_name: draftName });
                  }
                  setDraftName(null);
                }}
              />
              <p className="text-[11px] text-slate-500">指示の発信者として記録されます。</p>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-md border border-slate-200 px-4 py-3">
              <div>
                <Label htmlFor="notifications" className="text-sm">通知</Label>
                <p className="mt-0.5 text-[11px] text-slate-500">指示・ステータス変更の通知を受け取る</p>
              </div>
              <Switch
                id="notifications"
                checked={settings.notifications}
                disabled={loading}
                onCheckedChange={(v) => save({ ...settings, notifications: v })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>テーマ</Label>
              <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-1">
                <span className="rounded-sm bg-white px-3 py-1 text-[12px] font-medium text-slate-900 shadow-sm">Light</span>
                <span className="px-3 py-1 text-[12px] font-medium text-slate-400">Dark(準備中)</span>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold tracking-tight text-slate-900">検索</h2>
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
                <span className="text-[12px] text-slate-500">
                  件（{HISTORY_LIMIT_MIN}〜{HISTORY_LIMIT_MAX}）
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                ヘッダー検索バーで保持する履歴の最大件数。古い履歴は自動的に削除されます。
              </p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </AppShell>
  );
}
