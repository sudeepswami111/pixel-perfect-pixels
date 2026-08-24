import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthPanel } from "@/components/reset/AuthPanel";
import { Eyebrow } from "@/components/reset/bits";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — RESET" },
      {
        name: "description",
        content: "Sign in to RESET to vote in today's opinion battle and spend your ten daily coins.",
      },
      { property: "og:title", content: "Sign in — RESET" },
      { property: "og:description", content: "Sign in to vote and spend today's coins." },
    ],
  }),
  component: AuthRoute,
});

function AuthRoute() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session) navigate({ to: "/", replace: true });
  }, [loading, session, navigate]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-6 py-12">
      <div className="space-y-2">
        <Eyebrow>RESET</Eyebrow>
        <h1 className="font-display text-3xl leading-tight">Pick up where the day left you.</h1>
      </div>
      <AuthPanel />
    </div>
  );
}
