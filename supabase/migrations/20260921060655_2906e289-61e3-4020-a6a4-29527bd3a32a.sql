-- Roles
create type public.app_role as enum ('admin', 'researcher', 'official');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Users can view their own roles"
  on public.user_roles for select to authenticated
  using (auth.uid() = user_id);

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  organization text,
  designation text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select to authenticated
  using (auth.uid() = id);
create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users can insert their own profile"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Dataset catalog (public read)
create table public.datasets (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  category text not null,
  state text not null,
  volume text not null,
  updated_label text not null,
  access text not null default 'Open' check (access in ('Open', 'Restricted', 'Embargoed')),
  created_at timestamptz not null default now()
);
grant select on public.datasets to anon, authenticated;
grant all on public.datasets to service_role;
alter table public.datasets enable row level security;

create policy "Anyone can browse datasets"
  on public.datasets for select to anon, authenticated
  using (true);
create policy "Admins can manage datasets"
  on public.datasets for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

insert into public.datasets (code, name, category, state, volume, updated_label, access) values
  ('DS-1042', 'Khasra Survey Records (Village Level)', 'Cadastral', 'Uttar Pradesh', '48.2M', 'Sep 2026', 'Restricted'),
  ('DS-0987', 'Record of Rights (Khatauni) Digitized Register', 'Records', 'Bihar', '31.6M', 'Aug 2026', 'Open'),
  ('DS-1103', 'Bhu-Naksha Cadastral Map Tiles', 'Cadastral', 'Maharashtra', '2.1M maps', 'Sep 2026', 'Open'),
  ('DS-0765', 'Agricultural Land Use Classification (Sentinel-2)', 'Geospatial', 'All India', '40 TB', 'Sep 2026', 'Open'),
  ('DS-0512', 'Tenancy & Sharecropping Survey (NSS 79th Round)', 'Socio-Economic', 'All India', '112K hh', 'Jul 2026', 'Embargoed'),
  ('DS-1330', 'SVAMITVA Property Card Issuance Log', 'Records', 'Madhya Pradesh', '6.4M', 'Sep 2026', 'Open'),
  ('DS-0871', 'Land Acquisition & Compensation Awards', 'Legal', 'Rajasthan', '890K', 'Jun 2026', 'Restricted'),
  ('DS-1199', 'Jamabandi Registers (Historical 1980-2020)', 'Records', 'Haryana', '14.8M', 'May 2026', 'Restricted'),
  ('DS-0954', 'Tribal Land Rights (FRA) Claims Tracker', 'Legal', 'Odisha', '610K', 'Aug 2026', 'Open'),
  ('DS-1408', 'Urban Land Conversion & Zoning Changes', 'Geospatial', 'Karnataka', '340K', 'Sep 2026', 'Restricted'),
  ('DS-0688', 'Consolidation of Holdings Progress', 'Socio-Economic', 'Punjab', '2.9M', 'Apr 2026', 'Open'),
  ('DS-1256', 'Litigation Caseload - Land Disputes (Courts)', 'Legal', 'All India', '3.3M cases', 'Sep 2026', 'Embargoed');

-- Research archive (public read)
create table public.papers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  authors text not null,
  date_label text not null,
  topic text not null,
  summary text not null,
  citations integer not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.papers to anon, authenticated;
grant all on public.papers to service_role;
alter table public.papers enable row level security;

create policy "Anyone can browse papers"
  on public.papers for select to anon, authenticated
  using (true);
create policy "Admins can manage papers"
  on public.papers for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

insert into public.papers (title, authors, date_label, topic, summary, citations) values
  ('Impact of SVAMITVA Scheme on Collateralization of Abadi Land', 'Dr. Ananya Iyer · Dept of Rural Development', 'Aug 2026', 'Socio-Economic Study', 'An empirical analysis of credit flow to rural households after the issuance of digital property cards across 12,000 villages in Uttar Pradesh and Haryana.', 47),
  ('Standardizing Bhunaksha Protocols for Cross-State Interoperability', 'Rohan Deshmukh · Land Governance Fellow', 'Jul 2026', 'Technical Review', 'Evaluating the progress of the Unified Land Information System (ULIP) in harmonizing diverse cadastral mapping standards across western states.', 32),
  ('Tenancy Informality and the Model Tenancy Act: Evidence from Telangana', 'Dr. Kavya Reddy · CESS Hyderabad', 'Jun 2026', 'Policy Brief', 'Field survey of 4,800 sharecropping households suggesting formal registration could raise tenant investment in land improvement by 18-24%.', 58),
  ('Satellite Ground-Truthing of Record of Rights: A Karnataka Audit', 'MoRD Assessment Cell · DoLR', 'May 2026', 'Geospatial Audit', 'Comparing 1.2M digitized RoR entries against high-resolution satellite parcels; mismatch rate of 3.7% concentrated in older survey settlements.', 21),
  ('Land Dispute Litigation: Causes, Duration, and Digital Remedies', 'Dr. S. Bhattacharya · NLU Delhi', 'Apr 2026', 'Legal Study', 'Analysis of 3.3M land cases showing that districts with complete digitization dispose of title disputes 31% faster on average.', 89),
  ('Forest Rights Act Claims: Digitizing the Community Rights Ledger', 'Meera Vasquez · Tribal Research Institute, Odisha', 'Mar 2026', 'Policy Brief', 'Recommendations for a federated claims registry linking FRA record rooms with state land records for 610K pending claims.', 27);

-- Saved Policy Sandbox simulations (owner-only)
create table public.simulations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  state_name text not null,
  ceiling_ha numeric not null,
  digitization_target integer not null,
  compensation_multiplier numeric not null,
  results jsonb not null,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.simulations to authenticated;
grant all on public.simulations to service_role;
alter table public.simulations enable row level security;

create policy "Users manage their own simulations"
  on public.simulations for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Storage policies for the private documents bucket (bucket created separately)
create policy "Users can read files in their own folder"
  on storage.objects for select to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can upload files to their own folder"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can update files in their own folder"
  on storage.objects for update to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can delete files in their own folder"
  on storage.objects for delete to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);