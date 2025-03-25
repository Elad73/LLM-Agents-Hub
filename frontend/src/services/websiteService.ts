import { Website } from '../types/Website';

const API_URL = 'http://localhost:8000/api/projects';

export const websiteService = {

  scrapeWebsite: async (url: string): Promise<Website> => {
    try {
      const response = await fetch(`${API_URL}/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, source: 'web' }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to scrape website');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to scrape website');
    }
  },

  getSummary: async (urlOrContent: string, source: string): Promise<string> => {
    try {
      const response = await fetch(`${API_URL}/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title: urlOrContent,
          source,
          url: urlOrContent,
          
        }),
      });


      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to get summary');
      }

      const data = await response.json();
      return data.summary;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to get summary');
    }
  },

  scrapeFile: async (filePath: string): Promise<Website> => {
    try {
      const response = await fetch(`${API_URL}/scrape-file`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: filePath }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to scrape file');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to scrape file');
    }
  },
}; 