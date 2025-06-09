# 🤖 Toxic NightBot

An AI-powered YouTube Live Chat moderation bot that detects toxicity in real-time using Groq Llama and takes appropriate moderation actions.

## ✨ Features

- 🔍 Real-time YouTube Live Chat monitoring
- 🧠 AI-powered toxicity detection using Groq Llama
- ⚡ Graduated moderation actions (warn → delete → timeout → ban)
- 📊 Comprehensive logging and statistics
- ⚙️ Configurable toxicity thresholds
- 🔄 Automatic escalation for repeat offenders
- 🛡️ Protects moderators and channel owners from actions

## 🚀 Quick Start

### 1. Prerequisites

- Node.js (v16 or higher)
- YouTube API access with OAuth2
- Groq API access
- An active YouTube live stream

### 2. Installation

```bash
# Clone or download the project
cd d:\Toxic_nighbot

# Install dependencies
npm install

# Run setup wizard
npm run setup
```

### 3. Get API Keys & OAuth2 Credentials

#### YouTube API Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "YouTube Data API v3"
4. Create credentials:
   - **API Key**: For basic access
   - **OAuth 2.0 Client ID**: For live chat access (Web application type)
   - Add redirect URI: `http://localhost:3000/auth/callback`

#### YouTube Channel ID:
1. Go to your YouTube channel
2. Click "View Page Source"
3. Search for "channelId" 
4. Copy the ID (starts with UC...)

#### Groq API Key:
1. Sign up at [console.groq.com](https://console.groq.com)
2. Generate an API key
3. Copy the key

### 4. Configuration & Authentication

Run the setup wizard:
```bash
npm run setup
```

Then authenticate with YouTube:
```bash
npm run authenticate
```

Or manually edit `.env`:
```env
YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_CHANNEL_ID=your_channel_id
YOUTUBE_CLIENT_ID=your_oauth_client_id
YOUTUBE_CLIENT_SECRET=your_oauth_client_secret
GROQ_API_KEY=your_groq_api_key
BOT_NAME=ToxicGuard
TOXICITY_CHECK_INTERVAL=2000
LOW_TOXICITY_THRESHOLD=3
MEDIUM_TOXICITY_THRESHOLD=6
HIGH_TOXICITY_THRESHOLD=8
```

### 5. Start the Bot

```bash
# Authenticate first (one-time setup)
npm run authenticate

# Start the bot
npm start

# For development (auto-restart on changes)
npm run dev

# View logs in real-time
npm run logs
```

## 📋 How It Works

### Toxicity Scale (0-10)
- **0-2**: Clean/Positive content → No action
- **3-4**: Mild toxicity → Warning issued
- **5-6**: Moderate toxicity → Message deleted
- **7-8**: High toxicity → User timeout
- **9-10**: Extreme toxicity → User banned

### Escalation System
1. **First offense**: Action based on toxicity level
2. **Multiple warnings**: Escalates to message deletion
3. **Multiple timeouts**: Escalates to permanent ban

### Protected Users
- Channel owner
- Chat moderators
- Bot will skip moderation for these users

## 🛠️ Usage

### Initial Setup Process

1. **Setup configuration**: `npm run setup`
2. **Authenticate with YouTube**: `npm run authenticate`
3. **Start a YouTube live stream**
4. **Run the bot**: `npm start`
5. **Monitor logs**: Check console or `logs/combined.log`

### Commands and Scripts

```bash
# Setup configuration
npm run setup

# Authenticate with YouTube OAuth2
npm run authenticate

# Start bot
npm start

# Development mode
npm run dev

# View logs
npm run logs

# Clean old logs
npm run clean
```

## 📊 Monitoring

### Console Output
The bot displays real-time status:
- Connection status
- Messages processed
- Actions taken
- Errors and warnings

### Log Files
- `logs/combined.log` - All activity
- `logs/error.log` - Errors only

### Statistics
The bot tracks:
- Messages processed
- Warnings issued
- Messages deleted
- Users timed out
- Users banned

## 🔧 Configuration

### Toxicity Thresholds
Adjust in `.env`:
```env
LOW_TOXICITY_THRESHOLD=3    # Warning level
MEDIUM_TOXICITY_THRESHOLD=6 # Delete level  
HIGH_TOXICITY_THRESHOLD=8   # Timeout level
```

### Check Interval
```env
TOXICITY_CHECK_INTERVAL=2000  # Check every 2 seconds
```

### Batch Size
```env
MAX_MESSAGES_PER_BATCH=10  # Process 10 messages at once
```

## 🚨 Troubleshooting

### Common Issues

**"Login Required" or "Failed to connect to YouTube Live Chat":**
- Run OAuth2 authentication: `npm run authenticate`
- Ensure you have OAuth2 Client ID and Secret configured
- Complete the browser authentication flow
- Verify your live stream is active

**Bot won't start:**
- Check API keys in `.env`
- Verify YouTube live stream is active
- Run authentication if not done: `npm run authenticate`
- Check `logs/error.log`

**No messages detected:**
- Confirm live stream is running
- Check YouTube API quotas
- Verify channel ID is correct
- Ensure OAuth2 tokens are valid

**Moderation not working:**
- Check Groq API key
- Verify bot has moderation permissions
- Review toxicity thresholds

### Error Messages

**"Login Required" or "API keys are not supported by this API"**
- YouTube Live Chat requires OAuth2 authentication
- Run: `npm run authenticate`
- Complete the browser authentication flow

**"No active live broadcasts found"**
- Start a YouTube live stream
- Wait a few minutes for API sync
- Ensure the stream has chat enabled

**"Failed to delete message"**
- Bot needs moderator permissions on your channel
- Check YouTube API permissions
- Verify OAuth2 scope includes moderation

**"Groq API error"**
- Verify Groq API key
- Check API usage limits

### OAuth2 Setup Guide

1. **Google Cloud Console Setup:**
   - Create OAuth2 Client ID (Web application)
   - Add redirect URI: `http://localhost:3000/auth/callback`
   - Download credentials or copy Client ID/Secret

2. **Authentication Flow:**
   - Run `npm run authenticate`
   - Open browser to `http://localhost:3000`
   - Click "Authenticate with YouTube"
   - Grant permissions to your app
   - Tokens will be saved automatically

3. **Troubleshooting OAuth2:**
   - Ensure redirect URI matches exactly
   - Check that YouTube Data API v3 is enabled
   - Verify OAuth2 consent screen is configured

## 📞 Support

If you encounter issues:
1. Check logs in `logs/error.log`
2. Verify all API keys are correct
3. Ensure live stream is active
4. Check API quotas and limits

## 🔒 Security

- Never share your `.env` file
- Keep API keys secure
- Regularly rotate API keys
- Monitor usage for unusual activity

## 📄 License

MIT License - Feel free to modify and distribute
