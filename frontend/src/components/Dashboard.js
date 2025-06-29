import React, { useState, useEffect, useCallback, useRef } from "react";
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
  RefreshCw,
  Users,
  Shield,
} from "lucide-react";
import { useLocation } from "react-router-dom";

const ToxicNightBotDashboard = () => {
  const location = useLocation();
  const [isConnected, setIsConnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [logs, setLogs] = useState([]);
  const [moderationHistory, setModerationHistory] = useState([]);
  const [actionFilter, setActionFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [statusText, setStatusText] = useState("Connecting...");
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // New state for additional data
  const [chatData, setChatData] = useState({
    recentMessages: [],
    toxicMessages: [],
    topToxicUsers: [],
    stats: {},
  });
  const [userData, setUserData] = useState({
    topToxicUsers: [],
    allUsers: [],
  });
  const [moderationData, setModerationData] = useState({
    moderationActions: { deletions: [], bans: [], timeouts: [], warnings: [] },
    stats: {},
  });

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

  // const addDebugLog = (message, level = "info") => {
  //   const logEntry = {
  //     timestamp: new Date().toISOString(),
  //     message,
  //     level,
  //   };
  //   setLogs((prev) => [logEntry, ...prev.slice(0, 49)]);
  // };

  const intervalRef = useRef(null);
  const isUnmountedRef = useRef(false);

  const addDebugLog = useCallback((message, level = "info") => {
    if (isUnmountedRef.current) return;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      message,
      level,
    };
    setLogs((prev) => [logEntry, ...prev.slice(0, 49)]);
  }, []);

  const fetchAllData = useCallback(async () => {
    if (isUnmountedRef.current || !isConnected) return;

    try {
      setIsRefreshing(true);

      const [
        chatResponse,
        usersResponse,
        moderationResponse,
        statsResponse,
        historyResponse,
      ] = await Promise.all([
        fetch("http://localhost:3050/api/chat-data", {
          credentials: "include",
        }),
        fetch("http://localhost:3050/api/users", { credentials: "include" }),
        fetch("http://localhost:3050/api/moderation", {
          credentials: "include",
        }),
        fetch("http://localhost:3050/api/stats", { credentials: "include" }),
        fetch("http://localhost:3050/api/moderation-history", {
          credentials: "include",
        }),
      ]);

      // Early return if component unmounted
      if (isUnmountedRef.current) return;

      // Process chat data
      if (chatResponse.ok) {
        const data = await chatResponse.json();
        setChatData(data);
        addDebugLog(
          `📊 Chat data updated: ${
            data.recentMessages?.length || 0
          } recent messages, ${data.toxicMessages?.length || 0} toxic messages`
        );
      }

      // Process user data
      if (usersResponse.ok) {
        const data = await usersResponse.json();
        setUserData(data);
        addDebugLog(
          `👥 User data updated: ${
            data.topToxicUsers?.length || 0
          } toxic users tracked`
        );
      }

      // Process moderation data
      if (moderationResponse.ok) {
        const data = await moderationResponse.json();
        setModerationData(data);
        addDebugLog(
          `🛡️ Moderation data updated: ${
            data.moderationActions?.deletions?.length || 0
          } deletions, ${data.moderationActions?.bans?.length || 0} bans`
        );
      }

      // Process stats - use functional update to avoid stale closure
      if (statsResponse.ok) {
        const newStats = await statsResponse.json();
        setStats(prevStats => {
          if (newStats.messagesProcessed !== prevStats.messagesProcessed) {
            addDebugLog(
              `📊 Messages processed: ${newStats.messagesProcessed} (+${
                newStats.messagesProcessed - prevStats.messagesProcessed
              })`
            );
          }
          return newStats;
        });
      }

      // Process moderation history
      if (historyResponse.ok) {
        const newHistory = await historyResponse.json();
        setModerationHistory(prevHistory => {
          if (newHistory.length > prevHistory.length) {
            const newActions = newHistory.length - prevHistory.length;
            addDebugLog(
              `🚨 ${newActions} new moderation action(s) detected!`,
              "warn"
            );
          }
          return newHistory;
        });
      }

      setLastUpdate(new Date());
    } catch (error) {
      if (!isUnmountedRef.current) {
        console.error("Error fetching data:", error);
        addDebugLog(`⚠️ Data fetch failed: ${error.message}`, "error");
      }
    } finally {
      if (!isUnmountedRef.current) {
        setIsRefreshing(false);
      }
    }
  }, [isConnected, addDebugLog]);

  // Polling management functions
  const startPolling = useCallback(() => {
    if (intervalRef.current || !isConnected) return;
    
    console.log("Starting polling...");
    intervalRef.current = setInterval(fetchAllData, 5000);
  }, [fetchAllData, isConnected]);

  const stopPolling = useCallback(() => {
    console.log("Stopping polling...");
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);


  useEffect(() => {
    console.log("reached channel info")
    const params = new URLSearchParams(location.search);
    const authSuccess = params.get("auth");

    if (authSuccess === "success") {
      localStorage.setItem(
        "userData",
        JSON.stringify({ isAuthenticated: true })
      );
      window.history.replaceState({}, document.title, "/dashboard");
    }

    const userData = localStorage.getItem("userData");
    if (!userData) {
      console.log("No user data found");
      setConnectionStatus("unauthenticated");
      setStatusText("Please login via OAuth");
      return;
    }

    const fetchChannelInfo = async () => {
      try {
        addDebugLog("Fetching channel information...");
        const response = await fetch("http://localhost:3050/api/channel-info", {
          credentials: "include",
        });
        console.log(response)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("yt-channel",data)
        if (isUnmountedRef.current) return;
        console.log("isUnMountedRef",isUnmountedRef)
        setChannelInfo({
          channelName: data.channelName,
          channelId: data.channelId,
          streamStatus: data.isLive ? "Live" : "Offline",
          chatId: data.chatId,
        });

        addDebugLog(`✅ Connected to channel: ${data.channelName}`, "info");
        setIsConnected(true);
        setConnectionStatus("online");
        setStatusText("Connected & Monitoring");
      } catch (error) {
        if (!isUnmountedRef.current) {
          console.error("Error fetching channel info:", error);
          addDebugLog(`❌ Failed to connect: ${error.message}`, "error");
          setConnectionStatus("offline");
          setStatusText("Connection Failed");
        }
      }
    };

    fetchChannelInfo();
  }, [location, addDebugLog]);

  useEffect(() => {
    console.log("Channel info updated:", channelInfo);
  }, [channelInfo]);
  
  useEffect(() => {
    if (!isConnected) {
      stopPolling();
      return;
    }

    // Initial fetch
    fetchAllData();
    
    // Start polling
    startPolling();

    return () => {
      stopPolling();
    };
  }, [isConnected, fetchAllData, startPolling, stopPolling]);

  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      stopPolling();
    };
  }, [stopPolling]);

  const manualRefresh = useCallback(async () => {
    addDebugLog("🔄 Manual refresh triggered...");
    await fetchAllData();
  }, [fetchAllData, addDebugLog]);


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
    addDebugLog("🧹 Logs cleared");
  };

  const toggleLogsPause = () => {
    setIsPaused(!isPaused);
    addDebugLog(isPaused ? "▶️ Logs resumed" : "⏸️ Logs paused");
  };

  const exportLogs = () => {
    const data = {
      logs,
      moderationHistory,
      stats,
      channelInfo,
      chatData,
      userData,
      moderationData,
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
    addDebugLog("📥 Logs exported successfully");
  };

  const getFilteredHistory = () => {
    return moderationHistory.filter((action) => {
      const matchesAction =
        actionFilter === "all" ||
        action.action === actionFilter ||
        action.actionType === actionFilter;
      const matchesUser =
        !userSearch ||
        (action.user &&
          action.user.toLowerCase().includes(userSearch.toLowerCase())) ||
        (action.username &&
          action.username.toLowerCase().includes(userSearch.toLowerCase()));
      return matchesAction && matchesUser;
    });
  };

  const getScoreColor = (score) => {
    if (!score) return "bg-gray-500 text-white";
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
        {/* ... keep existing code (header section) */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-6 shadow-2xl border border-slate-600">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Bot className="text-red-400" size={32} />
              Toxic NightBot
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={manualRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-lg transition-colors text-sm"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </button>
              <div className="flex items-center gap-3 bg-slate-700/50 px-4 py-2 rounded-full">
                <div
                  className={`w-3 h-3 rounded-full ${getStatusDotColor()} animate-pulse shadow-lg`}
                ></div>
                <span className="text-sm font-medium">{statusText}</span>
              </div>
            </div>
          </div>
          {lastUpdate && (
            <div className="text-xs text-gray-400 mt-2">
              Last update: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* ... keep existing code (channel information section) */}
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

        {/* Enhanced Statistics using combined data */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-center flex items-center justify-center gap-2">
            <TrendingUp className="text-red-400" />
            Moderation Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {
                icon: MessageCircle,
                label: "Total Messages",
                value: chatData.stats?.totalMessages || stats.messagesProcessed,
                color: "text-blue-400",
              },
              {
                icon: AlertTriangle,
                label: "Toxic Messages",
                value: chatData.stats?.totalToxicMessages || 0,
                color: "text-orange-400",
              },
              {
                icon: Users,
                label: "Total Users",
                value: chatData.stats?.totalUsers || 0,
                color: "text-green-400",
              },
              {
                icon: Trash2,
                label: "Deletions",
                value: chatData.stats?.totalDeletions || stats.deletions,
                color: "text-red-400",
              },
              {
                icon: Clock,
                label: "Timeouts",
                value: chatData.stats?.totalTimeouts || stats.timeouts,
                color: "text-purple-400",
              },
              {
                icon: UserX,
                label: "Bans",
                value: chatData.stats?.totalBans || stats.bans,
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

        {/* New: Recent Messages Feed */}
        <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-red-400">
            <MessageCircle size={24} />
            Recent Chat Messages ({chatData.recentMessages?.length || 0})
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {chatData.recentMessages?.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No recent messages available
              </div>
            ) : (
              chatData.recentMessages?.map((message, index) => (
                <div
                  key={message.id || index}
                  className={`p-3 rounded-lg border-l-4 ${
                    message.toxicityScore > 5
                      ? "border-red-400 bg-red-900/20"
                      : message.toxicityScore > 3
                      ? "border-yellow-400 bg-yellow-900/20"
                      : "border-green-400 bg-green-900/20"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">
                        {message.username}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${getScoreColor(
                          message.toxicityScore
                        )}`}
                      >
                        {message.toxicityScore}/10
                      </span>
                      {message.action !== "none" && (
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getActionBadgeColor(
                            message.action
                          )}`}
                        >
                          {message.action}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-gray-200">
                    {message.message || message.text}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* New: Top Toxic Users */}
        <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-red-400">
            <Shield size={24} />
            Top Toxic Users ({userData.topToxicUsers?.length || 0})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="text-left p-3 font-semibold text-red-400">
                    Rank
                  </th>
                  <th className="text-left p-3 font-semibold text-red-400">
                    Username
                  </th>
                  <th className="text-left p-3 font-semibold text-red-400">
                    Messages
                  </th>
                  <th className="text-left p-3 font-semibold text-red-400">
                    Avg Toxicity
                  </th>
                  <th className="text-left p-3 font-semibold text-red-400">
                    Last Active
                  </th>
                </tr>
              </thead>
              <tbody>
                {userData.topToxicUsers?.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-400">
                      No toxic users detected yet
                    </td>
                  </tr>
                ) : (
                  userData.topToxicUsers?.map((user, index) => (
                    <tr
                      key={user.userId || index}
                      className="border-b border-slate-700 hover:bg-slate-700/50"
                    >
                      <td className="p-3">
                        <span className="text-lg font-bold text-red-400">
                          #{index + 1}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold">{user.username}</div>
                        <div className="text-xs text-gray-400 font-mono">
                          {user.userId?.substring(0, 12)}...
                        </div>
                      </td>
                      <td className="p-3">{user.messageCount || 0}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded font-semibold ${getScoreColor(
                            user.averageToxicityScore || user.toxicityScore
                          )}`}
                        >
                          {(
                            user.averageToxicityScore ||
                            user.toxicityScore ||
                            0
                          ).toFixed(1)}
                          /10
                        </span>
                      </td>
                      <td className="p-3 text-xs text-gray-400">
                        {user.lastActive
                          ? new Date(user.lastActive).toLocaleString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ... keep existing code (activity log section) */}
        <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-red-400">
              <Activity size={24} />
              Live Activity Log ({logs.length})
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
                No activity logged yet. System is monitoring...
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

        {/* ... keep existing code (moderation history section) */}
        <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-red-400">
              <History size={24} />
              Moderation History ({moderationHistory.length})
            </h2>
            {isRefreshing && (
              <div className="flex items-center gap-2 text-blue-400">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Updating...</span>
              </div>
            )}
          </div>
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
              placeholder="Search by username..."
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
                      {moderationHistory.length === 0
                        ? "No moderation actions yet"
                        : "No results match your filter"}
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
                        <div className="font-semibold">
                          {action.user || action.username}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          {(action.userId || "").substring(0, 12)}...
                        </div>
                      </td>
                      <td className="p-3 max-w-xs">
                        <div className="bg-slate-700 p-2 rounded italic text-sm">
                          "{action.message || action.text}"
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getActionBadgeColor(
                            action.action || action.actionType
                          )}`}
                        >
                          {action.action || action.actionType}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded font-semibold ${getScoreColor(
                            action.toxicityScore
                          )}`}
                        >
                          {action.toxicityScore || "N/A"}/10
                        </span>
                      </td>
                      <td className="p-3 text-xs text-gray-400">
                        {action.reasoning ||
                          action.reason ||
                          "No reason provided"}
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
