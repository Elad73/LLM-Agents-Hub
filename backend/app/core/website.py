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
class Website:
    def __init__(self, url):
        """
        Create this Website object from the given url using the BeautifulSoup library
        """
        # Ensure URL starts with http:// or https://
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
            
        self.url = url
        try:
            response = requests.get(url, headers=headers, timeout=10)  # Add timeout
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