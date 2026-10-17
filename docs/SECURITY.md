# Security review checks

Policies are drafted pending qualified legal review. Programming requires qualified coach review. Analytics and coach usage counters are deferred. AI timeout, output validation and token caps do not provide full abuse protection.

Run these read-only checks through Lovable Cloud database tools:

```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public';
SELECT tablename, policyname, roles, qual, with_check FROM pg_policies WHERE schemaname='public';
SELECT table_name, grantee, privilege_type FROM information_schema.role_table_grants WHERE table_schema='public';
SELECT conname, convalidated, pg_get_constraintdef(oid) FROM pg_constraint WHERE connamespace='public'::regnamespace;
SELECT count(*) FROM public.workouts w LEFT JOIN public.profiles p ON p.id=w.user_id WHERE p.id IS NULL;
SELECT count(*) FROM public.checkins c LEFT JOIN public.profiles p ON p.id=c.user_id WHERE p.id IS NULL;
SELECT count(*) FROM public.week_plan w LEFT JOIN public.profiles p ON p.id=w.user_id WHERE p.id IS NULL;
SELECT indexname, indexdef FROM pg_indexes WHERE schemaname='public';
SELECT proname, prosecdef, proacl FROM pg_proc WHERE pronamespace='public'::regnamespace;
```

Verify owner isolation with two authorized test accounts. Verify consent and exercise clearance before workout creation. Export all owned rows and verify account deletion only with an explicitly disposable test account. Never delete a real user's account for validation. Service worker must not cache navigation, API, authenticated requests or user data. Confirm deployed signup/recovery email settings separately; source configuration is not proof of hosted behavior.
