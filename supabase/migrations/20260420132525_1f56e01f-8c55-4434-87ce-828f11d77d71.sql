
CREATE TABLE public.ai_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_chat_messages_created_at ON public.ai_chat_messages(created_at ASC);

ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ai chat messages"
  ON public.ai_chat_messages FOR SELECT USING (true);

CREATE POLICY "Anyone can create ai chat messages"
  ON public.ai_chat_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can delete ai chat messages"
  ON public.ai_chat_messages FOR DELETE USING (true);
