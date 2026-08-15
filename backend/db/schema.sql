-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  repo VARCHAR(255) NOT NULL UNIQUE,
  github_stars INTEGER NOT NULL DEFAULT 0 CHECK (github_stars >= 0),
  featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Safe for databases created before GitHub star ranking was introduced.
ALTER TABLE projects ADD COLUMN IF NOT EXISTS github_stars INTEGER NOT NULL DEFAULT 0;

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_projects_github_stars ON projects(github_stars DESC);
CREATE INDEX IF NOT EXISTS idx_projects_display_order ON projects(display_order);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Privacy-conscious analytics. These tables deliberately contain no IP address,
-- email address, raw user-agent, or browser fingerprint data.
CREATE TABLE IF NOT EXISTS analytics_visitors (
  id UUID PRIMARY KEY,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  visit_count INTEGER NOT NULL DEFAULT 0 CHECK (visit_count >= 0)
);

CREATE TABLE IF NOT EXISTS analytics_sessions (
  id UUID PRIMARY KEY,
  visitor_id UUID NOT NULL REFERENCES analytics_visitors(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMPTZ,
  entry_page VARCHAR(200) NOT NULL,
  exit_page VARCHAR(200),
  referrer_source VARCHAR(32) NOT NULL DEFAULT 'Direct',
  referrer_host VARCHAR(255),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  country VARCHAR(100),
  region VARCHAR(100),
  city VARCHAR(100),
  ip_address INET,
  device_type VARCHAR(20) NOT NULL DEFAULT 'Other',
  browser VARCHAR(50) NOT NULL DEFAULT 'Other',
  operating_system VARCHAR(50) NOT NULL DEFAULT 'Other',
  screen_size VARCHAR(20) NOT NULL DEFAULT 'Unknown',
  CHECK (ended_at IS NULL OR ended_at >= started_at)
);

-- Safe upgrades for installations that ran the earlier analytics migration.
ALTER TABLE analytics_sessions ADD COLUMN IF NOT EXISTS ip_address INET;

CREATE TABLE IF NOT EXISTS analytics_consents (
  id BIGSERIAL PRIMARY KEY,
  visitor_id UUID NOT NULL REFERENCES analytics_visitors(id) ON DELETE CASCADE,
  status VARCHAR(16) NOT NULL CHECK (status IN ('allowed', 'withdrawn')),
  consent_version VARCHAR(32) NOT NULL,
  granted_at TIMESTAMPTZ,
  withdrawn_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics_page_views (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES analytics_sessions(id) ON DELETE CASCADE,
  path VARCHAR(200) NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0 AND duration_seconds <= 86400),
  CHECK (ended_at IS NULL OR ended_at >= started_at)
);

CREATE TABLE IF NOT EXISTS analytics_project_views (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES analytics_sessions(id) ON DELETE CASCADE,
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  project_name VARCHAR(255) NOT NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES analytics_sessions(id) ON DELETE CASCADE,
  event_name VARCHAR(50) NOT NULL,
  page_path VARCHAR(200),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_analytics_visitors_last_seen ON analytics_visitors(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_started ON analytics_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_visitor ON analytics_sessions(visitor_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_session ON analytics_page_views(session_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_path ON analytics_page_views(path, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_project_views_project ON analytics_project_views(project_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_consents_visitor ON analytics_consents(visitor_id, created_at DESC);
