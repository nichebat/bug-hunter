const BugHunterStorage = (() => {
  const STORAGE_KEY = 'bug_hunter_v0_4_stats_v1';
  const LEGACY_KEY = 'bug_hunter_v0_2_stats_v1';

  const defaultStats = {
    bestScore: 0,
    lastScore: 0,
    bestStreak: 0,
    bestAccuracy: 0,
    shiftsCompleted: 0
  };

  function normalize(parsed) {
    return {
      bestScore: Number.isFinite(parsed.bestScore) ? Math.max(0, parsed.bestScore) : 0,
      lastScore: Number.isFinite(parsed.lastScore) ? Math.max(0, parsed.lastScore) : 0,
      bestStreak: Number.isFinite(parsed.bestStreak) ? Math.max(0, parsed.bestStreak) : 0,
      bestAccuracy: Number.isFinite(parsed.bestAccuracy) ? Math.min(100, Math.max(0, parsed.bestAccuracy)) : 0,
      shiftsCompleted: Number.isFinite(parsed.shiftsCompleted) ? Math.max(0, parsed.shiftsCompleted) : 0
    };
  }

  function safeRead() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem(LEGACY_KEY);
      if (!raw) return { ...defaultStats };
      return normalize(JSON.parse(raw));
    } catch (_err) {
      return { ...defaultStats };
    }
  }

  function safeWrite(stats) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (_err) {
      // Ignore storage quota or privacy-mode errors so gameplay stays smooth
    }
  }

  return {
    getStats() {
      return safeRead();
    },
    recordShift(score, bestRunStreak, accuracyPercent = 0) {
      const current = safeRead();
      const safeScore = Math.max(0, score || 0);
      const safeStreak = Math.max(0, bestRunStreak || 0);
      const safeAcc = Math.min(100, Math.max(0, Math.round(accuracyPercent || 0)));

      const updated = {
        bestScore: Math.max(current.bestScore, safeScore),
        lastScore: safeScore,
        bestStreak: Math.max(current.bestStreak, safeStreak),
        bestAccuracy: Math.max(current.bestAccuracy, safeAcc),
        shiftsCompleted: current.shiftsCompleted + 1
      };
      safeWrite(updated);
      return updated;
    },
    clearStats() {
      safeWrite({ ...defaultStats });
      return { ...defaultStats };
    }
  };
})();