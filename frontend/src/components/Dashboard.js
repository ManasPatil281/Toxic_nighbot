import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  Youtube,
  TrendingUp,
  MessageCircle,
  AlertTriangle,
  Trash2,
  UserX,
  Clock,
  Activity,
  Pause,
  Play,
  Eraser,
  Download,
  History,
  Circle,
} from "lucide-react";

const ToxicNightBotDashboard = () => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [logs, setLogs] = useState([]);
  const [moderationHistory, setModerationHistory] = useState([]);
  const [actionFilter, setActionFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [statusText, setStatusText] = useState("Connecting...");

  const [channelInfo, setChannelInfo] = useState({
    channelName: "Loading...",
    channelId: "Loading...",
    streamStatus: "Checking...",
    chatId: "N/A",
  });

  const [stats, setStats] = useState({
    messagesProcessed: 0,
    warnings: 0,
    deletions: 0,
    timeouts: 0,
    bans: 0,
  });

  // Check for user data and fetch channel info
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (!userData) {
      navigate("/login");
      return;
    }

    const fetchChannelInfo = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/channel-info", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch channel info");
        }

        const data = await response.json();
        setChannelInfo({
          channelName: data.channelName,
          channelId: data.channelId,
          streamStatus: data.isLive ? "Live" : "Offline",
          chatId: data.chatId,
        });

        setIsConnected(true);
        setConnectionStatus("online");
        setStatusText("Connected & Monitoring");
      } catch (error) {
        console.error("Error fetching channel info:", error);
        setConnectionStatus("offline");
        setStatusText("Connection Failed");
      }
    };

    fetchChannelInfo();
  }, [navigate]);

  // Fetch real-time stats
  useEffect(() => {
    if (!isConnected) return;

    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/stats", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    // Initial fetch
    fetchStats();

    // Set up polling every 5 seconds
    const interval = setInterval(fetchStats, 5000);

    return () => clearInterval(interval);
  }, [isConnected]);

  // Fetch moderation history
  useEffect(() => {
    if (!isConnected) return;

    const fetchModerationHistory = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/moderation-history",
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch moderation history");
        }

        const data = await response.json();
        setModerationHistory(data);
      } catch (error) {
        console.error("Error fetching moderation history:", error);
      }
    };

    // Initial fetch
    fetchModerationHistory();

    // Set up polling every 10 seconds
    const interval = setInterval(fetchModerationHistory, 10000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const getStatusDotColor = () => {
    switch (connectionStatus) {
      case "online":
        return "bg-green-500";
      case "offline":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const toggleLogsPause = () => {
    setIsPaused(!isPaused);
  };

  const exportLogs = () => {
    const data = {
      logs,
      moderationHistory,
      stats,
      exportTime: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `toxic-bot-logs-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  const getFilteredHistory = () => {
    return moderationHistory.filter((action) => {
      const matchesAction =
        actionFilter === "all" || action.action === actionFilter;
      const matchesUser =
        !userSearch ||
        action.user.toLowerCase().includes(userSearch.toLowerCase());
      return matchesAction && matchesUser;
    });
  };

  const getScoreColor = (score) => {
    if (score <= 3) return "bg-green-500 text-white";
    if (score <= 6) return "bg-yellow-500 text-black";
    return "bg-red-500 text-white";
  };

  const getActionBadgeColor = (action) => {
    switch (action) {
      case "warn":
        return "bg-yellow-500 text-black";
      case "delete":
        return "bg-red-500 text-white";
      case "timeout":
        return "bg-purple-500 text-white";
      case "ban":
        return "bg-gray-600 text-white";
      case "none":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-400 text-black";
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-6 shadow-2xl border border-slate-600">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Bot className="text-red-400" size={32} />
              Toxic NightBot
            </h1>
            <div className="flex items-center gap-3 bg-slate-700/50 px-4 py-2 rounded-full">
              <div
                className={`w-3 h-3 rounded-full ${getStatusDotColor()} animate-pulse shadow-lg`}
              ></div>
              <span className="text-sm font-medium">{statusText}</span>
            </div>
          </div>
        </div>

        {/* Channel Information */}
        <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700 hover:border-slate-600 transition-colors">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-red-400">
            <Youtube size={24} />
            Channel Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Channel Name</div>
              <div className="font-semibold">{channelInfo.channelName}</div>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Channel ID</div>
              <div className="font-semibold font-mono text-xs break-all">
                {channelInfo.channelId}
              </div>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Live Stream</div>
              <div className="flex items-center gap-2">
                <Circle
                  className={`w-3 h-3 ${
                    channelInfo.streamStatus === "Live"
                      ? "text-green-500 fill-green-500"
                      : "text-red-500 fill-red-500"
                  }`}
                />
                <span
                  className={
                    channelInfo.streamStatus === "Live"
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {channelInfo.streamStatus}
                </span>
              </div>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Live Chat ID</div>
              <div className="font-semibold font-mono text-xs break-all">
                {channelInfo.chatId}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-center flex items-center justify-center gap-2">
            <TrendingUp className="text-red-400" />
            Moderation Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              {
                icon: MessageCircle,
                label: "Messages Processed",
                value: stats.messagesProcessed,
                color: "text-blue-400",
              },
              {
                icon: AlertTriangle,
                label: "Warnings",
                value: stats.warnings,
                color: "text-yellow-400",
              },
              {
                icon: Trash2,
                label: "Deletions",
                value: stats.deletions,
                color: "text-red-400",
              },
              {
                icon: Clock,
                label: "Timeouts",
                value: stats.timeouts,
                color: "text-purple-400",
              },
              {
                icon: UserX,
                label: "Bans",
                value: stats.bans,
                color: "text-gray-400",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-slate-800 rounded-xl p-6 text-center hover:bg-slate-700 transition-colors border border-slate-700"
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-700 mb-4 ${stat.color}`}
                >
                  <stat.icon size={24} />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Logs */}
        <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-red-400">
              <Activity size={24} />
              Live Activity Log
            </h2>
            <div className="flex gap-2">
              <button
                onClick={clearLogs}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                <Eraser size={16} />
                Clear
              </button>
              <button
                onClick={toggleLogsPause}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                {isPaused ? <Play size={16} /> : <Pause size={16} />}
                {isPaused ? "Resume" : "Pause"}
              </button>
              <button
                onClick={exportLogs}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                <Download size={16} />
                Export
              </button>
            </div>
          </div>
          <div className="bg-slate-900 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No chat activity yet. Waiting for messages...
              </div>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`mb-2 p-2 rounded border-l-4 ${
                    log.level === "warn"
                      ? "border-yellow-400 bg-yellow-900/20 text-yellow-200"
                      : log.level === "error"
                      ? "border-red-400 bg-red-900/20 text-red-200"
                      : "border-blue-400 bg-blue-900/20 text-blue-200"
                  }`}
                >
                  <span className="text-gray-400 text-xs mr-2">
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>
                  {log.message}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Moderation History */}
        <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-red-400">
            <History size={24} />
            Moderation History
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              <option value="all">All Actions</option>
              <option value="none">None</option>
              <option value="warn">Warnings</option>
              <option value="delete">Deletions</option>
              <option value="timeout">Timeouts</option>
              <option value="ban">Bans</option>
            </select>
            <input
              type="text"
              placeholder="Search by username or ID..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="text-left p-3 font-semibold text-red-400">
                    Time
                  </th>
                  <th className="text-left p-3 font-semibold text-red-400">
                    User
                  </th>
                  <th className="text-left p-3 font-semibold text-red-400">
                    Message
                  </th>
                  <th className="text-left p-3 font-semibold text-red-400">
                    Action
                  </th>
                  <th className="text-left p-3 font-semibold text-red-400">
                    Score
                  </th>
                  <th className="text-left p-3 font-semibold text-red-400">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody>
                {getFilteredHistory().length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-400">
                      No toxic messages detected yet
                    </td>
                  </tr>
                ) : (
                  getFilteredHistory().map((action, index) => (
                    <tr
                      key={index}
                      className="border-b border-slate-700 hover:bg-slate-700/50"
                    >
                      <td className="p-3">
                        {new Date(action.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold">{action.user}</div>
                        <div className="text-xs text-gray-400 font-mono">
                          {action.userId.substring(0, 12)}...
                        </div>
                      </td>
                      <td className="p-3 max-w-xs">
                        <div className="bg-slate-700 p-2 rounded italic text-sm">
                          "{action.message}"
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getActionBadgeColor(
                            action.action
                          )}`}
                        >
                          {action.action}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded font-semibold ${getScoreColor(
                            action.toxicityScore
                          )}`}
                        >
                          {action.toxicityScore}/10
                        </span>
                      </td>
                      <td className="p-3 text-xs text-gray-400">
                        {action.reasoning}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToxicNightBotDashboard;
