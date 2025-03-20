from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel, HttpUrl
from .models import Project, WebsiteSummaryRequest, WebsiteSummaryResponse
from ..core.website import Website
from ..core.llm.factory import LLMFactory
from ..core.config import get_settings
import logging
from logging.handlers import RotatingFileHandler
import sys
from datetime import datetime

router = APIRouter()

# Configure logging with more detailed settings
def setup_logger():
    logger = logging.getLogger(__name__)
    logger.setLevel(logging.DEBUG)  # Set to DEBUG level to catch all logs

    # Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)
    console_format = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(console_format)
    
    # Clear any existing handlers to avoid duplication
    logger.handlers.clear()
    logger.addHandler(console_handler)
    
    # Prevent logger from propagating to root logger
    logger.propagate = False
    
    return logger

# Initialize logger
logger = setup_logger()

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
    url: str
    source: str

class WebsiteSummaryResponse(BaseModel):
    summary: str

class FileRequest(BaseModel):
    path: str

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
    logger.info("Starting website scraping")
    logger.debug(f"Received request: {request}")
    
    try:
        logger.info(f"Attempting to scrape URL: {request.url}")
        website = Website(request.url)
        logger.info(f"Successfully created website object: {website}")
        result = website.to_dict()
        logger.info(f"Returning scraped data: {result}")
        return result
    except Exception as e:
        logger.error(f"Scraping failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/summarize", response_model=WebsiteSummaryResponse)
async def summarize_website(request: WebsiteRequest):
    start_time = datetime.now()
    
    try:
        if request.source == "file":
            # Create website object from content
            website = Website.from_content("local_file", request.url)
        else:
            # Create website object from URL
            website = Website(request.url)

        logger.info(f"website: {website}")    
        # Rest of the summarization logic remains the same
        settings = get_settings()
        logger.info(f"settings: {settings}")
        llm_provider = LLMFactory.create(settings.DEFAULT_LLM_PROVIDER)
        logger.info(f"llm_provider: {llm_provider}")
        summary = await llm_provider.generate_summary(website.title, website.text)
        logger.info(f"summary: {summary}")
        
        return WebsiteSummaryResponse(summary=summary)
        
    except Exception as e:
        logger.error(f"Error during summarization: {str(e)}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/scrape-file")
async def scrape_file(request: FileRequest):
    try:
        with open(request.path, 'r', encoding='utf-8') as file:
            content = file.read()
            
        # Create a Website object from the file content
        website = Website.from_content(request.path, content)
        return website.to_dict()
    except Exception as e:
        logger.error(f"File scraping error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/test-logging")
async def test_logging():
    logger.debug("This is a debug message")
    logger.info("This is an info message")
    logger.warning("This is a warning message")
    logger.error("This is an error message")
    return {"message": "Logging test completed"} 