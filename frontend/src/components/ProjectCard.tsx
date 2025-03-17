import React from 'react';
import { Card, CardContent, CardMedia, Typography } from '@mui/material';

interface ProjectProps {
  project: {
    title: string;
    description: string;
    image_url: string;
  };
}

const ProjectCard = ({ project }: ProjectProps) => {
  return (
    <Card sx={{ maxWidth: 345, height: '100%' }}>
      <CardMedia
        component="img"
        height="140"
        image={project.image_url}
        alt={project.title}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {project.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {project.description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ProjectCard; 