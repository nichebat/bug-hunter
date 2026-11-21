# Bug Hunter: Junior Dev Edition

Bug Hunter is a browser-based retro office game in which you review pull requests as a junior developer. Walk around the office, catch bugs before they reach production, collect espresso boosts, and complete a quick, standard, or overtime shift.

## Play

The live GitHub Pages version is available at:

https://nichebat.github.io/bug-hunter/

## Gameplay

Choose one of three shift lengths:

- **Quick:** 10 pull requests
- **Standard:** 15 pull requests
- **Overtime:** 20 pull requests

The 15-scenario pool covers Java, Go, JavaScript, and SQL, with security, performance, state-management, SQL, and clean-code categories. Each pull request has a severity level and exactly one bug line or is marked clean.

- Walk to the glowing workstation to open the current pull request.
- Select a code line in the diff.
- Click **Flag Selected Line** to report a bug.
- Click **Approve Clean** when a pull request is clean.
- Use **Show Hint** if you need help.
- Walk to the espresso machine for a temporary movement-speed boost.

Accurate reviews earn severity-based points and streak bonuses. Incorrect line selections, false alarms, and approvals of buggy PRs apply penalties and reset the streak.

Review correctness and shift scoring are also used by the built-in v0.5 core test suite.

Career ranks progress from Intern to:

1. Junior Dev
2. Software Dev
3. Mid Dev
4. Senior Dev
5. Staff Eng
6. Principal Eng

The completed-shift state includes rank, score, review accuracy, hint count, streak, and saved all-time records.

## Controls

| Action | Controls |
| --- | --- |
| Move | `W`, `A`, `S`, `D` or the arrow keys |
| Interact | Walk near a workstation or espresso machine and press `E`, `Space`, or `Enter` |
| Open a workstation or machine | Click it when close enough |
| Review code | Click a line in the pull request diff |
| Select a code line | Click or focus it and press `Enter` or `Space` |
| Close the review modal | `Esc`, Close button, or click outside the modal |
| Toggle audio | Click **SFX: ON/OFF** |

## Features

- Pixel-art office environment and senior developer NPCs
- Three configurable shift lengths
- Fifteen code-review scenarios across Java, Go, JavaScript, and SQL
- Security, performance, state-management, SQL, and clean-code categories
- Clean and buggy pull requests
- Seven career ranks
- Score, streak, review accuracy, and aggregate career tracking
- Espresso movement boost
- CI/CD server status indicators
- Modular core, scenario, and storage modules
- Keyboard-operable code-line selection and modal controls
- Live status and storage announcements
- Reduced-motion support
- Synthesized Web Audio effects with mute support
- Persistent best score, accuracy, streak, completed shifts, and aggregate review totals
- Automatic v0.2/v0.4-to-v0.5 local storage migration
- Reset controls that require confirmation
- Optional replay with shuffled shift decks

## Running Locally

Clone the repository and open `index.html` in a browser:

```bash
git clone https://github.com/nichebat/bug-hunter.git
cd bug-hunter
```

You can open `index.html` directly, or serve the folder with a small local static server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Project Structure

- `index.html` - Page layout, styles, game world, UI wiring, and canvas rendering
- `bugHunterCore.js` - Shift decks, scoring, ranks, validation, and pure core logic
- `prScenariosAndTests.js` - Pull request scenarios and five built-in core test groups
- `storage.js` - Local storage migration, persistence, and aggregate statistics
- `README.md` - Project documentation
- `CHANGELOG.md` - Release history
- `LICENSE` - License information

## Core Tests

The v0.5 core test suite is available from Node.js:

```bash
node prScenariosAndTests.js
```

It validates scenario schemas, v0.2/v0.4 migrations, scoring and ranks, shift deck balancing, and synchronized multi-review shift state.

## Dependencies

The game uses plain HTML, CSS, and JavaScript and does not require npm packages or a build step. It uses system monospace font fallbacks and makes no third-party font or JavaScript requests.
