import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "ログイン — REALIFE Operations" },
      { name: "description", content: "REALIFE Operations にログイン / 新規登録します。" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/" });
    }
  }, [user, loading, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("アカウントを作成しました");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("ログインしました");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "失敗しました";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-950 font-serif text-sm font-semibold text-white">
            RL
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-serif text-base font-semibold tracking-wide text-slate-900">REALIFE</span>
            <span className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-500">AI COMPANY</span>
          </span>
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="font-serif text-xl font-semibold text-slate-900">
            {mode === "signin" ? "ログイン" : "新規アカウント作成"}
          </h1>
          <p className="mt-1 text-[12.5px] text-slate-500">
            {mode === "signin" ? "社内アカウントでログインしてください。" : "新しい社員アカウントを作成します。"}
          </p>

          <form onSubmit={onSubmit} className="mt-5 space-y-3">
            {mode === "signup" && (
              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider text-slate-500">表示名</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="山田太郎"
                  className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            )}
            <div>
              <label className="text-[11px] font-medium uppercase tracking-wider text-slate-500">メールアドレス</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium uppercase tracking-wider text-slate-500">パスワード</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full rounded-md bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:bg-slate-300"
            >
              {submitting ? "処理中..." : mode === "signin" ? "ログイン" : "アカウント作成"}
            </button>
          </form>

          <div className="mt-4 text-center text-[12px] text-slate-600">
            {mode === "signin" ? (
              <>
                アカウントをお持ちでない場合は{" "}
                <button type="button" onClick={() => setMode("signup")} className="font-medium text-teal-700 hover:underline">
                  新規登録
                </button>
              </>
            ) : (
              <>
                既にアカウントをお持ちの場合は{" "}
                <button type="button" onClick={() => setMode("signin")} className="font-medium text-teal-700 hover:underline">
                  ログイン
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
