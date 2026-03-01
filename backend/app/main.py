from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from app.schemas.project import ProjectCreate
from app.crawler.service import CrawlerService
from app.inference.service import InferenceService
from app.generator.service import GeneratorService
from pydantic import BaseModel
from typing import Dict, Any
import io

class CdcExport(BaseModel):
    metadata: Dict[str, Any]
    cdc: Dict[str, Any]

app = FastAPI(title="AutoCdC API", version="0.1.0")
crawler = CrawlerService()
inference = InferenceService()
generator = GeneratorService()

# Configure CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to AutoCdC API"}

@app.post("/crawl")
async def start_crawl(project: ProjectCreate):
    try:
        # Step 1: Crawl
        crawled_data = await crawler.crawl_url(str(project.url))
        
        # Step 2: Infer CdC
        cdc_result = await inference.generate_cdc(crawled_data)
        
        return {
            "metadata": {
                "url": crawled_data["url"],
                "title": crawled_data["title"]
            },
            "cdc": cdc_result
        }
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/export/pdf")
async def export_pdf(data: CdcExport):
    pdf_buffer = generator.generate_pdf(data.metadata, data.cdc)
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=cdc.pdf"}
    )

@app.post("/export/md")
async def export_md(data: CdcExport):
    md_content = generator.generate_markdown(data.metadata, data.cdc)
    return Response(
        content=md_content,
        media_type="text/markdown",
        headers={"Content-Disposition": f"attachment; filename=cdc.md"}
    )

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
