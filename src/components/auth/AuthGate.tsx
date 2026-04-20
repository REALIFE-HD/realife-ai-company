import { useEffect, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

/**
 * 全アプリのガード。未認証なら /auth へリダイレクト。
 * /auth ページではガードを無効化する。
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAuthRoute = pathname === "/auth";

  useEffect(() => {
    if (!loading && !user && !isAuthRoute) {
      navigate({ to: "/auth" });
    }
  }, [user, loading, isAuthRoute, navigate]);

  if (isAuthRoute) return <>{children}</>;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50/70">
        <p className="text-sm text-slate-500">読み込み中...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50/70">
        <p className="text-sm text-slate-500">ログインページへ移動しています...</p>
      </div>
    );
  }

  return <>{children}</>;
}
