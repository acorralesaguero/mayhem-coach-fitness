import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useWorkouts } from "@/lib/data";
import { SITE_URL } from "@/lib/brand";
type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};
export function InstallPrompt() {
  const { data: works } = useWorkouts();
  const [event, setEvent] = useState<InstallEvent | null>(null),
    [ios, setIos] = useState(false),
    [hidden, setHidden] = useState(false);
  useEffect(() => {
    if (window.location.hostname !== new URL(SITE_URL).hostname || window.self !== window.top)
      return;
    setIos(
      /iPhone|iPad/.test(navigator.userAgent) &&
        !window.matchMedia("(display-mode: standalone)").matches,
    );
    const listener = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", listener);
    return () => window.removeEventListener("beforeinstallprompt", listener);
  }, []);
  if (hidden || (works?.filter((w) => w.completed).length ?? 0) < 2 || (!event && !ios))
    return null;
  return (
    <aside className="mx-auto max-w-xl border-b px-5 py-4">
      <p>{ios ? "Share, then Add to Home Screen" : "Add Forge to your home screen"}</p>
      <div className="mt-3 flex gap-3">
        {event && (
          <Button
            variant="ink"
            onClick={async () => {
              await event.prompt();
              setEvent(null);
            }}
          >
            Install
          </Button>
        )}
        <Button variant="ghost" onClick={() => setHidden(true)}>
          Not now
        </Button>
      </div>
    </aside>
  );
}
