import { gameState, GRID_SIZE, DICT_URL } from './state.js';

export async function loadDictionary(onComplete, onUpdateText) {
    const originalText = "Submit Word";
    if (onUpdateText) onUpdateText("Loading Dict...");

    try {
        const response = await fetch(DICT_URL);
        const text = await response.text();
        text.split('\n').forEach(word => {
            const w = word.trim().toUpperCase();
            if (w.length > 1) gameState.dictionary.add(w);
        });
        gameState.dictionaryLoaded = true;
    } catch (e) {
        ["THE", "AND", "FOR", "YOU", "ARE"].forEach(w => gameState.dictionary.add(w));
    } finally {
        if (onUpdateText) onUpdateText(originalText);
        if (onComplete) onComplete();
    }
}

export function findWords() {
    const found = [];
    for (let y = 0; y < GRID_SIZE; y++) {
        let current = ""; let coords = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            if (gameState.board[y][x]) { current += gameState.board[y][x].letter; coords.push({x, y}); }
            else { if (current.length > 1) found.push({word: current, coords}); current = ""; coords = []; }
        }
        if (current.length > 1) found.push({word: current, coords});
    }
    for (let x = 0; x < GRID_SIZE; x++) {
        let current = ""; let coords = [];
        for (let y = 0; y < GRID_SIZE; y++) {
            if (gameState.board[y][x]) { current += gameState.board[y][x].letter; coords.push({x, y}); }
            else { if (current.length > 1) found.push({word: current, coords}); current = ""; coords = []; }
        }
        if (current.length > 1) found.push({word: current, coords});
    }
    return found;
}

export function validateBoard() {
    const words = findWords();
    const newTiles = [];
    const lockedTiles = [];

    gameState.board.forEach((row, y) => row.forEach((tile, x) => {
        if (tile) {
            if (tile.isLocked) lockedTiles.push({x, y});
            else newTiles.push({x, y});
        }
    }));

    const validCoords = new Set();
    const invalidCoords = new Set();
    const coordsInWords = new Set();

    if (newTiles.length === 0) {
        return { allValid: false, reason: "Please place at least one tile on the board.", validCoords, invalidCoords };
    }

    const isFirstMove = lockedTiles.length === 0;

    const startX = gameState.startCell ? gameState.startCell.x : 3;
    const startY = gameState.startCell ? gameState.startCell.y : 3;

    // 1. Center Rule: First word must cover start cell
    const coversCenter = newTiles.some(t => t.x === startX && t.y === startY);
    if (isFirstMove && !coversCenter) {
        newTiles.forEach(t => invalidCoords.add(`${t.x},${t.y}`));
        return { allValid: false, reason: "The first word of the round must cover the center star (★) square.", validCoords, invalidCoords };
    }

    // 2. Line Check (Collinearity)
    const isHorizontal = newTiles.every(t => t.y === newTiles[0].y);
    const isVertical = newTiles.every(t => t.x === newTiles[0].x);
    if (!isHorizontal && !isVertical) {
        newTiles.forEach(t => invalidCoords.add(`${t.x},${t.y}`));
        return { allValid: false, reason: "Tiles must be placed in a single straight row or column.", validCoords, invalidCoords };
    }

    // 3. Contiguity Check
    let isContiguous = true;
    if (newTiles.length > 1) {
        if (isHorizontal) {
            const y = newTiles[0].y;
            const minX = Math.min(...newTiles.map(t => t.x));
            const maxX = Math.max(...newTiles.map(t => t.x));
            for (let x = minX; x <= maxX; x++) {
                if (!gameState.board[y][x]) {
                    isContiguous = false;
                    break;
                }
            }
        } else if (isVertical) {
            const x = newTiles[0].x;
            const minY = Math.min(...newTiles.map(t => t.y));
            const maxY = Math.max(...newTiles.map(t => t.y));
            for (let y = minY; y <= maxY; y++) {
                if (!gameState.board[y][x]) {
                    isContiguous = false;
                    break;
                }
            }
        }
    }
    if (!isContiguous) {
        newTiles.forEach(t => invalidCoords.add(`${t.x},${t.y}`));
        return { allValid: false, reason: "Tiles must be placed in a single, contiguous line without gaps.", validCoords, invalidCoords };
    }

    // 4. Connectivity Check
    let isConnected = isFirstMove;
    if (!isConnected) {
        isConnected = newTiles.some(nt =>
            lockedTiles.some(lt => Math.abs(nt.x - lt.x) + Math.abs(nt.y - lt.y) === 1)
        );
    }
    if (!isConnected) {
        newTiles.forEach(t => invalidCoords.add(`${t.x},${t.y}`));
        return { allValid: false, reason: "New words must connect to existing tiles on the board.", validCoords, invalidCoords };
    }

    // 5. Dictionary & Word Check
    let allWordsValid = true;
    let invalidWordList = [];
    words.forEach(wordObj => {
        // Check if this word involves any of our new tiles
        const hasNewTile = wordObj.coords.some(c => !gameState.board[c.y][c.x].isLocked);
        if (hasNewTile) {
            const isValid = gameState.dictionary.has(wordObj.word.toUpperCase());
            if (!isValid) {
                allWordsValid = false;
                invalidWordList.push(wordObj.word.toUpperCase());
            }
            wordObj.coords.forEach(c => {
                coordsInWords.add(`${c.x},${c.y}`);
                if (isValid) validCoords.add(`${c.x},${c.y}`);
                else invalidCoords.add(`${c.x},${c.y}`);
            });
        } else {
            // If it is entirely locked tiles, it was already validated on a previous turn, so we assume valid
            wordObj.coords.forEach(c => {
                coordsInWords.add(`${c.x},${c.y}`);
                validCoords.add(`${c.x},${c.y}`);
            });
        }
    });

    if (!allWordsValid) {
        return { allValid: false, reason: `Invalid word(s): ${invalidWordList.join(', ')}`, validCoords, invalidCoords };
    }

    // 6. Usage Check (All placed tiles must be used in at least one word)
    const allNewTilesUsed = newTiles.every(t => coordsInWords.has(`${t.x},${t.y}`));
    if (!allNewTilesUsed) {
        newTiles.forEach(t => {
            if (!coordsInWords.has(`${t.x},${t.y}`)) invalidCoords.add(`${t.x},${t.y}`);
        });
        return { allValid: false, reason: "All newly placed tiles must form valid words of 2 or more letters.", validCoords, invalidCoords };
    }

    return {
        allValid: true,
        validCoords,
        invalidCoords
    };
}
