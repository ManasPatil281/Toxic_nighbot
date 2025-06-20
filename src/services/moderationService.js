const config = require('../config/config');
const logger = require('../utils/logger');

class ModerationService {
    constructor(youtubeService, chatStorageService) {
        this.youtubeService = youtubeService;
        this.chatStorageService = chatStorageService;
        this.userWarnings = new Map();
        this.userTimeouts = new Map();
        this.stats = {
            messagesProcessed: 0,
            actionsTotal: 0,
            warnings: 0,
            deletions: 0,
            timeouts: 0,
            bans: 0
        };
    }

    async executeAction(message, analysis) {
        const { toxicityScore, category, reasoning, action } = analysis;
        const userId = message.author.channelId;

        this.stats.messagesProcessed++;

        // Store chat data regardless of action taken
        this.chatStorageService.addMessage(message, toxicityScore, category, action);

        // Skip moderation for moderators and channel owner
        if (message.author.isModerator || message.author.isOwner) {
            logger.info(`Skipping moderation for privileged user: ${message.author.name}`);
            return;
        }

        // Brief log for monitoring
        if (toxicityScore > 2) {
            logger.info(`Action: ${action} | User: ${message.author.name} | Score: ${toxicityScore}/10`);
        }

        try {
            switch (action) {
                case 'warn':
                    await this.warnUser(message, analysis);
                    this.stats.warnings++;
                    break;
                case 'delete':
                    await this.deleteMessage(message, analysis);
                    this.stats.deletions++;
                    break;
                case 'timeout':
                    await this.timeoutUser(message, analysis);
                    this.stats.timeouts++;
                    break;
                case 'ban':
                    await this.banUser(message, analysis);
                    this.stats.bans++;
                    break;
                default:
                    // No action needed
                    break;
            }

            if (action !== 'none') {
                this.stats.actionsTotal++;
            }

        } catch (error) {
            if (error.code === 403) {
                logger.warn(`⚠️  Permission denied: Cannot ${action} user ${message.author.name}`);
            } else {
                throw error;
            }
        }
    }

    async warnUser(message, analysis) {
        const userId = message.author.channelId;
        const warnings = this.userWarnings.get(userId) || 0;
        this.userWarnings.set(userId, warnings + 1);

        logger.warn(`Warning issued to ${message.author.name} (${warnings + 1} warnings)`);
        
        // Escalate if too many warnings
        if (warnings >= 2) {
            await this.deleteMessage(message, { ...analysis, reasoning: 'Multiple warnings' });
        }
    }

    async deleteMessage(message, analysis) {
        try {
            await this.youtubeService.deleteMessage(message.id);
            logger.info(`Deleted message from ${message.author.name}: "${message.message}"`);
        } catch (error) {
            if (error.code === 403) {
                logger.warn(`Cannot delete message from ${message.author.name}: Insufficient permissions`);
                throw error;
            } else {
                logger.error(`Failed to delete message: ${error.message}`);
                throw error;
            }
        }
    }

    async timeoutUser(message, analysis) {
        await this.deleteMessage(message, analysis);
        
        const userId = message.author.channelId;
        const timeouts = this.userTimeouts.get(userId) || 0;
        this.userTimeouts.set(userId, timeouts + 1);

        logger.warn(`User ${message.author.name} timed out (${timeouts + 1} timeouts)`);

        // Escalate to ban if multiple timeouts
        if (timeouts >= 2) {
            await this.banUser(message, { ...analysis, reasoning: 'Multiple timeouts' });
        }
    }

    async banUser(message, analysis) {
        try {
            await this.youtubeService.banUser(
                this.youtubeService.liveChatId,
                message.author.channelId
            );
            logger.error(`Banned user ${message.author.name}: ${analysis.reasoning}`);
        } catch (error) {
            if (error.code === 403) {
                logger.warn(`Cannot ban user ${message.author.name}: Insufficient permissions`);
                throw error;
            } else {
                logger.error(`Failed to ban user: ${error.message}`);
                throw error;
            }
        }
    }

    getStats() {
        return { ...this.stats };
    }

    resetStats() {
        this.stats = {
            messagesProcessed: 0,
            actionsTotal: 0,
            warnings: 0,
            deletions: 0,
            timeouts: 0,
            bans: 0
        };
    }

    // Clean up old warnings and timeouts
    cleanupUserData() {
        const oneHour = 60 * 60 * 1000;
        const now = Date.now();
        
        // Reset warnings older than 1 hour
        this.userWarnings.clear();
        this.userTimeouts.clear();
        
        logger.info('User warning and timeout data cleaned up');
    }
}

module.exports = ModerationService;
