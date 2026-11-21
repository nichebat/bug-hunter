(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    var coreModule = null;
    try {
      coreModule = require("./bugHunterCore.js");
    } catch (_err) {
      coreModule = null;
    }
    module.exports = factory(coreModule);
  } else {
    root.BugHunterStorage = factory(root.BugHunterCore || null);
  }
})(typeof self !== "undefined" ? self : this, function (Core) {
  "use strict";

  var STORAGE_KEY_V0_5 = "bug_hunter_v0_5_stats_v1";
  var STORAGE_KEY_V0_4 = "bug_hunter_v0_4_stats_v1";
  var STORAGE_KEY_V0_2 = "bug_hunter_v0_2_stats_v1";

  var CAREER_RANKS = [
    { title: "Intern", minScore: 0 },
    { title: "Junior Dev", minScore: 150 },
    { title: "Software Dev", minScore: 350 },
    { title: "Mid Dev", minScore: 600 },
    { title: "Senior Dev", minScore: 900 },
    { title: "Staff Eng", minScore: 1250 },
    { title: "Principal Eng", minScore: 1650 }
  ];

  function createDefaultStats() {
    if (Core && typeof Core.createDefaultStats === "function") {
      return Core.createDefaultStats();
    }
    return {
      version: 5,
      bestScore: 0,
      bestAccuracy: 0,
      lastScore: 0,
      lastAccuracy: 0,
      bestStreak: 0,
      shiftsCompleted: 0,
      totalPrsReviewed: 0,
      correctReviews: 0,
      hintsUsed: 0,
      lastShiftLength: 15
    };
  }

  function toNonNegativeNumber(value, fallback) {
    var num = Number(value);
    if (!Number.isFinite(num) || num < 0) {
      return fallback;
    }
    return num;
  }

  function toClampedPercent(value, fallback) {
    var num = Number(value);
    if (!Number.isFinite(num)) {
      return fallback;
    }
    if (num < 0) return 0;
    if (num > 100) return 100;
    return Math.round(num);
  }

  function normalizeStats(raw) {
    if (Core && typeof Core.normalizeStats === "function") {
      return Core.normalizeStats(raw);
    }

    var defaults = createDefaultStats();
    if (!raw || typeof raw !== "object") {
      return defaults;
    }

    var bestScore = Math.round(toNonNegativeNumber(raw.bestScore, defaults.bestScore));
    var lastScore = Math.round(toNonNegativeNumber(raw.lastScore, defaults.lastScore));
    var bestStreak = Math.round(
      toNonNegativeNumber(
        raw.bestStreak !== undefined ? raw.bestStreak : raw.streakBest,
        defaults.bestStreak
      )
    );
    var shiftsCompleted = Math.round(
      toNonNegativeNumber(raw.shiftsCompleted, defaults.shiftsCompleted)
    );

    var rawAccuracy =
      raw.bestAccuracy !== undefined
        ? raw.bestAccuracy
        : raw.accuracyBest !== undefined
        ? raw.accuracyBest
        : defaults.bestAccuracy;
    var bestAccuracy = toClampedPercent(rawAccuracy, defaults.bestAccuracy);

    var lastAccuracy = toClampedPercent(
      raw.lastAccuracy !== undefined ? raw.lastAccuracy : bestAccuracy,
      defaults.lastAccuracy
    );

    var totalPrsReviewed = Math.round(
      toNonNegativeNumber(
        raw.totalPrsReviewed !== undefined
          ? raw.totalPrsReviewed
          : shiftsCompleted * 15,
        defaults.totalPrsReviewed
      )
    );

    var correctReviews = Math.min(
      totalPrsReviewed,
      Math.round(
        toNonNegativeNumber(
          raw.correctReviews !== undefined
            ? raw.correctReviews
            : Math.round((lastAccuracy / 100) * totalPrsReviewed),
          defaults.correctReviews
        )
      )
    );

    var hintsUsed = Math.round(
      toNonNegativeNumber(raw.hintsUsed, defaults.hintsUsed)
    );

    var lastShiftLength = Math.max(
      1,
      Math.round(toNonNegativeNumber(raw.lastShiftLength, defaults.lastShiftLength))
    );

    return {
      version: 5,
      bestScore: Math.max(bestScore, lastScore),
      bestAccuracy: Math.max(bestAccuracy, lastAccuracy),
      lastScore: lastScore,
      lastAccuracy: lastAccuracy,
      bestStreak: bestStreak,
      shiftsCompleted: shiftsCompleted,
      totalPrsReviewed: totalPrsReviewed,
      correctReviews: correctReviews,
      hintsUsed: hintsUsed,
      lastShiftLength: lastShiftLength
    };
  }

  function migrateStats(payload) {
    if (Core && typeof Core.migrateStats === "function") {
      return Core.migrateStats(payload);
    }
    if (!payload || typeof payload !== "object") {
      return normalizeStats(null);
    }
    if (payload.stats && typeof payload.stats === "object") {
      return normalizeStats(payload.stats);
    }
    return normalizeStats(payload);
  }

  function createMemoryStorage(initialEntries) {
    var map = new Map();
    if (initialEntries && typeof initialEntries === "object") {
      Object.keys(initialEntries).forEach(function (key) {
        map.set(String(key), String(initialEntries[key]));
      });
    }
    return {
      getItem: function (key) {
        return map.has(String(key)) ? map.get(String(key)) : null;
      },
      setItem: function (key, value) {
        map.set(String(key), String(value));
      },
      removeItem: function (key) {
        map.delete(String(key));
      }
    };
  }

  var memoryFallback = createMemoryStorage();
  var currentStats = createDefaultStats();
  var isPersistent = true;
  var lastMigratedFrom = null;

  function resolveStorageBackend(customStorage) {
    if (customStorage) {
      return { storage: customStorage, persistent: true };
    }
    try {
      if (typeof localStorage !== "undefined" && localStorage !== null) {
        var probeKey = "__bug_hunter_storage_probe__";
        localStorage.setItem(probeKey, "ok");
        localStorage.removeItem(probeKey);
        return { storage: localStorage, persistent: true };
      }
    } catch (_err) {
      // Fall through to memory storage when localStorage is blocked or unavailable
    }
    return { storage: memoryFallback, persistent: false };
  }

  function calculateAccuracy(correctCount, totalCount) {
    if (Core && typeof Core.calculateAccuracy === "function") {
      return Core.calculateAccuracy(correctCount, totalCount);
    }
    var total = Math.max(0, Math.round(Number(totalCount) || 0));
    var correct = Math.max(0, Math.min(total, Math.round(Number(correctCount) || 0)));
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  }

  function getCareerRank(score) {
    if (Core && typeof Core.getCareerRank === "function") {
      return Core.getCareerRank(score);
    }
    var safeScore = Math.max(0, Math.round(Number(score) || 0));
    var current = CAREER_RANKS[0];
    var next = CAREER_RANKS[1] || null;
    for (var i = 0; i < CAREER_RANKS.length; i++) {
      if (safeScore >= CAREER_RANKS[i].minScore) {
        current = CAREER_RANKS[i];
        next = CAREER_RANKS[i + 1] || null;
      }
    }
    return {
      rank: current.title,
      currentMinScore: current.minScore,
      nextRank: next ? next.title : null,
      nextRankScore: next ? next.minScore : null
    };
  }

  function init(customStorage) {
    var backend = resolveStorageBackend(customStorage);
    var storage = backend.storage;
    isPersistent = backend.persistent;
    lastMigratedFrom = null;

    var keys = [STORAGE_KEY_V0_5, STORAGE_KEY_V0_4, STORAGE_KEY_V0_2];
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      try {
        var rawText = storage.getItem(key);
        if (!rawText) continue;
        var parsed = JSON.parse(rawText);
        var migrated = migrateStats(parsed);
        currentStats = migrated;
        lastMigratedFrom = key === STORAGE_KEY_V0_5 ? null : key;
        if (isPersistent && key !== STORAGE_KEY_V0_5) {
          storage.setItem(STORAGE_KEY_V0_5, JSON.stringify(migrated));
        }
        return {
          stats: getStats(),
          persistent: isPersistent,
          migratedFrom: lastMigratedFrom
        };
      } catch (_err) {
        // Skip unreadable or malformed entries and continue checking fallback keys
      }
    }

    currentStats = createDefaultStats();
    if (isPersistent) {
      try {
        storage.setItem(STORAGE_KEY_V0_5, JSON.stringify(currentStats));
      } catch (_err) {
        isPersistent = false;
      }
    }

    return {
      stats: getStats(),
      persistent: isPersistent,
      migratedFrom: null
    };
  }

  function getStats() {
    return Object.assign({}, currentStats);
  }

  function getMigratedFrom() {
    return lastMigratedFrom;
  }

  function isStorageAvailable() {
    return isPersistent;
  }

  function saveStats(nextStats, customStorage) {
    var backend = resolveStorageBackend(customStorage);
    var normalized = normalizeStats(nextStats);
    currentStats = normalized;
    isPersistent = backend.persistent;

    if (!isPersistent) {
      return {
        stats: getStats(),
        persistent: false,
        saved: false
      };
    }

    try {
      backend.storage.setItem(STORAGE_KEY_V0_5, JSON.stringify(normalized));
      return {
        stats: getStats(),
        persistent: true,
        saved: true
      };
    } catch (_err) {
      isPersistent = false;
      return {
        stats: getStats(),
        persistent: false,
        saved: false
      };
    }
  }

  function recordCompletedShift(shiftState, hintsUsedInShift, customStorage) {
    var safeShift = shiftState && typeof shiftState === "object" ? shiftState : {};
    var hints = Math.max(0, Math.round(Number(hintsUsedInShift) || 0));

    if (Core && typeof Core.finalizeShift === "function") {
      var finalized = Core.finalizeShift(currentStats, safeShift, hints);
      var savedFromCore = saveStats(finalized.stats, customStorage);
      return {
        stats: savedFromCore.stats,
        summary: finalized.summary,
        persistent: savedFromCore.persistent,
        saved: savedFromCore.saved
      };
    }

    var score = Math.max(0, Math.round(Number(safeShift.score) || 0));
    var reviewedCount = Math.max(0, Math.round(Number(safeShift.reviewedCount) || 0));
    var correctCount = Math.max(
      0,
      Math.min(reviewedCount, Math.round(Number(safeShift.correctCount) || 0))
    );
    var shiftBestStreak = Math.max(0, Math.round(Number(safeShift.bestStreak) || 0));
    var deckLength = Array.isArray(safeShift.deck)
      ? safeShift.deck.length
      : Math.max(1, Math.round(Number(safeShift.shiftLength) || currentStats.lastShiftLength || 15));

    var accuracy = calculateAccuracy(correctCount, reviewedCount);
    var prevBestScore = currentStats.bestScore;
    var prevBestAccuracy = currentStats.bestAccuracy;

    var updated = normalizeStats({
      version: 5,
      bestScore: Math.max(currentStats.bestScore, score),
      bestAccuracy: Math.max(currentStats.bestAccuracy, accuracy),
      lastScore: score,
      lastAccuracy: accuracy,
      bestStreak: Math.max(currentStats.bestStreak, shiftBestStreak),
      shiftsCompleted: currentStats.shiftsCompleted + 1,
      totalPrsReviewed: currentStats.totalPrsReviewed + reviewedCount,
      correctReviews: currentStats.correctReviews + correctCount,
      hintsUsed: currentStats.hintsUsed + hints,
      lastShiftLength: deckLength
    });

    var saved = saveStats(updated, customStorage);

    return {
      stats: saved.stats,
      summary: {
        score: score,
        accuracy: accuracy,
        correctCount: correctCount,
        reviewedCount: reviewedCount,
        bestStreak: shiftBestStreak,
        rankInfo: getCareerRank(score),
        isNewBestScore: score > prevBestScore,
        isNewBestAccuracy: accuracy > prevBestAccuracy
      },
      persistent: saved.persistent,
      saved: saved.saved
    };
  }

  function clearSavedStats(customStorage) {
    var backend = resolveStorageBackend(customStorage);
    var fresh = createDefaultStats();
    currentStats = fresh;
    isPersistent = backend.persistent;
    lastMigratedFrom = null;

    if (!isPersistent) {
      return {
        stats: getStats(),
        persistent: false,
        reset: false
      };
    }

    try {
      backend.storage.removeItem(STORAGE_KEY_V0_5);
      backend.storage.removeItem(STORAGE_KEY_V0_4);
      backend.storage.removeItem(STORAGE_KEY_V0_2);
      backend.storage.setItem(STORAGE_KEY_V0_5, JSON.stringify(fresh));
      return {
        stats: getStats(),
        persistent: true,
        reset: true
      };
    } catch (_err) {
      isPersistent = false;
      return {
        stats: getStats(),
        persistent: false,
        reset: false
      };
    }
  }

  init();

  return {
    STORAGE_KEY: STORAGE_KEY_V0_5,
    STORAGE_KEY_V0_5: STORAGE_KEY_V0_5,
    STORAGE_KEY_V0_4: STORAGE_KEY_V0_4,
    STORAGE_KEY_V0_2: STORAGE_KEY_V0_2,
    init: init,
    getStats: getStats,
    getMigratedFrom: getMigratedFrom,
    saveStats: saveStats,
    isStorageAvailable: isStorageAvailable,
    recordCompletedShift: recordCompletedShift,
    clearSavedStats: clearSavedStats
  };
});