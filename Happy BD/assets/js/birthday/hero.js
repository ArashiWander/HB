import {
  orbitsSince,
  isMotionDisabled,
  subscribeToMotionChange,
} from './utils.js';
import { showToast } from './toast.js';

function replaceOrbitPlaceholders(line, config) {
  return line.replace(/N/g, String(orbitsSince(config.data?.orbitBase || '2001-06-18')));
}

function createTypewriter(lines, target) {
  if (!target) return { start: () => {}, stop: () => {} };
  let index = 0;
  let timeoutId;
  let running = false;

  const renderLine = () => {
    const line = lines[index % lines.length];
    const chars = [...line];
    let i = 0;
    const step = () => {
      if (!running) return;
      target.textContent = chars.slice(0, i).join('');
      i += 1;
      if (i <= chars.length) {
        timeoutId = setTimeout(step, 90);
      } else {
        timeoutId = setTimeout(() => {
          index += 1;
          renderLine();
        }, 2200);
      }
    };
    step();
  };

  const start = () => {
    if (!lines.length) return;
    stop();
    if (isMotionDisabled()) {
      target.textContent = lines[0];
      return;
    }
    running = true;
    renderLine();
  };

  const stop = () => {
    running = false;
    clearTimeout(timeoutId);
  };

  start();
  return { start, stop };
}

function createStarfield(canvas) {
  if (!canvas) return { start: () => {}, stop: () => {} };
  const ctx = canvas.getContext('2d');
  const stars = Array.from({ length: 120 }, () => ({
    x: Math.random(),
    y: Math.random(),
    speed: 0.05 + Math.random() * 0.15,
    size: Math.random() * 1.2 + 0.3,
  }));
  let rafId = null;

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();

  const tick = () => {
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#0b1420';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    stars.forEach((star) => {
      star.y += star.speed * 0.002 * height;
      if (star.y > 1) {
        star.y = 0;
        star.x = Math.random();
      }
      const x = star.x * width;
      const y = star.y * height;
      ctx.globalAlpha = 0.5 + Math.random() * 0.5;
      ctx.beginPath();
      ctx.arc(x, y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    rafId = requestAnimationFrame(tick);
  };

  const start = () => {
    if (rafId || isMotionDisabled()) return;
    window.addEventListener('resize', resize, { passive: true });
    rafId = requestAnimationFrame(tick);
  };

  const stop = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    window.removeEventListener('resize', resize);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  start();

  return { start, stop };

function handleSecret(config) {
  const form = document.getElementById('bd-secret-form');
  const input = document.getElementById('bd-secret-input');
  const submit = document.getElementById('bd-secret-submit');
  if (!form || !input || !submit) return;
  input.placeholder = config.hero.keyPlaceholder;
  submit.textContent = config.hero.unlock;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) return;
    const match = (config.data?.secretKeys || []).some(
      (key) => key.toLowerCase() === value.toLowerCase(),
    );
    if (match) {
      document.dispatchEvent(new CustomEvent('bd:secret:success'));
      showToast('unlockSuccess', 'success');
      input.value = '';
    } else {
      showToast('unlockFail', 'error');
    }
  });
}

function setupScrollButton(config) {
  const button = document.getElementById('bd-hero-scroll');
  if (!button) return;
  button.textContent = config.hero.go;
  button.addEventListener('click', () => {
    const target = document.getElementById('bd-photos');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

export function initHero(config) {
  const heroTitle = document.getElementById('bd-hero-title');
  if (heroTitle) {
    heroTitle.innerHTML = config.hero.titleHTML;
  }

  const typewriterTarget = document.getElementById('bd-hero-typing');
  const lines = (config.hero.lines || []).map((line) => replaceOrbitPlaceholders(line, config));
  const typewriter = createTypewriter(lines, typewriterTarget);

  const canvas = document.getElementById('bd-starfield');
  const starfield = createStarfield(canvas);

  subscribeToMotionChange((value) => {
    if (value) {
      typewriter.stop();
      starfield.stop();
      if (typewriterTarget && lines.length) {
        typewriterTarget.textContent = lines[0];
      }
    } else {
      typewriter.start();
      starfield.start();
    }
  });

  handleSecret(config);
  setupScrollButton(config);

  return { stopTypewriter: () => typewriter.stop(), cleanupStarfield: () => starfield.stop() };

}
