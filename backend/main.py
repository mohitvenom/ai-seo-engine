from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import PipelineRequest, PipelineResponse
from agents.keyword_agent import run_keyword_agent
from agents.meta_agent import run_meta_agent
from agents.description_agent import run_description_agent
from agents.schema_agent import run_schema_agent

app = FastAPI(title="SEO Agentic Pipeline")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/pipeline", response_model=PipelineResponse)
async def run_pipeline(req: PipelineRequest):
    try:
        p = req.provider
        keywords = await run_keyword_agent(req.product, req.category, p)
        meta = await run_meta_agent(req.product, req.category, p)
        description = await run_description_agent(req.product, req.category, p)
        schema = await run_schema_agent(req.product, req.category, p)
        return PipelineResponse(keywords=keywords, meta=meta, description=description, schema=schema)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok"}