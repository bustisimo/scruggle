const ACHIEVEMENTS_KEY = 'scruggle_achievements';

export const achievements = [
    { id: 'first_word', name: 'First Word', desc: 'Submit your first word', icon: '📝',
        check(state, stats, context) { return context.totalWords >= 1; }},
    { id: 'golden', name: 'Golden', desc: 'Earn 50 total gold', icon: '🪙',
        check(state, stats, context) { return stats.totalGold >= 50; }},
    { id: 'centurion', name: 'Centurion', desc: 'Score 100+ points in a single round', icon: '💯',
        check(state, stats, context) { return state.score >= 100; }},
    { id: 'wordsmith', name: 'Wordsmith', desc: 'Submit 50 total words', icon: '📚',
        check(state, stats, context) { return stats.totalWords >= 50; }},
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
    { id: 'perfectionist', name: 'Perfectionist', desc: 'Win a round with 4 hands remaining', icon: '✨',
        check(state, stats, context) { return context.roundWon && state.handsLeft >= 4; }},
    { id: 'collector', name: 'Collector', desc: 'Own every sticker type', icon: '🏆',
        check(state, stats, context) {
            const stickerIds = ['sticker_dl','sticker_tl','sticker_dw','sticker_tw','sticker_qw','sticker_gm','sticker_eraser'];
            return stickerIds.every(sid => state.inventory.includes(sid));
        }},
    { id: 'first_win', name: 'First Victory', desc: 'Win your first round', icon: '🎉',
        check(state, stats, context) { return context.roundWon; }},
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
        case 'centurion': return `Best: ${stats.maxRound || 1} rounds`;
        case 'wordsmith': return `${stats.totalWords || 0}/50 words`;
        case 'high_roller': return 'Reach 200 gold in one run';
        case 'bibliophile': return 'Collect 5 bookmarks';
        case 'ink_master': return 'Use all 7 ink types';
        case 'speed_run': return 'Win with 2+ hands left';
        case 'marathon': return `${stats.maxRound || 1}/5 rounds`;
        case 'perfectionist': return 'Win with all 4 hands';
        case 'collector': return 'Own all 7 stickers';
        case 'first_win': return stats.totalWords > 0 ? 'Win any round' : 'Win your first round';
        default: return '';
    }
}