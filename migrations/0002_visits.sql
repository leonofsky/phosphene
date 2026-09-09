create table if not exists visits (
  id int primary key check (id = 1),
  count bigint not null default 0
);

insert into visits (id, count) values (1, 0)
on conflict (id) do nothing;
