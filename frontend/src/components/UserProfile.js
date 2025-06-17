import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Avatar,
  Chip,
  Fade,
  Zoom,
} from '@mui/material';
import { YouTube as YouTubeIcon } from '@mui/icons-material';

const UserProfile = ({ channelInfo }) => {
  return (
    <Fade in={true} timeout={1000}>
      <Paper
        sx={{
          p: 2,
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(45deg, #1a1a1a 30%, #2d2d2d 90%)',
          boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .3)',
        }}
      >
        <Zoom in={true} style={{ transitionDelay: '200ms' }}>
          <Avatar
            src={channelInfo?.thumbnailUrl}
            sx={{
              width: 64,
              height: 64,
              mr: 2,
              border: '2px solid #2196f3',
            }}
          >
            <YouTubeIcon />
          </Avatar>
        </Zoom>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
            {channelInfo?.title || 'Loading...'}
            <Chip
              label="Live"
              color="error"
              size="small"
              sx={{ ml: 2 }}
            />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Channel ID: {channelInfo?.channelId}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" color="text.secondary">
            Bot Status
          </Typography>
          <Chip
            label="Active"
            color="success"
            size="small"
            sx={{ mt: 1 }}
          />
        </Box>
      </Paper>
    </Fade>
  );
};

export default UserProfile; 