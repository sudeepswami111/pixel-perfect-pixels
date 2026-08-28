import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DAY_THEMES, themeForDate } from "@/lib/day-theme";
import { useDayTheme } from "@/components/reset/DayThemeProvider";
import { ResetCountdown, SplitBar, CoinPips, Eyebrow } from "@/components/reset/bits";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RESET — nothing here stays permanent" },
      {
        name: "description",
        content:
          "RESET is a social ritual built on countdowns: one debate a day, ten coins that vanish at midnight, and a theme that changes every morning.",
      },
      { property: "og:title", content: "RESET — nothing here stays permanent" },
      {
        property: "og:description",
        content: "One debate a day, ten coins that vanish at midnight, a theme that changes every morning.",
      },
    ],
  }),
  component: Site,
});

function Site() {
  return (
    <div className="relative z-[2]">
      <Nav />
      <Hero />
      <Manifesto />
      <DailyThemes />
      <BattleDemo />
      <DailyCoins />
      <ManifestoLine />
      <CTA />
      <Footer />
    </div>
  );
}

/* ----------------------------------------------------------------- Nav */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled ? "border-b border-border bg-background/85 backdrop-blur" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-baseline gap-2">
          <span className="font-display text-2xl text-gold">RESET</span>
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">2026</span>
        </a>
        <nav className="hidden gap-8 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground md:flex">
          <a href="#idea" className="hover:text-gold">The idea</a>
          <a href="#themes" className="hover:text-gold">Themes</a>
          <a href="#battle" className="hover:text-gold">Battle</a>
          <a href="#coins" className="hover:text-gold">Coins</a>
        </nav>
        <a
          href="#begin"
          className="rounded-full bg-gold px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-primary-foreground transition hover:brightness-110"
        >
          Begin
        </a>
      </div>
    </header>
  );
}

/* ----------------------------------------------------------------- Hero */
function Hero() {
  const theme = useDayTheme();
  return (
    <section id="top" className="relative mx-auto min-h-screen w-full max-w-6xl px-6 pt-36 pb-20">
      {/* broken grid: overlapping gold panels */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-10 top-40 h-64 w-40 rotate-[7deg] border border-gold/30 opacity-60 motion-safe:transition-opacity"
          style={{ background: "var(--gold-soft)" }}
        />
        <div className="absolute right-8 top-28 h-80 w-24 -rotate-[6deg] border border-gold/20" />
        <div className="absolute bottom-24 right-1/4 h-px w-72 hairline" />
      </div>

      <div className="relative grid grid-cols-12 gap-6">
        <Eyebrow className="col-span-12 md:col-span-7">
          A social ritual · resets at midnight
        </Eyebrow>

        <h1 className="col-span-12 md:col-span-9 mt-4 font-display text-[3.4rem] leading-[0.92] tracking-tight sm:text-[5rem] md:text-[7rem]">
          Nothing here
          <br />
          <span className="text-gold">stays</span>{" "}
          <span className="relative inline-block">
            permanent
            <span className="absolute -bottom-2 left-0 h-[3px] w-full bg-gold/40" />
          </span>
        </h1>

        <div className="col-span-12 mt-8 grid grid-cols-12 gap-6">
          <p className="col-span-12 max-w-md text-base leading-relaxed text-muted-foreground md:col-span-6 md:col-start-7">
            One opinion battle a day. Ten coins that vanish at midnight. A theme that
            changes every morning. No feed, no followers, no streaks to defend — just
            a daily ritual that ends, and begins again.
          </p>
        </div>

        {/* broken-grid stat tiles, deliberately misaligned */}
        <div className="col-span-12 mt-16 grid grid-cols-12 items-end gap-6">
          <StatTile
            className="col-span-6 md:col-span-3 md:col-start-1"
            eyebrow="Resets in"
            value={<ResetCountdown className="text-3xl text-gold" />}
          />
          <StatTile
            className="col-span-6 md:col-span-3 md:col-start-5 md:translate-y-6"
            eyebrow="Today is"
            value={<span className="text-2xl" style={{ color: theme.accent }}>{theme.name}</span>}
          />
          <StatTile
            className="col-span-6 md:col-span-3 md:col-start-9 md:-translate-y-4"
            eyebrow="Coins tomorrow"
            value={<span className="text-3xl text-gold">10</span>}
            hint="always ten. never more."
          />
        </div>
      </div>
    </section>
  );
}

function StatTile({
  className,
  eyebrow,
  value,
  hint,
}: {
  className?: string;
  eyebrow: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className={`border border-border bg-card/60 p-5 backdrop-blur-sm ${className ?? ""}`}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <div className="mt-2 font-display">{value}</div>
      {hint && <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/* ----------------------------------------------------------------- Manifesto */
function Manifesto() {
  return (
    <section id="idea" className="mx-auto w-full max-w-6xl px-6 py-28">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-4 md:col-start-2">
          <Eyebrow>The reset idea</Eyebrow>
          <p className="mt-6 font-display text-3xl leading-tight text-foreground sm:text-4xl">
            What if everything worth saying
            <span className="text-gold"> disappeared </span>
            by morning?
          </p>
        </div>
        <div className="col-span-12 mt-8 space-y-6 text-base leading-relaxed text-muted-foreground md:col-span-5 md:col-start-8">
          <p>
            Every app begs you to stay. RESET asks you to leave. Your coins drain to zero
            at midnight. The argument you fought for dissolves. The theme you woke up to
            is already on its way out.
          </p>
          <p>
            The point isn't retention. It's the opposite. You get ten coins, one battle,
            one day. Spend them or lose them — then the whole thing starts over, and
            nobody is keeping score.
          </p>
          <CoinDrainVisual />
        </div>
      </div>
    </section>
  );
}

/** Animated coin row draining to zero and refilling — the reset metaphor. */
function CoinDrainVisual() {
  const [left, setLeft] = useState(10);
  useEffect(() => {
    let n = 10;
    const drain = window.setInterval(() => {
      n = n - 1;
      setLeft(Math.max(0, n));
      if (n <= 0) {
        window.clearInterval(drain);
        window.setTimeout(() => setLeft(10), 700);
      }
    }, 420);
    return () => window.clearInterval(drain);
  }, [left === 10 ? 0 : 1]);
  return (
    <div className="border border-border bg-background/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <Eyebrow>ten coins · every day</Eyebrow>
        <span className="font-mono text-sm text-gold">{left}/10</span>
      </div>
      <CoinPips left={left} total={10} />
    </div>
  );
}

/* ----------------------------------------------------------------- Daily themes */
function DailyThemes() {
  const today = themeForDate(new Date());
  return (
    <section id="themes" className="mx-auto w-full max-w-6xl px-6 py-28">
      <Eyebrow>Seven days, seven moods</Eyebrow>
      <h2 className="mt-4 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
        The day sets the tone — then it's gone.
      </h2>
      <p className="mt-4 max-w-md text-base text-muted-foreground">
        Each weekday arrives with its own accent color and a prompt that dares you to
        pick a side before you've finished thinking.
      </p>

      <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
        {DAY_THEMES.map((t, i) => {
          const isToday = t.index === today.index;
          return (
            <div
              key={t.index}
              className={`relative border p-5 transition-transform duration-500 hover:-translate-y-1 ${
                isToday ? "border-gold" : "border-border"
              }`}
              style={{
                background: `linear-gradient(180deg, ${t.accentSoft}, transparent)`,
                transform: `rotate(${i % 2 === 0 ? "-1.2deg" : "1.4deg"})`,
              }}
            >
              <span
                className="block h-2 w-8"
                style={{ backgroundColor: t.accent }}
              />
              <p className="mt-4 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
                Day {t.index === 0 ? 7 : t.index}
              </p>
              <p className="mt-1 font-display text-xl" style={{ color: t.accent }}>
                {t.name}
              </p>
              <p className="mt-3 text-[0.8rem] leading-snug text-muted-foreground">
                {t.prompt}
              </p>
              {isToday && (
                <span className="absolute -right-2 -top-2 rounded-full bg-gold px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-primary-foreground">
                  now
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- Battle demo */
const SAMPLE_PROMPTS = [
  "Forgiveness is a form of forgetting.",
  "Comfort is the enemy of meaning.",
  "You owe your past self nothing.",
];
const SAMPLE_SPLITS = [62, 41, 73];

function BattleDemo() {
  const [idx, setIdx] = useState(0);
  const [side, setSide] = useState<"agree" | "disagree" | null>(null);
  const prompt = SAMPLE_PROMPTS[idx]!;
  const split = SAMPLE_SPLITS[idx]!;

  const next = () => {
    setSide(null);
    setIdx((i) => (i + 1) % SAMPLE_PROMPTS.length);
  };

  return (
    <section id="battle" className="mx-auto w-full max-w-6xl px-6 py-28">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-5 md:col-start-1">
          <Eyebrow>One battle at a time</Eyebrow>
          <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
            Take a side. Write your case. Move on.
          </h2>
          <p className="mt-4 max-w-sm text-base text-muted-foreground">
            No infinite scroll. You get one prompt. You pick agree or disagree, you
            argue it in a few lines, and the community split shows you exactly how
            alone you are. Then you're done for the day.
          </p>
        </div>

        <div className="col-span-12 md:col-span-6 md:col-start-7 md:-translate-y-4">
          <div className="border border-gold/40 bg-card p-6 shadow-[0_0_60px_-20px_var(--gold)]">
            <div className="flex items-center justify-between">
              <Eyebrow>Battle {idx + 1} of {SAMPLE_PROMPTS.length}</Eyebrow>
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                resets at midnight
              </span>
            </div>
            <p className="mt-4 font-display text-2xl leading-snug sm:text-3xl">
              "{prompt}"
            </p>

            <div className="mt-6 flex gap-3">
              <PillButton active={side === "agree"} onClick={() => setSide("agree")}>
                Agree
              </PillButton>
              <PillButton active={side === "disagree"} onClick={() => setSide("disagree")}>
                Disagree
              </PillButton>
            </div>

            <textarea
              placeholder={side ? "Make your case in a few lines…" : "Pick a side first to write your argument"}
              disabled={!side}
              rows={3}
              className="mt-4 w-full resize-none border border-border bg-background/60 p-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none disabled:opacity-50"
            />

            {side && (
              <div className="mt-5">
                <Eyebrow>Where the room landed</Eyebrow>
                <div className="mt-2">
                  <SplitBar agreePct={split} total={1240} />
                </div>
              </div>
            )}

            <button
              onClick={next}
              className="mt-6 w-full border border-gold/40 py-3 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-gold transition hover:bg-gold/10"
            >
              Next battle →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function PillButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-6 py-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] transition motion-safe:active:scale-95 ${
        active ? "bg-gold text-primary-foreground" : "border border-border text-foreground hover:border-gold"
      }`}
    >
      {children}
    </button>
  );
}

/* ----------------------------------------------------------------- Daily coins */
function DailyCoins() {
  return (
    <section id="coins" className="mx-auto w-full max-w-6xl px-6 py-28">
      <div className="grid grid-cols-12 items-center gap-6">
        <div className="col-span-12 md:col-span-4 md:col-start-2 md:translate-y-6">
          <div className="border border-border bg-card/60 p-6">
            <Eyebrow>Your wallet, tonight</Eyebrow>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-mono text-sm text-muted-foreground">left</span>
              <span className="font-mono text-2xl text-gold">6 / 10</span>
            </div>
            <div className="mt-4">
              <CoinPips left={6} total={10} />
            </div>
            <p className="mt-4 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
              gone at midnight · never rolls over
            </p>
          </div>
        </div>

        <div className="col-span-12 md:col-span-6 md:col-start-7">
          <Eyebrow>Ten coins. Spend them on other people.</Eyebrow>
          <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
            Coins are for lifting someone else's argument.
          </h2>
          <p className="mt-4 max-w-md text-base text-muted-foreground">
            You can't spend on yourself. You can't buy more. Each coin you give boosts
            another person's case up the wall for the day — and at midnight the wall
            comes down. Influence here is borrowed, never banked.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- Manifesto line */
function ManifestoLine() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-28">
      <div className="relative border-y border-gold/20 py-20">
        <p className="mx-auto max-w-3xl text-center font-display text-3xl leading-tight sm:text-5xl">
          No followers. No likes. No streaks.
          <br />
          Just <span className="text-gold">today</span>, and the clock running out.
        </p>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- CTA */
function CTA() {
  const [email, setEmail] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("You're on the list — we'll knock when midnight comes.");
    setEmail("");
  };
  return (
    <section id="begin" className="mx-auto w-full max-w-6xl px-6 py-28">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-7 md:col-start-3">
          <Eyebrow className="text-center">Begin tonight</Eyebrow>
          <h2 className="mt-4 text-center font-display text-4xl leading-tight sm:text-6xl">
            Be here for the <span className="text-gold">reset</span>.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-center text-base text-muted-foreground">
            We open a limited number of invites each night at midnight. Leave a line and
            we'll send one when your day turns over.
          </p>
          <form onSubmit={submit} className="mx-auto mt-8 flex max-w-md gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@somewhere.com"
              className="flex-1 border border-border bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-gold px-6 py-3 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-primary-foreground transition hover:brightness-110"
            >
              Request invite
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- Footer */
function Footer() {
  const year = useMemo(() => new Date().getFullYear(), []);
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-xl text-gold">RESET</span>
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">
            nothing stays
          </span>
        </div>
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
          © {year} · resets every midnight
        </p>
      </div>
    </footer>
  );
}
