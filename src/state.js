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
    // ── Bookmark pricing & gold economy ───────────────────────────────────
    // Gold earned per submission: Math.floor(wordScore / 5).
    // Typical earnings per hand (single word ~15-30 pts): 3-6 gold.
    // With crosswords (2-3 words per hand, 30-60 pts): 6-12 gold.
    // Average per round (4 hands): ~20-40 gold.
    //
    // By round 5 a player has earned roughly 80-200 gold cumulative,
    // but ~30-50g gets spent on early shop items, leaving ~50-120g
    // for bookmarks by round 5.
    //
    // Price tiers — calibrated so players can afford 1-2 bookmarks
    // by round 4, building a build-defining combo:
    //   15g (Focus):         Cheap starter. 2 rounds to recoup.
    //   20g (Hoarder/Recycler): Early-mid. Pays off in 3-5 rounds.
    //   25g (Efficiency/Alchemist/Combo Master): Mid-tier. ~3-6 rounds.
    //   30g (Touch/Patience/Arch/HandExp): Requires specific play to earn back.
    //   35g (Collector/Capitalist):  Late-game compounding — buy round 8+.
    //   40g (Scholar):       Premium — 2x gold on long words. Buy when flush.
    //   45g (Lucky Seven):   Luxury. Only worth it if 7-letter words are realistic.
    //
    // For comparison: Fire/Ice ink packs cost 15g (3 tiles). A bookmarks
    // at 15-25g competes with inks for the same gold pool. This feels right
    // — bookmarks are permanent upgrades, inks are consumable tile buffs.
    // ──────────────────────────────────────────────────────────────────────
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
        // NOTE: Originally "swaps cost 0 discards" — but getSwapCost() returns
        // 0 by default (discards were removed from the swap system). That made
        // this bookmark a complete no-op. Reworked to a useful effect:
        // +2 gold per word scored.
        // Gold economy: ~4 submissions/round × 1-2 words each = 4-8 extra gold
        // per round. At 25g, pays for itself in 3-6 rounds of normal play.
        // Compare Focus (15g, +2/turn) — Efficiency is more expensive but
        // triggers per-word instead of per-turn, rewarding multi-word crosses.
        desc: 'Each word scores +2 Gold.',
        price: 25,
        hooks: {
            onWordScored(state, context) {
                context.wordGold += 2;
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
    },
    'combo_master': {
        id: 'combo_master',
        name: 'Combo Master',
        desc: 'Doubles the bonus score earned from your combo/streak.',
        price: 25,
        hooks: {
            onComboScored(state, context) {
                context.comboMultiplier = 2;
            }
        }
    }
};

export const shopItems = [
    ...Object.values(bookmarksRegistry).map(({ id, name, desc, price }) => ({ id, name, desc, price })),
    { id: 'pack_fire', name: 'Fire Ink Pack', desc: 'Apply Fire Ink to 3 random tiles in your bag. Fire Ink doubles letter scoring.', price: 15 },
    { id: 'pack_ice', name: 'Ice Ink Pack', desc: 'Apply Ice Ink to 3 random tiles in your bag. Ice Ink tiles remain unlocked on submission, then melt.', price: 15 },
    { id: 'pack_gold', name: 'Gold Ink Pack', desc: 'Apply Gold Ink to 2 random tiles in your bag. Gold Ink yields +7 Gold when scored.', price: 20 },
    { id: 'pack_void', name: 'Void Ink Pack', desc: 'Apply Void Ink to 2 random tiles in your bag. Void Ink adds +18 Score, but disintegrates the tile after scoring.', price: 20 },
    // ── Ink pack price notes ──────────────────────────────────────────────
    // Comparative analysis (cost per tile × ongoing vs one-shot value):
    //
    // Tier 1 — Cheap activators (15g, 3 tiles = 5g/tile):
    //   Fire:  Double letter value each use. Per-tile: +2-4 extra per use.
    //          Ongoing. Best general-use ink at the price.
    //   Ice:   Stays unlocked on submission then melts. Board control.
    //          Ongoing for a round. Comparable to Fire.
    //   Echo:  +2 score when reused in future submissions. For locked tiles.
    //          Ongoing, but requires the tile to survive on board.
    //
    // Tier 2 — One-shot bonuses (20g, 2 tiles = 10g/tile):
    //   Gold:  +7 gold per tile scored. One-shot: +14g total per pack.
    //          v2 bumped from +5 → +7: at +5g, the pack cost 20g but you
    //          earned 10g max (2 tiles) — net loss of 10g. Even with
    //          tiles cycling back to bag, you'd need 3 scoring cycles to
    //          break even. At +7g (14g/pack), you recover 70% on first
    //          score and profit on the second cycle. Much healthier.
    //   Void:  +18 score per tile. One-shot: 36 total pts pack.
    //          v2 bumped from +15 → +18: +15 felt weak for losing a tile
    //          permanently. At +18/tile (36 total), the burst is worth
    //          the permanent bag shrinkage. ~1.8g/pt ratio vs Fire's
    //          ongoing ~0.42g/pt — fair trade for immediate impact.
    //   Storm: +3 bonus score to adjacent words. Ongoing but situational.
    //          Best on center tiles where it touches 3-4 adjacent words.
    //
    // Tier 3 — Compounders (25g, 2 tiles = 12.5g/tile):
    //   Growth: +1 value per use, compounds infinitely over rounds.
    //           ↑ was 20g — compounding value is OP at that price.
    //           At 25g, still the best long-term investment ink.
    //
    // Tier 4 — Game-changers (30g, 2 tiles = 15g/tile):
    //   Steel:  Stay unlocked on board forever. Permanent board control.
    //           ↑ was 20g — permanent board control is game-changing.
    //           At 30g competes with mid-range bookmarks; about right.
    //   Prism:  +1 word multiplier, stacks with other multipliers.
    //           ↑ was 25g — word mult stacking is top-tier. 30g right.
    //
    // ── Void vs Steel vs Prism comparison ─────────────────────────
    // All three are new-player traps in different ways, and that's
    // intentional — they teach different playstyles through cost:
    //
    //   Void (20g/2 tiles):
    //     One-shot 36pt burst. The tile is *consumed* — gone from
    //     your bag forever. Net bag size shrinks over the run.
    //     | Cost   | Benefit              | Duration  | Risk         |
    //     | 10g/tile | +18 pts, tile lost | one-shot  | Bag shrink  |
    //     Best use: push over the target line when you're short.
    //     Worst use: on rare letters (J/Q/X/Z) that you'd rather keep.
    //
    //   Steel (30g/2 tiles):
    //     Tile stays on board unlocked forever. Every future hand,
    //     that tile is pre-placed, saving you a tile placement and
    //     acting as a permanent anchor for crosswords.
    //     | Cost   | Benefit                | Duration | Risk        |
    //     | 15g/tile | Permanent board tile | Forever  | Tile locked |
    //     Best use: high-value consonants near center for repeated
    //     crossword use (S, T, R, N). Worst use: on edge cells where
    //     only 1-2 words can form.
    //
    //   Prism (30g/2 tiles):
    //     Word mult +1 that stacks with board multipliers. A prism
    //     on a DW cell gives 3×, on TW gives 4×. With 2 prisms
    //     active, you get +2× per word.
    //     | Cost   | Benefit           | Duration | Risk            |
    //     | 15g/tile | +1 word mult    | Ongoing  | Needs scoring   |
    //     Best use: pair with DW/TW cells for exponential returns.
    //     Worst use: on tiles that rarely get scored.
    //
    //   TL;DR: Void = urgent burst (20g), Steel = board control
    //   (30g), Prism = exponential scoring (30g). Void is cheaper
    //   because it's self-destructive. Steel and Prism cost the
    //   same but fill different roles — buy Steel for consistency,
    //   Prism for combo potential.
    // ──────────────────────────────────────────────────────────────
    //
    // General rule: ink packs are consumable (tiles get locked/consumed),
    // while bookmarks are permanent upgrades. Ink packs at 15-30g should
    // feel like powerful one-round boosts; bookmarks at 15-45g are
    // run-long investments. The overlap at 25-30g is deliberate —
    // players choose between instant power (inks) and lasting value
    // (bookmarks).
    // ──────────────────────────────────────────────────────────────────────
    { id: 'pack_growth', name: 'Growth Ink Pack', desc: 'Apply Growth Ink to 2 random tiles in your bag. Growth tiles permanently gain +1 value whenever scored.', price: 25 },
    { id: 'pack_steel', name: 'Steel Ink Pack', desc: 'Apply Steel Ink to 2 random tiles in your bag. Steel tiles remain on the board and stay unlocked forever, retaining Steel Ink.', price: 30 },
    { id: 'pack_prism', name: 'Prism Ink Pack', desc: 'Apply Prism Ink to 2 random tiles in your bag. Prism tiles add +1 to the word multiplier when scored.', price: 30 },
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
    kbdFocusedHandIndex: -1,
    combo: 0
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
        endlessNegativeCells: gameState.endlessNegativeCells,
        combo: gameState.combo
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
        gameState.combo = data.combo || 0;
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
    // ── Round scaling balance ─────────────────────────────────────────────
    // Formula rationale:
    //   Using `round × 30` everywhere would be punishing past round 5.
    //   At round 10 that's 300 pts in 4 hands = 75 pts/hand. A competitive
    //   crossword hand is ~40-60 pts; at 75 you'd need a bingo every hand.
    //   Hence the gentler `round × 24 + 10` for rounds 5-20.
    //
    //   Rounds 1-4:  round × 30          (gentle intro — 30, 60, 90, 120)
    //   Rounds 5-20: round × 24 + 10     (steady climb — 130 → 490)
    //   Rounds 21+:  round × 35 + r² × 1.5 (quadratic — brutal endgame)
    //
    // v2 adjustments (current):
    //   - Formula changed from round×30 to round×24+10 for 5-20.
    //     Round 6 dropped from 180 → 154, a 14% reduction.
    //   - Word Eater (round 6) factor reduced 0.60→0.55 AND +3 short-word
    //     bonus added (see bosses.js). Effective target: ceil(154 × 0.55) = 85,
    //     minus ~18-30 bonus pts from short crosswords = 55-67 actual need.
    //   - Bookmark prices: 15-45g range documented above. No formula change
    //     needed — the economy supports one affordable bookmark (15-20g)
    //     by round 3-4 and a build-defining combo by round 7-8.
    //
    // Per-hand scoring (standard 7-tile hand):
    //   Single 3-letter word:       5-12 pts  (e.g. CAT=5, THE=6, JAB=12)
    //   Single 4-letter word:       12-35 pts (with TL/DW boost)
    //   Crossword (2 short words):  20-50 pts (one on multiplier = big)
    //   With bookmark bonuses:      +2-15 gold + score boosts per turn
    //
    // Feasibility table (4 hands per round, avg player):
    //
    //   Round  | Target | pts/hand | Feasibility
    //   ------ | ------ | -------- | -----------
    //    1     |  30    |  7.5     | One short word. Very easy.
    //    3     |  90    | 22.5     | 3-letter + crosswords. Easy.
    //    5     | 130    | 32.5     | Needs 4-letter word + mult. Fair.
    //    6     | 154    | 38.5     | Word Eater at 0.55 = 85 + short bonus.
    //    8     | 202    | 50.5     | Good crosswords + some bookmarks.
    //   10     | 250    | 62.5     | Needs bookmarks + inks. Fair.
    //   15     | 370    | 92.5     | Strong build required. Hard.
    //   20     | 490    | 122.5    | Near-endgame. Very hard.
    //   25     | 1812   | 453.0    | Quadratic. Pure survival mode.
    //
    // At round 10 (250 pts), a player with 3-4 bookmarks and one ink pack
    // can average ~40-50 pts/hand from crosswords (20-40) + bookmark
    // bonuses (Focus +2, Efficiency +2-4, Collector +9-12). That puts
    // them at 55-65 pts/hand — still tight but winnable with discipline.
    //
    // Boss adjustments (in bosses.js):
    //   Round  3 Ink Thief:   no target change (steals tiles instead)
    //   Round  6 Word Eater:  ×0.55 + per-word +3 short bonus
    //   Round  9 Gilded Golem: ×1.5 (higher target, double gold)
    //   Round 12 Time Warp:   handsLeft=3 (fewer submissions)
    //   Round 15 The Mirror:  no target change
    //   Round 18 The Void:    ×0.75 (consumes tiles)
    //
    // ──────────────────────────────────────────────────────────────────────
    if (round < 5) return round * 30;
    if (round <= 20) return Math.floor(round * 24 + 10);
    return Math.floor(round * 35 + round * round * 1.5);
}

export function getEndlessHandSize(round, baseHandSize) {
    if (round <= 15) return baseHandSize;
    const reduction = Math.floor((round - 16) / 5) + 1;
    return Math.max(4, baseHandSize - reduction);
}

export function getEndlessNegativeCells(round) {
    if (round < 21) return 0;
    return Math.min(round - 20, GRID_SIZE * GRID_SIZE - 4);
}

export function getEndlessScalingInfo(round) {
    const info = [];
    if (round >= 21) {
        const nm = getEndlessNegativeCells(round);
        info.push(`🧊 ${nm} Negative cell${nm !== 1 ? 's' : ''} (score ÷2)`);
    }
    if (round > 15) {
        const activeBag = FONT_BAGS[gameState.selectedFontBagId || 'standard'] || FONT_BAGS.standard;
        const hs = getEndlessHandSize(round, activeBag.handSize);
        if (hs < activeBag.handSize) {
            info.push(`🃏 Hand size reduced to ${hs}`);
        }
    }
    return info;
}

export function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
