import { isMotionDisabled, subscribeToMotionChange } from './utils.js';

class BalloonManager {
  constructor(root, fireworks, config) {
    this.root = root;
    this.fireworks = fireworks;
    this.config = config.effects?.balloons || {};
    this.interval = null;
  }

  start() {
    if (!this.root || isMotionDisabled() || !this.config.enabled) return;
    if (this.interval) return;
    this.spawn();
    const density = this.config.densityPerMinute || 10;
    const delay = Math.max(4000, (60_000 / density) | 0);
    this.interval = window.setInterval(() => this.spawn(), delay);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  spawn() {
    const balloon = document.createElement('div');
    balloon.className = 'balloon';
    const group = document.createElement('div');
    group.className = 'g';
    const body = document.createElement('div');
    body.className = 'b';
    const stem = document.createElement('span');
    stem.className = 'k';
    const label = document.createElement('small');
    const texts = this.config.texts?.length ? this.config.texts : ['生日快乐', '愿你快乐'];
    label.textContent = texts[Math.floor(Math.random() * texts.length)];

    const colors = this.config.colors || [
      ['#ff6b9d', '#c9184a'],
      ['#74c0fc', '#1c7ed6'],
    ];
    const palette = colors[Math.floor(Math.random() * colors.length)];
    balloon.style.setProperty('--balloon-color', palette[0]);
    balloon.style.setProperty('--balloon-dark', palette[1]);

    if (this.config.shape === 'heart') {
      balloon.classList.add('heart');
    } else if (this.config.shape === 'mix' && Math.random() > 0.5) {
      balloon.classList.add('heart');
    }

    const width = this.root.clientWidth || window.innerWidth;
    balloon.style.left = `${Math.random() * width}px`;
    const duration = (this.config.speedSecRange?.[0] || 8) + Math.random() * ((this.config.speedSecRange?.[1] || 12) - (this.config.speedSecRange?.[0] || 8));
    balloon.style.animationDuration = `${duration}s`;

    group.append(body, stem);
    balloon.append(group, label);
    this.root.appendChild(balloon);

    balloon.addEventListener('animationend', () => {
      balloon.remove();
    });

    balloon.addEventListener('click', () => {
      const rect = balloon.getBoundingClientRect();
      this.fireworks?.burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
      balloon.remove();
    });
  }
}

export function initBalloons(config, fireworks) {
  const root = document.getElementById('bd-balloons');
  const manager = new BalloonManager(root, fireworks, config);
  const update = (disabled) => {
    if (disabled) {
      manager.stop();
      root.innerHTML = '';
    } else {
      manager.start();
    }
  };
  subscribeToMotionChange(update);
  update(isMotionDisabled());
  return manager;
}
