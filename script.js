/* ===================================================================
   Increment Capital — Script
   =================================================================== */

(function () {
  'use strict';

  /* ---------- Sticky header + scroll progress ---------- */
  const header = document.getElementById('header');
  const progress = document.getElementById('scrollProgress');

  function onScroll() {
    const scrolled = window.scrollY;
    header.classList.toggle('scrolled', scrolled > 60);
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = Math.min((scrolled / h) * 100, 100) + '%';
    }
  }
  window.addEventListener('scroll', onScroll);
  onScroll();

  /* ---------- Mobile nav toggle ---------- */
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');

  toggle.addEventListener('click', function () {
    toggle.classList.toggle('active');
    nav.classList.toggle('open');
  });

  nav.querySelectorAll('.nav__link').forEach(function (link) {
    link.addEventListener('click', function () {
      toggle.classList.remove('active');
      nav.classList.remove('open');
    });
  });

  /* ---------- Scroll-reveal ---------- */
  function reveal() {
    const items = document.querySelectorAll('[data-animate]');
    for (let i = 0; i < items.length; i++) {
      const rect = items[i].getBoundingClientRect();
      if (rect.top < window.innerHeight - 80) {
        items[i].classList.add('visible');
      }
    }
  }
  window.addEventListener('scroll', reveal);
  window.addEventListener('load', reveal);

  /* ---------- Animated stat counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const counterState = new WeakMap();

  function animateCount(el) {
    if (counterState.get(el)) return;
    counterState.set(el, true);
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1400;
    const start = performance.now();

    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.floor(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }

  function checkCounters() {
    counters.forEach(function (el) {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 60 && rect.bottom > 0) {
        animateCount(el);
      }
    });
  }
  window.addEventListener('scroll', checkCounters);
  window.addEventListener('load', checkCounters);

  /* ---------- Hero particle canvas (neural-network style) ---------- */
  const canvas = document.getElementById('heroCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const particles = [];
    const mouse = { x: -9999, y: -9999 };
    const PARTICLE_COUNT = 90;
    const CONNECTION_DIST = 150;
    const MOUSE_RADIUS = 220;

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function Particle() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r = Math.random() * 1.6 + 0.6;
      this.phase = Math.random() * Math.PI * 2;
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    function animate(now) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = (now || 0) * 0.001;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // move
        p.x += p.vx;
        p.y += p.vy;

        // bounce
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // gentle pull toward mouse
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS) {
          p.vx += dx * 0.00005;
          p.vy += dy * 0.00005;
        }

        // dampen + cap
        p.vx *= 0.999;
        p.vy *= 0.999;
        p.vx = Math.max(-0.8, Math.min(0.8, p.vx));
        p.vy = Math.max(-0.8, Math.min(0.8, p.vy));

        // pulsing dot
        const pulse = 0.7 + 0.3 * Math.sin(t * 2 + p.phase);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, ' + (0.45 * pulse) + ')';
        ctx.fill();
      }

      // connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(56, 189, 248, ' + alpha + ')';
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // mouse-to-particle lines (brighter)
      if (mouse.x > 0) {
        for (let i = 0; i < particles.length; i++) {
          const dx = mouse.x - particles[i].x;
          const dy = mouse.y - particles[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_RADIUS) {
            const alpha = (1 - dist / MOUSE_RADIUS) * 0.45;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(particles[i].x, particles[i].y);
            ctx.strokeStyle = 'rgba(129, 140, 248, ' + alpha + ')';
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    /* Mouse-tracking glow */
    const glow = document.getElementById('heroGlow');
    const heroEl = document.getElementById('hero');

    heroEl.addEventListener('mousemove', function (e) {
      const rect = heroEl.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      glow.style.left = mouse.x + 'px';
      glow.style.top = mouse.y + 'px';
    });

    heroEl.addEventListener('mouseleave', function () {
      mouse.x = -9999;
      mouse.y = -9999;
    });
  }

  /* ---------- Typewriter on hero title ---------- */
  const typeLines = document.querySelectorAll('.type-line');
  if (typeLines.length) {
    typeLines.forEach(function (line, idx) {
      const full = line.textContent;
      line.textContent = '';
      line.style.opacity = '1';
      let i = 0;
      const delay = idx * (full.length * 30 + 200);

      setTimeout(function () {
        const interval = setInterval(function () {
          line.textContent = full.substring(0, i + 1);
          i++;
          if (i >= full.length) clearInterval(interval);
        }, 30);
      }, 250 + delay);
    });
  }

  /* ---------- Smooth anchor scroll ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#' || href.length < 2) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---------- Card tilt (subtle 3D on hover) ---------- */
  const cards = document.querySelectorAll('.card, .exp-card');
  cards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rx = ((y / rect.height) - 0.5) * -4;
      const ry = ((x / rect.width)  - 0.5) *  4;
      card.style.transform = 'translateY(-4px) perspective(1000px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });

})();
