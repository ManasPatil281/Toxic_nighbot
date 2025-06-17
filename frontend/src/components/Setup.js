import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Slider,
  FormControlLabel,
  Switch,
  Stepper,
  Step,
  StepLabel,
  Fade,
  Zoom,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Settings as SettingsIcon,
  Warning as WarningIcon,
  Timer as TimerIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

const steps = ['Channel Setup', 'Toxicity Settings', 'Moderation Rules'];

const toxicityLevels = {
  low: {
    title: 'Low Toxicity',
    description: 'When a message reaches this threshold, the sender will receive a warning.',
    icon: <WarningIcon color="warning" />,
    color: 'warning.main',
  },
  medium: {
    title: 'Medium Toxicity',
    description: 'When a message reaches this threshold, the sender will be timed out.',
    icon: <TimerIcon color="error" />,
    color: 'error.main',
  },
  high: {
    title: 'High Toxicity',
    description: 'When a message reaches this threshold, the sender will be banned.',
    icon: <SecurityIcon color="error" />,
    color: 'error.dark',
  },
};

function Setup() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    channelId: location.state?.channelId || '',
    botName: 'ToxicGuard',
    lowThreshold: 3,
    mediumThreshold: 6,
    highThreshold: 8,
    checkInterval: 2000,
    maxMessagesPerBatch: 10,
    autoModeration: true,
  });

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      setIsLoading(true);
      // Save settings and navigate to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSettingChange = (setting) => (event) => {
    setSettings({
      ...settings,
      [setting]: event.target.value,
    });
  };

  const getStepIcon = (step) => {
    switch (step) {
      case 0:
        return <SettingsIcon />;
      case 1:
        return <WarningIcon />;
      case 2:
        return <SecurityIcon />;
      default:
        return null;
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Fade in={true} timeout={500}>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Bot Name"
                value={settings.botName}
                onChange={handleSettingChange('botName')}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <SettingsIcon color="primary" sx={{ mr: 1 }} />
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Check Interval (ms)"
                type="number"
                value={settings.checkInterval}
                onChange={handleSettingChange('checkInterval')}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <TimerIcon color="primary" sx={{ mr: 1 }} />
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Max Messages Per Batch"
                type="number"
                value={settings.maxMessagesPerBatch}
                onChange={handleSettingChange('maxMessagesPerBatch')}
                margin="normal"
              />
            </Box>
          </Fade>
        );
      case 1:
        return (
          <Fade in={true} timeout={500}>
            <Box sx={{ mt: 2 }}>
              <Alert severity="info" sx={{ mb: 4 }}>
                <AlertTitle>Toxicity Thresholds</AlertTitle>
                Configure how the bot should respond to different levels of toxicity in chat messages.
              </Alert>

              {Object.entries(toxicityLevels).map(([level, info]) => (
                <Box key={level} sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {info.icon}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {info.title}
                    </Typography>
                    <Tooltip title={info.description} arrow placement="right">
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Slider
                    value={settings[`${level}Threshold`]}
                    onChange={(_, value) =>
                      setSettings({ ...settings, [`${level}Threshold`]: value })
                    }
                    min={0}
                    max={10}
                    marks
                    valueLabelDisplay="auto"
                    sx={{
                      color: info.color,
                      '& .MuiSlider-thumb': {
                        '&:hover, &.Mui-focusVisible': {
                          boxShadow: `0 0 0 8px ${info.color}26`,
                        },
                      },
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {info.description}
                  </Typography>
                </Box>
              ))}

              <Alert severity="warning" sx={{ mt: 4 }}>
                <AlertTitle>Threshold Order</AlertTitle>
                Make sure your thresholds are set in ascending order (Low {'<'} Medium {'<'} High) for proper moderation.
              </Alert>
            </Box>
          </Fade>
        );
      case 2:
        return (
          <Fade in={true} timeout={500}>
            <Box sx={{ mt: 2 }}>
              <Alert severity="info" sx={{ mb: 4 }}>
                <AlertTitle>Automatic Moderation</AlertTitle>
                When enabled, the bot will automatically take action based on the toxicity thresholds you've set.
              </Alert>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoModeration}
                    onChange={(e) =>
                      setSettings({ ...settings, autoModeration: e.target.checked })
                    }
                    color="primary"
                  />
                }
                label="Enable Automatic Moderation"
              />
            </Box>
          </Fade>
        );
      default:
        return null;
    }
  };

  return (
    <Fade in={true} timeout={1000}>
      <Container maxWidth="md">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            py: 4,
          }}
        >
          <Zoom in={true} style={{ transitionDelay: '200ms' }}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                background: 'linear-gradient(45deg, #1a1a1a 30%, #2d2d2d 90%)',
                boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .3)',
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h4"
                gutterBottom
                align="center"
                sx={{
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 4,
                }}
              >
                Bot Configuration
              </Typography>

              <Stepper
                activeStep={activeStep}
                sx={{
                  mb: 4,
                  '& .MuiStepLabel-label': {
                    color: 'text.secondary',
                  },
                  '& .MuiStepLabel-label.Mui-active': {
                    color: 'primary.main',
                  },
                }}
              >
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel
                      StepIconComponent={() => (
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            bgcolor: activeStep >= index ? 'primary.main' : 'grey.700',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {getStepIcon(index)}
                        </Box>
                      )}
                    >
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              {renderStepContent(activeStep)}

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: 4,
                }}
              >
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  startIcon={<ArrowBackIcon />}
                  sx={{
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateX(-4px)',
                    },
                  }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={isLoading}
                  endIcon={isLoading ? <CircularProgress size={20} /> : <ArrowForwardIcon />}
                  sx={{
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                      transform: 'translateX(4px)',
                      boxShadow: '0 5px 8px 2px rgba(33, 203, 243, .4)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </Box>
            </Paper>
          </Zoom>
        </Box>
      </Container>
    </Fade>
  );
}

export default Setup; 