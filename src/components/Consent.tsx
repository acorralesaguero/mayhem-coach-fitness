import { useTranslation } from "@/lib/i18n";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/use-auth";
import { TERMS_VERSION } from "@/lib/brand";
import { supabase } from "@/integrations/supabase/client";
import { useRefresh } from "@/lib/data";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
export function Consent() {
  const { t } = useTranslation();
  const { user } = useAuth(),
    refresh = useRefresh();
  const [checked, setChecked] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <div className="py-12">
      <h1 className="text-4xl">{t("Before you begin")}</h1>
      <label className="mt-6 flex gap-3">
        <Checkbox
          checked={checked}
          onCheckedChange={(v) => setChecked(v === true)}
          aria-label={t("I'm 18 or older and agree to the Terms and Privacy Policy")}
        />
        <span>
          {t(" I'm 18 or older and agree to the")}
          {t(" ")}
          <Link to="/terms" className="underline">
            {t(" Terms ")}
          </Link>
          {t(" ")}
          {t(" and")}
          {t(" ")}
          <Link to="/privacy" className="underline">
            {t(" Privacy Policy ")}
          </Link>
          {t(" . ")}
        </span>
      </label>
      <Button
        disabled={!checked || busy}
        variant="ink"
        size="xl"
        className="mt-6 w-full"
        onClick={async () => {
          if (!user) return;
          setBusy(true);
          const { error } = await supabase
            .from("profiles")
            .update({ terms_accepted_at: new Date().toISOString(), terms_version: TERMS_VERSION })
            .eq("id", user.id);
          setBusy(false);
          if (error) setError(error.message);
          else await refresh();
        }}
      >
        {t(" Agree and continue ")}
      </Button>
      {t(
        error && (
          <p role="alert" className="mt-3">
            {t(error)}
          </p>
        ),
      )}
    </div>
  );
}
