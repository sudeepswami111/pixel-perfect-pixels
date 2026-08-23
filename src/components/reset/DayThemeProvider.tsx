import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { themeForDate, type DayTheme } from "@/lib/day-theme";

const DayThemeContext = createContext<DayTheme>(themeForDate(new Date()));

export function DayThemeProvider({ children }: { children: ReactNode }) {
  const [now, setNow] = useState(() => new Date());
  const [revealed, setRevealed] = useState(false);
  const theme = useMemo(() => themeForDate(now), [now]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--day-accent", theme.accent);
    root.style.setProperty("--day-accent-soft", theme.accentSoft);
  }, [theme]);

  useEffect(() => {
    const id = window.setTimeout(() => setRevealed(true), 40);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <DayThemeContext.Provider value={theme}>
      <div data-revealed={revealed} className="day-reveal">
        {children}
      </div>
    </DayThemeContext.Provider>
  );
}

export function useDayTheme() {
  return useContext(DayThemeContext);
}
