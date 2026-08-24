import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useDayTheme } from "./DayThemeProvider";

export function AuthPanel() {
  const theme = useDayTheme();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/battle", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "That did not work");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in is unavailable right now");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/battle", replace: true });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full border border-border bg-secondary p-3 text-sm outline-none focus:border-[var(--day-accent)]"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full border border-border bg-secondary p-3 text-sm outline-none focus:border-[var(--day-accent)]"
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full py-4 font-mono text-xs uppercase tracking-[0.25em] text-background disabled:opacity-40 motion-safe:transition-transform motion-safe:active:scale-95"
          style={{ backgroundColor: theme.accent }}
        >
          {mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </form>

      <button
        onClick={google}
        className="w-full rounded-full border border-border py-4 font-mono text-xs uppercase tracking-[0.25em]"
      >
        Continue with Google
      </button>

      <button
        onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
        className="w-full font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground"
      >
        {mode === "signup" ? "I already have an account" : "I need an account"}
      </button>
    </div>
  );
}
