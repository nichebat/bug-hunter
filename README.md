# Bug Hunter: Junior Dev Edition

A browser-based retro office simulation and code review game where you play as a junior software developer catching critical bugs in senior developers' pull requests before they reach production.

## Live Demo

Play the game directly in your browser via GitHub Pages:  
`https://nichebat.github.io/bug-hunter/`

## Overview

In **Bug Hunter**, pull requests continuously arrive at your workstation across multiple languages and frameworks, including JavaScript, Python, React, CSS, and SQL. Navigate the office, manage your movement speed with espresso boosts, inspect incoming diffs, and pinpoint the exact buggy line before approving or rejecting code.

## Features

- **2D Retro Office World:** Move around a pixel-art office environment, visit the breakroom coffee machine for a temporary speed boost, and respond to incoming pull request alerts at your workstation.
- **Interactive Code Review:** Inspect realistic pull requests and click the exact line containing the bug, accompanied by an explanation of why the defect would break production.
- **Career Progression & Scoring:** Earn points, build streak multipliers for consecutive accurate reviews, and advance in title from Intern to Staff Engineer.
- **Synthesized Retro Audio:** Built-in Web Audio API sound effects with a mute toggle in the top-right corner.
- **Zero Dependencies:** Packaged as a single self-contained HTML file with no external build tools or libraries required.

## Controls

- **Move:** `W`, `A`, `S`, `D` or `Arrow Keys` (on-screen D-pad available on touch devices)
- **Interact / Open Pull Request:** Walk up to your glowing workstation or breakroom coffee machine
- **Review Code:** Click the line of code containing the bug inside the pull request modal
- **Audio:** Click the mute button in the top-right HUD to toggle sound effects

## Running Locally

1. Clone the repository:
   ```bash
   git clone [https://github.com/nichebat/bug-hunter.git](https://github.com/nichebat/bug-hunter.git)