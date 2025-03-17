from openai import OpenAI
from typing import Dict, Any
from .base import BaseLLMProvider
from ..config import get_settings

class OpenAIProvider(BaseLLMProvider):
    def __init__(self):
        self.client = None
        self.system_prompt = """You are an assistant that analyzes the contents of a website \
and provides a short summary, ignoring text that might be navigation related. \
Respond in markdown."""

    def initialize(self) -> None:
        settings = get_settings()
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)

    def validate_api_key(self) -> bool:
        settings = get_settings()
        api_key = settings.OPENAI_API_KEY
        return (
            api_key and 
            api_key.startswith("sk-") and 
            api_key.strip() == api_key
        )

    async def generate_summary(self, website_title: str, website_content: str) -> str:
        if not self.client:
            self.initialize()

        user_prompt = self._create_user_prompt(website_title, website_content)
        
        response = await self.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        )
        
        return response.choices[0].message.content

    def _create_user_prompt(self, website_title: str, website_content: str) -> str:
        return f"""You are looking at a website titled {website_title}
The contents of this website is as follows; please provide a short summary of this website in markdown. 
If it includes news or announcements, then summarize these too.

{website_content}""" 