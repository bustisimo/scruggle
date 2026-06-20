# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Running & Testing the Web MVP
Since the Web Native prototype is a static web application built with ES Modules, you can run and test it by serving it with any local static web server to prevent CORS issues with modules:
* **Python**: `python3 -m http.server 8000`
* **Node.js (serve)**: `npx serve`
* **Live Server**: Use any modern IDE local development server extension.

### Debugging & Testing
* **Logs & Errors**: Open the browser's developer tools (F12) to inspect the console logs, inspect the state in `localStorage`, and check for runtime errors.
* **State Reset**: Clear saved progress in the browser console using `localStorage.removeItem('scruggle_save_v2')` or `localStorage.clear()`.

---

## High-Level Code Architecture

The codebase is a Web Native single-page application modularized into ES6 modules (`type="module"`), requiring no bundler or build steps.

### Entrypoint & Stylesheet
* **`index.html`**: Contains the semantic HTML structure, start screen overlay, game stats board, and modals for shop/win/loss states. Loads `style.css` and imports `src/main.js`.
* **`style.css`**: Centralized stylesheet detailing variables, animations, layouts, tiles, and responsive modals.

### Core Modules (`src/`)
* **`src/state.js`**: Holds global configurations (`GRID_SIZE`, `HAND_SIZE`, letter pool distributions, shop items, multipliers) and the central shared, mutable, and persistent `gameState` object with safe serialize/deserialize handlers (`saveGame()`, `loadSavedGame()`, `deleteSavedGame()`).
* **`src/stats.js`**: Lifetime statistics tracker storing cumulative values (`maxRound`, `totalGold`, `totalWords`) to local storage.
* **`src/rules.js`**: Core crossword algorithms. Manages downloading the 270k-word Scrabble dictionary and performs multi-directional collinearity, contiguity, connectivity, and word-legality checks.
* **`src/board.js`**: Board and hand rendering components. Renders cell states, applies dynamic CSS valid/invalid classes based on board validation, and processes board interaction/swapping movements.
* **`src/shop.js`**: Modal rendering for the Intermission Shop and purchase logic.
* **`src/main.js`**: Application coordinator. Sets up static DOM event listeners, handles boot workflows, and binds update loops.

---

## Development Guidelines

* **Clean Modularity**: Keep file dependencies acyclic. Leaf modules should import from `src/state.js` or `src/rules.js`, avoiding importing from the entrypoint `src/main.js`.
* **Dynamic Event Binding**: Refrain from using legacy inline HTML attributes like `onclick="..."` inside `index.html`. Always attach event listeners dynamically using `addEventListener()` or `.onclick = ...` bindings inside modern module scripts.
* **Game Design Rules**: Preserve the center-square star (★) rule, the crossword tile-locking logic, board powerups (TW, DW, TL, DL multipliers), and intermission shop progression.
