update public.locations
set
  name = 'MacEwan University',
  city = 'Edmonton',
  region = 'AB'
where name = 'Main Campus';

update public.locations
set
  name = 'University of Alberta',
  city = 'Edmonton',
  region = 'AB'
where name = 'Downtown Campus';

insert into public.locations (name, city, region)
values
  ('MacEwan University', 'Edmonton', 'AB'),
  ('University of Alberta', 'Edmonton', 'AB')
on conflict (name) do update
set
  city = excluded.city,
  region = excluded.region;

delete from public.locations
where name not in ('MacEwan University', 'University of Alberta');
