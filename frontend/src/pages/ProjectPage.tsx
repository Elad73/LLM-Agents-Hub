import React, { useState, useEffect, useRef } from 'react';
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
import ReactMarkdown from "react-markdown"
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import mammoth from 'mammoth';
import { scrapeService } from '../services/scrapeService';

const CONFIG = {
  SUPPORTED_FILE_TYPES: ['.docx'],
  MAX_DISPLAY_HEIGHT: '400px',
  UPLOAD_PATH_PREFIX: 'C:/uploads/'
} as const;

const UI_MESSAGES = {
  INVALID_FILE: 'Please select a .docx file',
  PROCESSING_ERROR: 'Failed to process DOCX file',
  NO_URL: 'Need to add address for scraping.',
  NO_CONTENT: 'No content available for summarizing'
} as const;

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

type ScrapedData = {
  source: 'web' | 'file';
  address: string;
  title: string;
  text: string;
  created_at: string;
  updated_at: string;
};

// Move these component definitions OUTSIDE of ProjectPage
interface InputFormProps {
  url: string;
  loading: boolean;
  summaryLoading: boolean;
  onUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onScrape: (e: React.FormEvent) => void;
  onSummarize: (e: React.FormEvent) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputForm: React.FC<InputFormProps> = ({
  url,
  loading,
  summaryLoading,
  onUrlChange,
  onScrape,
  onSummarize,
  fileInputRef,
  onFileSelect
}) => (
  <Paper sx={{ p: 3, mb: 3 }}>
    <Stack spacing={2}>
      <TextField
        fullWidth
        label="URL or File Path"
        value={url}
        onChange={onUrlChange}
        disabled={loading}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                <FolderOpenIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      
      <input
        type="file"
        ref={fileInputRef}
        accept={CONFIG.SUPPORTED_FILE_TYPES.join(',')}
        style={{ display: 'none' }}
        onChange={onFileSelect}
      />

      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          onClick={onScrape}
          disabled={loading || !url}
        >
          {loading ? <CircularProgress size={24} /> : 'Scrape'}
        </Button>
        
        <Button
          variant="contained"
          onClick={onSummarize}
          disabled={summaryLoading || !url}
        >
          {summaryLoading ? <CircularProgress size={24} /> : 'Summarize'}
        </Button>
      </Stack>
    </Stack>
  </Paper>
);

const ErrorDisplay: React.FC<{ error: string }> = ({ error }) => (
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
);

const ScrapedContent: React.FC<{ data: ScrapedData }> = ({ data }) => (
  <Paper sx={{ p: 3, my: 3 }}>
    <Typography variant="h6" gutterBottom>
      Scraped Content
    </Typography>
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2">Source: {data.source}</Typography>
      <Typography variant="subtitle2">Address: {data.address}</Typography>
      <Typography variant="subtitle2">Title: {data.title}</Typography>
    </Box>
    <Typography 
      sx={{ 
        whiteSpace: 'pre-wrap',
        maxHeight: CONFIG.MAX_DISPLAY_HEIGHT,
        overflow: 'auto'
      }}
    >
      {data.text}
    </Typography>
  </Paper>
);

interface SummaryDisplayProps {
  summary: string;
}

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary }) => (
  <Paper sx={{ p: 3, mb: 3 }}>
    <Typography variant="h6" gutterBottom>
      Summary
    </Typography>
    <Box sx={{ 
      maxHeight: CONFIG.MAX_DISPLAY_HEIGHT,
      overflow: 'auto'
    }}>
      <ReactMarkdown>{summary}</ReactMarkdown>
    </Box>
  </Paper>
);

/**
 * ProjectPage Component
 * Handles website scraping and summarization functionality
 * Route: /project/scrapeme
 */
const ProjectPage: React.FC = () => {
  // Group related state
  const { id } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Input states
  const [url, setUrl] = useState('');
  const [source, setSource] = useState<'web' | 'file'>('web');
  const [fileObject, setFileObject] = useState<File | null>(null);

  // Data states
  const [rawScrapedData, setRawScrapedData] = useState<ScrapedData | null>(null);
  const [summary, setSummary] = useState<string | null>(null);

  // UI states
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


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

  const processDocxFile = async (file: File): Promise<ScrapedData> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const displayPath = `${CONFIG.UPLOAD_PATH_PREFIX}${file.name}`;

    return {
      source: 'file' as const,
      address: displayPath,
      title: file.name,
      text: result.value,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  };

  const validateFile = (file: File): boolean => {
    if (!CONFIG.SUPPORTED_FILE_TYPES.some(type => file.name.endsWith(type))) {
      setError(UI_MESSAGES.INVALID_FILE);
      return false;
    }
    return true;
  };

  // Move handleFileSelect definition before it's used
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    logger.info('File selection triggered');
    setError(null);
    
    const file = e.target.files?.[0];
    if (!file || !validateFile(file)) {
      return;
    }

    setFileObject(file);
    setLoading(true);

    try {
      const newData = await processDocxFile(file);
      setUrl(newData.address);
      setSource('file');
      setRawScrapedData(newData);
      logger.info('File data processed successfully', {
        fileName: file.name,
        dataLength: newData.text.length
      });
    } catch (error) {
      logger.error('Error processing DOCX file', error);
      setError(UI_MESSAGES.PROCESSING_ERROR);
      setUrl('');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced URL change handler with logging
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    logger.debug('address input changed', { value });
    setUrl(value);
    setSource('web'); // Reset to web source if cleared
    setRawScrapedData(null);
    setError(null); // clear error when user starts typing
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
      let response;
      let newData=null;
      if (source === 'file') {
        logger.info('Initiating file scrape. Address: ', { url });
        
        // For .docx files
        if (fileObject && fileObject.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          const arrayBuffer = await fileObject.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          const content = result.value; // This contains the file content
          logger.info('DOCX file processed', {
            fileName: fileObject.name,
            contentLength: content.length
          });

          newData = {
            source: 'file' as const,
            address: fileObject.webkitRelativePath,
            title: fileObject.name,
            text: content,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          logger.info('File scraped successfully');
        } else {
          setError('Please select a .docx file');
        }
       
      } else if (source === 'web') {
        logger.info('Initiating web scrape', { url });
        response = await scrapeService.scrapeWebsite(url);
        
        newData = {
          source: 'web' as const,
          address: url,
          title: response.title,
          text: response.text,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        logger.info('Web scraped successfully', { response: response });
      }
      
      setRawScrapedData(newData);
      setUrl(newData ? newData.address : '');

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
      
      let summaryText = null;
      
      if (rawScrapedData.source === 'file') { 
        summaryText = await scrapeService.summarize(rawScrapedData.title, rawScrapedData.source, rawScrapedData.text);
      } else {
        summaryText = await websiteService.getSummary(rawScrapedData.address, rawScrapedData.source);
      }
      
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

  // Consider adding a fallback or removing this check if not needed
  if (id !== 'scrapeme') {
    return (
      <Container>
        <Typography>Invalid project ID</Typography>
      </Container>
    );
  }

  // Update the TextField to use the url state
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h2" gutterBottom>ScrapeMe</Typography>
      <Typography variant="h5" gutterBottom>Website Scraping Project</Typography>
  
      {/* Forms and controls */}
      <InputForm 
        url={url} 
        loading={loading} 
        summaryLoading={summaryLoading}
        onUrlChange={handleUrlChange}
        onScrape={handleScrape}
        onSummarize={handleSummarize}
        fileInputRef={fileInputRef}
        onFileSelect={handleFileSelect}
      />
  
      {error && <ErrorDisplay error={error} />}
      {summary && <SummaryDisplay summary={summary} />}
      {rawScrapedData && <ScrapedContent data={rawScrapedData} />}
    </Container>
  );
};

export default ProjectPage; 