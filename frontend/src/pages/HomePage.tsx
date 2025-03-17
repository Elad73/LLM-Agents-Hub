import React from 'react';
import { Container, Typography, Card, CardContent, CardActions, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import '../styles/Hero.css';

const HomePage: React.FC = () => {
  return (
    <div>
      <div className="hero">
        <div className="hero-content">
          <Typography variant="h1">LLM Agents Hub</Typography>
          <Typography variant="h5">
            Explore AI-powered tools and automation solutions
          </Typography>
        </div>
      </div>
      
      <Container sx={{ py: 8 }}>
        <Typography variant="h4" gutterBottom>
          Projects
        </Typography>
        
        <Card sx={{ maxWidth: 345 }}>
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              ScrapeMe
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A powerful website scraping tool that helps you extract and analyze web content efficiently.
            </Typography>
          </CardContent>
          <CardActions>
            <Button component={Link} to="/project/scrapeme" size="small">Learn More</Button>
          </CardActions>
        </Card>
      </Container>
    </div>
  );
};

export default HomePage; 