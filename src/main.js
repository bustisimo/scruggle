import {
    gameState, GRID_SIZE, letterDist, shopItems, CLASSIC_MULTIPLIERS,
    saveGame, loadSavedGame, deleteSavedGame, FONT_BAGS, triggerHook, shuffle, getSwapCost
} from './state.js';
import { getStats, updateStats } from './stats.js';
import { loadDictionary, validateBoard, findWords } from './rules.js';
import {
    renderInventory, renderBoard, renderHand, handleBoardClick,
    renderBagDrawer, createTileUI
} from './board.js';
import { openShop, buyItem } from './shop.js';

async function init() {
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
    gameState.handsLeft = 4;
    gameState.discardsLeft = 3;

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
    saveGame();
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
        const bonus = gameState.handsLeft * 10;
        gameState.gold += bonus;
        saveGame();
        renderUI();
        document.getElementById('win-message').innerText = `Target reached! Bonus Gold: +${bonus}`;
        document.getElementById('win-modal').style.display = 'flex';
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

        updateStats(gameState.currentRound, turnGold, turnWordsCount);

        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const tile = gameState.board[y][x];
                if (tile && !tile.isLocked) {
                    if (tile.ink === 'void') {
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

        // Populate and display the breakdown modal
        document.getElementById('breakdown-details').innerHTML = breakdownHTML || '<div style="text-align: center; color: #aaa; padding: 20px 0;">No new words scored.</div>';
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
}

// Start the game!
init();
