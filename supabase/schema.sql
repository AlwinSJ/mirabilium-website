-- Run in your own Supabase project's SQL editor.
create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  name text not null check (char_length(trim(name)) between 2 and 40),
  message text not null check (char_length(trim(message)) between 10 and 500),
  rating smallint not null check (rating between 1 and 5),
  created_at timestamptz not null default now()
);
create index if not exists reviews_recent_idx on public.reviews (created_at desc);
alter table public.reviews enable row level security;
grant select, insert on public.reviews to anon;
create policy "Anyone can read reviews" on public.reviews for select to anon using (true);
create policy "Visitors can submit reviews" on public.reviews for insert to anon with check (true);
-- Intentionally no public update or delete permission. Public submissions can attract spam;
-- moderate unwanted posts in the Supabase dashboard. Add CAPTCHA/rate limiting for larger traffic.
