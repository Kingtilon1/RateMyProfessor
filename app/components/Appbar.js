import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';


export default function ButtonAppBar({title}) {
  return (
    <Box sx={{ flexGrow: 1, width: '70vw', mx: 'auto' }}>
      <AppBar position="static" sx={{backgroundColor:'#070F26'}}>
        <Toolbar sx={{ justifyContent: 'center' }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
          
          
          >
            
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1}}>
            {title}
          </Typography>
         
        </Toolbar>
      </AppBar>
    </Box>
  );
}