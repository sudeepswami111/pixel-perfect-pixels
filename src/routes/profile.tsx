import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell, RequireAuth } from "@/components/reset/AppShell";
import { useDayTheme } from "@/components/reset/DayThemeProvider";
import { Eyebrow } from "@/components/reset/bits";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { battlesQuery, myVotesQuery, allVotesQuery, splitOf } from "@/lib/reset-data";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your traits — RESET" },
      {
        name: "description",
        content:
          "No followers, no likes, no streaks. Just playful trait readings from how you vote and the debates you have won or lost.",
      },
      { property: "og:title", content: "Your traits — RESET" },
      {
        property: "og:description",
        content: "Playful trait readings from your voting history. The only stat that persists.",
      },
    ],
  }),
  component: ProfileRoute,
});

function ProfileRoute() {
  return (
    <RequireAuth>
      <AppShell>
        <Profile />
      </AppShell>
    </RequireAuth>
  );
}

function Profile() {
  const theme = useDayTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const myVotes = useQuery(myVotesQuery(user?.id));
  const battles = useQuery(battlesQuery);
  const allVotes = useQuery(allVotesQuery());

  const mine = myVotes.data ?? [];
  const promptFor = (id: string) => battles.data?.find((b) => b.id === id)?.prompt ?? "";

  const history = mine.map((v) => {
    const forBattle = (allVotes.data ?? []).filter((x) => x.battle_id === v.battle_id);
    const split = splitOf(forBattle);
    const majority = split.agreePct >= 50 ? "agree" : "disagree";
    return { vote: v, won: v.side === majority, split };
  });
  const won = history.filter((h) => h.won).length;

  const agreeShare = mine.length
    ? Math.round((mine.filter((v) => v.side === "agree").length / mine.length) * 100)
    : 50;
  const avgWords = mine.length
    ? Math.round(mine.reduce((n, v) => n + v.argument.split(/\s+/).length, 0) / mine.length)
    : 0;

  const traits = [
    { label: "Contrarian", value: 100 - agreeShare },
    { label: "Conviction", value: Math.min(100, 40 + mine.length * 6) },
    { label: "Long-winded", value: Math.min(100, avgWords * 5) },
    { label: "In step", value: mine.length ? Math.round((won / mine.length) * 100) : 50 },
  ];

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/onboarding", replace: true });
  };

  return (
    <div className="space-y-7">
      <header className="space-y-2">
        <Eyebrow>You</Eyebrow>
        <h1 className="font-display text-3xl">{user?.email?.split("@")[0] ?? "you"}</h1>
        <p className="text-sm text-muted-foreground">
          No followers here. Nothing to keep up. These readings are for fun, not a diagnosis.
        </p>
      </header>

      <section className="space-y-4 border border-border p-4">
        <Eyebrow>Read from how you vote</Eyebrow>
        {traits.map((t) => (
          <div key={t.label} className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span>{t.label}</span>
              <span className="font-mono" style={{ color: theme.accent }}>
                {t.value}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-muted">
              <div
                className="h-full motion-safe:transition-[width] motion-safe:duration-700"
                style={{ width: `${t.value}%`, backgroundColor: theme.accent }}
              />
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <Eyebrow>Debates</Eyebrow>
          <span className="font-mono text-sm">
            {won}W / {history.length - won}L
          </span>
        </div>
        {history.slice(0, 12).map((h) => (
          <div key={h.vote.id} className="flex items-center justify-between border border-border p-3">
            <p className="mr-3 text-sm leading-snug">{promptFor(h.vote.battle_id)}</p>
            <span
              className="font-mono text-[0.65rem] uppercase tracking-[0.2em]"
              style={{ color: h.won ? theme.accent : "var(--muted-foreground)" }}
            >
              {h.won ? "with" : "against"}
            </span>
          </div>
        ))}
        {history.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nothing yet, and that is fine. One vote fills this in.
          </p>
        )}
      </section>

      <button
        onClick={signOut}
        className="w-full border border-border py-3 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground"
      >
        Sign out
      </button>
    </div>
  );
}
