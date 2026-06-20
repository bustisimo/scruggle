import { shopItems } from './state.js';

export const BOSSES = {
    ink_thief: {
        id: 'ink_thief',
        name: 'The Ink Thief',
        round: 3,
        emoji: '🦹',
        art: `
   🦹
  ╔═══╗
  ║ 🖋 ║
  ╚═══╝
  /│\\
  / \\
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
    🐛
  ╭───╮
  │ 📖 │
  ╰───╯
   /||\\
    /\\
  `,
        introText: 'The Word Eater devours words of 4+ letters — those tiles are gone forever!',
        rules: [
            'Words of 4 or more letters get consumed — tiles will NOT return to your bag.',
            'Short words (2-3 letters) are safe!',
            'Reach the target score by building with small words.'
        ],
        reward: { type: 'hand_size', desc: 'Permanent Hand Size +1' },
        onBossStart(state) {
            // No setup
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
    🗿💰🗿
   ╔═════╗
   ║ 💎  ║
   ╚═════╝
    /||||\\
     /  \\
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
        default:
            return { message: 'Boss defeated!' };
    }
}