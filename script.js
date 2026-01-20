// Particle network background inspired by the provided animation
(() => {
  const canvas = document.getElementById('background-canvas');
  const ctx = canvas.getContext('2d');

  const config = {
    particleCount: 80,
    maxVelocity: 0.4,
    lineDistance: 150,
    baseAlpha: 0.8,
    lineColor: 'rgba(233, 244, 255, ALPHA)',
  };

  let particles = [];
  let width = window.innerWidth;
  let height = window.innerHeight;
  let animationFrameId;

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  };

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = initial ? Math.random() * width : Math.random() < 0.5 ? 0 : width;
      this.y = Math.random() * height;
      const speed = config.maxVelocity * (0.4 + Math.random());
      const direction = Math.random() * Math.PI * 2;
      this.vx = Math.cos(direction) * speed;
      this.vy = Math.sin(direction) * speed;
      this.radius = 1 + Math.random() * 1.4;
    }

    update(delta) {
      this.x += this.vx * delta;
      this.y += this.vy * delta;

      if (this.x < -50 || this.x > width + 50 || this.y < -50 || this.y > height + 50) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(230, 243, 255, 0.9)';
      ctx.fill();
    }
  }

  const connectParticles = () => {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distSq = dx * dx + dy * dy;
        const maxDistSq = config.lineDistance * config.lineDistance;

        if (distSq < maxDistSq) {
          const alpha =
            config.baseAlpha *
            (1 - Math.sqrt(distSq) / config.lineDistance) *
            0.6;

          ctx.strokeStyle = config.lineColor.replace('ALPHA', alpha.toFixed(3));
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
  };

  const initParticles = () => {
    particles = [];
    const targetCount = Math.min(config.particleCount, (width * height) / 15000);
    for (let i = 0; i < targetCount; i++) {
      particles.push(new Particle());
    }
  };

  let lastTime = performance.now();

  const loop = (time) => {
    const delta = (time - lastTime) * 0.06;
    lastTime = time;

    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      p.update(delta);
      p.draw();
    }

    connectParticles();
    animationFrameId = requestAnimationFrame(loop);
  };

  resize();
  initParticles();
  animationFrameId = requestAnimationFrame(loop);

  window.addEventListener('resize', () => {
    resize();
    initParticles();
  });

  window.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrameId);
    } else {
      lastTime = performance.now();
      animationFrameId = requestAnimationFrame(loop);
    }
  });
})();

// Smooth scroll enhancement for in-page links
(() => {
  const navLinks = document.querySelectorAll('.nav-list a[href^="#"]');

  const smoothScroll = (targetId) => {
    const target = document.querySelector(targetId);
    if (!target) return;

    const headerOffset = 72;
    const rect = target.getBoundingClientRect();
    const offsetTop = rect.top + window.scrollY - headerOffset;

    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth',
    });
  };

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      event.preventDefault();
      smoothScroll(href);

      document.querySelector('.site-nav')?.classList.remove('open');
    });
  });
})();

// IntersectionObserver for reveal-on-scroll animations
(() => {
  const revealElements = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || !revealElements.length) {
    revealElements.forEach((el) => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: '0px 0px -5% 0px',
    }
  );

  revealElements.forEach((el) => observer.observe(el));
})();

// Mobile nav toggle
(() => {
  const nav = document.querySelector('.site-nav');
  const toggle = document.querySelector('.nav-toggle');

  if (!nav || !toggle) return;

  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
})();

// Footer year
(() => {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear().toString();
  }
})();

// Projects slider
(() => {
  const slider = document.querySelector('.project-slider');
  if (!slider) return;

  const track = slider.querySelector('.project-track');
  const slides = Array.from(slider.querySelectorAll('.project-slide'));
  const prevBtn = slider.querySelector('.project-nav-prev');
  const nextBtn = slider.querySelector('.project-nav-next');
  const dotsContainer = slider.querySelector('.project-dots');

  if (!track || !slides.length || !prevBtn || !nextBtn || !dotsContainer) return;

  let index = 0;
  const stepPercent = 50; // show 2 cards per view on desktop

  const goTo = (i) => {
    const clamped = ((i % slides.length) + slides.length) % slides.length;
    index = clamped;
    track.style.transform = `translateX(-${clamped * stepPercent}%)`;

    dotsContainer.querySelectorAll('.project-dot').forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === clamped);
    });
  };

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'project-dot' + (i === 0 ? ' is-active' : '');
    dot.setAttribute('aria-label', `Show project ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  prevBtn.addEventListener('click', () => goTo(index - 1));
  nextBtn.addEventListener('click', () => goTo(index + 1));

  // Autoplay
  let autoplayId = null;
  const startAutoplay = () => {
    if (autoplayId) return;
    autoplayId = setInterval(() => {
      goTo(index + 1);
    }, 2000);
  };

  const stopAutoplay = () => {
    if (!autoplayId) return;
    clearInterval(autoplayId);
    autoplayId = null;
  };

  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', startAutoplay);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  // Basic keyboard support when slider is focused
  slider.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(index - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(index + 1);
    }
  });

  // Initialize
  goTo(0);
  startAutoplay();
})();
