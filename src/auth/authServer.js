const express = require('express');
const config = require('../config/config');
const logger = require('../utils/logger');

class AuthServer {
    constructor(youtubeService) {
        this.app = express();
        this.youtubeService = youtubeService;
        this.server = null;
    }

    start() {
        return new Promise((resolve) => {
            this.app.get('/auth', (req, res) => {
                const authUrl = this.youtubeService.getAuthUrl();
                res.redirect(authUrl);
            });

            this.app.get('/auth/callback', async (req, res) => {
                const { code } = req.query;
                
                if (!code) {
                    res.send('❌ Authorization failed: No code received');
                    return;
                }

                const success = await this.youtubeService.handleAuthCallback(code);
                
                if (success) {
                    res.send(`
                        <h1>✅ Authentication Successful!</h1>
                        <p>You can now close this window and restart the bot.</p>
                        <script>setTimeout(() => window.close(), 3000);</script>
                    `);
                    logger.info('OAuth2 authentication completed successfully');
                    this.stop();
                } else {
                    res.send('❌ Authentication failed. Please try again.');
                }
            });

            this.app.get('/', (req, res) => {
                res.send(`
                    <h1>🤖 Toxic NightBot Authentication</h1>
                    <p>Click the link below to authenticate with YouTube:</p>
                    <a href="/auth" style="background: #ff0000; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                        Authenticate with YouTube
                    </a>
                `);
            });

            this.server = this.app.listen(config.server.port, () => {
                logger.info(`Auth server running on http://localhost:${config.server.port}`);
                resolve();
            });
        });
    }

    stop() {
        if (this.server) {
            this.server.close();
            logger.info('Auth server stopped');
        }
    }
}

module.exports = AuthServer;
