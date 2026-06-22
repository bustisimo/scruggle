export const GRID_SIZE = 7;
export const HAND_SIZE = 7;
export const SAVE_KEY = 'scruggle_save_v2';
export const STATS_KEY = 'scruggle_stats';
export const DICT_URL = 'https://raw.githubusercontent.com/redbo/scrabble/master/dictionary.txt';

export const CLASSIC_MULTIPLIERS = {
    "3,3": "DW",
    "1,1": "DL", "1,5": "DL", "5,1": "DL", "5,5": "DL"
};

export const letterDist = {
    'A': {count: 9, val: 1}, 'B': {count: 2, val: 3}, 'C': {count: 2, val: 3}, 'D': {count: 4, val: 2},
    'E': {count: 12, val: 1}, 'F': {count: 2, val: 4}, 'G': {count: 3, val: 2}, 'H': {count: 2, val: 4},
    'I': {count: 9, val: 1}, 'J': {count: 1, val: 8}, 'K': {count: 1, val: 5}, 'L': {count: 4, val: 1},
    'M': {count: 2, val: 3}, 'N': {count: 6, val: 1}, 'O': {count: 8, val: 1}, 'P': {count: 2, val: 3},
    'Q': {count: 1, val: 10}, 'R': {count: 6, val: 1}, 'S': {count: 4, val: 1}, 'T': {count: 6, val: 1},
    'U': {count: 4, val: 1}, 'V': {count: 2, val: 4}, 'W': {count: 2, val: 4}, 'X': {count: 1, val: 8},
    'Y': {count: 2, val: 4}, 'Z': {count: 1, val: 10}
};

export const FONT_BAGS = {
    standard: {
        id: 'standard',
        name: 'Standard Serif',
        desc: 'The classic balanced letter distribution. Hand size: 7.',
        handSize: 7,
        distribution: letterDist
    },
    gothic: {
        id: 'gothic',
        name: 'Gothic Bold',
        desc: 'Fewer vowels, packed with high-value rare consonants. Hand size: 6.',
        handSize: 6,
        distribution: {
            'A': {count: 5, val: 1}, 'B': {count: 3, val: 3}, 'C': {count: 3, val: 3}, 'D': {count: 4, val: 2},
            'E': {count: 6, val: 1}, 'F': {count: 3, val: 4}, 'G': {count: 4, val: 2}, 'H': {count: 3, val: 4},
            'I': {count: 5, val: 1}, 'J': {count: 2, val: 8}, 'K': {count: 2, val: 5}, 'L': {count: 3, val: 1},
            'M': {count: 3, val: 3}, 'N': {count: 4, val: 1}, 'O': {count: 5, val: 1}, 'P': {count: 3, val: 3},
            'Q': {count: 2, val: 10}, 'R': {count: 4, val: 1}, 'S': {count: 4, val: 1}, 'T': {count: 4, val: 1},
            'U': {count: 3, val: 1}, 'V': {count: 2, val: 4}, 'W': {count: 2, val: 4}, 'X': {count: 2, val: 8},
            'Y': {count: 2, val: 4}, 'Z': {count: 2, val: 10}
        }
    },
    cursive: {
        id: 'cursive',
        name: 'Cursive Script',
        desc: 'Vowel-heavy distribution with high count of fluid connectors. Hand size: 8.',
        handSize: 8,
        distribution: {
            'A': {count: 14, val: 1}, 'B': {count: 1, val: 3}, 'C': {count: 1, val: 3}, 'D': {count: 2, val: 2},
            'E': {count: 18, val: 1}, 'F': {count: 1, val: 4}, 'G': {count: 2, val: 2}, 'H': {count: 2, val: 4},
            'I': {count: 14, val: 1}, 'J': {count: 1, val: 8}, 'K': {count: 1, val: 5}, 'L': {count: 4, val: 1},
            'M': {count: 2, val: 3}, 'N': {count: 8, val: 1}, 'O': {count: 12, val: 1}, 'P': {count: 1, val: 3},
            'Q': {count: 1, val: 10}, 'R': {count: 8, val: 1}, 'S': {count: 6, val: 1}, 'T': {count: 8, val: 1},
            'U': {count: 8, val: 1}, 'V': {count: 1, val: 4}, 'W': {count: 1, val: 4}, 'X': {count: 1, val: 8},
            'Y': {count: 2, val: 4}, 'Z': {count: 1, val: 10}
        }
    },
    monospace: {
        id: 'monospace',
        name: 'Monospace Sans',
        desc: 'Clean, geometric letter distribution. Strong consonants, balanced vowels. Hand size: 7.',
        handSize: 7,
        distribution: {
            'A': {count: 7, val: 1}, 'B': {count: 2, val: 3}, 'C': {count: 3, val: 3}, 'D': {count: 5, val: 2},
            'E': {count: 9, val: 1}, 'F': {count: 2, val: 4}, 'G': {count: 3, val: 2}, 'H': {count: 3, val: 4},
            'I': {count: 7, val: 1}, 'J': {count: 1, val: 8}, 'K': {count: 1, val: 5}, 'L': {count: 5, val: 1},
            'M': {count: 2, val: 3}, 'N': {count: 7, val: 1}, 'O': {count: 6, val: 1}, 'P': {count: 2, val: 3},
            'Q': {count: 1, val: 10}, 'R': {count: 7, val: 1}, 'S': {count: 5, val: 1}, 'T': {count: 7, val: 1},
            'U': {count: 3, val: 1}, 'V': {count: 1, val: 4}, 'W': {count: 2, val: 4}, 'X': {count: 1, val: 8},
            'Y': {count: 2, val: 4}, 'Z': {count: 1, val: 10}
        }
    },
    dropcap: {
        id: 'dropcap',
        name: 'Decorative Drop Cap',
        desc: 'Fewer tiles but each packs a punch. High-value letters are abundant. Hand size: 5.',
        handSize: 5,
        distribution: {
            'A': {count: 4, val: 1}, 'B': {count: 3, val: 3}, 'C': {count: 3, val: 3}, 'D': {count: 3, val: 2},
            'E': {count: 4, val: 1}, 'F': {count: 3, val: 4}, 'G': {count: 3, val: 2}, 'H': {count: 3, val: 4},
            'I': {count: 4, val: 1}, 'J': {count: 3, val: 8}, 'K': {count: 2, val: 5}, 'L': {count: 3, val: 1},
            'M': {count: 2, val: 3}, 'N': {count: 4, val: 1}, 'O': {count: 4, val: 1}, 'P': {count: 3, val: 3},
            'Q': {count: 2, val: 10}, 'R': {count: 3, val: 1}, 'S': {count: 3, val: 1}, 'T': {count: 4, val: 1},
            'U': {count: 3, val: 1}, 'V': {count: 2, val: 4}, 'W': {count: 2, val: 4}, 'X': {count: 2, val: 8},
            'Y': {count: 2, val: 4}, 'Z': {count: 2, val: 10}
        }
    },
    italic: {
        id: 'italic',
        name: 'Italic Script',
        desc: 'Fluid and flexible. More common letters for easier word building. Hand size: 8.',
        handSize: 8,
        distribution: {
            'A': {count: 11, val: 1}, 'B': {count: 2, val: 3}, 'C': {count: 2, val: 3}, 'D': {count: 5, val: 2},
            'E': {count: 14, val: 1}, 'F': {count: 2, val: 4}, 'G': {count: 3, val: 2}, 'H': {count: 2, val: 4},
            'I': {count: 11, val: 1}, 'J': {count: 1, val: 8}, 'K': {count: 1, val: 5}, 'L': {count: 5, val: 1},
            'M': {count: 2, val: 3}, 'N': {count: 7, val: 1}, 'O': {count: 10, val: 1}, 'P': {count: 2, val: 3},
            'Q': {count: 1, val: 10}, 'R': {count: 7, val: 1}, 'S': {count: 5, val: 1}, 'T': {count: 7, val: 1},
            'U': {count: 5, val: 1}, 'V': {count: 1, val: 4}, 'W': {count: 1, val: 4}, 'X': {count: 1, val: 8},
            'Y': {count: 2, val: 4}, 'Z': {count: 1, val: 10}
        }
    }
};

export const bookmarksRegistry = {
    'focus': {
        id: 'focus',
        name: 'Focus',
        desc: 'Earn +2 extra Gold on every submission.',
        price: 15,
        hooks: {
            onTurnSubmitted(state, context) {
                context.turnGold += 2;
            }
        }
    },
    'efficiency': {
        id: 'efficiency',
        name: 'Efficiency',
        desc: 'Swapping tiles now costs 0 discards (Free).',
        price: 25,
        hooks: {
            onSwapTiles(state, context) {
                context.cost = 0;
            }
        }
    },
    'scholar': {
        id: 'scholar',
        name: 'Scholar',
        desc: 'Words 5+ letters long give double Gold.',
        price: 40,
        hooks: {
            onWordScored(state, context) {
                if (context.word.length >= 5) {
                    context.wordGold *= 2;
                }
            }
        }
    },
    'golden_touch': {
        id: 'golden_touch',
        name: 'Golden Touch',
        desc: 'Earn +1 Gold for every J, Q, X, or Z inside scored words.',
        price: 30,
        hooks: {
            onWordScored(state, context) {
                const targets = ['J', 'Q', 'X', 'Z'];
                for (const letter of context.word) {
                    if (targets.includes(letter.toUpperCase())) {
                        context.wordGold += 1;
                      }
                }
            }
        }
    },
    'patience': {
        id: 'patience',
        name: 'Patience',
        desc: 'Words 6+ letters long give +3 Gold.',
        price: 30,
        hooks: {
            onWordScored(state, context) {
                if (context.word.length >= 6) {
                    context.wordGold += 3;
                }
            }
        }
    },
    'collector': {
        id: 'collector',
        name: 'Collector',
        desc: 'Each Bookmark owned adds +3 Score to every turn.',
        price: 35,
        hooks: {
            onTurnSubmitted(state, context) {
                const bookmarkCount = state.inventory.filter(id => bookmarksRegistry[id]).length;
                context.turnScore += bookmarkCount * 3;
            }
        }
    },
    'capitalist': {
        id: 'capitalist',
        name: 'Capitalist',
        desc: 'Submissions get +1 Score for every 2 Gold owned.',
        price: 35,
        hooks: {
            onTurnSubmitted(state, context) {
                context.turnScore += Math.floor(state.gold / 2);
            }
        }
    },
    'lucky_seven': {
        id: 'lucky_seven',
        name: 'Lucky Seven',
        desc: 'Exactly 7-letter words give +15 Gold.',
        price: 45,
        hooks: {
            onWordScored(state, context) {
                if (context.word.length === 7) {
                    context.wordGold += 15;
                }
            }
        }
    },
    'alchemist': {
        id: 'alchemist',
        name: 'Alchemist',
        desc: 'Ink tiles are worth +3 extra gold when scored.',
        price: 25,
        hooks: {
            onWordScored(state, context) {
                if (context.tileInks && context.tileInks > 0) {
                    context.wordGold += context.tileInks * 3;
                }
            }
        }
    },
    'architect': {
        id: 'architect',
        name: 'Architect',
        desc: 'The center star gives 2x word multiplier instead of DW.',
        price: 30,
        hooks: {
            onCenterStar(state, context) {
                context.wordMultiplier = (context.wordMultiplier || 1) * 2;
            }
        }
    },
    'hoarder': {
        id: 'hoarder',
        name: 'Hoarder',
        desc: 'Start each round with +5 gold.',
        price: 20
    },
    'recycler': {
        id: 'recycler',
        name: 'Recycler',
        desc: 'Discarding tiles refunds 1 gold per tile.',
        price: 20,
        hooks: {
            onSwapTiles(state, context) {
                if (context.discardCount) {
                    state.gold += context.discardCount;
                }
            }
        }
    }
};

export const shopItems = [
    ...Object.values(bookmarksRegistry).map(({ id, name, desc, price }) => ({ id, name, desc, price })),
    { id: 'pack_fire', name: 'Fire Ink Pack', desc: 'Apply Fire Ink to 3 random tiles in your bag. Fire Ink doubles letter scoring.', price: 15 },
    { id: 'pack_ice', name: 'Ice Ink Pack', desc: 'Apply Ice Ink to 3 random tiles in your bag. Ice Ink tiles remain unlocked on submission, then melt.', price: 15 },
    { id: 'pack_gold', name: 'Gold Ink Pack', desc: 'Apply Gold Ink to 2 random tiles in your bag. Gold Ink yields +5 Gold when scored.', price: 20 },
    { id: 'pack_void', name: 'Void Ink Pack', desc: 'Apply Void Ink to 2 random tiles in your bag. Void Ink adds +15 Score, but disintegrates the tile after scoring.', price: 20 },
    { id: 'pack_growth', name: 'Growth Ink Pack', desc: 'Apply Growth Ink to 2 random tiles in your bag. Growth tiles permanently gain +1 value whenever scored.', price: 20 },
    { id: 'pack_steel', name: 'Steel Ink Pack', desc: 'Apply Steel Ink to 2 random tiles in your bag. Steel tiles remain on the board and stay unlocked forever, retaining Steel Ink.', price: 20 },
    { id: 'pack_prism', name: 'Prism Ink Pack', desc: 'Apply Prism Ink to 2 random tiles in your bag. Prism tiles add +1 to the word multiplier when scored.', price: 25 },
    { id: 'sticker_dl', name: 'DL Sticker', desc: 'Apply a Double Letter multiplier to any board cell.', price: 10 },
    { id: 'sticker_tl', name: 'TL Sticker', desc: 'Apply a Triple Letter multiplier to any board cell.', price: 15 },
    { id: 'sticker_dw', name: 'DW Sticker', desc: 'Apply a Double Word multiplier to any board cell.', price: 15 },
    { id: 'sticker_tw', name: 'TW Sticker', desc: 'Apply a Triple Word multiplier to any board cell.', price: 15 },
    { id: 'sticker_qw', name: 'QW Sticker', desc: 'Apply a custom Quadruple Word (x4) multiplier to any board cell.', price: 25 },
    { id: 'sticker_gm', name: 'Gold Sticker', desc: 'Apply a Gold Multiplier (scores normal, but gives Gold equal to tile value).', price: 25 },
    { id: 'sticker_eraser', name: 'Eraser', desc: 'Remove a multiplier from any cell, or clear a locked tile from the board.', price: 10 },
    { id: 'buy_letter', name: 'Letter Pack', desc: 'Add 3 random letters to your starting bag.', price: 5 },
    // New ink packs
    { id: 'pack_storm', name: 'Storm Ink Pack', desc: 'Apply Storm Ink to 2 tiles. Storm tiles deal +3 bonus score to adjacent words.', price: 20 },
    { id: 'pack_echo', name: 'Echo Ink Pack', desc: 'Apply Echo Ink to 3 tiles. Echo tiles give +2 score when reused in future submissions.', price: 15 },
    // Utility items
    { id: 'hand_expansion', name: 'Hand Expansion', desc: 'Permanently increase your hand size by 1.', price: 30 },
    { id: 'bag_trimmer', name: 'Bag Trimmer', desc: 'Remove 5 random low-value tiles from your bag.', price: 10 },
    { id: 'golden_ticket', name: 'Golden Ticket', desc: 'Next round\'s target score is halved.', price: 50 }
];

export function triggerHook(hookName, context) {
    gameState.inventory.forEach(itemId => {
        const item = bookmarksRegistry[itemId];
        if (item && item.hooks && typeof item.hooks[hookName] === 'function') {
            item.hooks[hookName](gameState, context);
        }
    });
}

export const gameState = {
    board: Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)),
    bag: [],
    hand: [],
    score: 0,
    gold: 0,
    inventory: [],
    selectedHandIndices: new Set(),
    currentRound: 1,
    targetScore: 30,
    handsLeft: 4,
    discardsLeft: 3,
    dictionaryLoaded: false,
    dictionary: new Set(),
    selectedFontBagId: 'standard',
    handSize: 7,
    boardMultipliers: {},
    activeSticker: null,
    shopOffers: [],
    rerollCost: 2,
    purchasedLetters: [],
    goldenTicket: false,
    startCell: { x: 3, y: 3 },
    activeBoss: null,
    defeatedBosses: [],
    endlessNegativeCells: 0,
    kbdFocusedHandIndex: -1
};

export function saveGame() {
    const data = {
        board: gameState.board,
        bag: gameState.bag,
        hand: gameState.hand,
        score: gameState.score,
        gold: gameState.gold,
        inventory: gameState.inventory,
        currentRound: gameState.currentRound,
        targetScore: gameState.targetScore,
        handsLeft: gameState.handsLeft,
        discardsLeft: gameState.discardsLeft,
        selectedFontBagId: gameState.selectedFontBagId,
        handSize: gameState.handSize,
        boardMultipliers: gameState.boardMultipliers,
        activeSticker: gameState.activeSticker,
        shopOffers: gameState.shopOffers,
        rerollCost: gameState.rerollCost,
        purchasedLetters: gameState.purchasedLetters,
        startCell: gameState.startCell,
        goldenTicket: gameState.goldenTicket,
        activeBoss: gameState.activeBoss,
        defeatedBosses: gameState.defeatedBosses,
        endlessNegativeCells: gameState.endlessNegativeCells
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

export function loadSavedGame() {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return false;
    try {
        const data = JSON.parse(saved);
        gameState.board = data.board;
        gameState.bag = data.bag;
        gameState.hand = data.hand;
        gameState.score = data.score || 0;
        gameState.gold = data.gold || 0;
        gameState.inventory = data.inventory || [];
        gameState.currentRound = data.currentRound || 1;
        gameState.targetScore = data.targetScore || 30;
        gameState.handsLeft = data.handsLeft !== undefined ? data.handsLeft : 4;
        gameState.discardsLeft = data.discardsLeft !== undefined ? data.discardsLeft : 3;
        gameState.selectedFontBagId = data.selectedFontBagId || 'standard';
        gameState.handSize = data.handSize || 7;
        gameState.boardMultipliers = data.boardMultipliers || {};
        gameState.activeSticker = data.activeSticker || null;
        gameState.shopOffers = data.shopOffers || [];
        gameState.rerollCost = data.rerollCost !== undefined ? data.rerollCost : 2;
        gameState.purchasedLetters = data.purchasedLetters || [];
        gameState.startCell = data.startCell || { x: 3, y: 3 };
        gameState.goldenTicket = data.goldenTicket || false;
        gameState.activeBoss = data.activeBoss || null;
        gameState.defeatedBosses = data.defeatedBosses || [];
        gameState.endlessNegativeCells = data.endlessNegativeCells || 0;
        return true;
    } catch (e) {
        return false;
    }
}

export function deleteSavedGame() {
    localStorage.removeItem(SAVE_KEY);
}

// Removed unused swap cost logic - now based on bag capacity instead of discardsLeft
export function getSwapCost() { return 0; // No longer tracking swap costs via discards
}

export function getEndlessTargetScore(round) {
    if (round < 21) return round * 30;
    return Math.round(round * 35 + round * round * 1.5);
}

export function getEndlessHandSize(round, baseHandSize) {
    if (round <= 15) return baseHandSize;
    const reduction = Math.floor((round - 16) / 5) + 1;
    return Math.max(4, baseHandSize - reduction);
}

export function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
