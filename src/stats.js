import { STATS_KEY } from './state.js';

const defaultStats = { maxRound: 1, totalGold: 0, totalWords: 0, totalRuns: 0, totalWins: 0, inksUsed: [], bookmarksUsed: [] };

export function getStats() {
    try {
        const saved = localStorage.getItem(STATS_KEY);
        return saved ? { ...defaultStats, ...JSON.parse(saved) } : { ...defaultStats };
    } catch(e) {
        return { ...defaultStats };
    }
}

export function updateStats(round, addGold, addWords) {
    const stats = getStats();
    stats.maxRound = Math.max(stats.maxRound, round);
    stats.totalGold += addGold;
    stats.totalWords += addWords;
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function incrementRuns() {
    const stats = getStats();
    stats.totalRuns++;
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function incrementWins() {
    const stats = getStats();
    stats.totalWins++;
    stats.totalRuns = Math.max(stats.totalRuns, stats.totalWins);
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function getPlayerTitle() {
    const wins = getStats().totalWins;
    if (wins >= 10) return 'Grandmaster';
    if (wins >= 5) return 'Master';
    if (wins >= 3) return 'Expert';
    if (wins >= 1) return 'Adept';
    return 'Novice';
}

export function getTitleEmoji() {
    const wins = getStats().totalWins;
    if (wins >= 10) return '👑';
    if (wins >= 5) return '🏅';
    if (wins >= 3) return '⭐';
    if (wins >= 1) return '🔰';
    return '📖';
}