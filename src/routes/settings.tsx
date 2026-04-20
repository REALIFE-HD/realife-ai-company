import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DEFAULT_SETTINGS,
  loadUserSettings,
  saveUserSettings,
  type UserSettings,
} from "@/lib/settings";

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
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserSettings()
      .then(setSettings)
      .catch(() => toast.error("設定の読み込みに失敗しました"))
      .finally(() => setLoading(false));
  }, []);

  const save = async (next: UserSettings) => {
    setSettings(next);
    try {
      await saveUserSettings(next);
      toast.success("設定を保存しました");
    } catch {
      toast.error("保存に失敗しました");
    }
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
          <h2 className="font-serif text-xl font-semibold tracking-tight text-slate-900">アカウント</h2>
          <div className="mt-6 space-y-6 max-w-md">
            <div className="space-y-1.5">
              <Label htmlFor="display_name">表示名</Label>
              <Input
                id="display_name"
                value={settings.display_name}
                disabled={loading}
                onChange={(e) => setSettings({ ...settings, display_name: e.target.value })}
                onBlur={() => save(settings)}
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
      </div>
      <Footer />
    </AppShell>
  );
}
