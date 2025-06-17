import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  AlertTitle,
  Button,
  Box,
} from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';
import { GitHub, Google } from '@mui/icons-material';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { app } from '../firebase';

// const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
// const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;

function OAuth() {
  const navigate = useNavigate();

  const auth = getAuth(app);
    
  const handleSocialSignUp = async (providerName) => {
    console.log('Signing in with', providerName);
    if(providerName === 'Google'){
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: 'select_account'
        });
        try {
            const result = await signInWithPopup(auth, provider);
            console.log(result);
            const user = result.user;
            const credential = result.credential;
            
            // Store necessary user data
            const userData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                accessToken: user.accessToken,
                idToken: credential.idToken
            };
            
            // You can store this in localStorage or your state management solution
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Navigate to dashboard
            navigate('/dashboard');
        } catch (error) {
            console.log(error);
        }
    }
  };

  return (
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  fullWidth
                  type="button"
                  variant="outlined"
                  onClick={() => handleSocialSignUp('Google')}
                  startIcon={<Google />}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  Google
                </Button>
                <Button
                  fullWidth
                  type="button"
                  variant="outlined"
                  onClick={() => handleSocialSignUp('GitHub')}                  
                  startIcon={<GitHub />}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  GitHub
                </Button>
              </Box>
    );
}

export default OAuth;

