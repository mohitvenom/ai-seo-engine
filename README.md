# AI SEO Engine — Agentic Pipeline

An AI-powered SEO automation tool with 4 specialized agents, FastAPI backend, and React dashboard.

## Tech Stack
- **Backend**: Python, FastAPI, OpenAI / Gemini
- **Data**: SerpAPI, ScraperAPI, pytrends, Google Autocomplete
- **Frontend**: React, Vite

## Agents
| Agent | Data Sources |
|---|---|
| Keyword Research | SerpAPI + pytrends + Google Autocomplete |
| Meta Content | ScraperAPI (competitor scraping) + LLM |
| Product Description | LLM |
| Schema Markup | LLM |

## Setup

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd seo-agent
```

### 2. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` in `/backend`:
```
OPENAI_API_KEY=sk-xxxx
GEMINI_API_KEY=AIzaxxxx
SERPAPI_KEY=xxxx
SCRAPERAPI_KEY=xxxx
```

Run:
```bash
uvicorn main:app --reload
```
API runs at: `http://localhost:8000`

### 3. Frontend
```bash
cd frontend
npm install
```

Create `.env` in `/frontend`:
```
VITE_API_URL=http://localhost:8000
```

Run:
```bash
npm run dev
```
Dashboard runs at: `http://localhost:5173`

## API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | `/pipeline` | Run full agentic pipeline |
| GET | `/health` | Health check |

### Request Body
```json
{
  "product": "Wireless Headphones",
  "category": "Electronics",
  "provider": "openai"
}
```
`provider` can be `"openai"` or `"gemini"`

## .gitignore
Make sure to add:
```
backend/.env
frontend/.env
backend/venv/
__pycache__/
```