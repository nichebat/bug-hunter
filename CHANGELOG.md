# Changelog

All notable changes to this project are documented in this file.

## [0.5.0] - 2026-11-21

### Added

- Added three shift presets: 10-PR Quick, 15-PR Standard, and 20-PR Overtime.
- Added 15 new pull request scenarios covering Java, Go, JavaScript, and SQL.
- Added pull request categories for security, performance, state management, SQL, and clean code.
- Added low, medium, high, and critical severity scoring:
  - Low: 50 base points
  - Medium: 80 base points
  - High: 120 base points
  - Critical: 160 base points
- Added streak multipliers based on severity-specific streak bonuses.
- Added an aggregate career, accuracy, hint, and review-statistics display.
- Added total pull requests reviewed and total correct reviews to persistent statistics.
- Added v0.5 local storage migration and fallback support.
- Added visible storage status for migrated and unavailable storage.
- Added confirmation and cancellation controls for resetting saved statistics.
- Added keyboard selection of code lines with `Enter` or `Space`.
- Added `Escape` and click-outside handling for the review modal.
- Added modal focus restoration and live status announcements.
- Added a reduced-motion CSS mode.
- Added built-in core tests covering schema validation, storage migration, scoring, ranks, deck balancing, and 15-review state synchronization.
- Added separate `bugHunterCore.js` and `prScenariosAndTests.js` modules.

### Changed

- Reworked the review flow around modular core state:
  - Pull requests can be approved as clean or flagged on a selected bug line.
  - Incorrect decisions apply severity-based penalties.
  - Shift state tracks score, streak, reviewed count, correct count, and completion consistently.
- Updated career ranks to be based on cumulative score thresholds:
  - Intern: 0
  - Junior Dev: 150
  - Software Dev: 350
  - Mid Dev: 600
  - Senior Dev: 900
  - Staff Eng: 1,250
  - Principal Eng: 1,650
- Updated the shift deck builder to balance clean and buggy pull requests.
- Updated replay behavior to rebuild a shuffled balanced deck for the selected preset.
- Updated local storage data to use `bug_hunter_v0_5_stats_v1`.
- Updated v0.4 and v0.2 data migration to the v0.5 normalized statistics format.
- Updated the interface to expose shift length, aggregate career metadata, and storage notices.
- Updated scenario data to include category and severity metadata.

### Fixed

- Prevented invalid pull requests from entering the active scenario pool.
- Added bounds checking for selected code lines and `bugLine` values.
- Prevented review submission after a shift is complete.
- Reset modal selection and selection-dependent controls when opening or closing reviews.
- Added safe handling for blocked or unavailable browser local storage.
- Added in-memory storage fallback when persistent storage cannot be used.

## [0.4.0] - 2026-11-21

### Added

- Added senior developer NPC desks for Marcus, Elena, and Priya.
- Added NPC names, shirt colors, speech bubbles, and randomized office chatter.
- Added a CI/CD server rack with animated status LEDs and build-health feedback.
- Added a seven-tier career ladder:
  - Intern
  - Junior Dev
  - Software Dev
  - Mid Dev
  - Senior Dev
  - Staff Eng
  - Principal Eng
- Added first-try accuracy tracking for completed shifts.
- Added all-time best accuracy to the local storage statistics.
- Added best accuracy and saved shift information to the shift summary.
- Added collision handling for the new server rack.
- Added canvas and NPC click interactions.

### Changed

- Expanded the score and rank logic to support all 15 pull requests.
- Updated the shift summary to display the Principal Engineer rank.
- Updated the local storage key to `bug_hunter_v0_4_stats_v1`.
- Migrated legacy v0.2 statistics through the storage compatibility logic.
- Updated shift recording to save accuracy alongside score and streak statistics.
- Updated the main interface copy to describe the 15-PR shift and seven career ranks.

### Fixed

- Improved NPC and server-rack movement boundaries.
- Prevented the player from walking through NPC desks or the server rack.

## [0.3.0] - 2026-11-21

### Added

- Expanded the pull request dataset from 12 to 15 scenarios.
- Added PRs 113-115 covering TypeScript, JavaScript, and CSS:
  - An unvalidated TypeScript payload
  - Unsafe use of `innerHTML`
  - Sticky table header behavior with `overflow: hidden`
- Added a persistent all-time best score to the HUD.
- Added an all-time best score to the shift summary.
- Added a reset-stats control for clearing locally saved records.

### Changed

- Updated replay to use a shuffled copy of all 15 pull requests.
- Updated the v0.3 interface copy to describe 15 pull requests.
- Updated saved statistics to include best streak and completed shifts.

## [0.2.0] - 2026-11-20

### Added

- Added clean pull requests that require approval instead of bug selection.
- Added severity levels:
  - Minor
  - Major
  - Production outage
  - Clean
- Added severity-specific point values:
  - Minor: 100 points
  - Major: 150 points
  - Production outage: 250 points
- Added streak bonuses of 25 points per consecutive successful review after the first.
- Added an end-of-shift summary screen.
- Added first-try accuracy calculation and hints-used reporting.
- Added replay support with optional queue shuffling.
- Added a persistent `storage.js` module using browser `localStorage`.
- Added saved best score, best streak, and completed-shift statistics.
- Expanded the pull request dataset to 12 scenarios, including two clean PRs.
- Added approve and next-review controls.

### Changed

- Changed the HUD from a caught-bug counter to a reviewed-PR counter.
- Changed the shift workflow to support both buggy and clean reviews.
- Updated promotion logic based on the number of reviewed pull requests.
- Updated feedback to distinguish valid clean PRs, incorrect approvals, and incorrect line selections.

### Fixed

- Added penalties and streak resets for false alarms and incorrect PR approvals.
- Prevented users from receiving points for reviewed lines after a PR has already been solved.

## [0.1.0] - 2026-11-20

### Added

- Rebuilt the game as a retro 2D office experience using a canvas.
- Added keyboard movement with `W`, `A`, `S`, `D`, and arrow keys.
- Added touch movement controls.
- Added a glowing player workstation and espresso machine.
- Added a 15-second espresso movement boost.
- Added synthesized Web Audio sound effects and a mute control.
- Added ten pull request code-review scenarios.
- Added language labels for JavaScript, Python, React, SQL, and CSS.
- Added per-pull-request hint text.
- Added a hint button that reveals a clue and tracks hint usage.
- Added an office interaction prompt for keyboard and mouse users.
- Added score, streak, rank, and review-count HUD cards.
- Added character and desk rendering for the retro office environment.

### Changed

- Removed the previous sprint/speedrun countdown.
- Replaced the timed shift with a relaxed, task-completion-based workflow.
- Updated the interface copy to explain that hints can be used without a time limit.
- Simplified coffee behavior to a movement buff instead of awarding a separate action score.

### Removed

- Removed the sprint timer and timer-end failure behavior.
- Removed timed score pressure from the core gameplay loop.
