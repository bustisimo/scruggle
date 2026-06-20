import { gameState, shopItems, FONT_BAGS, saveGame } from './state.js';

export function generateShopOffers() {
    const availableItems = shopItems.filter(item => {
        // Bookmarks cannot be bought twice
        const isBookmark = !item.id.startsWith('pack_') && !item.id.startsWith('sticker_') && item.id !== 'buy_letter';
        return !isBookmark || !gameState.inventory.includes(item.id);
    });

    const offers = [];
    const tempPool = [...availableItems];
    for (let i = 0; i < 5 && tempPool.length > 0; i++) {
        const randIndex = Math.floor(Math.random() * tempPool.length);
        offers.push(tempPool.splice(randIndex, 1)[0].id);
    }
    gameState.shopOffers = offers;
}

export function openShop(onBuyCallback) {
    const modal = document.getElementById('shop-modal');
    const itemsEl = document.getElementById('shop-items');
    itemsEl.innerHTML = '';

    if (!gameState.shopOffers || gameState.shopOffers.length === 0) {
        generateShopOffers();
    }

    gameState.shopOffers.forEach(itemId => {
        const item = shopItems.find(i => i.id === itemId);
        if (!item) return;

        const isOwned = gameState.inventory.includes(item.id);
        const itemDiv = document.createElement('div');

        let categoryClass = 'shop-bookmark';
        if (item.id === 'buy_letter') {
            categoryClass = 'shop-letter-pack';
        } else if (item.id.startsWith('pack_')) {
            const inkType = item.id.split('_')[1];
            categoryClass = `shop-ink shop-ink-${inkType}`;
        } else if (item.id.startsWith('sticker_')) {
            categoryClass = 'shop-sticker';
        }

        itemDiv.className = `shop-item ${categoryClass}`;
        itemDiv.innerHTML = `
            <div class="item-info">
                <h4>${item.name}</h4>
                <p>${item.desc}</p>
            </div>
            <button ${isOwned || gameState.gold < item.price ? 'disabled' : ''} id="buy-${item.id}">
                ${isOwned ? 'Owned' : `${item.price} Gold`}
            </button>
        `;
        itemsEl.appendChild(itemDiv);

        const btn = document.getElementById(`buy-${item.id}`);
        if (btn) {
            btn.onclick = () => {
                onBuyCallback(item.id);
            };
        }
    });

    // Render the Reroll Button
    let rerollSection = document.getElementById('shop-reroll-section');
    if (!rerollSection) {
        rerollSection = document.createElement('div');
        rerollSection.id = 'shop-reroll-section';
        const startBtn = document.getElementById('start-round-btn');
        if (startBtn) {
            startBtn.parentNode.insertBefore(rerollSection, startBtn);
        }
    }

    const cost = gameState.rerollCost || 2;
    if (rerollSection) {
        rerollSection.innerHTML = `
            <button id="reroll-btn" class="reroll-button" ${gameState.gold < cost ? 'disabled' : ''}>
                Reroll Shop (${cost} Gold)
            </button>
        `;
        const rerollBtn = document.getElementById('reroll-btn');
        if (rerollBtn) {
            rerollBtn.onclick = () => {
                if (gameState.gold >= cost) {
                    gameState.gold -= cost;
                    gameState.rerollCost = (gameState.rerollCost || 2) + 1;
                    generateShopOffers();
                    saveGame();
                    openShop(onBuyCallback);
                }
            };
        }
    }

    modal.style.display = 'flex';
}

export function buyItem(id, saveCallback, renderCallback) {
    const item = shopItems.find(i => i.id === id);
    if (!item || gameState.gold < item.price) return;

    // Remove bought item from shop offers
    gameState.shopOffers = gameState.shopOffers.filter(oid => oid !== id);

    if (id === 'buy_letter') {
        gameState.gold -= item.price;

        const activeBag = FONT_BAGS[gameState.selectedFontBagId || 'standard'] || FONT_BAGS.standard;
        const letters = Object.keys(activeBag.distribution);
        const chosen = [];
        for (let i = 0; i < 3; i++) {
            const randomLetter = letters[Math.floor(Math.random() * letters.length)];
            const val = activeBag.distribution[randomLetter].val;
            chosen.push({ letter: randomLetter, value: val, isLocked: false });
        }

        gameState.purchasedLetters = (gameState.purchasedLetters || []).concat(chosen);
        saveCallback();
        renderCallback();
        openShop((itemId) => buyItem(itemId, saveCallback, renderCallback));
        return;
    }

    if (id.startsWith('pack_')) {
        gameState.gold -= item.price;
        applyInkPack(id);
        saveCallback();
        renderCallback();
        openShop((itemId) => buyItem(itemId, saveCallback, renderCallback));
        return;
    }

    if (id.startsWith('sticker_')) {
        gameState.gold -= item.price;
        gameState.inventory.push(id);
        saveCallback();
        renderCallback();
        openShop((itemId) => buyItem(itemId, saveCallback, renderCallback));
        return;
    }

    if (!gameState.inventory.includes(id)) {
        gameState.gold -= item.price;
        gameState.inventory.push(id);
        saveCallback();
        renderCallback();
        openShop((itemId) => buyItem(itemId, saveCallback, renderCallback));
    }
}

function applyInkPack(id) {
    const item = shopItems.find(i => i.id === id);
    const inkType = id.split('_')[1]; // 'fire', 'ice', 'gold', 'void', 'growth', 'steel', 'prism'
    const count = (inkType === 'gold' || inkType === 'void' || inkType === 'growth' || inkType === 'steel' || inkType === 'prism') ? 2 : 3;

    let candidates = gameState.bag.filter(t => !t.ink);
    const source = candidates.length > 0 ? 'bag' : 'hand';
    if (candidates.length === 0) {
        candidates = gameState.hand.filter(t => !t.isLocked && !t.ink);
    }

    const upgraded = [];
    for (let i = 0; i < count; i++) {
        if (candidates.length === 0) break;
        const idx = Math.floor(Math.random() * candidates.length);
        const tile = candidates[idx];
        tile.ink = inkType;
        upgraded.push(tile);
        candidates.splice(idx, 1);
    }

    if (upgraded.length > 0) {
        const upgradedDetails = upgraded.map(t => `${t.letter} (${t.value})`).join(', ');
        alert(`Upgraded tiles in your ${source} with ${item ? item.name : inkType + ' Ink Pack'}: ${upgradedDetails}`);
    } else {
        alert(`No eligible tiles found to upgrade in your bag or hand.`);
    }
}
