import { supabase } from "@/integrations/supabase/client";

export type UserSettings = {
  display_name: string;
  notifications: boolean;
  theme: "light" | "dark";
};

export const DEFAULT_SETTINGS: UserSettings = {
  display_name: "",
  notifications: true,
  theme: "light",
};

async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function loadUserSettings(): Promise<UserSettings> {
  const userId = await getUserId();
  if (!userId) return DEFAULT_SETTINGS;

  // try profiles first for display_name
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .maybeSingle();

  const { data: settings } = await supabase
    .from("user_settings")
    .select("display_name, notifications, theme")
    .eq("user_id", userId)
    .maybeSingle();

  return {
    display_name: profile?.display_name || settings?.display_name || "",
    notifications: settings?.notifications ?? true,
    theme: (settings?.theme as "light" | "dark") ?? "light",
  };
}

export async function saveUserSettings(patch: Partial<UserSettings>): Promise<void> {
  const userId = await getUserId();
  if (!userId) throw new Error("Not authenticated");

  // sync display_name to profiles
  if (patch.display_name !== undefined) {
    await supabase.from("profiles").update({ display_name: patch.display_name }).eq("id", userId);
  }

  // upsert user_settings
  const { data: existing } = await supabase
    .from("user_settings")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("user_settings")
      .update(patch)
      .eq("user_id", userId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("user_settings").insert({
      user_id: userId,
      key: userId,
      display_name: patch.display_name ?? "",
      notifications: patch.notifications ?? true,
      theme: patch.theme ?? "light",
    });
    if (error) throw error;
  }
}
