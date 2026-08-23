import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Coins, Home, Swords, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useDayTheme } from "./DayThemeProvider";

const NAV = [
  { to: "/", label: "Today", icon: Home },
  { to: "/battle", label: "Battle", icon: Swords },
  { to: "/wallet", label: "Wallet", icon: Coins },
  { to: "/profile", label: "You", icon: User },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const theme = useDayTheme();
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <main className="flex-1 px-5 pb-28 pt-8">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-1 flex-col items-center gap-1 py-3 text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors"
              activeOptions={{ exact: to === "/" }}
              activeProps={{ style: { color: theme.accent } }}
            >
              <Icon size={18} strokeWidth={1.75} />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

/** Client-side gate: unauthenticated visitors go to onboarding. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/onboarding", replace: true });
  }, [loading, session, navigate]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          reset
        </span>
      </div>
    );
  }
  return <>{children}</>;
}
