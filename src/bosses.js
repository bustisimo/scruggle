import { shopItems } from './state.js';

export const BOSSES = {
    ink_thief: {
        id: 'ink_thief',
        name: 'The Ink Thief',
        round: 3,
        emoji: '🦹',
        art: `
      ╔══════════════════════════════════╗
      ║        ༺ 🦹 The Ink Thief ༻     ║
      ║    ╔════════════════════════╗    ║
      ║    ║  🎭  🖋️  ✂️  📄  🎭  ║    ║
      ║    ║  🖋️  ⚫  🎭  ⚫  🖋️  ║    ║
      ║    ║  ✂️  🖋️  📄  ✂️  🖋️  ║    ║
      ║    ║  🎭  ⚫  🖋️  ⚫  🎭  ║    ║
      ║    ╚════════════════════════╝    ║
      ║     ╱ │ ╲          ╱ │ ╲        ║
      ║    ╱  │  ╲        ╱  │  ╲       ║
      ║   ╱   │   ╲      ╱   │   ╲      ║
      ╚══════════════════════════════════╝
  `,
        introText: 'The Ink Thief snatches tiles from your hand after each submission!',
        rules: [
            'After every submission, the thief steals 2 random tiles from your hand.',
            'Tiles are permanently removed from this round.',
            'Reach the target score before you run out of tiles!'
        ],
        reward: { type: 'random_ink', desc: 'Rare Ink Pack (random)' },
        onBossStart(state) {
            // No setup needed — mechanic is per-submission
        },
        onSubmission(state) {
            // Steal 2 random tiles from hand
            const stolen = [];
            for (let i = 0; i < 2; i++) {
                if (state.hand.length === 0) break;
                const idx = Math.floor(Math.random() * state.hand.length);
                const tile = state.hand.splice(idx, 1)[0];
                stolen.push(tile);
            }
            return {
                message: stolen.length > 0
                    ? `🦹 The Ink Thief steals: ${stolen.map(t => t.letter).join(', ')}!`
                    : '🦹 The Ink Thief reaches for tiles but your hand is empty!',
                stolen
            };
        }
    },

    word_eater: {
        id: 'word_eater',
        name: 'The Word Eater',
        round: 6,
        emoji: '🐛',
        art: `
      ╔══════════════════════════════════╗
      ║       ༺ 🐛 The Word Eater ༻     ║
      ║    ╔════════════════════════╗    ║
      ║    ║  📖 📚 📖  🄰 🄱 🄲  ║    ║
      ║    ║  📕 📗 📘  🅰 🅱 🅲  ║    ║
      ║    ║  📖 📚 📖  🄳 🄴 🄵  ║    ║
      ║    ║   📖🅰🅱🅲📖        ║    ║
      ║    ╚════════════════════════╝    ║
      ║     ╱╲              ╱╲           ║
      ║    ╱  ╲            ╱  ╲          ║
      ║   ╱    ╲          ╱    ╲         ║
      ╚══════════════════════════════════╝
  `,
        introText: 'The Word Eater devours words of 4+ letters — those tiles are gone forever!',
        rules: [
            'Words of 4 or more letters get consumed — tiles will NOT return to your bag.',
            'Short words (2-3 letters) are safe!',
            'Reach the target score by building with small words.'
        ],
        reward: { type: 'hand_size', desc: 'Permanent Hand Size +1' },
        onBossStart(state) {
            // ── Word Eater target balance ────────────────────────────────
            // This boss restricts submissions to 2-3 letter words — any word
            // of 4+ letters is eaten (tiles lost forever). With only short
            // words, typical scoring drops significantly.
            //
            // Realistic scoring estimates with 2-3 letter words only:
            //   2-letter word:    4-8  pts (two common letters ± TL)
            //   3-letter word:   12-20 pts (three letters; avg value ~5)
            //   With crosswords: 20-40 pts per hand (2 overlapping short words)
            //
            // At round 6, base target = 174 (6×24+30). With 70% factor:
            //   target = 174 × 0.70 = 122
            //   4 hands × avg 30 pts (single 3-letter + crosswords) = 120 pts
            //   → Barely achievable with good play and board multipliers.
            //
            // At 60%: target = 174 × 0.60 = 104
            //   → Comfortable — 4 × 26 pts avg, easily doable with crosswords
            //
            // At 65%: target = 174 × 0.65 = 113
            //   → Sweet spot — requires consistent short-word crosswords
            //     without being punishing. Rewards players who build
            //     intersecting 2-3 letter words and use board multipliers.
            //
            // The boss is supposed to feel restrictive, not impossible.
            // 65% (113 pts at round 6) is challenging but winnable.
            // ──────────────────────────────────────────────────────────────
            state.targetScore = Math.ceil(state.targetScore * 0.65);
        },
        onSubmission(state) {
            // Return empty — the "eaten" logic is in main.js where we check word length
            return { message: null };
        },
        shouldEatWord(word) {
            return word.length >= 4;
        }
    },

    gilded_golem: {
        id: 'gilded_golem',
        name: 'The Gilded Golem',
        round: 9,
        emoji: '🗿',
        art: `
      ╔══════════════════════════════════╗
      ║     ༺ 🗿 The Gilded Golem ༻     ║
      ║    ╔════════════════════════╗    ║
      ║    ║  💰  💎  🪙  💎  💰  ║    ║
      ║    ║  💛  ✨  🥇  ✨  💛  ║    ║
      ║    ║  🪙  💎  💰  💎  🪙  ║    ║
      ║    ║  ✨  🥇  💛  🥇  ✨  ║    ║
      ║    ╚════════════════════════╝    ║
      ║    ╱ │ ╲          ╱ │ ╲         ║
      ║   ╱  │  ╲        ╱  │  ╲        ║
      ║  ╱   │   ╲      ╱   │   ╲       ║
      ╚══════════════════════════════════╝
  `,
        introText: 'The Gilded Golem raises the stakes — target is 1.5x higher, but all gold earnings are doubled!',
        rules: [
            'Target score is increased by 50% (1.5x).',
            'All gold earned from submissions is DOUBLED.',
            'Reach the boosted target and claim massive gold!'
        ],
        reward: { type: 'gold_bonus', desc: '100 Bonus Gold' },
        onBossStart(state) {
            state.targetScore = Math.ceil(state.targetScore * 1.5);
        },
        onSubmission(state) {
            return { message: null, goldMultiplier: 2 };
        }
    },

    time_warp: {
        id: 'time_warp',
        name: 'The Time Warp',
        round: 12,
        emoji: '⏳',
        art: `
      ╔══════════════════════════════════╗
      ║       ༺ ⏳ The Time Warp ༻      ║
      ║    ╔════════════════════════╗    ║
      ║    ║  ⏰  ⌛  ⏳  ⌛  ⏰  ║    ║
      ║    ║  ◀️  ⏰  ⏳  ⏰  ▶️  ║    ║
      ║    ║  ⏳  ◀️  ⌛  ▶️  ⏳  ║    ║
      ║    ║  ⏰  ⏳  ⌛  ⏳  ⏰  ║    ║
      ║    ╚════════════════════════╝    ║
      ║    ╱ │ ╲          ╱ │ ╲         ║
      ║   ╱  │  ╲        ╱  │  ╲        ║
      ║  ╱   │   ╲      ╱   │   ╲       ║
      ╚══════════════════════════════════╝
  `,
        introText: 'The Time Warp distorts time itself — fewer moves, but every gold find is tripled!',
        rules: [
            'You only get 3 hands instead of 4.',
            'All gold earned from submissions is TRIPLED (3x).',
            'Race against the clock with fewer moves but massive payouts!'
        ],
        reward: { type: 'time_essence', desc: 'Permanent +1 Hand per Round Start' },
        onBossStart(state) {
            state.handsLeft = 3;
        },
        onSubmission(state) {
            return { message: null, goldMultiplier: 3 };
        }
    },

    the_mirror: {
        id: 'the_mirror',
        name: 'The Mirror',
        round: 15,
        emoji: '🪞',
        art: `
      ╔══════════════════════════════════╗
      ║       ༺ 🪞 The Mirror ༻        ║
      ║    ╔════════════════════════╗    ║
      ║    ║  🃏  ☯  🪞  ☯  🃏  ║    ║
      ║    ║  🪞  ⚪  ⬛  ⚪  🪞  ║    ║
      ║    ║  🃏  ☯  🪞  ☯  🃏  ║    ║
      ║    ║  🪞  ⚪  🃏  ⚪  🪞  ║    ║
      ║    ╚════════════════════════╝    ║
      ║    ╱ │ ╲          ╱ │ ╲         ║
      ║   ╱  │  ╲        ╱  │  ╲        ║
      ║  ╱   │   ╲      ╱   │   ╲       ║
      ╚══════════════════════════════════╝
  `,
        introText: 'The Mirror reflects your every move! Placed tiles appear mirrored on the opposite side of the board.',
        rules: [
            'Every tile you place creates a mirrored copy at the opposite board position.',
            'Mirrored tiles count toward word formation and scoring.',
            'Work with the reflection to meet the target score!'
        ],
        reward: { type: 'mirror_shard', desc: 'Mirror Shard — doubles one submission score next round' },
        onBossStart(state) {
            // No special setup
        },
        onSubmission(state) {
            // Mirror logic handled in main.js — returns info about mirrored tiles
            const mirroredPairs = [];
            for (let y = 0; y < 7; y++) {
                for (let x = 0; x < 7; x++) {
                    const tile = state.board[y][x];
                    const mx = 6 - x;
                    const my = 6 - y;
                    if (tile && !tile.isLocked && !state.board[my][mx]) {
                        mirroredPairs.push({ from: { x, y }, to: { x: mx, y: my } });
                    }
                }
            }
            return {
                message: mirroredPairs.length > 0
                    ? `🪞 Mirror reflects ${mirroredPairs.length} tile${mirroredPairs.length > 1 ? 's' : ''}!`
                    : null,
                mirroredPairs
            };
        }
    },

    the_void: {
        id: 'the_void',
        name: 'The Void',
        round: 18,
        emoji: '🕳️',
        art: `
      ╔══════════════════════════════════╗
      ║        ༺ 🕳️ The Void ༻         ║
      ║    ╔════════════════════════╗    ║
      ║    ║  🌌  ∞  🕳️  ∞  🌌  ║    ║
      ║    ║  ⚫  🌌  ⚫  🌌  ⚫  ║    ║
      ║    ║  ∞  ⬛  🕳️  ⬛  ∞  ║    ║
      ║    ║  ⚫  🌌  ⚫  🌌  ⚫  ║    ║
      ║    ╚════════════════════════╝    ║
      ║    ╱ │ ╲          ╱ │ ╲         ║
      ║   ╱  │  ╲        ╱  │  ╲        ║
      ║  ╱   │   ╲      ╱   │   ╲       ║
      ╚══════════════════════════════════╝
  `,
        introText: 'The Void consumes everything — each submission devours all placed tiles forever, but the target is lower.',
        rules: [
            'After each submission, ALL non-locked tiles are consumed by the void and lost permanently.',
            'Tiles do NOT return to your bag — gone forever.',
            'Target score is reduced by 25% to compensate.'
        ],
        reward: { type: 'void_gold', desc: '200 Gold from the Void\'s remains' },
        onBossStart(state) {
            state.targetScore = Math.floor(state.targetScore * 0.75);
        },
        onSubmission(state) {
            // The actual tile destruction is handled in main.js
            return { message: null, voidActive: true };
        }
    }
};

/**
 * Determine if a boss should appear this round.
 * Bosses appear every 3 rounds (3, 6, 9, 12...).
 * Each boss only appears once per run.
 */
export function getBossForRound(round, defeatedBosses) {
    if (round % 3 !== 0) return null;

    // Find the first boss whose round matches and hasn't been defeated this run
    const bossEntries = Object.values(BOSSES).sort((a, b) => a.round - b.round);
    for (const boss of bossEntries) {
        if (round >= boss.round && !defeatedBosses.includes(boss.id)) {
            return boss;
        }
    }
    return null;
}

/**
 * Apply boss reward after defeat.
 */
export function applyBossReward(state, boss) {
    const reward = boss.reward;
    switch (reward.type) {
        case 'random_ink': {
            // Give a random rare ink pack
            const rareInks = shopItems.filter(i =>
                i.id.startsWith('pack_') &&
                !['pack_fire', 'pack_ice', 'pack_gold'].includes(i.id) // give rarer ones
            );
            if (rareInks.length === 0) {
                // Fallback to any ink
                const anyInk = shopItems.filter(i => i.id.startsWith('pack_'));
                const chosen = anyInk[Math.floor(Math.random() * anyInk.length)];
                return { item: chosen, message: `Obtained: ${chosen.name}! 🎁` };
            }
            const chosen = rareInks[Math.floor(Math.random() * rareInks.length)];
            return { item: chosen, message: `The Ink Thief drops a ${chosen.name}! 🎁` };
        }
        case 'hand_size': {
            state.handSize += 1;
            return { message: 'Hand size permanently increased by 1! 🃏' };
        }
        case 'gold_bonus': {
            state.gold += 100;
            return { message: 'The Golem crumbles, dropping 100 gold! 💰' };
        }
        case 'time_essence': {
            state.handSize += 1;
            return { message: 'You absorb Time Essence — hand size permanently +1! ⏳' };
        }
        case 'mirror_shard': {
            state.inventory.push('mirror_shard_buff');
            return { message: 'You claim a Mirror Shard — next round starts with 2x score on one submission! 🪞' };
        }
        case 'void_gold': {
            state.gold += 200;
            return { message: 'The Void collapses, showering 200 gold! 🕳️💰' };
        }
        default:
            return { message: 'Boss defeated!' };
    }
}