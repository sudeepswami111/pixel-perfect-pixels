import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useDayTheme } from "@/components/reset/DayThemeProvider";
import { CoinPips, Eyebrow, ResetCountdown } from "@/components/reset/bits";
import { useAuth } from "@/lib/auth";
import { AuthPanel } from "@/components/reset/AuthPanel";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Start on RESET — nothing here stays permanent" },
      {
        name: "description",
        content:
          "Ten coins a day, one debate at a time, a theme that changes every morning. Everything clears at midnight. Start with a single vote.",
      },
      { property: "og:title", content: "Start on RESET — nothing here stays permanent" },
      {
        property: "og:description",
        content: "Ten coins a day, one debate at a time, everything clears at midnight.",
      },
    ],
  }),
  component: Onboarding,
});

function Onboarding() {
  const theme = useDayTheme();
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/", replace: true });
  }, [loading, session, navigate]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-between px-6 py-12">
      {step === 0 && <StepOne accent={theme.accent} onNext={() => setStep(1)} />}
      {step === 1 && <StepTwo accent={theme.accent} onNext={() => setStep(2)} />}
      {step === 2 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <Eyebrow>Last step</Eyebrow>
            <h1 className="font-display text-3xl leading-tight">
              Make an account, then take a side.
            </h1>
          </div>
          <AuthPanel />
        </div>
      )}
    </div>
  );
}

function DrainingCoins() {
  const [left, setLeft] = useState(10);
  useEffect(() => {
    const id = window.setInterval(() => setLeft((n) => (n <= 0 ? 10 : n - 1)), 500);
    return () => window.clearInterval(id);
  }, []);
  return <CoinPips left={left} total={10} />;
}

function StepOne({ accent, onNext }: { accent: string; onNext: () => void }) {
  return (
    <>
      <div className="space-y-6">
        <Eyebrow>RESET</Eyebrow>
        <h1 className="font-display text-4xl leading-[1.05]">
          Ten coins a day.
          <br />
          <span style={{ color: accent }}>Then they are gone.</span>
        </h1>
        <DrainingCoins />
        <p className="text-sm leading-relaxed text-muted-foreground">
          You get ten every midnight. You can only spend them on other people&apos;s arguments.
          Nothing rolls over, nothing can be bought.
        </p>
      </div>
      <NextButton accent={accent} onClick={onNext} label="Keep going" />
    </>
  );
}

function StepTwo({ accent, onNext }: { accent: string; onNext: () => void }) {
  return (
    <>
      <div className="space-y-6">
        <Eyebrow>How it works</Eyebrow>
        <h1 className="font-display text-4xl leading-[1.05]">
          One debate at a time. No feed to finish.
        </h1>
        <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <li>Pick agree or disagree, and write one line to back it up.</li>
          <li>Watch the split move, then move on to the next battle.</li>
          <li>
            The whole thing clears in <ResetCountdown className="text-foreground" />.
          </li>
        </ul>
      </div>
      <NextButton accent={accent} onClick={onNext} label="Start" />
    </>
  );
}

function NextButton({
  accent,
  onClick,
  label,
}: {
  accent: string;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="mt-10 w-full rounded-full py-4 font-mono text-xs uppercase tracking-[0.25em] text-background motion-safe:transition-transform motion-safe:active:scale-95"
      style={{ backgroundColor: accent }}
    >
      {label}
    </button>
  );
}
