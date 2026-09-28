require('dotenv').config()
const { pool } = require('./config/db')

const MIGRATIONS = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        VARCHAR(50)  NOT NULL DEFAULT 'responder'
                CHECK (role IN ('admin','coordinator','responder','medic','logistics','viewer')),
  active      BOOLEAN NOT NULL DEFAULT true,
  last_login  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Incidents ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS incidents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           VARCHAR(255) NOT NULL,
  type            VARCHAR(100) NOT NULL DEFAULT 'Other',
  priority        VARCHAR(20)  NOT NULL DEFAULT 'medium'
                    CHECK (priority IN ('critical','high','medium','low')),
  status          VARCHAR(30)  NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','in_progress','pending','resolved','closed')),
  description     TEXT,
  latitude        DECIMAL(10,7),
  longitude       DECIMAL(10,7),
  address         VARCHAR(500),
  affected_count  INTEGER NOT NULL DEFAULT 0,
  assigned_team_id UUID,
  reported_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incidents_status   ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_priority ON incidents(priority);
CREATE INDEX IF NOT EXISTS idx_incidents_created  ON incidents(created_at DESC);

-- ── Survivors ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS survivors (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              VARCHAR(200),
  age               INTEGER CHECK (age >= 0 AND age <= 150),
  gender            VARCHAR(20)  DEFAULT 'unknown',
  status            VARCHAR(30)  NOT NULL DEFAULT 'missing'
                      CHECK (status IN ('missing','found','critical','rescued','deceased')),
  medical_condition VARCHAR(50)  NOT NULL DEFAULT 'unknown'
                      CHECK (medical_condition IN ('stable','serious','critical','unknown')),
  needs             VARCHAR(100) DEFAULT 'None',
  latitude          DECIMAL(10,7),
  longitude         DECIMAL(10,7),
  address           VARCHAR(500),
  contact_name      VARCHAR(200),
  contact_phone     VARCHAR(50),
  notes             TEXT,
  incident_id       UUID REFERENCES incidents(id) ON DELETE SET NULL,
  reported_by       UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_survivors_status ON survivors(status);

-- ── Teams ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teams (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           VARCHAR(200) NOT NULL,
  type           VARCHAR(100) NOT NULL DEFAULT 'Search & Rescue',
  status         VARCHAR(30)  NOT NULL DEFAULT 'available'
                   CHECK (status IN ('available','deployed','standby','offline')),
  leader_name    VARCHAR(200),
  leader_phone   VARCHAR(50),
  member_count   INTEGER NOT NULL DEFAULT 4 CHECK (member_count >= 0),
  latitude       DECIMAL(10,7),
  longitude      DECIMAL(10,7),
  base_location  VARCHAR(500),
  notes          TEXT,
  created_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teams_status ON teams(status);

-- ── Resources ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resources (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         VARCHAR(255) NOT NULL,
  type         VARCHAR(100) NOT NULL DEFAULT 'Other',
  status       VARCHAR(30)  NOT NULL DEFAULT 'available'
                 CHECK (status IN ('available','allocated','depleted','maintenance')),
  quantity     INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  unit         VARCHAR(50)  NOT NULL DEFAULT 'units',
  location     VARCHAR(500),
  assigned_to  VARCHAR(255),
  notes        TEXT,
  incident_id  UUID REFERENCES incidents(id) ON DELETE SET NULL,
  team_id      UUID REFERENCES teams(id) ON DELETE SET NULL,
  created_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Activity Log ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type        VARCHAR(50)  NOT NULL,
  message     TEXT NOT NULL,
  severity    VARCHAR(20)  NOT NULL DEFAULT 'low',
  entity_type VARCHAR(50),
  entity_id   UUID,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at DESC);

-- ── Auto-update updated_at trigger ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['incidents','survivors','teams','resources','users'] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_updated_at ON %I; CREATE TRIGGER trg_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at();',
      t, t
    );
  END LOOP;
END;
$$;
`

async function migrate() {
  console.log('🗄️  Running migrations...')
  try {
    await pool.query(MIGRATIONS)
    console.log('✅ Migrations complete.')
  } catch (err) {
    console.error('❌ Migration failed:', err.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

migrate()
