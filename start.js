const fs = require('fs');
const path = require('path');

// Pre-flight checks
function checkRequirements() {
    console.log('🔍 Checking requirements...\n');
    
    // Check if .env exists
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
        console.error('❌ .env file not found!');
        console.log('Please run: node setup.js');
        process.exit(1);
    }
    
    // Check if logs directory exists
    const logsDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
        console.log('📁 Created logs directory');
    }
    
    console.log('✅ All requirements met\n');
}

// Load environment and start bot
async function startBot() {
    checkRequirements();
    
    console.log('🚀 Starting Toxic NightBot...\n');
    
    try {
        // Import and start the main bot
        require('./src/index.js');
    } catch (error) {
        console.error('❌ Failed to start bot:', error.message);
        console.log('\nTroubleshooting:');
        console.log('1. Check your .env configuration');
        console.log('2. Verify your API keys are valid');
        console.log('3. Ensure you have an active YouTube live stream');
        console.log('4. Check logs/error.log for detailed errors');
        process.exit(1);
    }
}

startBot();
