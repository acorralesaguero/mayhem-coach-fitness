CREATE OR REPLACE FUNCTION public.create_checkin_and_workout(checkin_data jsonb, workout_data jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE uid uuid := auth.uid(); cid uuid; wid uuid; wdate date;
BEGIN
IF uid IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=uid AND terms_accepted_at IS NOT NULL AND par_q_ack_at IS NOT NULL) THEN RAISE EXCEPTION 'Complete your exercise clearance and consent first'; END IF;
PERFORM pg_advisory_xact_lock(hashtextextended(uid::text,0));
wdate := COALESCE((workout_data->>'date')::date, CURRENT_DATE);
IF wdate < CURRENT_DATE - 1 OR wdate > CURRENT_DATE + 1 THEN RAISE EXCEPTION 'Invalid session date'; END IF;
SELECT id INTO wid FROM public.workouts WHERE user_id=uid AND workout_date=wdate ORDER BY created_at DESC LIMIT 1;
IF wid IS NOT NULL THEN RETURN wid; END IF;
IF checkin_data IS NOT NULL THEN
IF (checkin_data->>'energy')::int NOT BETWEEN 1 AND 5 OR (checkin_data->>'soreness')::int NOT BETWEEN 1 AND 5 OR (checkin_data->>'sleep_hours')::numeric NOT BETWEEN 0 AND 24 OR checkin_data->>'energy' IS NULL OR checkin_data->>'soreness' IS NULL OR checkin_data->>'sleep_hours' IS NULL THEN RAISE EXCEPTION 'Choose energy, soreness and sleep'; END IF;
INSERT INTO public.checkins(user_id,energy,soreness,sleep_hours,sleep_quality,stress,motivation,sleep_quality_detail,stress_detail,motivation_detail,notes,available_minutes)
VALUES(uid,(checkin_data->>'energy')::int,(checkin_data->>'soreness')::int,(checkin_data->>'sleep_hours')::numeric,COALESCE((checkin_data->>'sleep_quality')::int,3),COALESCE((checkin_data->>'stress')::int,3),COALESCE((checkin_data->>'motivation')::int,3),(checkin_data->>'sleep_quality')::int,(checkin_data->>'stress')::int,(checkin_data->>'motivation')::int,left(checkin_data->>'notes',500),(workout_data->>'duration')::int) RETURNING id INTO cid;
END IF;
IF (workout_data->>'duration')::int NOT IN (30,60,90) OR jsonb_typeof(workout_data->'plan'->'blocks') <> 'array' THEN RAISE EXCEPTION 'Invalid session'; END IF;
INSERT INTO public.workouts(user_id,checkin_id,duration,muscle_groups,title,plan,workout_date) VALUES(uid,cid,(workout_data->>'duration')::int,ARRAY(SELECT jsonb_array_elements_text(COALESCE(workout_data->'muscle_groups','[]'))),left(workout_data->>'title',200),workout_data->'plan',wdate) RETURNING id INTO wid;
RETURN wid;
END; $function$