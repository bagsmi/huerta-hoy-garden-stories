-- Roles in separate table
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "user_roles read own" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Profiles: username rules
ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_format CHECK (username ~ '^[A-Za-z0-9_.]{3,20}$') NOT VALID;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_key ON public.profiles (lower(username));
ALTER TABLE public.profiles ADD CONSTRAINT profiles_bio_len CHECK (bio IS NULL OR char_length(bio) <= 300) NOT VALID;

-- Text limits
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_body_check;
ALTER TABLE public.comments ADD CONSTRAINT comments_body_check CHECK (char_length(body) BETWEEN 1 AND 300) NOT VALID;
ALTER TABLE public.posts ADD CONSTRAINT posts_plant_name_len CHECK (plant_name IS NULL OR char_length(plant_name) <= 80) NOT VALID;

-- Posts: allow author update
CREATE POLICY "posts update own" ON public.posts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Gardens: tighten update
DROP POLICY "gardens update own" ON public.gardens;
CREATE POLICY "gardens update own" ON public.gardens FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Reports: admins/moderators can read
CREATE POLICY "reports read admin" ON public.reports FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Storage: authenticated-only reads, image types only on upload
DROP POLICY IF EXISTS "photos read" ON storage.objects;
CREATE POLICY "photos read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'photos');
DROP POLICY IF EXISTS "photos insert own" ON storage.objects;
CREATE POLICY "photos insert own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text
    AND lower(storage.extension(name)) IN ('jpg','jpeg','png','webp'));
DROP POLICY IF EXISTS "photos delete own" ON storage.objects;
CREATE POLICY "photos delete own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text);