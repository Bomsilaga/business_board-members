# GLOBAL BUSINESS BOARD OF DIRECTORS
## Architecture & Database Schema Design

---

## **1. FINAL BOARD ROSTER (17 Directors)**

### **🇳🇬 NIGERIA (5)**
1. **Aliko Dangote** - Dangote Group (Cement, Sugar, Salt, Flour) | *Vertically-Integrated Industrialist*
2. **Tony Elumelu** - Heirs Holdings (Energy, Real Estate, Fintech, Hospitality) | *Pan-African Conglomerate Builder*
3. **Jim Ovia** - Zenith Bank (Banking, Fintech) | *Digital Financial Disruptor*
4. **Abdulsamad Rabiu** - BUA Group (Cement, Sugar, Real Estate) | *Counter-Cyclical Investor*
5. **Cosmas Maduka** - Coscharis Group (Auto Distribution, Imports) | *Logistics & Distribution Master*

### **🇦🇺 AUSTRALIA (2)**
1. **Gina Rinehart** - Hancock Prospecting (Mining, Iron Ore) | *Long-Term Resource Player*
2. **Frank Lowy** - Westfield Group (Real Estate, Shopping Centers) | *Global Real Estate Architect*

### **🇺🇸 NORTH AMERICA - USA (3)**
1. **Elon Musk** - Tesla, SpaceX, X | *First-Principles Innovator & Manufacturer*
2. **Bill Gates** - Microsoft (founder), Gates Foundation | *Tech Scaling & Systemic Impact*
3. **Satya Nadella** - Microsoft (CEO) | *Enterprise Cloud & Digital Transformation*

### **🇪🇺 EUROPE (2)**
1. **Bernard Arnault** - LVMH (Luxury Conglomerate) | *Brand Architecture & Acquisitions*
2. **Richard Branson** - Virgin Group (Diversified) | *Brand Culture & Risk Innovation*

### **🌏 ASIA (3)**
1. **N.R. Narayana Murthy** - Infosys (Tech Services) | *Bootstrapped Global Scaling*
2. **Jack Ma** - Alibaba (founder), Ant Group | *Platform Economy & SMB Empowerment*
3. **Mukesh Ambani** - Reliance Industries (Energy, Retail, Telecom, Tech) | *Integrated Industrial Conglomerate*

### **🌎 SOUTH AMERICA (1)**
1. **Jorge Paulo Lemann** - 3G Capital, AB InBev, Kraft Heinz | *Operational Efficiency & Leverage*

### **🌍 AFRICA Non-Nigeria (1)**
1. **Naguib Sawiris** - Orascom, Weather Investments (Telecom, Real Estate, Media) | *Emerging Market Navigator*

---

## **2. SYSTEM ARCHITECTURE**

```
┌─────────────────────────────────────────────────────────────┐
│                     VERCEL (Deployment)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────┐         ┌──────────────────────┐   │
│  │   Next.js Frontend   │         │  Next.js API Routes   │   │
│  │  ├─ QueryPage        │◄───────►├─ /api/query          │   │
│  │  ├─ ResponseCard     │         ├─ /api/responses      │   │
│  │  ├─ ConsensusView    │         ├─ /api/consensus      │   │
│  │  ├─ BoardProfiles    │         ├─ /api/board          │   │
│  │  └─ Dashboard        │         └─ /api/history        │   │
│  └─────────────────────┘         └──────────────────────┘   │
│           │                              │                    │
│           └──────────────────────────────┼────────────────┐   │
│                                          │                │   │
└──────────────────────────────────────────┼────────────────┘   │
                                           │                    
                    ┌──────────────────────┘                    
                    │                                           
        ┌───────────▼──────────────┐                           
        │   ANTHROPIC CLAUDE API   │                           
        │  ├─ Director Calls       │                           
        │  ├─ Consensus Synthesis  │                           
        │  └─ Response Generation  │                           
        └────────────────┬─────────┘                           
                         │                                      
        ┌────────────────▼───────────────┐                      
        │   SUPABASE (PostgreSQL)        │                      
        │  ├─ Auth (JWT)                 │                      
        │  ├─ Queries Table              │                      
        │  ├─ Responses Table            │                      
        │  ├─ Consensus Table            │                      
        │  ├─ Board Profiles Table       │                      
        │  ├─ Users Table                │                      
        │  └─ Query History Table        │                      
        └────────────────────────────────┘                      
```

---

## **3. DATABASE SCHEMA (PostgreSQL/Supabase)**

### **Table: `users`**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  subscription_tier VARCHAR(50) DEFAULT 'free', -- free, pro, enterprise
  queries_remaining INT DEFAULT 5
);
```

### **Table: `board_members`**
```sql
CREATE TABLE board_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  continent VARCHAR(50),
  country VARCHAR(100),
  expertise TEXT[], -- ['Tech', 'Finance', 'Manufacturing', 'Real Estate', 'Energy']
  bio TEXT,
  key_approach TEXT, -- their business philosophy/approach
  image_url VARCHAR(500),
  order_rank INT, -- display order
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Table: `queries`**
```sql
CREATE TABLE queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  question TEXT NOT NULL,
  category VARCHAR(100), -- 'startup', 'scaling', 'pivot', 'industry', 'diversification'
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, complete
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Table: `responses`**
```sql
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id UUID NOT NULL REFERENCES queries(id) ON DELETE CASCADE,
  board_member_id UUID NOT NULL REFERENCES board_members(id),
  response_text TEXT NOT NULL,
  confidence_score FLOAT, -- 0-1, how confident is this advice
  key_takeaway VARCHAR(255),
  generated_at TIMESTAMP DEFAULT NOW()
);
```

### **Table: `consensus`**
```sql
CREATE TABLE consensus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id UUID NOT NULL REFERENCES queries(id) ON DELETE CASCADE,
  consensus_response TEXT NOT NULL,
  areas_of_agreement TEXT[], -- key themes all directors agreed on
  areas_of_disagreement TEXT[], -- where directors diverged
  next_steps TEXT[],
  generated_at TIMESTAMP DEFAULT NOW()
);
```

### **Table: `query_history`**
```sql
CREATE TABLE query_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  query_id UUID NOT NULL REFERENCES queries(id) ON DELETE CASCADE,
  saved BOOLEAN DEFAULT TRUE,
  rating INT, -- 1-5 star rating by user
  tags VARCHAR(255)[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## **4. API DESIGN (Next.js Routes)**

### **POST /api/query**
Submit a business question to the board.

**Request:**
```json
{
  "title": "Should I start a tech startup or join an existing unicorn?",
  "question": "I have $500k capital and 10 years in enterprise software. Where should I deploy this?",
  "category": "career-finance"
}
```

**Response:**
```json
{
  "query_id": "uuid",
  "status": "processing",
  "estimated_wait": 60
}
```

**Process:**
1. Store query in DB
2. Trigger sequential director calls
3. Return query_id for polling

---

### **GET /api/responses/:queryId**
Fetch individual director responses (real-time as they arrive).

**Response:**
```json
{
  "query_id": "uuid",
  "responses": [
    {
      "board_member_id": "uuid",
      "name": "Elon Musk",
      "company": "Tesla/SpaceX",
      "response_text": "...",
      "key_takeaway": "...",
      "generated_at": "2026-06-18T..."
    },
    // ... more responses
  ],
  "progress": "7/17 complete"
}
```

---

### **POST /api/consensus**
Synthesize consensus from all director responses.

**Trigger:** Called automatically after all 17 directors have responded OR manually by user after waiting threshold.

**Response:**
```json
{
  "consensus_response": "The board unanimously agrees that...",
  "areas_of_agreement": [
    "Capital should be deployed in emerging markets",
    "Building vs. joining depends on market timing"
  ],
  "areas_of_disagreement": [
    "Elon prefers founder path; Satya prefers scaling inside large org"
  ],
  "next_steps": [
    "Model 3-year financial projections under both scenarios",
    "Build a network of potential co-founders",
    "Evaluate current market conditions in your tech vertical"
  ],
  "generated_at": "2026-06-18T..."
}
```

---

### **GET /api/board**
Fetch all board member profiles.

**Response:**
```json
{
  "board": [
    {
      "id": "uuid",
      "name": "Aliko Dangote",
      "company": "Dangote Group",
      "continent": "Africa",
      "country": "Nigeria",
      "expertise": ["Conglomerate Building", "Vertical Integration", "African Scale"],
      "bio": "Africa's richest person. Built $13B+ Dangote Group from cement to sugar to salt.",
      "key_approach": "Vertical integration, long-term vision, import substitution, operational excellence",
      "image_url": "..."
    },
    // ... 16 more
  ]
}
```

---

### **GET /api/history**
Fetch user's query history.

**Response:**
```json
{
  "queries": [
    {
      "query_id": "uuid",
      "title": "Should I start a tech startup...",
      "category": "career-finance",
      "created_at": "2026-06-18T...",
      "rating": 5,
      "saved": true
    }
  ]
}
```

---

## **5. DATA FLOW (Sequential Director Calls)**

```
User Query Submitted
         │
         ▼
Store in `queries` table (status: 'processing')
         │
         ▼
Loop: For each director (1-17, sequentially)
   │
   ├─► Call Claude API with director persona
   │   ├─ System prompt: Director's background, expertise, philosophy
   │   ├─ User prompt: The business question
   │   └─ Director responds (300-500 words)
   │
   ├─► Parse response, extract key_takeaway
   │
   ├─► Store in `responses` table
   │
   ├─► Notify frontend (WebSocket or polling)
   │   └─ UI updates: "3/17 directors have responded"
   │
   └─► Move to next director
         │
         ▼
    All 17 directors complete
         │
         ▼
    Call Claude with all 17 responses
    ├─ Synthesize areas of agreement
    ├─ Identify areas of disagreement
    ├─ Generate consensus response
    └─ Extract next steps
         │
         ▼
    Store in `consensus` table
         │
         ▼
    Update query status: 'complete'
         │
         ▼
    Frontend displays:
    ├─ Individual director cards (expandable)
    ├─ Consensus response
    └─ Next steps & action items
```

---

## **6. FRONTEND COMPONENTS (Next.js)**

### **QueryPage.tsx**
- Input form for business question
- Category dropdown (startup, scaling, pivot, etc.)
- Submit button
- Loading state with progress bar ("5/17 directors responding...")

### **ResponseCard.tsx**
- Director name, company, continent
- Individual response text
- Key takeaway highlight
- Expand/collapse for full response
- Sentiment/tone indicator (bullish, cautious, optimistic, etc.)

### **ConsensusView.tsx**
- Large consensus response panel
- "Areas of Agreement" section (collapsible)
- "Areas of Disagreement" section (collapsible)
- "Next Steps" action items
- Export to PDF button

### **BoardProfiles.tsx**
- Grid/carousel of all 17 board members
- Filter by continent, expertise, company
- Click to see full bio
- Save favorite directors

### **Dashboard.tsx**
- User's query history
- Recent responses
- Saved queries
- Analytics (most asked categories, etc.)

---

## **7. SKILL FILE STRUCTURE**

**Skill Name:** `global-board-orchestrator`

**Responsibility:**
- Director persona templates (17 unique personalities)
- Query analysis & routing
- Sequential API call orchestration
- Consensus synthesis logic
- Response validation & formatting

**Key Functions:**
```
getDirectorPersona(directorName) → SystemPrompt
generateDirectorResponse(persona, query) → ResponseText
analyzeQueryCategory(question) → Category
synthesizeConsensus(allResponses) → ConsensusObject
extractNextSteps(consensusResponse, query) → ActionItems
```

---

## **8. TECHNOLOGY STACK SUMMARY**

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 (React 18, TypeScript) | UI, routing, SSR |
| **Styling** | Tailwind CSS + shadcn/ui | Component library, theming |
| **Backend** | Next.js API Routes | Business logic, orchestration |
| **Database** | Supabase (PostgreSQL) | Data persistence, auth |
| **Auth** | Supabase Auth (JWT) | User authentication |
| **AI** | Anthropic Claude API | Director persona responses, consensus |
| **Deployment** | Vercel | Hosting, CI/CD |
| **Real-time** | Supabase Realtime (optional) | Live response updates |
| **Analytics** | Vercel Analytics + custom | Usage tracking |

---

## **9. NEXT STEPS**

1. ✅ **Finalize Director Personas** (detailed background, approach, expertise mapping)
2. ✅ **Create Skill File** (`global-board-orchestrator`)
3. ✅ **Build Next.js Frontend** (components, pages, styling)
4. ✅ **Implement API Routes** (query submission, response fetching, consensus synthesis)
5. ✅ **Setup Supabase** (schema creation, auth, RLS policies)
6. ✅ **Integrate Claude API** (sequential director calls, consensus synthesis)
7. ✅ **Deploy to Vercel** (environment setup, testing, launch)

---

**STATUS:** Architecture locked. Ready to build skill file next.
