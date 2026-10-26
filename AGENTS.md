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
- Start-page account links reflect the restored auth session and wait for hydration before offering sign-in — returning athletes should not see a false sign-in prompt.
- Workout content is typed data in library.ts; program.ts performs pure, tested selection, equipment/experience adaptation and percentage loading — separates authored content from athlete rules.
- Timer math is pure in src/lib/timer.ts with tests in src/test/timer.test.ts — keeps EMOM/Tabata logic verifiable.
- Exercise swaps are a pure stimulus-matched table in src/lib/swaps.ts (tested); free-text coach adjustments go through adjustWorkout in src/lib/coach.functions.ts, which only rewrites affected exercises — keeps fixed programming intact.

- Shared brand.ts drives copy and pageHead metadata; use cached user-keyed data.ts queries with 60s stale time — keeps identity and reads consistent.
- Check-ins and workouts are saved atomically through an owner-scoped database function; application ownership cascades through profiles — prevents partial saves and orphan account data.
- Nullable readiness detail fields replace legacy required fields without removing them — preserves compatibility while retaining omitted answers.
- Pure progress.ts owns numeric parsing, PR estimates, streaks and suggested-week templates — makes training rules independently testable.
- Public sample uses presentational WorkoutBlocks and expiring browser storage, while account operations use authenticated server functions — keeps public display free of privileged access.
- Service worker caches only allowlisted static files, never navigations or authenticated requests — prevents offline disclosure of account data.

- LanguageProvider honors an explicit browser preference before browser-language detection and supplies a shared locale; translate only displayed labels, notifications and chart names, not stored equipment, exercise, profile or user-authored values — both languages share training logic and state.
- Dynamic interface sentences use translateTemplate through useTranslation().tx, inserting translated labels or unchanged user values after translating the sentence — preserves grammar and prevents translation of names or training inputs.
- Language switching is one compact EN/ES segmented control rendered in each screen's header row (start page beside the sign-in button, account screens in the layout header), never a full-width bar — keeps the switch reachable without displacing content.
- Logging prefill is pure prefillActual in progress.ts (recent-log average, else prescription); Today quick start saves a workout without a check-in so insights only hold real answers.
