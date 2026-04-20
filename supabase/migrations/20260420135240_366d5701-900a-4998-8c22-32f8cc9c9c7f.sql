-- Enum for deal stages
CREATE TYPE public.deal_stage AS ENUM ('見積中', '提案中', '見積提出', '受注', '失注');

-- Deals table
CREATE TABLE public.deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  client text NOT NULL,
  title text NOT NULL,
  amount bigint NOT NULL DEFAULT 0,
  stage public.deal_stage NOT NULL DEFAULT '見積中',
  probability integer NOT NULL DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  owner text NOT NULL DEFAULT '',
  next_action text NOT NULL DEFAULT '',
  due date,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view deals" ON public.deals FOR SELECT USING (true);
CREATE POLICY "Anyone can create deals" ON public.deals FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update deals" ON public.deals FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete deals" ON public.deals FOR DELETE USING (true);

CREATE TRIGGER deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Activities (memo / log) per deal
CREATE TYPE public.deal_activity_kind AS ENUM ('メモ', '電話', '訪問', 'メール', 'その他');

CREATE TABLE public.deal_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  kind public.deal_activity_kind NOT NULL DEFAULT 'メモ',
  content text NOT NULL,
  created_by text NOT NULL DEFAULT '外山滉樹',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.deal_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view deal activities" ON public.deal_activities FOR SELECT USING (true);
CREATE POLICY "Anyone can create deal activities" ON public.deal_activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update deal activities" ON public.deal_activities FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete deal activities" ON public.deal_activities FOR DELETE USING (true);

CREATE INDEX idx_deal_activities_deal_id ON public.deal_activities(deal_id, created_at DESC);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.deals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deal_activities;

-- Seed initial deals
INSERT INTO public.deals (code, client, title, amount, stage, probability, owner, next_action, due) VALUES
('D-2604', '株式会社サンプル', 'オフィス内装リフォーム A棟', 4820000, '見積提出', 60, '営業本部 佐藤', '見積FB待ち', '2026-04-25'),
('D-2598', '合同会社ライト', '店舗改装 一式', 2140000, '受注', 100, '営業本部 田中', '発注準備', '2026-04-22'),
('D-2601', '株式会社マルチ', '共用部リノベ', 1680000, '提案中', 40, '営業本部 鈴木', '提案書作成', '2026-04-28'),
('D-2605', '個人 山田様', '戸建リフォーム', 3250000, '見積中', 30, '営業本部 佐藤', '現地調査', '2026-04-30'),
('D-2607', '株式会社FK', '事務所原状回復', 980000, '受注', 100, '営業本部 田中', '施工管理引継', '2026-04-21'),
('D-2610', '株式会社グリーン', '新築事務所インテリア', 6400000, '提案中', 50, '営業本部 鈴木', 'コンセプト提案', '2026-05-02'),
('D-2612', '個人 佐々木様', 'キッチン全面改装', 1820000, '見積提出', 70, '営業本部 佐藤', '回答待ち', '2026-04-26'),
('D-2615', '株式会社オーロラ', '本社受付改装', 2950000, '見積中', 35, '営業本部 田中', '原価精査', '2026-05-01'),
('D-2617', '個人 中村様', '浴室リフォーム', 780000, '失注', 0, '営業本部 鈴木', '—', '2026-04-19'),
('D-2620', '株式会社ベルガモ', '店舗什器一式', 1360000, '受注', 100, '営業本部 佐藤', '発注', '2026-04-23');