ALTER TABLE public.week_plan VALIDATE CONSTRAINT week_profile_owner;
ALTER TABLE public.checkins VALIDATE CONSTRAINT checkin_profile_owner;
ALTER TABLE public.workouts VALIDATE CONSTRAINT workout_profile_owner;
CREATE OR REPLACE FUNCTION public.validate_forge_inputs() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
IF TG_TABLE_NAME='profiles' THEN
IF NEW.days_per_week NOT BETWEEN 2 AND 6 OR NEW.default_duration NOT IN (30,60,90) OR NEW.units NOT IN ('lb','kg') THEN RAISE EXCEPTION 'Choose 2-6 days, 30/60/90 minutes and lb or kg'; END IF;
ELSIF TG_TABLE_NAME='checkins' THEN
IF NEW.energy NOT BETWEEN 1 AND 5 OR NEW.soreness NOT BETWEEN 1 AND 5 OR NEW.sleep_hours NOT BETWEEN 0 AND 24 OR (NEW.sleep_quality_detail IS NOT NULL AND NEW.sleep_quality_detail NOT BETWEEN 1 AND 5) OR (NEW.stress_detail IS NOT NULL AND NEW.stress_detail NOT BETWEEN 1 AND 5) OR (NEW.motivation_detail IS NOT NULL AND NEW.motivation_detail NOT BETWEEN 1 AND 5) THEN RAISE EXCEPTION 'Invalid readiness value'; END IF;
ELSIF TG_TABLE_NAME='week_plan' THEN
IF NEW.day_of_week NOT BETWEEN 0 AND 6 OR NEW.duration NOT IN (30,60,90) THEN RAISE EXCEPTION 'Invalid week plan'; END IF;
END IF; RETURN NEW;
END; $$;
CREATE TRIGGER validate_profile_inputs BEFORE INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.validate_forge_inputs();
CREATE TRIGGER validate_checkin_inputs BEFORE INSERT OR UPDATE ON public.checkins FOR EACH ROW EXECUTE FUNCTION public.validate_forge_inputs();
CREATE TRIGGER validate_week_inputs BEFORE INSERT OR UPDATE ON public.week_plan FOR EACH ROW EXECUTE FUNCTION public.validate_forge_inputs();