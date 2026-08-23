import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { utcDateKey } from "./day-theme";

export type Battle = {
  id: string;
  prompt: string;
  sort_order: number;
};

export type Vote = {
  id: string;
  battle_id: string;
  user_id: string | null;
  author_label: string | null;
  side: "agree" | "disagree";
  argument: string;
  created_at: string;
};

export const battlesQuery = queryOptions({
  queryKey: ["battles"],
  queryFn: async (): Promise<Battle[]> => {
    const { data, error } = await supabase
      .from("battles")
      .select("id, prompt, sort_order")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
  staleTime: 5 * 60 * 1000,
});

export function battleVotesQuery(battleId: string | undefined) {
  return queryOptions({
    queryKey: ["votes", battleId],
    enabled: Boolean(battleId),
    queryFn: async (): Promise<Vote[]> => {
      const { data, error } = await supabase
        .from("votes")
        .select("id, battle_id, user_id, author_label, side, argument, created_at")
        .eq("battle_id", battleId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Vote[];
    },
  });
}

export function myVotesQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["my-votes", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Vote[]> => {
      const { data, error } = await supabase
        .from("votes")
        .select("id, battle_id, user_id, author_label, side, argument, created_at")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Vote[];
    },
  });
}

export function allVotesQuery() {
  return queryOptions({
    queryKey: ["all-votes"],
    queryFn: async (): Promise<Vote[]> => {
      const { data, error } = await supabase
        .from("votes")
        .select("id, battle_id, user_id, author_label, side, argument, created_at")
        .order("created_at", { ascending: false })
        .limit(60);
      if (error) throw error;
      return (data ?? []) as Vote[];
    },
  });
}

export type Spend = { id: string; user_id: string; vote_id: string; spend_date: string };

export const DAILY_COINS = 10;

export function mySpendsTodayQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["spends-today", userId, utcDateKey()],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Spend[]> => {
      const { data, error } = await supabase
        .from("coin_spends")
        .select("id, user_id, vote_id, spend_date")
        .eq("user_id", userId!)
        .eq("spend_date", utcDateKey());
      if (error) throw error;
      return (data ?? []) as Spend[];
    },
  });
}

export const spendTotalsQuery = queryOptions({
  queryKey: ["spend-totals"],
  queryFn: async (): Promise<Record<string, number>> => {
    const { data, error } = await supabase.from("coin_spends").select("vote_id").limit(2000);
    if (error) throw error;
    const totals: Record<string, number> = {};
    for (const row of data ?? []) totals[row.vote_id] = (totals[row.vote_id] ?? 0) + 1;
    return totals;
  },
});

export function splitOf(votes: Vote[]) {
  const agree = votes.filter((v) => v.side === "agree").length;
  const total = votes.length;
  const agreePct = total === 0 ? 50 : Math.round((agree / total) * 100);
  return { agree, disagree: total - agree, total, agreePct, disagreePct: 100 - agreePct };
}
