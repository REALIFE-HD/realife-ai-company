CREATE TABLE public.user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  display_name text NOT NULL DEFAULT '外山滉樹',
  notifications boolean NOT NULL DEFAULT true,
  theme text NOT NULL DEFAULT 'light',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view user settings" ON public.user_settings FOR SELECT USING (true);
CREATE POLICY "Anyone can create user settings" ON public.user_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update user settings" ON public.user_settings FOR UPDATE USING (true);

CREATE TRIGGER trg_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.user_settings (key, display_name, notifications, theme)
VALUES ('default', '外山滉樹', true, 'light');