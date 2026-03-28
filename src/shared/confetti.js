/**
 * Confetti effect — English Adventure
 * Shared celebration animation.
 */
export function spawnConfetti() {
    const colors = ['#FF6B6B', '#4ECDC4', '#A78BFA', '#FFE66D', '#F472B6', '#60A5FA', '#34D399', '#FFB300'];
    for (let i = 0; i < 30; i++) {
        const el = document.createElement('div');
        el.className = 'confetti';
        el.style.left = `${Math.random() * 100}vw`;
        el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        el.style.animationDuration = `${2 + Math.random() * 2}s`;
        el.style.animationDelay = `${Math.random() * 0.5}s`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 4000);
    }
}
