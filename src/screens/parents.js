import { getAllProgress, getActiveProfile, getProfiles } from '../shared/storage.js';
import { playPopSound, playWrongSound, playCorrectSound } from '../shared/audio.js';

let unlocked = false;
let mathAnswer = 0;

export function renderParents(app, navigate) {
    unlocked = false;
    
    // Generate a simple math gate
    const num1 = Math.floor(Math.random() * 5) + 5; // 5 to 9
    const num2 = Math.floor(Math.random() * 5) + 5; // 5 to 9
    mathAnswer = num1 * num2;

    app.innerHTML = `
      <div class="screen parents-screen" id="parents-view">
        <div class="top-bar">
          <button class="back-btn" id="parents-back">🏠</button>
          <div class="top-bar-title parents-title">Grown-Ups Only</div>
        </div>

        <div class="math-gate-container" id="math-gate">
            <h2>Grown-Ups Only</h2>
            <p>To access the Parent Dashboard, please solve:</p>
            <div class="math-problem">What is <b>${num1} &times; ${num2}</b>?</div>
            <div class="math-input-group">
                <input type="number" id="math-input" placeholder="?" autocomplete="off" />
                <button id="math-submit">Unlock</button>
            </div>
            <div id="math-error" class="math-error"></div>
        </div>

        <div class="dashboard-container" id="dashboard" style="display: none;">
            <!-- Dashboard content injected here dynamically upon unlock -->
        </div>
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
}

function attemptUnlock() {
    const input = document.getElementById('math-input').value;
    if (parseInt(input, 10) === mathAnswer) {
        unlocked = true;
        playCorrectSound();
        document.getElementById('math-gate').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        renderDashboardContent();
    } else {
        playWrongSound();
        document.getElementById('math-input').value = '';
        const error = document.getElementById('math-error');
        error.textContent = 'Incorrect. Please try again.';
        setTimeout(() => error.textContent = '', 2000);
    }
}

function renderDashboardContent() {
    const p = getAllProgress();
    const activeId = getActiveProfile();
    const profiles = getProfiles();
    const me = profiles.find(pr => pr.id === activeId) || { name: 'Player', avatar: '🦊' };

    // ALPHABET STATS
    const letterScores = p.alphabet?.letterScores || {};
    const alphabetMetrics = calculateConcepts(letterScores);

    // CVC STATS
    const cvcScores = p.cvc?.wordScores || {};
    const cvcMetrics = calculateConcepts(cvcScores);

    // WORD BUILDER STATS
    const wbScores = p.wordBuilder?.wordScores || {};
    const wbMetrics = calculateConcepts(wbScores);

    const container = document.getElementById('dashboard');
    container.innerHTML = `
        <div class="dashboard-header">
            <div class="dash-avatar">${me.avatar}</div>
            <h2>${me.name}'s Progress</h2>
        </div>

        <div class="dash-grid">
            ${renderStatCard('Alphabet & Phonics', getPercent(p.alphabet?.quizCorrect, p.alphabet?.quizTotal), alphabetMetrics)}
            ${renderStatCard('CVC Words', getPercent(p.cvc?.quizCorrect, p.cvc?.quizTotal), cvcMetrics)}
            ${renderStatCard('Word Builder', getPercent(wbMetrics.totalCorrect, wbMetrics.totalAttempts), wbMetrics)}
        </div>
    `;
}

function getPercent(correct = 0, total = 0) {
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
}

function calculateConcepts(scoreMap) {
    let list = [];
    let totalC = 0;
    let totalW = 0;

    for (const [key, stats] of Object.entries(scoreMap)) {
        totalC += stats.correct;
        totalW += stats.wrong;
        const total = stats.correct + stats.wrong;
        if (total > 0) {
            list.push({ 
                concept: key, 
                ratio: stats.correct / total, 
                attempts: total,
                correct: stats.correct,
                wrong: stats.wrong
            });
        }
    }

    // Sort by ratio
    list.sort((a, b) => b.ratio - a.ratio); // Highest ratio first
    
    // Mastered: Ratio >= 80% and at least 2 attempts
    const mastered = list.filter(item => item.ratio >= 0.8 && item.attempts >= 2).slice(0, 3);
    
    // Struggling: Ratio <= 60% and at least 2 attempts, sorted poorest ratio first
    const struggling = list.filter(item => item.ratio <= 0.6 && item.attempts >= 2).sort((a, b) => a.ratio - b.ratio).slice(0, 3);

    return { totalCorrect: totalC, totalAttempts: totalC + totalW, mastered, struggling };
}

function renderStatCard(title, overallPercent, metrics) {
    return `
        <div class="dash-card">
            <h3>${title}</h3>
            <div class="dash-progress-wrap">
                <div class="dash-progress-bar">
                    <div class="dash-progress-fill" style="width: ${overallPercent}%"></div>
                </div>
                <div class="dash-progress-text">${overallPercent}% Overall Accuracy</div>
            </div>

            <div class="dash-columns">
                <div class="dash-col dash-struggling">
                    <h4>Needs Practice</h4>
                    ${metrics.struggling.length > 0 
                        ? metrics.struggling.map(m => `
                            <div class="dash-chip wrong">
                                <strong>${m.concept}</strong> (${Math.round(m.ratio * 100)}%)
                            </div>
                          `).join('')
                        : '<div class="dash-empty">Not enough data yet.</div>'
                    }
                </div>
                <div class="dash-col dash-mastered">
                    <h4>Mastered</h4>
                    ${metrics.mastered.length > 0 
                        ? metrics.mastered.map(m => `
                            <div class="dash-chip correct">
                                <strong>${m.concept}</strong> (${Math.round(m.ratio * 100)}%)
                            </div>
                          `).join('')
                        : '<div class="dash-empty">Not enough data yet.</div>'
                    }
                </div>
            </div>
        </div>
    `;
}

export function injectParentsStyles() {
    if (document.getElementById('parents-styles')) return;
    const style = document.createElement('style');
    style.id = 'parents-styles';
    style.textContent = `
      .parents-screen { background: #F8FAFC; color: #334155; }
      .parents-title { color: #64748B; font-size: 1.5rem; }
      
      /* Math Gate */
      .math-gate-container {
          background: white; border-radius: var(--radius-xl); padding: var(--space-xl);
          max-width: 400px; width: 90%; margin: 80px auto; text-align: center;
          box-shadow: var(--shadow-xl); animation: pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .math-gate-container h2 { font-family: var(--font-display); color: #B91C1C; margin-bottom: var(--space-md); }
      .math-problem { font-size: 2rem; font-family: var(--font-display); margin: var(--space-lg) 0; color: #1E293B; }
      .math-input-group { display: flex; gap: var(--space-sm); justify-content: center; }
      .math-input-group input { width: 100px; font-size: 1.5rem; text-align: center; padding: var(--space-sm); border: 2px solid #CBD5E1; border-radius: var(--radius-md); font-weight: bold; outline: none; }
      .math-input-group input:focus { border-color: #3B82F6; }
      .math-input-group button { background: #3B82F6; color: white; border: none; padding: 0 var(--space-lg); border-radius: var(--radius-md); font-size: 1.2rem; font-weight: bold; cursor: pointer; transition: transform 0.1s; }
      .math-input-group button:active { transform: scale(0.95); }
      .math-error { color: #EF4444; font-weight: bold; margin-top: var(--space-md); min-height: 24px; }

      /* Dashboard */
      .dashboard-container { max-width: 1000px; margin: 0 auto; padding: var(--space-xl); animation: screenFadeIn 0.3s ease; }
      .dashboard-header { display: flex; align-items: center; gap: var(--space-lg); margin-bottom: var(--space-xl); }
      .dash-avatar { font-size: 4rem; background: white; width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; border-radius: 50%; box-shadow: var(--shadow-sm); }
      .dashboard-header h2 { font-family: var(--font-display); font-size: 2.5rem; color: #0F172A; }

      .dash-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-lg); }
      .dash-card { background: white; border-radius: var(--radius-xl); padding: var(--space-xl); box-shadow: var(--shadow-md); display: flex; flex-direction: column; }
      .dash-card h3 { font-family: var(--font-display); font-size: 1.5rem; color: #334155; margin-bottom: var(--space-md); padding-bottom: var(--space-sm); border-bottom: 2px solid #F1F5F9; }
      
      .dash-progress-wrap { margin-bottom: var(--space-lg); }
      .dash-progress-bar { height: 12px; background: #E2E8F0; border-radius: 6px; overflow: hidden; margin-bottom: var(--space-xs); }
      .dash-progress-fill { height: 100%; background: #3B82F6; border-radius: 6px; }
      .dash-progress-text { font-size: 0.9rem; color: #64748B; font-weight: bold; text-align: right; }

      .dash-columns { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); flex: 1; }
      .dash-col { background: #F8FAFC; border-radius: var(--radius-lg); padding: var(--space-md); }
      .dash-col h4 { font-size: 0.9rem; color: #64748B; margin-bottom: var(--space-sm); text-transform: uppercase; letter-spacing: 1px; }
      
      .dash-struggling h4 { color: #DC2626; }
      .dash-mastered h4 { color: #16A34A; }

      .dash-chip { font-family: var(--font-display); padding: var(--space-xs) var(--space-sm); border-radius: 6px; margin-bottom: var(--space-xs); font-size: 1rem; color: white; display: flex; justify-content: space-between; align-items: center; font-weight: normal; }
      .dash-chip strong { font-size: 1.2rem; }
      .dash-chip.wrong { background: #FEE2E2; color: #B91C1C; border: 1px solid #FECACA; }
      .dash-chip.correct { background: #DCFCE7; color: #15803D; border: 1px solid #BBF7D0; }
      .dash-empty { color: #94A3B8; font-size: 0.9rem; font-style: italic; }
    `;
    document.head.appendChild(style);
}
