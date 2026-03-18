import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️  Supabase environment variables not set.\n' +
    'Copy .env.example to .env and fill in your Supabase project URL and anon key.\n' +
    'Get them from: https://supabase.com → your project → Settings → API'
  )
}

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder'
)

/* ── Auth helpers ── */
export const signUp = (email, password) =>
  supabase.auth.signUp({ email, password })

export const signIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password })

export const signOut = () =>
  supabase.auth.signOut()

export const getSession = () =>
  supabase.auth.getSession()

export const getUser = () =>
  supabase.auth.getUser()

/* ── Database helpers ── */

// Streak / Reading Calendar
export const upsertStreak = (userId, data) =>
  supabase.from('streaks').upsert({ user_id: userId, ...data })

export const getStreak = (userId) =>
  supabase.from('streaks').select('*').eq('user_id', userId).single()

// Prayer Wall
export const getPrayers = () =>
  supabase.from('prayers').select('*').order('created_at', { ascending: false })

export const insertPrayer = (prayer) =>
  supabase.from('prayers').insert(prayer)

export const incrementPrayCount = (id) =>
  supabase.rpc('increment_pray_count', { prayer_id: id })

// Sermon Notes
export const getNotes = (userId) =>
  supabase.from('sermon_notes').select('*').eq('user_id', userId).order('updated_at', { ascending: false })

export const upsertNote = (note) =>
  supabase.from('sermon_notes').upsert(note)

export const deleteNote = (id) =>
  supabase.from('sermon_notes').delete().eq('id', id)

// Badges
export const getBadges = (userId) =>
  supabase.from('badges').select('*').eq('user_id', userId)

export const awardBadge = (userId, badgeId) =>
  supabase.from('badges').upsert({ user_id: userId, badge_id: badgeId, earned_at: new Date().toISOString() })

/*
  ── Supabase Tables to Create ──

  Run these SQL commands in your Supabase dashboard → SQL Editor:

  -- Streaks table
  CREATE TABLE streaks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    streak INTEGER DEFAULT 0,
    last_checkin DATE,
    read_days TEXT[] DEFAULT '{}',
    checkin_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
  );

  -- Prayer Wall
  CREATE TABLE prayers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT DEFAULT 'Anonymous',
    category TEXT DEFAULT 'General',
    text TEXT NOT NULL,
    pray_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  -- Increment pray count (RPC function)
  CREATE OR REPLACE FUNCTION increment_pray_count(prayer_id UUID)
  RETURNS void LANGUAGE plpgsql AS $$
  BEGIN
    UPDATE prayers SET pray_count = pray_count + 1 WHERE id = prayer_id;
  END;
  $$;

  -- Sermon Notes
  CREATE TABLE sermon_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'Untitled',
    speaker TEXT,
    date DATE,
    scripture TEXT,
    content TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  -- Badges
  CREATE TABLE badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, badge_id)
  );

  -- Enable Row Level Security on all tables
  ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
  ALTER TABLE sermon_notes ENABLE ROW LEVEL SECURITY;
  ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

  -- Policies (users can only see/edit their own data)
  CREATE POLICY "Users own their streaks" ON streaks FOR ALL USING (auth.uid() = user_id);
  CREATE POLICY "Users own their notes" ON sermon_notes FOR ALL USING (auth.uid() = user_id);
  CREATE POLICY "Users own their badges" ON badges FOR ALL USING (auth.uid() = user_id);

  -- Prayer wall is public read, authenticated write
  ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Anyone can read prayers" ON prayers FOR SELECT USING (true);
  CREATE POLICY "Authenticated users can post" ON prayers FOR INSERT WITH CHECK (true);
*/
