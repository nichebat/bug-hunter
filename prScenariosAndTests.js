(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(require("./bugHunterCore.js"));
  } else {
    root.BugHunterScenariosAndTests = factory(root.BugHunterCore);
  }
})(typeof self !== "undefined" ? self : this, function (Core) {
  "use strict";

  const PR_SCENARIOS = [
    {
      id: "pr-116",
      title: "SQL query built via string concatenation",
      language: "Java",
      category: "sql",
      severity: "critical",
      lines: [
        "public User findByEmail(Connection conn, String email) throws SQLException {",
        "  String sql = \"SELECT id, role FROM users WHERE email = '\" + email + \"'\";",
        "  Statement stmt = conn.createStatement();",
        "  return mapUser(stmt.executeQuery(sql));",
        "}"
      ],
      bugLine: 1,
      explanation:
        "Concatenating raw user input into SQL allows SQL injection; use a PreparedStatement with bound parameters."
    },
    {
      id: "pr-117",
      title: "Parameterized user lookup in repository",
      language: "Java",
      category: "sql",
      severity: "medium",
      lines: [
        "public Optional<Account> findById(Connection conn, long id) throws SQLException {",
        "  String sql = \"SELECT id, active FROM accounts WHERE id = ?\";",
        "  try (PreparedStatement ps = conn.prepareStatement(sql)) {",
        "    ps.setLong(1, id);",
        "    ResultSet rs = ps.executeQuery();",
        "    return rs.next() ? Optional.of(mapAccount(rs)) : Optional.empty();",
        "  }",
        "}"
      ],
      bugLine: null,
      explanation:
        "Clean repository query: uses a parameterized PreparedStatement and closes resources safely."
    },
    {
      id: "pr-118",
      title: "Auth redirect loop on expired session token",
      language: "Go",
      category: "security",
      severity: "high",
      lines: [
        "func requireAuth(next http.HandlerFunc) http.HandlerFunc {",
        "  return func(w http.ResponseWriter, r *http.Request) {",
        "    if !validSession(r) {",
        "      http.Redirect(w, r, r.URL.Path, http.StatusFound)",
        "      return",
        "    }",
        "    next(w, r)",
        "  }",
        "}"
      ],
      bugLine: 3,
      explanation:
        "Redirecting unauthenticated requests back to r.URL.Path creates an infinite redirect loop."
    },
    {
      id: "pr-119",
      title: "Constant-time token comparison helper",
      language: "Go",
      category: "security",
      severity: "high",
      lines: [
        "func verifyToken(provided, expected string) bool {",
        "  a := []byte(provided)",
        "  b := []byte(expected)",
        "  return subtle.ConstantTimeCompare(a, b) == 1",
        "}"
      ],
      bugLine: null,
      explanation:
        "Clean security helper: uses constant-time comparison to avoid timing side channels."
    },
    {
      id: "pr-120",
      title: "Repeated regex compilation inside hot loop",
      language: "Go",
      category: "performance",
      severity: "medium",
      lines: [
        "func countMatches(lines []string) int {",
        "  matches := 0",
        "  for _, line := range lines {",
        "    re := regexp.MustCompile(`^[A-Z]{2,4}-[0-9]+$`)",
        "    if re.MatchString(line) {",
        "      matches++",
        "    }",
        "  }",
        "  return matches",
        "}"
      ],
      bugLine: 3,
      explanation:
        "Compiling the regular expression on every iteration wastes CPU; compile it once outside the loop."
    },
    {
      id: "pr-121",
      title: "Preallocated slice capacity for batch export",
      language: "Go",
      category: "performance",
      severity: "low",
      lines: [
        "func collectIds(items []Task) []string {",
        "  ids := make([]string, 0, len(items))",
        "  for _, item := range items {",
        "    ids = append(ids, item.ID)",
        "  }",
        "  return ids",
        "}"
      ],
      bugLine: null,
      explanation:
        "Clean performance practice: preallocates exact slice capacity to reduce repeated reallocations."
    },
    {
      id: "pr-122",
      title: "Mutating shared state object before async validation",
      language: "JavaScript",
      category: "state",
      severity: "high",
      lines: [
        "async function saveDraft(state, patch) {",
        "  state.status = 'saved';",
        "  const ok = await validateRemote(patch);",
        "  if (!ok) state.status = 'invalid';",
        "  return state;",
        "}"
      ],
      bugLine: 1,
      explanation:
        "Mutating state.status to 'saved' before validation completes exposes stale or premature state to callers."
    },
    {
      id: "pr-123",
      title: "Immutable filter update helper for shift queue",
      language: "JavaScript",
      category: "state",
      severity: "low",
      lines: [
        "function toggleCategoryFilter(selected, category) {",
        "  if (selected.includes(category)) {",
        "    return selected.filter((item) => item !== category);",
        "  }",
        "  return selected.concat(category);",
        "}"
      ],
      bugLine: null,
      explanation:
        "Clean state helper: returns a new array without mutating the previous filter array."
    },
    {
      id: "pr-124",
      title: "Scoped retention cleanup inside transaction",
      language: "SQL",
      category: "sql",
      severity: "critical",
      lines: [
        "BEGIN TRANSACTION;",
        "DELETE FROM build_logs",
        "WHERE created_at < NOW() - INTERVAL '30 days';",
        "COMMIT;"
      ],
      bugLine: null,
      explanation:
        "Clean SQL maintenance query: scoped with a retention predicate inside an explicit transaction."
    },
    {
      id: "pr-125",
      title: "Unbounded SELECT * without limit on audit table",
      language: "SQL",
      category: "sql",
      severity: "medium",
      lines: [
        "SELECT *",
        "FROM audit_events",
        "ORDER BY event_time DESC;",
        "-- Expected paginated batch for dashboard widget"
      ],
      bugLine: 0,
      explanation:
        "Fetching all columns and rows without a limit on a growing audit log risks memory and latency spikes."
    },
    {
      id: "pr-126",
      title: "StringBuilder formatting inside row builder",
      language: "Java",
      category: "performance",
      severity: "medium",
      lines: [
        "String formatRow(int row, int cols) {",
        "  StringBuilder sb = new StringBuilder(cols * 2);",
        "  for (int c = 0; c < cols; c++) {",
        "    sb.append(row).append(':').append(c).append(' ');",
        "  }",
        "  return sb.toString();",
        "}"
      ],
      bugLine: null,
      explanation:
        "Clean Java formatting: uses a pre-sized StringBuilder instead of repeated string concatenation."
    },
    {
      id: "pr-127",
      title: "Resetting active shift index without clearing selection",
      language: "JavaScript",
      category: "state",
      severity: "medium",
      lines: [
        "function startNewShift(state, nextDeck) {",
        "  return {",
        "    ...state,",
        "    deck: nextDeck,",
        "    currentIndex: 0",
        "  };",
        "}"
      ],
      bugLine: 4,
      explanation:
        "Starting a new shift must also reset score, streak, reviewedCount, selectedLine, and completed flags."
    },
    {
      id: "pr-128",
      title: "Hardcoded fallback secret key in config loader",
      language: "JavaScript",
      category: "security",
      severity: "critical",
      lines: [
        "function loadSigningKey(env) {",
        "  const key = env.JWT_SECRET || 'dev-secret-do-not-ship-12345';",
        "  if (!key) throw new Error('Missing JWT_SECRET');",
        "  return key;",
        "}"
      ],
      bugLine: 1,
      explanation:
        "Falling back to a hardcoded signing secret weakens token security if JWT_SECRET is omitted in production."
    },
    {
      id: "pr-129",
      title: "Explicit timeout configured on HTTP client",
      language: "Go",
      category: "performance",
      severity: "medium",
      lines: [
        "func newWorkerClient() *http.Client {",
        "  return &http.Client{",
        "    Timeout: 5 * time.Second,",
        "  }",
        "}"
      ],
      bugLine: null,
      explanation:
        "Clean Go client setup: sets an explicit request timeout so hung upstreams do not stall workers."
    },
    {
      id: "pr-130",
      title: "Single increment on accepted review outcome",
      language: "Java",
      category: "state",
      severity: "high",
      lines: [
        "public int recordOutcome(int currentCount, boolean accepted) {",
        "  if (accepted) {",
        "    currentCount += 1;",
        "  }",
        "  return currentCount;",
        "}"
      ],
      bugLine: null,
      explanation:
        "Clean pure increment: increments once when accepted and returns the updated count."
    }
  ];

  function createDeterministicRng(seed) {
    let s = (Number(seed) || 123456789) >>> 0;
    return function nextRandom() {
      s = (1664525 * s + 1013904223) >>> 0;
      return s / 0x100000000;
    };
  }

  function assert(condition, message) {
    if (!condition) {
      throw new Error("Assertion failed: " + message);
    }
  }

  function runAllTests(customPool) {
    const pool = Array.isArray(customPool) ? customPool : PR_SCENARIOS;
    const results = [];

    function runTest(name, fn) {
      fn();
      results.push({ name, passed: true });
    }

    runTest("All PR scenarios pass schema and bugLine validation", function () {
      assert(pool.length >= 10, "Expected at least 10 PR scenarios in pool");
      for (const pr of pool) {
        const check = Core.validatePullRequest(pr);
        assert(
          check.valid,
          "PR " + (pr && pr.id) + " failed validation: " + check.errors.join(", ")
        );
      }
      const badLinePr = {
        id: "pr-bad",
        title: "Out of bounds bugLine",
        language: "Go",
        category: "security",
        severity: "low",
        lines: ["line 0", "line 1"],
        bugLine: 5,
        explanation: "Invalid line index."
      };
      assert(
        !Core.validatePullRequest(badLinePr).valid,
        "Expected out-of-bounds bugLine to fail validation"
      );
    });

    runTest("Storage normalization and v0.2/v0.4 migration work cleanly", function () {
      const mem = Core.createMemoryStorage({
        [Core.STORAGE_KEY_V0_4]: JSON.stringify({
          bestScore: 420,
          bestAccuracy: 87,
          bestStreak: 6,
          shiftsCompleted: 3
        })
      });
      const loaded = Core.loadStats(mem);
      assert(loaded.migratedFrom === Core.STORAGE_KEY_V0_4, "Expected v0.4 migration");
      assert(loaded.stats.bestScore === 420, "Expected bestScore 420");
      assert(loaded.stats.bestAccuracy === 87, "Expected bestAccuracy 87");
      assert(loaded.stats.bestStreak === 6, "Expected bestStreak 6");
      assert(loaded.stats.shiftsCompleted === 3, "Expected shiftsCompleted 3");
      assert(loaded.stats.version === 5, "Expected version 5 after migration");

      const legacyV02 = Core.migrateStats({
        streakBest: 4,
        accuracyBest: 140,
        bestScore: -50
      });
      assert(legacyV02.bestStreak === 4, "Expected streakBest to map to bestStreak");
      assert(legacyV02.bestAccuracy === 100, "Expected accuracy clamped to 100");
      assert(legacyV02.bestScore === 0, "Expected negative score clamped to 0");
    });

    runTest("Accuracy, rank, and review evaluation math are accurate", function () {
      assert(Core.calculateAccuracy(0, 0) === 0, "0/0 accuracy should be 0");
      assert(Core.calculateAccuracy(3, 4) === 75, "3/4 accuracy should be 75");
      assert(Core.getCareerRank(0).rank === "Intern", "0 score should be Intern");
      assert(
        Core.getCareerRank(1700).rank === "Principal Eng",
        "1700 score should be Principal Eng"
      );

      const cleanPr = pool.find((p) => p.bugLine === null);
      const buggyPr = pool.find((p) => p.bugLine !== null);

      const goodClean = Core.evaluateReview(cleanPr, { action: "approve" });
      assert(goodClean.correct === true && goodClean.scoreDelta > 0, "Approving clean PR should reward");

      const badCleanFlag = Core.evaluateReview(cleanPr, {
        action: "flag_bug",
        selectedLine: 0
      });
      assert(
        badCleanFlag.correct === false && badCleanFlag.scoreDelta < 0,
        "Flagging clean PR should penalize"
      );

      const goodBugCatch = Core.evaluateReview(buggyPr, {
        action: "flag_bug",
        selectedLine: buggyPr.bugLine
      });
      assert(
        goodBugCatch.correct === true && goodBugCatch.scoreDelta > 0,
        "Catching exact bugLine should reward"
      );
    });

    runTest("Balanced deck preserves clean/buggy mix and supports replay", function () {
      const rng = createDeterministicRng(42);
      const deck = Core.buildShiftDeck(pool, { shiftLength: 10, buggyCount: 5 }, rng);
      assert(deck.length === 10, "Expected 10 PRs in shift deck");

      const buggyCount = deck.filter((pr) => pr.bugLine !== null).length;
      const cleanCount = deck.filter((pr) => pr.bugLine === null).length;
      assert(buggyCount === 5 && cleanCount === 5, "Expected 5 buggy and 5 clean PRs");

      const replayDeck = Core.buildShiftDeck(pool, { shiftLength: 10, buggyCount: 5 }, rng);
      assert(replayDeck.length === 10, "Replay deck should also have 10 PRs");
    });

    runTest("Shift state stays synchronized across 15 consecutive reviews", function () {
      const rng = createDeterministicRng(99);
      const deck = Core.buildShiftDeck(pool, { preset: "standard" }, rng);
      let state = Core.createShiftState(deck);

      for (let i = 0; i < deck.length; i++) {
        state = Core.openReviewModal(state);
        assert(state.modalOpen === true, "Modal should open on step " + i);
        assert(state.selectedLine === null, "Selection should reset on modal open");

        const pr = state.deck[state.currentIndex];
        if (pr.bugLine !== null) {
          state = Core.selectCodeLine(state, pr.bugLine);
          assert(state.selectedLine === pr.bugLine, "Expected selectedLine to match bugLine");
          state = Core.submitReviewDecision(state, "flag_bug");
        } else {
          state = Core.submitReviewDecision(state, "approve");
        }

        assert(state.modalOpen === false, "Modal should close after submission");
        assert(state.reviewedCount === i + 1, "reviewedCount should increment by 1");
      }

      assert(state.completed === true, "Shift should mark completed after 15 reviews");
      assert(state.reviewedCount === 15, "Expected 15 reviewed PRs");

      const mem = Core.createMemoryStorage();
      const { stats, summary } = Core.finalizeShift(Core.createDefaultStats(), state, 1);
      Core.saveStats(stats, mem);
      const reloaded = Core.loadStats(mem);

      assert(summary.accuracy === 100, "Expected 100% accuracy on perfect run");
      assert(reloaded.stats.shiftsCompleted === 1, "Expected 1 completed shift saved");
      assert(reloaded.stats.totalPrsReviewed === 15, "Expected 15 total PRs saved");
      assert(reloaded.stats.hintsUsed === 1, "Expected 1 hint used saved");
    });

    return {
      total: results.length,
      passed: results.length,
      failed: 0,
      results
    };
  }

  if (typeof require !== "undefined" && require.main === module) {
    const summary = runAllTests(PR_SCENARIOS);
    console.log(
      "Bug Hunter v0.5 Core Tests: " + summary.passed + "/" + summary.total + " passed"
    );
  }

  return {
    PR_SCENARIOS,
    createDeterministicRng,
    runAllTests
  };
});