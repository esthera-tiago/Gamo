-- Gamo Database Schema
-- Run this in Supabase SQL Editor

-- 1. PROFILES TABLE
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LEVELS TABLE
CREATE TABLE levels (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  countries TEXT[] NOT NULL,
  unlock_requires INTEGER REFERENCES levels(id)
);

-- 3. USER PROGRESS TABLE
CREATE TABLE user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  level_id INTEGER REFERENCES levels(id),
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER DEFAULT 0,
  accuracy NUMERIC(5,2),
  time_seconds INTEGER,
  attempts INTEGER DEFAULT 0,
  last_played_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, level_id)
);

-- 4. SCORES TABLE
CREATE TABLE scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  level_id INTEGER REFERENCES levels(id),
  score INTEGER NOT NULL,
  accuracy NUMERIC(5,2),
  time_seconds INTEGER,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SEED LEVELS
INSERT INTO levels (id, name, slug, description, order_index, countries, unlock_requires) VALUES
  (1, 'North Africa', 'north-africa', 'Explore the northern countries from Morocco to Egypt', 1, ARRAY['DZ','EG','LY','MA','SD','TN','EH'], NULL),
  (2, 'West Africa', 'west-africa', 'Discover the vibrant nations of West Africa', 2, ARRAY['BJ','BF','CV','CI','GM','GH','GN','GW','LR','ML','MR','NE','NG','SN','SL','TG'], 1),
  (3, 'Central Africa', 'central-africa', 'Journey through the heart of the continent', 3, ARRAY['AO','CM','CF','TD','CG','CD','GQ','GA','ST'], 2),
  (4, 'East Africa', 'east-africa', 'Traverse the diverse lands of East Africa', 4, ARRAY['BI','DJ','ER','ET','KE','MG','MW','MU','MZ','RW','SC','SO','SS','TZ','UG','ZM','ZW'], 3),
  (5, 'Southern Africa', 'south-africa-region', 'Venture to the southern tip of Africa', 5, ARRAY['BW','LS','NA','SZ','ZA'], 4),
  (6, 'All Africa', 'all-africa', 'The ultimate challenge — find every country!', 6, ARRAY['ALL'], 5);

SELECT setval(pg_get_serial_sequence('levels', 'id'), 6);

-- 6. ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can read, only own profile can update
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- User progress: users can read/write only their own rows
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Scores: anyone can read, only insert own
CREATE POLICY "Scores are viewable by everyone"
  ON scores FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own scores"
  ON scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);
