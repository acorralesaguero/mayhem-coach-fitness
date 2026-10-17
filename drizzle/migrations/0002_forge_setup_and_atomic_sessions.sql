ALTER TABLE public.profiles ADD COLUMN days_per_week integer NOT NULL DEFAULT 3, ADD COLUMN par_q_ack_at timestamptz, ADD COLUMN terms_accepted_at timestamptz, ADD COLUMN terms_version text;
ALTER TABLE public.week_plan ADD COLUMN suggested boolean NOT NULL DEFAULT false;
ALTER TABLE public.checkins ADD COLUMN sleep_quality_detail integer, ADD COLUMN stress_detail integer, ADD COLUMN motivation_detail integer;
UPDATE public.checkins SET sleep_quality_detail=sleep_quality, stress_detail=stress, motivation_detail=motivation;
COMMENT ON COLUMN public.checkins.sleep_quality IS 'DEPRECATED: replaced by nullable sleep_quality_detail; retained for older clients';
COMMENT ON COLUMN public.checkins.stress IS 'DEPRECATED: replaced by nullable stress_detail; retained for older clients';
COMMENT ON COLUMN public.checkins.motivation IS 'DEPRECATED: replaced by nullable motivation_detail; retained for older clients';
ALTER TABLE public.week_plan ADD CONSTRAINT week_profile_owner FOREIGN KEY(user_id) REFERENCES public.profiles(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE public.checkins ADD CONSTRAINT checkin_profile_owner FOREIGN KEY(user_id) REFERENCES public.profiles(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE public.workouts ADD CONSTRAINT workout_profile_owner FOREIGN KEY(user_id) REFERENCES public.profiles(id) ON DELETE CASCADE NOT VALID;
CREATE INDEX IF NOT EXISTS checkins_user_date ON public.checkins(user_id,checkin_date);
CREATE INDEX IF NOT EXISTS workouts_user_date ON public.workouts(user_id,workout_date);
CREATE INDEX IF NOT EXISTS workouts_user_created ON public.workouts(user_id,created_at);
CREATE OR REPLACE FUNCTION public.create_checkin_and_workout(checkin_data jsonb, workout_data jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE uid uuid := auth.uid(); cid uuid; wid uuid;
BEGIN
IF uid IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=uid AND terms_accepted_at IS NOT NULL AND par_q_ack_at IS NOT NULL) THEN RAISE EXCEPTION 'Complete your exercise clearance and consent first'; END IF;
PERFORM pg_advisory_xact_lock(hashtextextended(uid::text,0));
SELECT id INTO wid FROM public.workouts WHERE user_id=uid AND workout_date=CURRENT_DATE ORDER BY created_at DESC LIMIT 1;
IF wid IS NOT NULL THEN RETURN wid; END IF;
IF checkin_data IS NOT NULL THEN
IF (checkin_data->>'energy')::int NOT BETWEEN 1 AND 5 OR (checkin_data->>'soreness')::int NOT BETWEEN 1 AND 5 OR (checkin_data->>'sleep_hours')::numeric NOT BETWEEN 0 AND 24 OR checkin_data->>'energy' IS NULL OR checkin_data->>'soreness' IS NULL OR checkin_data->>'sleep_hours' IS NULL THEN RAISE EXCEPTION 'Choose energy, soreness and sleep'; END IF;
INSERT INTO public.checkins(user_id,energy,soreness,sleep_hours,sleep_quality,stress,motivation,sleep_quality_detail,stress_detail,motivation_detail,notes,available_minutes)
VALUES(uid,(checkin_data->>'energy')::int,(checkin_data->>'soreness')::int,(checkin_data->>'sleep_hours')::numeric,COALESCE((checkin_data->>'sleep_quality')::int,3),COALESCE((checkin_data->>'stress')::int,3),COALESCE((checkin_data->>'motivation')::int,3),(checkin_data->>'sleep_quality')::int,(checkin_data->>'stress')::int,(checkin_data->>'motivation')::int,left(checkin_data->>'notes',500),(workout_data->>'duration')::int) RETURNING id INTO cid;
END IF;
IF (workout_data->>'duration')::int NOT IN (30,60,90) OR jsonb_typeof(workout_data->'plan'->'blocks') <> 'array' THEN RAISE EXCEPTION 'Invalid session'; END IF;
INSERT INTO public.workouts(user_id,checkin_id,duration,muscle_groups,title,plan) VALUES(uid,cid,(workout_data->>'duration')::int,ARRAY(SELECT jsonb_array_elements_text(COALESCE(workout_data->'muscle_groups','[]'))),left(workout_data->>'title',200),workout_data->'plan') RETURNING id INTO wid;
RETURN wid;
END; $$;
REVOKE ALL ON FUNCTION public.create_checkin_and_workout(jsonb,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.create_checkin_and_workout(jsonb,jsonb) TO authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.profiles,public.checkins,public.workouts,public.week_plan TO authenticated;
GRANT ALL ON public.profiles,public.checkins,public.workouts,public.week_plan TO service_role;