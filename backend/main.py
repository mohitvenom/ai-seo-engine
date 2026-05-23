from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import PipelineRequest, PipelineResponse
from agents.keyword_agent import run_keyword_agent
from agents.meta_agent import run_meta_agent
from agents.description_agent import run_description_agent
from agents.schema_agent import run_schema_agent
from database import save_pipeline_result, get_pipeline_history, delete_pipeline_result

app = FastAPI(title="SEO Agentic Pipeline")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/pipeline", response_model=PipelineResponse)
async def run_pipeline(req: PipelineRequest):
    try:
        p = req.provider
        keywords    = await run_keyword_agent(req.product, req.category, p)
        meta        = await run_meta_agent(req.product, req.category, p)
        description = await run_description_agent(req.product, req.category, p)
        schema      = await run_schema_agent(req.product, req.category, p)

        result = PipelineResponse(
            keywords=keywords,
            meta=meta,
            description=description,
            schemaMarkup=schema
        )

        # Save to MongoDB
        await save_pipeline_result(
            product=req.product,
            category=req.category,
            provider=req.provider,
            result=result.model_dump()
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/history")
async def get_history(limit: int = 20):
    try:
        history = await get_pipeline_history(limit)
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/history/{result_id}")
async def delete_history(result_id: str):
    try:
        deleted = await delete_pipeline_result(result_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Result not found")
        return {"message": "Deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
def health():
    return {"status": "ok"}