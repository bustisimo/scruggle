import { STATS_KEY } from './state.js';

export function getStats() {
    const defaultStats = { maxRound: 1, totalGold: 0, totalWords: 0 };
    try {
        const saved = localStorage.getItem(STATS_KEY);
        return saved ? { ...defaultStats, ...JSON.parse(saved) } : defaultStats;
    } catch(e) {
        return defaultStats;
    }
}

export function updateStats(round, addGold, addWords) {
    const stats = getStats();
    stats.maxRound = Math.max(stats.maxRound, round);
    stats.totalGold += addGold;
    stats.totalWords += addWords;
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}
