# Bug Hunter: Junior Dev Edition

Bug Hunter is a browser-based retro office game in which you review pull requests as a junior developer. Walk around the office, catch bugs before they reach production, collect espresso boosts, and complete a shift of 15 reviews.

## Play

The live GitHub Pages version is available at:

https://nichebat.github.io/bug-hunter/

## Gameplay

Each shift contains 15 pull requests in JavaScript, Python, SQL, React, CSS, and TypeScript. Some pull requests contain one bug, while others are clean.

- Walk to the glowing workstation to open the current pull request.
- Click the buggy line in the code diff.
- Click **Approve PR (NO BUGS)** when a pull request is clean.
- Use **Show Hint** if you need help.
- Walk to the espresso machine for a temporary movement-speed boost.

Accurate reviews earn points and increase your streak. Consecutive reviews add a streak bonus, while incorrect line selections or approvals reduce the score and reset the streak.

Career ranks progress from Intern to:

1. Junior Dev
2. Software Dev
3. Mid Dev
4. Senior Dev
5. Staff Eng
6. Principal Eng

The final shift report shows your rank, score, first-try accuracy, hint count, and saved all-time records.

## Controls

| Action | Controls |
| --- | --- |
| Move | `W`, `A`, `S`, `D` or the arrow keys |
| Move on touch devices | On-screen D-pad |
| Interact | Walk near a workstation or espresso machine and press `Space` or `Enter` |
| Open a workstation or machine | Click it when close enough |
| Review code | Click a line in the pull request diff |
| Toggle audio | Click **SFX: ON/OFF** |

## Features

- Pixel-art office environment and senior developer NPCs
- Fifteen code-review scenarios
- Clean and buggy pull requests
- Seven career ranks
- Score, streak, and first-try accuracy tracking
- Espresso movement boost
- CI/CD server status indicators
- Mobile touch controls
- Synthesized Web Audio effects with mute support
- Saved best score and accuracy using browser local storage
- Optional shuffling when replaying a shift

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

- `index.html` - Page layout, styles, game world, pull request data, and game logic
- `storage.js` - Local storage access and normalized all-time statistics
- `README.md` - Project documentation
- `CHANGELOG.md` - Release history and the v0.5 roadmap
- `LICENSE` - License information

## Dependencies

The game itself uses plain HTML, CSS, and JavaScript and does not require npm packages or a build step.

`index.html` loads the Press Start 2P and JetBrains Mono fonts from Google Fonts. Internet access is needed for those fonts, but the game can still load with browser fallbacks.
