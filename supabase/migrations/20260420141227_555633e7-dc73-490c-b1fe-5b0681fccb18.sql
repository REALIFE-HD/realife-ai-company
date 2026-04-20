-- ドキュメントセクション
CREATE TABLE public.doc_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  icon text NOT NULL DEFAULT 'BookOpen',
  title text NOT NULL,
  lead text NOT NULL DEFAULT '',
  body text[] NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.doc_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view doc sections" ON public.doc_sections FOR SELECT USING (true);
CREATE POLICY "Anyone can create doc sections" ON public.doc_sections FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update doc sections" ON public.doc_sections FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete doc sections" ON public.doc_sections FOR DELETE USING (true);

CREATE TRIGGER trg_doc_sections_updated_at
BEFORE UPDATE ON public.doc_sections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- FAQ
CREATE TABLE public.doc_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.doc_faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view doc faqs" ON public.doc_faqs FOR SELECT USING (true);
CREATE POLICY "Anyone can create doc faqs" ON public.doc_faqs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update doc faqs" ON public.doc_faqs FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete doc faqs" ON public.doc_faqs FOR DELETE USING (true);

CREATE TRIGGER trg_doc_faqs_updated_at
BEFORE UPDATE ON public.doc_faqs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 初期シード
INSERT INTO public.doc_sections (slug, icon, title, lead, body, sort_order) VALUES
('getting-started', 'Compass', 'はじめに', 'REALIFE Operations は、合同会社REALIFEの12仮想部門を一望し、業務指示を横断的に動かすためのオペレーションシステムです。',
 ARRAY['ダッシュボード(/)では今月の成約・進行中案件・見積・稼働メンバーなど主要KPIを確認できます。','部門一覧(/departments)から各部門の詳細ページへ移動し、KPI・タスク・案件・指示履歴にアクセスします。'], 1),
('dashboard', 'LayoutGrid', 'ダッシュボードの読み方', '上部のKPIカードと部門ステータス分布で、組織全体の状態を瞬時に把握します。',
 ARRAY['KPIカードは前月比トレンド付きで、進捗の良し悪しをひと目で確認できます。','「部門ステータス分布」では稼働中・構築中・標準運用の構成比をグラフで表示します。','「すべての部門を、一望する。」セクションから、各部門カードへ直接遷移できます。'], 2),
('departments', 'Workflow', '部門と指示出し', '各部門詳細ページで、KPI・タスク・案件・指示履歴の4タブを切り替えて状況を確認します。',
 ARRAY['右上の「新規指示」ボタンから、タイトルと内容を入力して指示を発行できます。','発行した指示は「指示履歴」タブに即時反映され、From フィールドで担当者を確認できます。','関連部門カードから、横断的に他部門の状況へジャンプできます。'], 3),
('ai-chat', 'MessageSquare', 'AIチャット連携', 'サイドバーの「AIチャット」から、Coworkプロジェクトと連携した業務支援チャットを呼び出せます。',
 ARRAY['見積・発注・採用・経理など、各部門の業務を自然言語で指示できます。','チャットからの指示は対象部門の指示履歴へ自動的に記録されます(今後対応予定)。'], 4);

INSERT INTO public.doc_faqs (question, answer, sort_order) VALUES
('部門の追加・編集はどこで行えますか?', '現在のバージョンでは部門マスタは src/data/departments.ts に定義されています。今後の管理画面リリースで、UI からの編集に対応予定です。', 1),
('指示は永続化されますか?', '指示は Lovable Cloud のデータベースに保存され、リロード後も保持されます。', 2),
('モバイルから操作できますか?', 'はい。サイドバーは左上のメニューアイコンからドロワーで開閉でき、すべての画面がレスポンシブ対応しています。', 3);