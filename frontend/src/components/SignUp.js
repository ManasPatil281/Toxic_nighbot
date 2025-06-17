import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import OAuth from './OAuth';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Fade,
  Zoom,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Google as GoogleIcon,
  GitHub as GitHubIcon,
} from '@mui/icons-material';

function SignUp() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement actual signup logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      navigate('/login');
    } catch (error) {
      setErrors({
        submit: 'Failed to create account. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = (provider) => {
    // TODO: Implement social signup logic
    console.log(`Sign up with ${provider}`);
  };

  return (
    <Fade in={true} timeout={1000}>
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
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
                Create Account
              </Typography>

              {errors.submit && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {errors.submit}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Username"
                  value={formData.username}
                  onChange={handleChange('username')}
                  error={!!errors.username}
                  helperText={errors.username}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  error={!!errors.email}
                  helperText={errors.email}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange('password')}
                  error={!!errors.password}
                  helperText={errors.password}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  disabled={isLoading}
                  sx={{
                    mt: 3,
                    mb: 2,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 5px 8px 2px rgba(33, 203, 243, .4)',
                    },
                    transition: 'all 0.3s ease',
                    py: 1.5,
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Sign Up'
                  )}
                </Button>
              </form>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>

              <OAuth/>

              <Typography variant="body2" align="center" color="text.secondary">
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{
                    color: '#2196F3',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Sign In
                </Link>
              </Typography>
            </Paper>
          </Zoom>
        </Box>
      </Container>
    </Fade>
  );
}

export default SignUp; 