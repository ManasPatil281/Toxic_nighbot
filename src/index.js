const YouTubeService = require('./services/youtubeService');
const GroqService = require('./services/groqService');
const ModerationService = require('./services/moderationService');
const config = require('./config/config');
const logger = require('./utils/logger');

class ToxicNightBot {
    constructor() {
        this.youtubeService = new YouTubeService();
        this.groqService = new GroqService();
        this.moderationService = new ModerationService(this.youtubeService);
        this.isRunning = false;
        this.messageCache = new Set(); // Prevent processing same message twice
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    async start() {
        logger.info('Starting Toxic NightBot with Groq Llama...');

        // Log important stream requirements
        logger.info('📋 Stream Requirements:');
        logger.info('- Stream can be Public, Unlisted, or Private');
        logger.info('- Chat must be enabled in YouTube Studio');
        logger.info('- Stream status must be "Live" (not just "Waiting")');
        logger.info('- Allow 2-5 minutes after going live for API detection');
        logger.warn('⚠️  Note: Bot needs moderator permissions for banning/timeouts');
        logger.info('💡 For full moderation: Make the bot account a moderator in YouTube Studio');

        // Initialize YouTube connection with retry logic
        const connected = await this.connectWithRetry();
        if (!connected) {
            logger.error('Failed to connect to YouTube Live Chat after multiple attempts');
            logger.info('💡 Troubleshooting:');
            logger.info('1. Check if your stream is actually LIVE (not just scheduled)');
            logger.info('2. Verify chat is enabled: YouTube Studio → Stream → Chat settings');
            logger.info('3. Try: npm run check-stream');
            logger.info('4. Wait 5 minutes after going live, then retry');
            return;
        }

        this.isRunning = true;
        
        // Start monitoring loop
        this.startMonitoring();

        // Cleanup old user data every hour
        setInterval(() => {
            this.moderationService.cleanupUserData();
        }, 60 * 60 * 1000);

        logger.info('Bot started successfully with Groq Llama');
    }

    async connectWithRetry() {
        for (let attempt = 1; attempt <= this.maxReconnectAttempts; attempt++) {
            logger.info(`Connection attempt ${attempt}/${this.maxReconnectAttempts}`);
            
            const connected = await this.youtubeService.initializeLiveChat();
            if (connected) {
                this.reconnectAttempts = 0;
                return true;
            }
            
            if (attempt < this.maxReconnectAttempts) {
                const delay = Math.min(1000 * Math.pow(2, attempt), 30000); // Exponential backoff
                logger.info(`Retrying in ${delay/1000} seconds...`);
                await this.sleep(delay);
            }
        }
        return false;
    }

    async startMonitoring() {
        while (this.isRunning) {
            try {
                await this.processMessages();
                await this.sleep(config.youtube.checkInterval);
            } catch (error) {
                logger.error('Error in monitoring loop:', error);
                await this.sleep(5000); // Wait 5 seconds on error
            }
        }
    }

    async processMessages() {
        const messages = await this.youtubeService.getMessages();
        
        if (messages.length === 0) {
            return;
        }

        // Filter out already processed messages
        const newMessages = messages.filter(msg => !this.messageCache.has(msg.id));
        
        if (newMessages.length === 0) {
            return;
        }

        // Add to cache
        newMessages.forEach(msg => this.messageCache.add(msg.id));
        
        // Clean cache if it gets too large
        if (this.messageCache.size > 1000) {
            this.messageCache.clear();
        }

        logger.info(`Processing ${newMessages.length} new messages with Groq`);

        // Analyze toxicity
        const analyses = await this.groqService.analyzeToxicity(newMessages);

        // Execute moderation actions
        for (let i = 0; i < analyses.length && i < newMessages.length; i++) {
            const message = newMessages[i];
            const analysis = analyses.find(a => a.messageIndex === i);
            
            if (analysis && analysis.toxicityScore > 0) {
                try {
                    await this.moderationService.executeAction(message, analysis);
                } catch (error) {
                    if (error.code === 403) {
                        logger.warn(`Permission denied for moderation action on user ${message.author.name}`);
                        logger.info('💡 To enable full moderation, make this bot account a channel moderator');
                    } else {
                        logger.error('Moderation action failed:', error.message);
                    }
                }
            }
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    stop() {
        logger.info('Stopping Toxic NightBot...');
        this.isRunning = false;
    }
}

// Start the bot
const bot = new ToxicNightBot();

// Handle graceful shutdown
process.on('SIGINT', () => {
    bot.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    bot.stop();
    process.exit(0);
});

bot.start().catch(error => {
    logger.error('Failed to start bot:', error);
    process.exit(1);
});
