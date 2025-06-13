const logger = require('../utils/logger');

class ChatStorageService {
    constructor() {
        this.messages = [];
        this.users = new Map();
        this.moderationActions = {
            deletions: [],
            bans: [],
            timeouts: []
        };
        this.maxMessages = 1000; // Keep last 1000 messages
    }

    addMessage(message, toxicityScore, category, action) {
        const messageData = {
            id: message.id,
            message: message.message,
            text: message.message, // Support both properties
            username: message.author.name,
            userId: message.author.channelId,
            timestamp: message.timestamp,
            toxicityScore: toxicityScore,
            category: category,
            action: action
        };

        // Add to messages array
        this.messages.unshift(messageData);
        
        // Keep only recent messages
        if (this.messages.length > this.maxMessages) {
            this.messages = this.messages.slice(0, this.maxMessages);
        }

        // Update user data
        this.updateUserData(message.author, toxicityScore);

        // Record moderation actions
        if (action !== 'none') {
            this.recordModerationAction(messageData, action);
        }

        logger.debug(`Stored message from ${message.author.name} (score: ${toxicityScore}, action: ${action})`);
    }

    updateUserData(author, toxicityScore) {
        const userId = author.channelId;
        let userData = this.users.get(userId) || {
            userId: userId,
            username: author.name,
            messageCount: 0,
            totalToxicityScore: 0,
            averageToxicityScore: 0,
            toxicityScore: 0, // Add this for compatibility
            lastActive: new Date(),
            isModerator: author.isModerator,
            isOwner: author.isOwner
        };

        userData.messageCount++;
        userData.totalToxicityScore += toxicityScore;
        userData.averageToxicityScore = userData.totalToxicityScore / userData.messageCount;
        userData.toxicityScore = userData.averageToxicityScore; // Set for compatibility
        userData.lastActive = new Date();
        userData.username = author.name; // Update name in case it changed

        this.users.set(userId, userData);
    }

    recordModerationAction(messageData, action) {
        const actionData = {
            id: messageData.id,
            message: messageData.message,
            text: messageData.message, // Support both properties
            username: messageData.username,
            userId: messageData.userId,
            timestamp: messageData.timestamp,
            reason: `Toxicity score: ${messageData.toxicityScore}/10`,
            action: action
        };

        switch (action) {
            case 'delete':
                this.moderationActions.deletions.unshift(actionData);
                if (this.moderationActions.deletions.length > 100) {
                    this.moderationActions.deletions = this.moderationActions.deletions.slice(0, 100);
                }
                break;
            case 'ban':
                this.moderationActions.bans.unshift(actionData);
                if (this.moderationActions.bans.length > 100) {
                    this.moderationActions.bans = this.moderationActions.bans.slice(0, 100);
                }
                break;
            case 'timeout':
                this.moderationActions.timeouts.unshift(actionData);
                if (this.moderationActions.timeouts.length > 100) {
                    this.moderationActions.timeouts = this.moderationActions.timeouts.slice(0, 100);
                }
                break;
        }
    }

    getDashboardData() {
        // Get recent messages (last 20)
        const recentMessages = this.messages.slice(0, 20);

        // Get toxic messages (score > 5)
        const toxicMessages = this.messages
            .filter(msg => msg.toxicityScore > 5)
            .slice(0, 10);

        // Get top toxic users
        const topToxicUsers = Array.from(this.users.values())
            .filter(user => !user.isModerator && !user.isOwner)
            .sort((a, b) => b.averageToxicityScore - a.averageToxicityScore)
            .slice(0, 10);

        // Calculate stats
        const stats = {
            totalMessages: this.messages.length,
            totalToxicMessages: this.messages.filter(msg => msg.toxicityScore > 5).length,
            totalUsers: this.users.size,
            activeUsers: Array.from(this.users.values()).filter(user => {
                const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
                return user.lastActive > oneHourAgo;
            }).length,
            totalDeletions: this.moderationActions.deletions.length,
            totalBans: this.moderationActions.bans.length,
            totalTimeouts: this.moderationActions.timeouts.length
        };

        return {
            recentMessages,
            toxicMessages,
            topToxicUsers,
            moderationActions: this.moderationActions,
            stats
        };
    }

    // Clean up old data
    cleanup() {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        // Remove old messages
        this.messages = this.messages.filter(msg => msg.timestamp > oneDayAgo);
        
        // Remove inactive users
        for (const [userId, userData] of this.users.entries()) {
            if (userData.lastActive < oneDayAgo) {
                this.users.delete(userId);
            }
        }

        logger.info('Chat storage cleanup completed');
    }
}

module.exports = ChatStorageService;
