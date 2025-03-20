import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper,
  Box,
  CircularProgress,
  Stack,
  IconButton,
  InputAdornment
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { websiteService } from '../services/websiteService';
import { Website } from '../types/Website';
import ReactMarkdown from "react-markdown"
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import mammoth from 'mammoth';

// Enhanced logger utility
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO][ProjectPage] ${message}`, data || '');
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR][ProjectPage] ${message}`, error || '');
  },
  debug: (message: string, data?: any) => {
    console.debug(`[DEBUG][ProjectPage] ${message}`, data || '');
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
  const [url, setUrl] = useState('');
  const [source, setSource] = useState<'web' | 'file'>('web');
  const [loading, setLoading] = useState(false);
  const [rawScrapedData, setRawScrapedData] = useState<{
    source: 'web' | 'file';
    address: string;
    title: string;
    text: string;
    created_at: string;
    updated_at: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Add component lifecycle logging
  useEffect(() => {
    logger.info('Component mounted', { 
      projectId: id,
      initialSource: source 
    });
    
    return () => {
      logger.debug('Component unmounting');
    };
  }, [id, source]);

  // Enhanced file selection handling with logging
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    logger.info('File selection triggered');
    
    const file = e.target.files?.[0];
    if (!file) {
      logger.debug('No file selected');
      return;
    }

    logger.info('File selected', { 
      name: file.name,
      size: file.size,
      type: file.type 
    });

    setLoading(true);

    try {
      // For .docx files
      if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const content = result.value; // This contains the text content

        logger.info('DOCX file processed', {
          fileName: file.name,
          contentLength: content.length
        });

        setUrl(file.name);
        setSource('file');
        
        const newData = {
          source: 'file' as const,
          address: file.name,
          title: file.name,
          text: content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setRawScrapedData(newData);
        logger.info('File data processed successfully', {
          fileName: file.name,
          dataLength: content.length
        });
      } else {
        setError('Please select a .docx file');
      }
    } catch (error) {
      logger.error('Error processing DOCX file', error);
      setError('Failed to process DOCX file');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced URL change handler with logging
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    logger.debug('URL input changed', { value });
    
    setUrl(value);
    
    if (!value) {
      logger.info('Input cleared, resetting to web source');
      setSource('web');
      setRawScrapedData(null);
    } else {
      try {
        new URL(value);
        logger.debug('Valid URL detected, setting source to web');
        setSource('web');
      } catch {
        logger.debug('Invalid URL format, maintaining current source');
      }
    }
  };

  // Enhanced scraping handler with detailed logging
  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    logger.info('Scrape operation started', { 
      url, 
      source,
      hasExistingData: !!rawScrapedData 
    });
    
    if (!url) {
      logger.error('Scrape attempted without URL');
      setError('Need to add address for scraping.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let data;
      if (source === 'file') {
        logger.debug('Processing file source');
        if (!rawScrapedData) {
          throw new Error('No file content available');
        }
        data = rawScrapedData;
      } else {
        logger.debug('Processing web source');
        const urlObject = new URL(url);
        logger.info('Initiating web scrape', { url: urlObject.href });
        
        const response = await websiteService.scrapeWebsite(urlObject.href);
        data = {
          source: 'web' as const,
          address: urlObject.href,
          title: response.title,
          text: response.text,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      
      setRawScrapedData(data);
      logger.info('Scrape completed successfully', {
        source: data.source,
        contentLength: data.text.length
      });
    } catch (err) {
      logger.error('Scrape operation failed', err);
      setError(err instanceof Error ? err.message : 'Failed to scrape content');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced summary handler with detailed logging
  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    logger.info('Summary operation started', {
      hasUrl: !!url,
      hasScrapedData: !!rawScrapedData,
      currentSource: source
    });
    
    if (!url && !rawScrapedData) {
      logger.error('Summary attempted without data');
      setError('Need to add address for scraping and then summarizing.');
      return;
    }
    
    setSummaryLoading(true);
    setError(null);
    
    try {
      if (rawScrapedData?.address !== url) {
        logger.debug('URL mismatch, initiating new scrape');
        await handleScrape(e);
      }
      
      if (!rawScrapedData) {
        throw new Error('No content available for summarizing');
      }
      
      logger.info('Requesting summary generation', {
        contentLength: rawScrapedData.text.length,
        source: rawScrapedData.source
      });
      
      const summaryText = await websiteService.getSummary(rawScrapedData.address, rawScrapedData.source);
      setSummary(summaryText);
      
      logger.info('Summary generated successfully', {
        summaryLength: summaryText.length
      });
    } catch (err) {
      logger.error('Summary generation failed', err);
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  // Add render logging
  logger.debug('Rendering component', { 
    hasError: !!error,
    hasScrapedData: !!rawScrapedData,
    hasSummary: !!summary,
    currentSource: source
  });

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
            label={source === 'file' ? "File Path" : "Website URL"}
            variant="outlined"
            value={url}
            onChange={handleUrlChange}
            placeholder={source === 'file' ? "Selected file..." : "https://example.com"}
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => fileInputRef.current?.click()}
                    edge="end"
                    title="Open local file"
                  >
                    <FolderOpenIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            accept=".docx"
          />
          <Stack direction="row" spacing={2}>
            <Button 
              variant="contained" 
              onClick={handleScrape}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Scrape Me'}
            </Button>
            <Button
              variant="contained"
              onClick={handleSummarize}
              disabled={summaryLoading}
            >
              {summaryLoading ? <CircularProgress size={24} /> : 'Summarize Me'}
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
            Summary
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
      {rawScrapedData && (
        <Paper sx={{ p: 3, my: 3 }}>
          <Typography variant="h6" gutterBottom>
            Scraped Content
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Source: {rawScrapedData.source}</Typography>
            <Typography variant="subtitle2">Address: {rawScrapedData.address}</Typography>
            <Typography variant="subtitle2">Title: {rawScrapedData.title}</Typography>
          </Box>
          <Typography 
            sx={{ 
              whiteSpace: 'pre-wrap',
              maxHeight: '400px',
              overflow: 'auto'
            }}
          >
            {rawScrapedData.text}
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default ProjectPage; 