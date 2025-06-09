const config = require('../src/config/config');

function debugConfiguration() {
    console.log('🔧 Configuration Debug\n');
    
    console.log('YouTube Configuration:');
    console.log(`- API Key: ${config.youtube.apiKey ? '✅ Set' : '❌ Missing'}`);
    console.log(`- Channel ID: ${config.youtube.channelId ? '✅ Set' : '❌ Missing'}`);
    console.log(`- Client ID: ${config.youtube.oauth.clientId ? '✅ Set' : '❌ Missing'}`);
    console.log(`- Client Secret: ${config.youtube.oauth.clientSecret ? '✅ Set' : '❌ Missing'}`);
    console.log(`- Access Token: ${config.youtube.tokens.accessToken ? '✅ Set' : '❌ Missing'}`);
    console.log(`- Refresh Token: ${config.youtube.tokens.refreshToken ? '✅ Set' : '❌ Missing'}`);
    
    console.log('\nGroq Configuration:');
    console.log(`- API Key: ${config.groq.apiKey ? '✅ Set' : '❌ Missing'}`);
    console.log(`- Model: ${config.groq.model}`);
    
    console.log('\nBot Configuration:');
    console.log(`- Check Interval: ${config.youtube.checkInterval}ms`);
    console.log(`- Max Messages: ${config.youtube.maxMessagesPerBatch}`);
    console.log(`- Port: ${config.server.port}`);
    
    console.log('\nTroubleshooting Steps:');
    console.log('1. Check live stream status: npm run check-stream');
    console.log('2. Verify your YouTube live stream is active');
    console.log('3. Ensure chat is enabled in YouTube Studio');
    console.log('4. Wait 2-5 minutes after starting stream');
    console.log('5. Re-authenticate if needed: npm run authenticate');
}

debugConfiguration();
