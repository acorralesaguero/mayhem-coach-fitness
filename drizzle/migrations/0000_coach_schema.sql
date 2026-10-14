CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  current_body_type text,
  target_physique text,
  primary_goal text,
  build_focus text[] NOT NULL DEFAULT '{}',
  progression_style text,
  experience text,
  default_duration int NOT NULL DEFAULT 60,
  equipment text[] NOT NULL DEFAULT '{}',
  limitations text,
  onboarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE TABLE public.week_plan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  is_training boolean NOT NULL DEFAULT false,
  muscle_groups text[] NOT NULL DEFAULT '{}',
  duration int NOT NULL DEFAULT 60,
  UNIQUE (user_id, day_of_week)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.week_plan TO authenticated;
GRANT ALL ON public.week_plan TO service_role;
ALTER TABLE public.week_plan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own week" ON public.week_plan FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  checkin_date date NOT NULL DEFAULT current_date,
  energy int NOT NULL,
  sleep_hours numeric NOT NULL,
  sleep_quality int NOT NULL,
  stress int NOT NULL,
  soreness int NOT NULL,
  motivation int NOT NULL,
  day_outlook text,
  available_minutes int,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.checkins TO authenticated;
GRANT ALL ON public.checkins TO service_role;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own checkins" ON public.checkins FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  checkin_id uuid REFERENCES public.checkins(id) ON DELETE SET NULL,
  workout_date date NOT NULL DEFAULT current_date,
  duration int NOT NULL,
  muscle_groups text[] NOT NULL DEFAULT '{}',
  title text NOT NULL,
  plan jsonb NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  rpe int,
  feedback text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workouts TO authenticated;
GRANT ALL ON public.workouts TO service_role;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own workouts" ON public.workouts FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)));
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();