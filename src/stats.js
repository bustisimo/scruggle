import { STATS_KEY } from './state.js';

const defaultStats = {
    maxRound: 1, totalGold: 0, totalWords: 0, totalRuns: 0, totalWins: 0,
    inksUsed: [], bookmarksUsed: [],
    // New fields: submission history & lifetime stats
    submissionHistory: [],
    totalSubmissions: 0,
    totalScore: 0,
    longestWord: '',
    longestWordLen: 0,
    mostValuableWord: '',
    mostValuableWordScore: 0,
    bestScoreWord: '',
    bestScoreWordScore: 0,
    bestGoldWord: '',
    bestGoldWordGold: 0,
};

const HISTORY_MAX = 50;

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

/**
 * Record each word from a submission into the lifetime history.
 * @param {Array} wordsData - Array of word result objects from the submit handler
 * @param {number} round - Current round number
 * @param {number} handNum - Which hand this was (1-indexed)
 */
export function recordSubmission(wordsData, round, handNum) {
    const stats = getStats();

    if (!stats.submissionHistory) stats.submissionHistory = [];

    for (const wd of wordsData) {
        // Skip pseudo-entries like 'Bookmarks'
        if (wd.word === 'Bookmarks' || !wd.word || wd.word.length === 0) continue;

        const word = wd.word;
        const score = wd.wordScore || 0;
        const gold = wd.wordGold || 0;

        // Lifetime totals
        stats.totalSubmissions = (stats.totalSubmissions || 0) + 1;
        stats.totalScore = (stats.totalScore || 0) + score;

        // Longest word
        if (word.length > (stats.longestWordLen || 0)) {
            stats.longestWord = word;
            stats.longestWordLen = word.length;
        }

        // Most valuable word (by score)
        if (score > (stats.mostValuableWordScore || 0)) {
            stats.mostValuableWord = word;
            stats.mostValuableWordScore = score;
        }

        // Personal best: highest scoring word
        if (score > (stats.bestScoreWordScore || 0)) {
            stats.bestScoreWord = word;
            stats.bestScoreWordScore = score;
        }

        // Personal best: most gold from a word
        if (gold > (stats.bestGoldWordGold || 0)) {
            stats.bestGoldWord = word;
            stats.bestGoldWordGold = gold;
        }

        // Add to history (newest first)
        stats.submissionHistory.unshift({
            word,
            score,
            gold,
            round,
            hand: handNum,
            timestamp: Date.now(),
        });

        // Trim to max
        if (stats.submissionHistory.length > HISTORY_MAX) {
            stats.submissionHistory.pop();
        }
    }

    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

/**
 * Render the stats drawer with all lifetime stats, personal bests, and submission history.
 */
export function renderStatsDrawer() {
    const stats = getStats();

    // Existing legacy stats
    const elHighest = document.getElementById('stat-highest-round');
    const elGold = document.getElementById('stat-total-gold');
    const elWords = document.getElementById('stat-total-words');
    if (elHighest) elHighest.innerText = stats.maxRound;
    if (elGold) elGold.innerText = stats.totalGold;
    if (elWords) elWords.innerText = stats.totalWords;

    // New lifetime stats
    const elSubs = document.getElementById('stat-total-submissions');
    const elAvg = document.getElementById('stat-avg-score');
    if (elSubs) elSubs.innerText = stats.totalSubmissions || 0;
    if (elAvg) {
        const avg = stats.totalSubmissions > 0
            ? ((stats.totalScore || 0) / stats.totalSubmissions).toFixed(1)
            : '0';
        elAvg.innerText = avg;
    }

    // Personal Bests
    const elBestScoreWord = document.getElementById('stat-best-score-word');
    const elBestScoreVal = document.getElementById('stat-best-score-val');
    const elBestGoldWord = document.getElementById('stat-best-gold-word');
    const elBestGoldVal = document.getElementById('stat-best-gold-val');
    const elLongestWord = document.getElementById('stat-longest-word');
    const elLongestLen = document.getElementById('stat-longest-word-len');

    if (elBestScoreWord) elBestScoreWord.innerText = stats.bestScoreWord || '—';
    if (elBestScoreVal) elBestScoreVal.innerText = stats.bestScoreWordScore || 0;
    if (elBestGoldWord) elBestGoldWord.innerText = stats.bestGoldWord || '—';
    if (elBestGoldVal) elBestGoldVal.innerText = stats.bestGoldWordGold || 0;
    if (elLongestWord) elLongestWord.innerText = stats.longestWord || '—';
    if (elLongestLen) elLongestLen.innerText = stats.longestWordLen ? `${stats.longestWordLen} letters` : '0';

    // Submission History
    const historyEl = document.getElementById('submission-history');
    if (!historyEl) return;

    const history = stats.submissionHistory || [];

    // Update history count badge
    const historyCountEl = document.getElementById('history-count');
    if (historyCountEl) {
        historyCountEl.innerText = history.length > 0 ? `(${history.length})` : '';
    }

    if (history.length === 0) {
        historyEl.innerHTML = '<div class="history-empty">No submissions yet. Start a game!</div>';
        return;
    }

    historyEl.innerHTML = history.map(e => {
        const wordClass = e.word.length >= 6 ? 'history-word long' : e.word.length >= 4 ? 'history-word med' : 'history-word';
        return `<div class="history-entry">
            <span class="${wordClass}">${e.word}</span>
            <span class="history-score">+${e.score}</span>
            <span class="history-gold">🪙${e.gold}</span>
            <span class="history-round">R${e.round}.${e.hand}</span>
        </div>`;
    }).join('');
}