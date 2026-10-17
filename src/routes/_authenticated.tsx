import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { CalendarDays, Flame, LineChart, Timer, User } from "lucide-react";
import { useProfile } from "@/lib/data";
import { PageSkeleton } from "@/components/PageSkeleton";
import { Consent } from "@/components/Consent";
import { useAuth } from "@/lib/use-auth";

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
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", search: {mode: "signin", redirect: window.location.pathname} });
  }, [loading, session, navigate]);


  return (
    <div className="min-h-[100dvh] pb-24">
      <div className="mx-auto max-w-xl px-5 pt-6">
        {loading || !session || !profile ? <PageSkeleton /> : !profile.terms_accepted_at ? <Consent /> : <Outlet />}
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid max-w-xl grid-cols-5">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="flex flex-col items-center gap-1 py-3 text-[11px] text-muted-foreground"
              activeProps={{ className: "!text-foreground" }}>
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
