const BugHunterStorage = (() => {
  const STORAGE_KEY = 'bug_hunter_v0_2_stats_v1';

  const defaultStats = {
    bestScore: 0,
    bestStreak: 0,
    shiftsCompleted: 0
  };

  function safeRead() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...defaultStats };
      const parsed = JSON.parse(raw);
      return {
        bestScore: Number.isFinite(parsed.bestScore) ? Math.max(0, parsed.bestScore) : 0,
        bestStreak: Number.isFinite(parsed.bestStreak) ? Math.max(0, parsed.bestStreak) : 0,
        shiftsCompleted: Number.isFinite(parsed.shiftsCompleted) ? Math.max(0, parsed.shiftsCompleted) : 0
      };
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
    recordShift(score, bestRunStreak) {
      const current = safeRead();
      const updated = {
        bestScore: Math.max(current.bestScore, Math.max(0, score || 0)),
        bestStreak: Math.max(current.bestStreak, Math.max(0, bestRunStreak || 0)),
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