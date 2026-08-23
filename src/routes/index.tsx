import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Coins } from "lucide-react";
import { AppShell, RequireAuth } from "@/components/reset/AppShell";
import { useDayTheme } from "@/components/reset/DayThemeProvider";
import { CoinPips, Eyebrow, ResetCountdown } from "@/components/reset/bits";
import { useAuth } from "@/lib/auth";
import { DAILY_COINS, battlesQuery, mySpendsTodayQuery } from "@/lib/reset-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RESET — Today's theme, one debate, ten coins" },
      {
        name: "description",
        content:
          "RESET is a social app where nothing stays permanent. A new theme every day, one opinion battle at a time, and ten coins that expire at midnight.",
      },
      { property: "og:title", content: "RESET — Today's theme, one debate, ten coins" },
      {
        property: "og:description",
        content:
          "No followers, no feed, no streaks. A daily theme, one debate at a time, and ten coins that expire at midnight.",
      },
    ],
  }),
  component: TodayRoute,
});

function TodayRoute() {
  return (
    <RequireAuth>
      <AppShell>
        <Today />
      </AppShell>
    </RequireAuth>
  );
}

function Today() {
  const theme = useDayTheme();
  const { user } = useAuth();
  const battles = useQuery(battlesQuery);
  const spends = useQuery(mySpendsTodayQuery(user?.id));
  const coinsLeft = DAILY_COINS - (spends.data?.length ?? 0);

  const todayBattle = battles.data?.[new Date().getDate() % (battles.data.length || 1)];

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <Eyebrow>Today</Eyebrow>
        <h1 className="font-display text-4xl leading-[1.05] tracking-tight">
          <span style={{ color: theme.accent }}>{theme.name}</span>
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">{theme.prompt}</p>
      </header>

      <div
        className="border border-border p-4"
        style={{ backgroundColor: "var(--day-accent-soft)" }}
      >
        <Eyebrow>Everything resets in</Eyebrow>
        <ResetCountdown className="mt-1 block text-3xl" />
      </div>

      <section className="space-y-3 border border-border p-4">
        <Eyebrow>Today&apos;s battle</Eyebrow>
        <p className="font-display text-2xl leading-tight">
          {todayBattle?.prompt ?? "Loading the day's prompt"}
        </p>
        <Link
          to="/battle"
          className="inline-flex items-center gap-2 rounded-full px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-background motion-safe:transition-transform motion-safe:active:scale-95"
          style={{ backgroundColor: theme.accent }}
        >
          Take a side <ArrowRight size={14} />
        </Link>
      </section>

      <section className="space-y-3 border border-border p-4">
        <div className="flex items-center justify-between">
          <Eyebrow>Coins left today</Eyebrow>
          <span className="font-mono text-sm">
            {coinsLeft}/{DAILY_COINS}
          </span>
        </div>
        <CoinPips left={coinsLeft} total={DAILY_COINS} />
        <Link
          to="/wallet"
          className="inline-flex items-center gap-2 border border-border px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-foreground"
        >
          <Coins size={14} /> Spend them
        </Link>
      </section>
    </div>
  );
}
