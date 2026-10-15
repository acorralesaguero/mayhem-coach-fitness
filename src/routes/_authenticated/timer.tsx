import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { computeState, PRESETS, totalDuration, type TimerConfig, type TimerMode } from "@/lib/timer";
import { Button } from "@/components/ui/button";
import { Chips } from "@/components/Chips";
import { supabase } from "@/integrations/supabase/client";
import type { WorkoutPlan } from "@/lib/program";

const MODES: { key: TimerMode; label: string }[] = [
  { key: "fortime", label: "For time" },
  { key: "amrap", label: "AMRAP" },
  { key: "emom", label: "EMOM" },
  { key: "tabata", label: "Tabata" },
  { key: "intervals", label: "Intervals" },
];

export const Route = createFileRoute("/_authenticated/timer")({
  validateSearch: (s: Record<string, unknown>): { [K in keyof TimerConfig]?: TimerConfig[K] | undefined } & { w?: string; b?: number } => ({
    w: typeof s["w"] === "string" ? (s["w"] as string) : undefined,
    b: s["b"] != null ? Number(s["b"]) : undefined,
    mode: MODES.some((m) => m.key === s["mode"]) ? (s["mode"] as TimerMode) : undefined,
    work: s["work"] != null ? Number(s["work"]) : undefined,
    rest: s["rest"] != null ? Number(s["rest"]) : undefined,
    rounds: s["rounds"] != null ? Number(s["rounds"]) : undefined,
    cap: s["cap"] != null ? Number(s["cap"]) : undefined,
  }),
  head: () => ({ meta: [{ title: "Workout timer — Forge" }, { name: "description", content: "EMOM, AMRAP, Tabata, intervals and for-time clock." }] }),
  component: TimerPage,
});

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function beep(freq = 880, dur = 0.15) {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.frequency.value = freq; o.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(0.2, ctx.currentTime); o.start(); o.stop(ctx.currentTime + dur);
  } catch { /* ignore */ }
}

function TimerPage() {
  const search = Route.useSearch();
  const { w: wid, b: bidx, ...cfgSearch } = search;
  const initial: TimerConfig = { ...PRESETS[search.mode ?? "emom"], ...Object.fromEntries(Object.entries(cfgSearch).filter(([, v]) => v != null && !Number.isNaN(v))) } as TimerConfig;
  const [block, setBlock] = useState<WorkoutPlan["blocks"][number] | null>(null);
  useEffect(() => {
    if (!wid || bidx == null) return;
    supabase.from("workouts").select("plan").eq("id", wid).maybeSingle().then(({ data }) => setBlock((data?.plan as unknown as WorkoutPlan | undefined)?.blocks[bidx] ?? null));
  }, [wid, bidx]);
  const [cfg, setCfg] = useState<TimerConfig>(initial);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const startRef = useRef<number>(0);
  const baseRef = useRef(0);
  const lastKey = useRef("");

  useEffect(() => {
    if (!running) return;
    startRef.current = performance.now();
    const id = setInterval(() => setElapsed(baseRef.current + (performance.now() - startRef.current) / 1000), 200);
    return () => { clearInterval(id); baseRef.current += (performance.now() - startRef.current) / 1000; };
  }, [running]);

  useEffect(() => {
    if (countdown == null) return;
    if (countdown === 0) { beep(1200, 0.4); setCountdown(null); setRunning(true); return; }
    beep(660); const id = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  const st = computeState(cfg, elapsed);
  useEffect(() => {
    const key = `${st.phase}-${st.round}`;
    if (running && lastKey.current && key !== lastKey.current) beep(st.phase === "rest" ? 520 : 1000, 0.3);
    if (running && st.remaining <= 3 && st.remaining > 0 && st.phase !== "done") { /* subtle tick handled by phase change */ }
    lastKey.current = key;
    if (st.phase === "done" && running) { setRunning(false); beep(1200, 0.8); }
  }, [st.phase, st.round, st.remaining, running]);

  const reset = () => { setRunning(false); setCountdown(null); baseRef.current = 0; setElapsed(0); lastKey.current = ""; };
  const pick = (m: TimerMode) => { reset(); setCfg(PRESETS[m]); };
  const total = totalDuration(cfg);
  const progress = total ? Math.min(1, st.totalElapsed / total) : 0;
  const isRest = st.phase === "rest";
  const editable = !running && elapsed === 0 && countdown == null;
  const stopped = st.phase === "done" || (!running && countdown == null && elapsed > 0);
  const signal = stopped ? "!bg-stop text-ink-foreground" : isRest || countdown != null ? "!bg-rest text-signal-foreground" : running ? "!bg-go text-signal-foreground" : "!bg-ink text-ink-foreground";
  const big = cfg.mode === "fortime" ? fmt(st.totalElapsed) : fmt(st.remaining);

  return (
    <div className="space-y-5">
      <header><p className="eyebrow">Clock</p><h1 className="text-4xl">Timer</h1></header>
      <div className="-mx-1 overflow-x-auto px-1">
        <Chips options={MODES.map((m) => m.label)} value={MODES.find((m) => m.key === cfg.mode)!.label}
          onChange={(l: string) => pick(MODES.find((m) => m.label === l)!.key)} />
      </div>

      <div className={`surface relative overflow-hidden p-8 text-center transition-colors ${signal}`}>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-sand/70" style={{ width: `${progress * 100}%` }} />
        <p className="eyebrow !text-current opacity-80">
          {countdown != null ? "Get ready" : st.phase === "done" ? "Stop · Time" : stopped ? "Paused" : running && !isRest ? "Go" : isRest ? "Rest" : cfg.mode === "fortime" ? `Cap ${fmt(cfg.cap)}` : cfg.mode === "amrap" ? "AMRAP" : "Work"}
        </p>
        <div className="mt-2 font-display text-[6.5rem] leading-none tabular-nums">{countdown ?? big}</div>
        {(cfg.mode === "emom" || cfg.mode === "tabata" || cfg.mode === "intervals") && (
          <p className="mt-3 text-sm opacity-80">Round {Math.min(st.round, cfg.rounds)} of {cfg.rounds}</p>
        )}
        {cfg.mode === "amrap" && <RoundCounter key={String(editable)} />}
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-3">
        {running ? (
          <Button variant="outline" size="xl" className="rounded-full" onClick={() => setRunning(false)}><Pause /> Pause</Button>
        ) : (
          <Button variant="clay" size="xl" disabled={st.phase === "done"} onClick={() => (elapsed === 0 ? setCountdown(3) : setRunning(true))}>
            <Play /> {elapsed === 0 ? "Start" : "Resume"}
          </Button>
        )}
        <Button variant="outline" size="xl" className="rounded-full" onClick={reset} aria-label="Reset"><RotateCcw /></Button>
      </div>

      {block && (
        <section className="surface p-5">
          <p className="eyebrow">{block.minutes} min · {block.format}</p>
          <h2 className="mt-1 text-2xl">{block.name}</h2>
          <ul className="mt-3 divide-y">
            {block.exercises.map((e, j) => (
              <li key={j} className="flex items-baseline justify-between gap-3 py-2">
                <span className="min-w-0 font-medium">{e.name}</span>
                <span className="shrink-0 text-sm text-clay">{e.prescription}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {editable && (
        <section className="surface space-y-4 p-5">
          <p className="eyebrow">Settings</p>
          {(cfg.mode === "fortime" || cfg.mode === "amrap") && (
            <Stepper label={cfg.mode === "amrap" ? "Duration (min)" : "Time cap (min)"} value={cfg.cap / 60} min={1} max={90} onChange={(v) => setCfg({ ...cfg, cap: v * 60 })} />
          )}
          {cfg.mode === "emom" && (<>
            <Stepper label="Every (sec)" value={cfg.work} min={15} max={300} step={15} onChange={(v) => setCfg({ ...cfg, work: v })} />
            <Stepper label="Rounds" value={cfg.rounds} min={1} max={60} onChange={(v) => setCfg({ ...cfg, rounds: v })} />
          </>)}
          {(cfg.mode === "tabata" || cfg.mode === "intervals") && (<>
            <Stepper label="Work (sec)" value={cfg.work} min={5} max={600} step={5} onChange={(v) => setCfg({ ...cfg, work: v })} />
            <Stepper label="Rest (sec)" value={cfg.rest} min={0} max={600} step={5} onChange={(v) => setCfg({ ...cfg, rest: v })} />
            <Stepper label="Rounds" value={cfg.rounds} min={1} max={60} onChange={(v) => setCfg({ ...cfg, rounds: v })} />
          </>)}
          <p className="text-xs text-muted-foreground">Total {fmt(total)}</p>
        </section>
      )}
    </div>
  );
}

function Stepper({ label, value, onChange, min, max, step = 1 }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <button className="chip h-10 w-10 !p-0" onClick={() => onChange(Math.max(min, value - step))}>−</button>
        <span className="w-12 text-center font-display text-2xl tabular-nums">{value}</span>
        <button className="chip h-10 w-10 !p-0" onClick={() => onChange(Math.min(max, value + step))}>+</button>
      </div>
    </div>
  );
}

function RoundCounter() {
  const [n, setN] = useState(0);
  return (
    <button className="mt-4 rounded-full border border-sand/40 px-5 py-2 text-sm" onClick={() => setN(n + 1)}>
      Rounds: <span className="font-display text-xl">{n}</span> · tap +1
    </button>
  );
}
