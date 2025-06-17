import React from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Box,
  Divider,
  Fade,
  Grow,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Timer as TimerIcon,
  Block as BlockIcon,
} from '@mui/icons-material';

const getActionIcon = (type) => {
  switch (type) {
    case 'warning':
      return <WarningIcon sx={{ color: 'warning.main' }} />;
    case 'delete':
      return <DeleteIcon sx={{ color: 'error.main' }} />;
    case 'timeout':
      return <TimerIcon sx={{ color: 'info.main' }} />;
    case 'ban':
      return <BlockIcon sx={{ color: 'error.dark' }} />;
    default:
      return null;
  }
};

const getActionColor = (type) => {
  switch (type) {
    case 'warning':
      return 'warning';
    case 'delete':
      return 'error';
    case 'timeout':
      return 'info';
    case 'ban':
      return 'error';
    default:
      return 'default';
  }
};

const UserActionsList = ({ actions = [] }) => {
  return (
    <Paper 
      sx={{ 
        p: 2, 
        height: '100%',
        background: 'linear-gradient(45deg, #1a1a1a 30%, #2d2d2d 90%)',
        boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .3)',
      }}
    >
      <Fade in={true} timeout={1000}>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            color: 'primary.main',
          }}
        >
          Recent Actions
          <Chip
            label={`${actions.length} total`}
            size="small"
            sx={{ ml: 2 }}
          />
        </Typography>
      </Fade>
      <List sx={{ maxHeight: 600, overflow: 'auto' }}>
        {actions.map((action, index) => (
          <Grow
            key={`action-${index}`}
            in={true}
            appear={true}
            timeout={{
              enter: 300 + (index * 100),
              exit: 300
            }}
            style={{ 
              transformOrigin: '0 0 0',
              transitionDelay: `${index * 100}ms`
            }}
            mountOnEnter
            unmountOnExit
          >
            <div>
              <ListItem 
                alignItems="flex-start"
                sx={{
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    transform: 'translateX(8px)',
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar 
                    sx={{ 
                      bgcolor: `${getActionColor(action.type)}.light`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                    }}
                  >
                    {getActionIcon(action.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography 
                        component="span" 
                        variant="subtitle1"
                        sx={{
                          fontWeight: 'bold',
                          color: 'primary.main',
                        }}
                      >
                        {action.user}
                      </Typography>
                      <Chip
                        label={action.type}
                        size="small"
                        color={getActionColor(action.type)}
                        variant="outlined"
                        sx={{
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                          },
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                        sx={{ 
                          display: 'block',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {action.message}
                      </Typography>
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: 'block',
                          mt: 0.5,
                        }}
                      >
                        {action.time}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              {index < actions.length - 1 && (
                <Divider 
                  variant="inset" 
                  component="li" 
                  sx={{ 
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease',
                  }}
                />
              )}
            </div>
          </Grow>
        ))}
      </List>
    </Paper>
  );
};

export default UserActionsList;