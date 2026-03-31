/**
 * Parent Dashboard — English Adventure
 *
 * Gated behind a multiplication math problem to prevent young children
 * from accessing it. Shows full progress across all 6 sub-apps:
 *   - Summary strip: total stars, streak, last activity
 *   - Completion bars per sub-app
 *   - Per-letter accuracy grid (A–Z)
 *   - Mastered / needs-practice chips per tracked sub-app
 *   - Reset progress button
 */
import {
    getAllProgress,
    getActiveProfile,
    getProfiles,
    getTotalStars,
    getStreak,
    getAlphabetCompletionPercent,
    getCvcCompletionPercent,
    getSightCompletionPercent,
    getWordBuilderCompletionPercent,
    getPhonicsStats,
    getRhymeStats,
    resetProgress,
    getEarnedBadges,
} from '../shared/storage.js';
import { BADGE_DEFS } from '../shared/badges.js';
import { playPopSound, playWrongSound, playCorrectSound } from '../shared/audio.js';

let unlocked = false;
let mathAnswer = 0;
let localNavigate = null;

export function renderParents(app, navigate) {
    unlocked = false;
    localNavigate = navigate;

    const num1 = Math.floor(Math.random() * 5) + 5; // 5–9
    const num2 = Math.floor(Math.random() * 5) + 5; // 5–9
    mathAnswer = num1 * num2;

    app.innerHTML = `
      <div class="screen parents-screen" id="parents-view">
        <div class="top-bar">
          <button class="back-btn" id="parents-back">🏠</button>
          <div class="top-bar-title parents-title">Parent Dashboard</div>
        </div>

        <div class="math-gate-container" id="math-gate">
            <div class="gate-icon">🔒</div>
            <h2>Grown-Ups Only</h2>
            <p>Solve this to unlock the dashboard:</p>
            <div class="math-problem">What is <b>${num1} &times; ${num2}</b>?</div>
            <div class="math-input-group">
                <input type="number" id="math-input" placeholder="?" autocomplete="off" inputmode="numeric" />
                <button id="math-submit">Unlock</button>
            </div>
            <div id="math-error" class="math-error"></div>
        </div>

        <div class="dashboard-container" id="dashboard" style="display:none;"></div>
      </div>
    `;

    document.getElementById('parents-back').addEventListener('click', () => {
        playPopSound();
        navigate('hub');
    });

    document.getElementById('math-submit').addEventListener('click', attemptUnlock);
    document.getElementById('math-input').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') attemptUnlock();
    });
    // Auto-focus the input
    setTimeout(() => document.getElementById('math-input')?.focus(), 100);
}

function attemptUnlock() {
    const input = document.getElementById('math-input').value;
    if (parseInt(input, 10) === mathAnswer) {
        unlocked = true;
        playCorrectSound();
        document.getElementById('math-gate').style.display = 'none';
        const dashboard = document.getElementById('dashboard');
        dashboard.style.display = 'block';
        renderDashboardContent(dashboard);
    } else {
        playWrongSound();
        document.getElementById('math-input').value = '';
        const error = document.getElementById('math-error');
        error.textContent = 'Not quite — try again.';
        setTimeout(() => { error.textContent = ''; }, 2000);
    }
}

// ─── Dashboard rendering ───────────────────────────────────────────────────

function renderDashboardContent(container) {
    const p = getAllProgress();
    const activeId = getActiveProfile();
    const profiles = getProfiles();
    const me = profiles.find(pr => pr.id === activeId) || { name: 'Player', avatar: '🦊' };

    const totalStars = getTotalStars();
    const streak = getStreak();
    const lastActivity = p.global?.lastActivity
        ? formatLastActivity(p.global.lastActivity)
        : 'No activity yet';

    // Per-app accuracy
    const alphabetAcc = accuracy(p.alphabet?.quizCorrect, p.alphabet?.quizTotal);
    const cvcAcc      = accuracy(p.cvc?.quizCorrect, p.cvc?.quizTotal);
    const sightAcc    = accuracy(p.sight?.matchCorrect, p.sight?.matchTotal);
    const wbScores    = p.wordBuilder?.wordScores || {};
    const wbMetrics   = buildMetrics(wbScores);
    const wbAcc       = accuracy(wbMetrics.totalCorrect, wbMetrics.totalAttempts);
    const phStats     = getPhonicsStats();
    const phAcc       = accuracy(phStats.totalCorrect, phStats.totalAttempts);
    const rhStats     = getRhymeStats();
    const rhAcc       = accuracy(rhStats.totalCorrect, rhStats.totalAttempts);

    // Completion percents
    const compAlpha   = getAlphabetCompletionPercent();
    const compCvc     = getCvcCompletionPercent();
    const compSight   = getSightCompletionPercent();
    const compWb      = getWordBuilderCompletionPercent();

    // Mastered / struggling metrics for tracked sub-apps
    const alphaMetrics = buildMetrics(p.alphabet?.letterScores || {});
    const cvcMetrics   = buildMetrics(p.cvc?.wordScores || {});

    container.innerHTML = `
        <!-- Header -->
        <div class="dash-header">
            <div class="dash-avatar">${me.avatar}</div>
            <div class="dash-header-info">
                <h2>${me.name}'s Progress</h2>
                <div class="dash-last-active">Last played: ${lastActivity}</div>
            </div>
        </div>

        <!-- Share button -->
        <div class="dash-share-row">
            <button class="dash-share-btn" id="dash-share">📤 Share Progress</button>
        </div>

        <!-- Summary strip -->
        <div class="dash-summary-strip">
            <div class="dash-summary-item">
                <span class="dash-summary-icon">⭐</span>
                <span class="dash-summary-value">${totalStars}</span>
                <span class="dash-summary-label">Total Stars</span>
            </div>
            <div class="dash-summary-item">
                <span class="dash-summary-icon">🔥</span>
                <span class="dash-summary-value">${streak}</span>
                <span class="dash-summary-label">Day Streak</span>
            </div>
            <div class="dash-summary-item">
                <span class="dash-summary-icon">📚</span>
                <span class="dash-summary-value">${p.alphabet?.exploredLetters?.length || 0}/26</span>
                <span class="dash-summary-label">Letters Explored</span>
            </div>
            <div class="dash-summary-item">
                <span class="dash-summary-icon">✏️</span>
                <span class="dash-summary-value">${p.alphabet?.tracedLetters?.length || 0}/26</span>
                <span class="dash-summary-label">Letters Traced</span>
            </div>
        </div>

        <!-- Per-app completion bars -->
        <div class="dash-section">
            <h3 class="dash-section-title">Completion by Module</h3>
            <div class="dash-completion-grid">
                ${completionRow('🔤 ABCs',     compAlpha, alphabetAcc)}
                ${completionRow('🧩 Words',    compCvc,   cvcAcc)}
                ${completionRow('⭐ Reading',  compSight, sightAcc)}
                ${completionRow('✏️ Spelling', compWb,    wbAcc)}
                ${completionRow('🔊 Phonics',  null,      phAcc)}
                ${completionRow('🎵 Rhyme',    null,      rhAcc)}
            </div>
        </div>

        <!-- Letter accuracy grid -->
        <div class="dash-section">
            <h3 class="dash-section-title">Letter Accuracy A–Z</h3>
            <div class="dash-legend">
                <span class="legend-dot grey"></span>Not started
                <span class="legend-dot green"></span>Mastered ≥80%
                <span class="legend-dot yellow"></span>Practising
                <span class="legend-dot red"></span>Needs help ≤50%
            </div>
            <div class="dash-letter-grid">
                ${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => {
                    const s = p.alphabet?.letterScores?.[letter];
                    const attempts = s ? s.correct + s.wrong : 0;
                    let cls = 'letter-cell-grey';
                    if (attempts >= 2) {
                        const ratio = s.correct / attempts;
                        if (ratio >= 0.8) cls = 'letter-cell-green';
                        else if (ratio <= 0.5) cls = 'letter-cell-red';
                        else cls = 'letter-cell-yellow';
                    } else if (attempts === 1) {
                        cls = 'letter-cell-yellow';
                    }
                    const pct = attempts > 0 ? Math.round((s.correct / attempts) * 100) : 0;
                    const tooltip = attempts > 0
                        ? `${letter}: ${pct}% (${s.correct}✓ ${s.wrong}✗)`
                        : `${letter}: not attempted`;
                    return `<div class="letter-cell ${cls}" title="${tooltip}">${letter}</div>`;
                }).join('')}
            </div>
        </div>

        <!-- Mastered / Needs Practice -->
        <div class="dash-section">
            <h3 class="dash-section-title">Letters Detail</h3>
            ${renderMasteredStruggling(alphaMetrics)}
        </div>

        <div class="dash-section">
            <h3 class="dash-section-title">Words Detail</h3>
            ${renderMasteredStruggling(cvcMetrics)}
        </div>

        <!-- Badges -->
        ${renderBadgesSection(localNavigate)}

        <!-- Reset -->
        <div class="dash-section dash-reset-section">
            <button class="dash-reset-btn" id="dash-reset">🗑 Reset Progress for ${me.name}</button>
            <div class="dash-reset-warning">This cannot be undone.</div>
        </div>
    `;

    document.getElementById('dash-view-badges').addEventListener('click', () => {
        playPopSound();
        localNavigate('badges');
    });

    document.getElementById('dash-share').addEventListener('click', () => {
        playPopSound();
        handleShare(me.name, p, totalStars, streak);
    });

    document.getElementById('dash-reset').addEventListener('click', () => {
        const confirmed = window.confirm(`Reset all progress for ${me.name}? This cannot be undone.`);
        if (confirmed) {
            resetProgress();
            playCorrectSound();
            // Re-render with fresh data
            renderDashboardContent(container);
        }
    });
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function buildShareText(name, p, totalStars, streak) {
    const lines = [
        `📊 ${name}'s Learning Report — English Adventure 🦁`,
        '',
        `⭐ Total Stars: ${totalStars}`,
        `🔤 Letters explored: ${p.alphabet?.exploredLetters?.length || 0}/26`,
        `✏️ Letters traced: ${p.alphabet?.tracedLetters?.length || 0}/26`,
        `📖 CVC words built: ${p.cvc?.builtWords?.length || 0}`,
        `👁️ Sight words learned: ${p.sight?.learnedWords?.length || 0}`,
        `🔥 Day streak: ${streak}`,
        '',
        `📚 Stories read: ${p.sight?.storiesRead?.length || 0}/12`,
        `🏆 Badges earned: ${(p.global?.earnedBadges || []).length}/44`,
        '',
        'Keep up the great work! 🌟',
    ];
    return lines.join('\n');
}

async function handleShare(name, p, totalStars, streak) {
    const text = buildShareText(name, p, totalStars, streak);
    try {
        if (navigator.share) {
            await navigator.share({ text });
        } else {
            await navigator.clipboard.writeText(text);
            showShareToast('Copied to clipboard! 📋');
        }
    } catch (e) {
        // User cancelled share or clipboard failed — silent
    }
}

function showShareToast(msg) {
    const existing = document.querySelector('.dash-share-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'dash-share-toast';
    toast.textContent = msg;
    document.querySelector('.dashboard-container')?.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

function accuracy(correct = 0, total = 0) {
    if (!total) return null; // null = no data yet
    return Math.round((correct / total) * 100);
}

function formatLastActivity(ts) {
    const diff = Date.now() - ts;
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 2)   return 'Just now';
    if (mins < 60)  return `${mins} minutes ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
}

function buildMetrics(scoreMap) {
    let totalCorrect = 0, totalAttempts = 0;
    const list = [];
    for (const [key, stats] of Object.entries(scoreMap)) {
        const attempts = stats.correct + stats.wrong;
        totalCorrect   += stats.correct;
        totalAttempts  += attempts;
        if (attempts > 0) {
            list.push({ concept: key, ratio: stats.correct / attempts, attempts, correct: stats.correct, wrong: stats.wrong });
        }
    }
    list.sort((a, b) => b.ratio - a.ratio);
    return {
        totalCorrect,
        totalAttempts,
        mastered:   list.filter(m => m.ratio >= 0.8 && m.attempts >= 2).slice(0, 5),
        struggling: list.filter(m => m.ratio <= 0.5 && m.attempts >= 2).sort((a, b) => a.ratio - b.ratio).slice(0, 5),
    };
}

function renderBadgesSection(navigate) {
    const earned = getEarnedBadges();
    const total  = BADGE_DEFS.length;
    const recent = earned.slice(-5).reverse();
    const recentDefs = recent.map(id => BADGE_DEFS.find(b => b.id === id)).filter(Boolean);

    return `
        <div class="dash-section">
            <h3 class="dash-section-title">Badges &amp; Stickers</h3>
            <div class="dash-badges-row">
                <div class="dash-badges-count">🏆 ${earned.length} / ${total} earned</div>
                ${recentDefs.length > 0
                    ? `<div class="dash-badges-recent">${recentDefs.map(b =>
                        `<span class="dash-badge-icon" style="background:${b.color}" title="${b.label}">${b.emoji}</span>`
                    ).join('')}</div>`
                    : `<div class="dash-badges-empty">No badges yet — keep playing!</div>`
                }
                <button class="dash-badges-view-btn" id="dash-view-badges">View All</button>
            </div>
        </div>
    `;
}

function completionRow(label, completionPct, accPct) {
    const comp = completionPct ?? '—';
    const acc  = accPct !== null ? `${accPct}%` : '—';
    const bar  = completionPct !== null
        ? `<div class="comp-bar"><div class="comp-fill" style="width:${completionPct}%"></div></div>`
        : `<div class="comp-bar"><div class="comp-fill" style="width:0%"></div></div>`;
    return `
        <div class="comp-row">
            <div class="comp-label">${label}</div>
            ${bar}
            <div class="comp-pct">${typeof comp === 'number' ? comp + '%' : comp}</div>
            <div class="comp-acc ${accPct === null ? '' : accPct >= 80 ? 'acc-good' : accPct >= 60 ? 'acc-ok' : 'acc-low'}">${acc} acc</div>
        </div>
    `;
}

function renderMasteredStruggling(metrics) {
    if (metrics.totalAttempts === 0) {
        return `<div class="dash-empty-state">No quiz data yet — play some rounds first!</div>`;
    }
    return `
        <div class="dash-ms-grid">
            <div class="dash-ms-col">
                <div class="dash-ms-head struggling-head">⚠️ Needs Practice</div>
                ${metrics.struggling.length > 0
                    ? metrics.struggling.map(m => `
                        <div class="dash-chip struggling-chip">
                            <strong>${m.concept.toUpperCase()}</strong>
                            <span>${Math.round(m.ratio * 100)}%</span>
                        </div>`).join('')
                    : '<div class="dash-empty">All good! 🎉</div>'
                }
            </div>
            <div class="dash-ms-col">
                <div class="dash-ms-head mastered-head">✅ Mastered</div>
                ${metrics.mastered.length > 0
                    ? metrics.mastered.map(m => `
                        <div class="dash-chip mastered-chip">
                            <strong>${m.concept.toUpperCase()}</strong>
                            <span>${Math.round(m.ratio * 100)}%</span>
                        </div>`).join('')
                    : '<div class="dash-empty">Keep playing!</div>'
                }
            </div>
        </div>
    `;
}

// ─── Styles ───────────────────────────────────────────────────────────────

export function injectParentsStyles() {
    if (document.getElementById('parents-styles')) return;
    const style = document.createElement('style');
    style.id = 'parents-styles';
    style.textContent = `
      /* ── Screen ── */
      .parents-screen {
        background: #F1F5F9;
        color: #1E293B;
        overflow-y: auto;
        align-items: flex-start;
      }
      .parents-title { color: #475569; }

      /* ── Math gate ── */
      .math-gate-container {
        background: white;
        border-radius: var(--radius-xl);
        padding: var(--space-2xl);
        max-width: 420px;
        width: 90%;
        margin: 80px auto;
        text-align: center;
        box-shadow: var(--shadow-xl);
        animation: pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .gate-icon { font-size: 3rem; margin-bottom: var(--space-md); }
      .math-gate-container h2 { font-family: var(--font-display); color: #B91C1C; margin-bottom: var(--space-sm); }
      .math-gate-container p  { color: #64748B; margin-bottom: var(--space-lg); }
      .math-problem { font-size: 2rem; font-family: var(--font-display); margin: var(--space-lg) 0; color: #1E293B; }
      .math-input-group { display: flex; gap: var(--space-sm); justify-content: center; }
      .math-input-group input {
        width: 100px; font-size: 1.5rem; text-align: center;
        padding: var(--space-sm); border: 2px solid #CBD5E1;
        border-radius: var(--radius-md); font-weight: bold; outline: none;
      }
      .math-input-group input:focus { border-color: #3B82F6; }
      .math-input-group button {
        background: #3B82F6; color: white; border: none;
        padding: 0 var(--space-xl); border-radius: var(--radius-md);
        font-size: 1.1rem; font-weight: bold; cursor: pointer; transition: transform 0.1s;
      }
      .math-input-group button:active { transform: scale(0.95); }
      .math-error { color: #EF4444; font-weight: bold; margin-top: var(--space-md); min-height: 24px; }

      /* ── Dashboard wrapper ── */
      .dashboard-container {
        width: 100%;
        max-width: 900px;
        margin: 0 auto;
        padding: var(--space-xl) var(--space-lg) var(--space-2xl);
        animation: screenFadeIn 0.3s ease;
      }

      /* ── Header ── */
      .dash-header {
        display: flex; align-items: center; gap: var(--space-lg);
        background: white; border-radius: var(--radius-xl);
        padding: var(--space-xl); margin-bottom: var(--space-lg);
        box-shadow: var(--shadow-sm);
      }
      .dash-avatar {
        font-size: 3.5rem; background: #F1F5F9;
        width: 80px; height: 80px; display: flex;
        align-items: center; justify-content: center;
        border-radius: 50%; flex-shrink: 0;
      }
      .dash-header-info h2 { font-family: var(--font-display); font-size: 1.8rem; color: #0F172A; }
      .dash-last-active { color: #94A3B8; font-size: 0.9rem; margin-top: 4px; }

      /* ── Summary strip ── */
      .dash-summary-strip {
        display: grid; grid-template-columns: repeat(4, 1fr);
        gap: var(--space-md); margin-bottom: var(--space-lg);
      }
      .dash-summary-item {
        background: white; border-radius: var(--radius-lg);
        padding: var(--space-lg) var(--space-md);
        display: flex; flex-direction: column; align-items: center; gap: 4px;
        box-shadow: var(--shadow-sm);
      }
      .dash-summary-icon { font-size: 1.8rem; }
      .dash-summary-value { font-family: var(--font-display); font-size: 1.8rem; font-weight: 900; color: #0F172A; }
      .dash-summary-label { font-size: 0.75rem; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; }

      /* ── Sections ── */
      .dash-section {
        background: white; border-radius: var(--radius-xl);
        padding: var(--space-xl); margin-bottom: var(--space-lg);
        box-shadow: var(--shadow-sm);
      }
      .dash-section-title {
        font-family: var(--font-display); font-size: 1.2rem;
        color: #334155; margin-bottom: var(--space-lg);
        padding-bottom: var(--space-sm); border-bottom: 2px solid #F1F5F9;
      }

      /* ── Completion rows ── */
      .dash-completion-grid { display: flex; flex-direction: column; gap: var(--space-md); }
      .comp-row {
        display: grid; align-items: center;
        grid-template-columns: 120px 1fr 48px 80px;
        gap: var(--space-md);
      }
      .comp-label { font-weight: 600; font-size: 0.95rem; color: #334155; }
      .comp-bar { height: 10px; background: #E2E8F0; border-radius: 5px; overflow: hidden; }
      .comp-fill { height: 100%; background: linear-gradient(90deg, #3B82F6, #60A5FA); border-radius: 5px; transition: width 0.6s ease; }
      .comp-pct { font-size: 0.85rem; font-weight: 700; color: #475569; text-align: right; }
      .comp-acc { font-size: 0.8rem; font-weight: 600; text-align: right; }
      .acc-good { color: #16A34A; }
      .acc-ok   { color: #D97706; }
      .acc-low  { color: #DC2626; }

      /* ── Letter grid ── */
      .dash-legend {
        display: flex; align-items: center; gap: var(--space-md);
        font-size: 0.8rem; color: #64748B; flex-wrap: wrap;
        margin-bottom: var(--space-lg);
      }
      .legend-dot {
        display: inline-block; width: 12px; height: 12px;
        border-radius: 3px; margin-right: 4px;
      }
      .legend-dot.grey   { background: #E2E8F0; }
      .legend-dot.green  { background: #86EFAC; }
      .legend-dot.yellow { background: #FDE68A; }
      .legend-dot.red    { background: #FCA5A5; }

      .dash-letter-grid {
        display: grid; grid-template-columns: repeat(13, 1fr);
        gap: 6px;
      }
      .letter-cell {
        aspect-ratio: 1; border-radius: 6px;
        display: flex; align-items: center; justify-content: center;
        font-family: var(--font-display); font-size: 1rem; font-weight: 800;
        cursor: default;
      }
      .letter-cell-grey   { background: #E2E8F0; color: #94A3B8; }
      .letter-cell-green  { background: #86EFAC; color: #14532D; }
      .letter-cell-yellow { background: #FDE68A; color: #78350F; }
      .letter-cell-red    { background: #FCA5A5; color: #7F1D1D; }

      /* ── Mastered / Struggling ── */
      .dash-ms-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg); }
      .dash-ms-head {
        font-size: 0.8rem; font-weight: 700; text-transform: uppercase;
        letter-spacing: 0.5px; margin-bottom: var(--space-sm);
      }
      .struggling-head { color: #DC2626; }
      .mastered-head   { color: #16A34A; }

      .dash-chip {
        display: flex; justify-content: space-between; align-items: center;
        padding: 6px 10px; border-radius: 8px; margin-bottom: 6px;
        font-size: 0.95rem;
      }
      .struggling-chip { background: #FEF2F2; color: #B91C1C; border: 1px solid #FECACA; }
      .mastered-chip   { background: #F0FDF4; color: #15803D; border: 1px solid #BBF7D0; }
      .dash-chip strong { font-size: 1rem; }
      .dash-empty { color: #94A3B8; font-size: 0.9rem; font-style: italic; }
      .dash-empty-state { color: #94A3B8; font-size: 0.95rem; text-align: center; padding: var(--space-lg) 0; }

      /* ── Reset ── */
      /* ── Badges section ── */
      .dash-badges-row {
        display: flex; align-items: center; flex-wrap: wrap;
        gap: var(--space-md);
      }
      .dash-badges-count {
        font-family: var(--font-display); font-size: 1.1rem;
        font-weight: 800; color: #7C3AED;
      }
      .dash-badges-recent { display: flex; gap: 8px; flex-wrap: wrap; flex: 1; }
      .dash-badge-icon {
        width: 40px; height: 40px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 1.3rem; box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      }
      .dash-badges-empty { color: #94A3B8; font-size: 0.9rem; flex: 1; }
      .dash-badges-view-btn {
        background: linear-gradient(135deg, #A78BFA, #7C3AED);
        color: #fff; border: none; cursor: pointer;
        font-family: var(--font-display); font-size: 0.9rem; font-weight: 700;
        padding: 8px 18px; border-radius: 20px;
        box-shadow: 0 3px 10px rgba(124,58,237,0.35);
        white-space: nowrap;
      }

      /* ── Share button ── */
      .dash-share-row { text-align: center; padding: var(--space-md) 0 var(--space-sm); }
      .dash-share-btn {
        background: linear-gradient(135deg, #4FC3F7, #0288D1);
        color: #fff;
        border: none;
        padding: var(--space-md) var(--space-2xl, 2rem);
        border-radius: var(--radius-full);
        font-family: var(--font-display);
        font-size: 1rem;
        font-weight: 800;
        cursor: pointer;
        box-shadow: 0 4px 0 rgba(0,0,0,0.15), var(--shadow-md);
        transition: transform 0.15s;
      }
      .dash-share-btn:active { transform: translateY(2px); }
      .dash-share-toast {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        background: #1E293B;
        color: #fff;
        padding: 10px 20px;
        border-radius: var(--radius-full);
        font-size: 0.9rem;
        font-weight: 600;
        z-index: 999;
        animation: toastIn 0.25s ease forwards;
      }
      @keyframes toastIn {
        from { opacity:0; transform: translateX(-50%) translateY(10px); }
        to   { opacity:1; transform: translateX(-50%) translateY(0); }
      }

      .dash-reset-section { text-align: center; }
      .dash-reset-btn {
        background: #FEF2F2; color: #DC2626; border: 2px solid #FECACA;
        padding: var(--space-md) var(--space-xl); border-radius: var(--radius-lg);
        font-family: var(--font-display); font-size: 1rem; font-weight: 700;
        cursor: pointer; transition: background 0.15s;
      }
      .dash-reset-btn:hover { background: #FEE2E2; }
      .dash-reset-warning { color: #94A3B8; font-size: 0.8rem; margin-top: var(--space-sm); }

      /* ── Responsive ── */
      @media (max-width: 600px) {
        .dash-summary-strip { grid-template-columns: repeat(2, 1fr); }
        .comp-row { grid-template-columns: 90px 1fr 40px 60px; }
        .dash-letter-grid { grid-template-columns: repeat(9, 1fr); }
        .dash-ms-grid { grid-template-columns: 1fr; }
      }
    `;
    document.head.appendChild(style);
}
