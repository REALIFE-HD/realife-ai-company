import { defineConfig } from "vitest/config";
import path from "node:path";

// Vitest 専用設定: TanStack Start などアプリ用 Vite プラグインを使わない
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
