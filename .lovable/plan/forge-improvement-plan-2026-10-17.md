# Forge improvement plan

Apply the six uploaded briefs as one coordinated upgrade, preserving Forge’s gender-neutral imagery and earth-tone style.

## Confirmed decisions
- No public contact email for now; omit the contact link instead of inventing an address.
- Defer anonymous analytics and coach usage limits. No tracking or custom usage counters will be added.
- Existing programming is a conservative draft for qualified coach review, not official third-party programming.

## 1. Complete the missing foundations
The briefs reference earlier prompts that are not present in this app. Add their necessary foundations: shared brand settings, reusable workout display, cached user-data reads, and an atomic check-in/workout save.

Preserve existing accounts and history. Link owned records through profiles so deleting an account removes its associated data safely.

## 2. Make workouts fit the athlete
- Move pre-written sessions into a typed library: at least 30 varied metcons, three recovery sessions, and rotating strength choices.
- Use equipment and experience to select compatible movements; bodyweight-only sessions need no equipment and beginner sessions exclude advanced movements.
- Keep percentage-based loads for known lifts, conservative defaults otherwise, and realistic block timings.
- Avoid repeats using recent workout titles and least-recently-used selection.
- Apply standing limitations and the day’s optional note through the existing coach adjustment, with clear failure feedback.

## 3. Rebuild the public entry and sample workout
- Add the requested landing sections, real sample session, FAQ, and primary no-account workout CTA.
- Keep the existing logo identity, optimize its size, optimize the gym photo, and self-host the current fonts.
- Add `/try` with duration, equipment and explicitly selected energy; show a read-only workout.
- Preserve a sample for up to 24 hours and save it after account setup if today has no workout.
- Centralize the brand and remove third-party affiliation references. No testimonials or unconfirmed pricing claims.

## 4. Simplify signup and setup
- Add signup/signin links, safe return destinations, email-confirmation/resend states, password visibility and recovery.
- Require age/terms consent for email and social sign-in.
- Add the three-step onboarding wizard with equipment, experience, 2–6 days, duration, units, goal, exercise-clearance acknowledgement and optional benchmarks.
- Generate the requested suggested weekly templates; keep them editable.
- Remove body-type/physique/build-focus/progression questions from visible forms, retaining stored data.
- Require explicitly chosen energy, soreness and sleep at check-in. Optional detail remains unset unless supplied.

## 5. Build the workout retention loop
- Save original and parsed numeric weights/reps, lift identities and block scores.
- Save AMRAP rounds/additional reps from the timer and finish times for timed blocks.
- Show completion recap, RPE, scores, PRs, weekly streak and next planned day; include copy-summary.
- Estimate lift PRs using Epley and offer benchmark updates at a 3% difference, never automatically.
- Replace Insights with readiness/sleep charts, eight-week session bars, PR board, history and the strictly gated non-causal sleep comparison.

## 6. Close safety and account-control gaps
- Add Privacy and Terms pages and links on landing, signup and Profile. These are drafts requiring legal review.
- Record consent version/time; add clear not-medical-advice notices.
- Add personal JSON export and account deletion with typed confirmation.
- Normalize coach notes, bound requests with timeout/token cap, validate returned structure and preserve unchanged exercises and existing logs.
- Add environment-file exclusions, an empty example and repeatable security-check documentation.
- Daily coach limits and analytics remain deferred by your choice.

## 7. Polish access, speed and installation
- Reuse cached user data across tabs, parallelize initial reads, prefetch where appropriate and replace loading text with skeletons.
- Add accessible selection states, descriptive labels, 44px targets, phase-only timer announcements, contrast checks and reduced-motion support.
- Add installable app metadata/icons and an install prompt after the second completed workout.
- Cache static assets only, never authenticated pages or data; disable registration inside editor previews.

## Technical safeguards
- Continue using TanStack Start and Lovable Cloud with authenticated server functions and owner-scoped access.
- Use additive changes for existing data; application records reference `public.profiles`, not new direct links to managed auth records.
- Put share metadata on each content page, including canonical URLs and cover images where appropriate; do not put cover-image tags on the shared root.
- Keep workout selection, equipment substitution, numeric parsing, PR estimates, streaks and pattern rules pure and tested.

## Validation and delivery
Implement in the ordered phases above, updating the roadmap as each completes. Run focused tests for the requested rules and verify public sample → signup/setup → check-in → log/swap → timer score → completion → Insights with a real signed-in account where available. Check phone and desktop layouts, recovery/consent states, export and safe deletion behavior, and current app errors before claiming completion.

**Not included:** publishing, analytics collection, coach usage limits, an invented support email, or a claim of legal/medical approval.