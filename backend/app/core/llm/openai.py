from openai import AsyncOpenAI, OpenAIError
from typing import Dict, Any
from .base import BaseLLMProvider
from ..config import get_settings
import logging

logger = logging.getLogger(__name__)

class OpenAIProvider(BaseLLMProvider):
    def __init__(self):
        self.client = None


    def initialize(self) -> None:
        settings = get_settings()
        if not settings.OPENAI_API_KEY:
            raise ValueError("OpenAI API key not found")
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    # See how this function creates exactly the format above
    def messages_for(self, system_prompt: str, user_prompt: str):
        return [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    
    def _create_user_prompt(self, title: str, content: str, type: str) -> str:
        return f"""You are looking at a {type} titled {title}
The contents of this {type} is as follows; please provide a short summary in markdown.
If it includes news or announcements, then summarize these too.

{content}""" 

    async def generate_summary(self, title: str, content: str, type: str) -> str:
        if not self.client:
            logger.info("Initializing OpenAI client")
            self.initialize()

        system_prompt = """You are an assistant that analyzes the contents of a website \
and provides a short summary, ignoring text that might be navigation related. \
Respond in markdown."""

        user_prompt = self._create_user_prompt(title, content, type)

        try:
            logger.info("Sending request to OpenAI API")
            logger.info(f"Content length: {len(content)} characters")
            
            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=self.messages_for(system_prompt, user_prompt)
            )
            
            logger.info(f"Response.choices: {response.choices}")

            if not response.choices:
                raise ValueError("No response from OpenAI")
            
            summary = response.choices[0].message.content
            logger.info(f"Summary received from OpenAI. Length: {len(summary)} characters")
            
            return summary
            
        except OpenAIError as e:
            logger.error(f"OpenAI API error: {str(e)}", exc_info=True)
            raise Exception(f"OpenAI API error: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error during summary generation: {str(e)}", exc_info=True)
            raise

