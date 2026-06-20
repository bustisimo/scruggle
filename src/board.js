import { gameState, GRID_SIZE, shopItems, shuffle, saveGame, getSwapCost } from './state.js';
import { validateBoard } from './rules.js';

export function renderInventory() {
    const invEl = document.getElementById('inventory');
    invEl.innerHTML = '';
    gameState.inventory.forEach((itemId, idx) => {
        const item = shopItems.find(i => i.id === itemId);
        if (item) {
            const badge = document.createElement('span');
            if (itemId.startsWith('sticker_')) {
                badge.className = 'sticker-badge';
                badge.innerText = `✨ ${item.name}`;
                badge.title = `${item.desc} (Click to apply)`;
                badge.style.cursor = 'pointer';

                if (gameState.activeSticker === itemId && gameState.activeStickerIndex === idx) {
                    badge.classList.add('active-sticker');
                }

                badge.onclick = (e) => {
                    e.stopPropagation();
                    if (gameState.activeSticker === itemId && gameState.activeStickerIndex === idx) {
                        gameState.activeSticker = null;
                        gameState.activeStickerIndex = null;
                        const banner = document.getElementById('sticker-banner');
                        if (banner) banner.style.display = 'none';
                    } else {
                        gameState.activeSticker = itemId;
                        gameState.activeStickerIndex = idx;
                        const banner = document.getElementById('sticker-banner');
                        if (banner) {
                            banner.style.display = 'block';
                            banner.innerText = `STICKER ACTIVE: Click any square on the board to apply your ${item.name}! (Click sticker again to cancel)`;
                        }
                    }
                    renderInventory();
                };
            } else {
                badge.className = 'bookmark-icon';
                badge.innerText = `🔖 ${item.name}`;
                badge.title = item.desc;
            }
            invEl.appendChild(badge);
        }
    });
}

export function renderBoard(onCellClick, renderCallback) {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';
    const validation = validateBoard();

    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';

            const mult = gameState.boardMultipliers[`${x},${y}`];
            if (mult) {
                cell.classList.add(mult.toLowerCase());
            }
            const startX = gameState.startCell ? gameState.startCell.x : 3;
            const startY = gameState.startCell ? gameState.startCell.y : 3;
            if (x === startX && y === startY) {
                cell.classList.add('center');
            }

            cell.onclick = () => onCellClick(x, y);

            const tile = gameState.board[y][x];
            if (tile) {
                const tileEl = createTileUI(tile);
                if (tile.isLocked) {
                    tileEl.classList.add('locked');
                } else {
                    if (validation.validCoords.has(`${x},${y}`)) tileEl.classList.add('valid');
                    else if (validation.invalidCoords.has(`${x},${y}`)) tileEl.classList.add('invalid');
                }
                cell.appendChild(tileEl);
            } else {
                // Board Drag and Drop targets for empty cells
                cell.addEventListener('dragover', (e) => {
                    if (gameState.draggingHandIndex !== undefined) {
                        e.preventDefault();
                        cell.classList.add('drag-over');
                    }
                });
                cell.addEventListener('dragleave', () => {
                    cell.classList.remove('drag-over');
                });
                cell.addEventListener('drop', (e) => {
                    e.preventDefault();
                    cell.classList.remove('drag-over');
                    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
                    if (!isNaN(dragIndex) && dragIndex >= 0 && dragIndex < gameState.hand.length) {
                        gameState.board[y][x] = gameState.hand.splice(dragIndex, 1)[0];
                        gameState.selectedHandIndices.clear();
                        delete gameState.draggingHandIndex; // Prevent dragend reconstruction
                        saveGame();
                        if (renderCallback) renderCallback();
                    }
                });
            }
            boardEl.appendChild(cell);
        }
    }

    document.getElementById('submit-btn').disabled = !validation.allValid || !gameState.dictionaryLoaded || gameState.handsLeft <= 0;
    const swapCost = getSwapCost();
    // Update inventory rendering logic to show gold changes
}

export function renderHand(onTileClick, renderCallback) {
    const handEl = document.getElementById('hand');
    handEl.innerHTML = '';
    gameState.hand.forEach((tile, index) => {
        const tileEl = createTileUI(tile);
        tileEl._tile = tile; // Attach tile object to DOM element
        if (gameState.selectedHandIndices.has(index)) tileEl.classList.add('selected');

        // HTML5 Drag and Drop for hand sorting
        tileEl.setAttribute('draggable', 'true');
        tileEl.addEventListener('dragstart', (e) => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', index.toString());
            tileEl.classList.add('dragging');
            gameState.draggingHandIndex = index;
        });
        tileEl.addEventListener('dragend', () => {
            tileEl.classList.remove('dragging');
            const isDroppedOnBoard = (gameState.draggingHandIndex === undefined);
            delete gameState.draggingHandIndex;
            if (!isDroppedOnBoard) {
                const children = Array.from(handEl.children);
                const newHand = [];
                children.forEach(child => {
                    if (child._tile) {
                        newHand.push(child._tile);
                    }
                });
                gameState.hand = newHand;
                gameState.selectedHandIndices.clear();
                saveGame();
                if (renderCallback) renderCallback();
            }
        });
        tileEl.addEventListener('dragover', (e) => {
            if (gameState.draggingHandIndex !== undefined && gameState.draggingHandIndex !== index) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';

                // Live drag reordering
                const children = Array.from(handEl.children);
                const draggedEl = handEl.querySelector('.tile.dragging');
                if (draggedEl && draggedEl !== tileEl) {
                    const draggedIndex = children.indexOf(draggedEl);
                    const targetIndex = children.indexOf(tileEl);
                    if (draggedIndex < targetIndex) {
                        handEl.insertBefore(draggedEl, tileEl.nextSibling);
                    } else {
                        handEl.insertBefore(draggedEl, tileEl);
                    }
                }
            }
        });
        tileEl.addEventListener('dragleave', () => {
            tileEl.classList.remove('drag-over');
        });
        tileEl.addEventListener('drop', (e) => {
            e.preventDefault();
        });

        tileEl.onclick = (e) => {
            e.stopPropagation();
            onTileClick(index);
        };
        handEl.appendChild(tileEl);
    });
}

export function createTileUI(tile) {
    const div = document.createElement('div');
    div.className = 'tile';
    if (tile.ink) {
        div.classList.add(`ink-${tile.ink}`);
        const indicator = document.createElement('span');
        indicator.className = 'ink-indicator';
        indicator.innerText = tile.ink.toUpperCase();
        div.appendChild(indicator);
    }
    div.innerHTML += `<span class="letter">${tile.letter}</span><span class="value">${tile.value}</span>`;
    return div;
}

export function handleBoardClick(x, y, saveCallback, renderCallback) {
    if (gameState.activeSticker) {
        const active = gameState.activeSticker;
        if (active === 'sticker_eraser') {
            delete gameState.boardMultipliers[`${x},${y}`];
            const tile = gameState.board[y][x];
            if (tile) {
                tile.isLocked = false;
                gameState.bag.push(tile);
                shuffle(gameState.bag);
            }
            gameState.board[y][x] = null; // Clear locked tile as well
        } else if (active === 'sticker_dl') {
            gameState.boardMultipliers[`${x},${y}`] = 'DL';
        } else if (active === 'sticker_tl') {
            gameState.boardMultipliers[`${x},${y}`] = 'TL';
        } else if (active === 'sticker_dw') {
            gameState.boardMultipliers[`${x},${y}`] = 'DW';
        } else if (active === 'sticker_tw') {
            gameState.boardMultipliers[`${x},${y}`] = 'TW';
        } else if (active === 'sticker_qw') {
            gameState.boardMultipliers[`${x},${y}`] = 'QW';
        } else if (active === 'sticker_gm') {
            gameState.boardMultipliers[`${x},${y}`] = 'GM';
        }

        // Remove sticker from inventory
        if (gameState.activeStickerIndex !== undefined && gameState.activeStickerIndex !== null) {
            gameState.inventory.splice(gameState.activeStickerIndex, 1);
        } else {
            const idx = gameState.inventory.indexOf(active);
            if (idx !== -1) {
                gameState.inventory.splice(idx, 1);
            }
        }

        gameState.activeSticker = null;
        gameState.activeStickerIndex = null;
        document.getElementById('sticker-banner').style.display = 'none';
        saveCallback();
        renderCallback();

        window.dispatchEvent(new CustomEvent('sticker-applied'));
        return;
    }

    const tile = gameState.board[y][x];
    if (tile && !tile.isLocked) {
        if (gameState.hand.length < gameState.handSize) {
            gameState.hand.push(gameState.board[y][x]);
            gameState.board[y][x] = null;
            saveCallback();
            renderCallback();
        }
        return;
    }
    if (!tile && gameState.selectedHandIndices.size === 1) {
        const index = Array.from(gameState.selectedHandIndices)[0];
        gameState.board[y][x] = gameState.hand.splice(index, 1)[0];
        gameState.selectedHandIndices.clear();
        saveCallback();
        renderCallback();
    }

    // Handle Swap Discard Logic
    document.getElementById('swap-btn').addEventListener('click', () => {
        const selected = Array.from(gameState.selectedHandIndices);
        if (selected.length === 0) return;

        const cost = getSwapCost();
        if (cost > gameState.discardsLeft) return;

        // Move selected tiles from hand to Bag
        const discardedTiles = selected.map(i => gameState.hand.splice(i, 1)[0]);
        gameState.bag.push(...discardedTiles);
        shuffle(gameState.bag);

        // Replace with new tiles from Bag
        while (gameState.hand.length < gameState.handSize && gameState.bag.length > 0) {
            gameState.hand.push(gameState.bag.pop());
        }

        gameState.selectedHandIndices.clear();
        gameState.discardsLeft = Math.max(0, gameState.discardsLeft - cost);
        saveGame();
        renderHand(renderHand, renderBoard);
        renderBagDrawer();
    });
}

export function renderBagDrawer() {
    const container = document.getElementById('bag-drawer-tiles');
    if (!container) return;
    container.innerHTML = '';

    const groups = {};
    gameState.bag.forEach(tile => {
        const inkVal = tile.ink || '';
        const key = `${tile.letter}_${tile.value}_${inkVal}`;
        if (!groups[key]) {
            groups[key] = {
                letter: tile.letter,
                value: tile.value,
                ink: tile.ink || null,
                count: 0
            };
        }
        groups[key].count++;
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => {
        const ga = groups[a];
        const gb = groups[b];
        if (ga.letter !== gb.letter) {
            return ga.letter.localeCompare(gb.letter);
        }
        if (ga.value !== gb.value) {
            return ga.value - gb.value;
        }
        return (ga.ink || '').localeCompare(gb.ink || '');
    });

    if (sortedKeys.length === 0) {
        container.innerHTML = '<div style="grid-column: span 4; text-align: center; color: #aaa; padding: 20px 0;">Bag is empty</div>';
        return;
    }

    sortedKeys.forEach(key => {
        const group = groups[key];
        const miniTile = document.createElement('div');
        miniTile.className = 'mini-tile';

        let inkClass = '';
        let badgeHTML = '';
        if (group.ink) {
            inkClass = ` ink-${group.ink}`;
            badgeHTML = `<span class="mini-ink-badge">${group.ink.toUpperCase()}</span>`;
        }

        miniTile.innerHTML = `
            <div class="mini-tile-body${inkClass}">
                ${badgeHTML}
                <span class="mini-letter">${group.letter}</span>
                <span class="mini-value">${group.value}</span>
            </div>
            <span class="mini-count">x${group.count}</span>
        `;
        container.appendChild(miniTile);
    });
}
