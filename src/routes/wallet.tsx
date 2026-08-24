import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell, RequireAuth } from "@/components/reset/AppShell";
import { useDayTheme } from "@/components/reset/DayThemeProvider";
import { CoinPips, Eyebrow, ResetCountdown } from "@/components/reset/bits";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import {
  DAILY_COINS,
  allVotesQuery,
  battlesQuery,
  mySpendsTodayQuery,
  spendTotalsQuery,
} from "@/lib/reset-data";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Coin Wallet — RESET" },
      {
        name: "description",
        content:
          "Ten coins a day, spendable only on other people's arguments. Unspent coins expire at midnight and nothing rolls over.",
      },
      { property: "og:title", content: "Coin Wallet — RESET" },
      {
        property: "og:description",
        content: "Ten coins a day. Spend them on arguments you rate. They reset at midnight.",
      },
    ],
  }),
  component: WalletRoute,
});

function WalletRoute() {
  return (
    <RequireAuth>
      <AppShell>
        <Wallet />
      </AppShell>
    </RequireAuth>
  );
}

function Wallet() {
  const theme = useDayTheme();
  const { user } = useAuth();
  const qc = useQueryClient();
  const spends = useQuery(mySpendsTodayQuery(user?.id));
  const votes = useQuery(allVotesQuery());
  const battles = useQuery(battlesQuery);
  const totals = useQuery(spendTotalsQuery);

  const spentIds = new Set((spends.data ?? []).map((s) => s.vote_id));
  const coinsLeft = DAILY_COINS - (spends.data?.length ?? 0);
  const promptFor = (battleId: string) =>
    battles.data?.find((b) => b.id === battleId)?.prompt ?? "";

  const spend = useMutation({
    mutationFn: async (voteId: string) => {
      if (!user) throw new Error("Sign in first");
      const { error } = await supabase
        .from("coin_spends")
        .insert({ user_id: user.id, vote_id: voteId });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["spends-today"] });
      qc.invalidateQueries({ queryKey: ["spend-totals"] });
    },
    onError: (e: Error) => toast.error(e.message.replace(/^.*: /, "")),
  });

  const spendable = (votes.data ?? []).filter((v) => v.user_id !== user?.id);

  return (
    <div className="space-y-7">
      <header className="space-y-2">
        <Eyebrow>Wallet</Eyebrow>
        <h1 className="font-display text-3xl">
          <span className="font-mono" style={{ color: theme.accent }}>
            {coinsLeft}
          </span>{" "}
          coins left today
        </h1>
        <CoinPips left={coinsLeft} total={DAILY_COINS} />
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
          Resets at midnight · <ResetCountdown />
        </p>
      </header>

      <div className="space-y-3">
        <Eyebrow>Arguments worth a coin</Eyebrow>
        {spendable.slice(0, 20).map((v) => {
          const given = spentIds.has(v.id);
          return (
            <div key={v.id} className="border border-border p-4">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                {promptFor(v.battle_id)}
              </p>
              <p className="mt-2 text-sm leading-relaxed">{v.argument}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                  {v.author_label ?? "someone"} · {v.side} ·{" "}
                  <span style={{ color: theme.accent }}>{totals.data?.[v.id] ?? 0} coins</span>
                </span>
                <button
                  disabled={given || coinsLeft <= 0 || spend.isPending}
                  onClick={() => spend.mutate(v.id)}
                  className="rounded-full border px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] disabled:opacity-30 motion-safe:transition-transform motion-safe:active:scale-90"
                  style={
                    given
                      ? { borderColor: theme.accent, color: theme.accent }
                      : { borderColor: "var(--border)" }
                  }
                >
                  {given ? "Spent" : "Spend"}
                </button>
              </div>
            </div>
          );
        })}
        {spendable.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nothing to back yet. Vote in a battle and other people&apos;s arguments show up here.
          </p>
        )}
      </div>
    </div>
  );
}
