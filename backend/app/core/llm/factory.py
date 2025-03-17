from typing import Dict, Type
from .base import BaseLLMProvider
from .openai import OpenAIProvider

class LLMFactory:
    _providers: Dict[str, Type[BaseLLMProvider]] = {
        "openai": OpenAIProvider
    }

    @classmethod
    def create(cls, provider_name: str) -> BaseLLMProvider:
        provider_class = cls._providers.get(provider_name)
        if not provider_class:
            raise ValueError(f"Unknown provider: {provider_name}")
        return provider_class()

    @classmethod
    def register_provider(cls, name: str, provider_class: Type[BaseLLMProvider]):
        cls._providers[name] = provider_class 