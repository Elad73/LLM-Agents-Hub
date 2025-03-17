from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel, HttpUrl
from .models import Project, WebsiteSummaryRequest, WebsiteSummaryResponse
from ..core.website import Website
from ..core.llm.factory import LLMFactory
from ..core.config import get_settings
import logging
from datetime import datetime

router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
        print(f"Scraping error: {str(e)}")  # Add logging
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/summarize", response_model=WebsiteSummaryResponse)
async def summarize_website(request: WebsiteRequest):
    start_time = datetime.now()
    logger.info(f"Starting website summarization for URL: {request.url}")
    
    try:
        # Create website object
        logger.info("Fetching website content")
        website = Website(request.url)
        
        # Log website details
        logger.info(f"Website fetched successfully. Title: {website.title[:50]}...")
        logger.info(f"Content length: {len(website.text)} characters")
        
        # Get LLM provider
        settings = get_settings()
        logger.info(f"Using LLM provider: {settings.DEFAULT_LLM_PROVIDER}")
        llm_provider = LLMFactory.create(settings.DEFAULT_LLM_PROVIDER)
        
        # Generate summary
        logger.info("Generating summary using LLM")
        summary = await llm_provider.generate_summary(website.title, website.text)
        
        # Log summary details
        logger.info(f"Summary generated successfully. Length: {len(summary)} characters")
        
        # Calculate and log processing time
        processing_time = (datetime.now() - start_time).total_seconds()
        logger.info(f"Total processing time: {processing_time:.2f} seconds")
        
        return WebsiteSummaryResponse(summary=summary)
        
    except Exception as e:
        logger.error(f"Error during summarization: {str(e)}", exc_info=True)
        processing_time = (datetime.now() - start_time).total_seconds()
        logger.error(f"Failed after {processing_time:.2f} seconds")
        raise HTTPException(status_code=400, detail=str(e)) 