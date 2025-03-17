import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" style={{ color: 'white', textDecoration: 'none' }}>
          LLM Agents Hub
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 