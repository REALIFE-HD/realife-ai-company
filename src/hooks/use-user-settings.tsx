import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import {
  DEFAULT_SETTINGS,
  loadUserSettings,
  saveUserSettings,
  type UserSettings,
} from "@/lib/settings";

type Ctx = {
  settings: UserSettings;
  loading: boolean;
  update: (patch: Partial<UserSettings>) => Promise<void>;
  refresh: () => Promise<void>;
};

const UserSettingsContext = createContext<Ctx | null>(null);

export function UserSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const s = await loadUserSettings();
      setSettings(s);
    } catch (e) {
      console.error("[user-settings] load failed", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const update = useCallback(
    async (patch: Partial<UserSettings>) => {
      const next = { ...settings, ...patch };
      setSettings(next);
      await saveUserSettings(patch);
    },
    [settings],
  );

  return (
    <UserSettingsContext.Provider value={{ settings, loading, update, refresh }}>
      {children}
    </UserSettingsContext.Provider>
  );
}

export function useUserSettings(): Ctx {
  const ctx = useContext(UserSettingsContext);
  if (!ctx) throw new Error("useUserSettings must be used within UserSettingsProvider");
  return ctx;
}
