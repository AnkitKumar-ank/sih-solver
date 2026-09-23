CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  file_name text NOT NULL,
  storage_path text NOT NULL UNIQUE,
  mime_type text,
  size_bytes bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'uploaded',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own documents" ON public.documents FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view documents" ON public.documents FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.verification_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  verdict text NOT NULL,
  score integer NOT NULL,
  checks jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.verification_results TO authenticated;
GRANT ALL ON public.verification_results TO service_role;
ALTER TABLE public.verification_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own verification results" ON public.verification_results FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.screening_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  verification_id uuid NOT NULL REFERENCES public.verification_results(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  risk_level text NOT NULL,
  findings jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommendation text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.screening_reports TO authenticated;
GRANT ALL ON public.screening_reports TO service_role;
ALTER TABLE public.screening_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own screening reports" ON public.screening_reports FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX ON public.documents(user_id);
CREATE INDEX ON public.verification_results(document_id);
CREATE INDEX ON public.screening_reports(document_id);