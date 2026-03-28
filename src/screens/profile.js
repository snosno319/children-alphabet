/**
 * Profile Selection Screen — "Who is playing?"
 * Allows multiple children to share the app with distinct save files.
 */
import { getProfiles, saveProfiles, setActiveProfile } from '../shared/storage.js';
import { playPopSound, playCelebrationSound } from '../shared/audio.js';

const AVATARS = [
    { emoji: '🦊', color: '#FFB74D' },
    { emoji: '🐻', color: '#FF8A65' },
    { emoji: '🐼', color: '#90A4AE' },
    { emoji: '🐯', color: '#FFCA28' },
    { emoji: '🐰', color: '#F06292' },
    { emoji: '🐸', color: '#81C784' },
    { emoji: '🐱', color: '#BA68C8' },
    { emoji: '🐶', color: '#4FC3F7' },
];

export function renderProfileScreen(app, navigate) {
    let profiles = getProfiles();

    app.innerHTML = `
      <div class="screen profile-screen" id="profile-selection">
        <h1 class="profile-title">Who is playing?</h1>
        
        <div class="profile-grid" id="profile-grid">
            ${profiles.map(p => `
                <button class="profile-card" data-id="${p.id}" style="--p-color: ${p.color}">
                    <div class="profile-avatar">${p.avatar}</div>
                    <div class="profile-name">${p.name}</div>
                </button>
            `).join('')}
            <button class="profile-card profile-add" id="add-profile-btn">
                <div class="profile-avatar">➕</div>
                <div class="profile-name">New Player</div>
            </button>
        </div>

        <div class="profile-modal-overlay" id="new-profile-modal" style="display:none">
            <div class="profile-modal">
                <h2>Create Profile</h2>
                <input type="text" id="new-profile-name" class="profile-input" placeholder="Type name here" maxlength="12" autocomplete="off" />
                <div class="avatar-grid" id="avatar-grid">
                    ${AVATARS.map((a, i) => `
                        <button class="avatar-choice ${i === 0 ? 'selected' : ''}" data-idx="${i}" style="--a-color: ${a.color}">
                            ${a.emoji}
                        </button>
                    `).join('')}
                </div>
                <div class="modal-actions">
                    <button class="modal-btn cancel" id="cancel-profile">Cancel</button>
                    <button class="modal-btn save" id="save-profile">Save</button>
                </div>
            </div>
        </div>
      </div>
    `;

    // Click existing profile
    document.getElementById('profile-grid').addEventListener('click', (e) => {
        const card = e.target.closest('.profile-card[data-id]');
        if (card) {
            playPopSound();
            setActiveProfile(card.dataset.id);
            document.getElementById('profile-selection').classList.add('exiting');
            setTimeout(() => navigate('hub'), 300);
        }
    });

    // Add profile
    document.getElementById('add-profile-btn').addEventListener('click', () => {
        playPopSound();
        document.getElementById('new-profile-modal').style.display = 'flex';
        document.getElementById('new-profile-name').focus();
    });

    // Cancel modal
    document.getElementById('cancel-profile').addEventListener('click', () => {
        playPopSound();
        const modal = document.getElementById('new-profile-modal');
        modal.classList.add('fade-out');
        setTimeout(() => {
            modal.style.display = 'none';
            modal.classList.remove('fade-out');
        }, 200);
    });

    // Select avatar
    let selectedAvatarIdx = 0;
    document.getElementById('avatar-grid').addEventListener('click', (e) => {
        const btn = e.target.closest('.avatar-choice');
        if (btn) {
            playPopSound();
            document.querySelectorAll('.avatar-choice').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedAvatarIdx = parseInt(btn.dataset.idx);
        }
    });

    // Save profile
    document.getElementById('save-profile').addEventListener('click', () => {
        const input = document.getElementById('new-profile-name');
        const name = input.value.trim();
        if (!name) return;

        playCelebrationSound();
        const a = AVATARS[selectedAvatarIdx];
        const newProfile = {
            id: 'p_' + Date.now().toString(36),
            name: name,
            avatar: a.emoji,
            color: a.color
        };
        profiles.push(newProfile);
        saveProfiles(profiles);
        setActiveProfile(newProfile.id);

        document.getElementById('new-profile-modal').style.display = 'none';
        document.getElementById('profile-selection').classList.add('exiting');
        setTimeout(() => navigate('hub'), 300);
    });
}

export function injectProfileStyles() {
    if (document.getElementById('profile-styles')) return;
    const style = document.createElement('style');
    style.id = 'profile-styles';
    style.textContent = `
      .profile-screen { background: var(--color-bg); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: var(--space-xl); }
      .profile-title { font-family: var(--font-display); font-size: 3rem; color: var(--color-primary-dark); margin-bottom: var(--space-xl); text-shadow: 0 4px 12px rgba(0,0,0,0.1); }
      
      .profile-grid { display: flex; gap: var(--space-xl); flex-wrap: wrap; justify-content: center; max-width: 800px; }
      
      .profile-card {
          width: 140px; height: 180px; border-radius: var(--radius-xl); background: white;
          border: 4px solid var(--p-color, #E2E8F0); box-shadow: var(--shadow-md);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          cursor: pointer; transition: transform var(--transition-bounce), box-shadow 0.2s;
          position: relative; overflow: hidden;
      }
      .profile-card:active { transform: scale(0.9); }
      .profile-card::before { content:''; position:absolute; inset:0; background:var(--p-color, #000); opacity:0.05; pointer-events:none; }
      
      .profile-avatar { font-size: 4rem; line-height: 1; transition: transform 0.3s; }
      .profile-card:hover .profile-avatar { transform: scale(1.1) rotate(5deg); }
      
      .profile-name { font-family: var(--font-display); font-size: 1.5rem; color: var(--color-text); margin-top: var(--space-md); font-weight: 800; }
      
      .profile-add { border-color: #CBD5E1; border-style: dashed; }
      .profile-add .profile-avatar { color: #94A3B8; font-size: 3rem; }
      .profile-add .profile-name { color: #64748B; font-size: 1.2rem; }

      .profile-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 100; animation: screenFadeIn 0.2s; }
      .profile-modal-overlay.fade-out { animation: fadeOut 0.2s forwards; }
      
      .profile-modal { background: white; border-radius: var(--radius-xl); padding: var(--space-xl); width: 90%; max-width: 400px; box-shadow: var(--shadow-lg); text-align: center; display: flex; flex-direction: column; gap: var(--space-lg); animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
      .profile-modal h2 { font-family: var(--font-display); color: var(--color-primary-dark); font-size: 2rem; margin: 0; }
      
      .profile-input { width: 100%; padding: var(--space-md); font-size: 1.5rem; font-family: var(--font-display); font-weight: 700; border: 3px solid #E2E8F0; border-radius: var(--radius-lg); text-align: center; color: var(--color-text); outline: none; transition: border-color 0.2s; }
      .profile-input:focus { border-color: var(--color-primary); }
      
      .avatar-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-sm); }
      .avatar-choice { aspect-ratio: 1; border-radius: var(--radius-lg); border: 3px solid transparent; background: rgba(0,0,0,0.03); font-size: 2.5rem; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s; }
      .avatar-choice.selected { border-color: var(--a-color, var(--color-primary)); background: var(--a-color, var(--color-primary)); background-image: linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0)); transform: scale(1.1); box-shadow: var(--shadow-sm); }
      
      .modal-actions { display: flex; gap: var(--space-md); }
      .modal-btn { flex: 1; padding: var(--space-md); font-family: var(--font-display); font-weight: 800; font-size: 1.2rem; border-radius: var(--radius-lg); border: none; cursor: pointer; transition: transform 0.1s; }
      .modal-btn:active { transform: scale(0.95); }
      .modal-btn.cancel { background: #E2E8F0; color: #64748B; }
      .modal-btn.save { background: var(--color-primary); color: white; box-shadow: 0 4px 12px rgba(96, 165, 250, 0.4); }
    `;
    document.head.appendChild(style);
}
