# Changelog

All notable changes to this project are documented in this file.

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

## v0.5 Roadmap

The v0.5 release should focus on reliability, accessibility, testing, and stronger long-term game progression without changing the core 15-review shift loop.

## Priority 1: Correctness and Testing

- [ ] Add an automated test runner for storage normalization and migration.
- [ ] Add tests for score, streak, accuracy, and rank calculations.
- [ ] Add tests for clean versus buggy PR review outcomes.
- [ ] Add tests for replay and queue shuffling.
- [ ] Validate every pull request has a valid line index or uses `bugLine: null`.
- [ ] Prevent the player or modal state from drifting out of sync after repeated reviews.

## Priority 2: Content and Variety

- [ ] Add more pull request scenarios across existing languages.
- [ ] Add at least one additional language, such as Java or Go.
- [ ] Balance point values and streak rewards across severity levels.
- [ ] Tag pull requests by category, such as security, performance, state management, and SQL.
- [ ] Randomize scenario selection while preserving an even mix of clean and buggy PRs.
- [ ] Add a difficulty selection for shorter or longer shifts.

## Priority 3: Accessibility and Mobile UX

- [ ] Add keyboard focus states and visible modal focus indicators.
- [ ] Support keyboard selection of code lines with Enter or Space.
- [ ] Trap focus inside open dialogs and restore focus when they close.
- [ ] Improve screen-reader labels for HUD values and review feedback.
- [ ] Do not rely only on color to communicate success, warnings, or build status.
- [ ] Respect reduced-motion preferences for blinking LEDs and screen animations.
- [ ] Test touch controls and modal layout on smaller mobile screens.

## Priority 4: Persistence

- [ ] Record additional aggregate statistics, such as total PRs reviewed and hints used.
- [ ] Add a migration and versioning test suite for local storage keys.
- [ ] Provide a clear in-game confirmation before resetting saved statistics.
- [ ] Handle unavailable or restricted local storage safely and visibly.

## Priority 5: Project Structure

- [ ] Separate pull request data from gameplay code for easier maintenance.
- [ ] Split large inline HTML sections into organized CSS and JavaScript modules.
- [ ] Add a development server and package scripts, if the project adopts a build process.
- [ ] Add a browser-based smoke test or CI workflow for static file validation.
- [ ] Keep external font loading optional so the interface remains usable offline.

## Success Criteria

v0.5 will be ready for release when:

- Shift scoring and progression are covered by automated tests.
- Stored statistics migrate correctly across supported versions.
- The review modal is operable by keyboard and usable by assistive technology.
- Mobile and desktop layouts have been manually smoke-tested.
- Pull request data has been validated against a consistent scenario format.
