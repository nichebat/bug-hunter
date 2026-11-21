(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.BugHunterCore = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const STORAGE_KEY_V0_5 = "bug_hunter_v0_5_stats_v1";
  const STORAGE_KEY_V0_4 = "bug_hunter_v0_4_stats_v1";
  const STORAGE_KEY_V0_2 = "bug_hunter_v0_2_stats_v1";

  const CAREER_RANKS = [
    { title: "Intern", minScore: 0 },
    { title: "Junior Dev", minScore: 150 },
    { title: "Software Dev", minScore: 350 },
    { title: "Mid Dev", minScore: 600 },
    { title: "Senior Dev", minScore: 900 },
    { title: "Staff Eng", minScore: 1250 },
    { title: "Principal Eng", minScore: 1650 }
  ];

  const SEVERITY_CONFIG = {
    low: { basePoints: 50, penaltyPoints: 25, streakBonus: 10 },
    medium: { basePoints: 80, penaltyPoints: 40, streakBonus: 15 },
    high: { basePoints: 120, penaltyPoints: 60, streakBonus: 25 },
    critical: { basePoints: 160, penaltyPoints: 80, streakBonus: 35 }
  };

  const VALID_CATEGORIES = Object.freeze([
    "security",
    "performance",
    "state",
    "sql",
    "clean"
  ]);

  const VALID_SEVERITIES = Object.freeze([
    "low",
    "medium",
    "high",
    "critical"
  ]);

  const SHIFT_PRESETS = Object.freeze({
    quick: { id: "quick", label: "Quick Shift", prCount: 10 },
    standard: { id: "standard", label: "Standard Shift", prCount: 15 },
    overtime: { id: "overtime", label: "Overtime Shift", prCount: 20 }
  });

  function createDefaultStats() {
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
    const num = Number(value);
    if (!Number.isFinite(num) || num < 0) {
      return fallback;
    }
    return num;
  }

  function toClampedPercent(value, fallback) {
    const num = Number(value);
    if (!Number.isFinite(num)) {
      return fallback;
    }
    if (num < 0) return 0;
    if (num > 100) return 100;
    return Math.round(num);
  }

  function normalizeStats(raw) {
    const defaults = createDefaultStats();
    if (!raw || typeof raw !== "object") {
      return defaults;
    }

    const bestScore = Math.round(toNonNegativeNumber(raw.bestScore, defaults.bestScore));
    const lastScore = Math.round(toNonNegativeNumber(raw.lastScore, defaults.lastScore));
    const bestStreak = Math.round(
      toNonNegativeNumber(
        raw.bestStreak !== undefined ? raw.bestStreak : raw.streakBest,
        defaults.bestStreak
      )
    );
    const shiftsCompleted = Math.round(
      toNonNegativeNumber(raw.shiftsCompleted, defaults.shiftsCompleted)
    );

    const rawAccuracy =
      raw.bestAccuracy !== undefined
        ? raw.bestAccuracy
        : raw.accuracyBest !== undefined
        ? raw.accuracyBest
        : defaults.bestAccuracy;
    const bestAccuracy = toClampedPercent(rawAccuracy, defaults.bestAccuracy);

    const lastAccuracy = toClampedPercent(
      raw.lastAccuracy !== undefined ? raw.lastAccuracy : bestAccuracy,
      defaults.lastAccuracy
    );

    const totalPrsReviewed = Math.round(
      toNonNegativeNumber(
        raw.totalPrsReviewed !== undefined
          ? raw.totalPrsReviewed
          : shiftsCompleted * 15,
        defaults.totalPrsReviewed
      )
    );

    const correctReviews = Math.min(
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

    const hintsUsed = Math.round(
      toNonNegativeNumber(raw.hintsUsed, defaults.hintsUsed)
    );

    const lastShiftLength = Math.max(
      1,
      Math.round(toNonNegativeNumber(raw.lastShiftLength, defaults.lastShiftLength))
    );

    return {
      version: 5,
      bestScore: Math.max(bestScore, lastScore),
      bestAccuracy: Math.max(bestAccuracy, lastAccuracy),
      lastScore,
      lastAccuracy,
      bestStreak,
      shiftsCompleted,
      totalPrsReviewed,
      correctReviews,
      hintsUsed,
      lastShiftLength
    };
  }

  function migrateStats(payload) {
    if (!payload || typeof payload !== "object") {
      return normalizeStats(null);
    }

    if (payload.stats && typeof payload.stats === "object") {
      return normalizeStats(payload.stats);
    }

    return normalizeStats(payload);
  }

  function createMemoryStorage(initialEntries) {
    const store = new Map();
    if (initialEntries && typeof initialEntries === "object") {
      for (const [k, v] of Object.entries(initialEntries)) {
        store.set(String(k), String(v));
      }
    }
    return {
      getItem(key) {
        return store.has(String(key)) ? store.get(String(key)) : null;
      },
      setItem(key, value) {
        store.set(String(key), String(value));
      },
      removeItem(key) {
        store.delete(String(key));
      }
    };
  }

  function getBrowserStorage(customStorage) {
    if (customStorage) {
      return { storage: customStorage, persistent: true };
    }
    try {
      if (typeof localStorage !== "undefined" && localStorage !== null) {
        const probeKey = "__bug_hunter_probe__";
        localStorage.setItem(probeKey, "1");
        localStorage.removeItem(probeKey);
        return { storage: localStorage, persistent: true };
      }
    } catch (_err) {
      // Fall through to non-persistent memory fallback
    }
    return { storage: createMemoryStorage(), persistent: false };
  }

  function loadStats(customStorage) {
    const { storage, persistent } = getBrowserStorage(customStorage);
    const keysInOrder = [STORAGE_KEY_V0_5, STORAGE_KEY_V0_4, STORAGE_KEY_V0_2];

    for (const key of keysInOrder) {
      try {
        const rawText = storage.getItem(key);
        if (!rawText) continue;
        const parsed = JSON.parse(rawText);
        const migrated = migrateStats(parsed);
        if (persistent && key !== STORAGE_KEY_V0_5) {
          storage.setItem(STORAGE_KEY_V0_5, JSON.stringify(migrated));
        }
        return {
          stats: migrated,
          persistent,
          migratedFrom: key === STORAGE_KEY_V0_5 ? null : key
        };
      } catch (_err) {
        // Ignore corrupt entry and try next fallback key
      }
    }

    const fresh = createDefaultStats();
    if (persistent) {
      try {
        storage.setItem(STORAGE_KEY_V0_5, JSON.stringify(fresh));
      } catch (_err) {
        // Ignore write error
      }
    }
    return { stats: fresh, persistent, migratedFrom: null };
  }

  function saveStats(stats, customStorage) {
    const normalized = normalizeStats(stats);
    const { storage, persistent } = getBrowserStorage(customStorage);
    if (!persistent) {
      return { stats: normalized, persistent: false, saved: false };
    }
    try {
      storage.setItem(STORAGE_KEY_V0_5, JSON.stringify(normalized));
      return { stats: normalized, persistent: true, saved: true };
    } catch (_err) {
      return { stats: normalized, persistent: false, saved: false };
    }
  }

  function resetStats(customStorage) {
    const fresh = createDefaultStats();
    const { storage, persistent } = getBrowserStorage(customStorage);
    if (!persistent) {
      return { stats: fresh, persistent: false, reset: false };
    }
    try {
      storage.removeItem(STORAGE_KEY_V0_5);
      storage.removeItem(STORAGE_KEY_V0_4);
      storage.removeItem(STORAGE_KEY_V0_2);
      storage.setItem(STORAGE_KEY_V0_5, JSON.stringify(fresh));
      return { stats: fresh, persistent: true, reset: true };
    } catch (_err) {
      return { stats: fresh, persistent: false, reset: false };
    }
  }

  function validatePullRequest(pr) {
    const errors = [];
    if (!pr || typeof pr !== "object") {
      return { valid: false, errors: ["PR must be a non-null object"] };
    }
    if (typeof pr.id !== "string" || pr.id.trim().length === 0) {
      errors.push("PR id must be a non-empty string");
    }
    if (typeof pr.title !== "string" || pr.title.trim().length === 0) {
      errors.push("PR title must be a non-empty string");
    }
    if (typeof pr.language !== "string" || pr.language.trim().length === 0) {
      errors.push("PR language must be a non-empty string");
    }
    if (!VALID_CATEGORIES.includes(pr.category)) {
      errors.push(
        "PR category must be one of: " + VALID_CATEGORIES.join(", ")
      );
    }
    if (!VALID_SEVERITIES.includes(pr.severity)) {
      errors.push(
        "PR severity must be one of: " + VALID_SEVERITIES.join(", ")
      );
    }
    if (!Array.isArray(pr.lines) || pr.lines.length === 0) {
      errors.push("PR lines must be a non-empty array");
    } else if (!pr.lines.every((line) => typeof line === "string")) {
      errors.push("Every entry in PR lines must be a string");
    }

    const lineCount = Array.isArray(pr.lines) ? pr.lines.length : 0;
    if (pr.bugLine !== null) {
      if (
        typeof pr.bugLine !== "number" ||
        !Number.isInteger(pr.bugLine) ||
        pr.bugLine < 0 ||
        pr.bugLine >= lineCount
      ) {
        errors.push(
          "PR bugLine must be null or an integer within [0, " +
            Math.max(0, lineCount - 1) +
            "]"
        );
      }
    }

    if (typeof pr.explanation !== "string" || pr.explanation.trim().length === 0) {
      errors.push("PR explanation must be a non-empty string");
    }

    return { valid: errors.length === 0, errors };
  }

  function calculateAccuracy(correctCount, totalCount) {
    const total = Math.max(0, Math.round(Number(totalCount) || 0));
    const correct = Math.max(0, Math.min(total, Math.round(Number(correctCount) || 0)));
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  }

  function getCareerRank(score) {
    const safeScore = Math.max(0, Math.round(Number(score) || 0));
    let current = CAREER_RANKS[0];
    let next = CAREER_RANKS[1] || null;

    for (let i = 0; i < CAREER_RANKS.length; i++) {
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

  function evaluateReview(pr, decision) {
    const check = validatePullRequest(pr);
    if (!check.valid) {
      throw new Error("Invalid PR passed to evaluateReview: " + check.errors.join("; "));
    }

    const sev = SEVERITY_CONFIG[pr.severity] || SEVERITY_CONFIG.medium;
    const isBuggyPr = pr.bugLine !== null;
    const action = decision && decision.action;
    const selectedLine =
      decision && decision.selectedLine !== undefined ? decision.selectedLine : null;

    let correct = false;
    let reason = "";

    if (!isBuggyPr) {
      if (action === "approve") {
        correct = true;
        reason = "Approved clean pull request.";
      } else {
        correct = false;
        reason = "False alarm: pull request had no bug.";
      }
    } else {
      if (action === "flag_bug" && selectedLine === pr.bugLine) {
        correct = true;
        reason = "Identified bug on line " + (pr.bugLine + 1) + ".";
      } else if (action === "flag_bug") {
        correct = false;
        reason =
          "Flagged wrong line; actual bug is on line " + (pr.bugLine + 1) + ".";
      } else {
        correct = false;
        reason =
          "Approved buggy pull request; bug was on line " + (pr.bugLine + 1) + ".";
      }
    }

    const scoreDelta = correct ? sev.basePoints : -sev.penaltyPoints;
    const streakBonus = correct ? sev.streakBonus : 0;

    return {
      correct,
      scoreDelta,
      streakBonus,
      reason,
      expectedBugLine: pr.bugLine
    };
  }

  function shuffleArray(items, rng) {
    const randomFn = typeof rng === "function" ? rng : Math.random;
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(randomFn() * (i + 1));
      const temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  function buildShiftDeck(pool, options, rng) {
    if (!Array.isArray(pool) || pool.length === 0) {
      throw new Error("PR pool must contain at least one pull request");
    }

    for (const pr of pool) {
      const res = validatePullRequest(pr);
      if (!res.valid) {
        throw new Error("Invalid PR in pool (" + (pr && pr.id) + "): " + res.errors.join("; "));
      }
    }

    const opts = options && typeof options === "object" ? options : {};
    const preset =
      opts.preset && SHIFT_PRESETS[opts.preset] ? SHIFT_PRESETS[opts.preset] : null;
    const shiftLength = Math.max(
      1,
      Math.round(
        Number(
          opts.shiftLength !== undefined
            ? opts.shiftLength
            : preset
            ? preset.prCount
            : 15
        ) || 15
      )
    );

    const buggyPool = shuffleArray(
      pool.filter((pr) => pr.bugLine !== null),
      rng
    );
    const cleanPool = shuffleArray(
      pool.filter((pr) => pr.bugLine === null),
      rng
    );

    const targetBuggy =
      opts.buggyCount !== undefined
        ? Math.max(0, Math.min(shiftLength, Math.round(Number(opts.buggyCount) || 0)))
        : Math.ceil(shiftLength / 2);
    const targetClean = Math.max(0, shiftLength - targetBuggy);

    const selected = [];

    function takeFrom(primary, secondary, count) {
      for (let i = 0; i < count; i++) {
        if (primary.length > 0) {
          selected.push(primary.shift());
        } else if (secondary.length > 0) {
          selected.push(secondary.shift());
        } else {
          const fallbackPool = shuffleArray(pool, rng);
          selected.push(fallbackPool[i % fallbackPool.length]);
        }
      }
    }

    takeFrom(buggyPool, cleanPool, targetBuggy);
    takeFrom(cleanPool, buggyPool, targetClean);

    return shuffleArray(selected, rng);
  }

  function createShiftState(deck) {
    if (!Array.isArray(deck) || deck.length === 0) {
      throw new Error("Shift deck must be a non-empty array");
    }
    return {
      deck: deck.slice(),
      currentIndex: 0,
      score: 0,
      streak: 0,
      bestStreak: 0,
      correctCount: 0,
      reviewedCount: 0,
      selectedLine: null,
      modalOpen: false,
      completed: false,
      lastOutcome: null
    };
  }

  function openReviewModal(state) {
    if (state.completed) {
      return Object.assign({}, state, { modalOpen: false, selectedLine: null });
    }
    return Object.assign({}, state, {
      modalOpen: true,
      selectedLine: null
    });
  }

  function closeReviewModal(state) {
    return Object.assign({}, state, {
      modalOpen: false,
      selectedLine: null
    });
  }

  function selectCodeLine(state, lineIndex) {
    const currentPr = state.deck[state.currentIndex];
    if (!currentPr) return state;
    if (
      typeof lineIndex !== "number" ||
      !Number.isInteger(lineIndex) ||
      lineIndex < 0 ||
      lineIndex >= currentPr.lines.length
    ) {
      return state;
    }
    return Object.assign({}, state, {
      selectedLine: lineIndex
    });
  }

  function submitReviewDecision(state, action) {
    if (state.completed || state.currentIndex >= state.deck.length) {
      return Object.assign({}, state, { completed: true, modalOpen: false });
    }

    const currentPr = state.deck[state.currentIndex];
    const outcome = evaluateReview(currentPr, {
      action,
      selectedLine: state.selectedLine
    });

    const nextStreak = outcome.correct ? state.streak + 1 : 0;
    const nextBestStreak = Math.max(state.bestStreak, nextStreak);
    const activeStreakMultiplier = outcome.correct ? nextStreak : 0;
    const earnedThisTurn = outcome.correct
      ? outcome.scoreDelta + outcome.streakBonus * activeStreakMultiplier
      : outcome.scoreDelta;

    const nextScore = Math.max(0, state.score + earnedThisTurn);
    const nextCorrect = state.correctCount + (outcome.correct ? 1 : 0);
    const nextReviewed = state.reviewedCount + 1;
    const nextIndex = state.currentIndex + 1;
    const isDone = nextIndex >= state.deck.length;

    return {
      deck: state.deck,
      currentIndex: isDone ? state.deck.length : nextIndex,
      score: nextScore,
      streak: nextStreak,
      bestStreak: nextBestStreak,
      correctCount: nextCorrect,
      reviewedCount: nextReviewed,
      selectedLine: null,
      modalOpen: false,
      completed: isDone,
      lastOutcome: Object.assign({}, outcome, {
        pointsApplied: earnedThisTurn,
        prId: currentPr.id,
        prTitle: currentPr.title,
        category: currentPr.category,
        explanation: currentPr.explanation
      })
    };
  }

  function finalizeShift(previousStats, shiftState, hintsUsedInShift) {
    const baseStats = normalizeStats(previousStats);
    const accuracy = calculateAccuracy(
      shiftState.correctCount,
      shiftState.reviewedCount
    );
    const hints = Math.max(0, Math.round(Number(hintsUsedInShift) || 0));

    const totalPrsReviewed = baseStats.totalPrsReviewed + shiftState.reviewedCount;
    const correctReviews = baseStats.correctReviews + shiftState.correctCount;
    const shiftsCompleted = baseStats.shiftsCompleted + 1;
    const bestScore = Math.max(baseStats.bestScore, shiftState.score);
    const bestAccuracy = Math.max(baseStats.bestAccuracy, accuracy);
    const bestStreak = Math.max(baseStats.bestStreak, shiftState.bestStreak);

    const updatedStats = {
      version: 5,
      bestScore,
      bestAccuracy,
      lastScore: shiftState.score,
      lastAccuracy: accuracy,
      bestStreak,
      shiftsCompleted,
      totalPrsReviewed,
      correctReviews,
      hintsUsed: baseStats.hintsUsed + hints,
      lastShiftLength: shiftState.deck.length
    };

    return {
      stats: updatedStats,
      summary: {
        score: shiftState.score,
        accuracy,
        correctCount: shiftState.correctCount,
        reviewedCount: shiftState.reviewedCount,
        bestStreak: shiftState.bestStreak,
        rankInfo: getCareerRank(shiftState.score),
        isNewBestScore: shiftState.score > baseStats.bestScore,
        isNewBestAccuracy: accuracy > baseStats.bestAccuracy
      }
    };
  }

  return {
    STORAGE_KEY_V0_5,
    STORAGE_KEY_V0_4,
    STORAGE_KEY_V0_2,
    CAREER_RANKS,
    SEVERITY_CONFIG,
    VALID_CATEGORIES,
    VALID_SEVERITIES,
    SHIFT_PRESETS,
    createDefaultStats,
    normalizeStats,
    migrateStats,
    createMemoryStorage,
    getBrowserStorage,
    loadStats,
    saveStats,
    resetStats,
    validatePullRequest,
    calculateAccuracy,
    getCareerRank,
    evaluateReview,
    shuffleArray,
    buildShiftDeck,
    createShiftState,
    openReviewModal,
    closeReviewModal,
    selectCodeLine,
    submitReviewDecision,
    finalizeShift
  };
});