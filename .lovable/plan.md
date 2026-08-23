# RESET — a social app where nothing stays permanent

Mobile-first web app with three mechanics: Opinion Battles, Daily Coins, and a Today home screen whose theme and accent color change every day. Backed by real accounts and shared data.

## Visual direction

- Warm near-black base (#0d0e11), one accent color per weekday (7 fixed hex values, cycling automatically) — used on buttons, bars, timers, and the day badge.
- Fraunces (high-contrast serif) for headlines and prompts, Inter for body/UI, JetBrains Mono for every number: timers, coin counts, percentages, scores.
- Pill buttons for voting actions, sharp rectangles for content cards.
- Motion: vote bar animates on each tap, coin pips deplete one at a time, day-theme reveal fades in on open. All motion respects reduced-motion.
- No infinite scroll anywhere — one card at a time, tap NEXT to advance.
- Copy is plain and second-person: VOTE, SPEND, NEXT BATTLE. Emptiness reads as calm, never "you're behind".

## Screens

1. **Onboarding** (2–3 steps) — the reset idea shown through an animated coin row draining to zero and refilling, then sign-in, ending directly on a first battle to vote on.
2. **Today (home)** — day theme name, accent color, prompt of the day, live countdown to midnight reset, entry points to the day's battle and the wallet.
3. **Battle** — one prompt card, AGREE/DISAGREE, a short written argument required before the vote counts, then the animated community split bar, then NEXT BATTLE.
4. **Wallet** — today's coins as a depleting pip row, a list of other people's arguments to spend on, per-item SPEND with immediate feedback, and a "resets at midnight" label.
5. **Profile** — no followers, no likes, no streaks. Playful trait percentages inferred from voting history (labeled as not diagnostic) plus a compact debates won/lost history.

## Backend (Lovable Cloud)

Email/password accounts plus a profile row per user.

Tables:
- `profiles` — display name, created date.
- `battles` — prompt text, active date, seeded with a set of debate prompts.
- `votes` — user, battle, side (agree/disagree), argument text, unique per user+battle. Vote splits are computed from real rows.
- `coin_ledger` / `coin_spends` — one spend row per coin spent on another user's argument; today's balance = 10 minus today's spends. Nothing rolls over, nothing is purchasable, self-spend blocked by policy.
- `arguments` upvote counts derived from spends.

Every table gets row-level security: users read public battle/argument data, write only their own votes and spends. Coin limits and the self-spend ban are enforced server-side, not in the UI.

## Technical notes

- TanStack Start routes: `/` (Today), `/battle`, `/wallet`, `/profile`, `/onboarding`, `/auth`; authenticated screens sit under the auth-gated layout.
- Day theme derived from the user's local weekday, so the accent flips at local midnight; the reset countdown also uses local midnight.
- Voting, spending, and battle results run through server functions with auth middleware; reads use TanStack Query.
- Seed battles and sample arguments ship as literal INSERTs in the migration so the first screen is never empty.
