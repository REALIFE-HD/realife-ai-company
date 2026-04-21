import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { AppShell } from "@/components/layout/AppShell";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "AIチャット — REALIFE Operations" },
      { name: "description", content: "Lovable AI 経由の業務支援チャット。" },
      { property: "og:title", content: "AIチャット — REALIFE Operations" },
      { property: "og:description", content: "Lovable AI 経由の業務支援チャット。" },
    ],
  }),
  component: AiPage,
});

type Msg = { id: string; role: "user" | "assistant"; content: string; created_at: string };

const GREETING: Msg = {
  id: "greeting",
  role: "assistant",
  content:
    "こんにちは。**REALIFE 業務支援AI**です。指示出し・見積・発注など、各部門の業務についてお気軽にお伝えください。",
  created_at: new Date().toISOString(),
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

function AiPage() {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load history from DB
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("ai_chat_messages")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) {
        console.error(error);
        toast.error("履歴の読み込みに失敗しました");
      } else if (data && data.length > 0) {
        setMessages([
          GREETING,
          ...data.map((r) => ({
            id: r.id,
            role: r.role as "user" | "assistant",
            content: r.content,
            created_at: r.created_at,
          })),
        ]);
      }
      setHistoryLoaded(true);
    })();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const clearHistory = async () => {
    if (!confirm("チャット履歴をすべて削除しますか?")) return;
    const { error } = await supabase
      .from("ai_chat_messages")
      .delete()
      .gte("created_at", "1970-01-01");
    if (error) {
      toast.error("履歴の削除に失敗しました");
      return;
    }
    setMessages([GREETING]);
    toast.success("履歴を削除しました");
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    setIsLoading(true);

    // Optimistic user message
    const userMsg: Msg = {
      id: `tmp-u-${Date.now()}`,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Persist user message (RLS requires user_id = auth.uid())
    if (user) {
      supabase
        .from("ai_chat_messages")
        .insert({ role: "user", content: text, user_id: user.id })
        .then(({ error }) => {
          if (error) console.error("persist user msg failed:", error);
        });
    }

    // Build payload: only user/assistant turns from current state (skip greeting which has id=greeting)
    const history = [...messages, userMsg]
      .filter((m) => m.id !== "greeting")
      .map((m) => ({ role: m.role, content: m.content }));

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last.id.startsWith("tmp-a-")) {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m,
          );
        }
        return [
          ...prev,
          {
            id: `tmp-a-${Date.now()}`,
            role: "assistant",
            content: assistantSoFar,
            created_at: new Date().toISOString(),
          },
        ];
      });
    };

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        toast.error("ログインが必要です");
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
        setIsLoading(false);
        return;
      }
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ messages: history }),
      });

      if (!resp.ok) {
        if (resp.status === 429) {
          toast.error("リクエストが多すぎます。少し時間をおいて再度お試しください。");
        } else if (resp.status === 402) {
          toast.error("AI 利用クレジットが不足しています。ワークスペース設定で追加してください。");
        } else {
          toast.error("AI 応答に失敗しました");
        }
        // remove optimistic user message
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
        setIsLoading(false);
        return;
      }
      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            /* ignore */
          }
        }
      }

      // Persist assistant message
      if (assistantSoFar && user) {
        const { error } = await supabase
          .from("ai_chat_messages")
          .insert({ role: "assistant", content: assistantSoFar, user_id: user.id });
        if (error) console.error("persist assistant msg failed:", error);
      }
    } catch (err) {
      console.error(err);
      toast.error("通信エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell title="AIチャット" subtitle="Lovable AI 経由 ・ 業務支援">
      <div className="flex h-[calc(100vh-4rem)] flex-col px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> ダッシュボードへ戻る
          </Link>
          {messages.length > 1 && (
            <button
              type="button"
              onClick={clearHistory}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:border-slate-400 hover:text-foreground"
            >
              <Trash2 className="h-3 w-3" /> 履歴を削除
            </button>
          )}
        </div>

        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card">
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-6">
            {!historyLoaded && (
              <p className="text-center text-xs text-muted-foreground">履歴を読み込み中...</p>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-blue-600 text-white"
                      : "border border-border bg-muted text-muted-foreground"
                  }`}
                >
                  {m.role === "assistant" && (
                    <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-blue-700">
                      <Sparkles className="h-3 w-3" /> REALIFE AI
                    </div>
                  )}
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-headings:mt-3 prose-headings:mb-1.5 prose-pre:my-2 prose-code:text-[12px]">
                      <ReactMarkdown>{m.content || "..."}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-border bg-muted px-4 py-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-blue-700">
                    <Sparkles className="h-3 w-3 animate-pulse" /> 思考中...
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={send} className="border-t border-border bg-card p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(e);
                  }
                }}
                placeholder="指示・質問を入力(Enter送信、Shift+Enter改行)"
                rows={2}
                disabled={isLoading}
                className="flex-1 resize-none rounded-md border border-border bg-muted px-3 py-2 text-sm focus:border-blue-500 focus:bg-card focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="inline-flex h-10 items-center gap-1.5 rounded-md bg-blue-600 px-4 text-[13px] font-medium text-white hover:bg-blue-700 disabled:bg-slate-300"
              >
                <Send className="h-3.5 w-3.5" /> {isLoading ? "送信中" : "送信"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </AppShell>
  );
}
