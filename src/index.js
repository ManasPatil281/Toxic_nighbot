const YouTubeService = require('./services/youtubeService');
const GroqService = require('./services/groqService');
const ModerationService = require('./services/moderationService');
const ChatStorageService = require('./services/chatStorageService');
const DashboardServer = require('./server');
const config = require('./config/config');
const logger = require('./utils/logger');

class ToxicNightBot {
    constructor() {
        this.youtubeService = new YouTubeService();
        this.groqService = new GroqService();
        this.chatStorageService = new ChatStorageService();
        this.moderationService = new ModerationService(this.youtubeService, this.chatStorageService);
        this.dashboardServer = new DashboardServer(this);
        this.isRunning = false;
        this.messageCache = new Set();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.isInitialized = false;
    }

    async start() {
        logger.info('Starting Toxic NightBot with Groq Llama...');

        // Start dashboard server first
        await this.dashboardServer.start();
        logger.info(`🌐 Dashboard available at: http://localhost:${config.server.port}`);

        // Initialize with some demo data for testing
        this.addDemoData();

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
        if (connected) {
            this.isInitialized = true;
            this.isRunning = true;
            this.startMonitoring();
        } else {
            logger.warn('Running in demo mode - dashboard will show sample data');
            this.isInitialized = false;
        }

        // Cleanup old user data every hour
        setInterval(() => {
            this.moderationService.cleanupUserData();
        }, 60 * 60 * 1000);

        logger.info('Bot started successfully with Groq Llama');
    }

    addDemoData() {
        // Add some demo data so dashboard doesn't show empty
        const demoMessages = [
            {
                id: 'demo1',
                message: 'Hello everyone! Great stream!',
                author: { name: 'DemoUser1', channelId: 'UC1234567890', isModerator: false, isOwner: false },
                timestamp: new Date()
            },
            {
                id: 'demo2', 
                message: 'This is toxic content for testing',
                author: { name: 'DemoUser2', channelId: 'UC0987654321', isModerator: false, isOwner: false },
                timestamp: new Date()
            }
        ];

        // Add demo messages to storage
        demoMessages.forEach((msg, index) => {
            const toxicityScore = index === 1 ? 8 : 1;
            const category = index === 1 ? 'toxic' : 'clean';
            const action = index === 1 ? 'delete' : 'none';
            this.chatStorageService.addMessage(msg, toxicityScore, category, action);
        });

        logger.info('Demo data added to chat storage');
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

        logger.info(`Processing ${newMessages.length} new messages`);

        // Analyze toxicity with better error handling
        let analyses = [];
        try {
            analyses = await this.groqService.analyzeToxicity(newMessages);
            
            if (analyses.length === 0) {
                // Store messages with default values if analysis fails
                newMessages.forEach(message => {
                    this.chatStorageService.addMessage(message, 0, 'unknown', 'none');
                });
                logger.warn('AI analysis failed, stored messages with default values');
                return;
            }
            
        } catch (error) {
            logger.error('AI analysis failed:', error.message);
            // Store messages with default values
            newMessages.forEach(message => {
                this.chatStorageService.addMessage(message, 0, 'error', 'none');
            });
            return;
        }

        // Execute moderation actions (which now includes storing chat data)
        for (let i = 0; i < newMessages.length; i++) {
            const message = newMessages[i];
            const analysis = analyses.find(a => a.messageIndex === i) || {
                toxicityScore: 0,
                category: 'unknown',
                reasoning: 'No analysis',
                action: 'none'
            };
            
            try {
                await this.moderationService.executeAction(message, analysis);
            } catch (error) {
                if (error.code === 403) {
                    logger.warn(`Permission denied for moderation action on user ${message.author.name}`);
                } else {
                    logger.error('Moderation action failed:', error.message);
                }
            }
        }
    }

    // Add method to get chat data for dashboard
    getChatData() {
        if (!this.chatStorageService) {
            return {
                recentMessages: [],
                toxicMessages: [],
                topToxicUsers: [],
                moderationActions: { deletions: [], bans: [], timeouts: [] },
                stats: {
                    totalMessages: 0,
                    totalToxicMessages: 0,
                    totalUsers: 0,
                    activeUsers: 0,
                    totalDeletions: 0,
                    totalBans: 0,
                    totalTimeouts: 0
                }
            };
        }
        return this.chatStorageService.getDashboardData();
    }

    getConnectionStatus() {
        return {
            isAuthenticated: this.youtubeService ? this.youtubeService.isAuthenticated : false,
            hasLiveChat: this.youtubeService ? !!this.youtubeService.liveChatId : false,
            isRunning: this.isRunning,
            isInitialized: this.isInitialized
        };
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    stop() {
        logger.info('Stopping Toxic NightBot...');
        this.isRunning = false;
        this.dashboardServer.stop();
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
