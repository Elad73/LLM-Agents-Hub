from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseLLMProvider(ABC):
    @abstractmethod
    def initialize(self) -> None:
        """Initialize the LLM provider"""
        pass

    @abstractmethod
    async def generate_summary(self, website_title: str, website_content: str) -> str:
        """Generate summary using the LLM"""
        pass
