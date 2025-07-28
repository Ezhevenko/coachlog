-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.client_links (
  client_id uuid NOT NULL,
  coach_id uuid NOT NULL,
  CONSTRAINT client_links_pkey PRIMARY KEY (client_id, coach_id),
  CONSTRAINT client_links_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.users(id),
  CONSTRAINT client_links_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.users(id)
);
CREATE TABLE public.client_packages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  coach_id uuid NOT NULL,
  count integer NOT NULL DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT client_packages_pkey PRIMARY KEY (id),
  CONSTRAINT client_packages_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.users(id),
  CONSTRAINT client_packages_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.users(id)
);
CREATE TABLE public.client_invites (
  token text NOT NULL PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.users(id),
  coach_id uuid NOT NULL REFERENCES public.users(id),
  created_at timestamp without time zone DEFAULT now()
);
CREATE TABLE public.exercise_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  coach_id uuid,
  name text NOT NULL,
  CONSTRAINT exercise_categories_pkey PRIMARY KEY (id),
  CONSTRAINT exercise_categories_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.users(id)
);
CREATE TABLE public.exercise_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  workout_id uuid,
  exercise_id uuid,
  round integer NOT NULL,
  weight numeric,
  reps integer,
  performed_at timestamp without time zone DEFAULT now(),
  CONSTRAINT exercise_progress_pkey PRIMARY KEY (id),
  CONSTRAINT exercise_progress_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id),
  CONSTRAINT exercise_progress_workout_id_fkey FOREIGN KEY (workout_id) REFERENCES public.workouts(id)
);
CREATE TABLE public.exercises (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  coach_id uuid,
  category_id uuid,
  name text NOT NULL,
  CONSTRAINT exercises_pkey PRIMARY KEY (id),
  CONSTRAINT exercises_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.exercise_categories(id),
  CONSTRAINT exercises_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.users(id)
);
CREATE TABLE public.package_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  coach_id uuid NOT NULL,
  delta integer NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT package_history_pkey PRIMARY KEY (id),
  CONSTRAINT package_history_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.users(id),
  CONSTRAINT package_history_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_roles (
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['coach'::text, 'client'::text])),
  CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.active_roles (
  user_id uuid NOT NULL PRIMARY KEY,
  active_role text NOT NULL CHECK (active_role = ANY (ARRAY['coach'::text, 'client'::text])),
  CONSTRAINT active_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  telegram_id text NOT NULL UNIQUE,
  full_name text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.workout_exercises (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  workout_id uuid,
  exercise_id uuid,
  order_index integer NOT NULL,
  CONSTRAINT workout_exercises_pkey PRIMARY KEY (id),
  CONSTRAINT workout_exercises_workout_id_fkey FOREIGN KEY (workout_id) REFERENCES public.workouts(id),
  CONSTRAINT workout_exercises_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id)
);
CREATE TABLE public.workouts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id uuid,
  date date NOT NULL,
  time_start time without time zone,
  duration_minutes integer,
  rounds integer DEFAULT 1,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT workouts_pkey PRIMARY KEY (id),
  CONSTRAINT workouts_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.users(id)
);
