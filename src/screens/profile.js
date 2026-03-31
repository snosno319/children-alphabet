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
            <!-- Floating background decorations -->
            <div class="profile-bg-decos" aria-hidden="true">
                <span style="--px:10%;--py:8%;--d:0s">⭐</span>
                <span style="--px:85%;--py:12%;--d:0.8s">🌈</span>
                <span style="--px:5%;--py:70%;--d:1.5s">🎈</span>
                <span style="--px:88%;--py:68%;--d:0.4s">✨</span>
                <span style="--px:50%;--py:90%;--d:1.1s">🌟</span>
            </div>

            <!-- Title -->
            <div class="profile-title-block">
                <div class="profile-title-emoji">👋</div>
                <h1 class="profile-title">Who is playing?</h1>
            </div>

            <!-- Profile grid -->
            <div class="profile-grid" id="profile-grid">
                ${profiles.map(p => `
                    <button class="profile-card" data-id="${p.id}" style="--p-color:${p.color}">
                        <div class="profile-avatar-ring" style="--ring-color:${p.color}">
                            <div class="profile-avatar">${p.avatar}</div>
                        </div>
                        <div class="profile-name">${p.name}</div>
                    </button>
                `).join('')}
                <button class="profile-card profile-add" id="add-profile-btn">
                    <div class="profile-avatar-ring" style="--ring-color:#CBD5E1">
                        <div class="profile-avatar profile-add-icon">➕</div>
                    </div>
                    <div class="profile-name">New Player</div>
                </button>
            </div>

            <!-- Create profile modal -->
            <div class="profile-modal-overlay" id="new-profile-modal" style="display:none">
                <div class="profile-modal">
                    <div class="modal-title-row">
                        <span class="modal-title-emoji" id="modal-selected-emoji">🦊</span>
                        <h2>Create Profile</h2>
                    </div>
                    <input type="text" id="new-profile-name" class="profile-input"
                        placeholder="Type name here" maxlength="12" autocomplete="off" />
                    <div class="avatar-grid" id="avatar-grid">
                        ${AVATARS.map((a, i) => `
                            <button class="avatar-choice ${i === 0 ? 'selected' : ''}"
                                data-idx="${i}" style="--a-color:${a.color}">
                                ${a.emoji}
                            </button>
                        `).join('')}
                    </div>
                    <div class="modal-actions">
                        <button class="modal-btn cancel" id="cancel-profile">✕ Cancel</button>
                        <button class="modal-btn save" id="save-profile">✓ Save</button>
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
            card.style.animation = 'jelly 0.4s ease';
            setActiveProfile(card.dataset.id);
            setTimeout(() => {
                document.getElementById('profile-selection').classList.add('exiting');
                setTimeout(() => navigate('hub'), 200);
            }, 250);
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
            document.getElementById('modal-selected-emoji').textContent = AVATARS[selectedAvatarIdx].emoji;
        }
    });

    // Save profile
    document.getElementById('save-profile').addEventListener('click', () => {
        const input = document.getElementById('new-profile-name');
        const name = input.value.trim();
        if (!name) {
            input.style.animation = 'shake 400ms ease';
            setTimeout(() => input.style.animation = '', 400);
            return;
        }

        playCelebrationSound();
        const a = AVATARS[selectedAvatarIdx];
        const newProfile = {
            id: 'p_' + Date.now().toString(36),
            name,
            avatar: a.emoji,
            color: a.color,
        };
        profiles.push(newProfile);
        saveProfiles(profiles);
        setActiveProfile(newProfile.id);

        document.getElementById('new-profile-modal').style.display = 'none';
        document.getElementById('profile-selection').classList.add('exiting');
        setTimeout(() => navigate('hub'), 300);
    });

    // Enter key saves
    document.getElementById('new-profile-name').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('save-profile').click();
    });
}

export function injectProfileStyles() {
    if (document.getElementById('profile-styles')) return;
    const style = document.createElement('style');
    style.id = 'profile-styles';
    style.textContent = `
        .profile-screen {
            background: linear-gradient(160deg, #FFF8F0 0%, #F0E6FF 40%, #E0F0FF 70%, #F0FFF4 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: var(--space-xl);
            padding: var(--space-xl);
            overflow: hidden;
        }

        /* Background floating emojis */
        .profile-bg-decos {
            position: absolute;
            inset: 0;
            pointer-events: none;
            overflow: hidden;
        }
        .profile-bg-decos span {
            position: absolute;
            left: var(--px);
            top: var(--py);
            font-size: 2.2rem;
            opacity: 0.12;
            animation: float 5s ease-in-out infinite;
            animation-delay: var(--d);
        }

        /* Title block */
        .profile-title-block {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--space-sm);
            z-index: 1;
        }
        .profile-title-emoji {
            font-size: 3.5rem;
            animation: bounce 2s ease-in-out infinite;
        }
        .profile-title {
            font-family: var(--font-display);
            font-size: clamp(2rem, 6vw, 3rem);
            color: #4C1D95;
            text-shadow: 0 4px 12px rgba(76,29,149,0.15);
            margin: 0;
        }

        /* Profile grid */
        .profile-grid {
            display: flex;
            gap: var(--space-lg);
            flex-wrap: wrap;
            justify-content: center;
            max-width: 700px;
            z-index: 1;
        }

        .profile-card {
            width: 140px;
            border-radius: var(--radius-xl);
            background: white;
            border: none;
            box-shadow: 0 6px 0 rgba(0,0,0,0.08), var(--shadow-lg);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: var(--space-lg) var(--space-md);
            gap: var(--space-md);
            cursor: pointer;
            transition: transform var(--transition-bounce);
            position: relative;
            overflow: hidden;
        }
        .profile-card::before {
            content: '';
            position: absolute;
            inset: 0;
            background: var(--p-color, #000);
            opacity: 0.04;
            pointer-events: none;
        }
        .profile-card:active { transform: scale(0.9); }

        .profile-avatar-ring {
            width: 80px; height: 80px;
            border-radius: 50%;
            border: 4px solid var(--ring-color, #E2E8F0);
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4));
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transition: transform var(--transition-bounce);
        }
        .profile-card:hover .profile-avatar-ring { transform: scale(1.08) rotate(5deg); }
        .profile-avatar { font-size: 3rem; line-height: 1; }
        .profile-name {
            font-family: var(--font-display);
            font-size: 1.2rem;
            color: var(--color-text);
            font-weight: 800;
        }

        /* Add profile */
        .profile-add { box-shadow: 0 3px 0 #CBD5E1, var(--shadow-md); }
        .profile-add .profile-avatar-ring { border-style: dashed; }
        .profile-add-icon { color: #94A3B8; font-size: 2rem; }
        .profile-add .profile-name { color: #64748B; font-size: 1rem; }

        /* Modal */
        .profile-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15,5,40,0.6);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
            animation: screenFadeIn 0.2s;
        }
        .profile-modal-overlay.fade-out { animation: fadeOut 0.2s forwards; }

        .profile-modal {
            background: white;
            border-radius: var(--radius-xl);
            padding: var(--space-xl);
            width: 90%;
            max-width: 380px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            display: flex;
            flex-direction: column;
            gap: var(--space-lg);
            animation: pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .modal-title-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--space-md);
        }
        .modal-title-emoji {
            font-size: 2.5rem;
            animation: bounce 2s ease-in-out infinite;
        }
        .profile-modal h2 {
            font-family: var(--font-display);
            color: #4C1D95;
            font-size: 1.8rem;
            margin: 0;
        }

        .profile-input {
            width: 100%;
            padding: var(--space-md);
            font-size: 1.5rem;
            font-family: var(--font-display);
            font-weight: 700;
            border: 3px solid #E2E8F0;
            border-radius: var(--radius-lg);
            text-align: center;
            color: var(--color-text);
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        .profile-input:focus {
            border-color: #A78BFA;
            box-shadow: 0 0 0 3px rgba(167,139,250,0.2);
        }

        .avatar-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: var(--space-sm);
        }
        .avatar-choice {
            aspect-ratio: 1;
            border-radius: var(--radius-lg);
            border: 3px solid transparent;
            background: rgba(0,0,0,0.03);
            font-size: 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform var(--transition-bounce), border-color 0.15s;
        }
        .avatar-choice:active { transform: scale(0.85); }
        .avatar-choice.selected {
            border-color: var(--a-color, var(--color-primary));
            background: linear-gradient(135deg, var(--a-color, var(--color-primary)) 0%, rgba(255,255,255,0.3) 100%);
            transform: scale(1.12);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .modal-actions {
            display: flex;
            gap: var(--space-md);
        }
        .modal-btn {
            flex: 1;
            padding: var(--space-md);
            font-family: var(--font-display);
            font-weight: 800;
            font-size: 1.1rem;
            border-radius: var(--radius-lg);
            border: none;
            cursor: pointer;
            transition: transform 0.1s, box-shadow 0.1s;
        }
        .modal-btn:active { transform: scale(0.95); }
        .modal-btn.cancel {
            background: #F1F5F9;
            color: #64748B;
            box-shadow: 0 3px 0 #CBD5E1;
        }
        .modal-btn.save {
            background: linear-gradient(135deg, #A78BFA, #7C3AED);
            color: white;
            box-shadow: 0 4px 0 #5B21B6, 0 6px 16px rgba(124,58,237,0.3);
        }
        .modal-btn.save:active { box-shadow: 0 1px 0 #5B21B6; }

        @media (max-width: 400px) {
            .profile-card { width: 120px; }
            .profile-avatar { font-size: 2.5rem; }
        }
    `;
    document.head.appendChild(style);
}
