-- GLOBAL BUSINESS BOARD OF DIRECTORS
-- Supabase PostgreSQL Schema
-- Execute this in Supabase SQL Editor to set up the database

-- ===================================================================
-- TABLE 1: USERS
-- ===================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  auth_id UUID UNIQUE, -- Links to Supabase Auth
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_tier VARCHAR(50) DEFAULT 'free', -- free, pro, enterprise
  queries_remaining INT DEFAULT 5,
  total_queries_used INT DEFAULT 0
);

-- Index for email lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);

-- ===================================================================
-- TABLE 2: BOARD MEMBERS
-- ===================================================================
CREATE TABLE IF NOT EXISTS board_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  continent VARCHAR(50),
  country VARCHAR(100),
  expertise TEXT[], -- Array of expertise areas
  bio TEXT, -- Detailed biography
  key_approach TEXT, -- Their business philosophy/approach
  system_prompt TEXT, -- Full Claude system prompt (from skill file)
  image_url VARCHAR(500),
  order_rank INT UNIQUE, -- Display order (1-17)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_continent CHECK (
    continent IN ('Africa', 'North America', 'South America', 'Europe', 'Asia', 'Oceania')
  )
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_board_members_continent ON board_members(continent);
CREATE INDEX IF NOT EXISTS idx_board_members_name ON board_members(name);
CREATE INDEX IF NOT EXISTS idx_board_members_order ON board_members(order_rank);

-- ===================================================================
-- TABLE 3: QUERIES
-- ===================================================================
CREATE TABLE IF NOT EXISTS queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  question TEXT NOT NULL,
  category VARCHAR(100), -- startup, scaling, pivot, diversification, industry, career-finance
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, complete, failed
  processing_started_at TIMESTAMP WITH TIME ZONE,
  processing_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (
    status IN ('pending', 'processing', 'complete', 'failed')
  ),
  CONSTRAINT valid_category CHECK (
    category IN ('startup', 'scaling', 'pivot', 'diversification', 'industry', 'career-finance', 'fintech', 'manufacturing', 'real-estate', 'africa-focused')
  )
);

-- Indexes for user and status lookups
CREATE INDEX IF NOT EXISTS idx_queries_user_id ON queries(user_id);
CREATE INDEX IF NOT EXISTS idx_queries_status ON queries(status);
CREATE INDEX IF NOT EXISTS idx_queries_category ON queries(category);
CREATE INDEX IF NOT EXISTS idx_queries_created_at ON queries(created_at DESC);

-- ===================================================================
-- TABLE 4: RESPONSES (Individual director responses)
-- ===================================================================
CREATE TABLE IF NOT EXISTS responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id UUID NOT NULL REFERENCES queries(id) ON DELETE CASCADE,
  board_member_id UUID NOT NULL REFERENCES board_members(id),
  
  response_text TEXT NOT NULL,
  key_takeaway VARCHAR(500),
  confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),
  
  -- Extracted metadata for UI
  sentiment VARCHAR(50), -- bullish, cautious, optimistic, skeptical, balanced
  has_warning BOOLEAN DEFAULT FALSE,
  warning_text TEXT,
  
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tokens_used INT, -- For cost tracking
  
  UNIQUE(query_id, board_member_id)
);

-- Indexes for quick lookups
CREATE INDEX IF NOT EXISTS idx_responses_query_id ON responses(query_id);
CREATE INDEX IF NOT EXISTS idx_responses_board_member_id ON responses(board_member_id);
CREATE INDEX IF NOT EXISTS idx_responses_sentiment ON responses(sentiment);

-- ===================================================================
-- TABLE 5: CONSENSUS
-- ===================================================================
CREATE TABLE IF NOT EXISTS consensus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id UUID NOT NULL UNIQUE REFERENCES queries(id) ON DELETE CASCADE,
  
  consensus_response TEXT NOT NULL,
  
  -- Extracted patterns
  areas_of_agreement TEXT[], -- Array of key agreement points
  areas_of_disagreement TEXT[], -- Array of disagreement points
  next_steps TEXT[], -- Actionable recommendations
  
  -- Top advisors for this specific query
  top_advisor_ids UUID[], -- Up to 5 most relevant directors
  
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tokens_used INT
);

-- Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_consensus_query_id ON consensus(query_id);

-- ===================================================================
-- TABLE 6: QUERY HISTORY / SAVED QUERIES
-- ===================================================================
CREATE TABLE IF NOT EXISTS query_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  query_id UUID NOT NULL REFERENCES queries(id) ON DELETE CASCADE,
  
  saved BOOLEAN DEFAULT TRUE,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  user_notes TEXT,
  tags VARCHAR(255)[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, query_id)
);

-- Index for user's saved queries
CREATE INDEX IF NOT EXISTS idx_query_history_user_id ON query_history(user_id);
CREATE INDEX IF NOT EXISTS idx_query_history_saved ON query_history(saved);
CREATE INDEX IF NOT EXISTS idx_query_history_rating ON query_history(rating DESC);

-- ===================================================================
-- TABLE 7: USER PREFERENCES
-- ===================================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Preferred directors (for filtering/focus)
  preferred_directors UUID[],
  
  -- Notification preferences
  email_notifications BOOLEAN DEFAULT TRUE,
  
  -- UI preferences
  dark_mode BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- TABLE 8: ANALYTICS / USAGE TRACKING
-- ===================================================================
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  query_id UUID REFERENCES queries(id) ON DELETE SET NULL,
  
  event_type VARCHAR(100), -- query_submitted, response_viewed, consensus_viewed, saved, rated
  event_data JSONB, -- Flexible data structure for different events
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at DESC);

-- ===================================================================
-- TABLE 9: API USAGE & RATE LIMITING
-- ===================================================================
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  endpoint VARCHAR(255), -- /api/query, /api/responses, etc.
  request_count INT DEFAULT 1,
  total_tokens_used INT DEFAULT 0,
  
  hour_window TIMESTAMP WITH TIME ZONE, -- Tracks hourly usage
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, endpoint, hour_window)
);

-- ===================================================================
-- ROW LEVEL SECURITY (RLS)
-- ===================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE consensus ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY users_self_policy ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_update_self ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can only see their own queries
CREATE POLICY queries_user_policy ON queries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY queries_insert_policy ON queries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can see responses for their own queries
CREATE POLICY responses_user_policy ON responses
  FOR SELECT USING (
    query_id IN (SELECT id FROM queries WHERE user_id = auth.uid())
  );

-- Board members are public read
ALTER TABLE board_members DISABLE ROW LEVEL SECURITY;

-- Users can see consensus for their queries
CREATE POLICY consensus_user_policy ON consensus
  FOR SELECT USING (
    query_id IN (SELECT id FROM queries WHERE user_id = auth.uid())
  );

-- Users can see their own history
CREATE POLICY query_history_user_policy ON query_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY query_history_insert_policy ON query_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===================================================================
-- SEED DATA: INSERT 17 BOARD MEMBERS
-- ===================================================================

INSERT INTO board_members (
  name, company, continent, country, expertise, bio, key_approach, order_rank
) VALUES

-- Nigeria (5)
(
  'Aliko Dangote', 'Dangote Group', 'Africa', 'Nigeria',
  ARRAY['Conglomerate Building', 'Vertical Integration', 'Industrial Scale', 'African Expansion'],
  'Africa''s richest person ($13B+). Built integrated conglomerate spanning cement, sugar, salt, flour, pasta, and real estate across Africa.',
  'Vertical integration, long-term vision, import substitution, operational excellence',
  1
),
(
  'Tony Elumelu', 'Heirs Holdings', 'Africa', 'Nigeria',
  ARRAY['Pan-African Expansion', 'Strategic M&A', 'Fintech', 'Wealth Creation', 'Energy'],
  'Founder of Heirs Holdings ($20B+ portfolio). Diversified across energy, real estate, hospitality, fintech, and tech. Pioneer of "Africapitalism."',
  'Pan-African expansion, strategic acquisitions, wealth creation philosophy',
  2
),
(
  'Jim Ovia', 'Zenith Bank', 'Africa', 'Nigeria',
  ARRAY['Digital Banking', 'Fintech Disruption', 'Financial Inclusion', 'Institutional Building', 'Tech Integration'],
  'Founder of Zenith Bank. Pioneer of digital banking and financial inclusion in Africa. Built Nigeria''s leading bank.',
  'Digital banking, financial inclusion, regulatory excellence, institutional platforms',
  3
),
(
  'Abdulsamad Rabiu', 'BUA Group', 'Africa', 'Nigeria',
  ARRAY['Operational Excellence', 'Counter-Cyclical Investing', 'Industrial Capacity', 'Cost Discipline'],
  'Founder of BUA Group ($4B+ net worth). Dominates cement, sugar, and real estate through operational excellence and counter-cyclical timing.',
  'Counter-cyclical investing, operational excellence, cost discipline, industrial scale',
  4
),
(
  'Cosmas Maduka', 'Coscharis Group', 'Africa', 'Nigeria',
  ARRAY['Logistics & Distribution', 'Import/Export Mastery', 'Supply Chain', 'Volume Scale'],
  'Founder of Coscharis Group ($1B+ revenue). Master of distribution networks and import/export logistics across Africa.',
  'Distribution networks, supply chain mastery, volume scaling, emerging market logistics',
  5
),

-- Australia (2)
(
  'Gina Rinehart', 'Hancock Prospecting', 'Oceania', 'Australia',
  ARRAY['Mining & Resources', 'Long-Term Capital', 'Operational Control', 'Market Cycles'],
  'Australia''s richest person ($30B+). Founder of Hancock Prospecting. Long-term player in mining and iron ore dominance.',
  'Long-term resource plays, operational control, independent strategy, capital discipline',
  6
),
(
  'Frank Lowy', 'Westfield Group', 'Oceania', 'Australia',
  ARRAY['Real Estate Cycles', 'Retail Architecture', 'Global Real Estate', 'Institutional Partnerships'],
  'Founder of Westfield Group. Global pioneer in shopping center development and retail real estate. Built $200B+ in property value.',
  'Real estate cycles, quality locations, institutional partnerships, patient capital',
  7
),

-- North America (3)
(
  'Elon Musk', 'Tesla / SpaceX / X', 'North America', 'USA',
  ARRAY['First-Principles Thinking', 'Manufacturing', 'Capital Efficiency', 'Moonshot Vision', 'Vertical Integration'],
  'Founder of Tesla, SpaceX, X, and Neuralink. Known for first-principles rethinking and manufacturing discipline. Market cap $1T+.',
  'First-principles innovation, vertical integration, manufacturing excellence, capital efficiency',
  8
),
(
  'Bill Gates', 'Microsoft / Gates Foundation', 'North America', 'USA',
  ARRAY['Software Scale', 'Data-Driven Decision Making', 'Global Health Impact', 'Platform Economics'],
  'Founder of Microsoft ($400B+). Co-chair of Gates Foundation. Shapes global health and development through philanthropy and innovation.',
  'Data-driven decisions, software platforms, global systemic impact, measured progress',
  9
),
(
  'Satya Nadella', 'Microsoft', 'North America', 'USA',
  ARRAY['Cloud Infrastructure', 'Digital Transformation', 'Enterprise Software', 'Culture & Learning', 'AI Integration'],
  'CEO of Microsoft since 2014. Transformed $400B company from stagnation to cloud dominance. Net worth $300M+.',
  'Cloud infrastructure, digital transformation, growth mindset, partnership ecosystems',
  10
),

-- Europe (2)
(
  'Bernard Arnault', 'LVMH', 'Europe', 'France',
  ARRAY['Luxury Brand Architecture', 'Acquisitions & Consolidation', 'Brand Positioning', 'Premium Pricing'],
  'World''s richest person ($211B+). CEO of LVMH. Built luxury empire spanning 75+ brands (Louis Vuitton, Dior, Celine, etc.).',
  'Luxury positioning, brand acquisition, heritage protection, premium pricing power',
  11
),
(
  'Richard Branson', 'Virgin Group', 'Europe', 'United Kingdom',
  ARRAY['Brand Building', 'Customer Experience', 'Calculated Risk-Taking', 'Employee Culture', 'Diversification'],
  'Founder of Virgin Group spanning airlines, trains, mobile, space, and entertainment. Net worth $3B+. Known for bold disruption.',
  'Brand personality, customer delight, calculated risk-taking, employee happiness',
  12
),

-- Asia (3)
(
  'N.R. Narayana Murthy', 'Infosys', 'Asia', 'India',
  ARRAY['Global Software Scaling', 'Bootstrapped Growth', 'Process Excellence', 'Values-Driven Business', 'Talent Development'],
  'Founder of Infosys ($20B+ company). Built global software company from $2,500. Pioneer of Indian IT industry. Net worth $2B+.',
  'Bootstrapped scaling, process excellence, values-driven culture, global talent',
  13
),
(
  'Jack Ma', 'Alibaba / Ant Group', 'Asia', 'China',
  ARRAY['Platform Economics', 'SMB Empowerment', 'Digital Ecosystems', 'East-West Bridges', 'Optimism & Risk'],
  'Founder of Alibaba ($600B market cap). Visionary of e-commerce and fintech in Asia. Net worth $25B+. Founder of Ant Group.',
  'Platform economics, SMB empowerment, billion-scale thinking, digital inclusion',
  14
),
(
  'Mukesh Ambani', 'Reliance Industries', 'Asia', 'India',
  ARRAY['Integrated Conglomerates', 'Energy & Telecom', 'Retail Scale', 'Technology Ambition', 'Government Relations'],
  'Chairman of Reliance Industries ($230B market cap). India''s largest company. Integrated across energy, retail, telecom, tech.',
  'Integrated conglomerates, vertical integration, India scale, backward integration',
  15
),

-- South America (1)
(
  'Jorge Paulo Lemann', '3G Capital', 'South America', 'Brazil',
  ARRAY['Operational Efficiency', 'Cost Discipline', 'Leveraged Acquisitions', 'PE Portfolio Approach', 'Turnarounds'],
  'Founder of 3G Capital. Net worth $30B+. Owner of AB InBev, Kraft Heinz, and numerous brands. Master of operational turnarounds.',
  'Operational efficiency, cost discipline, leveraged acquisitions, accountability',
  16
),

-- Africa Non-Nigeria (1)
(
  'Naguib Sawiris', 'Orascom / Weather Investments', 'Africa', 'Egypt',
  ARRAY['Emerging Market Telecom', 'Real Estate Development', 'Regulatory Navigation', 'Cross-Border Expansion'],
  'Founder of Orascom Telecom and Weather Investments. Net worth $3B+. Pioneer of telecom and real estate in Middle East/Africa.',
  'Emerging market navigation, telecom infrastructure, real estate, government relations',
  17
);

-- ===================================================================
-- VERIFICATION QUERIES
-- ===================================================================
-- Run these to verify the schema was created successfully

-- SELECT COUNT(*) FROM board_members; -- Should return 17
-- SELECT name, company, continent FROM board_members ORDER BY order_rank;
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'queries';

-- ===================================================================
-- END OF SCHEMA
-- ===================================================================
