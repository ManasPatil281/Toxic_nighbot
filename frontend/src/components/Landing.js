import React, { useState, useEffect } from "react";
import SplitText from "../reactbits/SplitText";
import ShinyText from "../reactbits/ShinyText";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Paper,
  Fade,
  Zoom,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Card,
  CardContent,
  useScrollTrigger,
  Chip,
} from "@mui/material";
import {
  Security as SecurityIcon,
  Speed as SpeedIcon,
  AutoAwesome as AutoAwesomeIcon,
  ArrowForward as ArrowForwardIcon,
  Menu as MenuIcon,
  Star as StarIcon,
  GitHub as GitHubIcon,
  Twitter as TwitterIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Shield as ShieldIcon,
} from "@mui/icons-material";

const features = [
  {
    icon: <SecurityIcon sx={{ fontSize: 40 }} />,
    title: "Real-time Toxicity Detection",
    description:
      "Advanced AI-powered moderation that detects and filters toxic content in real-time.",
    color: "#2196F3",
    stat: "99.9%",
    statLabel: "Accuracy"
  },
  {
    icon: <SpeedIcon sx={{ fontSize: 40 }} />,
    title: "Lightning Fast",
    description:
      "Process thousands of messages per second with minimal latency.",
    color: "#21CBF3",
    stat: "10K+",
    statLabel: "Messages/sec"
  },
  {
    icon: <AutoAwesomeIcon sx={{ fontSize: 40 }} />,
    title: "Smart Moderation",
    description:
      "Customizable rules and thresholds for intelligent content moderation.",
    color: "#4CAF50",
    stat: "24/7",
    statLabel: "Protection"
  },
];

const reviews = [
  {
    name: "Aadi Sawant",
    role: "Gaming Streamer",
    avatar:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMjsLoc8Y0PQa-ea2562c2v1R5EYHmk_Y1Mw&s",
    content: "Gachho Gachho!!! Patt se headshottt. Skibidi awm patt se awhhhhh",
    rating: 5,
  },
  {
    name: "GodL Fan",
    role: "Doing Homework",
    avatar: "https://i.pravatar.cc/150?img=2",
    content:
      "Saalo dallo ek hi kaam tha mera wo bhi nahi karne dete dallo kaalo saalo mat na yaar johnny bhai ke streams dekhne hote h 😭😭.",
    rating: 1,
  },
  {
    name: "Neyooo",
    role: "Content Creator",
    avatar:
      "https://esportz.s3.ap-south-1.amazonaws.com/uat/article_images/66841fc71bc0a.jpg",
    content:
      "Kyaa bolte pashaaa ye kya banayele re maamm>>??? kuchh samajhni aara bachhi angreji .",
    rating: 5,
  },
];

const stats = [
  { icon: <TrendingUpIcon />, value: "250K+", label: "Messages Moderated", color: "#2196F3" },
  { icon: <PeopleIcon />, value: "1.5K+", label: "Active Streamers", color: "#21CBF3" },
  { icon: <ShieldIcon />, value: "99%", label: "Accuracy Rate", color: "#4CAF50" },
];

const chatMessages = [
  { user: "StreamerFan123", message: "Great stream!", type: "safe" },
  { user: "ToxicUser", message: "[BLOCKED - Toxic Content]", type: "blocked" },
  { user: "RegularViewer", message: "Love this game!", type: "safe" },
  { user: "SpamBot", message: "[BLOCKED - Spam Detected]", type: "blocked" },
  { user: "CommunityMod", message: "Thanks for keeping it clean!", type: "safe" },
];

function Navbar() {
  const navigate = useNavigate();
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  return (
    <AppBar
      position="fixed"
      sx={{
        background: trigger ? "rgba(26, 26, 26, 0.95)" : "transparent",
        backdropFilter: trigger ? "blur(20px)" : "none",
        boxShadow: trigger ? "0 4px 30px rgba(0, 0, 0, 0.1)" : 0,
        transition: "all 0.3s ease",
        overflow: "hidden",
        border: trigger ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: "bold",
            background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
            backgroundClip: "text",
            textFillColor: "transparent",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: "1.5rem",
          }}
        >
          Toxic NightBot
        </Typography>
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
          <Button 
            color="inherit" 
            onClick={() => navigate("/login")}
            sx={{
              "&:hover": {
                background: "rgba(255, 255, 255, 0.1)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Login
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/login")}
            sx={{
              background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
              boxShadow: "0 4px 15px rgba(33, 150, 243, 0.4)",
              "&:hover": {
                background: "linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 20px rgba(33, 150, 243, 0.6)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Get Started
          </Button>
        </Box>
        <IconButton
          color="inherit"
          sx={{ display: { xs: "flex", md: "none" } }}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

function AnimatedCounter({ value, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(`counter-${value}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [value]);

  useEffect(() => {
    if (!isVisible) return;

    const numericValue = parseInt(value.replace(/[^\d]/g, ''));
    let startTime = null;
    const startValue = 0;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (numericValue - startValue) * easeOutQuart);
      
      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, value, duration]);

  return (
    <span id={`counter-${value}`}>
      {count.toLocaleString()}{value.replace(/[\d,]/g, '')}
    </span>
  );
}

function Landing() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Animate chat messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % chatMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 25%, #2d2d2d 100%)",
        color: "white",
        overflow: "hidden",
        position: "relative",
      }}
    >
      
      
      <Navbar />

      {/* Enhanced animated background */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 20%, rgba(33, 150, 243, 0.15) 0%, transparent 25%),
            radial-gradient(circle at 80% 80%, rgba(33, 203, 243, 0.15) 0%, transparent 25%),
            radial-gradient(circle at 40% 60%, rgba(76, 175, 80, 0.1) 0%, transparent 25%)
          `,
          animation: "float 20s ease-in-out infinite",
          "@keyframes float": {
            "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
            "33%": { transform: "translateY(-20px) rotate(1deg)" },
            "66%": { transform: "translateY(-10px) rotate(-1deg)" },
          },
        }}
      />

      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box
          sx={{
            pt: { xs: 16, md: 20 },
            pb: { xs: 8, md: 12 },
            position: "relative",
            zIndex: 1,
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box>
                <SplitText
                  text="TOXIC NIGHTBOT"
                  className="font-bold text-6xl mb-6"
                  delay={100}
                  duration={0.8}
                  ease="power3.out"
                  splitType="chars"
                  from={{ opacity: 0, y: 60, rotateX: -90 }}
                  to={{ opacity: 1, y: 0, rotateX: 0 }}
                  threshold={0.1}
                  textAlign="left"
                />
                
                <Box sx={{ mb: 4 }}>
                  <ShinyText
                    text="AI-Powered YouTube Chat Moderation!"
                    disabled={false}
                    speed={2}
                    className="text-2xl font-semibold text-blue-300"
                  />
                </Box>

                <Fade in={true} timeout={1500} style={{ transitionDelay: "1000ms" }}>
                  <Typography
                    variant="body1"
                    sx={{ 
                      mb: 4, 
                      color: "rgba(255, 255, 255, 0.8)", 
                      maxWidth: "600px",
                      fontSize: "1.1rem",
                      lineHeight: 1.6,
                    }}
                  >
                    Protect your YouTube community with advanced AI moderation.
                    Detect and filter toxic content in real-time, ensuring a
                    positive environment for your viewers.
                  </Typography>
                </Fade>

                <Fade in={true} timeout={1500} style={{ transitionDelay: "1200ms" }}>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 4 }}>
                    <Chip 
                      label="Real-time Detection" 
                      sx={{ 
                        background: "rgba(33, 150, 243, 0.2)",
                        color: "#2196F3",
                        border: "1px solid rgba(33, 150, 243, 0.3)",
                      }} 
                    />
                    <Chip 
                      label="AI-Powered" 
                      sx={{ 
                        background: "rgba(33, 203, 243, 0.2)",
                        color: "#21CBF3",
                        border: "1px solid rgba(33, 203, 243, 0.3)",
                      }} 
                    />
                    <Chip 
                      label="24/7 Protection" 
                      sx={{ 
                        background: "rgba(76, 175, 80, 0.2)",
                        color: "#4CAF50",
                        border: "1px solid rgba(76, 175, 80, 0.3)",
                      }} 
                    />
                  </Box>
                </Fade>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Zoom in={true} style={{ transitionDelay: "600ms" }}>
                <Box
                  sx={{
                    position: "relative",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: -30,
                      left: -30,
                      right: -30,
                      bottom: -30,
                      background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                      borderRadius: 4,
                      opacity: 0.1,
                      zIndex: -1,
                      animation: "pulse 3s ease-in-out infinite",
                    },
                  }}
                >
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      background: "rgba(255, 255, 255, 0.05)",
                      backdropFilter: "blur(20px)",
                      borderRadius: 3,
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "#4CAF50",
                          animation: "blink 2s infinite",
                          "@keyframes blink": {
                            "0%, 50%": { opacity: 1 },
                            "51%, 100%": { opacity: 0.3 },
                          },
                        }}
                      />
                      Live Chat Monitor
                    </Typography>
                    <Box
                      sx={{
                        height: 320,
                        background: "rgba(0, 0, 0, 0.3)",
                        borderRadius: 2,
                        p: 2,
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      {chatMessages.map((msg, i) => (
                        <Fade
                          key={i}
                          in={i <= currentMessageIndex}
                          timeout={500}
                          style={{
                            transitionDelay: `${i * 200}ms`,
                          }}
                        >
                          <Box
                            sx={{
                              mb: 2,
                              p: 1.5,
                              borderRadius: 1,
                              background: msg.type === "blocked" 
                                ? "rgba(244, 67, 54, 0.1)" 
                                : "rgba(76, 175, 80, 0.1)",
                              border: `1px solid ${msg.type === "blocked" 
                                ? "rgba(244, 67, 54, 0.3)" 
                                : "rgba(76, 175, 80, 0.3)"}`,
                              transform: i <= currentMessageIndex ? "translateX(0)" : "translateX(-100%)",
                              transition: "all 0.5s ease",
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: "bold", color: "#2196F3", mb: 0.5 }}>
                              {msg.user}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: msg.type === "blocked" ? "#ff9999" : "rgba(255, 255, 255, 0.9)",
                                fontStyle: msg.type === "blocked" ? "italic" : "normal",
                              }}
                            >
                              {msg.message}
                            </Typography>
                          </Box>
                        </Fade>
                      ))}
                    </Box>
                  </Paper>
                </Box>
              </Zoom>
            </Grid>
          </Grid>
        </Box>

        {/* Stats Section */}
        <Box sx={{ py: 8, position: "relative", zIndex: 1 }}>
          <Grid container spacing={4} justifyContent="center">
            {stats.map((stat, index) => (
              <Grid item xs={12} md={4} key={index} textAlign="center">
                <Fade in={true} timeout={1000} style={{ transitionDelay: `${index * 200}ms` }}>
                  <Paper
                    sx={{
                      p: 4,
                      background: "rgba(255, 255, 255, 0.05)",
                      backdropFilter: "blur(10px)",
                      borderRadius: 3,
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      textAlign: "center",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)",
                      },
                    }}
                  >
                    <Box sx={{ color: stat.color, mb: 2, fontSize: "3rem" }}>
                      {stat.icon}
                    </Box>
                    <Typography 
                      variant="h2" 
                      sx={{ 
                        color: stat.color, 
                        mb: 1,
                        fontWeight: "bold",
                        fontSize: { xs: "2.5rem", md: "3rem" },
                      }}
                    >
                      <AnimatedCounter value={stat.value} />
                    </Typography>
                    <Typography variant="h6" sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
                      {stat.label}
                    </Typography>
                  </Paper>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Features Section */}
        <Box sx={{ py: 8, position: "relative", zIndex: 1 }}>
          <SplitText
            text="Powerful Features"
            className="text-4xl font-bold text-center mb-12"
            delay={50}
            duration={0.6}
            ease="power2.out"
            splitType="words"
            from={{ opacity: 0, y: 30 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            textAlign="center"
          />
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Fade
                  in={true}
                  timeout={1000}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <Paper
                    elevation={3}
                    onMouseEnter={() => setHoveredFeature(index)}
                    onMouseLeave={() => setHoveredFeature(null)}
                    sx={{
                      p: 4,
                      height: "100%",
                      background: "rgba(255, 255, 255, 0.05)",
                      backdropFilter: "blur(20px)",
                      borderRadius: 3,
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      cursor: "pointer",
                      position: "relative",
                      overflow: "hidden",
                      "&:hover": {
                        transform: "translateY(-12px) scale(1.02)",
                        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
                        background: "rgba(255, 255, 255, 0.08)",
                      },
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "3px",
                        background: `linear-gradient(90deg, ${feature.color}, transparent)`,
                        transform: hoveredFeature === index ? "scaleX(1)" : "scaleX(0)",
                        transformOrigin: "left",
                        transition: "transform 0.4s ease",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        color: feature.color,
                        mb: 3,
                        transform: hoveredFeature === index
                          ? "scale(1.2) rotate(10deg)"
                          : "scale(1)",
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "rgba(255, 255, 255, 0.8)", mb: 3, lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                    
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography variant="h4" sx={{ color: feature.color, fontWeight: "bold" }}>
                        {feature.stat}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                        {feature.statLabel}
                      </Typography>
                    </Box>
                  </Paper>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Reviews Section */}
        <Box sx={{ py: 8, position: "relative", zIndex: 1 }}>
          <ShinyText
            text="What Our Users Say"
            disabled={false}
            speed={2}
            className="text-4xl font-bold text-center mb-12"
          />
          
          <Grid container spacing={4}>
            {reviews.map((review, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Fade
                  in={true}
                  timeout={1000}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      background: "rgba(255, 255, 255, 0.05)",
                      backdropFilter: "blur(20px)",
                      borderRadius: 3,
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)",
                        background: "rgba(255, 255, 255, 0.08)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                        <Avatar
                          src={review.avatar}
                          sx={{ width: 64, height: 64, mr: 2 }}
                        />
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                            {review.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                            {review.role}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: "flex", mb: 2 }}>
                        {[...Array(review.rating)].map((_, i) => (
                          <StarIcon 
                            key={i} 
                            sx={{ 
                              color: "#FFD700",
                              animation: `starGlow 2s ease-in-out ${i * 0.1}s infinite`,
                              "@keyframes starGlow": {
                                "0%, 100%": { transform: "scale(1)" },
                                "50%": { transform: "scale(1.1)" },
                              },
                            }} 
                          />
                        ))}
                      </Box>
                      
                      <Typography variant="body1" sx={{ color: "rgba(255, 255, 255, 0.9)", fontStyle: "italic" }}>
                        "{review.content}"
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box
          sx={{
            py: 12,
            textAlign: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Fade in={true} timeout={1500}>
            <Box>
              <SplitText
                text="Ready to Transform Your Chat?"
                className="text-5xl font-bold mb-6"
                delay={50}
                duration={0.8}
                ease="power3.out"
                splitType="words"
                from={{ opacity: 0, y: 40, scale: 0.8 }}
                to={{ opacity: 1, y: 0, scale: 1 }}
                threshold={0.1}
                textAlign="center"
              />
              
              <Box sx={{ mb: 6 }}>
                <ShinyText
                  text="Join thousands of streamers protecting their communities"
                  disabled={false}
                  speed={3}
                  className="text-xl text-gray-300"
                />
              </Box>
              
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/login")}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                  boxShadow: "0 8px 32px rgba(33, 203, 243, 0.4)",
                  "&:hover": {
                    background: "linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)",
                    transform: "translateY(-4px) scale(1.05)",
                    boxShadow: "0 12px 40px rgba(33, 203, 243, 0.6)",
                  },
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  py: 2.5,
                  px: 8,
                  fontSize: "1.3rem",
                  fontWeight: "bold",
                  borderRadius: 3,
                }}
              >
                Get Started Now
              </Button>
            </Box>
          </Fade>
        </Box>
      </Container>
    </Box>
  );
}

export default Landing;