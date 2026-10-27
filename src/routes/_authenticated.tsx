import { useTranslation } from "@/lib/i18n";
import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { CalendarDays, Flame, LineChart, Timer, User } from "lucide-react";
import { useProfile } from "@/lib/data";
import { PageSkeleton } from "@/components/PageSkeleton";
import { InstallPrompt } from "@/components/InstallPrompt";
import { Consent } from "@/components/Consent";
import { useAuth } from "@/lib/use-auth";
import { LanguageSelector } from "@/components/LanguageSelector";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: Layout,
});

const NAV = [
  { to: "/today", label: "Today", icon: Flame },
  { to: "/week", label: "Week", icon: CalendarDays },
  { to: "/timer", label: "Timer", icon: Timer },
  { to: "/insights", label: "Insights", icon: LineChart },
  { to: "/profile", label: "Profile", icon: User },
] as const;

function Layout() {
  const { t } = useTranslation();
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  useEffect(() => {
    if (!loading && !session)
      navigate({ to: "/auth", search: { mode: "signin", redirect: window.location.pathname } });
  }, [loading, session, navigate]);

  return (
    <div className="min-h-[100dvh] pb-32">
      {t(session && <InstallPrompt />)}
      <div className="mx-auto flex max-w-3xl items-center justify-between px-5 pb-5 pt-6 sm:px-8">
        <Link to="/today" className="text-xl font-bold" aria-label={BRAND.name}>{BRAND.name}</Link>
        <LanguageSelector />
      </div>
      <div className="mx-auto max-w-3xl px-5 pt-2 sm:px-8">
        {t(
          loading || !session || !profile ? (
            <PageSkeleton />
          ) : !profile.terms_accepted_at ? (
            <Consent />
          ) : (
            <Outlet />
          ),
        )}
      </div>
      <nav aria-label={t("Forge")} className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto grid max-w-xl grid-cols-5 gap-1 rounded-full border bg-card/95 p-1.5 shadow-dock backdrop-blur-xl">
          {t(
            NAV.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex min-w-0 flex-col items-center gap-1 rounded-full py-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted"
                activeProps={{ className: "!bg-primary !text-primary-foreground" }}
              >
                <Icon className="h-5 w-5" />
                {t(label)}
              </Link>
            )),
          )}
        </div>
      </nav>
    </div>
  );
}
