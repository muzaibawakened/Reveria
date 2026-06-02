-- ============================================
-- Reveria: Dreams Table Schema
-- ============================================
-- Run this in the Supabase SQL Editor:
-- Dashboard → SQL Editor → New Query → Paste this → Run
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Dreams table
CREATE TABLE IF NOT EXISTS dreams (
  -- Primary key
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Core dream content
  raw TEXT NOT NULL,                          -- Original transcription or typed text
  structured TEXT,                             -- AI-cleaned version of the dream

  -- AI-generated metadata
  title TEXT DEFAULT 'Untitled Dream',         -- AI-generated title
  mood TEXT DEFAULT 'reflective',              -- AI-detected mood (e.g., peaceful, anxious)
  mood_color TEXT DEFAULT '#7c6aef',           -- Hex color for the mood
  mood_score FLOAT DEFAULT 0.5,                -- 0.0 to 1.0 intensity
  tags TEXT[] DEFAULT '{}',                    -- AI-generated tags (e.g., {"flying","ocean"})

  -- Metadata
  entry_type TEXT DEFAULT 'voice' CHECK (entry_type IN ('voice', 'text')),
  duration TEXT,                               -- Recording duration (e.g., "2:34")
  ai_status TEXT DEFAULT 'pending'             -- 'pending' | 'processing' | 'done' | 'error'
    CHECK (ai_status IN ('pending', 'processing', 'done', 'error')),
  ai_error TEXT,                               -- Error message if processing failed

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for sorting dreams by date (most recent first)
CREATE INDEX IF NOT EXISTS idx_dreams_created_at
  ON dreams (created_at DESC);

-- Index for filtering by AI status (for the realtime subscription)
CREATE INDEX IF NOT EXISTS idx_dreams_ai_status
  ON dreams (ai_status);

-- ============================================
-- Row Level Security (RLS)
-- ============================================
-- For now, this is a single-user app, so we allow all operations.
-- When you add authentication later, you'd restrict by user_id.
-- ============================================

ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anonymous users (single-user mode)
CREATE POLICY "Allow all operations on dreams"
  ON dreams
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Auto-update the updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER dreams_updated_at
  BEFORE UPDATE ON dreams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();