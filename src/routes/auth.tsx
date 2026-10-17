import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/use-auth";
import { BRAND, pageHead, safeRedirect } from "@/lib/brand";
export const Route = createFileRoute("/auth")({
  validateSearch: (
    s: Record<string, unknown>,
  ): { mode?: "signin" | "signup"; redirect?: string | undefined; from?: string | undefined } => ({
    mode: s["mode"] === "signin" ? ("signin" as const) : ("signup" as const),
    redirect: typeof s["redirect"] === "string" ? s["redirect"] : undefined,
    from: typeof s["from"] === "string" ? s["from"] : undefined,
  }),
  head: () => pageHead("Your account", "Create or access your Forge coaching account.", "/auth"),
  component: AuthPage,
});
function AuthPage() {
  const search = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signup"),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [show, setShow] = useState(false),
    [consent, setConsent] = useState(false),
    [busy, setBusy] = useState(false),
    [sent, setSent] = useState(false),
    [cooldown, setCooldown] = useState(0);
  const { session } = useAuth(),
    navigate = useNavigate();
  useEffect(() => {
    if (session) navigate({ to: safeRedirect(search.redirect) });
  }, [session, navigate, search.redirect]);
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);
  const emailRedirectTo =
    typeof window !== "undefined" ? window.location.origin + "/auth?mode=signin" : "";
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "signup" && !consent) return;
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo },
        });
        if (error) throw error;
        setSent(true);
        setCooldown(30);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function resend() {
    if (cooldown || busy) return;
    setBusy(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo },
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      setCooldown(30);
      toast.success("Confirmation email sent");
    }
  }
  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (r.error) toast.error("Google sign-in failed");
  }
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-sm flex-col justify-center px-6 py-10">
      <Link to="/" className="font-display text-2xl">
        {BRAND.name}
      </Link>
      {sent ? (
        <>
          <h1 className="mt-8 text-4xl">Check your email</h1>
          <p className="mt-3 break-words">We sent a confirmation link to {email}.</p>
          <Button className="mt-7" variant="ink" disabled={busy || cooldown > 0} onClick={resend}>
            {cooldown ? `Resend in ${cooldown}s` : "Resend email"}
          </Button>
          <Button
            variant="ghost"
            className="mt-3"
            onClick={() => {
              setSent(false);
              setPassword("");
            }}
          >
            Use a different email
          </Button>
        </>
      ) : (
        <>
          <h1 className="mt-8 text-4xl">
            {mode === "signin" ? "Welcome back." : "Begin your block."}
          </h1>
          <Button variant="outline" size="xl" className="mt-7" onClick={google}>
            Continue with Google
          </Button>
          <div className="my-5 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>
          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              Email
              <Input
                aria-label="Email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 h-12"
              />
            </label>
            <label className="block">
              Password
              <div className="relative mt-1">
                <Input
                  aria-label="Password"
                  type={show ? "text" : "password"}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-12 w-12"
                  aria-label={show ? "Hide password" : "Show password"}
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </label>
            {mode === "signup" && (
              <label className="flex items-start gap-3 text-sm">
                <Checkbox
                  checked={consent}
                  onCheckedChange={(v) => setConsent(v === true)}
                  aria-label="I'm 18 or older and agree to the Terms and Privacy Policy"
                  className="mt-1"
                />
                <span>
                  I'm 18 or older and agree to the{" "}
                  <Link to="/terms" className="underline">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="underline">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            )}
            <Button
              type="submit"
              variant="ink"
              size="xl"
              className="w-full"
              disabled={busy || (mode === "signup" && !consent)}
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>
          {mode === "signin" && (
            <Link to="/auth/forgot" className="mt-4 text-center text-sm underline">
              Forgot password?
            </Link>
          )}
          <Button
            variant="ghost"
            className="mt-4"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "New here? Create an account" : "Have an account? Sign in"}
          </Button>
        </>
      )}
      <div className="mt-6 flex justify-center gap-5 text-sm text-muted-foreground">
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
      </div>
    </main>
  );
}
