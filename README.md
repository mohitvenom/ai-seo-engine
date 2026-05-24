# 🔍 AI SEO Engine — Agentic Pipeline

> An AI-powered SEO automation tool built with 4 specialized agents, real-time Google data, and a production-grade full-stack architecture.

**Live Demo:** [ai-seo-engine-beta.vercel.app](https://ai-seo-engine-beta.vercel.app)  
**Backend API:** [ai-seo-engine-production.up.railway.app](https://ai-seo-engine-production.up.railway.app/health)

---

## 🚀 What It Does

Given any product name, the pipeline autonomously runs 4 specialized AI agents in sequence:

| Agent | Data Sources | Output |
|---|---|---|
| 🔍 Keyword Research | SerpAPI + pytrends + Google Autocomplete | Primary, secondary, long-tail keywords, intent clusters, voice search queries, trend score |
| 🏷️ Meta Content | ScraperAPI (competitor scraping) + LLM | Meta title, description, OG tags, URL slug |
| 📝 Product Description | LLM | Headline, short/long copy, bullet points, CTA |
| 🧩 Schema Markup | LLM | JSON-LD structured data, breadcrumb path |

---

## 🏗️ Architecture

```
React Dashboard (Vercel)
        ↓
FastAPI Backend (Railway)
        ↓
Agentic Pipeline
  ├── Keyword Agent  ← SerpAPI + pytrends + Google Autocomplete
  ├── Meta Agent     ← ScraperAPI + LLM
  ├── Description Agent ← LLM (OpenAI / Gemini)
  └── Schema Agent   ← LLM (OpenAI / Gemini)
        ↓
MongoDB Atlas
  ├── pipeline_results  (every run saved)
  └── trends_cache      (24hr TTL cache)
```

---

## 🛠️ Tech Stack

**Backend**
- Python, FastAPI, Uvicorn
- OpenAI GPT-4o Mini / Google Gemini 2.5 Flash
- Motor (async MongoDB driver)
- pytrends, SerpAPI, ScraperAPI, BeautifulSoup4

**Frontend**
- React 18, Vite
- Inline CSS (no UI library dependency)

**Infrastructure**
- MongoDB Atlas (M0 Free Tier)
- Railway (backend hosting)
- Vercel (frontend hosting)
- GitHub (version control + auto-deploy)

---

## ✨ Features

- **Multi-Provider Support** — switch between GPT-4o Mini and Gemini 2.5 Flash
- **Real SERP Data** — keywords grounded in actual Google search results via SerpAPI
- **Trend Scoring** — Google Trends integration with 24-hour MongoDB caching
- **Competitor Analysis** — scrapes top-ranking competitor meta tags via ScraperAPI
- **Persistent History** — every pipeline run saved to MongoDB, accessible across sessions
- **CSV Export** — one-click export of all agent outputs
- **Dark / Light Mode** — full theme toggle
- **Voice Search Optimization** — generates question-format queries from PAA data

---

## 📁 Project Structure

```
ai-seo-engine/
├── backend/
│   ├── agents/
│   │   ├── base.py              # LLM router (OpenAI + Gemini)
│   │   ├── fetchers.py          # SerpAPI, ScraperAPI, pytrends, Autocomplete
│   │   ├── keyword_agent.py
│   │   ├── meta_agent.py
│   │   ├── description_agent.py
│   │   └── schema_agent.py
│   ├── main.py                  # FastAPI app + endpoints
│   ├── models.py                # Pydantic schemas
│   ├── database.py              # MongoDB connection + CRUD
│   └── requirements.txt
└── frontend/
    └── src/
        ├── App.jsx              # Full dashboard UI
        └── api.js               # API client
```

---

## ⚙️ Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB Atlas account
- API keys: OpenAI, Gemini, SerpAPI, ScraperAPI

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

Create `backend/.env`:
```env
OPENAI_API_KEY=sk-xxxx
GEMINI_API_KEY=AIzaxxxx
SERPAPI_KEY=xxxx
SCRAPERAPI_KEY=xxxx
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/seo_engine
```

```bash
uvicorn main:app --reload
# API running at http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000
```

```bash
npm run dev
# Dashboard running at http://localhost:5173
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/pipeline` | Run full agentic pipeline |
| `GET` | `/history` | Get pipeline run history |
| `DELETE` | `/history/{id}` | Delete a history entry |
| `GET` | `/health` | Health check |

### Request Body
```json
{
  "product": "Wireless Headphones",
  "category": "Electronics",
  "provider": "openai"
}
```

---

## 🔑 Key Engineering Decisions

- **Async Python** — all agents and DB operations use `async/await` for non-blocking I/O
- **Trend Caching** — pytrends results cached in MongoDB for 24 hours to avoid Google rate limits
- **Graceful Degradation** — if any external API fails, the pipeline continues with empty defaults
- **Structured JSON outputs** — both OpenAI and Gemini forced to return strict JSON via `response_format`
- **Provider Abstraction** — single `call_llm()` function routes to any LLM provider

---

## 📄 License

MIT License — free to use and modify.