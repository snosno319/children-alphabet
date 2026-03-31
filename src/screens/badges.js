/**
 * My Sticker Book — Badge Collection Screen
 * Shows all 44 badges grouped by category.
 * Earned = full colour + bounce-in; Locked = greyscale + 🔒
 */
import { BADGE_DEFS } from '../shared/badges.js';
import { getEarnedBadges } from '../shared/storage.js';
import { playPopSound } from '../shared/audio.js';

export function renderBadges(app, navigate) {
    injectBadgesStyles();

    const earned = new Set(getEarnedBadges());
    const total  = BADGE_DEFS.length;
    const count  = earned.size;

    const letters   = BADGE_DEFS.filter(b => b.category === 'letter');
    const activities = BADGE_DEFS.filter(b => b.category === 'activity');
    const milestones = BADGE_DEFS.filter(b => b.category === 'milestone');

    app.innerHTML = `
        <div class="screen badges-screen">
            <div class="badges-header">
                <button class="badges-back-btn" id="badges-back">⬅</button>
                <span class="badges-title">My Sticker Book</span>
                <span class="badges-count">🏆 ${count}/${total}</span>
            </div>

            <div class="badges-scroll">
                <!-- A–Z Letters -->
                <div class="badges-section">
                    <div class="badges-section-label">A–Z Letters</div>
                    <div class="badges-grid badges-grid-letters">
                        ${letters.map(b => badgeCell(b, earned.has(b.id))).join('')}
                    </div>
                </div>

                <!-- Activities -->
                <div class="badges-section">
                    <div class="badges-section-label">Activities</div>
                    <div class="badges-grid badges-grid-activities">
                        ${activities.map(b => badgeCell(b, earned.has(b.id))).join('')}
                    </div>
                </div>

                <!-- Milestones -->
                <div class="badges-section">
                    <div class="badges-section-label">Milestones</div>
                    <div class="badges-grid badges-grid-milestones">
                        ${milestones.map(b => badgeCell(b, earned.has(b.id))).join('')}
                    </div>
                </div>
            </div>

            <!-- Tooltip (hidden by default) -->
            <div class="badge-tooltip" id="badge-tooltip" style="display:none">
                <div class="badge-tooltip-emoji" id="tt-emoji"></div>
                <div class="badge-tooltip-label" id="tt-label"></div>
                <div class="badge-tooltip-desc"  id="tt-desc"></div>
            </div>
        </div>
    `;

    // Back
    document.getElementById('badges-back').addEventListener('click', () => {
        playPopSound();
        navigate('hub');
    });

    // Badge tap — show tooltip
    document.querySelectorAll('.badge-cell').forEach(cell => {
        cell.addEventListener('click', e => {
            playPopSound();
            const id     = cell.dataset.id;
            const isEarned = cell.dataset.earned === 'true';
            const def    = BADGE_DEFS.find(b => b.id === id);
            if (!def) return;

            const tt = document.getElementById('badge-tooltip');
            document.getElementById('tt-emoji').textContent  = def.emoji;
            document.getElementById('tt-label').textContent  = def.label;
            document.getElementById('tt-desc').textContent   = isEarned
                ? def.description.replace(/^(Explore AND trace|Do|Earn|Complete|Try|Score|Read)/, '✅ $1')
                : `🔒 ${def.description}`;

            tt.style.display = 'flex';
            // Auto-hide after 2.5 s
            clearTimeout(tt._timer);
            tt._timer = setTimeout(() => { tt.style.display = 'none'; }, 2500);
            e.stopPropagation();
        });
    });

    // Dismiss tooltip on background tap
    app.addEventListener('click', () => {
        document.getElementById('badge-tooltip').style.display = 'none';
    });
}

function badgeCell(def, isEarned) {
    const style = isEarned
        ? `background:${def.color}; box-shadow: 0 4px 12px rgba(0,0,0,0.18);`
        : `background:#e0e0e0; filter:grayscale(1); opacity:0.45;`;
    const lock = isEarned ? '' : '<span class="badge-lock">🔒</span>';
    const anim = isEarned ? 'class="badge-cell badge-earned"' : 'class="badge-cell badge-locked"';
    return `
        <div ${anim} data-id="${def.id}" data-earned="${isEarned}" style="${style}" title="${def.label}">
            <span class="badge-emoji">${def.emoji}</span>
            ${lock}
        </div>
    `;
}

export function injectBadgesStyles() {
    if (document.getElementById('badges-styles')) return;
    const style = document.createElement('style');
    style.id = 'badges-styles';
    style.textContent = `
        .badges-screen {
            display: flex; flex-direction: column;
            background: var(--color-bg); min-height: 100vh;
        }

        /* ── Header ── */
        .badges-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: var(--space-md) var(--space-lg);
            background: linear-gradient(135deg, #A78BFA, #7C3AED);
            flex-shrink: 0;
        }
        .badges-back-btn {
            background: rgba(255,255,255,0.2); border: none;
            color: #fff; font-size: 1.4rem; border-radius: 12px;
            width: 44px; height: 44px; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
        }
        .badges-title {
            font-family: var(--font-display); font-size: 1.3rem;
            font-weight: 800; color: #fff;
        }
        .badges-count {
            font-family: var(--font-display); font-size: 1rem;
            font-weight: 800; color: #fff;
            background: rgba(255,255,255,0.2);
            padding: 6px 14px; border-radius: 20px;
        }

        /* ── Scroll area ── */
        .badges-scroll {
            flex: 1; overflow-y: auto;
            padding: var(--space-lg) var(--space-md) 100px;
            display: flex; flex-direction: column; gap: var(--space-xl);
        }

        /* ── Section ── */
        .badges-section { display: flex; flex-direction: column; gap: var(--space-sm); }
        .badges-section-label {
            font-family: var(--font-display); font-size: 0.9rem;
            font-weight: 800; color: #888; text-transform: uppercase;
            letter-spacing: 1px; padding-left: 4px;
        }

        /* ── Grids ── */
        .badges-grid { display: grid; gap: 10px; }
        .badges-grid-letters    { grid-template-columns: repeat(6, 1fr); }
        .badges-grid-activities { grid-template-columns: repeat(6, 1fr); }
        .badges-grid-milestones { grid-template-columns: repeat(4, 1fr); }

        /* ── Badge cell ── */
        .badge-cell {
            aspect-ratio: 1;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            position: relative; cursor: pointer;
            transition: transform 150ms ease;
        }
        .badge-cell:active { transform: scale(0.9); }
        .badge-earned { animation: badgeCellIn 400ms cubic-bezier(0.34,1.56,0.64,1) both; }
        .badge-emoji  { font-size: clamp(1.2rem, 4vw, 1.8rem); line-height: 1; }
        .badge-lock   {
            position: absolute; bottom: -2px; right: -2px;
            font-size: 0.7rem; line-height: 1;
        }

        /* ── Tooltip ── */
        .badge-tooltip {
            position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
            background: #1a1a2e; color: #fff;
            border-radius: 20px; padding: 16px 20px;
            flex-direction: column; align-items: center; gap: 4px;
            text-align: center; z-index: 500;
            max-width: 260px; width: 88%;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            animation: slideUpTooltip 200ms ease;
        }
        .badge-tooltip-emoji { font-size: 2rem; }
        .badge-tooltip-label {
            font-family: var(--font-display); font-size: 1rem;
            font-weight: 800; margin-top: 4px;
        }
        .badge-tooltip-desc { font-size: 0.85rem; opacity: 0.8; line-height: 1.3; }

        @keyframes badgeCellIn {
            from { opacity:0; transform: scale(0) }
            to   { opacity:1; transform: scale(1) }
        }
        @keyframes slideUpTooltip {
            from { opacity:0; transform: translateX(-50%) translateY(12px) }
            to   { opacity:1; transform: translateX(-50%) translateY(0) }
        }
    `;
    document.head.appendChild(style);
}
