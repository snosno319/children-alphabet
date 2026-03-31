/**
 * Confetti — English Adventure
 * Physics-based celebrations using canvas-confetti (catdad/canvas-confetti).
 * Three modes: normal burst, big fireworks, star burst.
 */
import confetti from 'canvas-confetti';

const COLORS = ['#FF6B6B', '#4ECDC4', '#A78BFA', '#FFE66D', '#F472B6', '#60A5FA', '#34D399', '#FFB300', '#FB923C'];

/** Standard end-of-round celebration burst */
export function spawnConfetti() {
    confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.55 },
        colors: COLORS,
        ticks: 200,
        gravity: 0.9,
        scalar: 1.1,
    });
}

/** Big fireworks-style celebration for major milestones */
export function spawnBigCelebration() {
    const count = 220;
    const defaults = { colors: COLORS, ticks: 300 };

    function fire(particleRatio, opts) {
        confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
    }

    fire(0.25, { spread: 26, startVelocity: 55, origin: { y: 0.6 } });
    fire(0.20, { spread: 60, origin: { y: 0.6 } });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, origin: { y: 0.6 } });
    fire(0.10, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, origin: { y: 0.6 } });
    fire(0.10, { spread: 120, startVelocity: 45, origin: { y: 0.6 } });
}

/** Star burst — shapes as stars, for correct-answer moments */
export function spawnStarBurst(originX = 0.5, originY = 0.5) {
    const starColors = ['#FFE66D', '#FFB300', '#FF6B6B', '#A78BFA', '#60A5FA'];
    confetti({
        particleCount: 40,
        spread: 55,
        origin: { x: originX, y: originY },
        colors: starColors,
        shapes: ['star'],
        scalar: 1.4,
        ticks: 180,
        gravity: 0.8,
    });
}
