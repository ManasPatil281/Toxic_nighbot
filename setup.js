const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function setup() {
    console.log('🤖 Welcome to Toxic NightBot Setup!\n');
    
    // Check if .env already exists
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const overwrite = await question('.env file already exists. Overwrite? (y/N): ');
        if (overwrite.toLowerCase() !== 'y') {
            console.log('Setup cancelled.');
            rl.close();
            return;
        }
    }

    console.log('Please provide the following configuration:\n');

    // Collect configuration
    const config = {};
    
    config.YOUTUBE_API_KEY = await question('YouTube API Key: ');
    config.YOUTUBE_CHANNEL_ID = await question('YouTube Channel ID: ');
    
    console.log('\nYouTube OAuth2 Configuration (Required for Live Chat):');
    config.YOUTUBE_CLIENT_ID = await question('YouTube OAuth2 Client ID: ');
    config.YOUTUBE_CLIENT_SECRET = await question('YouTube OAuth2 Client Secret: ');
    config.YOUTUBE_REDIRECT_URI = await question('OAuth2 Redirect URI (http://localhost:3000/auth/callback): ') || 'http://localhost:3000/auth/callback';
    
    config.GROQ_API_KEY = await question('Groq API Key: ');
    
    console.log('\nOptional settings (press Enter for defaults):');
    
    config.BOT_NAME = await question('Bot Name (ToxicGuard): ') || 'ToxicGuard';
    config.TOXICITY_CHECK_INTERVAL = await question('Check Interval ms (2000): ') || '2000';
    config.MAX_MESSAGES_PER_BATCH = await question('Max Messages Per Batch (10): ') || '10';
    
    console.log('\nToxicity Thresholds (0-10 scale):');
    config.LOW_TOXICITY_THRESHOLD = await question('Low Toxicity Threshold (3): ') || '3';
    config.MEDIUM_TOXICITY_THRESHOLD = await question('Medium Toxicity Threshold (6): ') || '6';
    config.HIGH_TOXICITY_THRESHOLD = await question('High Toxicity Threshold (8): ') || '8';
    
    config.PORT = await question('Server Port (3000): ') || '3000';

    // Create .env file
    const envContent = Object.entries(config)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    fs.writeFileSync(envPath, envContent);
    
    // Create logs directory
    const logsDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
    }

    console.log('\n✅ Setup complete!');
    console.log('\nNext steps:');
    console.log('1. Run authentication: npm run authenticate');
    console.log('2. Complete OAuth2 flow in browser');
    console.log('3. Start the bot: npm start');
    console.log('\nTo view logs in real-time:');
    console.log('tail -f logs/combined.log');
    
    rl.close();
}

setup().catch(console.error);
