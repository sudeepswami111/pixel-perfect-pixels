import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell, RequireAuth } from "@/components/reset/AppShell";
import { useDayTheme } from "@/components/reset/DayThemeProvider";
import { Eyebrow, SplitBar } from "@/components/reset/bits";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { battleVotesQuery, battlesQuery, myVotesQuery, splitOf } from "@/lib/reset-data";

export const Route = createFileRoute("/battle")({
  head: () => ({
    meta: [
      { title: "Opinion Battles — RESET" },
      {
        name: "description",
        content:
          "One debate prompt at a time. Pick agree or disagree, write one line to back it up, then watch the community split move.",
      },
      { property: "og:title", content: "Opinion Battles — RESET" },
      {
        property: "og:description",
        content: "Pick a side, write one line, see the live split. Then the next battle.",
      },
    ],
  }),
  component: BattleRoute,
});

function BattleRoute() {
  return (
    <RequireAuth>
      <AppShell>
        <Battle />
      </AppShell>
    </RequireAuth>
  );
}

function Battle() {
  const theme = useDayTheme();
  const { user } = useAuth();
  const qc = useQueryClient();
  const battles = useQuery(battlesQuery);
  const myVotes = useQuery(myVotesQuery(user?.id));

  const [index, setIndex] = useState(0);
  const [side, setSide] = useState<"agree" | "disagree" | null>(null);
  const [argument, setArgument] = useState("");

  const ordered = useMemo(() => {
    const list = battles.data ?? [];
    const votedIds = new Set((myVotes.data ?? []).map((v) => v.battle_id));
    return [...list].sort(
      (a, b) => Number(votedIds.has(a.id)) - Number(votedIds.has(b.id)) || a.sort_order - b.sort_order,
    );
  }, [battles.data, myVotes.data]);

  const battle = ordered[index % (ordered.length || 1)];
  const votes = useQuery(battleVotesQuery(battle?.id));
  const myVote = (myVotes.data ?? []).find((v) => v.battle_id === battle?.id);
  const split = splitOf(votes.data ?? []);

  const castVote = useMutation({
    mutationFn: async () => {
      if (!battle || !side || !user) throw new Error("Pick a side and write one line first");
      const { error } = await supabase.from("votes").insert({
        battle_id: battle.id,
        user_id: user.id,
        side,
        argument: argument.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setArgument("");
      setSide(null);
      qc.invalidateQueries({ queryKey: ["votes", battle?.id] });
      qc.invalidateQueries({ queryKey: ["my-votes"] });
      qc.invalidateQueries({ queryKey: ["all-votes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const next = () => {
    setIndex((i) => i + 1);
    setSide(null);
    setArgument("");
  };

  if (!battle) {
    return <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">Loading</p>;
  }

  const answered = Boolean(myVote);
  const canVote = side !== null && argument.trim().length >= 3;

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <Eyebrow>Battle {String(index + 1).padStart(2, "0")}</Eyebrow>
        <span className="font-mono text-xs text-muted-foreground">{split.total} in</span>
      </div>

      <h1 className="font-display text-3xl leading-[1.1]">{battle.prompt}</h1>

      {answered ? (
        <div className="space-y-5">
          <SplitBar agreePct={split.agreePct} total={split.total} />
          <div className="border border-border p-4">
            <Eyebrow>You said</Eyebrow>
            <p className="mt-1 font-mono text-xs uppercase" style={{ color: theme.accent }}>
              {myVote!.side}
            </p>
            <p className="mt-2 text-sm leading-relaxed">{myVote!.argument}</p>
          </div>
          <div className="space-y-3">
            <Eyebrow>What other people wrote</Eyebrow>
            {(votes.data ?? [])
              .filter((v) => v.id !== myVote!.id)
              .slice(0, 6)
              .map((v) => (
                <div key={v.id} className="border border-border p-3">
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                    {v.author_label ?? "someone"} · {v.side}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed">{v.argument}</p>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex gap-3">
            {(["agree", "disagree"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSide(s)}
                className="flex-1 rounded-full border px-4 py-4 font-mono text-xs uppercase tracking-[0.2em] motion-safe:transition-all motion-safe:active:scale-95"
                style={
                  side === s
                    ? { backgroundColor: theme.accent, borderColor: theme.accent, color: "var(--background)" }
                    : { borderColor: "var(--border)" }
                }
              >
                {s}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Eyebrow>One line to back it up</Eyebrow>
            <textarea
              value={argument}
              maxLength={240}
              rows={3}
              onChange={(e) => setArgument(e.target.value)}
              placeholder="Say why. No vote counts without it."
              className="w-full resize-none border border-border bg-secondary p-3 text-sm outline-none focus:border-[var(--day-accent)]"
            />
            <p className="text-right font-mono text-[0.65rem] text-muted-foreground">
              {argument.trim().length}/240
            </p>
          </div>

          <button
            disabled={!canVote || castVote.isPending}
            onClick={() => castVote.mutate()}
            className="w-full rounded-full py-4 font-mono text-xs uppercase tracking-[0.25em] text-background disabled:opacity-30 motion-safe:transition-transform motion-safe:active:scale-95"
            style={{ backgroundColor: theme.accent }}
          >
            {castVote.isPending ? "Sending" : "Vote"}
          </button>
        </div>
      )}

      <button
        onClick={next}
        className="w-full border border-border py-4 font-mono text-xs uppercase tracking-[0.25em]"
      >
        Next battle
      </button>
    </div>
  );
}
