from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel, HttpUrl
from .models import Project, WebsiteSummaryRequest, WebsiteSummaryResponse
from ..core.website import Website
from ..core.llm.factory import LLMFactory
from ..core.config import get_settings

router = APIRouter()

# Sample projects data
projects = [
    Project(
        id=1,
        title="ScrapeMe",
        description="A website scraping tool",
        image_url="/images/scrape.png"
    ),
]

class ScrapeRequest(BaseModel):
    url: HttpUrl  # This validates the URL format

class WebsiteRequest(BaseModel):
    url: str  # Changed from HttpUrl to str to match frontend request

class WebsiteSummaryResponse(BaseModel):
    summary: str

@router.get("/", response_model=List[Project])
async def get_projects():
    return projects

@router.get("/{project_id}")
async def get_project(project_id: int):
    project = next((p for p in projects if p.id == project_id), None)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.post("/scrape")
async def scrape_website(request: WebsiteRequest):
    try:
        website = Website(request.url)
        return website.to_dict()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/summarize", response_model=WebsiteSummaryResponse)
async def summarize_website(request: WebsiteRequest):
    try:
        website = Website(request.url)
        settings = get_settings()
        llm_provider = LLMFactory.create(settings.DEFAULT_LLM_PROVIDER)
        summary = await llm_provider.generate_summary(website.title, website.text)
        return WebsiteSummaryResponse(summary=summary)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 