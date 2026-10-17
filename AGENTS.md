<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Agent rules
- Start-screen branding uses an imported transparent logo asset and an icon derived from its symbol, keeping app identity consistent.
- Signed-in pages live under src/routes/_authenticated (client-only guard, bottom nav) — sessions live in browser storage.
- Workout content is typed data in library.ts; program.ts performs pure, tested selection, equipment/experience adaptation and percentage loading — separates authored content from athlete rules.
- Timer math is pure in src/lib/timer.ts with tests in src/test/timer.test.ts — keeps EMOM/Tabata logic verifiable.
- Exercise swaps are a pure stimulus-matched table in src/lib/swaps.ts (tested); free-text coach adjustments go through adjustWorkout in src/lib/coach.functions.ts, which only rewrites affected exercises — keeps fixed programming intact.

- Shared brand.ts drives copy and pageHead metadata; use cached user-keyed data.ts queries with 60s stale time — keeps identity and reads consistent.
- Check-ins and workouts are saved atomically through an owner-scoped database function; application ownership cascades through profiles — prevents partial saves and orphan account data.
- Nullable readiness detail fields replace legacy required fields without removing them — preserves compatibility while retaining omitted answers.
- Pure progress.ts owns numeric parsing, PR estimates, streaks and suggested-week templates — makes training rules independently testable.
- Public sample uses presentational WorkoutBlocks and expiring browser storage, while account operations use authenticated server functions — keeps public display free of privileged access.
- Service worker caches only allowlisted static files, never navigations or authenticated requests — prevents offline disclosure of account data.

- LanguageProvider stores an explicit English/Spanish browser preference; translate only displayed labels and keep canonical English equipment, exercise and profile values unchanged — language switching must not affect training logic.
