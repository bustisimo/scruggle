import { shopItems } from './state.js';

export const BOSSES = {
    ink_thief: {
        id: 'ink_thief',
        name: 'The Ink Thief',
        round: 3,
        emoji: '🦹',
        art: `\
                    ╔═══════════════╗
                 ╔══╝███████████████╚══╗
               ╔═╝     ▄▄▄▄▄▄▄▄▄     ╚═╗
              ╔╝    ▄▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▄    ╚╗
             ╔╝    █    ░░░░░░░░░░░    █    ╚╗
             ║    █   ░█████░ ░█████░   █    ║
             ║    █   ░█████░ ░█████░   █    ║
             ║    █   ░█████░ ░█████░   █    ║
             ║    █    ░░░░░░░░░░░░░    █    ║
             ║    █   ▄▄▄▄▄▄▄▄▄▄▄▄▄   █    ║
             ║    █   █ A █ B █ C █   █    ║
             ║    █   █ D █ E █ F █   █    ║
             ║    █   █ G █ H █ I █   █    ║
             ║    █   ▀▀▀▀▀▀▀▀▀▀▀▀▀   █    ║
             ║    █      ░░░░░░░░░      █    ║
             ║    █    ╔═══════════╗    █    ║
             ║    █    ║ steal! ║    █    ║
             ║    █    ╚═══════════╝    █    ║
             ║     ▀▄    ▄▄▄▄▄▄▄    ▄▀     ║
             ║       ▀▄▄▀▀▀▀▀▀▀▄▄▀       ║
             ║          ╔══╗ ╔══╗          ║
             ║          ║  ║ ║  ║          ║
             ║          ╚══╝ ╚══╝          ║
             ╚╗    ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄    ╔╝
              ╚╗    █████████████████    ╔╝
                ╚╗                       ╔╝
                  ╚═══════════════════════╝
      A cloaked figure reaching for your tiles...`,

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
        art: `\
             ╔═══════════════════════════════╗
          ╔══╝                               ╚══╗
        ╔═╝    ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄    ╚═╗
       ╔╝   ▄▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▄   ╚╗
      ╔╝   █                                         █   ╚╗
      ║   █    ███████████████████████████████    █   ║
      ║   █   █                                   █   █   ║
      ║   █   █   A  B  C  D  E  F  G  H  I   █   █   ║
      ║   █   █    ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀    █   █   ║
      ║   █   █         ▄▄▄▄▄▄▄▄▄▄▄          █   █   ║
      ║   █   █    ▄▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▄     █   █   ║
      ║   █   █   █   ╔══╗ ╔══╗ ╔══╗   █   █   █   ║
      ║   █   █   █   ║  ║ ║  ║ ║  ║   █   █   █   ║
      ║   █   █   █   ╚══╝ ╚══╝ ╚══╝   █   █   █   ║
      ║   █   █    ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀    █   █   ║
      ║   █    █                           █    █   ║
      ║   █    ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀    █   ║
      ║   █       ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄       █   ║
      ║    █    █   ●  ●  ●  ●  ●  ●  ●   █    █   ║
      ║     ▀▄   █                         █   ▄▀   ║
      ║       ▀▄  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀  ▄▀     ║
      ╚╗        ▀▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▀        ╔╝
        ╚╗                                     ╔╝
          ╚══╗                             ╔══╝
              ╚═════════════════════════════╝
        A ravenous worm devouring long words!`,

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
            // words, typical scoring drops dramatically.
            //
            // v2 balance update: factor bumped from 0.55 → 0.60.
            // At 0.55 (target=96, 24 pts/hand), even skilled players with
            // good multiplier luck were barely scraping by. 2-letter words
            // average 5 pts, 3-letter average 6-8 pts. With a cross on a
            // DL you hit ~14-20 pts/hand. 24 pts/hand required a cross+mult
            // every single hand — too punishing for a first-time encounter.
            //
            // At 0.60 (target=93, 23.25 pts/hand) — slightly gentler target
            // due to the new round scaling formula alone. The factor gives
            // the same relative reduction, but the base is now 154 instead
            // of 174, so the absolute target drops to 93.
            //
            // Realistic scoring with 2-3 letter words only:
            //   2-letter word:      2-6  pts (e.g. IT=2, OX=9, JO=10)
            //   3-letter word:      5-12 pts (e.g. CAT=5, THE=6, JAB=12)
            //   With crosswords:   15-35 pts per hand (overlapping short words)
            //   With board mults:  20-50 pts per hand (one DW/TL boost)
            //
            // A cross-word pair (2 words, one on a DL or DW) = 25-35 pts.
            // Achievable in 3 of 4 hands = 75-105 pts. At 93 target, you
            // need ~23 pts/hand — a single 3-letter word on a DW (12 pts)
            // crossed with a 2-letter word on a DL (10 pts) = 22. Close.
            // With a better combo (JAB on DW=24, cross with IT=4): 28.
            //
            // The boss should feel restrictive but winnable — the challenge
            // is "make do with small words and board multipliers", not
            // "grind for 4+ crosswords every hand or lose".
            // ──────────────────────────────────────────────────────────────
            state.targetScore = Math.ceil(state.targetScore * 0.60);
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
        art: `\
                   ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
                ▄▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▄
              ▄▀                                       ▀▄
             ▌      ▄▄▄▄▄▄▄▄    ▄▄▄▄▄▄▄▄    ▄▄▄▄▄▄▄▄      ▐
             ▌     █ ███████ █  █ ███████ █  █ ███████ █     ▐
             ▌     █ █  ●  █ █  █ █  ●  █ █  █ █  ●  █ █     ▐
             ▌     █ █     █ █  █ █     █ █  █ █     █ █     ▐
             ▌     █  ▀▀▀▀▀▀▀   █  ▀▀▀▀▀▀▀   █  ▀▀▀▀▀▀▀  █     ▐
             ▌      █         █    █         █    █         █      ▐
             ▌      █  ▄▄▄▄▄  █    █  ▄▄▄▄▄  █    █  ▄▄▄▄▄  █      ▐
             ▌      █  █   █  █    █  █   █  █    █  █   █  █      ▐
             ▌      █  █   █  █    █  █   █  █    █  █   █  █      ▐
             ▌      █  ▀▀▀▀▀  █    █  ▀▀▀▀▀  █    █  ▀▀▀▀▀  █      ▐
             ▌       █       █      █       █      █       █       ▐
             ▌    ▄▄▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▄▄    ▐
             ▌   █ ▗▄▄▟▙▄▄▖█          █▗▄▄▟▙▄▄▖█   ▐
             ▌   █                     █                     █   ▐
             ▌   █    ╔══╗  ╔══╗  ╔══╗    █   ▐
             ▌   █    ║  ║  ║  ║  ║  ║    █   ▐
             ▌   █    ╚══╝  ╚══╝  ╚══╝    █   ▐
             ▌    █                           █    ▐
             ▐     ▀▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▀     ░
               ▀▄▄                                     ▄▄▀
                  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
        A towering statue of solid gold and stone!`,

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
        art: `\
        ╔═══════════════════════════════════════╗
        ║    ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄    ║
        ║   █                                     █   ║
        ║   █     ╔═══════════════════════╗     █   ║
        ║   █     ║    ⏰   →   ⏳    ║     █   ║
        ║   █     ║    past→future    ║     █   ║
        ║   █     ╚═══════════════════════╝     █   ║
        ║   █                                     █   ║
        ║   █     ◀  ⏰  ⌛  ⏳  ▶     █   ║
        ║   █       ╔═══════════════╗       █   ║
        ║   █       ║   time bends  ║       █   ║
        ║   █       ║   ⌛  →  ⏳   ║       █   ║
        ║   █       ╚═══════════════╝       █   ║
        ║   █     ▶  ⌛  ⏰  ⏳  ◀     █   ║
        ║   █                                     █   ║
        ║   █     ╔═══════════════════════╗     █   ║
        ║   █     ║   3 moves → 3x gold ║     █   ║
        ║   █     ╚═══════════════════════╝     █   ║
        ║   █         ▄▄▄▄▄▄▄▄▄▄▄▄▄          █   ║
        ║   █        █   ╔══╗ ╔══╗   █         █   ║
        ║   █        █   ║3 ║ ║4 ║   █         █   ║
        ║   █        █   ╚══╝ ╚══╝   █         █   ║
        ║   █         ▀▀▀▀▀▀▀▀▀▀▀▀▀          █   ║
        ║    █                                     █    ║
        ║     ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀     ║
        ║         ╔══╗         ╔══╗         ║
        ║         ║∞ ║         ║∞ ║         ║
        ║         ╚══╝         ╚══╝         ║
        ╚═══════════════════════════════════════╝
        Time bends around you — fewer moves, bigger rewards!`,

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
        art: `\
             ╔═══════════════════════════════════╗
             ║   ╔═══════════════════════════╗   ║
             ║   ║   ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄   ║   ║
             ║   ║  █                         █  ║   ║
             ║   ║  █    ╔══════════════╗    █  ║   ║
             ║   ║  █    ║  ◀ REFLECT ▶ ║    █  ║   ║
             ║   ║  █    ║   A  ↔  Z    ║    █  ║   ║
             ║   ║  █    ║   B  ↔  Y    ║    █  ║   ║
             ║   ║  █    ║   C  ↔  X    ║    █  ║   ║
             ║   ║  █    ║   D  ↔  W    ║    █  ║   ║
             ║   ║  █    ║   .  ↔  .    ║    █  ║   ║
             ║   ║  █    ║   .  ↔  .    ║    █  ║   ║
             ║   ║  █    ╚══════════════╝    █  ║   ║
             ║   ║  █      ▄▄▄▄▄▄▄▄▄       █  ║   ║
             ║   ║  █     █  ☯  ☯  ☯  █      █  ║   ║
             ║   ║  █     █ ▶ ◀ ▶ ◀ █      █  ║   ║
             ║   ║  █      ▀▀▀▀▀▀▀▀▀       █  ║   ║
             ║   ║   █                       █   ║   ║
             ║   ║    ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀    ║   ║
             ║   ╚═══════════════════════════╝   ║
             ║        █               █           ║
             ║         ▀▀▀▀▀     ▀▀▀▀▀            ║
             ║     ╔══╗         ╔══╗           ║
             ║     ║  ║         ║  ║           ║
             ║     ╚══╝         ╚══╝           ║
             ╚═══════════════════════════════════╝
        Every move has an equal and opposite reflection!`,

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
        art: `\
               ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
            ▄█████████████████████████████████████▄
          ▄███                                         ███▄
         ████     ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄     ████
        ███     ▄▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▄     ███
        ██     █                                             █     ██
       ██     █     ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀     █     ██
       ██     █    █     ░░░░░░░░░░░░░░░░░░░     █    █     ██
       ██     █    █    ███████████████████    █    █     ██
       ██     █    █    █   ⬛  ⬛  ⬛   █    █    █     ██
       ██     █    █    █  🕳️   ∞   🕳️  █    █    █     ██
       ██     █    █    █   ⬛  ⬛  ⬛   █    █    █     ██
       ██     █    █    ███████████████████    █    █     ██
       ██     █    █     ░░░░░░░░░░░░░░░░░░░     █    █     ██
       ██     █     ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀     █     ██
        ██     █                                             █     ██
        ███     ▀▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▀     ███
         ████     ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀     ████
           ████                                         ████
             ▀███████████████████████████████████████▀
                ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
        An endless abyss consuming everything it touches...`,

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