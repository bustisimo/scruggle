/**
 * Tutorial system for Scruggle.
 * Shows a compact step-by-step overlay on first-time play.
 * Can also be accessed from the start screen menu.
 */

const TUTORIAL_STEPS = [
    {
        title: 'Welcome to Scruggle 🎲',
        text: 'A roguelike crossword game. Form words on the 7x7 board, score points, earn gold, and survive as long as you can. Each round has a target score — hit it to advance.'
    },
    {
        title: 'Placing Tiles 🃏',
        text: 'Tap a letter in your hand, then tap an empty cell on the board to place it. All placed tiles must form valid crossword words — every row and column must connect through the center ★.'
    },
    {
        title: 'Scoring & Premium Cells ⭐',
        text: 'Each letter has a point value. Premium cells multiply your score: DL (Double Letter), TL (Triple Letter), DW (Double Word), TW (Triple Word), and GM (Gold Multiplier). Tap any premium cell to see its full name.'
    },
    {
        title: 'Combo Streaks 🔥',
        text: 'Submit valid words back-to-back to build your combo. Each combo level adds bonus score. Swapping or discarding tiles breaks the streak, so plan your plays carefully.'
    },
    {
        title: 'Plays & Shop 🛒',
        text: 'You have a limited number of Plays (hands) each round. Run out and it\'s game over! Between rounds, visit the shop to buy bookmarks (passive upgrades), inks (tile effects), and more.'
    }
];

const TUTORIAL_KEY = 'scruggle_tutorial_done_v1';

export function hasSeenTutorial() {
    return localStorage.getItem(TUTORIAL_KEY) === 'true';
}

export function markTutorialSeen() {
    localStorage.setItem(TUTORIAL_KEY, 'true');
}

export function resetTutorial() {
    localStorage.removeItem(TUTORIAL_KEY);
}

/**
 * Show the tutorial overlay. Returns a promise that resolves when dismissed.
 */
export function showTutorial() {
    return new Promise((resolve) => {
        let currentStep = 0;

        const overlay = document.createElement('div');
        overlay.id = 'tutorial-overlay';
        overlay.innerHTML = `
            <div class="tutorial-card">
                <div class="tutorial-progress"><span class="tutorial-step-num">1</span> / ${TUTORIAL_STEPS.length}</div>
                <h3 class="tutorial-title"></h3>
                <p class="tutorial-text"></p>
                <div class="tutorial-actions">
                    <button class="tutorial-btn tutorial-prev" style="display:none;">← Back</button>
                    <button class="tutorial-btn tutorial-next">Next →</button>
                    <button class="tutorial-btn tutorial-skip">Skip</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const titleEl = overlay.querySelector('.tutorial-title');
        const textEl = overlay.querySelector('.tutorial-text');
        const stepNum = overlay.querySelector('.tutorial-step-num');
        const prevBtn = overlay.querySelector('.tutorial-prev');
        const nextBtn = overlay.querySelector('.tutorial-next');
        const skipBtn = overlay.querySelector('.tutorial-skip');

        function renderStep(index) {
            const step = TUTORIAL_STEPS[index];
            titleEl.textContent = step.title;
            textEl.textContent = step.text;
            stepNum.textContent = index + 1;
            prevBtn.style.display = index === 0 ? 'none' : 'inline-block';
            nextBtn.textContent = index === TUTORIAL_STEPS.length - 1 ? 'Got it! ✅' : 'Next →';
        }

        function dismiss() {
            overlay.classList.remove('tutorial-fade-in');
            overlay.style.opacity = '0';
            setTimeout(() => {
                if (overlay.parentNode) overlay.remove();
                resolve();
            }, 250);
        }

        prevBtn.onclick = () => {
            if (currentStep > 0) {
                currentStep--;
                renderStep(currentStep);
            }
        };

        nextBtn.onclick = () => {
            if (currentStep < TUTORIAL_STEPS.length - 1) {
                currentStep++;
                renderStep(currentStep);
            } else {
                markTutorialSeen();
                dismiss();
            }
        };

        skipBtn.onclick = () => {
            markTutorialSeen();
            dismiss();
        };

        renderStep(0);
        requestAnimationFrame(() => overlay.classList.add('tutorial-fade-in'));
    });
}