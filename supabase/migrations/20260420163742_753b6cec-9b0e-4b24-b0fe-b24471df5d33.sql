
-- 1. profiles テーブル
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  department text NOT NULL DEFAULT '',
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view profiles"
  ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. サインアップ時の自動プロフィール作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. 既存テーブルのポリシーを「authenticated のみ」に置き換え
-- deals
DROP POLICY IF EXISTS "Anyone can view deals" ON public.deals;
DROP POLICY IF EXISTS "Anyone can create deals" ON public.deals;
DROP POLICY IF EXISTS "Anyone can update deals" ON public.deals;
DROP POLICY IF EXISTS "Anyone can delete deals" ON public.deals;
CREATE POLICY "Auth view deals" ON public.deals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert deals" ON public.deals FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update deals" ON public.deals FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth delete deals" ON public.deals FOR DELETE TO authenticated USING (true);

-- deal_activities
DROP POLICY IF EXISTS "Anyone can view deal activities" ON public.deal_activities;
DROP POLICY IF EXISTS "Anyone can create deal activities" ON public.deal_activities;
DROP POLICY IF EXISTS "Anyone can update deal activities" ON public.deal_activities;
DROP POLICY IF EXISTS "Anyone can delete deal activities" ON public.deal_activities;
CREATE POLICY "Auth view deal_activities" ON public.deal_activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert deal_activities" ON public.deal_activities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update deal_activities" ON public.deal_activities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth delete deal_activities" ON public.deal_activities FOR DELETE TO authenticated USING (true);

-- instructions
DROP POLICY IF EXISTS "Anyone can view instructions" ON public.instructions;
DROP POLICY IF EXISTS "Anyone can create instructions" ON public.instructions;
DROP POLICY IF EXISTS "Anyone can update instructions" ON public.instructions;
DROP POLICY IF EXISTS "Anyone can delete instructions" ON public.instructions;
CREATE POLICY "Auth view instructions" ON public.instructions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert instructions" ON public.instructions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update instructions" ON public.instructions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth delete instructions" ON public.instructions FOR DELETE TO authenticated USING (true);

-- inbox_messages
DROP POLICY IF EXISTS "Anyone can view inbox messages" ON public.inbox_messages;
DROP POLICY IF EXISTS "Anyone can create inbox messages" ON public.inbox_messages;
DROP POLICY IF EXISTS "Anyone can update inbox messages" ON public.inbox_messages;
DROP POLICY IF EXISTS "Anyone can delete inbox messages" ON public.inbox_messages;
CREATE POLICY "Auth view inbox_messages" ON public.inbox_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert inbox_messages" ON public.inbox_messages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update inbox_messages" ON public.inbox_messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth delete inbox_messages" ON public.inbox_messages FOR DELETE TO authenticated USING (true);

-- ai_chat_messages
DROP POLICY IF EXISTS "Anyone can view ai chat messages" ON public.ai_chat_messages;
DROP POLICY IF EXISTS "Anyone can create ai chat messages" ON public.ai_chat_messages;
DROP POLICY IF EXISTS "Anyone can delete ai chat messages" ON public.ai_chat_messages;
CREATE POLICY "Auth view ai_chat_messages" ON public.ai_chat_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert ai_chat_messages" ON public.ai_chat_messages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth delete ai_chat_messages" ON public.ai_chat_messages FOR DELETE TO authenticated USING (true);

-- user_settings (本人のみ)
DROP POLICY IF EXISTS "Anyone can view user settings" ON public.user_settings;
DROP POLICY IF EXISTS "Anyone can create user settings" ON public.user_settings;
DROP POLICY IF EXISTS "Anyone can update user settings" ON public.user_settings;
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE POLICY "Users view own settings" ON public.user_settings FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert own settings" ON public.user_settings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own settings" ON public.user_settings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- doc_sections / doc_faqs : 読み取りは公開のまま、書き込みは認証ユーザーのみ
DROP POLICY IF EXISTS "Anyone can create doc sections" ON public.doc_sections;
DROP POLICY IF EXISTS "Anyone can update doc sections" ON public.doc_sections;
DROP POLICY IF EXISTS "Anyone can delete doc sections" ON public.doc_sections;
CREATE POLICY "Auth insert doc_sections" ON public.doc_sections FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update doc_sections" ON public.doc_sections FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth delete doc_sections" ON public.doc_sections FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can create doc faqs" ON public.doc_faqs;
DROP POLICY IF EXISTS "Anyone can update doc faqs" ON public.doc_faqs;
DROP POLICY IF EXISTS "Anyone can delete doc faqs" ON public.doc_faqs;
CREATE POLICY "Auth insert doc_faqs" ON public.doc_faqs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update doc_faqs" ON public.doc_faqs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth delete doc_faqs" ON public.doc_faqs FOR DELETE TO authenticated USING (true);
