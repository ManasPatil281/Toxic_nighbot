const YouTubeService = require('./src/services/youtubeService');
const AuthServer = require('./src/auth/authServer');
const logger = require('./src/utils/logger');
const config = require('./src/config/config');

async function authenticate() {
    console.log('🔐 YouTube OAuth2 Authentication Setup\n');

    // Check if OAuth credentials are configured
    if (!config.youtube.oauth.clientId || !config.youtube.oauth.clientSecret) {
        console.error('❌ OAuth2 credentials not configured!');
        console.log('\nPlease update your .env file with:');
        console.log('YOUTUBE_CLIENT_ID=your_client_id');
        console.log('YOUTUBE_CLIENT_SECRET=your_client_secret');
        console.log('\nGet these from: https://console.cloud.google.com/');
        process.exit(1);
    }

    const youtubeService = new YouTubeService();
    const authServer = new AuthServer(youtubeService);

    try {
        await authServer.start();
        
        console.log('🌐 Authentication server started');
        console.log(`\n👉 Open this URL in your browser:`);
        console.log(`   http://localhost:${config.server.port}`);
        console.log('\n   Follow the authentication flow to authorize the bot.');
        console.log('   The server will automatically stop after authentication.\n');

    } catch (error) {
        logger.error('Failed to start authentication server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nAuthentication cancelled.');
    process.exit(0);
});

authenticate().catch(error => {
    logger.error('Authentication failed:', error);
    process.exit(1);
});
