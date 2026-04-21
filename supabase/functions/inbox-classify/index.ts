import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const DEPARTMENTS = [
  { code: "01", name: "経営戦略室", role: "戦略立案・IPO準備・KPI管理" },
  { code: "02", name: "営業本部", role: "新規開拓・商談・受注" },
  { code: "03", name: "見積・積算部", role: "見積作成・原価計算" },
  { code: "04", name: "施工管理部", role: "現場監督・工程・品質管理" },
  { code: "05", name: "調達購買部", role: "協力会社発注・材料手配" },
  { code: "06", name: "マーケティング部", role: "LP・SNS・広告・ブランディング" },
  { code: "07", name: "CS顧客成功部", role: "アフターサポート・顧客満足" },
  { code: "08", name: "バックオフィス部", role: "経理・請求・入出金" },
  { code: "09", name: "法務コンプラ部", role: "契約書・規程・コンプライアンス" },
  { code: "10", name: "情報システム部", role: "クラウド・自動化・セキュリティ" },
  { code: "11", name: "人事組織開発部", role: "採用・労務・組織設計" },
  { code: "12", name: "新規事業開発室", role: "リベルテ・EC・新規事業" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { subject, body } = await req.json();
    if (typeof body !== "string") {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const subj = typeof subject === "string" ? subject : "";
    if (subj.length > 500 || body.length > 5000) {
      return new Response(JSON.stringify({ error: "Input too large" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const deptList = DEPARTMENTS.map((d) => `${d.code}: ${d.name} - ${d.role}`).join("\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "あなたは合同会社REALIFEのインボックス担当です。受信メッセージ(言われたこと/思ったことのメモ)を読み、(1)最適な部門を1つ選び、(2)25字以内の簡潔な件名を作成し、(3)次にやるべきアクションを1〜3件提案します。必ず classify_message ツールを呼び出して回答してください。",
          },
          {
            role: "user",
            content: `## 部門一覧\n${deptList}\n\n## 受信メッセージ\n${subj ? `件名(任意): ${subj}\n` : ""}本文:\n${body}\n\n上記を分類し、件名と次アクションを提案してください。`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "classify_message",
              description: "メッセージを分類し件名と次アクションを生成する",
              parameters: {
                type: "object",
                properties: {
                  department: {
                    type: "string",
                    enum: DEPARTMENTS.map((d) => d.code),
                    description: "部門コード(01〜12)",
                  },
                  confidence: {
                    type: "integer",
                    minimum: 0,
                    maximum: 100,
                    description: "信頼度(0-100)",
                  },
                  reason: {
                    type: "string",
                    description: "選定理由を日本語30字以内で",
                  },
                  title: {
                    type: "string",
                    description: "メッセージを表す件名(25字以内)",
                  },
                  suggestions: {
                    type: "array",
                    minItems: 1,
                    maxItems: 3,
                    description: "次アクション提案(1〜3件)",
                    items: {
                      type: "object",
                      properties: {
                        title: {
                          type: "string",
                          description: "アクション名(20字以内、動詞で始める)",
                        },
                        detail: {
                          type: "string",
                          description: "具体的な手順や担当を80字以内で",
                        },
                      },
                      required: ["title", "detail"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["department", "confidence", "reason", "title", "suggestions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "classify_message" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "レート制限。しばらくしてから再試行してください。" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "クレジット不足。Workspaceにクレジットを追加してください。" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const t = await response.text();
      console.error("AI gateway error", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const tc = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!tc) {
      return new Response(
        JSON.stringify({
          department: null,
          confidence: 0,
          reason: "AI応答なし",
          title: subj || body.slice(0, 25),
          suggestions: [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const args = JSON.parse(tc.function.arguments);
    return new Response(
      JSON.stringify({
        department: args.department,
        confidence: args.confidence ?? 0,
        reason: args.reason ?? "AI判定",
        title: args.title ?? (subj || body.slice(0, 25)),
        suggestions: Array.isArray(args.suggestions) ? args.suggestions : [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("inbox-classify error", e);
    return new Response(
      JSON.stringify({ error: "内部エラーが発生しました。" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
