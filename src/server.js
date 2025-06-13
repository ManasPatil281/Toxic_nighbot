const express = require('express');
const path = require('path');
const config = require('./config/config');
const logger = require('./utils/logger');

class DashboardServer {
    constructor(bot) {
        this.bot = bot;
        this.app = express();
        this.server = null;
    }

    start() {
        return new Promise((resolve) => {
            // API endpoint for chat data
            this.app.get('/api/chat-data', (req, res) => {
                try {
                    const chatData = this.bot.getChatData();
                    res.json(chatData);
                } catch (error) {
                    logger.error('Error getting chat data:', error);
                    res.status(500).json({ error: 'Failed to get chat data' });
                }
            });

            // API endpoint for moderation stats
            this.app.get('/api/stats', (req, res) => {
                try {
                    const stats = this.bot.moderationService.getStats();
                    res.json(stats);
                } catch (error) {
                    logger.error('Error getting stats:', error);
                    res.status(500).json({ error: 'Failed to get stats' });
                }
            });

            // API endpoint for user analytics
            this.app.get('/api/users', (req, res) => {
                try {
                    const chatData = this.bot.getChatData();
                    res.json({
                        topToxicUsers: chatData.topToxicUsers,
                        allUsers: chatData.topToxicUsers // Extended user data
                    });
                } catch (error) {
                    logger.error('Error getting user data:', error);
                    res.status(500).json({ error: 'Failed to get user data' });
                }
            });

            // API endpoint for moderation actions
            this.app.get('/api/moderation', (req, res) => {
                try {
                    const chatData = this.bot.getChatData();
                    res.json({
                        moderationActions: chatData.moderationActions,
                        stats: chatData.stats
                    });
                } catch (error) {
                    logger.error('Error getting moderation data:', error);
                    res.status(500).json({ error: 'Failed to get moderation data' });
                }
            });

            // Serve static files if dashboard exists
            this.app.use(express.static(path.join(__dirname, '../public')));

            // Main dashboard route - serves the SPA
            this.app.get('/', (req, res) => {
                res.send(this.generateDashboardHTML());
            });

            // Handle SPA routing - all routes serve the same HTML
            this.app.get(['/dashboard', '/users', '/moderation', '/analytics'], (req, res) => {
                res.send(this.generateDashboardHTML());
            });

            this.server = this.app.listen(config.server.port, () => {
                logger.info(`🎯 YouTube Studio Dashboard online at http://localhost:${config.server.port}`);
                resolve();
            });
        });
    }

    generateDashboardHTML() {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>YouTube Studio - Live Chat Moderation</title>
                <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23ff0000' d='M23.498 6.186a2.98 2.98 0 0 0-2.099-2.1C19.516 3.5 12 3.5 12 3.5s-7.516 0-9.399.586A2.98 2.98 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.98 2.98 0 0 0 2.099 2.1C4.484 20.5 12 20.5 12 20.5s7.516 0 9.399-.586a2.98 2.98 0 0 0 2.099-2.1C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'/></svg>">
                <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                        background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%);
                        color: #ffffff;
                        line-height: 1.6;
                        min-height: 100vh;
                        overflow-x: hidden;
                    }
                    
                    .app-layout {
                        display: flex;
                        min-height: 100vh;
                    }
                    
                    .sidebar {
                        width: 280px;
                        background: linear-gradient(180deg, #212121 0%, #1a1a1a 100%);
                        border-right: 1px solid #404040;
                        display: flex;
                        flex-direction: column;
                        position: fixed;
                        height: 100vh;
                        left: 0;
                        top: 0;
                        z-index: 100;
                        box-shadow: 4px 0 20px rgba(0,0,0,0.3);
                    }
                    
                    .sidebar-header {
                        padding: 24px;
                        border-bottom: 1px solid #404040;
                        background: linear-gradient(90deg, #ff0000, #cc0000);
                    }
                    
                    .sidebar-logo {
                        display: flex;
                        align-items: center;
                        margin-bottom: 12px;
                    }
                    
                    .sidebar-logo svg {
                        width: 32px;
                        height: 22px;
                        fill: white;
                        margin-right: 12px;
                    }
                    
                    .sidebar-logo-text {
                        font-size: 20px;
                        font-weight: 700;
                        color: white;
                    }
                    
                    .sidebar-subtitle {
                        font-size: 12px;
                        color: rgba(255,255,255,0.8);
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    
                    .sidebar-nav {
                        flex: 1;
                        padding: 0;
                    }
                    
                    .nav-section {
                        border-bottom: 1px solid #333;
                    }
                    
                    .nav-item {
                        display: flex;
                        align-items: center;
                        padding: 16px 24px;
                        color: #aaa;
                        text-decoration: none;
                        transition: all 0.3s ease;
                        border-left: 3px solid transparent;
                        cursor: pointer;
                    }
                    
                    .nav-item:hover {
                        background: rgba(255,255,255,0.05);
                        color: #fff;
                        border-left-color: #ff4444;
                    }
                    
                    .nav-item.active {
                        background: rgba(255,0,0,0.1);
                        color: #fff;
                        border-left-color: #ff0000;
                    }
                    
                    .nav-item .material-icons {
                        margin-right: 16px;
                        font-size: 20px;
                        color: #ff4444;
                    }
                    
                    .nav-item.active .material-icons {
                        color: #ff0000;
                    }
                    
                    .nav-text {
                        font-size: 14px;
                        font-weight: 500;
                    }
                    
                    .nav-badge {
                        margin-left: auto;
                        background: #ff0000;
                        color: white;
                        padding: 2px 8px;
                        border-radius: 12px;
                        font-size: 10px;
                        font-weight: 700;
                    }
                    
                    .main-content {
                        flex: 1;
                        margin-left: 280px;
                        display: flex;
                        flex-direction: column;
                    }
                    
                    .header {
                        background: linear-gradient(90deg, #212121 0%, #282828 100%);
                        padding: 0 32px;
                        height: 64px;
                        display: flex;
                        align-items: center;
                        border-bottom: 1px solid #3f3f3f;
                        position: sticky;
                        top: 0;
                        z-index: 50;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                    }
                    
                    .header-title {
                        font-size: 22px;
                        font-weight: 500;
                        color: #ffffff;
                        margin-right: auto;
                    }
                    
                    .status-indicator {
                        display: flex;
                        align-items: center;
                        background: rgba(0,0,0,0.3);
                        padding: 8px 16px;
                        border-radius: 20px;
                        border: 1px solid #3f3f3f;
                    }
                    
                    .status-dot {
                        width: 10px;
                        height: 10px;
                        background: #00ff00;
                        border-radius: 50%;
                        margin-right: 8px;
                        animation: pulse 2s infinite;
                        box-shadow: 0 0 10px rgba(0,255,0,0.5);
                    }
                    
                    @keyframes pulse {
                        0%, 100% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.7; transform: scale(1.1); }
                    }
                    
                    .content-wrapper {
                        flex: 1;
                        padding: 32px;
                        overflow-y: auto;
                    }
                    
                    .page-section {
                        display: none;
                    }
                    
                    .page-section.active {
                        display: block;
                    }
                    
                    .page-header {
                        margin-bottom: 32px;
                    }
                    
                    .page-title {
                        font-size: 28px;
                        font-weight: 400;
                        color: #ffffff;
                        margin-bottom: 8px;
                    }
                    
                    .page-subtitle {
                        font-size: 16px;
                        color: #aaa;
                        font-weight: 400;
                    }
                    
                    .metrics-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 20px;
                        margin-bottom: 32px;
                    }
                    
                    .metric-card {
                        background: linear-gradient(135deg, #212121 0%, #2a2a2a 100%);
                        border-radius: 16px;
                        padding: 24px;
                        border: 1px solid #3f3f3f;
                        position: relative;
                        overflow: hidden;
                        transition: all 0.3s ease;
                        box-shadow: 0 6px 25px rgba(0,0,0,0.2);
                    }
                    
                    .metric-card:hover {
                        transform: translateY(-4px);
                        box-shadow: 0 12px 40px rgba(0,0,0,0.4);
                        border-color: #606060;
                    }
                    
                    .metric-card::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 4px;
                        background: linear-gradient(90deg, #ff0000, #ff4444, #ff6666);
                    }
                    
                    .metric-number {
                        font-size: 36px;
                        font-weight: 700;
                        color: #ffffff;
                        margin-bottom: 8px;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    }
                    
                    .metric-label {
                        font-size: 13px;
                        color: #aaa;
                        text-transform: uppercase;
                        font-weight: 600;
                        letter-spacing: 1px;
                    }
                    
                    .cards-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                        gap: 24px;
                    }
                    
                    .card {
                        background: linear-gradient(135deg, #212121 0%, #2a2a2a 100%);
                        border-radius: 16px;
                        border: 1px solid #3f3f3f;
                        overflow: hidden;
                        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                        transition: all 0.3s ease;
                    }
                    
                    .card:hover {
                        box-shadow: 0 12px 48px rgba(0,0,0,0.4);
                        transform: translateY(-2px);
                    }
                    
                    .card-header {
                        padding: 24px 28px 20px;
                        border-bottom: 1px solid #3f3f3f;
                        background: linear-gradient(90deg, rgba(255,0,0,0.08), transparent);
                    }
                    
                    .card-title {
                        font-size: 18px;
                        font-weight: 600;
                        color: #ffffff;
                        display: flex;
                        align-items: center;
                    }
                    
                    .card-title .material-icons {
                        margin-right: 12px;
                        color: #ff4444;
                        font-size: 22px;
                    }
                    
                    .card-content {
                        max-height: 600px;
                        overflow-y: auto;
                        scrollbar-width: thin;
                        scrollbar-color: #606060 transparent;
                    }
                    
                    .card-content::-webkit-scrollbar {
                        width: 6px;
                    }
                    
                    .card-content::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    
                    .card-content::-webkit-scrollbar-thumb {
                        background: linear-gradient(180deg, #606060, #404040);
                        border-radius: 3px;
                    }
                    
                    .user-entry, .message-entry {
                        padding: 16px 24px;
                        border-bottom: 1px solid rgba(255,255,255,0.05);
                        transition: all 0.2s ease;
                    }
                    
                    .user-entry:hover, .message-entry:hover {
                        background: rgba(255,255,255,0.02);
                        border-left: 3px solid #ff4444;
                        padding-left: 21px;
                    }
                    
                    .user-header, .message-header {
                        display: flex;
                        align-items: center;
                        margin-bottom: 8px;
                    }
                    
                    .avatar {
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        background: linear-gradient(45deg, #ff4444, #ff0000);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-right: 12px;
                        font-size: 14px;
                        font-weight: 700;
                        color: white;
                        text-transform: uppercase;
                        border: 2px solid rgba(255,255,255,0.1);
                    }
                    
                    .username {
                        font-size: 14px;
                        font-weight: 600;
                        color: #3ea6ff;
                        margin-right: 12px;
                    }
                    
                    .user-id {
                        font-size: 10px;
                        color: #666;
                        font-family: 'Courier New', monospace;
                        background: rgba(0,0,0,0.3);
                        padding: 2px 6px;
                        border-radius: 4px;
                        margin-right: 12px;
                    }
                    
                    .loading {
                        padding: 60px 28px;
                        text-align: center;
                        color: #888;
                        font-size: 14px;
                    }
                    
                    .loading::before {
                        content: '';
                        display: inline-block;
                        width: 20px;
                        height: 20px;
                        border: 2px solid #333;
                        border-top: 2px solid #ff0000;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin-right: 12px;
                        vertical-align: middle;
                    }
                    
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    
                    @media (max-width: 1200px) {
                        .sidebar {
                            transform: translateX(-100%);
                            transition: transform 0.3s ease;
                        }
                        
                        .main-content {
                            margin-left: 0;
                        }
                        
                        .cards-grid {
                            grid-template-columns: 1fr;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="app-layout">
                    <div class="sidebar">
                        <div class="sidebar-header">
                            <div class="sidebar-logo">
                                <svg viewBox="0 0 90 20" preserveAspectRatio="xMidYMid meet">
                                    <g>
                                        <path d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 2.24288e-07 14.285 0 14.285 0C14.285 0 5.35042 2.24288e-07 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C2.24288e-07 5.35042 0 10 0 10C0 10 2.24288e-07 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5701 5.35042 27.9727 3.12324Z" fill="white"/>
                                        <path d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z" fill="#ff0000"/>
                                    </g>
                                </svg>
                                <span class="sidebar-logo-text">Studio</span>
                            </div>
                            <div class="sidebar-subtitle">Live Moderation</div>
                        </div>
                        
                        <div class="sidebar-nav">
                            <div class="nav-section">
                                <a class="nav-item active" data-page="dashboard">
                                    <span class="material-icons">dashboard</span>
                                    <span class="nav-text">Dashboard</span>
                                </a>
                                <a class="nav-item" data-page="users">
                                    <span class="material-icons">people</span>
                                    <span class="nav-text">User Analytics</span>
                                    <span class="nav-badge" id="users-count">0</span>
                                </a>
                                <a class="nav-item" data-page="moderation">
                                    <span class="material-icons">gavel</span>
                                    <span class="nav-text">Moderation</span>
                                    <span class="nav-badge" id="actions-count">0</span>
                                </a>
                                <a class="nav-item" data-page="analytics">
                                    <span class="material-icons">analytics</span>
                                    <span class="nav-text">Analytics</span>
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    <div class="main-content">
                        <div class="header">
                            <h1 class="header-title" id="page-header">Live Chat Moderation Dashboard</h1>
                            <div class="status-indicator">
                                <div class="status-dot"></div>
                                <span class="status-text">Monitoring Active</span>
                            </div>
                        </div>
                        
                        <div class="content-wrapper">
                            <!-- Dashboard Section -->
                            <div class="page-section active" id="dashboard-section">
                                <div class="page-header">
                                    <h2 class="page-title">Overview</h2>
                                    <p class="page-subtitle">Real-time monitoring and key metrics</p>
                                </div>
                                
                                <div class="metrics-grid" id="metrics-grid">
                                    <div class="loading">Loading analytics...</div>
                                </div>
                                
                                <div class="cards-grid">
                                    <div class="card">
                                        <div class="card-header">
                                            <h3 class="card-title">
                                                <span class="material-icons">chat</span>
                                                Live Chat Stream
                                            </h3>
                                        </div>
                                        <div class="card-content" id="recent-messages">
                                            <div class="loading">Loading live messages...</div>
                                        </div>
                                    </div>
                                    
                                    <div class="card">
                                        <div class="card-header">
                                            <h3 class="card-title">
                                                <span class="material-icons">warning</span>
                                                High Risk Messages
                                            </h3>
                                        </div>
                                        <div class="card-content" id="toxic-messages">
                                            <div class="loading">Analyzing patterns...</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Users Section -->
                            <div class="page-section" id="users-section">
                                <div class="page-header">
                                    <h2 class="page-title">User Analytics</h2>
                                    <p class="page-subtitle">Detailed user behavior and chat history</p>
                                </div>
                                
                                <div class="card">
                                    <div class="card-header">
                                        <h3 class="card-title">
                                            <span class="material-icons">person_search</span>
                                            User Directory
                                        </h3>
                                    </div>
                                    <div class="card-content" id="users-list">
                                        <div class="loading">Loading user data...</div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Moderation Section -->
                            <div class="page-section" id="moderation-section">
                                <div class="page-header">
                                    <h2 class="page-title">Moderation Actions</h2>
                                    <p class="page-subtitle">Review and manage moderation history</p>
                                </div>
                                
                                <div class="cards-grid">
                                    <div class="card">
                                        <div class="card-header">
                                            <h3 class="card-title">
                                                <span class="material-icons">delete</span>
                                                Deleted Messages
                                            </h3>
                                        </div>
                                        <div class="card-content" id="deletions-list">
                                            <div class="loading">Loading deletions...</div>
                                        </div>
                                    </div>
                                    
                                    <div class="card">
                                        <div class="card-header">
                                            <h3 class="card-title">
                                                <span class="material-icons">block</span>
                                                Banned Users
                                            </h3>
                                        </div>
                                        <div class="card-content" id="bans-list">
                                            <div class="loading">Loading bans...</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Analytics Section -->
                            <div class="page-section" id="analytics-section">
                                <div class="page-header">
                                    <h2 class="page-title">Advanced Analytics</h2>
                                    <p class="page-subtitle">Deep insights and trends</p>
                                </div>
                                
                                <div class="metrics-grid" id="analytics-metrics">
                                    <div class="loading">Loading analytics...</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <script>
                    // SPA Router
                    class Router {
                        constructor() {
                            this.currentPage = 'dashboard';
                            this.init();
                        }
                        
                        init() {
                            // Handle navigation clicks
                            document.querySelectorAll('.nav-item').forEach(item => {
                                item.addEventListener('click', (e) => {
                                    e.preventDefault();
                                    const page = item.getAttribute('data-page');
                                    this.navigateTo(page);
                                });
                            });
                            
                            // Handle browser back/forward
                            window.addEventListener('popstate', () => {
                                const page = window.location.pathname.substring(1) || 'dashboard';
                                this.navigateTo(page, false);
                            });
                            
                            // Initial page load
                            const initialPage = window.location.pathname.substring(1) || 'dashboard';
                            this.navigateTo(initialPage, false);
                        }
                        
                        navigateTo(page, pushState = true) {
                            if (this.currentPage === page) return;
                            
                            // Update URL
                            if (pushState) {
                                window.history.pushState({}, '', page === 'dashboard' ? '/' : '/' + page);
                            }
                            
                            // Update navigation
                            document.querySelectorAll('.nav-item').forEach(item => {
                                item.classList.remove('active');
                                if (item.getAttribute('data-page') === page) {
                                    item.classList.add('active');
                                }
                            });
                            
                            // Update sections
                            document.querySelectorAll('.page-section').forEach(section => {
                                section.classList.remove('active');
                            });
                            document.getElementById(page + '-section').classList.add('active');
                            
                            // Update header title
                            const titles = {
                                dashboard: 'Live Chat Moderation Dashboard',
                                users: 'User Analytics Dashboard',
                                moderation: 'Moderation Actions Dashboard',
                                analytics: 'Advanced Analytics Dashboard'
                            };
                            document.getElementById('page-header').textContent = titles[page];
                            
                            this.currentPage = page;
                            
                            // Load page-specific data
                            this.loadPageData(page);
                        }
                        
                        loadPageData(page) {
                            switch(page) {
                                case 'dashboard':
                                    loadDashboardData();
                                    break;
                                case 'users':
                                    loadUsersData();
                                    break;
                                case 'moderation':
                                    loadModerationData();
                                    break;
                                case 'analytics':
                                    loadAnalyticsData();
                                    break;
                            }
                        }
                    }
                    
                    // Data loading functions
                    function loadDashboardData() {
                        fetch('/api/chat-data')
                            .then(response => response.json())
                            .then(data => {
                                updateMetrics(data.stats);
                                updateRecentMessages(data.recentMessages);
                                updateToxicMessages(data.toxicMessages);
                                updateNavBadges(data.stats);
                            })
                            .catch(error => console.error('Error loading dashboard data:', error));
                    }
                    
                    function loadUsersData() {
                        fetch('/api/users')
                            .then(response => response.json())
                            .then(data => {
                                updateUsersList(data.topToxicUsers);
                            })
                            .catch(error => console.error('Error loading users data:', error));
                    }
                    
                    function loadModerationData() {
                        fetch('/api/moderation')
                            .then(response => response.json())
                            .then(data => {
                                updateModerationLists(data.moderationActions);
                            })
                            .catch(error => console.error('Error loading moderation data:', error));
                    }
                    
                    function loadAnalyticsData() {
                        fetch('/api/stats')
                            .then(response => response.json())
                            .then(data => {
                                updateAnalyticsMetrics(data);
                            })
                            .catch(error => console.error('Error loading analytics data:', error));
                    }
                    
                    // Update functions
                    function updateMetrics(stats) {
                        document.getElementById('metrics-grid').innerHTML = 
                            '<div class="metric-card"><div class="metric-number">' + stats.totalMessages + '</div><div class="metric-label">Total Messages</div></div>' +
                            '<div class="metric-card"><div class="metric-number">' + stats.totalToxicMessages + '</div><div class="metric-label">Toxic Detected</div></div>' +
                            '<div class="metric-card"><div class="metric-number">' + stats.totalUsers + '</div><div class="metric-label">Users Tracked</div></div>' +
                            '<div class="metric-card"><div class="metric-number">' + stats.activeUsers + '</div><div class="metric-label">Active Users</div></div>' +
                            '<div class="metric-card"><div class="metric-number">' + stats.totalDeletions + '</div><div class="metric-label">Messages Deleted</div></div>' +
                            '<div class="metric-card"><div class="metric-number">' + stats.totalBans + '</div><div class="metric-label">Users Banned</div></div>';
                    }
                    
                    function updateNavBadges(stats) {
                        document.getElementById('users-count').textContent = stats.totalUsers;
                        document.getElementById('actions-count').textContent = stats.totalDeletions + stats.totalBans + stats.totalTimeouts;
                    }
                    
                    function updateRecentMessages(messages) {
                        document.getElementById('recent-messages').innerHTML = 
                            messages.map(msg => 
                                '<div class="message-entry">' +
                                '<div class="message-header">' +
                                '<div class="avatar">' + (msg.username ? msg.username.charAt(0).toUpperCase() : '?') + '</div>' +
                                '<span class="username">' + msg.username + '</span>' +
                                '<span class="user-id">' + msg.userId.substring(0, 12) + '...</span>' +
                                '</div>' +
                                '<div class="message-text">' + msg.message + '</div>' +
                                '</div>'
                            ).join('') || '<div class="loading">No messages yet</div>';
                    }
                    
                    function updateToxicMessages(messages) {
                        document.getElementById('toxic-messages').innerHTML = 
                            messages.map(msg => 
                                '<div class="message-entry">' +
                                '<div class="message-header">' +
                                '<div class="avatar">' + (msg.username ? msg.username.charAt(0).toUpperCase() : '?') + '</div>' +
                                '<span class="username">' + msg.username + '</span>' +
                                '<span class="user-id">' + msg.userId.substring(0, 12) + '...</span>' +
                                '</div>' +
                                '<div class="message-text">' + msg.message + '</div>' +
                                '</div>'
                            ).join('') || '<div class="loading">No toxic messages</div>';
                    }
                    
                    function updateUsersList(users) {
                        document.getElementById('users-list').innerHTML = 
                            users.map(user => 
                                '<div class="user-entry">' +
                                '<div class="user-header">' +
                                '<div class="avatar">' + (user.username ? user.username.charAt(0).toUpperCase() : '?') + '</div>' +
                                '<span class="username">' + user.username + '</span>' +
                                '</div>' +
                                '<div class="user-id">' + user.userId + '</div>' +
                                '<div>Messages: ' + user.messageCount + ' | Avg Toxicity: ' + user.averageToxicity + '</div>' +
                                '</div>'
                            ).join('') || '<div class="loading">No users found</div>';
                    }
                    
                    function updateModerationLists(actions) {
                        document.getElementById('deletions-list').innerHTML = 
                            actions.deletions.map(action => 
                                '<div class="message-entry">' +
                                '<div class="message-header">' +
                                '<div class="avatar">' + (action.username ? action.username.charAt(0).toUpperCase() : '?') + '</div>' +
                                '<span class="username">' + action.username + '</span>' +
                                '</div>' +
                                '<div class="message-text">' + action.message + '</div>' +
                                '</div>'
                            ).join('') || '<div class="loading">No deletions</div>';
                            
                        document.getElementById('bans-list').innerHTML = 
                            actions.bans.map(action => 
                                '<div class="message-entry">' +
                                '<div class="message-header">' +
                                '<div class="avatar">' + (action.username ? action.username.charAt(0).toUpperCase() : '?') + '</div>' +
                                '<span class="username">' + action.username + '</span>' +
                                '</div>' +
                                '<div class="message-text">' + action.message + '</div>' +
                                '</div>'
                            ).join('') || '<div class="loading">No bans</div>';
                    }
                    
                    function updateAnalyticsMetrics(stats) {
                        document.getElementById('analytics-metrics').innerHTML = 
                            '<div class="metric-card"><div class="metric-number">' + stats.messagesProcessed + '</div><div class="metric-label">Messages Processed</div></div>' +
                            '<div class="metric-card"><div class="metric-number">' + stats.actionsTotal + '</div><div class="metric-label">Total Actions</div></div>' +
                            '<div class="metric-card"><div class="metric-number">' + stats.warnings + '</div><div class="metric-label">Warnings Issued</div></div>' +
                            '<div class="metric-card"><div class="metric-number">' + (stats.messagesProcessed > 0 ? Math.round((stats.actionsTotal / stats.messagesProcessed) * 100) : 0) + '%</div><div class="metric-label">Action Rate</div></div>';
                    }
                    
                    // Initialize router
                    const router = new Router();
                    
                    // Auto-refresh data every 5 seconds for current page
                    setInterval(() => {
                        router.loadPageData(router.currentPage);
                    }, 5000);
                </script>
            </body>
            </html>
        `;
    }

    stop() {
        if (this.server) {
            this.server.close();
            logger.info('Dashboard server stopped');
        }
    }
}

module.exports = DashboardServer;
