import { useTranslation } from "@/lib/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { pageHead } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export const Route = createFileRoute("/auth_/forgot")({
  head: () =>
    pageHead("Password recovery", "Request a secure password reset link.", "/auth/forgot"),
  component: Forgot,
});
function Forgot() {
  const { t } = useTranslation();
  const [email, setEmail] = useState(""),
    [sent, setSent] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <h1 className="text-4xl">{t("Reset your password")}</h1>
      {t(
        sent ? (
          <p className="mt-5">
            {t("If an account exists for that address, a reset link is on its way.")}
          </p>
        ) : (
          <form
            className="mt-6 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + "/reset-password",
              });
              setBusy(false);
              if (error) setError(error.message);
              else setSent(true);
            }}
          >
            <label>
              {t(" Email ")}
              <Input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <Button disabled={busy} type="submit" variant="ink" className="w-full">
              {t(" Send reset link ")}
            </Button>
            {t(error && <p role="alert">{t(error)}</p>)}
          </form>
        ),
      )}
      <Link to="/auth" search={{ mode: "signin" }} className="mt-6 block underline">
        {t(" Back to sign in ")}
      </Link>
    </main>
  );
}
