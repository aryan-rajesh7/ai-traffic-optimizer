-- Enable pgvector
create extension if not exists vector;
-- Intersections table

create table intersections (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  latitude float not null,
  longitude float not null,
  city text not null,
  created_at timestamp with time zone default now()
);