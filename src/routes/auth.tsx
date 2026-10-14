import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Forge" },
      { name: "description", content: "Sign in to your Forge coaching account." },
      { property: "og:title", content: "Sign in — Forge" },
      { property: "og:description", content: "Sign in to your Forge coaching account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (session) navigate({ to: "/today" }); }, [session, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "up") {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/today" } });
      if (error) toast.error(error.message);
      else toast.success("Check your email to confirm your account.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
    }
    setBusy(false);
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) toast.error("Google sign-in failed");
  }

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-sm flex-col justify-center px-6 py-10">
      <span className="font-display text-2xl">Forge</span>
      <h1 className="mt-8 text-4xl">{mode === "in" ? "Welcome back." : "Begin your block."}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Your coach remembers every session.</p>
      <Button variant="outline" size="xl" className="mt-8 rounded-full" onClick={google}>Continue with Google</Button>
      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <Input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12" />
        <Input type="password" required minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12" />
        <Button type="submit" variant="ink" size="xl" disabled={busy}>{mode === "in" ? "Sign in" : "Create account"}</Button>
      </form>
      <button className="mt-6 text-sm text-muted-foreground underline-offset-4 hover:underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>
        {mode === "in" ? "New here? Create an account" : "Have an account? Sign in"}
      </button>
    </main>
  );
}
