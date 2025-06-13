class ToxicBotDashboard {
    constructor() {
        this.isConnected = false;
        this.isPaused = false;
        this.logs = [];
        this.moderationHistory = [];
        this.stats = {
            messagesProcessed: 0,
            actionsTotal: 0,
            warnings: 0,
            deletions: 0,
            timeouts: 0,
            bans: 0
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.connectToBot();
        this.startAutoRefresh();
        this.loadChannelInfo();
    }

    setupEventListeners() {
        // Log controls
        document.getElementById('clear-logs').addEventListener('click', () => {
            this.clearLogs();
        });

        document.getElementById('pause-logs').addEventListener('click', () => {
            this.toggleLogsPause();
        });

        document.getElementById('export-logs').addEventListener('click', () => {
            this.exportLogs();
        });

        // History filters
        document.getElementById('action-filter').addEventListener('change', () => {
            this.filterHistory();
        });

        document.getElementById('user-search').addEventListener('input', () => {
            this.filterHistory();
        });
    }

    async connectToBot() {
        try {
            const response = await fetch('/api/status');
            if (response.ok) {
                const data = await response.json();
                this.isConnected = data.connected;
                if (this.isConnected) {
                    this.updateConnectionStatus('online', 'Connected & Monitoring');
                } else {
                    this.updateConnectionStatus('offline', 'Bot Stopped');
                }
            } else {
                this.updateConnectionStatus('offline', 'Connection Failed');
            }
        } catch (error) {
            this.updateConnectionStatus('connecting', 'Connecting...');
        }
    }

    updateConnectionStatus(status, text) {
        const statusDot = document.getElementById('connection-status');
        const statusText = document.getElementById('status-text');
        
        statusDot.className = `status-dot ${status}`;
        statusText.textContent = text;
    }

    async loadChannelInfo() {
        try {
            const response = await fetch('/api/channel');
            if (response.ok) {
                const data = await response.json();
                
                document.getElementById('channel-name').textContent = data.channelName || 'Loading...';
                document.getElementById('channel-id').textContent = data.channelId || 'N/A';
                
                if (data.liveChatId) {
                    document.getElementById('stream-status').innerHTML = '<span style="color: #27ae60;"><i class="fas fa-circle"></i> Live</span>';
                    document.getElementById('chat-id').textContent = data.liveChatId;
                } else {
                    document.getElementById('stream-status').innerHTML = '<span style="color: #e74c3c;"><i class="fas fa-circle"></i> Offline</span>';
                    document.getElementById('chat-id').textContent = 'No active stream';
                }
            }
        } catch (error) {
            console.error('Failed to load channel info:', error);
        }
    }

    startAutoRefresh() {
        setInterval(() => {
            if (!this.isPaused) {
                this.fetchLogs();
                this.fetchStats();
                this.fetchHistory();
                this.connectToBot(); // Update connection status
            }
        }, 2000);
    }

    async fetchLogs() {
        try {
            const response = await fetch('/api/logs');
            if (response.ok) {
                const logs = await response.json();
                this.logs = logs;
                this.renderLogs();
            }
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        }
    }

    async fetchStats() {
        try {
            const response = await fetch('/api/stats');
            if (response.ok) {
                const stats = await response.json();
                this.stats = stats;
                this.updateStats(stats);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    }

    async fetchHistory() {
        try {
            const response = await fetch('/api/history');
            if (response.ok) {
                const history = await response.json();
                this.moderationHistory = history;
                this.renderHistory();
            }
        } catch (error) {
            console.error('Failed to fetch history:', error);
        }
    }

    addLog(level, message) {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, level, message };
        
        this.logs.push(logEntry);
        
        // Keep only last 100 logs
        if (this.logs.length > 100) {
            this.logs.shift();
        }
        
        this.renderLogs();
    }

    renderLogs() {
        const container = document.getElementById('logs-container');
        
        if (this.logs.length === 0) {
            container.innerHTML = '<div class="log-entry info">No chat activity yet. Waiting for messages...</div>';
            return;
        }
        
        container.innerHTML = this.logs.map(log => {
            const time = new Date(log.timestamp).toLocaleTimeString();
            const level = log.level || 'info';
            return `
                <div class="log-entry ${level}">
                    <span class="log-timestamp">[${time}]</span> ${log.message}
                </div>
            `;
        }).join('');
        
        // Auto-scroll to bottom
        container.scrollTop = container.scrollHeight;
    }

    addModerationAction(action) {
        this.moderationHistory.unshift(action);
        
        // Update stats
        switch (action.action) {
            case 'warn':
                this.stats.warnings++;
                break;
            case 'delete':
                this.stats.deletions++;
                break;
            case 'timeout':
                this.stats.timeouts++;
                break;
            case 'ban':
                this.stats.bans++;
                break;
        }
        this.stats.messagesProcessed++;
        
        this.updateStats(this.stats);
        this.renderHistory();
    }

    updateStats(stats) {
        document.getElementById('total-messages').textContent = stats.messagesProcessed || 0;
        document.getElementById('total-warnings').textContent = stats.warnings || 0;
        document.getElementById('total-deletions').textContent = stats.deletions || 0;
        document.getElementById('total-timeouts').textContent = stats.timeouts || 0;
        document.getElementById('total-bans').textContent = stats.bans || 0;
    }

    renderHistory() {
        const tbody = document.getElementById('history-tbody');
        
        if (this.moderationHistory.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #666;">No toxic messages detected yet</td></tr>';
            return;
        }
        
        const filteredHistory = this.getFilteredHistory();
        
        tbody.innerHTML = filteredHistory.map(action => {
            const time = new Date(action.timestamp).toLocaleString();
            const scoreClass = this.getScoreClass(action.toxicityScore);
            
            return `
                <tr>
                    <td>${time}</td>
                    <td>
                        <div style="font-weight: 600;">${action.user}</div>
                        <small style="color: #666; font-family: monospace;">${action.userId.substring(0, 12)}...</small>
                    </td>
                    <td style="max-width: 300px;">
                        <div style="background: #f8f9fa; padding: 8px; border-radius: 4px; font-style: italic;">
                            "${action.message}"
                        </div>
                    </td>
                    <td>
                        <span class="action-badge action-${action.action}">${action.action}</span>
                    </td>
                    <td>
                        <span class="toxicity-score ${scoreClass}">${action.toxicityScore}/10</span>
                    </td>
                    <td style="font-size: 0.8rem; color: #666;">
                        ${action.reasoning}
                    </td>
                </tr>
            `;
        }).join('');
    }

    getFilteredHistory() {
        const actionFilter = document.getElementById('action-filter').value;
        const userSearch = document.getElementById('user-search').value.toLowerCase();
        
        return this.moderationHistory.filter(action => {
            const matchesAction = actionFilter === 'all' || action.action === actionFilter;
            const matchesUser = !userSearch || action.user.toLowerCase().includes(userSearch);
            return matchesAction && matchesUser;
        });
    }

    getScoreClass(score) {
        if (score <= 3) return 'score-low';
        if (score <= 6) return 'score-medium';
        return 'score-high';
    }

    clearLogs() {
        this.logs = [];
        this.renderLogs();
    }

    toggleLogsPause() {
        this.isPaused = !this.isPaused;
        const button = document.getElementById('pause-logs');
        const icon = button.querySelector('i');
        
        if (this.isPaused) {
            icon.className = 'fas fa-play';
            button.innerHTML = '<i class="fas fa-play"></i> Resume';
        } else {
            icon.className = 'fas fa-pause';
            button.innerHTML = '<i class="fas fa-pause"></i> Pause';
        }
    }

    exportLogs() {
        const data = {
            logs: this.logs,
            moderationHistory: this.moderationHistory,
            stats: this.stats,
            exportTime: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `toxic-bot-logs-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }

    filterHistory() {
        this.renderHistory();
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    new ToxicBotDashboard();
});
