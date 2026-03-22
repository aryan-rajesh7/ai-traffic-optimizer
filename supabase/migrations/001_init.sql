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


-- Embeddings table for RAG
create table embeddings (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  embedding vector(768),
  source text not null,
  created_at timestamp with time zone default now()
);
-- Predictions table
create table predictions (
  id uuid default gen_random_uuid() primary key,
  intersection_id uuid references intersections(id),
  congestion_score float not null,
  predicted_at timestamp with time zone default now(),
  model_used text not null
);
-- Seed some sample intersections
insert into intersections (name, latitude, longitude, city) values
  ('5th Ave & Broadway', 40.7549, -73.9840, 'New York'),
  ('Market St & 5th St', 37.7836, -122.4089, 'San Francisco'),
  ('Michigan Ave & Chicago Ave', 41.8966, -87.6239, 'Chicago'),
  ('Sunset Blvd & Vine St', 34.0983, -118.3263, 'Los Angeles'),
  ('Pike St & 1st Ave', 47.6086, -122.3408, 'Seattle');
