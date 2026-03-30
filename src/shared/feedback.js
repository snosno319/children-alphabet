/**
 * feedback.js — Visual feedback utilities for English Adventure
 *
 * floatStar(originEl)   — spawns a ⭐ that floats up and fades from a button
 * ripplePress(el)       — adds a ripple circle on tap
 * shakeEl(el)           — brief horizontal shake on wrong answer
 * bounceEl(el)          — quick pop-bounce on correct answer
 */

/**
 * Spawn a floating ⭐ from the centre of an element.
 * The star drifts upward and fades out.
 * @param {Element|null} originEl  — element to fly from (falls back to center-screen)
 */
export function floatStar(originEl = null) {
    const star = document.createElement('span');
    star.className = 'star-float-el';
    star.textContent = '⭐';

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    if (originEl) {
        const rect = originEl.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
    }

    star.style.left = `${x - 16}px`;
    star.style.top  = `${y - 16}px`;

    document.body.appendChild(star);
    setTimeout(() => star.remove(), 950);
}

/**
 * Spawn multiple floating stars fanning out from an element.
 * @param {Element|null} originEl
 * @param {number} count
 */
export function floatStars(originEl = null, count = 3) {
    for (let i = 0; i < count; i++) {
        setTimeout(() => floatStar(originEl), i * 120);
    }
}

/**
 * Ripple press effect on an element (adds a white circle that expands + fades).
 * @param {Element} el
 * @param {MouseEvent|TouchEvent} e
 */
export function ripplePress(el, e) {
    const circle = document.createElement('span');
    circle.className = 'ripple-circle';

    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? (rect.left + rect.width / 2);
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? (rect.top + rect.height / 2);

    circle.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${clientX - rect.left - size / 2}px;
        top:  ${clientY - rect.top  - size / 2}px;
    `;

    el.style.position = el.style.position || 'relative';
    el.appendChild(circle);
    setTimeout(() => circle.remove(), 620);
}

/**
 * Quick horizontal shake — use on wrong answer elements.
 * @param {Element} el
 */
export function shakeEl(el) {
    el.style.animation = 'shake 400ms ease';
    setTimeout(() => { el.style.animation = ''; }, 420);
}

/**
 * Quick pop bounce — use on correct answer elements.
 * @param {Element} el
 */
export function bounceEl(el) {
    el.style.animation = 'jelly 400ms ease';
    setTimeout(() => { el.style.animation = ''; }, 420);
}
