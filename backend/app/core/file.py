# imports
import os
import requests
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from IPython.display import Markdown, display
from openai import OpenAI
from dataclasses import dataclass
from datetime import datetime


# A class to represent a Webpage
# If you're not familiar with Classes, check out the "Intermediate Python" notebook

# Some websites need you to use proper headers when fetching them:
headers = {
 "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
}

@dataclass
class File:
    def __init__(self, address):
        """
        Create this File object from the given address using the BeautifulSoup library
        """
        # Validate the file suffix
        # if not address.startswith(('http://', 'https://')):
        #     url = 'https://' + url
            
        self.address = address
        try:
            response = requests.get(address, headers=headers, timeout=10)  # Add timeout
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract title
            self.title = soup.title.string if soup.title else "No title found"
            
            # Clean and extract text
            if soup.body:
                # Remove unwanted elements
                for tag in soup.body(["script", "style", "nav", "header", "footer", "img", "input"]):
                    tag.decompose()
                self.text = soup.body.get_text(separator="\n", strip=True)
            else:
                self.text = "No content found"
                
            # Set timestamps
            self.created_at = datetime.now()
            self.updated_at = datetime.now()
            
        except requests.RequestException as e:
            raise Exception(f"Failed to fetch website: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to parse website content: {str(e)}")

    def to_dict(self):
        return {
            "url": self.url,
            "title": self.title,
            "text": self.text,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

    @classmethod
    def from_content(cls, path: str, content: str):
        """Create a Website object from file content"""
        website = cls.__new__(cls)
        website.url = f"file://{path}"
        
        try:
            soup = BeautifulSoup(content, 'html.parser')
            
            # Extract title
            website.title = soup.title.string if soup.title else path.split('/')[-1]
            
            # Clean and extract text
            if soup.body:
                for tag in soup.body(["script", "style", "nav", "header", "footer", "img", "input"]):
                    tag.decompose()
                website.text = soup.body.get_text(separator="\n", strip=True)
            else:
                website.text = content
                
            website.created_at = datetime.now()
            website.updated_at = datetime.now()
            
            return website
            
        except Exception as e:
            raise Exception(f"Failed to parse file content: {str(e)}") 