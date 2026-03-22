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

-- Sensor readings table
create table sensor_readings (
  id uuid default gen_random_uuid() primary key,
  intersection_id uuid references intersections(id),
  vehicle_count integer not null,
  average_speed float not null,
  congestion_score float not null,
  source text not null,
  recorded_at timestamp with time zone default now()
);


-- Signal timings table
create table signal_timings (
  id uuid default gen_random_uuid() primary key,
  intersection_id uuid references intersections(id),
  green_duration integer not null,
  red_duration integer not null,
  yellow_duration integer not null,
  applied_by text,
  applied_at timestamp with time zone default now()
);

