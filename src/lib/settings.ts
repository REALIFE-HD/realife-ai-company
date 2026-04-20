import { supabase } from "@/integrations/supabase/client";

export type UserSettings = {
  display_name: string;
  notifications: boolean;
  theme: "light" | "dark";
};

export const DEFAULT_SETTINGS: UserSettings = {
  display_name: "外山滉樹",
  notifications: true,
  theme: "light",
};

const SETTINGS_KEY = "default";

export async function loadUserSettings(): Promise<UserSettings> {
  const { data, error } = await supabase
    .from("user_settings")
    .select("display_name, notifications, theme")
    .eq("key", SETTINGS_KEY)
    .maybeSingle();
  if (error) throw error;
  if (!data) return DEFAULT_SETTINGS;
  return {
    display_name: data.display_name,
    notifications: data.notifications,
    theme: (data.theme as "light" | "dark") ?? "light",
  };
}

export async function saveUserSettings(patch: Partial<UserSettings>): Promise<void> {
  const { error } = await supabase
    .from("user_settings")
    .update(patch)
    .eq("key", SETTINGS_KEY);
  if (error) throw error;
}
