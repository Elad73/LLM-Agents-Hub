import React, { useState } from 'react';
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

const ProjectPage: React.FC = () => {
  const { id } = useParams();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<Website | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const urlObject = new URL(url);
      const data = await websiteService.scrapeWebsite(url);
      setScrapedData(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Invalid URL format. Please enter a valid URL starting with http:// or https://');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGetSummary = async () => {
    if (!scrapedData) return;
    
    setSummaryLoading(true);
    setError(null);
    
    try {
      const summaryText = await websiteService.getSummary(scrapedData.url);
      setSummary(summaryText);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to get summary');
      }
    } finally {
      setSummaryLoading(false);
    }
  };

  if (id !== 'scrapeme') return null;

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h2" gutterBottom>
        ScrapeMe
      </Typography>
      <Typography variant="h5" gutterBottom>
        Website Scraping Project
      </Typography>

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
          <Stack direction="row" spacing={2}>
            <Button 
              variant="contained" 
              type="submit" 
              disabled={loading || !url}
            >
              {loading ? <CircularProgress size={24} /> : 'Scrape Website'}
            </Button>
            <Button
              variant="outlined"
              onClick={handleGetSummary}
              disabled={!scrapedData || summaryLoading}
            >
              {summaryLoading ? <CircularProgress size={24} /> : 'Get Summary'}
            </Button>
          </Stack>
        </form>
      </Paper>

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
            {summary}
          </Typography>
        </Paper>
      )}

      {scrapedData && (
        <Paper sx={{ p: 3, my: 3 }}>
          <Typography variant="h6" gutterBottom>
            Scraped Content
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Title:
            </Typography>
            <Typography>{scrapedData.title}</Typography>
          </Box>
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