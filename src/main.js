import {
    gameState, GRID_SIZE, letterDist, shopItems, CLASSIC_MULTIPLIERS,
    saveGame, loadSavedGame, deleteSavedGame, FONT_BAGS, triggerHook, shuffle, getSwapCost,
    getEndlessTargetScore, getEndlessHandSize, getEndlessNegativeCells, getEndlessScalingInfo, bookmarksRegistry
} from './state.js';
import { getStats, updateStats, incrementRuns, incrementWins, getPlayerTitle, getTitleEmoji, recordSubmission, renderStatsDrawer } from './stats.js';
import { loadDictionary, validateBoard, findWords } from './rules.js';
import {
    renderInventory, renderBoard, renderHand, handleBoardClick,
    renderBagDrawer, createTileUI, computeBagLetterCounts, buildBagDistributionText
} from './board.js';
import { openShop, buyItem } from './shop.js';
import { loadAchievements, checkAchievements, getUnlockedCount } from './achievements.js';
import { BOSSES, getBossForRound, applyBossReward } from './bosses.js';
import { showScoringAnimation, closeScoringAnimation } from './scoring_animation.js';
import audio from './audio.js';
import { showTutorial, hasSeenTutorial } from './tutorial.js';

function fitBoard() {
    const root = document.documentElement;
    const bodyPad = window.innerWidth <= 600 ? 4 : 20;
    const isMobile = window.innerWidth <= 600;
    // Board structural overhead: border*2 + padding*2 + gap*6 ≈ cell * 0.52
    // Use a fixed buffer so the board + surrounding elements fit the viewport width
    const boardFudge = isMobile ? 24 : 40;
    const pad = bodyPad + boardFudge;
    // vertOverhead: scoreboard + stats + hand-container + controls + gaps + body padding + safari bar
    const vertOverhead = isMobile ? 325 : 260;

    const vw = window.innerWidth;
    const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    const maxCellW = Math.floor((vw - pad) / 7);
    const maxCellH = Math.floor((vh - vertOverhead) / 7);
    let cell = Math.min(maxCellW, maxCellH, 60); // cap at desktop default
    cell = Math.max(cell, 28); // never smaller than usable

    root.style.setProperty('--cell-size', cell + 'px');
    root.style.setProperty('--tile-size', Math.floor(cell * 0.84) + 'px');
}

async function init() {
    fitBoard();
    window.addEventListener('resize', () => { fitBoard(); });
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => { fitBoard(); });
    }
    loadAchievements();
    loadDictionary(() => {
        renderUI();
        setupDictionarySearch();
    }, (text) => {
        const btn = document.getElementById('submit-btn');
        if (btn) btn.innerText = text;
    });
    setupEventListeners();
    renderTitleTiles();
    showStartScreen();
}

function renderTitleTiles() {
    const container = document.getElementById('game-title-tiles');
    if (!container) return;
    container.innerHTML = '';

    const title = "SCRUGGLE";
    const letters = title.split('');

    let draggedTitleTile = null;

    letters.forEach((letter, i) => {
        try {
            const distribution = FONT_BAGS.standard.distribution;
            const val = distribution[letter] ? distribution[letter].val : 1;

            const tile = { letter, value: val, ink: null };
            const tileEl = createTileUI(tile);
            tileEl.classList.add('title-tile');

            // HTML5 Drag and Drop for playful rearranging
            tileEl.setAttribute('draggable', 'true');
            tileEl.addEventListener('dragstart', (e) => {
                draggedTitleTile = tileEl;
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', '');
                tileEl.classList.add('dragging');
            });
            tileEl.addEventListener('dragend', () => {
                tileEl.classList.remove('dragging');
                draggedTitleTile = null;
            });
            tileEl.addEventListener('dragover', (e) => {
                if (draggedTitleTile && draggedTitleTile !== tileEl) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    const children = Array.from(container.children);
                    const draggedIndex = children.indexOf(draggedTitleTile);
                    const targetIndex = children.indexOf(tileEl);
                    if (draggedIndex < targetIndex) {
                        container.insertBefore(draggedTitleTile, tileEl.nextSibling);
                    } else {
                        container.insertBefore(draggedTitleTile, tileEl);
                    }
                }
            });
            tileEl.addEventListener('drop', (e) => {
                e.preventDefault();
            });

            container.appendChild(tileEl);
        } catch (e) {
            console.warn('Failed to render title tile', letter, e);
        }
    });
}

function renderFontBagCards(hasSave) {
    const optionsContainer = document.getElementById('font-bag-options');
    if (!optionsContainer) return;
    optionsContainer.innerHTML = '';
    Object.values(FONT_BAGS).forEach(bag => {
        const card = document.createElement('div');
        card.className = 'font-bag-card';
        if (gameState.selectedFontBagId === bag.id) {
            card.classList.add('active');
        }
        if (hasSave) {
            card.style.opacity = '0.7';
            card.style.cursor = 'not-allowed';
            card.title = 'Cannot change starting bag during an active run!';
        }
        card.innerHTML = `
            <div class="font-bag-name">${bag.name}</div>
            <div class="font-bag-desc">${bag.desc}</div>
            <div class="font-bag-stats">
                <span class="bag-stat">🃏 ${bag.handSize} hand</span>
                <span class="bag-stat">📦 ${Object.values(bag.distribution).reduce((s, d) => s + d.count, 0)} tiles</span>
                <span class="bag-stat">⭐ ${(Object.values(bag.distribution).reduce((s, d) => s + d.val * d.count, 0) / Object.values(bag.distribution).reduce((s, d) => s + d.count, 0)).toFixed(1)} avg</span>
                <span class="bag-stat">🔤 ${Object.entries(bag.distribution).filter(([l]) => 'AEIOU'.includes(l)).reduce((s, [,d]) => s + d.count, 0)} vowels</span>
            </div>
        `;
        if (!hasSave) {
            card.onclick = () => {
                gameState.selectedFontBagId = bag.id;
                gameState.handSize = bag.handSize;
                saveGame();
                Array.from(optionsContainer.children).forEach(child => child.classList.remove('active'));
                card.classList.add('active');
            };
        }
        optionsContainer.appendChild(card);
    });
}

function showStartScreen() {
    const stats = getStats();
    document.getElementById('stat-highest-round').innerText = stats.maxRound;
    document.getElementById('stat-total-gold').innerText = stats.totalGold;
    document.getElementById('stat-total-words').innerText = stats.totalWords;
    document.getElementById('stat-total-runs').innerText = stats.totalRuns || 0;
    document.getElementById('stat-total-wins').innerText = stats.totalWins || 0;
    document.getElementById('stat-title').innerText = `${getTitleEmoji()} ${getPlayerTitle()}`;

    const hasSave = loadSavedGame();
    const continueBtn = document.getElementById('continue-run-btn');
    if (hasSave) {
        continueBtn.disabled = false;
    } else {
        continueBtn.disabled = true;
    }

    renderFontBagCards(hasSave);

    // Ensure main menu is visible, bag selection is hidden
    document.getElementById('main-menu-view').style.display = 'block';
    document.getElementById('bag-selection-view').style.display = 'none';
    document.getElementById('start-screen').style.display = 'flex';
    document.getElementById('game-container').style.display = 'none';

    // Render new lifetime stats, personal bests, and submission history
    renderStatsDrawer();
}

function setupDictionarySearch() {
    const input = document.getElementById('dict-search');
    const results = document.getElementById('dict-results');
    const matchCount = document.getElementById('dict-match-count');
    if (!input || !results) return;

    let debounceTimer;
    input.oninput = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = input.value.trim().toUpperCase();
            if (query.length < 3) {
                results.innerHTML = '<p style="opacity: 0.7; font-style: italic; font-size: 14px;">Search over 270,000 valid words (min 3 chars).</p>';
                if (matchCount) matchCount.innerText = '';
                return;
            }

            results.innerHTML = '<p style="opacity: 0.7; font-size: 14px;">Searching...</p>';

            // Search the Set
            const matches = [];
            for (const word of gameState.dictionary) {
                if (word.startsWith(query)) {
                    matches.push(word);
                    if (matches.length >= 200) break;
                }
            }

            if (matches.length === 0) {
                results.innerHTML = '<p style="opacity: 0.7; font-style: italic;">No matches found.</p>';
                if (matchCount) matchCount.innerText = '0 results';
            } else {
                // Scroll results back to top when new results come in
                results.scrollTop = 0;

                const totalDictSize = gameState.dictionary ? gameState.dictionary.size : 0;
                const matchLabel = matches.length >= 200 ? '200+' : matches.length;
                const matchPct = ((matches.length / totalDictSize) * 100).toFixed(2);
                if (matchCount) {
                    const displayText = matches.length >= 200
                        ? `${matchLabel} / ${totalDictSize}`
                        : `${matches.length} / ${totalDictSize}`;
                    matchCount.innerText = displayText;
                    matchCount.classList.remove('highlighted');
                    void matchCount.offsetWidth;
                    if (matches.length > 0) matchCount.classList.add('highlighted');
                    matchCount.title = `${matches.length} / ${totalDictSize} words (${matchPct}%)`;
                }

                // Build results header + word list
                const headerHtml = `<div class="dict-results-header">
                    <span class="dict-count-label">${matchLabel} matching words</span>
                    <span class="dict-count-pct">${matchPct}% of dictionary</span>
                </div>`;
                results.innerHTML = headerHtml + matches.map(w => `<div title="${w.length} letters">${w}</div>`).join('');
            }
        }, 150);
    };
}

function initRound(isNewRun) {
    gameState.score = 0;
    if (isNewRun) {
        gameState.combo = 0;
        gameState.gold = 0;
        gameState.inventory = [];
        gameState.currentRound = 1;
        gameState.startCell = { x: 3, y: 3 };
        gameState.boardMultipliers = { ...CLASSIC_MULTIPLIERS };
        gameState.shopOffers = [];
        gameState.rerollCost = 2;
        gameState.purchasedLetters = [];
        gameState.activeBoss = null;
        gameState.defeatedBosses = [];
    } else {
        gameState.currentRound++;
        gameState.shopOffers = [];
        gameState.rerollCost = 2;

        // Progressive board randomization: Round 2 onwards
        gameState.startCell = {
            x: Math.floor(Math.random() * 5) + 1,
            y: Math.floor(Math.random() * 5) + 1
        };

        gameState.boardMultipliers = {};
        const multTypes = ['DL', 'TL', 'DW', 'TW', 'GM', 'QW'];
        const numMultipliers = Math.floor(6 + gameState.currentRound / 2);

        const candidates = [];
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                if (x === gameState.startCell.x && y === gameState.startCell.y) continue;
                candidates.push({ x, y });
            }
        }

        shuffle(candidates);

        for (let i = 0; i < Math.min(numMultipliers, candidates.length); i++) {
            const { x, y } = candidates[i];
            const type = multTypes[Math.floor(Math.random() * multTypes.length)];
            gameState.boardMultipliers[`${x},${y}`] = type;
        }
    }

    gameState.targetScore = getEndlessTargetScore(gameState.currentRound);
    if (gameState.goldenTicket) {
        gameState.targetScore = Math.ceil(gameState.targetScore / 2);
        gameState.goldenTicket = false;
    }
    gameState.handsLeft = 4;
    gameState.discardsLeft = 15;
    gameState.discardPool = [];

    // Hoarder bookmark: +5 gold per round start
    if (gameState.inventory.includes('hoarder')) {
        gameState.gold += 5;
    }

    if (isNewRun) {
        gameState.board = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
        gameState.bag = [];
        gameState.hand = [];

        const activeBag = FONT_BAGS[gameState.selectedFontBagId || 'standard'] || FONT_BAGS.standard;
        gameState.handSize = activeBag.handSize;

        for (const [letter, data] of Object.entries(activeBag.distribution)) {
            for (let i = 0; i < data.count; i++) {
                gameState.bag.push({ letter, value: data.val, isLocked: false });
            }
        }
    } else {
        // Collect board tiles back into bag
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const tile = gameState.board[y][x];
                if (tile) {
                    tile.isLocked = false;
                    gameState.bag.push(tile);
                }
            }
        }
        // Collect hand tiles back into bag
        gameState.bag.push(...gameState.hand);

        // Reset board and hand
        gameState.board = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
        gameState.hand = [];

        const activeBag = FONT_BAGS[gameState.selectedFontBagId || 'standard'] || FONT_BAGS.standard;
        gameState.handSize = activeBag.handSize;
    }

    // Merge purchased letters from the shop
    if (gameState.purchasedLetters && gameState.purchasedLetters.length > 0) {
        gameState.bag.push(...gameState.purchasedLetters);
        gameState.purchasedLetters = [];
    }

    // Endless scaling: hand size reduction after round 15
    if (gameState.currentRound > 15) {
        const activeBag = FONT_BAGS[gameState.selectedFontBagId || 'standard'] || FONT_BAGS.standard;
        const reduced = getEndlessHandSize(gameState.currentRound, activeBag.handSize);
        if (reduced < gameState.handSize) {
            gameState.handSize = reduced;
        }
    }

    // Endless scaling: negative multiplier cells after round 20
    const endlessNegCount = getEndlessNegativeCells(gameState.currentRound);
    gameState.endlessNegativeCells = endlessNegCount;
    if (endlessNegCount > 0) {
        const candidates = [];
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const key = `${x},${y}`;
                if (!gameState.boardMultipliers[key] &&
                    !(x === gameState.startCell.x && y === gameState.startCell.y)) {
                    candidates.push({ x, y });
                }
            }
        }
        shuffle(candidates);
        for (let i = 0; i < Math.min(endlessNegCount, candidates.length); i++) {
            gameState.boardMultipliers[`${candidates[i].x},${candidates[i].y}`] = 'NM';
        }
    }

    shuffle(gameState.bag);
    drawTiles();

    // Check for boss encounter (non-new-run rounds only)
    const boss = getBossForRound(gameState.currentRound, gameState.defeatedBosses);
    if (boss) {
        gameState.activeBoss = boss.id;
        boss.onBossStart(gameState);
        saveGame();
        showBossIntro(boss);
        return;
    }

    saveGame();
}

function showBossIntro(boss) {
    document.getElementById('shop-screen').style.display = 'none';
    document.getElementById('game-container').style.display = 'none';

    document.getElementById('boss-intro-emoji').innerText = boss.emoji;
    document.getElementById('boss-intro-art').innerText = boss.art;
    document.getElementById('boss-intro-name').innerText = boss.name;
    document.getElementById('boss-intro-text').innerText = boss.introText;

    const rulesEl = document.getElementById('boss-intro-rules');
    rulesEl.innerHTML = '';
    boss.rules.forEach(rule => {
        const li = document.createElement('li');
        li.innerText = rule;
        rulesEl.appendChild(li);
    });

    document.getElementById('boss-intro-screen').style.display = 'flex';
}

function showBossDefeat(boss) {
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('boss-defeat-emoji').innerText = boss.emoji;
    document.getElementById('boss-defeat-name').innerText = boss.name;

    const reward = applyBossReward(gameState, boss);
    document.getElementById('boss-defeat-reward').innerText = reward.message;

    gameState.defeatedBosses.push(boss.id);
    gameState.activeBoss = null;
    saveGame();

    document.getElementById('boss-defeat-screen').style.display = 'flex';
    audio.roundWin();
    audio.goldEarned();
}

function drawTiles() {
    while (gameState.hand.length < gameState.handSize && gameState.bag.length > 0) {
        gameState.hand.push(gameState.bag.pop());
    }
}

function renderUI() {
    const prevScore = document.getElementById('score').innerText;
    const prevBag = document.getElementById('bag-count-badge').innerText;
    const prevGold = document.getElementById('gold').innerText;

    document.getElementById('score').innerText = gameState.score;
    document.getElementById('gold').innerText = gameState.gold;
    document.getElementById('round').innerText = gameState.currentRound + (gameState.currentRound >= 21 ? ' - Endless' : '');
    // Endless scaling info tooltip
    const roundEl = document.getElementById('round');
    if (gameState.currentRound >= 21) {
        const info = getEndlessScalingInfo(gameState.currentRound);
        roundEl.title = info.length > 0 ? 'Endless Mode:\n' + info.join('\n') : '';
    } else {
        roundEl.title = '';
    }

    // Endless mode badge — shows active debuffs inline
    const endlessBadge = document.getElementById('endless-badge');
    if (gameState.currentRound >= 21) {
        const nm = getEndlessNegativeCells(gameState.currentRound);
        const info = getEndlessScalingInfo(gameState.currentRound);
        endlessBadge.style.display = 'inline';
        endlessBadge.innerText = '🌊 Endless';
        endlessBadge.title = info.length > 0 ? 'Endless Mode:\n' + info.join('\n') : '';
    } else {
        endlessBadge.style.display = 'none';
        endlessBadge.innerText = '';
        endlessBadge.title = '';
    }
    document.getElementById('target').innerText = gameState.targetScore;
    document.getElementById('hands').innerText = gameState.handsLeft;
    document.getElementById('discards').innerText = gameState.discardsLeft;

    // Combo display
    const comboDisplay = document.getElementById('combo-display');
    const comboCount = document.getElementById('combo-count');
    if (gameState.combo > 0) {
        comboDisplay.style.display = 'flex';
        comboCount.innerText = gameState.combo;
        comboDisplay.classList.add('combo-active');
        // Fire emoji count scales with combo level
        const fires = gameState.combo >= 5 ? '🔥🔥🔥' : gameState.combo >= 3 ? '🔥🔥' : '🔥';
        comboDisplay.querySelector('.combo-fire').innerText = fires;
    } else {
        comboDisplay.style.display = 'none';
        comboDisplay.classList.remove('combo-active');
    }

    // Score pop animation when score changes
    const scoreEl = document.getElementById('score');
    if (prevScore !== '' + gameState.score) {
        scoreEl.classList.remove('score-pop');
        void scoreEl.offsetWidth;
        scoreEl.classList.add('score-pop');
    }

    // Gold pulse animation when gold changes — spawn coin particles
    const goldEl = document.getElementById('gold');
    if (prevGold !== '' + gameState.gold) {
        goldEl.classList.remove('gold-pulse');
        void goldEl.offsetWidth;
        goldEl.classList.add('gold-pulse');
        // Spawn floating coin particles
        if (gameState.gold > parseInt(prevGold || '0')) {
            const goldRect = goldEl.getBoundingClientRect();
            const coinChars = ['🪙', '✦', '●'];
            for (let i = 0; i < 4; i++) {
                const coin = document.createElement('div');
                coin.className = 'gold-coin-particle';
                coin.innerText = coinChars[i % coinChars.length];
                const drift = (Math.random() - 0.5) * 50;
                coin.style.cssText = `
                    left: ${goldRect.left + goldRect.width / 2 + (Math.random() - 0.5) * 40}px;
                    top: ${goldRect.top}px;
                    --drift: ${drift}px;
                    font-size: ${12 + Math.random() * 10}px;
                `;
                document.body.appendChild(coin);
                setTimeout(() => coin.remove(), 1000);
            }
        }
    }

    // Progress bar animation
    const fill = document.getElementById('progress-bar-fill');
    const pct = Math.min(100, (gameState.score / gameState.targetScore) * 100);
    const prevPct = parseFloat(fill.dataset.prevPct || '0');
    fill.style.width = pct + '%';
    // Score float-up text when progress increases
    if (pct > prevPct && prevPct > 0) {
        const diffPct = pct - prevPct;
        const floatEl = document.createElement('div');
        floatEl.className = 'score-float';
        floatEl.innerText = '+' + Math.round(diffPct * gameState.targetScore / 100) + ' pts';
        const container = document.getElementById('progress-bar-container');
        if (container) {
            container.appendChild(floatEl);
            setTimeout(() => floatEl.remove(), 1300);
        }
    }
    fill.dataset.prevPct = pct;
    // Pulse when near target (75%+)
    fill.classList.toggle('high-pulse', pct >= 75 && pct < 100);
    const isComplete = pct >= 100;
    const wasComplete = fill.classList.contains('complete');
    fill.classList.toggle('complete', isComplete);
    // Completion sparkle burst when first hitting 100%
    if (isComplete && !wasComplete) {
        const container = document.getElementById('progress-bar-container');
        if (container) {
            const starChars = ['✦', '★', '●', '⁕', '✧'];
            for (let i = 0; i < 6; i++) {
                const sp = document.createElement('div');
                sp.style.cssText = `
                    position: absolute;
                    right: 0;
                    top: ${-4 + Math.random() * 16}px;
                    font-size: ${8 + Math.random() * 10}px;
                    color: ${['#ffd700', '#fff176', '#ffeb3b', '#4caf50'][i % 4]};
                    pointer-events: none;
                    z-index: 10;
                    animation: score-float-up 0.8s ease-out forwards;
                    animation-delay: ${i * 0.06}s;
                `;
                sp.innerText = starChars[i % starChars.length];
                container.appendChild(sp);
                setTimeout(() => sp.remove(), 1200);
            }
        }
    }

    // Progress bar milestone diamond markers at 25/50/75/100%
    const container = document.getElementById('progress-bar-container');
    if (container) {
        // Create milestone markers if they don't exist
        let milestoneContainer = container.querySelector('.milestone-container');
        if (!milestoneContainer) {
            milestoneContainer = document.createElement('div');
            milestoneContainer.className = 'milestone-container';
            milestoneContainer.style.cssText = 'position: absolute; inset: 0; pointer-events: none; z-index: 5;';
            const milestones = [25, 50, 75, 100];
            milestones.forEach(m => {
                const diamond = document.createElement('div');
                diamond.className = 'progress-milestone';
                diamond.dataset.milestone = m;
                diamond.style.left = m + '%';
                diamond.title = m + '%';
                milestoneContainer.appendChild(diamond);
            });
            container.appendChild(milestoneContainer);
        }
        // Update milestone states
        const diamonds = milestoneContainer.querySelectorAll('.progress-milestone');
        diamonds.forEach(d => {
            const milestoneVal = parseFloat(d.dataset.milestone);
            const wasReached = d.classList.contains('reached');
            const isReached = pct >= milestoneVal;
            if (isReached && !wasReached) {
                // Just crossed this milestone — pop it in
                d.classList.add('reached', 'pop');
                if (pct >= 100) d.classList.add('complete');
                setTimeout(() => d.classList.remove('pop'), 500);
                // Chunk ripple effect on the progress bar at the crossed position
                fill.classList.remove('chunk-ripple');
                void fill.offsetWidth;
                fill.classList.add('chunk-ripple');
                setTimeout(() => fill.classList.remove('chunk-ripple'), 600);
                // Scoreboard ripple effect
                const statsEl = document.getElementById('stats');
                if (statsEl && milestoneVal < 100) {
                    statsEl.classList.remove('scoreboard-ripple');
                    void statsEl.offsetWidth;
                    statsEl.classList.add('scoreboard-ripple');
                    setTimeout(() => statsEl.classList.remove('scoreboard-ripple'), 700);
                }
            } else if (isReached) {
                d.classList.add('reached');
                if (pct >= 100) {
                    d.classList.add('complete');
                    // Completion zap effect — single pulse when first reaching 100%
                    if (!fill.dataset.zapTriggered) {
                        fill.dataset.zapTriggered = '1';
                    }
                }
            } else {
                d.classList.remove('reached', 'complete');
                fill.dataset.zapTriggered = '0';
            }
        });
    }

    const bagCountBadge = document.getElementById('bag-count-badge');
    if (bagCountBadge) {
        const prev = bagCountBadge.innerText;
        bagCountBadge.innerText = gameState.bag.length;
        if (prev !== '' + gameState.bag.length) {
            bagCountBadge.classList.remove('bag-pulse');
            void bagCountBadge.offsetWidth;
            bagCountBadge.classList.add('bag-pulse');
        }
        // Set tooltip with distribution
        const badgeCounts = computeBagLetterCounts();
        const badgeTooltip = buildBagDistributionText(badgeCounts);
        bagCountBadge.title = badgeTooltip || 'Bag is empty';
    }

    renderInventory();
    renderBoard(onCellClick, renderUI);
    renderHand(onTileClick, renderUI);

    // Bag badge tooltip with distribution

    const drawer = document.getElementById('bag-drawer');
    if (drawer && drawer.classList.contains('open')) {
        renderBagDrawer();
    }
}

function onCellClick(x, y) {
    handleBoardClick(x, y, saveGame, renderUI);
}

function onTileClick(index) {
    if (gameState.selectedHandIndices.has(index)) {
        gameState.selectedHandIndices.delete(index);
    } else {
        gameState.selectedHandIndices.add(index);
    }
    renderUI();
}

function checkWinLoss() {
    if (gameState.score >= gameState.targetScore) {
        // Check if this was a boss round
        if (gameState.activeBoss) {
            const boss = BOSSES[gameState.activeBoss];
            if (boss) {
                showBossDefeat(boss);
                incrementWins();
                const stats = getStats();
                checkAchievements(gameState, stats, { roundWon: true, totalWords: stats.totalWords, bossDefeated: boss.id, defeatedBosses: [...gameState.defeatedBosses] });
                return;
            }
        }

        const bonus = gameState.handsLeft * 10;
        gameState.gold += bonus;
        audio.roundWin();
        if (bonus > 0) audio.goldEarned();
        saveGame();
        renderUI();
        document.getElementById('win-message').innerText = `Target reached! Bonus Gold: +${bonus}`;
        spawnConfetti();
        document.getElementById('win-modal').style.display = 'flex';

        incrementWins();

        // Check round-win achievements
        const stats = getStats();
        checkAchievements(gameState, stats, { roundWon: true, totalWords: stats.totalWords, defeatedBosses: [...gameState.defeatedBosses] });
    } else if (gameState.handsLeft <= 0) {
        document.getElementById('loss-modal').style.display = 'flex';
        audio.roundLoss();
    }
}

function setupEventListeners() {
    // ── Theme state (persisted across menu opens) ──────────────
    function toggleTheme() {
        const isLight = document.body.classList.toggle('theme-light');
        localStorage.setItem('scruggle_theme', isLight ? 'light' : 'dark');
    }
    const savedTheme = localStorage.getItem('scruggle_theme');
    if (savedTheme === 'light') {
        document.body.classList.add('theme-light');
    }

    // ── Keyboard shortcuts modal ───────────────────────────────
    const kbdModal = document.getElementById('kbd-shortcuts-modal');
    const closeKbdBtn = document.getElementById('close-kbd-btn');
    function openKbdModal() { if (kbdModal) kbdModal.style.display = 'flex'; }
    function closeKbdModal() { if (kbdModal) kbdModal.style.display = 'none'; }
    if (closeKbdBtn) closeKbdBtn.onclick = closeKbdModal;
    if (kbdModal) {
        kbdModal.addEventListener('click', (e) => {
            if (e.target === kbdModal) closeKbdModal();
        });
    }

    // ── Tutorial ───────────────────────────────────────────────
    // showTutorial() is imported; called directly from menu

    // ── Mute state (persisted) ─────────────────────────────────
    function toggleMute() {
        const muted = audio.toggle();
        // Update the menu item icon if it exists
        const soundItem = document.querySelector('.menu-item[data-action="sound"]');
        if (soundItem) soundItem.innerHTML = muted ? '🔇  Sound' : '🔊  Sound';
    }
    // Initialize mute state in menu item on open
    function updateSoundMenuItem() {
        const soundItem = document.querySelector('.menu-item[data-action="sound"]');
        if (soundItem) soundItem.innerHTML = audio.isMuted() ? '🔇  Sound' : '🔊  Sound';
    }

    // ── Drawer helpers (shared by all drawers) ─────────────────
    const backdrop = document.getElementById('drawer-backdrop');
    let openDrawers = new Set();
    function updateDrawerBackdrop() {
        if (!backdrop) return;
        if (openDrawers.size > 0) backdrop.classList.add('show');
        else backdrop.classList.remove('show');
    }
    function openDrawer(el) {
        el.classList.add('open');
        openDrawers.add(el);
        updateDrawerBackdrop();
    }
    function closeDrawer(el) {
        el.classList.remove('open');
        openDrawers.delete(el);
        updateDrawerBackdrop();
    }
    function toggleDrawer(el) {
        if (el.classList.contains('open')) closeDrawer(el);
        else openDrawer(el);
    }
    if (backdrop) {
        backdrop.addEventListener('click', () => {
            openDrawers.forEach(d => d.classList.remove('open'));
            openDrawers.clear();
            updateDrawerBackdrop();
        });
    }

    // ── Menu Drawer ────────────────────────────────────────────
    const menuDrawer = document.getElementById('menu-drawer');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    // Buttons that open the menu
    const openMenuStartBtn = document.getElementById('open-menu-start-btn');
    const menuGameBtn = document.getElementById('menu-btn');

    function openMenu() {
        // Show/hide context-sensitive items
        const inGame = document.getElementById('game-container').style.display === 'flex';
        const resetBtn = document.getElementById('menu-reset-btn');
        const returnBtn = document.getElementById('menu-return-btn');
        if (resetBtn) resetBtn.style.display = inGame ? '' : 'none';
        if (returnBtn) returnBtn.style.display = inGame ? '' : 'none';

        updateSoundMenuItem();
        openDrawer(menuDrawer);
    }

    if (openMenuStartBtn) openMenuStartBtn.onclick = openMenu;
    if (menuGameBtn) menuGameBtn.onclick = openMenu;
    if (closeMenuBtn) closeMenuBtn.onclick = () => closeDrawer(menuDrawer);

    // Menu item actions
    document.querySelectorAll('.menu-item[data-action]').forEach(item => {
        item.onclick = () => {
            const action = item.dataset.action;
            closeDrawer(menuDrawer);

            switch (action) {
                case 'stats':
                    renderStatsDrawer();
                    openDrawer(document.getElementById('stats-drawer'));
                    break;
                case 'achievements':
                    renderAchievementsList();
                    openDrawer(document.getElementById('achievements-drawer'));
                    break;
                case 'dictionary':
                    toggleDrawer(document.getElementById('dictionary-drawer'));
                    break;
                case 'shortcuts':
                    openKbdModal();
                    break;
                case 'tutorial':
                    showTutorial();
                    break;
                case 'sound':
                    toggleMute();
                    break;
                case 'theme':
                    toggleTheme();
                    break;
                case 'reset':
                    if (confirm("Reset current run?")) {
                        deleteSavedGame();
                        location.reload();
                    }
                    break;
                case 'return':
                    if (confirm("Return to main menu? Current progress will be saved.")) {
                        saveGame();
                        document.getElementById('game-container').style.display = 'none';
                        document.getElementById('start-screen').style.display = 'flex';
                        showStartScreen();
                    }
                    break;
            }
        };
    });

    // New Run Flow
    const newRunTriggerBtn = document.getElementById('new-run-trigger-btn');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const menuView = document.getElementById('main-menu-view');
    const bagView = document.getElementById('bag-selection-view');

    if (newRunTriggerBtn) {
        newRunTriggerBtn.onclick = () => {
            const hasSave = loadSavedGame();
            if (hasSave) {
                if (!confirm("Start a new run? This will overwrite your existing progress.")) return;
            }
            menuView.style.display = 'none';
            bagView.style.display = 'block';
            // User confirmed overwrite — treat as fresh even though save file still exists
            renderFontBagCards(false);
        };
    }

    if (backToMenuBtn) {
        backToMenuBtn.onclick = () => {
            bagView.style.display = 'none';
            menuView.style.display = 'block';
        };
    }

    const bagBtn = document.getElementById('view-bag-btn');
    const bagDrawer = document.getElementById('bag-drawer');
    const closeBagBtn = document.getElementById('close-bag-btn');

    if (bagBtn && bagDrawer) {
        bagBtn.onclick = () => {
            toggleDrawer(bagDrawer);
            if (bagDrawer.classList.contains('open')) {
                renderBagDrawer();
            }
        };
    }

    if (closeBagBtn && bagDrawer) {
        closeBagBtn.onclick = () => {
            closeDrawer(bagDrawer);
        };
    }

    document.getElementById('continue-run-btn').onclick = () => {
        if (loadSavedGame()) {
            document.getElementById('start-screen').style.display = 'none';
            document.getElementById('game-container').style.display = 'flex';
            renderUI();
        } else {
            alert("Error loading save file. Starting new run instead.");
            startNewRun();
        }
    };

    const startNewRun = async () => {
        // Show tutorial on first-ever game start
        if (!hasSeenTutorial()) {
            await showTutorial();
        }
        incrementRuns();
        initRound(true);
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('game-container').style.display = 'flex';
        renderUI();
    };

    document.getElementById('new-run-menu-btn').onclick = () => {
        startNewRun();
    };

    document.getElementById('submit-btn').onclick = async () => {
        const validation = validateBoard();
        if (!validation.allValid) {
            audio.invalidWord();
            const boardEl = document.getElementById('board');
            boardEl.classList.remove('board-shake', 'board-shake-enhanced');
            void boardEl.offsetWidth;
            boardEl.classList.add('board-shake', 'board-shake-enhanced');
            // Add camera jitter to game container
            const container = document.getElementById('game-container');
            if (container) {
                container.classList.remove('camera-shake');
                void container.offsetWidth;
                container.classList.add('camera-shake');
            }
            // Remove any existing flash overlay
            const existingFlash = document.querySelector('.shake-flash-overlay');
            if (existingFlash) existingFlash.remove();
            // Add full-page red flash overlay
            const flashOverlay = document.createElement('div');
            flashOverlay.className = 'shake-flash-overlay';
            document.body.appendChild(flashOverlay);
            setTimeout(() => {
                if (flashOverlay.parentNode) flashOverlay.remove();
            }, 500);
            // Pulse individual invalid tiles with red particle burst
            const invalidTiles = boardEl.querySelectorAll('.tile.invalid');
            invalidTiles.forEach(el => {
                el.classList.remove('invalid-shake');
                void el.offsetWidth;
                el.classList.add('invalid-shake');
                // Spawn red burst particles from each invalid tile
                const rect = el.getBoundingClientRect();
                const boardRect = boardEl.getBoundingClientRect();
                const cx = rect.left - boardRect.left + rect.width / 2;
                const cy = rect.top - boardRect.top + rect.height / 2;
                for (let i = 0; i < 4; i++) {
                    const p = document.createElement('div');
                    p.className = 'shake-particle';
                    const angle = (Math.PI * 2 / 4) * i + (Math.random() - 0.5) * 0.8;
                    const dist = 15 + Math.random() * 20;
                    const dx = Math.cos(angle) * dist;
                    const dy = Math.sin(angle) * dist;
                    p.style.cssText = `
                        left: ${cx}px;
                        top: ${cy}px;
                        background: hsl(${0 + Math.random() * 30}, 90%, ${50 + Math.random() * 30}%);
                        --sx: ${dx}px;
                        --sy: ${dy}px;
                    `;
                    p.style.setProperty('--sx', dx + 'px');
                    p.style.setProperty('--sy', dy + 'px');
                    boardEl.appendChild(p);
                }
            });
            setTimeout(() => {
                boardEl.classList.remove('board-shake', 'board-shake-enhanced');
                invalidTiles.forEach(el => el.classList.remove('invalid-shake'));
                boardEl.querySelectorAll('.shake-particle').forEach(el => el.remove());
                const container = document.getElementById('game-container');
                if (container) container.classList.remove('camera-shake');
            }, 600);
            return;
        }

        const words = findWords();
        let turnScore = 0;
        let turnGold = 0;
        let turnWordsCount = 0;
        const wordsData = [];

        words.forEach(w => {
            const hasNewTile = w.coords.some(c => !gameState.board[c.y][c.x].isLocked);
            if (!hasNewTile) return;

            turnWordsCount++;
            let sumLetters = 0;
            let wordMultiplier = 1;
            const tiles = [];
            const bonusTexts = [];

            w.coords.forEach(c => {
                const tile = gameState.board[c.y][c.x];
                let tileVal = tile.value;
                let multiplierBadge = null;

                if (tile.ink === 'fire') {
                    tileVal *= 2;
                    bonusTexts.push('🔥 Fire x2');
                }

                if (!tile.isLocked) {
                    const bonus = gameState.boardMultipliers[`${c.x},${c.y}`];
                    let tileContribution = tileVal;

                    if (bonus === 'DL') {
                        tileContribution = tileVal * 2;
                        multiplierBadge = 'DL';
                    } else if (bonus === 'TL') {
                        tileContribution = tileVal * 3;
                        multiplierBadge = 'TL';
                    } else if (bonus === 'NM') {
                        tileContribution = Math.ceil(tileVal / 2);
                        multiplierBadge = 'NM';
                    }
                    sumLetters += tileContribution;

                    if (bonus === 'DW') {
                        wordMultiplier *= 2;
                        bonusTexts.push('📘 DW x2');
                    } else if (bonus === 'TW') {
                        wordMultiplier *= 3;
                        bonusTexts.push('📗 TW x3');
                    } else if (bonus === 'QW') {
                        wordMultiplier *= 4;
                        bonusTexts.push('📕 QW x4');
                    }

                    if (bonus === 'GM') {
                        turnGold += tileVal;
                        bonusTexts.push(`🪙 GM +${tileVal}`);
                    }

                    if (tile.ink === 'gold') {
                        turnGold += 7;
                        bonusTexts.push('✨ Gold +7');
                    }
                    if (tile.ink === 'void') {
                        turnScore += 18;
                        bonusTexts.push('💜 Void +18');
                    }
                    if (tile.ink === 'prism') {
                        wordMultiplier += 1;
                        bonusTexts.push('🌈 Prism +1x');
                    }
                } else {
                    sumLetters += tileVal;
                }

                tiles.push({
                    letter: tile.letter,
                    value: tile.value,
                    playedValue: tileVal,
                    ink: tile.ink || null,
                    multiplierBadge,
                });
            });

            const finalWordScore = sumLetters * wordMultiplier;

            // ── Word Eater short-word bonus ────────────────────────────
            // During the Word Eater encounter (round 6), 2-3 letter words
            // get a flat +3 bonus. This bridges the gap between natural
            // short-word scoring (~5-12 pts) and what's needed to hit the
            // reduced target (85 in 4 hands = 21.25 pts/hand).
            // The bonus is applied as raw score (not multiplied by word mult)
            // so it rewards forming lots of small crosswords, not stacking
            // multipliers onto one word.
            // ────────────────────────────────────────────────────────────
            let shortWordBonus = 0;
            if (gameState.activeBoss === 'word_eater' && w.word.length >= 2 && w.word.length <= 3) {
                shortWordBonus = BOSSES.word_eater.shortWordBonus;
            }

            let wordGold = Math.floor(finalWordScore / 5);
            const wordContext = { word: w.word, wordGold, finalWordScore };
            triggerHook('onWordScored', wordContext);
            wordGold = wordContext.wordGold;

            // Build multiplier display text
            let multiplierText = null;
            if (wordMultiplier > 1) {
                const sources = [];
                w.coords.forEach(c => {
                    if (!gameState.board[c.y][c.x].isLocked) {
                        const b = gameState.boardMultipliers[`${c.x},${c.y}`];
                        if (b === 'DW' || b === 'TW' || b === 'QW') sources.push(b);
                    }
                });
                if (tiles.some(t => t.ink === 'prism')) sources.push('Prism');
                multiplierText = sources.length > 0 ? `${wordMultiplier} (${sources.join('+')})` : `${wordMultiplier}`;
            }

            wordsData.push({
                word: w.word,
                tiles,
                letterSum: sumLetters,
                wordMultiplier,
                multiplierText,
                wordScore: finalWordScore,
                wordGold,
                shortWordBonus: shortWordBonus > 0 ? shortWordBonus : null,
                bonusTexts: bonusTexts.length > 0 ? bonusTexts : null,
            });

            turnScore += finalWordScore + shortWordBonus;
            turnGold += wordGold;
        });

        const baseTurnScore = turnScore;
        const baseTurnGold = turnGold;

        const turnContext = { turnScore, turnGold };
        triggerHook('onTurnSubmitted', turnContext);
        turnScore = turnContext.turnScore;
        turnGold = turnContext.turnGold;

        // ── Combo / Streak Bonus ─────────────────────────────────────
        const baseComboLevel = gameState.combo;
        const comboMult = gameState.inventory.includes('combo_master') ? 2 : 1;
        const comboBonus = baseComboLevel * comboMult;
        if (comboBonus > 0) {
            turnScore += comboBonus;
        }
        gameState.combo++;
        // ─────────────────────────────────────────────────────────────

        // Combo / Streak bonus card (separate from bookmarks — combos aren't bookmarks)
        const bookmarkScoreDelta = turnScore - baseTurnScore - comboBonus;
        const bookmarkGoldDelta = turnGold - baseTurnGold;

        if (comboBonus > 0) {
            const fires = baseComboLevel >= 5 ? '🔥🔥🔥' : baseComboLevel >= 3 ? '🔥🔥' : '🔥';
            wordsData.push({
                word: 'Combo',
                tiles: [],
                letterSum: 0,
                wordMultiplier: 1,
                multiplierText: null,
                wordScore: 0,
                wordGold: 0,
                bonusTexts: [`${fires} Combo x${baseComboLevel} +${comboBonus}`],
            });
        }

        // Bookmark / item trigger summary card (only when actual bookmark or sticker effects changed totals)
        if (bookmarkScoreDelta > 0 || bookmarkGoldDelta > 0) {
            const diffParts = [];
            if (bookmarkScoreDelta > 0) diffParts.push(`📊 Score +${bookmarkScoreDelta}`);
            if (bookmarkGoldDelta > 0) diffParts.push(`🪙 Gold +${bookmarkGoldDelta}`);
            wordsData.push({
                word: 'Bookmarks',
                tiles: [],
                letterSum: 0,
                wordMultiplier: 1,
                multiplierText: null,
                wordScore: 0,
                wordGold: 0,
                bonusTexts: ['🔖 ' + diffParts.join(', ')],
            });
        }

        gameState.score += turnScore;
        gameState.gold += turnGold;
        gameState.handsLeft--;

        audio.wordSubmit();
        if (turnGold > 0) audio.goldEarned();

        // Boss mechanic: Gilded Golem doubles gold
        if (gameState.activeBoss === 'gilded_golem') {
            const doubledGold = turnGold;
            gameState.gold += doubledGold;
        }

        // Boss mechanic: The Time Warp triples gold
        if (gameState.activeBoss === 'time_warp') {
            const tripledGold = turnGold * 2;
            gameState.gold += tripledGold;
        }

        updateStats(gameState.currentRound, turnGold, turnWordsCount);

        // Record submission history
        const handNum = 4 - gameState.handsLeft;
        recordSubmission(wordsData, gameState.currentRound, handNum);

        // Track cumulative ink types and bookmark types used
        const curStats = getStats();
        const allInks = new Set(curStats.inksUsed || []);
        const allBookmarks = new Set(curStats.bookmarksUsed || []);
        [...gameState.hand, ...gameState.bag, ...gameState.board.flat().filter(Boolean)].forEach(t => {
            if (t.ink) allInks.add(t.ink);
        });
        gameState.inventory.forEach(id => {
            if (bookmarksRegistry[id]) allBookmarks.add(id);
        });
        if (allInks.size > (curStats.inksUsed?.length || 0) || allBookmarks.size > (curStats.bookmarksUsed?.length || 0)) {
            curStats.inksUsed = [...allInks];
            curStats.bookmarksUsed = [...allBookmarks];
            localStorage.setItem('scruggle_stats', JSON.stringify(curStats));
        }

        // Check achievements after submission
        const stats = getStats();
        checkAchievements(gameState, stats, { totalWords: stats.totalWords, turnScore });

        // Boss mechanic: Word Eater — collect tiles from 4+ letter words to remove
        let eatenTiles = new Set();
        if (gameState.activeBoss === 'word_eater') {
            words.forEach(w => {
                const hasNewTile = w.coords.some(c => !gameState.board[c.y][c.x].isLocked);
                if (hasNewTile && BOSSES.word_eater.shouldEatWord(w.word)) {
                    w.coords.forEach(c => {
                        if (!gameState.board[c.y][c.x].isLocked) {
                            eatenTiles.add(`${c.x},${c.y}`);
                        }
                    });
                }
            });
        }

        // Boss mechanic: The Mirror — capture NEWLY PLACED (unlocked) tile positions
        // BEFORE the lock loop, since locking sets isLocked=true and the Mirror
        // needs to know which tiles were just placed this submission.
        let mirrorNewTiles = [];
        if (gameState.activeBoss === 'the_mirror') {
            for (let y = 0; y < GRID_SIZE; y++) {
                for (let x = 0; x < GRID_SIZE; x++) {
                    const tile = gameState.board[y][x];
                    if (tile && !tile.isLocked) {
                        mirrorNewTiles.push({ x, y, letter: tile.letter, value: tile.value });
                    }
                }
            }
        }

        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const tile = gameState.board[y][x];
                if (tile && !tile.isLocked) {
                    // Word Eater: remove tiles from eaten words
                    if (eatenTiles.has(`${x},${y}`)) {
                        gameState.board[y][x] = null;
                    // Boss: The Void — all non-locked tiles are consumed
                    } else if (gameState.activeBoss === 'the_void') {
                        gameState.board[y][x] = null;
                    } else if (tile.ink === 'void') {
                        gameState.board[y][x] = null;
                    } else if (tile.ink === 'ice') {
                        tile.ink = null; // Melts, stays unlocked!
                    } else if (tile.ink === 'growth') {
                        tile.value += 1;
                        tile.isLocked = true;
                    } else if (tile.ink === 'steel') {
                        tile.isLocked = false; // Stays unlocked!
                    } else {
                        tile.isLocked = true;
                    }
                }
            }
        }
        drawTiles();

        // Boss mechanic: The Mirror — place mirrored tiles at opposite positions
        // (using positions captured BEFORE the lock loop above)
        let mirrorResult = null;
        if (gameState.activeBoss === 'the_mirror' && mirrorNewTiles.length > 0) {
            const mirroredPairs = [];
            for (const nt of mirrorNewTiles) {
                const mx = 6 - nt.x;
                const my = 6 - nt.y;
                if (!gameState.board[my][mx]) {
                    mirroredPairs.push({ from: { x: nt.x, y: nt.y }, to: { x: mx, y: my } });
                }
            }
            for (const pair of mirroredPairs) {
                gameState.board[pair.to.y][pair.to.x] = {
                    letter: pair.from.letter,
                    value: pair.from.value,
                    isLocked: false
                };
            }
            mirrorResult = {
                message: mirroredPairs.length > 0
                    ? `🪞 Mirror reflects ${mirroredPairs.length} tile${mirroredPairs.length > 1 ? 's' : ''}!`
                    : null
            };
        }

        drawTiles();

        // Boss mechanic: Ink Thief steals tiles AFTER drawing (before save/render)
        let bossMessage = '';
        if (gameState.activeBoss === 'ink_thief') {
            const result = BOSSES.ink_thief.onSubmission(gameState);
            if (result.message) bossMessage = result.message;
            // Refill hand from bag after theft so player isn't stuck with 5 tiles
            drawTiles();
        }

        saveGame();
        renderUI();

        // Boss mechanic: The Void consumes all
        if (gameState.activeBoss === 'the_void') {
            bossMessage = '🕳️ The Void consumed this submission\'s tiles!';
        }

        // Boss mechanic: The Mirror reflection message (reuse result from above)
        if (gameState.activeBoss === 'the_mirror' && mirrorResult && mirrorResult.message) {
            bossMessage = mirrorResult.message;
        }

        // Show the scoring animation
        if (wordsData.length > 0) {
            await showScoringAnimation(wordsData, turnScore, turnGold, bossMessage || null, baseComboLevel);
            // Flash scored tiles after animation closes
            const scoredTiles = document.querySelectorAll('#board .tile.locked');
            if (scoredTiles.length > 0) {
                scoredTiles.forEach(el => el.classList.add('word-highlight'));
                setTimeout(() => {
                    document.querySelectorAll('#board .tile.word-highlight').forEach(el => {
                        el.classList.remove('word-highlight');
                    });
                }, 1800);
            }
        } else {
            // No new words scored — skip animation
            if (bossMessage) alert(bossMessage);
        }
        checkWinLoss();
    };

    document.getElementById('swap-btn').onclick = () => {
        if (gameState.selectedHandIndices.size === 0) return;

        const discardCost = gameState.selectedHandIndices.size;
        if (gameState.discardsLeft < discardCost) return;

        gameState.discardsLeft -= discardCost;

        const indices = Array.from(gameState.selectedHandIndices).sort((a, b) => b - a);
        const discardedTiles = [];
        indices.forEach(idx => {
            const tile = gameState.hand.splice(idx, 1)[0];
            tile.isLocked = false;
            discardedTiles.push(tile);
        });
        gameState.selectedHandIndices.clear();

        // Fire Recycler bookmark: +1 gold per discarded tile
        if (gameState.inventory.includes('recycler') && discardedTiles.length > 0) {
            gameState.gold += discardedTiles.length;
        }

        // Draw replacement tiles
        drawTiles();

        // Discarded tiles go into the discard pool — gone for the rest of the round
        gameState.discardPool.push(...discardedTiles);

        // Combo reset — swapping tiles breaks the streak
        gameState.combo = 0;

        saveGame();
        renderUI();
    };

    const shuffleHandBtn = document.getElementById('shuffle-hand-btn');
    if (shuffleHandBtn) {
        shuffleHandBtn.onclick = () => {
            shuffle(gameState.hand);
            gameState.selectedHandIndices.clear();
            saveGame();
            renderUI();
        };
    }

    const sortHandBtn = document.getElementById('sort-hand-btn');
    if (sortHandBtn) {
        sortHandBtn.onclick = () => {
            gameState.hand.sort((a, b) => a.letter.localeCompare(b.letter));
            gameState.selectedHandIndices.clear();
            saveGame();
            renderUI();
        };
    }

    document.getElementById('next-round-btn').onclick = () => {
        document.getElementById('win-modal').style.display = 'none';
        // Show round transition screen
        const trans = document.getElementById('round-transition');
        document.getElementById('trans-round').innerText = gameState.currentRound;
        document.getElementById('trans-gold').innerText = gameState.gold;
        document.getElementById('trans-items').innerText = gameState.inventory.length;
        trans.classList.add('show');
    };

    document.getElementById('trans-continue-btn').onclick = () => {
        document.getElementById('round-transition').classList.remove('show');
        openShop((itemId) => buyItem(itemId, saveGame, renderUI));
    };

    document.getElementById('start-round-btn').onclick = () => {
        document.getElementById('shop-screen').style.display = 'none';
        document.getElementById('game-container').style.display = 'flex';
        initRound(false);
        renderUI();
    };

    document.getElementById('new-run-btn').onclick = () => {
        document.getElementById('loss-modal').style.display = 'none';
        deleteSavedGame();
        showStartScreen();
    };

    // Scoring animation continue button
    document.getElementById('scoring-continue-btn').onclick = () => {
        closeScoringAnimation();
    };

    // Inventory drawer
    const invDrawer = document.getElementById('inventory-drawer');
    document.getElementById('view-inv-btn').onclick = () => {
        if (invDrawer) {
            const itemsEl = document.getElementById('inventory-drawer-items');
            itemsEl.innerHTML = '';
            if (gameState.inventory.length === 0) {
                itemsEl.innerHTML = '<div style="text-align: center; color: #888; padding: 30px 0; font-family: Georgia, serif;">Your inventory is empty. Visit the shop to buy items!</div>';
            } else {
                gameState.inventory.forEach((itemId) => {
                    const item = shopItems.find(i => i.id === itemId);
                    if (item) {
                        const div = document.createElement('div');
                        div.style.cssText = 'padding: 10px 12px; margin-bottom: 6px; border-radius: 6px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; gap: 10px;';
                        const icon = itemId.startsWith('sticker_') ? '🏷️' : itemId.startsWith('pack_') ? '🎨' : itemId === 'buy_letter' ? '📦' : '🔖';
                        div.innerHTML = `<span style="font-size: 20px;">${icon}</span><div><div style="font-weight: bold; color: var(--parchment); font-size: 14px;">${item.name}</div><div style="color: #888; font-size: 11px;">${item.desc}</div></div>`;
                        itemsEl.appendChild(div);
                    }
                });
            }
            invDrawer.classList.add('open');
            openDrawers.add(invDrawer);
            updateDrawerBackdrop();
        }
    };
    document.getElementById('close-inv-btn').onclick = () => {
        if (invDrawer) {
            closeDrawer(invDrawer);
        }
    };

    // Achievement unlock listener
    document.addEventListener('achievement-unlocked', () => {
        audio.achievementUnlock();
    });

    // Boss intro "Fight" button
    const bossFightBtn = document.getElementById('boss-intro-fight-btn');
    if (bossFightBtn) {
        bossFightBtn.onclick = () => {
            document.getElementById('boss-intro-screen').style.display = 'none';
            document.getElementById('game-container').style.display = 'flex';

            // NOTE: boss.onBossStart() is NOT called here because it was
            // already called in initRound() before showBossIntro(). Calling
            // it again would double-apply state changes (e.g. Gilded Golem
            // would multiply target by 1.5x twice = 2.25x total). This was
            // a bug — see the initRound function for the single call.
            renderUI();
        };
    }

    // Boss defeat "Continue" button
    const bossDefeatBtn = document.getElementById('boss-defeat-continue-btn');
    if (bossDefeatBtn) {
        bossDefeatBtn.onclick = () => {
            document.getElementById('boss-defeat-screen').style.display = 'none';
            // Show round transition screen
            const trans = document.getElementById('round-transition');
            document.getElementById('trans-round').innerText = gameState.currentRound;
            document.getElementById('trans-gold').innerText = gameState.gold;
            document.getElementById('trans-items').innerText = gameState.inventory.length;
            trans.classList.add('show');
        };
    }

    // Escape key checks kbdModal via closeKbdModal from setupEventListeners

    // ===== Global Keyboard Shortcuts =====
    function closeAllModalsAndDrawers() {
        // Close modals
        const modals = ['win-modal', 'loss-modal', 'kbd-shortcuts-modal', 'scoring-animation',
            'boss-intro-screen', 'boss-defeat-screen', 'round-transition', 'shop-screen'];
        modals.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        // Close drawer backdrop + all drawers
        if (backdrop) {
            document.querySelectorAll('.drawer.open').forEach(d => d.classList.remove('open'));
            openDrawers.clear();
            updateDrawerBackdrop();
        }
    }

    document.addEventListener('keydown', (e) => {
        // Don't intercept if user is typing in an input/textarea
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

        // Don't fire on repeated key holds
        if (e.repeat) return;

        const gameContainer = document.getElementById('game-container');
        const gameVisible = gameContainer && gameContainer.style.display !== 'none';

        const key = e.key;
        const code = e.code || e.key;

        // Escape: close modals/drawers (always works, even on menu)
        if (key === 'Escape') {
            if (kbdModal && kbdModal.style.display === 'flex') {
                closeKbdModal();
                e.preventDefault();
                return;
            }
            // If scoring animation is showing, close it properly
            const scoring = document.getElementById('scoring-animation');
            if (scoring && scoring.style.display !== 'none') {
                closeScoringAnimation();
                e.preventDefault();
                return;
            }
            if (gameVisible) {
                closeAllModalsAndDrawers();
                e.preventDefault();
            }
            return;
        }

        // ? — open keyboard shortcuts help (works from start screen AND game)
        if (key === '?' || key === '/') {
            openKbdModal();
            e.preventDefault();
            return;
        }

        // Only game shortcuts apply when game container is visible
        if (!gameVisible) return;

        // Tab: cycle through hand tiles
        if (key === 'Tab') {
            e.preventDefault();
            if (gameState.hand.length === 0) return;
            gameState.selectedHandIndices.clear();
            gameState.kbdFocusedHandIndex++;
            if (gameState.kbdFocusedHandIndex >= gameState.hand.length) {
                gameState.kbdFocusedHandIndex = 0;
            }
            gameState.selectedHandIndices.add(gameState.kbdFocusedHandIndex);
            renderUI();
            return;
        }

        // Number keys 1-7: select hand tile by position (1-indexed)
        if (key >= '1' && key <= '7') {
            e.preventDefault();
            const idx = parseInt(key, 10) - 1;
            if (idx < gameState.hand.length) {
                gameState.kbdFocusedHandIndex = idx;
                if (e.shiftKey) {
                    // Shift + number: multi-select (toggle)
                    onTileClick(idx);
                } else {
                    // Single select
                    gameState.selectedHandIndices.clear();
                    gameState.selectedHandIndices.add(idx);
                    renderUI();
                }
            }
            return;
        }

        // Enter / Space: submit word
        if (key === 'Enter' || key === ' ') {
            e.preventDefault();
            const submitBtn = document.getElementById('submit-btn');
            if (submitBtn && !submitBtn.disabled) {
                submitBtn.click();
            }
            return;
        }

        // Backspace: remove last placed tile
        if (key === 'Backspace') {
            e.preventDefault();
            removeLastPlacedTile();
            return;
        }

        // R: shuffle hand
        if (key === 'r' || key === 'R') {
            e.preventDefault();
            const shuffleBtn = document.getElementById('shuffle-hand-btn');
            if (shuffleBtn) shuffleBtn.click();
            return;
        }

        // M: mute/unmute
        if (key === 'm' || key === 'M') {
            e.preventDefault();
            const muteBtn = document.getElementById('mute-btn');
            if (muteBtn) muteBtn.click();
            return;
        }

        // S: sort hand alphabetically
        if (key === 's' || key === 'S') {
            e.preventDefault();
            const sortBtn = document.getElementById('sort-hand-btn');
            if (sortBtn) sortBtn.click();
            return;
        }
    });
}

function removeLastPlacedTile() {
    // Find the non-locked tile closest to bottom-right (most recently placed)
    for (let y = GRID_SIZE - 1; y >= 0; y--) {
        for (let x = GRID_SIZE - 1; x >= 0; x--) {
            const tile = gameState.board[y][x];
            if (tile && !tile.isLocked) {
                if (gameState.hand.length < gameState.handSize) {
                    // Reset animation flags so tile re-animates when placed again
                    delete tile._animPlaced;
                    delete tile._animHandEnter;
                    gameState.hand.push(tile);
                    gameState.board[y][x] = null;
                    gameState.selectedHandIndices.clear();
                    saveGame();
                    renderUI();
                }
                return;
            }
        }
    }
}

function renderAchievementsList() {
    const listEl = document.getElementById('achievements-list');
    const countEl = document.getElementById('ach-unlocked-count');
    if (!listEl) return;

    const { achievements, isUnlocked, getUnlockedCount } = requireAchievements();
    const unlocked = isUnlocked;
    const totalCount = getUnlockedCount();

    if (countEl) countEl.innerText = `(${totalCount}/${achievements.length})`;

    listEl.innerHTML = '';
    for (const ach of achievements) {
        const unlocked = isUnlocked(ach.id);
        const div = document.createElement('div');
        div.style.cssText = `
            display: flex; align-items: center; gap: 12px; padding: 10px 12px;
            margin-bottom: 6px; border-radius: 6px; background: ${unlocked ? 'rgba(0,255,136,0.08)' : 'rgba(255,255,255,0.03)'};
            border: 1px solid ${unlocked ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.05)'};
            opacity: ${unlocked ? '1' : '0.5'};
        `;
        div.innerHTML = `
            <span style="font-size: 24px;">${ach.icon}</span>
            <div>
                <div style="font-weight: bold; color: ${unlocked ? '#00ff88' : '#aaa'}; font-size: 14px;">${ach.name}</div>
                <div style="color: #888; font-size: 11px;">${ach.desc}</div>
            </div>
            ${unlocked ? '<span style="margin-left: auto; color: #00ff88; font-size: 18px;">✓</span>' : ''}
        `;
        listEl.appendChild(div);
    }
}

function requireAchievements() {
    // Dynamic import to avoid circular dependency at module level
    return {
        achievements: [
            { id: 'first_word', name: 'First Word', desc: 'Submit your first word', icon: '📝' },
            { id: 'golden', name: 'Golden', desc: 'Earn 50 total gold', icon: '🪙' },
            { id: 'centurion', name: 'Centurion', desc: 'Score 100+ points in a single round', icon: '💯' },
            { id: 'wordsmith', name: 'Wordsmith', desc: 'Submit 50 total words', icon: '📚' },
            { id: 'high_roller', name: 'High Roller', desc: 'Hold 200+ gold at once', icon: '💰' },
            { id: 'bibliophile', name: 'Bibliophile', desc: 'Own 5+ bookmarks', icon: '🔖' },
            { id: 'ink_master', name: 'Ink Master', desc: 'Apply all 7 ink types in one run', icon: '🎨' },
            { id: 'speed_run', name: 'Speed Run', desc: 'Win a round in 3 or fewer hands', icon: '⚡' },
            { id: 'marathon', name: 'Marathon', desc: 'Reach round 5', icon: '🏃' },
            { id: 'perfectionist', name: 'Perfectionist', desc: 'Win a round with 4 hands remaining', icon: '✨' },
            { id: 'collector', name: 'Collector', desc: 'Own every sticker type', icon: '🏆' },
            { id: 'first_win', name: 'First Victory', desc: 'Win your first round', icon: '🎉' },
        ],
        isUnlocked: (id) => {
            try {
                const saved = JSON.parse(localStorage.getItem('scruggle_achievements') || '[]');
                return saved.includes(id);
            } catch { return false; }
        },
        getUnlockedCount: () => {
            try {
                return JSON.parse(localStorage.getItem('scruggle_achievements') || '[]').length;
            } catch { return 0; }
        }
    };
}

function spawnConfetti() {
    const container = document.getElementById('win-confetti-container');
    if (!container) return;
    container.innerHTML = '';
    const count = 120;
    const palettes = [
        [0, 10, 20, 350],         // Reds & magentas
        [40, 48, 55, 60],          // Yellows & golds
        [100, 120, 140, 160],      // Greens
        [190, 205, 220, 235],      // Blues & cyans
        [270, 285, 300, 315],      // Purples
        [330, 340, 350, 355],      // Pinks
        [15, 25, 35],              // Oranges
        [170, 180, 195],           // Teals
    ];
    for (let i = 0; i < count; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        const palette = palettes[i % palettes.length];
        const hue = palette[Math.floor(Math.random() * palette.length)];
        const size = 5 + Math.floor(Math.random() * 12);
        const x = Math.random() * 100;
        const y = 60 + Math.random() * 160;
        const drift = (Math.random() - 0.5) * 140;
        const dur = 1.5 + Math.random() * 2.0;
        const del = Math.random() * 1.5;
        const spin = 180 + Math.floor(Math.random() * 1080);
        piece.style.cssText = `
            --x: ${x}%;
            --y: ${y}px;
            --hue: ${hue};
            --size: ${size}px;
            --drift: ${drift}px;
            --dur: ${dur}s;
            --del: ${del}s;
            --spin: ${spin}deg;
        `;
        container.appendChild(piece);
    }
    // Add sparkle burst at confetti origin
    const burstCount = 16;
    for (let i = 0; i < burstCount; i++) {
        const spark = document.createElement('div');
        spark.className = 'confetti-sparkle';
        const angle = (Math.PI * 2 / burstCount) * i + (Math.random() - 0.5) * 0.5;
        const dist = 20 + Math.random() * 40;
        const sx = Math.cos(angle) * dist;
        const sy = Math.sin(angle) * dist;
        const hue = [330, 50, 190, 270][i % 4];
        spark.style.cssText = `
            left: 50%;
            top: 30%;
            color: hsl(${hue}, 90%, 70%);
            --sx: ${sx}px;
            --sy: ${sy}px;
            animation-delay: ${Math.random() * 0.3}s;
        `;
        container.appendChild(spark);
    }
    setTimeout(() => {
        if (container) container.innerHTML = '';
    }, 5000);
}

// Start the game!
init();
