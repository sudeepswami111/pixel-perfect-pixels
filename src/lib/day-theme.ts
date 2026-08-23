export type DayTheme = {
  index: number;
  name: string;
  accent: string;
  accentSoft: string;
  prompt: string;
};

// One fixed accent per weekday. Index matches Date#getDay() (0 = Sunday).
export const DAY_THEMES: DayTheme[] = [
  {
    index: 0,
    name: "Quiet Day",
    accent: "#8FB8FF",
    accentSoft: "rgba(143,184,255,0.16)",
    prompt: "Say the thing you have been sitting on all week.",
  },
  {
    index: 1,
    name: "Debate Day",
    accent: "#4FD1C5",
    accentSoft: "rgba(79,209,197,0.16)",
    prompt: "Pick a side before you have finished thinking.",
  },
  {
    index: 2,
    name: "Puzzle Day",
    accent: "#FFB020",
    accentSoft: "rgba(255,176,32,0.16)",
    prompt: "Argue for the answer nobody else would defend.",
  },
  {
    index: 3,
    name: "Kindness Day",
    accent: "#66E08B",
    accentSoft: "rgba(102,224,139,0.16)",
    prompt: "Spend every coin on someone who is losing.",
  },
  {
    index: 4,
    name: "Contrarian Day",
    accent: "#A78BFA",
    accentSoft: "rgba(167,139,250,0.16)",
    prompt: "Take the side you woke up disagreeing with.",
  },
  {
    index: 5,
    name: "Confession Day",
    accent: "#FF7847",
    accentSoft: "rgba(255,120,71,0.16)",
    prompt: "Write the argument you would not put your name on.",
  },
  {
    index: 6,
    name: "Nonsense Day",
    accent: "#FF5C7A",
    accentSoft: "rgba(255,92,122,0.16)",
    prompt: "Defend something indefensible, well.",
  },
];

export function themeForDate(date: Date): DayTheme {
  return DAY_THEMES[date.getDay()]!;
}

export function msUntilLocalMidnight(now: Date): number {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next.getTime() - now.getTime();
}

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

/** UTC date string used by the coin ledger, matching the DB default. */
export function utcDateKey(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}
