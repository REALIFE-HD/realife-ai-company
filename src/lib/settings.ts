import { supabase } from "@/integrations/supabase/client";

export type UserSettings = {
  display_name: string;
  department: string;
  notifications: boolean;
  theme: "light" | "dark";
};

export const DEFAULT_SETTINGS: UserSettings = {
  display_name: "",
  department: "",
  notifications: true,
  theme: "dark",
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
    .select("display_name, department")
    .eq("id", userId)
    .maybeSingle();

  const { data: settings } = await supabase
    .from("user_settings")
    .select("display_name, notifications, theme")
    .eq("user_id", userId)
    .maybeSingle();

  return {
    display_name: profile?.display_name || settings?.display_name || "",
    department: profile?.department || "",
    notifications: settings?.notifications ?? true,
    theme: (settings?.theme as "light" | "dark") ?? "dark",
  };
}

export async function saveUserSettings(patch: Partial<UserSettings>): Promise<void> {
  const userId = await getUserId();
  if (!userId) throw new Error("Not authenticated");

  // sync display_name / department to profiles
  const profilePatch: { display_name?: string; department?: string } = {};
  if (patch.display_name !== undefined) profilePatch.display_name = patch.display_name;
  if (patch.department !== undefined) profilePatch.department = patch.department;
  if (Object.keys(profilePatch).length > 0) {
    await supabase.from("profiles").update(profilePatch).eq("id", userId);
  }

  // upsert user_settings
  const { data: existing } = await supabase
    .from("user_settings")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    const settingsPatch: { display_name?: string; notifications?: boolean; theme?: string } = {};
    if (patch.display_name !== undefined) settingsPatch.display_name = patch.display_name;
    if (patch.notifications !== undefined) settingsPatch.notifications = patch.notifications;
    if (patch.theme !== undefined) settingsPatch.theme = patch.theme;
    if (Object.keys(settingsPatch).length > 0) {
      const { error } = await supabase
        .from("user_settings")
        .update(settingsPatch)
        .eq("user_id", userId);
      if (error) throw error;
    }
  } else {
    const { error } = await supabase.from("user_settings").insert({
      user_id: userId,
      key: userId,
      display_name: patch.display_name ?? "",
      notifications: patch.notifications ?? true,
      theme: patch.theme ?? "dark",
    });
    if (error) throw error;
  }
}
