-- Wipe existing rows (no owner info to migrate)
DELETE FROM public.ai_chat_messages;

-- Add owner column
ALTER TABLE public.ai_chat_messages
  ADD COLUMN user_id uuid NOT NULL;

CREATE INDEX idx_ai_chat_messages_user_id_created_at
  ON public.ai_chat_messages (user_id, created_at);

-- Replace permissive policies with owner-scoped ones
DROP POLICY IF EXISTS "Auth view ai_chat_messages" ON public.ai_chat_messages;
DROP POLICY IF EXISTS "Auth insert ai_chat_messages" ON public.ai_chat_messages;
DROP POLICY IF EXISTS "Auth delete ai_chat_messages" ON public.ai_chat_messages;

CREATE POLICY "Users view own ai_chat_messages"
  ON public.ai_chat_messages
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own ai_chat_messages"
  ON public.ai_chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own ai_chat_messages"
  ON public.ai_chat_messages
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);