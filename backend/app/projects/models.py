from pydantic import BaseModel

class Project(BaseModel):
    id: int
    title: str
    description: str
    image_url: str

class WebsiteSummaryRequest(BaseModel):
    website_title: str
    website_content: str

class WebsiteSummaryResponse(BaseModel):
    summary: str 