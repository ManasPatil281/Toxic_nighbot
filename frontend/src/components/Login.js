import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Fade,
  Zoom,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  YouTube as YouTubeIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import OAuth from "./OAuth";

function Login() {
  const navigate = useNavigate();
  const [channelId, setChannelId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check if we have user data in localStorage
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Call the backend auth endpoint
      const response = await fetch("http://localhost:3050/auth", {
        method: "GET",
        credentials: "include",
      });
      console.log("login",response);
      if (!response.ok) {
        throw new Error("Authentication failed");
      }

      // The backend will redirect to YouTube OAuth
      // After successful OAuth, the backend will redirect back to our frontend
      // with the user data
      const userData = await response.json();
      console.log("login",userData);
      // Store user data in localStorage
      localStorage.setItem("userData", JSON.stringify(userData));

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError("Authentication failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Fade in={true} timeout={1000}>
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 4,
          }}
        >
          <Zoom in={true} style={{ transitionDelay: "200ms" }}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                background: "linear-gradient(45deg, #1a1a1a 30%, #2d2d2d 90%)",
                boxShadow: "0 3px 5px 2px rgba(0, 0, 0, .3)",
                borderRadius: 2,
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  bgcolor: "error.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 3,
                  boxShadow: "0 0 20px rgba(255, 0, 0, 0.3)",
                }}
              >
                <YouTubeIcon sx={{ fontSize: 40, color: "white" }} />
              </Box>

              <Typography
                component="h1"
                variant="h4"
                gutterBottom
                sx={{
                  fontWeight: "bold",
                  background:
                    "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                  backgroundClip: "text",
                  textFillColor: "transparent",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Toxic NightBot
              </Typography>

              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ color: "text.secondary", mb: 4 }}
              >
                Connect your YouTube Channel
              </Typography>

              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ mt: 1, width: "100%" }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="YouTube Channel ID"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  placeholder="UC..."
                  helperText="Enter your YouTube Channel ID (starts with UC...)"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <YouTubeIcon color="error" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "primary.main",
                      },
                    },
                  }}
                />

                {error && (
                  <Fade in={true}>
                    <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                      {error}
                    </Alert>
                  </Fade>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  sx={{
                    mt: 3,
                    mb: 2,
                    height: 48,
                    background:
                      "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                    boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
                    "&:hover": {
                      background:
                        "linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 5px 8px 2px rgba(33, 203, 243, .4)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <>
                      Connect Channel
                      <ArrowForwardIcon sx={{ ml: 1 }} />
                    </>
                  )}
                </Button>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ mt: 2 }}
                >
                  Don't have a Channel ID?{" "}
                  <Button
                    color="primary"
                    onClick={() =>
                      window.open(
                        "https://www.youtube.com/account_advanced",
                        "_blank"
                      )
                    }
                    sx={{ textTransform: "none" }}
                  >
                    Find it here
                  </Button>
                  <OAuth />
                </Typography>
              </Box>
            </Paper>
          </Zoom>
        </Box>
      </Container>
    </Fade>
  );
}

export default Login;
