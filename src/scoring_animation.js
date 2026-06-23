/**
 * Scoring Animation Module
 * In-place floating score popups on the board — no blocking overlay.
 * Each tile shows its individual score above it sequentially, then
 * the total score + gold popup floats above the word.
 * Combo bonus appears as an orange counter at the end of the last word.
 */

let currentAnimationResolve = null;

/**
 * Show floating score popups above scored words on the board.
 * Fire-and-forget visual feedback — returns a promise that resolves
 * after all animations complete.
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

    let delay = 300;
    let lastWordEnd = delay;

    wordsData.forEach((wd) => {
        if (wd.tiles.length === 0) return;
        const duration = animateWordPopup(board, wd, delay);
        lastWordEnd = delay + duration;
        delay += 1500;
    });

    // Show combo floating badge after the last word's animation
    if (comboLevel > 0) {
        const lastRealWord = wordsData.filter(w => w.tiles.length > 0).pop();
        if (lastRealWord && lastRealWord.coords && lastRealWord.coords.length > 0) {
            animateComboPopup(board, lastRealWord.coords, comboLevel, lastWordEnd - 600);
        }
    }

    return new Promise((resolve) => {
        currentAnimationResolve = resolve;
        setTimeout(resolve, lastWordEnd + 600);
    });
}

/**
 * Animate a single word: each tile highlights sequentially with its score popup,
 * then a total score + gold popup at the end.
 */
function animateWordPopup(board, wd, startDelay) {
    if (!wd.coords || wd.coords.length === 0 || !wd.tiles) return 0;

    const tileDelay = 250;

    wd.coords.forEach((c, i) => {
        const idx = c.y * 7 + c.x;
        const cell = board.children[idx];
        if (!cell) return;

        const tileData = wd.tiles[i];
        const offset = startDelay + i * tileDelay;

        setTimeout(() => {
            // Flash the tile on the board
            const tileEl = cell.querySelector('.tile');
            if (tileEl) {
                tileEl.classList.remove('scoring-flash');
                // Force reflow so the animation re-triggers
                void tileEl.offsetWidth;
                tileEl.classList.add('scoring-flash');
                setTimeout(() => tileEl.classList.remove('scoring-flash'), 800);
            }

            // Show individual tile value popup above this cell
            if (tileData) {
                showTileScorePopup(board, c, tileData.playedValue, tileData.multiplierBadge);
            }
        }, offset);
    });

    // Total score + gold popup after all tiles
    const totalOffset = startDelay + wd.coords.length * tileDelay + 350;
    setTimeout(() => {
        showTotalPopup(board, wd);
    }, totalOffset);

    return wd.coords.length * tileDelay + 2800;
}

/**
 * Floating popup for a single tile's score contribution.
 * Shows "+N" above the cell, with optional DL/TL badge.
 */
function showTileScorePopup(board, coord, playedValue, multiplierBadge) {
    const boardRect = board.getBoundingClientRect();
    const idx = coord.y * 7 + coord.x;
    const cell = board.children[idx];
    if (!cell) return;

    const cellRect = cell.getBoundingClientRect();
    const centerX = cellRect.left + cellRect.width / 2 - boardRect.left;
    const topY = cellRect.top - boardRect.top - 8;

    const popup = document.createElement('div');
    popup.className = 'scoring-tile-popup';
    popup.style.left = `${centerX}px`;
    popup.style.top = `${topY}px`;
    popup.style.transform = 'translate(-50%, 0) scale(0.4)';
    popup.style.opacity = '0';

    // Score value
    const scoreSpan = document.createElement('span');
    scoreSpan.className = 'scoring-tile-pts';
    scoreSpan.innerText = `+${playedValue}`;
    popup.appendChild(scoreSpan);

    // Multiplier badge if applicable (DL/TL)
    if (multiplierBadge) {
        const badge = document.createElement('span');
        badge.className = 'scoring-tile-badge-small';
        badge.innerText = multiplierBadge;
        popup.appendChild(badge);
    }

    board.appendChild(popup);

    // Animate: quick bounce in, hold, float up & fade
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            popup.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease';
            popup.style.transform = 'translate(-50%, 0) scale(1)';
            popup.style.opacity = '1';

            setTimeout(() => {
                popup.style.transition = 'transform 0.8s ease-out, opacity 0.8s ease-out';
                popup.style.transform = 'translate(-50%, -35px) scale(1)';
                popup.style.opacity = '0';
                setTimeout(() => popup.remove(), 900);
            }, 700);
        });
    });
}

/**
 * Floating total popup — centered above the word area.
 * Shows "+N pts" green + "+M🪙" yellow.
 */
function showTotalPopup(board, wd) {
    const boardRect = board.getBoundingClientRect();

    // Find bounding box of word's cells for centering
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
    // Place a bit higher than the tile popups
    const topY = minY - boardRect.top - 40;

    const popup = document.createElement('div');
    popup.className = 'scoring-board-popup';
    popup.style.left = `${centerX}px`;
    popup.style.top = `${topY}px`;
    popup.style.transform = 'translate(-50%, 0) scale(0.5)';
    popup.style.opacity = '0';

    // Total score
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

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            popup.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease';
            popup.style.transform = 'translate(-50%, 0) scale(1)';
            popup.style.opacity = '1';

            setTimeout(() => {
                popup.style.transition = 'transform 1s ease-out, opacity 1s ease-out';
                popup.style.transform = 'translate(-50%, -45px) scale(1)';
                popup.style.opacity = '0';
                setTimeout(() => popup.remove(), 1100);
            }, 900);
        });
    });
}

function animateComboPopup(board, lastCoords, comboLevel, startDelay) {
    const boardRect = board.getBoundingClientRect();

    const lastC = lastCoords[lastCoords.length - 1];
    const idx = lastC.y * 7 + lastC.x;
    const cell = board.children[idx];
    if (!cell) return;

    const cellRect = cell.getBoundingClientRect();
    const centerX = cellRect.right - boardRect.left + 12;
    const topY = cellRect.top - boardRect.top - 8;

    const popup = document.createElement('div');
    popup.className = 'scoring-combo-popup';
    popup.style.left = `${centerX}px`;
    popup.style.top = `${topY}px`;
    popup.style.transform = 'translate(0, 0) scale(0.4)';
    popup.style.opacity = '0';

    const fires = comboLevel >= 5 ? '🔥🔥🔥' : comboLevel >= 3 ? '🔥🔥' : '🔥';
    popup.innerText = `${fires}+${comboLevel}`;

    board.appendChild(popup);

    const show = () => {
        popup.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease';
        popup.style.transform = 'translate(0, 0) scale(1)';
        popup.style.opacity = '1';

        setTimeout(() => {
            popup.style.transition = 'transform 0.8s ease-out, opacity 0.8s ease-out';
            popup.style.transform = 'translate(0, -35px) scale(1)';
            popup.style.opacity = '0';
            setTimeout(() => popup.remove(), 900);
        }, 900);
    };

    if (startDelay > 0) {
        setTimeout(show, startDelay);
    } else {
        requestAnimationFrame(() => requestAnimationFrame(show));
    }
}

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