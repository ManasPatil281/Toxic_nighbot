const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const logger = require('../utils/logger');

class YouTubeService {
    constructor() {
        this.oauth2Client = new google.auth.OAuth2(
            config.youtube.oauth.clientId,
            config.youtube.oauth.clientSecret,
            config.youtube.oauth.redirectUri
        );
        
        this.youtube = google.youtube({
            version: 'v3',
            auth: this.oauth2Client
        });
        
        this.liveChatId = null;
        this.nextPageToken = null;
        this.isAuthenticated = false;
    }

    async authenticate() {
        try {
            // Check if we have stored tokens
            if (config.youtube.tokens.accessToken && config.youtube.tokens.refreshToken) {
                this.oauth2Client.setCredentials({
                    access_token: config.youtube.tokens.accessToken,
                    refresh_token: config.youtube.tokens.refreshToken
                });
                this.isAuthenticated = true;
                logger.info('Using stored OAuth2 tokens');
                return true;
            }

            // If no tokens, we need to authenticate
            logger.warn('No OAuth2 tokens found. Please run authentication setup.');
            return false;
        } catch (error) {
            logger.error('Authentication error:', error);
            return false;
        }
    }

    getAuthUrl() {
        const scopes = [
            'https://www.googleapis.com/auth/youtube.readonly',
            'https://www.googleapis.com/auth/youtube.force-ssl'
        ];

        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent'
        });
    }

    async handleAuthCallback(code) {
        try {
            const { tokens } = await this.oauth2Client.getToken(code);
            this.oauth2Client.setCredentials(tokens);
            
            // Save tokens to .env file
            await this.saveTokensToEnv(tokens);
            
            this.isAuthenticated = true;
            logger.info('OAuth2 authentication successful');
            return true;
        } catch (error) {
            logger.error('Error handling auth callback:', error);
            return false;
        }
    }

    async saveTokensToEnv(tokens) {
        const envPath = path.join(__dirname, '../../.env');
        let envContent = '';
        
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
        }

        // Update or add token lines
        const lines = envContent.split('\n');
        const updatedLines = [];
        let accessTokenUpdated = false;
        let refreshTokenUpdated = false;

        for (const line of lines) {
            if (line.startsWith('YOUTUBE_ACCESS_TOKEN=')) {
                updatedLines.push(`YOUTUBE_ACCESS_TOKEN=${tokens.access_token}`);
                accessTokenUpdated = true;
            } else if (line.startsWith('YOUTUBE_REFRESH_TOKEN=')) {
                updatedLines.push(`YOUTUBE_REFRESH_TOKEN=${tokens.refresh_token}`);
                refreshTokenUpdated = true;
            } else {
                updatedLines.push(line);
            }
        }

        // Add tokens if they weren't found
        if (!accessTokenUpdated) {
            updatedLines.push(`YOUTUBE_ACCESS_TOKEN=${tokens.access_token}`);
        }
        if (!refreshTokenUpdated && tokens.refresh_token) {
            updatedLines.push(`YOUTUBE_REFRESH_TOKEN=${tokens.refresh_token}`);
        }

        fs.writeFileSync(envPath, updatedLines.join('\n'));
        logger.info('Tokens saved to .env file');
    }

    async initializeLiveChat() {
        if (!this.isAuthenticated) {
            const authenticated = await this.authenticate();
            if (!authenticated) {
                return false;
            }
        }

        try {
            // First, get all live broadcasts for the authenticated user
            const response = await this.youtube.liveBroadcasts.list({
                part: 'snippet,status',
                mine: true,
                maxResults: 50
            });

            logger.info(`Found ${response.data.items?.length || 0} total broadcasts`);

            if (response.data.items && response.data.items.length > 0) {
                // Log all broadcasts for debugging
                response.data.items.forEach((item, index) => {
                    logger.info(`${index + 1}. "${item.snippet.title}" - Status: ${item.status.lifeCycleStatus} - Chat: ${item.snippet.liveChatId ? 'Yes' : 'No'}`);
                });

                // Filter for active broadcasts with chat
                const activeStreams = response.data.items.filter(item => {
                    const hasChat = !!item.snippet.liveChatId;
                    const isActive = item.status.lifeCycleStatus === 'live' || 
                                   item.status.lifeCycleStatus === 'testing' ||
                                   item.status.lifeCycleStatus === 'liveStarting';
                    
                    logger.info(`Stream "${item.snippet.title}": hasChat=${hasChat}, isActive=${isActive}, status=${item.status.lifeCycleStatus}`);
                    
                    return hasChat && isActive;
                });

                if (activeStreams.length > 0) {
                    const selectedStream = activeStreams[0];
                    this.liveChatId = selectedStream.snippet.liveChatId;
                    logger.info(`Connected to live chat: ${this.liveChatId}`);
                    logger.info(`Stream: "${selectedStream.snippet.title}"`);
                    return true;
                }
            }
            
            logger.warn('No active live broadcasts with chat found');
            return false;
        } catch (error) {
            logger.error('Error initializing live chat:', error);
            if (error.code === 401) {
                logger.error('Authentication failed. Please re-authenticate.');
                this.isAuthenticated = false;
            }
            return false;
        }
    }

    async getMessages() {
        if (!this.liveChatId) {
            logger.warn('Live chat not initialized');
            return [];
        }

        try {
            const response = await this.youtube.liveChatMessages.list({
                liveChatId: this.liveChatId,
                part: 'snippet,authorDetails',
                pageToken: this.nextPageToken,
                maxResults: config.youtube.maxMessagesPerBatch
            });

            this.nextPageToken = response.data.nextPageToken;
            
            return response.data.items.map(item => ({
                id: item.id,
                message: item.snippet.displayMessage,
                author: {
                    name: item.authorDetails.displayName,
                    channelId: item.authorDetails.channelId,
                    isModerator: item.authorDetails.isChatModerator,
                    isOwner: item.authorDetails.isChatOwner
                },
                timestamp: new Date(item.snippet.publishedAt)
            }));
        } catch (error) {
            logger.error('Error fetching messages:', error);
            return [];
        }
    }

    async deleteMessage(messageId) {
        try {
            await this.youtube.liveChatMessages.delete({
                id: messageId
            });
            logger.info(`Deleted message: ${messageId}`);
        } catch (error) {
            logger.error(`Error deleting message ${messageId}:`, error);
        }
    }

    async banUser(liveChatId, channelId) {
        try {
            await this.youtube.liveChatBans.insert({
                part: 'snippet',
                resource: {
                    snippet: {
                        liveChatId: liveChatId,
                        type: 'permanent',
                        bannedUserDetails: {
                            channelId: channelId
                        }
                    }
                }
            });
            logger.info(`Banned user: ${channelId}`);
        } catch (error) {
            logger.error(`Error banning user ${channelId}:`, error);
        }
    }
}

module.exports = YouTubeService;
