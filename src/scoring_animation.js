/**
 * Scoring Animation Module
 * In-place floating score popups on the board — no blocking overlay.
 * Each word's green score + yellow cash pop above the tiles and fade away.
 * Combo bonus appears as an orange counter at the end of the last word.
 */

let currentAnimationResolve = null;

/**
 * Show floating score popups above scored words on the board.
 * Fire-and-forget visual feedback — returns a promise that resolves
 * after all animations complete (~1.5-3s depending on word count).
 *
 * @param {Array} wordsData - Array of {word, tiles, coords, wordScore, wordGold, bonusTexts, shortWordBonus}
 * @param {number} turnScore - Total score for the turn
 * @param {number} turnGold - Total gold for the turn
 * @param {string|null} bossMessage - Optional boss mechanic message
 * @param {number} [comboLevel] - Current combo streak level (0 if none)
 */
export function showScoringAnimation(wordsData, turnScore, turnGold, bossMessage, comboLevel) {
    const board = document.getElementById('board');
    if (!board) return Promise.resolve();

    let delay = 300; // ms before first popup starts
    let lastWordEnd = delay;

    wordsData.forEach((wd) => {
        if (wd.tiles.length === 0) return; // skip bonus-only entries
        const duration = animateWordPopup(board, wd, delay);
        lastWordEnd = delay + duration;
        delay += 1200; // stagger between words
    });

    // Show combo floating badge after the last word's popup
    if (comboLevel > 0 && wordsData.length > 0) {
        const lastWd = wordsData.filter(w => w.tiles.length > 0).pop();
        if (lastWd && lastWd.coords && lastWd.coords.length > 0) {
            animateComboPopup(board, lastWd.coords, comboLevel, lastWordEnd);
        }
    }

    return new Promise((resolve) => {
        currentAnimationResolve = resolve;
        setTimeout(resolve, lastWordEnd + 1200);
    });
}

function animateWordPopup(board, wd, startDelay) {
    if (!wd.coords || wd.coords.length === 0) return 0;

    // Highlight tiles on the board sequentially (wave effect)
    wd.coords.forEach((c, i) => {
        const idx = c.y * 7 + c.x;
        const cell = board.children[idx];
        if (!cell) return;
        const tileEl = cell.querySelector('.tile');
        if (!tileEl) return;

        setTimeout(() => {
            tileEl.classList.add('scoring-flash');
            setTimeout(() => {
                tileEl.classList.remove('scoring-flash');
            }, 800);
        }, startDelay + i * 120);
    });

    // Create the floating popup above the word
    const popupDuration = 2200;
    setTimeout(() => {
        showFloatingPopup(board, wd);
    }, startDelay + wd.coords.length * 120 + 200);

    return wd.coords.length * 120 + popupDuration;
}

function showFloatingPopup(board, wd) {
    const boardRect = board.getBoundingClientRect();

    // Find bounding box of word's cells
    let minX = Infinity, maxX = -Infinity, minY = Infinity;
    wd.coords.forEach(c => {
        const idx = c.y * 7 + c.x;
        const cell = board.children[idx];
        if (!cell) return;
        const rect = cell.getBoundingClientRect();
        minX = Math.min(minX, rect.left);
        maxX = Math.max(maxX, rect.right);
        minY = Math.min(minY, rect.top);
    });

    if (minX === Infinity) return;

    const centerX = (minX + maxX) / 2 - boardRect.left;
    const topY = minY - boardRect.top - 15;

    // Popup container
    const popup = document.createElement('div');
    popup.className = 'scoring-board-popup';
    popup.style.left = `${centerX}px`;
    popup.style.top = `${topY}px`;
    popup.style.transform = 'translate(-50%, 0) scale(0.5)';
    popup.style.opacity = '0';

    // Score
    const totalPts = wd.wordScore + (wd.shortWordBonus || 0);
    const scoreSpan = document.createElement('span');
    scoreSpan.className = 'scoring-popup-pts';
    scoreSpan.innerText = `+${totalPts}`;
    popup.appendChild(scoreSpan);

    // Gold
    if (wd.wordGold > 0) {
        const goldSpan = document.createElement('span');
        goldSpan.className = 'scoring-popup-gold';
        goldSpan.innerText = `+${wd.wordGold}🪙`;
        popup.appendChild(goldSpan);
    }

    // Short word bonus note (Word Eater)
    if (wd.shortWordBonus) {
        const note = document.createElement('div');
        note.className = 'scoring-popup-note';
        note.innerText = `(Word Eater +${wd.shortWordBonus})`;
        popup.appendChild(note);
    }

    board.appendChild(popup);

    // Animate: bounce in, hold, float up & fade
    requestAnimationFrame(() => {
        // Wait a frame so the initial state renders
        requestAnimationFrame(() => {
            popup.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease';
            popup.style.transform = 'translate(-50%, 0) scale(1)';
            popup.style.opacity = '1';

            // Float up and fade out
            setTimeout(() => {
                popup.style.transition = 'transform 1s ease-out, opacity 1s ease-out';
                popup.style.transform = 'translate(-50%, -45px) scale(1)';
                popup.style.opacity = '0';
                setTimeout(() => popup.remove(), 1100);
            }, 800);
        });
    });
}

function animateComboPopup(board, lastCoords, comboLevel, startDelay) {
    const boardRect = board.getBoundingClientRect();

    // Position to the right of the last tile
    const lastC = lastCoords[lastCoords.length - 1];
    const idx = lastC.y * 7 + lastC.x;
    const cell = board.children[idx];
    if (!cell) return;

    const cellRect = cell.getBoundingClientRect();
    const centerX = cellRect.right - boardRect.left + 15;
    const topY = cellRect.top - boardRect.top - 10;

    const popup = document.createElement('div');
    popup.className = 'scoring-combo-popup';
    popup.style.left = `${centerX}px`;
    popup.style.top = `${topY}px`;
    popup.style.transform = 'translate(0, 0) scale(0.5)';
    popup.style.opacity = '0';

    const fires = comboLevel >= 5 ? '🔥🔥🔥' : comboLevel >= 3 ? '🔥🔥' : '🔥';
    popup.innerText = `${fires}+${comboLevel}`;

    board.appendChild(popup);

    setTimeout(() => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                popup.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease';
                popup.style.transform = 'translate(0, 0) scale(1)';
                popup.style.opacity = '1';

                setTimeout(() => {
                    popup.style.transition = 'transform 1s ease-out, opacity 1s ease-out';
                    popup.style.transform = 'translate(0, -35px) scale(1)';
                    popup.style.opacity = '0';
                    setTimeout(() => popup.remove(), 1100);
                }, 800);
            });
        });
    }, startDelay);
}

/**
 * Close the scoring animation — no-op now (no overlay).
 * Kept for backward compatibility with main.js.
 */
export function closeScoringAnimation() {
    if (currentAnimationResolve) {
        currentAnimationResolve();
        currentAnimationResolve = null;
    }
}

/**
 * Show a brief floating message above the board (boss mechanics, etc.)
 * Auto-fades after 2 seconds.
 */
export function showBoardMessage(message) {
    const board = document.getElementById('board');
    if (!board || !message) return;

    const el = document.createElement('div');
    el.className = 'scoring-board-message';
    el.style.opacity = '0';
    el.style.transform = 'translate(-50%, -20px) scale(0.8)';
    el.innerText = message;

    board.appendChild(el);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            el.style.transition = 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
            el.style.opacity = '1';
            el.style.transform = 'translate(-50%, 0) scale(1)';

            setTimeout(() => {
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                el.style.opacity = '0';
                el.style.transform = 'translate(-50%, -15px) scale(1)';
                setTimeout(() => el.remove(), 700);
            }, 2000);
        });
    });
}