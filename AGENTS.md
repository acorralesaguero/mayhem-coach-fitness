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
- Signed-in pages live under src/routes/_authenticated (client-only guard, bottom nav) — sessions live in browser storage.
- Workouts are fixed programming in src/lib/program.ts (pure, tested in src/test/program.test.ts); loads come from profile 1RMs × phase/wave × check-in readiness — keeps sessions consistent and verifiable.
- Timer math is pure in src/lib/timer.ts with tests in src/test/timer.test.ts — keeps EMOM/Tabata logic verifiable.
