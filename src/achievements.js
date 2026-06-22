const ACHIEVEMENTS_KEY = 'scruggle_achievements';

export const achievements = [
    { id: 'first_word', name: 'First Word', desc: 'Submit your first word', icon: '📝',
        check(state, stats, context) { return context.totalWords >= 1; }},
    { id: 'golden', name: 'Golden', desc: 'Earn 50 total gold', icon: '🪙',
        check(state, stats, context) { return stats.totalGold >= 50; }},
    { id: 'gold_500', name: 'Gold Rush', desc: 'Earn 500 total gold', icon: '💰',
        check(state, stats, context) { return stats.totalGold >= 500; }},
    { id: 'gold_1000', name: 'Gold Magnate', desc: 'Earn 1000 total gold', icon: '💎',
        check(state, stats, context) { return stats.totalGold >= 1000; }},
    { id: 'centurion', name: 'Centurion', desc: 'Score 100+ points in a single round', icon: '💯',
        check(state, stats, context) { return state.score >= 100; }},
    { id: 'wordsmith', name: 'Wordsmith', desc: 'Submit 50 total words', icon: '📚',
        check(state, stats, context) { return stats.totalWords >= 50; }},
    { id: 'words_200', name: 'Novelist', desc: 'Submit 200 total words', icon: '📖',
        check(state, stats, context) { return stats.totalWords >= 200; }},
    { id: 'words_500', name: 'Wordsmith Extraordinaire', desc: 'Submit 500 total words', icon: '📕',
        check(state, stats, context) { return stats.totalWords >= 500; }},
    { id: 'high_roller', name: 'High Roller', desc: 'Hold 200+ gold at once', icon: '💰',
        check(state, stats, context) { return state.gold >= 200; }},
    { id: 'bibliophile', name: 'Bibliophile', desc: 'Own 5+ bookmarks', icon: '🔖',
        check(state, stats, context) { return state.inventory.filter(id => !id.startsWith('sticker_') && !id.startsWith('pack_') && id !== 'buy_letter').length >= 5; }},
    { id: 'ink_master', name: 'Ink Master', desc: 'Apply all 7 ink types in one run', icon: '🎨',
        check(state, stats, context) {
            const inked = new Set();
            [...state.hand, ...state.bag, ...state.board.flat().filter(Boolean)].forEach(t => { if (t.ink) inked.add(t.ink); });
            return inked.size >= 7;
        }},
    { id: 'speed_run', name: 'Speed Run', desc: 'Win a round in 3 or fewer hands', icon: '⚡',
        check(state, stats, context) { return context.roundWon && state.handsLeft >= 2; }},
    { id: 'marathon', name: 'Marathon', desc: 'Reach round 5', icon: '🏃',
        check(state, stats, context) { return state.currentRound >= 5; }},
    { id: 'round_10', name: 'Deep Dive', desc: 'Reach round 10', icon: '🔟',
        check(state, stats, context) { return state.currentRound >= 10; }},
    { id: 'round_20', name: 'Infinite', desc: 'Reach round 20', icon: '♾️',
        check(state, stats, context) { return state.currentRound >= 20; }},
    { id: 'perfectionist', name: 'Perfectionist', desc: 'Win a round with 4 hands remaining', icon: '✨',
        check(state, stats, context) { return context.roundWon && state.handsLeft >= 4; }},
    { id: 'collector', name: 'Collector', desc: 'Own every sticker type', icon: '🏆',
        check(state, stats, context) {
            const stickerIds = ['sticker_dl','sticker_tl','sticker_dw','sticker_tw','sticker_qw','sticker_gm','sticker_eraser'];
            return stickerIds.every(sid => state.inventory.includes(sid));
        }},
    { id: 'first_win', name: 'First Victory', desc: 'Win your first round', icon: '🎉',
        check(state, stats, context) { return context.roundWon; }},
    { id: 'boss_slayer', name: 'Boss Slayer', desc: 'Defeat your first boss', icon: '⚔️',
        check(state, stats, context) { return !!context.bossDefeated; }},
    { id: 'boss_collector', name: 'Boss Collector', desc: 'Defeat all 3 original bosses in one run', icon: '👹',
        check(state, stats, context) {
            const originals = ['ink_thief', 'word_eater', 'gilded_golem'];
            return context.defeatedBosses && originals.every(id => context.defeatedBosses.includes(id));
        }},
    { id: 'overkill', name: 'Overkill', desc: 'Score 300+ in a single turn', icon: '💥',
        check(state, stats, context) { return context.turnScore >= 300; }},
    { id: 'bookmark_master', name: 'Bookmark Master', desc: 'Use every bookmark type across all runs', icon: '📑',
        check(state, stats, context) {
            const allBookmarks = ['focus','efficiency','scholar','golden_touch','patience','collector','capitalist','lucky_seven','alchemist','architect','hoarder','recycler'];
            return allBookmarks.every(bid => stats.bookmarksUsed?.includes(bid));
        }},
    { id: 'ascetic', name: 'Ascetic', desc: 'Win a round without buying anything', icon: '🧘',
        check(state, stats, context) { return context.roundWon && state.inventory.length === 0; }},
    { id: 'ink_collector', name: 'Ink Connoisseur', desc: 'Use all 9 ink types', icon: '🌈',
        check(state, stats, context) {
            const allInks = ['fire','ice','gold','void','growth','steel','prism','storm','echo'];
            return allInks.every(i => stats.inksUsed?.includes(i));
        }},
    { id: 'decade', name: 'Decade of Wins', desc: 'Win 10 rounds total', icon: '🏅',
        check(state, stats, context) { return stats.totalWins >= 10; }},
    // ── New achievements ──────────────────────────────────────────────────
    { id: 'sapphire', name: 'Sapphire', desc: 'Earn 5,000 total gold', icon: '🔷',
        check(state, stats, context) { return stats.totalGold >= 5000; }},
    { id: 'millionaire', name: 'Millionaire', desc: 'Earn 10,000 total gold', icon: '💎',
        check(state, stats, context) { return stats.totalGold >= 10000; }},
    { id: 'diamond', name: 'Diamond Hands', desc: 'Hold 500+ gold at once', icon: '💠',
        check(state, stats, context) { return state.gold >= 500; }},
    { id: 'tycoon', name: 'Tycoon', desc: 'Hold 1,000+ gold at once', icon: '🏦',
        check(state, stats, context) { return state.gold >= 1000; }},
    { id: 'godspeed', name: 'Godspeed', desc: 'Submit 2,000 total words', icon: '🚀',
        check(state, stats, context) { return stats.totalWords >= 2000; }},
    { id: 'legend', name: 'Legend', desc: 'Submit 5,000 total words', icon: '📜',
        check(state, stats, context) { return stats.totalWords >= 5000; }},
    { id: 'unstoppable', name: 'Unstoppable', desc: 'Win 50 rounds total', icon: '🔥',
        check(state, stats, context) { return stats.totalWins >= 50; }},
    { id: 'backbone', name: 'Backbone', desc: 'Reach round 30', icon: '🦴',
        check(state, stats, context) { return state.currentRound >= 30; }},
    { id: 'endless', name: 'Endless', desc: 'Reach round 50', icon: '♾️',
        check(state, stats, context) { return state.currentRound >= 50; }},
    { id: 'veteran', name: 'Veteran', desc: 'Reach round 100', icon: '🎖️',
        check(state, stats, context) { return state.currentRound >= 100; }},
    { id: 'supernova', name: 'Supernova', desc: 'Score 500+ in a single turn', icon: '💫',
        check(state, stats, context) { return context.turnScore >= 500; }},
    { id: 'clutch', name: 'Clutch', desc: 'Win on the very last hand', icon: '🎯',
        check(state, stats, context) { return context.roundWon && state.handsLeft === 0; }},
    // ── New milestones ────────────────────────────────────────────────────
    { id: 'gem_collector', name: 'Gem Collector', desc: 'Earn 2,500 total gold', icon: '🔷',
        check(state, stats, context) { return stats.totalGold >= 2500; }},
    { id: 'word_artist', name: 'Word Artist', desc: 'Submit 1,000 total words', icon: '📖',
        check(state, stats, context) { return stats.totalWords >= 1000; }},
    { id: 'half_century', name: 'Half-Century', desc: 'Win 25 rounds total', icon: '🏅',
        check(state, stats, context) { return stats.totalWins >= 25; }},
    // ── Board fill ────────────────────────────────────────────────────────
    { id: 'board_filler', name: 'Board Filler', desc: 'Fill 40+ cells on the board in one round', icon: '🟦',
        check(state, stats, context) {
            const locked = state.board.flat().filter(c => c && c.isLocked).length;
            return locked >= 40;
        }},
    { id: 'board_dominator', name: 'Board Dominator', desc: 'Fill every cell on the board in one round', icon: '💪',
        check(state, stats, context) {
            const locked = state.board.flat().filter(c => c && c.isLocked).length;
            return locked >= 49;
        }},
    // ── Gold / economy ────────────────────────────────────────────────────
    { id: 'golden_ending', name: 'Golden Ending', desc: 'Win a round with 100+ gold remaining', icon: '👑',
        check(state, stats, context) { return context.roundWon && state.gold >= 100; }},
    // ── Ink ───────────────────────────────────────────────────────────────
    { id: 'ink_apprentice', name: 'Ink Apprentice', desc: 'Have 3+ different ink types in play at once', icon: '🎨',
        check(state, stats, context) {
            const inked = new Set();
            [...state.hand, ...state.bag, ...state.board.flat().filter(Boolean)].forEach(t => { if (t.ink) inked.add(t.ink); });
            return inked.size >= 3;
        }},
    { id: 'ink_expert', name: 'Ink Expert', desc: 'Have 5+ inked tiles in play at once', icon: '🎭',
        check(state, stats, context) {
            const inked = [...state.hand, ...state.bag, ...state.board.flat().filter(Boolean)].filter(t => t && t.ink);
            return inked.length >= 5;
        }},
    // ── Bookmarks ─────────────────────────────────────────────────────────
    { id: 'bookmark_king', name: 'Bookmark King', desc: 'Own 10+ bookmark types at once', icon: '📚',
        check(state, stats, context) {
            const bookmarks = state.inventory.filter(id => !id.startsWith('sticker_') && !id.startsWith('pack_') && id !== 'buy_letter');
            return bookmarks.length >= 10;
        }},
    // ── Progression ───────────────────────────────────────────────────────
    { id: 'trifecta', name: 'Trifecta', desc: 'Win 3 rounds in a single run', icon: '🎪',
        check(state, stats, context) { return state.currentRound >= 4; }},
    // ── Combo / streak ────────────────────────────────────────────────────
    { id: 'combo_king', name: 'Combo King', desc: 'Reach a streak of 5', icon: '🔥',
        check(state, stats, context) { return state.combo >= 5; }},
    { id: 'combo_god', name: 'Combo God', desc: 'Reach a streak of 10', icon: '⚡',
        check(state, stats, context) { return state.combo >= 10; }},
];

let unlockedAchievements = [];
let achievementToastQueue = [];

export function loadAchievements() {
    try {
        const saved = localStorage.getItem(ACHIEVEMENTS_KEY);
        if (saved) unlockedAchievements = JSON.parse(saved);
    } catch { unlockedAchievements = []; }
}

export function getUnlocked() {
    return unlockedAchievements;
}

export function isUnlocked(achId) {
    return unlockedAchievements.includes(achId);
}

export function getUnlockedCount() {
    return unlockedAchievements.length;
}

export function saveAchievements() {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlockedAchievements));
}

export function checkAchievements(state, stats, context = {}) {
    const newlyUnlocked = [];
    for (const ach of achievements) {
        if (unlockedAchievements.includes(ach.id)) continue;
        try {
            if (ach.check(state, stats, context)) {
                unlockedAchievements.push(ach.id);
                newlyUnlocked.push(ach);
            }
        } catch (e) {
            // skip broken checks
        }
    }
    if (newlyUnlocked.length > 0) {
        saveAchievements();
        achievementToastQueue.push(...newlyUnlocked);
        showNextToast();
    }
}

function showNextToast() {
    if (achievementToastQueue.length === 0) return;
    const ach = achievementToastQueue.shift();
    showAchievementToast(ach);
}

function showAchievementToast(ach) {
    // Dispatch event for audio system
    document.dispatchEvent(new CustomEvent('achievement-unlocked', { detail: ach }));

    let container = document.getElementById('achievement-toasts');
    if (!container) {
        container = document.createElement('div');
        container.id = 'achievement-toasts';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
        <div class="ach-toast-icon">${ach.icon}</div>
        <div class="ach-toast-text">
            <div class="ach-toast-title">Achievement Unlocked!</div>
            <div class="ach-toast-name">${ach.name}</div>
            <div class="ach-toast-desc">${ach.desc}</div>
        </div>
    `;

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => toast.classList.add('show'));

    // Auto-dismiss
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
            if (container.children.length === 0) container.remove();
        }, 400);
    }, 4000);
}

export function getAchievementProgress(achId) {
    // Return a progress string for the achievements drawer
    const stats = JSON.parse(localStorage.getItem('scruggle_stats') || '{}');
    switch (achId) {
        case 'first_word': return `${stats.totalWords || 0}/1 words`;
        case 'golden': return `${stats.totalGold || 0}/50 gold`;
        case 'gold_500': return `${stats.totalGold || 0}/500 gold`;
        case 'gold_1000': return `${stats.totalGold || 0}/1000 gold`;
        case 'centurion': return `Best: ${stats.maxRound || 1} rounds`;
        case 'wordsmith': return `${stats.totalWords || 0}/50 words`;
        case 'words_200': return `${stats.totalWords || 0}/200 words`;
        case 'words_500': return `${stats.totalWords || 0}/500 words`;
        case 'high_roller': return 'Reach 200 gold in one run';
        case 'bibliophile': return 'Collect 5 bookmarks';
        case 'ink_master': return 'Use all 7 ink types';
        case 'speed_run': return 'Win with 2+ hands left';
        case 'marathon': return `${stats.maxRound || 1}/5 rounds`;
        case 'round_10': return `${stats.maxRound || 1}/10 rounds`;
        case 'round_20': return `${stats.maxRound || 1}/20 rounds`;
        case 'perfectionist': return 'Win with all 4 hands';
        case 'collector': return 'Own all 7 stickers';
        case 'first_win': return stats.totalWords > 0 ? 'Win any round' : 'Win your first round';
        case 'boss_slayer': return 'Defeat any boss (round 3+)';
        case 'boss_collector': return 'Defeat ink_thief + word_eater + gilded_golem in one run';
        case 'overkill': return 'Score 300 in a single turn';
        case 'bookmark_master': return `${(stats.bookmarksUsed || []).length}/12 bookmarks`;
        case 'ascetic': return 'Win without buying anything';
        case 'ink_collector': return `${(stats.inksUsed || []).length}/9 inks`;
        case 'decade': return `${stats.totalWins || 0}/10 wins`;
        case 'sapphire': return `${stats.totalGold || 0}/5000 gold`;
        case 'millionaire': return `${stats.totalGold || 0}/10000 gold`;
        case 'diamond': return 'Hold 500+ gold in one run';
        case 'tycoon': return 'Hold 1000+ gold in one run';
        case 'godspeed': return `${stats.totalWords || 0}/2000 words`;
        case 'legend': return `${stats.totalWords || 0}/5000 words`;
        case 'unstoppable': return `${stats.totalWins || 0}/50 wins`;
        case 'backbone': return `${stats.maxRound || 1}/30 rounds`;
        case 'endless': return `${stats.maxRound || 1}/50 rounds`;
        case 'veteran': return `${stats.maxRound || 1}/100 rounds`;
        case 'supernova': return 'Score 500+ in a single turn';
        case 'clutch': return 'Win on the very last hand';
        case 'gem_collector': return `${stats.totalGold || 0}/2500 gold`;
        case 'word_artist': return `${stats.totalWords || 0}/1000 words`;
        case 'half_century': return `${stats.totalWins || 0}/25 wins`;
        case 'board_filler': return 'Fill 40 cells on the board';
        case 'board_dominator': return 'Fill all 49 cells';
        case 'golden_ending': return 'Win with 100+ gold';
        case 'ink_apprentice': return '3+ ink types at once';
        case 'ink_expert': return '5+ inked tiles at once';
        case 'bookmark_king': return 'Own 10+ bookmarks';
        case 'trifecta': return 'Win 3 rounds in one run';
        case 'combo_king': return 'Reach combo of 5';
        case 'combo_god': return 'Reach combo of 10';
        default: return '';
    }
}