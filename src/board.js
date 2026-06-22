import { gameState, GRID_SIZE, shopItems, shuffle } from './state.js';
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

    /**
     * Get the 4-directional neighbors of a cell. Used for ripple propagation.
     */
    function getNeighbors(x, y) {
        const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
        const result = [];
        for (const [dx, dy] of dirs) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
                result.push({ x: nx, y: ny });
            }
        }
        return result;
    }

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
                // Add the rotating golden halo ring around center star
                const halo = document.createElement('div');
                halo.className = 'center-halo-ring';
                cell.appendChild(halo);
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
                    // Animate newly placed tiles with a bounce — only on first placement
                    if (!tile._animPlaced) {
                        tileEl.classList.add('just-placed');
                        tile._animPlaced = true;
                        // Spawn burst particles around the tile
                        spawnPlaceParticles(tileEl);
                        // Ripple propagation — brief ring on adjacent empty cells
                        const neighbors = getNeighbors(x, y);
                        neighbors.forEach(n => {
                            if (!gameState.board[n.y][n.x]) {
                                const neighborIdx = n.y * GRID_SIZE + n.x;
                                const neighborCell = boardEl.children[neighborIdx];
                                if (neighborCell) {
                                    neighborCell.classList.add('placement-ripple');
                                    setTimeout(() => {
                                        neighborCell.classList.remove('placement-ripple');
                                    }, 550);
                                }
                            }
                        });
                        // Remove animation class after it finishes so it doesn't interfere with hover
                        setTimeout(() => {
                            const els = document.querySelectorAll('#board .tile.just-placed');
                            els.forEach(el => el.classList.remove('just-placed'));
                        }, 500);
                    }
                }
                cell.appendChild(tileEl);
            } else {
                // Hover highlight for valid placement area
                // Also highlight the hovered cell itself to show it's clickable
                cell.addEventListener('mouseenter', () => {
                    cell.classList.add('cell-hover-target');
                    // Determine valid adjacent cells for this empty cell
                    const adjCells = getValidAdjacentCells(x, y);
                    adjCells.forEach(([ax, ay]) => {
                        const idx = ay * GRID_SIZE + ax;
                        const adjCell = boardEl.children[idx];
                        if (adjCell && !adjCell.querySelector('.tile')) {
                            adjCell.classList.add('valid-placement');
                        }
                    });
                });
                cell.addEventListener('mouseleave', () => {
                    cell.classList.remove('cell-hover-target');
                    boardEl.querySelectorAll('.cell.valid-placement').forEach(el => {
                        el.classList.remove('valid-placement');
                    });
                });

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
                        // Reset flags for fresh placement animation
                        delete gameState.board[y][x]._animPlaced;
                        delete gameState.board[y][x]._animHandEnter;
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

    // Spawn floating sparkle particles around the center star
    spawnCenterSparkles();
}

/**
 * Compute which empty cells are valid placement targets adjacent to the hovered cell.
 * Shows cells along the same row or column as existing tiles near the cursor.
 */
function getValidAdjacentCells(x, y) {
    const results = [];
    const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];

    for (const [dx, dy] of dirs) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
            const tile = gameState.board[ny][nx];
            // Highlight empty cells that are adjacent to existing tiles
            if (tile) {
                results.push([nx, ny]);
            } else {
                // Check if this direction has any tile further along the line
                let found = false;
                for (let step = 2; step < GRID_SIZE; step++) {
                    const sx = x + dx * step;
                    const sy = y + dy * step;
                    if (sx < 0 || sx >= GRID_SIZE || sy < 0 || sy >= GRID_SIZE) break;
                    if (gameState.board[sy][sx]) {
                        found = true;
                        break;
                    }
                }
                if (found) {
                    results.push([nx, ny]);
                }
            }
        }
    }

    // If no tiles exist yet, just highlight the center cell
    const hasAnyTiles = gameState.board.some(row => row.some(cell => cell !== null));
    if (!hasAnyTiles) {
        const startX = gameState.startCell ? gameState.startCell.x : 3;
        const startY = gameState.startCell ? gameState.startCell.y : 3;
        if (Math.abs(x - startX) + Math.abs(y - startY) === 1) {
            results.push([startX, startY]);
        }
    }

    return results;
}

/** Compute how many of each letter remain in the bag */
export function computeBagLetterCounts() {
    const counts = {};
    for (const tile of gameState.bag) {
        counts[tile.letter] = (counts[tile.letter] || 0) + 1;
    }
    return counts;
}

/** Build a distribution string for tooltips */
export function buildBagDistributionText(counts) {
    const sorted = Object.keys(counts).sort();
    const parts = sorted.map(l => `${l}: ${counts[l]}`);
    return parts.join(' | ');
}

export function renderHand(onTileClick, renderCallback) {
    const handEl = document.getElementById('hand');
    handEl.innerHTML = '';
    const bagCounts = computeBagLetterCounts();
    gameState.hand.forEach((tile, index) => {
        const tileEl = createTileUI(tile);
        tileEl._tile = tile; // Attach tile object to DOM element
        // Add remaining-count indicator badge
        const remaining = bagCounts[tile.letter] || 0;
        const remBadge = document.createElement('span');
        remBadge.className = 'hand-bag-remaining';
        remBadge.innerText = remaining;
        remBadge.dataset.count = remaining;
        remBadge.title = `${remaining} of ${tile.letter} remaining in bag`;
        tileEl.appendChild(remBadge);
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
        // Animate tile sliding into hand from the side — only on first appearance
        if (!tile._animHandEnter) {
            tileEl.classList.add('hand-enter');
            tileEl.style.animationDelay = `${index * 60}ms`;
            tile._animHandEnter = true;
            // Clean up animation class after it finishes
            setTimeout(() => {
                tileEl.classList.remove('hand-enter');
                tileEl.style.animationDelay = '';
            }, 500 + index * 60);
        }
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
            // Reset animation flags so tile re-animates when placed again
            delete tile._animPlaced;
            delete tile._animHandEnter;
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
        // Flag for hand-enter re-animation when tile returns to hand
        delete gameState.board[y][x]._animHandEnter;
        gameState.selectedHandIndices.clear();
        import('./audio.js').then(m => m.default.tilePlace());
        saveCallback();
        renderCallback();
    }
}

export function renderBagDrawer() {
    const container = document.getElementById('bag-drawer-tiles');
    if (!container) return;
    container.innerHTML = '';

    // Remove the outer mini-tiles-container class — we build our own layout inside
    container.classList.remove('mini-tiles-container');

    // ── Letter distribution summary (compact A-Z grid) ───────────────────
    const letterCounts = computeBagLetterCounts();
    const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    const summaryEl = document.createElement('div');
    summaryEl.className = 'bag-letter-summary';

    allLetters.forEach(letter => {
        const count = letterCounts[letter] || 0;
        const cell = document.createElement('span');
        cell.className = 'bag-letter-cell';
        if (count === 0) cell.classList.add('bag-letter-zero');
        cell.innerHTML = `${letter} <span class="bag-letter-count">${count}</span>`;
        summaryEl.appendChild(cell);
    });

    container.appendChild(summaryEl);

    // ── Detailed grouped tile view ───────────────────────────────────────
    const divider = document.createElement('hr');
    divider.className = 'bag-drawer-divider';
    container.appendChild(divider);

    const detailedLabel = document.createElement('div');
    detailedLabel.className = 'bag-drawer-section-label';
    detailedLabel.innerText = 'Tiles by Type';
    container.appendChild(detailedLabel);

    const tileGrid = document.createElement('div');
    tileGrid.className = 'mini-tiles-container';

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
        tileGrid.innerHTML = '<div style="grid-column: span 4; text-align: center; color: #aaa; padding: 20px 0;">Bag is empty</div>';
    } else {
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
            tileGrid.appendChild(miniTile);
        });
    }

    container.appendChild(tileGrid);
}

/**
 * Spawn burst particles around a newly placed tile.
 * Creates small colored dots that fly outward and fade.
 */
function spawnPlaceParticles(tileEl) {
    const boardEl = document.getElementById('board');
    if (!boardEl) return;
    const boardRect = boardEl.getBoundingClientRect();
    const tileRect = tileEl.getBoundingClientRect();
    const cx = tileRect.left - boardRect.left + tileRect.width / 2;
    const cy = tileRect.top - boardRect.top + tileRect.height / 2;
    const colors = ['#4caf50', '#81c784', '#aed581', '#fdd835', '#ffab40'];
    for (let i = 0; i < 6; i++) {
        const p = document.createElement('div');
        p.className = 'tile-place-particle';
        const angle = (Math.PI * 2 / 6) * i + (Math.random() - 0.5) * 0.5;
        const dist = 20 + Math.random() * 25;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;
        const color = colors[i % colors.length];
        p.style.cssText = `
            left: ${cx}px;
            top: ${cy}px;
            background: ${color};
            --tx: ${dx}px;
            --ty: ${dy}px;
        `;
        p.style.setProperty('--tx', dx + 'px');
        p.style.setProperty('--ty', dy + 'px');
        boardEl.appendChild(p);
    }
    // Remove particles after animation
    setTimeout(() => {
        boardEl.querySelectorAll('.tile-place-particle').forEach(el => el.remove());
    }, 700);
}

/**
 * Spawn floating sparkle particles around the center star cell.
 * Each render spawns 2 particles that drift upward and fade.
 */
function spawnCenterSparkles() {
    const boardEl = document.getElementById('board');
    if (!boardEl) return;
    const centerCell = boardEl.querySelector('.cell.center');
    if (!centerCell) return;

    // Use a global counter to throttle — only add particles occasionally
    window._sparkleCounter = (window._sparkleCounter || 0) + 1;
    if (window._sparkleCounter % 3 !== 0) return; // Only spawn every 3rd render

    for (let i = 0; i < 2; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'center-sparkle-particle';
        // Random offset around the cell (within ±30px)
        const angle = Math.random() * Math.PI * 2;
        const dist = 10 + Math.random() * 25;
        const xOff = Math.cos(angle) * dist;
        const yOff = Math.sin(angle) * dist;
        const size = 3 + Math.random() * 5;
        sparkle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: rgba(255, 215, 0, ${0.5 + Math.random() * 0.5});
            box-shadow: 0 0 ${size * 2}px rgba(255, 215, 0, 0.4);
            left: calc(50% + ${xOff}px);
            top: calc(50% + ${yOff}px);
            z-index: 6;
            pointer-events: none;
            animation: center-particle-drift ${0.8 + Math.random() * 0.6}s ease-out forwards;
        `;
        centerCell.appendChild(sparkle);
        // Remove after animation
        setTimeout(() => {
            if (sparkle.parentNode) sparkle.remove();
        }, 1600);
    }
}
