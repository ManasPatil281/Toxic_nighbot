require('dotenv').config();

const config = {
    youtube: {
        apiKey: process.env.YOUTUBE_API_KEY,
        channelId: process.env.YOUTUBE_CHANNEL_ID,
        checkInterval: parseInt(process.env.TOXICITY_CHECK_INTERVAL) || 2000,
        maxMessagesPerBatch: parseInt(process.env.MAX_MESSAGES_PER_BATCH) || 10,
        oauth: {
            clientId: process.env.YOUTUBE_CLIENT_ID,
            clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
            redirectUri: process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3000/auth/callback'
        },
        tokens: {
            accessToken: process.env.YOUTUBE_ACCESS_TOKEN,
            refreshToken: process.env.YOUTUBE_REFRESH_TOKEN
        }
    },
    groq: {
        apiKey: process.env.GROQ_API_KEY,
        model: 'llama3-70b-8192'
    },
    bot: {
        name: process.env.BOT_NAME || 'ToxicGuard',
        thresholds: {
            low: parseFloat(process.env.LOW_TOXICITY_THRESHOLD) || 3,
            medium: parseFloat(process.env.MEDIUM_TOXICITY_THRESHOLD) || 6,
            high: parseFloat(process.env.HIGH_TOXICITY_THRESHOLD) || 8
        }
    },
    server: {
        port: parseInt(process.env.PORT) || 3000
    }
};

module.exports = config;
