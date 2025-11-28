/* Rebuilt script.js
   - Defensive: creates #overlay if missing
   - Mobile nav toggle using #nav-links.active
   - Dark mode (persist)
   - Canvas particle background (safe height)
   - Ensures CV button / theme button not colliding
*/

(() => {
  'use strict';

  /* ---------- helper: safe query ---------- */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  /* ---------- ensure overlay exists ---------- */
  let overlay = $('#overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'overlay';
    document.body.insertBefore(overlay, document.body.firstChild);
  }

  /* ---------- elements ---------- */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  const themeBtn = document.querySelector('.theme-toggle');
  const cvBtn = document.querySelector('.cv-btn');

  /* ---------- NAV HANDLERS (mobile) ---------- */
  function openMobileNav() {
    if (!navLinks) return;
    navLinks.classList.add('active');
    overlay.classList.add('active');
    // prevent body scroll while nav open
    document.body.style.overflow = 'hidden';
  }
  function closeMobileNav() {
    if (!navLinks) return;
    navLinks.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      if (navLinks && navLinks.classList.contains('active')) closeMobileNav();
      else openMobileNav();
    });
  }

  // close when overlay clicked
  overlay.addEventListener('click', closeMobileNav);

  // close when any nav link clicked
  if (navLinks) {
    navLinks.addEventListener('click', (e) => {
      if (e.target && e.target.tagName === 'A') {
        closeMobileNav();
      }
    });
  }

  /* ---------- THEME (dark/light) ---------- */
  const THEME_KEY = 'theme';
  function applyTheme(name) {
    document.body.classList.remove('dark', 'light');
    if (name === 'dark') document.body.classList.add('dark');
    else if (name === 'light') document.body.classList.add('light');
    // update button text/icon
    updateThemeBtn();
  }

  function loadTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') applyTheme(saved);
    else {
      // follow system preference by default
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light');
    }
  }

  function toggleTheme() {
    const isDark = document.body.classList.contains('dark');
    const next = isDark ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  }

  function updateThemeBtn() {
    if (!themeBtn) return;
    themeBtn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
    themeBtn.setAttribute('aria-pressed', String(document.body.classList.contains('dark')));
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleTheme();
    });
  }

  // react to system changes if user didn't explicitly set
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (ev) => {
      const saved = localStorage.getItem(THEME_KEY);
      if (!saved) applyTheme(ev.matches ? 'dark' : 'light');
    });
  }

  loadTheme();

  /* ---------- CANVAS PARTICLES ---------- */
  const canvas = document.getElementById('bg-canvas');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      // limit canvas height on small devices so it doesn't cover entire page visually
      canvas.height = Math.max(window.innerHeight * 0.6, 420);
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor(w, h) {
        this.reset(w, h);
      }
      reset(w, h) {
        this.w = w; this.h = h;
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.r = Math.random() * 2 + 0.6;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.alpha = 0.2 + Math.random() * 0.45;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < -10 || this.x > this.w + 10) this.vx *= -1;
        if (this.y < -10 || this.y > this.h + 10) this.vy *= -1;
      }
      draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = document.body.classList.contains('dark') ? `rgba(74,168,255,${this.alpha})` : `rgba(20,40,80,${this.alpha})`;
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    let particles = [];
    function initParticles() {
      const w = canvas.width, h = canvas.height;
      particles = [];
      const count = Math.max(30, Math.floor((w * h) / 80000)); // scale with screen
      for (let i = 0; i < count; i++) particles.push(new Particle(w, h));
    }
    initParticles();

    let raf = null;
    function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // subtle gradient
      const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      if (document.body.classList.contains('dark')) {
        g.addColorStop(0, 'rgba(5,10,18,0.85)');
        g.addColorStop(1, 'rgba(8,14,24,0.6)');
      } else {
        g.addColorStop(0, 'rgba(250,252,255,0.85)');
        g.addColorStop(1, 'rgba(235,242,255,0.85)');
      }
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // draw grid lines (subtle)
      ctx.strokeStyle = document.body.classList.contains('dark') ? 'rgba(74,168,255,0.05)' : 'rgba(45,108,223,0.03)';
      ctx.lineWidth = 1;
      const gap = 60;
      ctx.save();
      ctx.globalAlpha = 0.9;
      for (let x = 0; x < canvas.width; x += gap) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gap) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
      ctx.restore();

      particles.forEach(p => { p.update(); p.draw(ctx); });

      raf = requestAnimationFrame(frame);
    }
    frame();

    // re-init on resize
    window.addEventListener('resize', () => {
      cancelAnimationFrame(raf);
      resize();
      initParticles();
      raf = requestAnimationFrame(frame);
    });

    // redraw when theme toggles (immediate visual update)
    new MutationObserver(() => {
      initParticles();
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  /* ---------- Accessibility / small helpers ---------- */
  // If JS disabled class is present in HTML <html class="no-js"> you might handle it; otherwise ensure nav shown
  (function ensureNavWithNoJS() {
    if (!document.documentElement.classList.contains('no-js') && !document.body.classList.contains('no-js')) return;
    // in case, show nav links
    const nav = document.getElementById('nav-links');
    if (nav) nav.style.display = 'flex';
  })();

})();
