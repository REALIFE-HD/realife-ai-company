
-- Create instructions table for cross-device sync
CREATE TYPE public.instruction_status AS ENUM ('open', 'in_progress', 'completed');

CREATE TABLE public.instructions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department_code TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL DEFAULT '外山滉樹',
  status public.instruction_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_instructions_department_code ON public.instructions(department_code);
CREATE INDEX idx_instructions_created_at ON public.instructions(created_at DESC);

ALTER TABLE public.instructions ENABLE ROW LEVEL SECURITY;

-- App has no authentication yet — internal company tool. Allow anonymous full access.
CREATE POLICY "Anyone can view instructions"
  ON public.instructions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create instructions"
  ON public.instructions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update instructions"
  ON public.instructions FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete instructions"
  ON public.instructions FOR DELETE
  USING (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_instructions_updated_at
  BEFORE UPDATE ON public.instructions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for cross-device sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.instructions;
ALTER TABLE public.instructions REPLICA IDENTITY FULL;
