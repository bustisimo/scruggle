/**
 * Scoring Animation Module
 * Replaces the text-based breakdown modal with animated tile scoring.
 * Each word gets its own card with tiles flying in, multipliers, score and gold.
 * Called by main.js with pre-computed scoring data.
 */

let currentAnimationResolve = null;

/**
 * Show the scoring animation overlay with animated word tiles.
 * Returns a promise that resolves when the user clicks Continue.
 *
 * @param {Array} wordsData - Array of {word, tiles, letterSum, multiplierText, wordScore, wordGold, bonusTexts}
 * @param {number} turnScore - Total score for the turn
 * @param {number} turnGold - Total gold for the turn
 * @param {string|null} bossMessage - Optional boss mechanic message
 * @param {number} [comboLevel] - Current combo streak level (0 if none)
 */
export function showScoringAnimation(wordsData, turnScore, turnGold, bossMessage, comboLevel) {
    return new Promise((resolve) => {
        currentAnimationResolve = resolve;

        const overlay = document.getElementById('scoring-animation');
        const container = document.getElementById('scoring-words');
        const totalScoreEl = document.getElementById('scoring-total-score');
        const totalGoldEl = document.getElementById('scoring-total-gold');
        const bossMsgEl = document.getElementById('scoring-boss-message');
        const continueBtn = document.getElementById('scoring-continue-btn');

        // Reset state
        container.innerHTML = '';
        totalScoreEl.innerText = '0';
        totalGoldEl.innerText = '0';
        continueBtn.style.display = 'none';
        continueBtn.style.opacity = '0';
        continueBtn.style.transform = 'translateY(20px)';
        document.getElementById('scoring-totals').style.display = 'none';

        // Boss message
        if (bossMessage) {
            bossMsgEl.innerHTML = bossMessage;
            bossMsgEl.style.display = 'block';
        } else {
            bossMsgEl.style.display = 'none';
        }

        // Combo badge
        const existingComboBadge = document.getElementById('scoring-combo-badge');
        if (existingComboBadge) existingComboBadge.remove();
        if (comboLevel > 0) {
            const comboBadge = document.createElement('div');
            comboBadge.id = 'scoring-combo-badge';
            comboBadge.className = 'scoring-combo-badge';
            const fires = comboLevel >= 5 ? '🔥🔥🔥' : comboLevel >= 3 ? '🔥🔥' : '🔥';
            comboBadge.innerHTML = `${fires} Combo x${comboLevel}`;
            container.parentNode.insertBefore(comboBadge, container);
        }

        // Show overlay
        overlay.style.display = 'flex';

        // Build word cards
        wordsData.forEach((wd, wordIndex) => {
            const card = createWordCard(wd);
            container.appendChild(card);
        });

        // Start sequential animation after a brief settle
        setTimeout(() => {
            animateSequentially(wordsData, turnScore, turnGold, continueBtn);
        }, 100);
    });
}

function createWordCard(wd) {
    const card = document.createElement('div');
    card.className = 'scoring-word-card';
    card.style.opacity = '0';
    card.style.transform = 'translateY(40px)';

    // Word header
    const header = document.createElement('div');
    header.className = 'scoring-word-header';
    header.innerText = wd.word;
    card.appendChild(header);

    // Tile row: tile + plus signs
    const tileRow = document.createElement('div');
    tileRow.className = 'scoring-tile-row';

    wd.tiles.forEach((tile, ti) => {
        const tileEl = document.createElement('div');
        tileEl.className = 'scoring-tile';
        tileEl.style.transform = 'translateY(60px) scale(0.7)';
        tileEl.style.opacity = '0';

        // Ink styling
        if (tile.ink) {
            tileEl.classList.add(`ink-${tile.ink}`);
            const indicator = document.createElement('span');
            indicator.className = 'scoring-tile-ink';
            indicator.innerText = tile.ink.toUpperCase();
            tileEl.appendChild(indicator);
        }

        // Letter
        const letterSpan = document.createElement('span');
        letterSpan.className = 'scoring-tile-letter';
        letterSpan.innerText = tile.letter;
        tileEl.appendChild(letterSpan);

        // Played value (after multipliers)
        const valueSpan = document.createElement('span');
        valueSpan.className = 'scoring-tile-value';
        valueSpan.innerText = tile.playedValue;
        tileEl.appendChild(valueSpan);

        // Multiplier badge (DL/TL)
        if (tile.multiplierBadge) {
            const badge = document.createElement('span');
            badge.className = 'scoring-tile-badge';
            badge.innerText = tile.multiplierBadge;
            tileEl.appendChild(badge);
        }

        tileRow.appendChild(tileEl);

        // Plus sign between tiles
        if (ti < wd.tiles.length - 1) {
            const plus = document.createElement('span');
            plus.className = 'scoring-tile-plus';
            plus.innerText = '+';
            plus.style.opacity = '0';
            tileRow.appendChild(plus);
        }
    });

    card.appendChild(tileRow);

    // Results row
    const results = document.createElement('div');
    results.className = 'scoring-word-results';

    // Letter sum
    const sumEl = document.createElement('span');
    sumEl.className = 'scoring-result-item';
    sumEl.innerText = `Sum: ${wd.letterSum}`;
    results.appendChild(sumEl);

    // Multiplier display
    if (wd.multiplierText) {
        const multEl = document.createElement('span');
        multEl.className = 'scoring-result-item scoring-result-mult';
        multEl.innerText = `×${wd.multiplierText}`;
        results.appendChild(multEl);
    }

    // Equals arrow
    const arrow = document.createElement('span');
    arrow.className = 'scoring-result-item';
    arrow.innerText = '=';
    results.appendChild(arrow);

    // Word score
    const scoreEl = document.createElement('span');
    scoreEl.className = 'scoring-result-item scoring-result-score';
    // Show short-word bonus inline when active (Word Eater boss)
    const totalWordPts = wd.wordScore + (wd.shortWordBonus || 0);
    if (wd.shortWordBonus) {
        scoreEl.innerText = `${wd.wordScore}+${wd.shortWordBonus} WordEtr`;
        scoreEl.title = `${totalWordPts} pts total (${wd.wordScore} base + ${wd.shortWordBonus} short-word bonus)`;
    } else {
        scoreEl.innerText = `${wd.wordScore} pts`;
    }
    results.appendChild(scoreEl);

    // Gold badge
    const goldEl = document.createElement('span');
    goldEl.className = 'scoring-result-item scoring-result-gold';
    goldEl.innerText = `+${wd.wordGold} 🪙`;
    results.appendChild(goldEl);

    // Bonus tags (inks, stickers)
    if (wd.bonusTexts && wd.bonusTexts.length > 0) {
        const bonusRow = document.createElement('div');
        bonusRow.className = 'scoring-word-bonuses';
        wd.bonusTexts.forEach(bt => {
            const b = document.createElement('span');
            b.className = 'scoring-bonus-tag';
            b.innerText = bt;
            bonusRow.appendChild(b);
        });
        results.appendChild(bonusRow);
    }

    // All result items start hidden
    results.querySelectorAll('.scoring-result-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(8px)';
    });

    if (wd.bonusTexts && wd.bonusTexts.length > 0) {
        const bonusRow = results.querySelector('.scoring-word-bonuses');
        if (bonusRow) {
            bonusRow.style.opacity = '0';
            bonusRow.querySelectorAll('.scoring-bonus-tag').forEach(t => {
                t.style.opacity = '0';
                t.style.transform = 'translateY(6px)';
            });
        }
    }

    card.appendChild(results);
    return card;
}

function animateSequentially(wordsData, turnScore, turnGold, continueBtn) {
    const cards = document.querySelectorAll('.scoring-word-card');
    let wordIndex = 0;

    function animateNextWord() {
        if (wordIndex >= cards.length) {
            animateTotals(turnScore, turnGold, continueBtn);
            return;
        }

        const card = cards[wordIndex];
        const wd = wordsData[wordIndex];

        // Slide in the word card
        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';

        // Stagger tile fly-in
        const tiles = card.querySelectorAll('.scoring-tile');
        const pluses = card.querySelectorAll('.scoring-tile-plus');

        tiles.forEach((tile, i) => {
            setTimeout(() => {
                tile.style.transition = 'opacity 0.35s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
                tile.style.opacity = '1';
                tile.style.transform = 'translateY(0) scale(1)';

                // Show the following plus sign
                if (pluses[i]) {
                    setTimeout(() => {
                        pluses[i].style.transition = 'opacity 0.2s ease';
                        pluses[i].style.opacity = '0.6';
                    }, 150);
                }
            }, 300 + i * 180);
        });

        // After all tiles have landed, reveal results
        const tileAnimationsTime = 300 + tiles.length * 180 + 400;
        const resultItems = card.querySelectorAll('.scoring-result-item');

        setTimeout(() => {
            // Reveal items one by one
            let delay = 0;
            resultItems.forEach((item, ri) => {
                setTimeout(() => {
                    item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';

                    // Counter animation for score
                    if (item.classList.contains('scoring-result-score')) {
                        // Count up to the final display value
                        const isShortWord = wd.shortWordBonus > 0;
                        const animateTarget = isShortWord ? (wd.wordScore + wd.shortWordBonus) : wd.wordScore;
                        const suffix = isShortWord ? 'pts' : 'pts';
                        animateNumber(item, animateTarget, suffix, 600);
                        if (isShortWord) {
                            // After counter finishes, append the bonus breakdown
                            setTimeout(() => {
                                item.innerText = `${wd.wordScore}+${wd.shortWordBonus} WordEtr`;
                            }, 650);
                        }
                    }
                    // Gold just fades in
                    if (item.classList.contains('scoring-result-gold')) {
                        // Already showing text
                    }
                }, delay);
                delay += 350;
            });

            // After result items, show bonus tags if any
            const bonusRow = card.querySelector('.scoring-word-bonuses');
            if (bonusRow) {
                setTimeout(() => {
                    bonusRow.style.transition = 'opacity 0.3s ease';
                    bonusRow.style.opacity = '1';
                    const tags = bonusRow.querySelectorAll('.scoring-bonus-tag');
                    tags.forEach((tag, ti) => {
                        setTimeout(() => {
                            tag.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                            tag.style.opacity = '1';
                            tag.style.transform = 'translateY(0)';
                        }, ti * 150);
                    });
                }, delay + 200);
            }

            // Next word after this one finishes
            const totalDelay = Math.max(
                delay + (bonusRow ? 200 + (bonusRow.querySelectorAll('.scoring-bonus-tag').length * 150) : 0) + 300,
                1500
            );
            setTimeout(() => {
                wordIndex++;
                setTimeout(animateNextWord, 300);
            }, totalDelay);

        }, tileAnimationsTime);
    }

    animateNextWord();
}

function animateNumber(el, target, suffix, duration) {
    const startTime = performance.now();
    const startVal = 0;

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(startVal + (target - startVal) * eased);
        el.innerText = `${current}${suffix ? ' ' + suffix : ''}`;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    requestAnimationFrame(update);
}

function animateTotals(score, gold, continueBtn) {
    const totalsArea = document.getElementById('scoring-totals');
    totalsArea.style.display = 'flex';

    const totalScoreEl = document.getElementById('scoring-total-score');
    const totalGoldEl = document.getElementById('scoring-total-gold');

    // Animate total score
    setTimeout(() => {
        animateNumber(totalScoreEl, score, '', 700);
    }, 300);

    // Animate total gold
    setTimeout(() => {
        animateNumber(totalGoldEl, gold, '', 700);
    }, 600);

    // Show continue button
    setTimeout(() => {
        continueBtn.style.display = 'block';
        setTimeout(() => {
            continueBtn.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            continueBtn.style.opacity = '1';
            continueBtn.style.transform = 'translateY(0)';
        }, 50);
    }, 1200);
}

/**
 * Close the scoring animation overlay and resolve the promise.
 * Called by the Continue button in main.js.
 */
export function closeScoringAnimation() {
    const overlay = document.getElementById('scoring-animation');
    overlay.style.display = 'none';
    if (currentAnimationResolve) {
        currentAnimationResolve();
        currentAnimationResolve = null;
    }
}
