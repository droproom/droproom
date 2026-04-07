-- ============================================
-- DROPROOM — Database Setup
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================
-- TABLES
-- ============================================

-- Brands (doubles as user profile, linked to Supabase Auth)
create table public.brands (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  email text not null,
  subscription_status text not null default 'active' check (subscription_status in ('active', 'suspended')),
  max_drops integer not null default 10,
  is_owner boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index brands_user_id_idx on public.brands(user_id);
create unique index brands_slug_idx on public.brands(slug);

-- Drops (images + videos for each brand)
create table public.drops (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  name text not null,
  media_url text not null,
  media_type text not null check (media_type in ('image', 'video')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index drops_brand_id_idx on public.drops(brand_id);

-- Brand invite codes (owner generates, brands consume on signup)
create table public.brand_invite_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  used boolean not null default false,
  used_by uuid references public.brands(id),
  created_at timestamptz not null default now()
);

-- Viewer codes (brands generate for buyers)
create table public.viewer_codes (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  code text not null,
  expires_at timestamptz not null,
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);

create index viewer_codes_brand_id_idx on public.viewer_codes(brand_id);
create index viewer_codes_code_idx on public.viewer_codes(code);

-- Viewer code usage log (for leak detection)
create table public.viewer_code_uses (
  id uuid primary key default gen_random_uuid(),
  viewer_code_id uuid not null references public.viewer_codes(id) on delete cascade,
  used_at timestamptz not null default now(),
  ip_address text,
  user_agent text
);

create index viewer_code_uses_code_id_idx on public.viewer_code_uses(viewer_code_id);

-- Brand contact methods (max 3 per brand, enforced in app)
create table public.brand_contacts (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  label text not null,
  url text not null,
  sort_order integer not null default 0
);

create index brand_contacts_brand_id_idx on public.brand_contacts(brand_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.brands enable row level security;
alter table public.drops enable row level security;
alter table public.brand_invite_codes enable row level security;
alter table public.viewer_codes enable row level security;
alter table public.viewer_code_uses enable row level security;
alter table public.brand_contacts enable row level security;

-- BRANDS policies
create policy "Owner sees all brands"
  on public.brands for select using (
    exists (select 1 from public.brands b where b.user_id = auth.uid() and b.is_owner = true)
  );

create policy "Brand sees own row"
  on public.brands for select using (user_id = auth.uid());

create policy "Brand updates own row"
  on public.brands for update using (user_id = auth.uid());

create policy "Owner updates any brand"
  on public.brands for update using (
    exists (select 1 from public.brands b where b.user_id = auth.uid() and b.is_owner = true)
  );

create policy "Brand inserts own row"
  on public.brands for insert with check (user_id = auth.uid());

-- DROPS policies
create policy "Brand reads own drops"
  on public.drops for select using (
    brand_id in (select id from public.brands where user_id = auth.uid())
  );

create policy "Brand inserts own drops"
  on public.drops for insert with check (
    brand_id in (select id from public.brands where user_id = auth.uid())
  );

create policy "Brand updates own drops"
  on public.drops for update using (
    brand_id in (select id from public.brands where user_id = auth.uid())
  );

create policy "Brand deletes own drops"
  on public.drops for delete using (
    brand_id in (select id from public.brands where user_id = auth.uid())
  );

-- BRAND INVITE CODES policies
create policy "Owner manages invite codes"
  on public.brand_invite_codes for all using (
    exists (select 1 from public.brands b where b.user_id = auth.uid() and b.is_owner = true)
  );

create policy "Anyone can check invite code validity"
  on public.brand_invite_codes for select using (true);

create policy "Signup can mark invite code used"
  on public.brand_invite_codes for update using (true);

-- VIEWER CODES policies
create policy "Brand reads own viewer codes"
  on public.viewer_codes for select using (
    brand_id in (select id from public.brands where user_id = auth.uid())
  );

create policy "Brand inserts own viewer codes"
  on public.viewer_codes for insert with check (
    brand_id in (select id from public.brands where user_id = auth.uid())
  );

create policy "Brand updates own viewer codes"
  on public.viewer_codes for update using (
    brand_id in (select id from public.brands where user_id = auth.uid())
  );

create policy "Brand deletes own viewer codes"
  on public.viewer_codes for delete using (
    brand_id in (select id from public.brands where user_id = auth.uid())
  );

-- VIEWER CODE USES policies
create policy "Brand reads own viewer code uses"
  on public.viewer_code_uses for select using (
    viewer_code_id in (
      select vc.id from public.viewer_codes vc
      join public.brands b on vc.brand_id = b.id
      where b.user_id = auth.uid()
    )
  );

create policy "Anyone can insert viewer code uses"
  on public.viewer_code_uses for insert with check (true);

-- BRAND CONTACTS policies
create policy "Brand reads own contacts"
  on public.brand_contacts for select using (
    brand_id in (select id from public.brands where user_id = auth.uid())
  );

create policy "Brand inserts own contacts"
  on public.brand_contacts for insert with check (
    brand_id in (select id from public.brands where user_id = auth.uid())
  );

create policy "Brand updates own contacts"
  on public.brand_contacts for update using (
    brand_id in (select id from public.brands where user_id = auth.uid())
  );

create policy "Brand deletes own contacts"
  on public.brand_contacts for delete using (
    brand_id in (select id from public.brands where user_id = auth.uid())
  );

-- ============================================
-- STORAGE BUCKET
-- ============================================

insert into storage.buckets (id, name, public)
values ('drops', 'drops', true);

-- Public read access for all files in the drops bucket
create policy "Public read access for drops"
  on storage.objects for select
  using (bucket_id = 'drops');

-- Authenticated users can upload to their brand folder
create policy "Authenticated users upload to drops"
  on storage.objects for insert
  with check (
    bucket_id = 'drops'
    and auth.role() = 'authenticated'
  );

-- Authenticated users can delete their uploads
create policy "Authenticated users delete own drops"
  on storage.objects for delete
  using (
    bucket_id = 'drops'
    and auth.role() = 'authenticated'
  );
