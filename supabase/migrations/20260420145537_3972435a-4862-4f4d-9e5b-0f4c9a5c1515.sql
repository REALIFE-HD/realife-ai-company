-- インボックスメッセージ用enum
CREATE TYPE public.inbox_status AS ENUM ('unassigned', 'assigned', 'archived');
CREATE TYPE public.inbox_route_method AS ENUM ('rule', 'ai', 'manual', 'pending');

CREATE TABLE public.inbox_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  body text NOT NULL DEFAULT '',
  sender text NOT NULL DEFAULT '',
  status public.inbox_status NOT NULL DEFAULT 'unassigned',
  assigned_department text,
  route_method public.inbox_route_method NOT NULL DEFAULT 'pending',
  route_confidence integer NOT NULL DEFAULT 0,
  route_reason text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.inbox_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view inbox messages" ON public.inbox_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can create inbox messages" ON public.inbox_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update inbox messages" ON public.inbox_messages FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete inbox messages" ON public.inbox_messages FOR DELETE USING (true);

CREATE TRIGGER inbox_messages_updated
BEFORE UPDATE ON public.inbox_messages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_inbox_status ON public.inbox_messages(status);
CREATE INDEX idx_inbox_dept ON public.inbox_messages(assigned_department);

ALTER PUBLICATION supabase_realtime ADD TABLE public.inbox_messages;