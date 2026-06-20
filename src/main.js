import {
    gameState, GRID_SIZE, letterDist, shopItems, CLASSIC_MULTIPLIERS,
    saveGame, loadSavedGame, deleteSavedGame, FONT_BAGS, triggerHook, shuffle, getSwapCost
} from './state.js';
import { getStats, updateStats, incrementRuns, incrementWins, getPlayerTitle, getTitleEmoji } from './stats.js';
import { loadDictionary, validateBoard, findWords } from './rules.js';
import {
    renderInventory, renderBoard, renderHand, handleBoardClick,
    renderBagDrawer, createTileUI
} from './board.js';
import { openShop, buyItem } from './shop.js';
import { loadAchievements, checkAchievements, getUnlockedCount } from './achievements.js';
import { BOSSES, getBossForRound, applyBossReward } from './bosses.js';

async function init() {
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
    const inks = ['fire', 'ice', 'gold', 'void', null, null, null, null];
    const letters = title.split('');

    let draggedTitleTile = null;

    letters.forEach((letter, i) => {
        const ink = inks[Math.floor(Math.random() * inks.length)];
        // Use standard Scrabble values for the title letters
        const distribution = FONT_BAGS.standard.distribution;
        const val = distribution[letter] ? distribution[letter].val : 1;

        const tile = { letter, value: val, ink };
        const tileEl = createTileUI(tile);
        tileEl.classList.add('title-tile');
        // Add a slight random rotation for tabletop feel
        const rot = (Math.random() * 6 - 3).toFixed(1);
        tileEl.style.transform += ` rotate(${rot}deg)`;

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

    const optionsContainer = document.getElementById('font-bag-options');
    if (optionsContainer) {
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

    // Ensure main menu is visible, bag selection is hidden
    document.getElementById('main-menu-view').style.display = 'block';
    document.getElementById('bag-selection-view').style.display = 'none';
    document.getElementById('start-screen').style.display = 'flex';
    document.getElementById('game-container').style.display = 'none';
}

function setupDictionarySearch() {
    const input = document.getElementById('dict-search');
    const results = document.getElementById('dict-results');
    if (!input || !results) return;

    let debounceTimer;
    input.oninput = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = input.value.trim().toUpperCase();
            if (query.length < 3) {
                results.innerHTML = '<p style="opacity: 0.7; font-style: italic; font-size: 14px;">Search over 270,000 valid words (min 3 chars).</p>';
                return;
            }

            results.innerHTML = '<p style="opacity: 0.7;">Searching...</p>';

            // Search the Set
            const matches = [];
            for (const word of gameState.dictionary) {
                if (word.startsWith(query)) {
                    matches.push(word);
                    if (matches.length >= 100) break;
                }
            }

            if (matches.length === 0) {
                results.innerHTML = '<p style="opacity: 0.7;">No matches found.</p>';
            } else {
                results.innerHTML = matches.map(w => `<div>${w}</div>`).join('');
            }
        }, 150);
    };
}

function initRound(isNewRun) {
    gameState.score = 0;
    if (isNewRun) {
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

    gameState.targetScore = gameState.currentRound * 30;
    if (gameState.goldenTicket) {
        gameState.targetScore = Math.ceil(gameState.targetScore / 2);
        gameState.goldenTicket = false;
    }
    gameState.handsLeft = 4;
    gameState.discardsLeft = 3;

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

    shuffle(gameState.bag);
    drawTiles();

    // Check for boss encounter (non-new-run rounds only)
    const boss = getBossForRound(gameState.currentRound, gameState.defeatedBosses);
    if (boss) {
        gameState.activeBoss = boss.id;
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
}

function drawTiles() {
    while (gameState.hand.length < gameState.handSize && gameState.bag.length > 0) {
        gameState.hand.push(gameState.bag.pop());
    }
}

function renderUI() {
    document.getElementById('score').innerText = gameState.score;
    document.getElementById('gold').innerText = gameState.gold;
    document.getElementById('bag-count').innerText = gameState.bag.length;
    document.getElementById('round').innerText = gameState.currentRound;
    document.getElementById('target').innerText = gameState.targetScore;
    document.getElementById('hands').innerText = gameState.handsLeft;
    document.getElementById('discards').innerText = gameState.discardsLeft;

    const bagCountBadge = document.getElementById('bag-count-badge');
    if (bagCountBadge) {
        bagCountBadge.innerText = gameState.bag.length;
    }

    renderInventory();
    renderBoard(onCellClick, renderUI);
    renderHand(onTileClick, renderUI);

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
                checkAchievements(gameState, stats, { roundWon: true, totalWords: stats.totalWords, bossDefeated: boss.id });
                return;
            }
        }

        const bonus = gameState.handsLeft * 10;
        gameState.gold += bonus;
        saveGame();
        renderUI();
        document.getElementById('win-message').innerText = `Target reached! Bonus Gold: +${bonus}`;
        document.getElementById('win-modal').style.display = 'flex';

        incrementWins();

        // Check round-win achievements
        const stats = getStats();
        checkAchievements(gameState, stats, { roundWon: true, totalWords: stats.totalWords });
    } else if (gameState.handsLeft <= 0) {
        document.getElementById('loss-modal').style.display = 'flex';
    }
}

function setupEventListeners() {
    // Menu Drawers
    const openStatsBtn = document.getElementById('open-stats-btn');
    const statsDrawer = document.getElementById('stats-drawer');
    const closeStatsBtn = document.getElementById('close-stats-btn');

    const openDictBtn = document.getElementById('open-dict-btn');
    const openDictGameBtn = document.getElementById('view-dict-game-btn');
    const dictDrawer = document.getElementById('dictionary-drawer');
    const closeDictBtn = document.getElementById('close-dict-btn');

    if (openStatsBtn && statsDrawer) {
        openStatsBtn.onclick = () => statsDrawer.classList.add('open');
    }
    if (closeStatsBtn && statsDrawer) {
        closeStatsBtn.onclick = () => statsDrawer.classList.remove('open');
    }

    // Achievements Drawer
    const openAchBtn = document.getElementById('open-ach-btn');
    const achDrawer = document.getElementById('achievements-drawer');
    const closeAchBtn = document.getElementById('close-ach-btn');
    if (openAchBtn && achDrawer) {
        openAchBtn.onclick = () => {
            renderAchievementsList();
            achDrawer.classList.add('open');
        };
    }
    if (closeAchBtn && achDrawer) {
        closeAchBtn.onclick = () => achDrawer.classList.remove('open');
    }

    const toggleDict = () => dictDrawer.classList.toggle('open');
    if (openDictBtn) openDictBtn.onclick = toggleDict;
    if (openDictGameBtn) openDictGameBtn.onclick = toggleDict;
    if (closeDictBtn) closeDictBtn.onclick = () => dictDrawer.classList.remove('open');

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
            bagDrawer.classList.toggle('open');
            if (bagDrawer.classList.contains('open')) {
                renderBagDrawer();
            }
        };
    }

    if (closeBagBtn && bagDrawer) {
        closeBagBtn.onclick = () => {
            bagDrawer.classList.remove('open');
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

    const startNewRun = () => {
        incrementRuns();
        initRound(true);
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('game-container').style.display = 'flex';
        renderUI();
    };

    document.getElementById('new-run-menu-btn').onclick = () => {
        startNewRun();
    };

    document.getElementById('submit-btn').onclick = () => {
        const validation = validateBoard();
        if (!validation.allValid) {
            alert(validation.reason || "Invalid board placement.");
            return;
        }

        const words = findWords();
        let turnScore = 0;
        let turnGold = 0;
        let turnWordsCount = 0;
        let breakdownHTML = '';

        words.forEach(w => {
            const hasNewTile = w.coords.some(c => !gameState.board[c.y][c.x].isLocked);
            if (hasNewTile) {
                turnWordsCount++;
                let sumLetters = 0;
                let wordMultiplier = 1;
                let wordDetailsHTML = `<div style="border: 2px solid rgba(90,46,23,0.15); border-radius: 8px; padding: 12px; margin-bottom: 15px; background-color: rgba(255,255,255,0.3); font-family: 'Georgia', serif;">`;
                wordDetailsHTML += `<h3 style="margin: 0 0 10px 0; color: var(--mahogany); display: flex; justify-content: space-between;">Word: <span style="font-size: 20px; font-weight: 900; letter-spacing: 1px;">${w.word}</span></h3>`;

                let lettersCalc = [];
                let inksList = [];
                let boardMultsList = [];

                w.coords.forEach(c => {
                    const tile = gameState.board[c.y][c.x];
                    let tileVal = tile.value;
                    let initialVal = tileVal;
                    let letterLabel = `<strong>${tile.letter}</strong> (${initialVal}`;

                    if (tile.ink === 'fire') {
                        tileVal *= 2;
                        letterLabel += ` x2 Fire Ink = ${tileVal}`;
                    }
                    letterLabel += `)`;

                    if (!tile.isLocked) {
                        const bonus = gameState.boardMultipliers[`${c.x},${c.y}`];
                        let tileContribution = tileVal;

                        if (bonus === 'DL') {
                            tileContribution = tileVal * 2;
                            boardMultsList.push(`${tile.letter} (DL multiplier: +${tileVal} pts)`);
                        } else if (bonus === 'TL') {
                            tileContribution = tileVal * 3;
                            boardMultsList.push(`${tile.letter} (TL multiplier: +${tileVal * 2} pts)`);
                        }
                        sumLetters += tileContribution;

                        if (bonus === 'DW') {
                            wordMultiplier *= 2;
                            boardMultsList.push(`DW multiplier (x2)`);
                        } else if (bonus === 'TW') {
                            wordMultiplier *= 3;
                            boardMultsList.push(`TW multiplier (x3)`);
                        } else if (bonus === 'QW') {
                            wordMultiplier *= 4;
                            boardMultsList.push(`QW multiplier (x4)`);
                        }

                        if (bonus === 'GM') {
                            turnGold += tileVal;
                            inksList.push(`GM Sticker (+${tileVal} Gold)`);
                        }

                        if (tile.ink === 'gold') {
                            turnGold += 5;
                            inksList.push(`Gold Ink (+5 Gold)`);
                        }
                        if (tile.ink === 'void') {
                            turnScore += 15;
                            inksList.push(`Void Ink (+15 Score)`);
                        }
                        if (tile.ink === 'prism') {
                            wordMultiplier += 1;
                            inksList.push(`Prism Ink (+1 Multiplier)`);
                        }
                    } else {
                        sumLetters += tileVal;
                    }
                    lettersCalc.push(letterLabel);
                });

                const finalWordScore = sumLetters * wordMultiplier;
                wordDetailsHTML += `<div style="font-size: 14px; color: var(--tile-text); display: flex; flex-direction: column; gap: 5px;">`;
                wordDetailsHTML += `<div><strong>Tile Values:</strong> ${lettersCalc.join(' + ')}</div>`;

                if (boardMultsList.length > 0) {
                    wordDetailsHTML += `<div><strong>Board Multipliers:</strong> ${boardMultsList.join(', ')}</div>`;
                }
                if (inksList.length > 0) {
                    wordDetailsHTML += `<div><strong>Ink & Sticker Bonuses:</strong> ${inksList.join(', ')}</div>`;
                }

                wordDetailsHTML += `<div style="margin-top: 5px; border-top: 1px dashed rgba(90,46,23,0.1); padding-top: 5px;"><strong>Calculation:</strong> ${sumLetters} pts x ${wordMultiplier} word multiplier = <span style="font-weight: bold; color: var(--mahogany);">${finalWordScore} pts</span></div>`;

                let wordGold = Math.floor(finalWordScore / 5);
                wordDetailsHTML += `<div><strong>Base Gold:</strong> Math.floor(${finalWordScore} / 5) = +${wordGold} Gold</div>`;

                const wordContext = { word: w.word, wordGold, finalWordScore };
                triggerHook('onWordScored', wordContext);

                if (wordContext.wordGold !== wordGold) {
                    wordDetailsHTML += `<div style="color: #7b1fa2; font-weight: bold;"><strong>Bookmark Bonus:</strong> Word gold modified to +${wordContext.wordGold} Gold</div>`;
                }

                wordDetailsHTML += `</div></div>`;
                breakdownHTML += wordDetailsHTML;

                turnScore += finalWordScore;
                turnGold += wordContext.wordGold;
            }
        });

        const baseTurnScore = turnScore;
        const baseTurnGold = turnGold;

        const turnContext = { turnScore, turnGold };
        triggerHook('onTurnSubmitted', turnContext);
        turnScore = turnContext.turnScore;
        turnGold = turnContext.turnGold;

        if (turnScore !== baseTurnScore || turnGold !== baseTurnGold) {
            let turnDetailsHTML = `<div style="border: 2px solid #7b1fa2; border-radius: 8px; padding: 12px; margin-bottom: 15px; background-color: #f3e5f5; color: #4a148c; font-size: 14px; font-family: 'Georgia', serif;">`;
            turnDetailsHTML += `<h3 style="margin: 0 0 8px 0; color: #7b1fa2;">Turn Bookmark Triggers</h3>`;
            if (turnScore !== baseTurnScore) {
                turnDetailsHTML += `<div><strong>Score:</strong> ${baseTurnScore} pts -> <span style="font-weight: bold;">${turnScore} pts</span> (+${turnScore - baseTurnScore} pts)</div>`;
            }
            if (turnGold !== baseTurnGold) {
                turnDetailsHTML += `<div><strong>Gold:</strong> ${baseTurnGold} Gold -> <span style="font-weight: bold;">${turnGold} Gold</span> (+${turnGold - baseTurnGold} Gold)</div>`;
            }
            turnDetailsHTML += `</div>`;
            breakdownHTML += turnDetailsHTML;
        }

        gameState.score += turnScore;
        gameState.gold += turnGold;
        gameState.handsLeft--;

        // Boss mechanic: Gilded Golem doubles gold
        if (gameState.activeBoss === 'gilded_golem') {
            const doubledGold = turnGold;
            gameState.gold += doubledGold;
        }

        updateStats(gameState.currentRound, turnGold, turnWordsCount);

        // Check achievements after submission
        const stats = getStats();
        checkAchievements(gameState, stats, { totalWords: stats.totalWords });

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

        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const tile = gameState.board[y][x];
                if (tile && !tile.isLocked) {
                    // Word Eater: remove tiles from eaten words
                    if (eatenTiles.has(`${x},${y}`)) {
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
        saveGame();
        renderUI();

        // Boss mechanic: Ink Thief steals tiles after submission
        let bossMessage = '';
        if (gameState.activeBoss === 'ink_thief') {
            const result = BOSSES.ink_thief.onSubmission(gameState);
            if (result.message) bossMessage = result.message;
        }

        // Populate and display the breakdown modal
        let content = breakdownHTML || '<div style="text-align: center; color: #aaa; padding: 20px 0;">No new words scored.</div>';
        if (bossMessage) {
            content = `<div style="border: 2px solid #e91e63; border-radius: 8px; padding: 10px; margin-bottom: 15px; background-color: rgba(233,30,99,0.1); color: #e91e63; font-weight: bold; font-family: 'Georgia', serif; font-size: 14px;">${bossMessage}</div>` + content;
        }
        document.getElementById('breakdown-details').innerHTML = content;
        document.getElementById('breakdown-total-score').innerText = turnScore;
        document.getElementById('breakdown-total-gold').innerText = turnGold;
        document.getElementById('breakdown-modal').style.display = 'flex';
    };

    document.getElementById('swap-btn').onclick = () => {
        const swapCost = getSwapCost();
        if (gameState.selectedHandIndices.size === 0 || (gameState.discardsLeft < swapCost && swapCost > 0)) return;

        gameState.discardsLeft -= swapCost;

        const indices = Array.from(gameState.selectedHandIndices).sort((a, b) => b - a);
        const discardedTiles = [];
        indices.forEach(idx => {
            const tile = gameState.hand.splice(idx, 1)[0];
            tile.isLocked = false;
            discardedTiles.push(tile);
        });
        gameState.selectedHandIndices.clear();

        // Draw new tiles first before putting discarded ones back
        drawTiles();

        // Put discarded tiles back in bag and shuffle
        gameState.bag.push(...discardedTiles);
        shuffle(gameState.bag);

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
        initRound(false);
        renderUI();
    };

    document.getElementById('new-run-btn').onclick = () => {
        document.getElementById('loss-modal').style.display = 'none';
        deleteSavedGame();
        showStartScreen();
    };

    document.getElementById('reset-btn').onclick = () => {
        if (confirm("Reset current run?")) {
            deleteSavedGame();
            location.reload();
        }
    };

    const closeBreakdownBtn = document.getElementById('close-breakdown-btn');
    if (closeBreakdownBtn) {
        closeBreakdownBtn.onclick = () => {
            document.getElementById('breakdown-modal').style.display = 'none';
            checkWinLoss();
        };
    }

    // Boss intro "Fight" button
    const bossFightBtn = document.getElementById('boss-intro-fight-btn');
    if (bossFightBtn) {
        bossFightBtn.onclick = () => {
            document.getElementById('boss-intro-screen').style.display = 'none';
            document.getElementById('game-container').style.display = 'flex';

            const boss = BOSSES[gameState.activeBoss];
            if (boss && boss.onBossStart) {
                boss.onBossStart(gameState);
            }
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

// Start the game!
init();
