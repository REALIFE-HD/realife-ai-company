import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Footer } from "@/components/layout/Footer";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "AIチャット — REALIFE Operations" },
      { name: "description", content: "Cowork 連携の業務支援チャット(準備中)。" },
      { property: "og:title", content: "AIチャット — REALIFE Operations" },
      { property: "og:description", content: "Cowork 連携の業務支援チャット。" },
    ],
  }),
  component: AiPage,
});

type Msg = { id: string; role: "user" | "ai"; text: string; ts: string };

function AiPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "m0",
      role: "ai",
      text: "こんにちは。REALIFE 業務支援AIです。指示出し・見積・発注など、各部門の業務をお気軽にお伝えください。",
      ts: new Date().toISOString(),
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg: Msg = { id: `u${Date.now()}`, role: "user", text: input.trim(), ts: new Date().toISOString() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: `a${Date.now()}`,
          role: "ai",
          text: "AIチャット機能は準備中です。",
          ts: new Date().toISOString(),
        },
      ]);
    }, 400);
  };

  return (
    <AppShell title="AIチャット" subtitle="Cowork 連携 ・ 準備中">
      <div className="flex h-[calc(100vh-4rem)] flex-col px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-4">
          <Link to="/" className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-3.5 w-3.5" /> ダッシュボードへ戻る
          </Link>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-6">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-teal-600 text-white"
                    : "border border-slate-200 bg-slate-50 text-slate-800"
                }`}>
                  {m.role === "ai" && (
                    <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-teal-700">
                      <Sparkles className="h-3 w-3" /> REALIFE AI
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={send} className="border-t border-slate-200 bg-white p-3">
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
                className="flex-1 resize-none rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="inline-flex h-10 items-center gap-1.5 rounded-md bg-teal-600 px-4 text-[13px] font-medium text-white hover:bg-teal-700 disabled:bg-slate-300"
              >
                <Send className="h-3.5 w-3.5" /> 送信
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </AppShell>
  );
}
