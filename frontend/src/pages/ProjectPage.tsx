import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper,
  Box,
  CircularProgress,
  Stack
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { websiteService } from '../services/websiteService';
import { Website } from '../types/Website';
import ReactMarkdown from "react-markdown"

// Add a simple logger utility at the top of the file
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data || '');
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error || '');
  }
};

/**
 * ProjectPage Component
 * Handles website scraping and summarization functionality
 * Route: /project/scrapeme
 */
const ProjectPage: React.FC = () => {
  // Get the project ID from URL parameters
  const { id } = useParams();

  // State management for form inputs and API responses
  const [url, setUrl] = useState(''); // Store the input URL
  const [loading, setLoading] = useState(false); // Loading state for scraping
  const [scrapedData, setScrapedData] = useState<Website | null>(null); // Store scraped website data
  const [error, setError] = useState<string | null>(null); // Error handling state
  const [summary, setSummary] = useState<string | null>(null); // Store the AI-generated summary
  const [summaryLoading, setSummaryLoading] = useState(false); // Loading state for summary generation

  // Add logging on component mount
  useEffect(() => {
    logger.info('ProjectPage mounted', { projectId: id });
  }, [id]);

  /**
   * Handle website scraping
   * 1. Validates URL format
   * 2. Calls the scraping API
   * 3. Updates UI with results or error
   */
  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    logger.info('Starting website scrape', { url });
    
    try {
      const urlObject = new URL(url);
      logger.info('URL validated', { href: urlObject.href });
      
      const data = await websiteService.scrapeWebsite(urlObject.href);
      logger.info('Website scraped successfully', { 
        title: data.title,
        contentLength: data.text.length 
      });
      
      setScrapedData(data);
    } catch (err) {
      logger.error('Scraping failed', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Invalid URL format. Please enter a valid URL starting with http:// or https://');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle summary generation using OpenAI
   * Only available after successful website scraping
   */
  const handleGetSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scrapedData) {     
      await handleScrape(e);
      logger.error('handleScrape(e)');
      return;
    }
    
    setSummaryLoading(true);
    setError(null);
    
    logger.info('Starting summary generation', { 
      // url: scrapedData.url,
      url,
      contentLength: scrapedData.text.length 
    });
    
    try {
      const summaryText = await websiteService.getSummary(url);
      logger.info('Summary generated successfully', { 
        summaryLength: summaryText.length 
      });
      setSummary(summaryText);
    } catch (err) {
      logger.error('Summary generation failed', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to get summary');
      }
    } finally {
      setSummaryLoading(false);
    }
  };

  // Only render for the 'scrapeme' project
  if (id !== 'scrapeme') return null;

  return (
    <Container sx={{ py: 4 }}>
      {/* Page Header */}
      <Typography variant="h2" gutterBottom>
        ScrapeMe
      </Typography>
      <Typography variant="h5" gutterBottom>
        Website Scraping Project
      </Typography>

      {/* URL Input Form */}
      <Paper sx={{ p: 3, my: 3 }}>
        <form onSubmit={handleScrape}>
          <TextField
            fullWidth
            label="Website URL"
            variant="outlined"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            sx={{ mb: 2 }}
          />
          {/* Action Buttons */}
          <Stack direction="row" spacing={2}>
            {/* Scrape Button - Disabled while loading or no URL */}
            <Button 
              variant="contained" 
              type="submit" 
              disabled={loading || !url}
            >
              {loading ? <CircularProgress size={24} /> : 'Scrape Website'}
            </Button>
            {/* Summary Button - Only enabled after successful scrape */}
            <Button
              variant="outlined"
              onClick={handleGetSummary}
              disabled={!url || summaryLoading}
            >
              {summaryLoading ? <CircularProgress size={24} /> : 'Get Summary'}
            </Button>
          </Stack>
        </form>
      </Paper>

      {/* Error Display Section */}
      {error && (
        <Paper 
          sx={{ 
            p: 2, 
            mb: 2, 
            bgcolor: 'error.light',
            color: 'error.contrastText'
          }}
        >
          <Typography variant="body1">
            Error: {error}
          </Typography>
          <Box component="div" sx={{ mt: 1 }}>
            Please make sure:
            <ul>
              <li>The URL starts with http:// or https://</li>
              <li>The website is accessible</li>
              <li>The website allows scraping</li>
            </ul>
          </Box>
        </Paper>
      )}

      {/* AI Summary Display Section */}
      {summary && (
        <Paper sx={{ p: 3, my: 3 }}>
          <Typography variant="h6" gutterBottom>
            Website Summary
          </Typography>
          <Typography
            sx={{
              whiteSpace: 'pre-wrap',
              maxHeight: '400px',
              overflow: 'auto'
            }}
          >
            <ReactMarkdown>{summary}</ReactMarkdown>
          </Typography>
        </Paper>
      )}
    
      {/* Scraped Content Display Section */}
      {scrapedData && (
        <Paper sx={{ p: 3, my: 3 }}>
          <Typography variant="h6" gutterBottom>
            Scraped Content
          </Typography>
          {/* Website Title */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Title:
            </Typography>
            <Typography>{scrapedData.title}</Typography>
          </Box>
          {/* Website Content */}
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              Content:
            </Typography>
            <Typography 
              sx={{ 
                whiteSpace: 'pre-wrap',
                maxHeight: '400px',
                overflow: 'auto'
              }}
            >
              {scrapedData.text}
            </Typography>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default ProjectPage; 