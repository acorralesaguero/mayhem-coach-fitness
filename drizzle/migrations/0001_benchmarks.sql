ALTER TABLE public.profiles
 ADD COLUMN units text NOT NULL DEFAULT 'lb',
 ADD COLUMN bodyweight numeric, ADD COLUMN back_squat numeric, ADD COLUMN front_squat numeric,
 ADD COLUMN deadlift numeric, ADD COLUMN strict_press numeric, ADD COLUMN push_press numeric,
 ADD COLUMN clean_jerk numeric, ADD COLUMN snatch numeric,
 ADD COLUMN max_pullups integer, ADD COLUMN max_pushups integer;