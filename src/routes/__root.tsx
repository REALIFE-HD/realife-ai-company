import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { migrateLocalInstructionsIfAny } from "@/lib/instructions";
import { UserSettingsProvider } from "@/hooks/use-user-settings";
import { AuthProvider } from "@/hooks/use-auth";
import { AuthGate } from "@/components/auth/AuthGate";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "REALIFE — AI COMPANY" },
      { name: "description", content: "REALIFE Command Center is a virtual company dashboard for internal operations." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "REALIFE — AI COMPANY" },
      { property: "og:description", content: "REALIFE Command Center is a virtual company dashboard for internal operations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "REALIFE — AI COMPANY" },
      { name: "twitter:description", content: "REALIFE Command Center is a virtual company dashboard for internal operations." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/74d6cb23-faa5-4326-9a8f-024ddc859c5b/id-preview-e7f4e8d7--f48c731b-7416-4821-bda0-53470c6b8d17.lovable.app-1776682764286.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/74d6cb23-faa5-4326-9a8f-024ddc859c5b/id-preview-e7f4e8d7--f48c731b-7416-4821-bda0-53470c6b8d17.lovable.app-1776682764286.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  useEffect(() => {
    migrateLocalInstructionsIfAny().then((n) => {
      if (n > 0) console.info(`[instructions] migrated ${n} local entries to Cloud`);
    });
  }, []);
  return (
    <AuthProvider>
      <AuthGate>
        <UserSettingsProvider>
          <Outlet />
          <Toaster richColors position="top-right" />
        </UserSettingsProvider>
      </AuthGate>
    </AuthProvider>
  );
}
