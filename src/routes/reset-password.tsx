import { useTranslation } from "@/lib/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { pageHead } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export const Route = createFileRoute("/reset-password")({
  head: () =>
    pageHead("New password", "Choose a new password for your Forge account.", "/reset-password"),
  component: Reset,
});
function Reset() {
  const { t } = useTranslation();
  const [ready, setReady] = useState(false),
    [password, setPassword] = useState(""),
    [show, setShow] = useState(false),
    [done, setDone] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
    return () => data.subscription.unsubscribe();
  }, []);
  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <h1 className="text-4xl">{t("Choose a new password")}</h1>
      {t(
        done ? (
          <>
            <p className="mt-5">{t("Password updated.")}</p>
            <Link to="/today" className="mt-5 block underline">
              {t(" Continue to your workout ")}
            </Link>
          </>
        ) : ready ? (
          <form
            className="mt-6 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              const { error } = await supabase.auth.updateUser({ password });
              setBusy(false);
              if (error) setError(error.message);
              else setDone(true);
            }}
          >
            <label>
              {t(" New password ")}
              <Input
                required
                minLength={8}
                autoComplete="new-password"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <Button type="button" variant="outline" onClick={() => setShow(!show)}>
              {t(show ? "Hide" : "Show")}
              {t(" password ")}
            </Button>
            <Button type="submit" variant="ink" disabled={busy} className="w-full">
              {t(" Update password ")}
            </Button>
            {t(error && <p role="alert">{t(error)}</p>)}
          </form>
        ) : (
          <p className="mt-5">{t("Open the password reset link from your email.")}</p>
        ),
      )}
    </main>
  );
}
