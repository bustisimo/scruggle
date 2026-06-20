# Scruggle Overnight Polish — Implementation Plan

> **For Hermes cron:** Read this plan, find the next incomplete task, execute it, commit, mark it complete.

**Goal:** Polish Scruggle's UI, add full-screen shop, achievements system, more variety (font bags, bosses, shop items), and progression feel.

**Architecture:** Pure vanilla JS ES6 modules, no build step. All changes in `src/`, `style.css`, and `index.html`. Game state managed in `src/state.js`.

**Tech Stack:** Vanilla JS (ES6 modules), CSS3, HTML5, localStorage for persistence.

**Working dir:** `/Users/bustisbot/scruggle`

---

## Task Progress Tracking

Check off tasks by changing `- [ ]` to `- [x]` after committing.

### Phase 1: Full-Screen Shop Redesign

- [x] **Task 1.1: Replace shop modal markup with full-screen page**
  - **Files:** `index.html:80-86`
  - Replace `#shop-modal` with `#shop-screen` (a full-page overlay with its own layout)
  - Add gold counter at top, item grid in center, "Start Next Round" button at bottom
  - Include a "View Board" toggle to peek at the board state without closing shop

- [ ] **Task 1.2: Rewrite shop CSS for full-screen layout**
  - **Files:** `style.css`
  - Full-screen dark overlay with parchment-colored interior sections
  - 3-column grid for shop items (2-column on mobile)
  - Larger item cards with icons, descriptions, and buy buttons
  - Gold display prominently at top with coin animation
  - Smooth slide-in transition

- [ ] **Task 1.3: Update shop.js for full-screen rendering**
  - **Files:** `src/shop.js`
  - `openShop()` → show `#shop-screen` instead of modal
  - Render gold count in shop header
  - Add item rarity colors (common/uncommon/rare borders)
  - Keep reroll button, position it at bottom
  - "Start Next Round" button closes shop and proceeds

### Phase 2: New Font Bags

- [ ] **Task 2.1: Add 3 new font bags to state.js**
  - **Files:** `src/state.js` (in `FONT_BAGS` object, after `cursive`)
  - **Monospace Sans**: Balanced consonants, hand size 7, desc: "Clean, geometric letter distribution with strong consonants."
  - **Decorative Drop Cap**: High-value letters boosted, hand size 5, desc: "Fewer tiles but each packs a punch. High-value letters are abundant."
  - **Italic Script**: Extra wildcard-like distribution, hand size 8, desc: "Fluid and flexible. More common letters for easier word building."

- [ ] **Task 2.2: Add bag preview stats on selection screen**
  - **Files:** `src/main.js` (`showStartScreen()`), `style.css`
  - Show hand size, vowel/consonant ratio, and average tile value on each bag card
  - Add subtle color coding to bag cards

### Phase 3: Achievements System

- [ ] **Task 3.1: Create achievements module**
  - **Files:** Create `src/achievements.js`
  - Define achievement list with id, name, desc, icon, and unlock condition function
  - Initial set of 12 achievements:
    1. "First Word" — Submit your first word
    2. "Golden" — Earn 50 total gold
    3. "Centurion" — Score 100+ points in a single round
    4. "Wordsmith" — Submit 50 total words
    5. "High Roller" — Hold 200+ gold at once
    6. "Bibliophile" — Own 5+ bookmarks
    7. "Ink Master" — Apply all 7 ink types in one run
    8. "Speed Run" — Win a round in 3 or fewer hands
    9. "Marathon" — Reach round 5
   10. "Boss Slayer" — Defeat 3 bosses (placeholder for boss system)
   11. "Perfectionist" — Win a round with 4 hands remaining
   12. "Collector" — Own every sticker type

- [ ] **Task 3.2: Add achievement checking and notification**
  - **Files:** `src/achievements.js`, `src/main.js`, `style.css`
  - `checkAchievements()` function called after each submission and round end
  - Toast notification (bottom-right, slides in, auto-dismisses after 4s)
  - Save unlocked achievements to localStorage

- [ ] **Task 3.3: Add achievements drawer to UI**
  - **Files:** `index.html`, `style.css`, `src/main.js`
  - New drawer accessible from start screen and in-game stats area
  - Shows locked (greyed out) and unlocked (colored) achievements
  - Shows progress counters for incremental achievements

### Phase 4: More Shop Items

- [ ] **Task 4.1: Add 4 new bookmarks**
  - **Files:** `src/state.js` (in `bookmarksRegistry`)
  1. **Alchemist** (25g): "Ink tiles are worth +3 extra gold when scored."
  2. **Architect** (30g): "The center star gives 2x word multiplier instead of DW."
  3. **Hoarder** (20g): "Start each round with +5 gold."
  4. **Recycler** (20g): "Discarding tiles refunds 1 gold per tile."

- [ ] **Task 4.2: Add 2 new ink packs**
  - **Files:** `src/state.js` (in `shopItems`)
  1. **Storm Ink Pack** (20g): "Apply Storm Ink to 2 tiles. Storm tiles chain lightning: +3 score to adjacent words."
  2. **Echo Ink Pack** (15g): "Apply Echo Ink to 3 tiles. Echo tiles give +2 score when reused in future submissions."

- [ ] **Task 4.3: Add utility shop items**
  - **Files:** `src/state.js` (in `shopItems`)
  1. **Hand Expansion** (30g): "Permanently increase hand size by 1." 
  2. **Bag Trimmer** (10g): "Remove 5 random low-value tiles from your bag."
  3. **Golden Ticket** (50g): "Next round's target score is halved."

### Phase 5: UI/UX Polish

- [ ] **Task 5.1: Add smooth score/gold counter animation**
  - **Files:** `src/board.js`, `style.css`
  - When score or gold changes, animate the number counting up/down
  - Gold sparkle particles when earning gold

- [ ] **Task 5.2: Improve tile placement feedback**
  - **Files:** `src/board.js`, `style.css`
  - Placed tiles get a subtle "snap" animation (scale bounce)
  - Invalid placements pulse red briefly
  - Word highlight: when a valid word is formed, briefly highlight all its tiles

- [ ] **Task 5.3: Add subtle background particles/ambiance**
  - **Files:** `style.css`, `index.html`
  - Floating dust motes or subtle sparkle particles in the background
  - Pure CSS animation, no JS overhead

- [ ] **Task 5.4: Improve round transition screen**
  - **Files:** `index.html`, `style.css`
  - Between rounds, show a stylized "Round N Complete!" screen with stats recap
  - Show gold earned, words submitted, items owned
  - Animate the round number incrementing

### Phase 6: Progression & Boss System

- [ ] **Task 6.1: Add run-based meta-progression**
  - **Files:** `src/stats.js`, `src/state.js`
  - Track "total runs completed" and "total runs won"
  - Unlock cosmetic title based on wins: Novice (0), Adept (1), Expert (3), Master (5), Grandmaster (10)
  - Display title on start screen and stats drawer

- [ ] **Task 6.2: Add 3 boss encounters**
  - **Files:** `src/state.js`, `src/main.js`, `index.html`  
  - Bosses appear every 3 rounds (rounds 3, 6, 9...)
  - **Boss 1 — The Ink Thief**: Steals 2 random tiles from your hand each submission. Beat by reaching target score. Reward: Rare ink pack.
  - **Boss 2 — The Word Eater**: Words of 4+ letters remove those tiles permanently. Beat by making many short words. Reward: Hand size +1 for the run.
  - **Boss 3 — The Gilded Golem**: Target score is 1.5x higher, but all gold earnings are doubled. Reward: 100 bonus gold.
  - Boss intro screen with name, artwork (ASCII/emoji), and special rules

- [ ] **Task 6.3: Add boss defeat rewards**
  - **Files:** `src/main.js`, `src/state.js`
  - After defeating a boss: victory screen with reward display
  - Boss-specific rewards added to inventory/gameState
  - Track defeated bosses in stats

## Execution Notes

- **Commit after every task** with descriptive messages like `feat(shop): full-screen shop layout` or `feat(achievements): add achievement checking system`
- **Test after every 3 tasks** by serving with `python3 -m http.server 8000` and verifying visually
- **Never commit broken code** — if a task fails, fix it before moving on
- **Read the plan first each run** to find the next unchecked task
- **Use `sed -i '' 's/- \[ \]/- \[x\]/' .hermes/plans/2026-06-20_scruggle-overnight.md`** to mark tasks complete (adjusting the line range)