/**
 * Ama Treasure Adventure - Debug Logger
 * Comprehensive activity logging system for gameplay monitoring
 * 
 * PERFORMANCE OPTIMIZED: Batched localStorage writes to prevent browser crashes
 */

// Production mode flag - set to true to disable all debug logging
const DEBUG_MODE = false;

class GameActivityLogger {
  constructor() {
    this.storageKey = "amaGameActivityLog";
    this.maxEntries = 200; // Reduced from 500 to prevent memory bloat
    this.displayLimit = 100; // Reduced from 200 for better performance
    this.sessionId = Date.now();
    this.sessionStartTime = new Date();
    this.pendingLogs = []; // Buffer for batched writes
    this.saveTimeout = null; // Timer for batched saves
    this.saveInterval = 2000; // Only save to localStorage every 2 seconds
  }

  /**
   * Add a new log entry - PERFORMANCE OPTIMIZED
   */
  addLog(message, type = "info", details = {}) {
    // Skip logging entirely in production mode
    if (!DEBUG_MODE) return null;
    
    const timestamp = new Date().toLocaleTimeString();
    const entry = {
      time: timestamp,
      fullTime: new Date().toISOString(),
      message: message,
      type: type,
      sessionId: this.sessionId,
      details: details,
    };

    // Add to pending buffer instead of immediately saving
    this.pendingLogs.unshift(entry);
    
    // Keep buffer size limited
    if (this.pendingLogs.length > this.maxEntries) {
      this.pendingLogs.splice(this.maxEntries);
    }

    // Schedule batched save (debounced)
    this._scheduleSave();

    // Console logging removed for performance - was doubling all logs

    return entry;
  }
  
  /**
   * Schedule a batched save to localStorage (debounced)
   */
  _scheduleSave() {
    if (this.saveTimeout) return; // Already scheduled
    
    this.saveTimeout = setTimeout(() => {
      this._flushToStorage();
      this.saveTimeout = null;
    }, this.saveInterval);
  }
  
  /**
   * Flush pending logs to localStorage
   */
  _flushToStorage() {
    if (this.pendingLogs.length === 0) return;
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.pendingLogs));
    } catch (e) {
      // Silently fail - don't spam console with warnings
    }
  }

  /**
   * Get all logs from storage (or pending buffer in DEBUG_MODE)
   */
  getAllLogs() {
    // In production mode or with pending logs, return from buffer
    if (!DEBUG_MODE) return [];
    if (this.pendingLogs.length > 0) return this.pendingLogs;
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Get logs for current session only
   */
  getSessionLogs() {
    const allLogs = this.getAllLogs();
    return allLogs.filter((log) => log.sessionId === this.sessionId);
  }

  /**
   * Get recent logs (for display)
   */
  getRecentLogs(limit = this.displayLimit) {
    const logs = this.getSessionLogs();
    return logs.slice(0, limit);
  }

  /**
   * Clear all logs completely (used when starting a new game)
   */
  clearAllLogs() {
    this.pendingLogs = []; // Clear buffer
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    try {
      localStorage.removeItem(this.storageKey);
    } catch (e) {
      // Silently fail
    }
  }

  /**
   * Clear all logs (alias for backwards compatibility)
   */
  clearLogs() {
    this.clearAllLogs();
  }

  /**
   * Clear only current session logs
   */
  clearSessionLogs() {
    this.pendingLogs = []; // Clear buffer
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    try {
      localStorage.removeItem(this.storageKey);
    } catch (e) {
      // Silently fail
    }
  }

  /**
   * Export logs as JSON
   */
  exportLogs() {
    const logs = this.getAllLogs();
    const dataStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ama-game-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Get session statistics
   */
  getSessionStats() {
    const logs = this.getSessionLogs();
    const stats = {
      totalEvents: logs.length,
      treasures: logs.filter((l) => l.type === "treasure").length,
      collisions: logs.filter((l) => l.type === "collision").length,
      levelUps: logs.filter(
        (l) => l.type === "level" && l.message.includes("LEVEL UP")
      ).length,
      sessionDuration: Math.floor((Date.now() - this.sessionId) / 1000),
    };
    return stats;
  }

  /**
   * Format log entry for display
   */
  formatLogEntry(entry, includeDetails = false) {
    let html = `<div class="log-entry log-${entry.type}">`;
    html += `<span class="log-time">[${entry.time}]</span> `;
    html += `<span class="log-message">${entry.message}</span>`;

    if (includeDetails && Object.keys(entry.details).length > 0) {
      html += `<div class="log-details">${JSON.stringify(entry.details)}</div>`;
    }

    html += `</div>`;
    return html;
  }
}

// Create global instance
const gameLogger = new GameActivityLogger();

// Helper functions for common log types
function logGameStart(mode, player1Name, player2Name, lives) {
  gameLogger.addLog(
    `🎮 GAME START - Mode: ${mode === 1 ? "Single Player" : "Two Player"}`,
    "info",
    { mode, player1Name, player2Name, lives }
  );
  gameLogger.addLog(`👤 ${player1Name} starts with ${lives} lives`, "info");
  if (mode === 2) {
    gameLogger.addLog(`👤 ${player2Name} starts with ${lives} lives`, "info");
  }
}

function logTreasure(
  playerName,
  treasureType,
  points,
  multiplier,
  oldScore,
  newScore
) {
  const pointsEarned = points * multiplier;
  gameLogger.addLog(
    `${playerName} collected ${treasureType} (${points} × ${multiplier}) = +${pointsEarned.toFixed(
      1
    )} pts. Total: ${oldScore.toFixed(1)} → ${newScore.toFixed(1)}`,
    "treasure",
    { playerName, treasureType, points, multiplier, oldScore, newScore }
  );
}

function logLevelCheck(maxScore, currentLevel, targetLevel) {
  gameLogger.addLog(
    `📊 Level Check: MaxScore=${maxScore.toFixed(
      1
    )}, Current Level=${currentLevel}, Target Level=${targetLevel} (${maxScore.toFixed(
      1
    )}/5 = ${(maxScore / 5).toFixed(2)})`,
    "level",
    { maxScore, currentLevel, targetLevel }
  );
}

function logLevelUp(oldLevel, newLevel, obstacleCount) {
  gameLogger.addLog(
    `🎊 LEVEL UP! ${oldLevel} → ${newLevel} (+10 seconds). Obstacles: ${obstacleCount}`,
    "level",
    { oldLevel, newLevel, obstacleCount }
  );
}

function logNoLevelUp(targetLevel) {
  gameLogger.addLog(
    `✓ No level up. Need ${(targetLevel * 5).toFixed(
      1
    )} pts for Level ${targetLevel}`,
    "level",
    { targetLevel }
  );
}

function logCollision(playerName, livesAfter, isGameOver = false) {
  gameLogger.addLog(
    `💥 ${playerName} HIT! Lives: 3 → ${livesAfter}${
      isGameOver ? " [GAME OVER]" : ""
    }`,
    "collision",
    { playerName, livesAfter, isGameOver }
  );
}

function logGameOver(reason) {
  gameLogger.addLog(`🚫 GAME OVER - ${reason}`, "collision", { reason });
}

function logPowerUp(playerName, powerUpType, duration) {
  gameLogger.addLog(
    `⚡ ${playerName} activated ${powerUpType} (${duration}s)`,
    "power",
    { playerName, powerUpType, duration }
  );
}

// Make available globally for browser use
if (typeof window !== "undefined") {
  window.GameActivityLogger = GameActivityLogger;
  window.gameLogger = gameLogger;
  window.logGameStart = logGameStart;
  window.logTreasure = logTreasure;
  window.logLevelCheck = logLevelCheck;
  window.logLevelUp = logLevelUp;
  window.logNoLevelUp = logNoLevelUp;
  window.logCollision = logCollision;
  window.logGameOver = logGameOver;
  window.logPowerUp = logPowerUp;
}

// Export for Node.js environments (if needed)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    GameActivityLogger,
    gameLogger,
    logGameStart,
    logTreasure,
    logLevelCheck,
    logLevelUp,
    logNoLevelUp,
    logCollision,
    logGameOver,
    logPowerUp,
  };
}
