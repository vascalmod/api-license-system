-- SQL Schema for existing licenses table (key column)
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table 1: redeem_tokens
-- ============================================
CREATE TABLE IF NOT EXISTS redeem_tokens (
  token VARCHAR(255) PRIMARY KEY,
  used BOOLEAN DEFAULT FALSE,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_redeem_tokens_token ON redeem_tokens(token);
CREATE INDEX IF NOT EXISTS idx_redeem_tokens_used ON redeem_tokens(used);

-- ============================================
-- Update existing licenses table
-- ============================================

-- Add missing columns to licenses table
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked'));
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS request_count INTEGER DEFAULT 0;
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS token VARCHAR(255);

-- Update expires_at based on duration_seconds or duration_days if not set
UPDATE licenses 
SET expires_at = created_at + (COALESCE(duration_seconds, duration_days * 86400, 28800) || ' seconds')::INTERVAL
WHERE expires_at IS NULL;

-- If status is null, set based on revoked column
UPDATE licenses 
SET status = CASE WHEN revoked = true THEN 'revoked' ELSE 'active' END
WHERE status IS NULL;

-- ============================================
-- Table 2: usage_logs (optional)
-- ============================================
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  api_key VARCHAR(255),
  endpoint_used TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT
);

-- Add foreign key if licenses.key exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
            WHERE table_name='licenses' AND column_name='key') THEN
    ALTER TABLE usage_logs DROP CONSTRAINT IF EXISTS usage_logs_api_key_fkey;
    ALTER TABLE usage_logs ADD CONSTRAINT usage_logs_api_key_fkey 
      FOREIGN KEY (api_key) REFERENCES licenses(key) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_usage_logs_api_key ON usage_logs(api_key);

-- ============================================
-- Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE redeem_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Service role only" ON redeem_tokens;
CREATE POLICY "Service role only" ON redeem_tokens
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role only" ON licenses;
CREATE POLICY "Service role only" ON licenses
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role only" ON usage_logs;
CREATE POLICY "Service role only" ON usage_logs
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- Helper Functions
-- ============================================
CREATE OR REPLACE FUNCTION update_expired_licenses()
RETURNS void AS $$
BEGIN
  UPDATE licenses
  SET status = 'expired'
  WHERE status = 'active' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
