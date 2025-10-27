import { isMotionDisabled, subscribeToMotionChange } from './utils.js';

class FireworksManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas?.getContext('2d');
    this.particles = [];
    this.rafId = null;
    this.running = false;
    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize, { passive: true });
    this.resize();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  start() {
    if (this.running || isMotionDisabled()) return;
    this.running = true;
    const loop = () => {
      this.update();
      this.rafId = requestAnimationFrame(loop);
    };
    loop();
  }

  stop() {
    if (!this.running) return;
    cancelAnimationFrame(this.rafId);
    this.running = false;
    this.clear();
  }

  clear() {
    this.particles = [];
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  burst(x, y, colors = ['#ff99cc', '#ffe066', '#74c0fc']) {
    if (!this.ctx || isMotionDisabled()) return;
    const count = 70;
    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 60 + Math.random() * 40,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    this.start();
  }

  celebrate() {
    const { width, height } = this.canvas;
    this.burst(width * 0.3, height * 0.4);
    this.burst(width * 0.5, height * 0.3, ['#da77f2', '#ff8787']);
    this.burst(width * 0.7, height * 0.45, ['#63e6be', '#339af0']);
  }

  update() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const { width, height } = this.canvas;
    ctx.clearRect(0, 0, width, height);
    this.particles = this.particles.filter((p) => p.life > 0);
    this.particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.04;
      particle.life -= 1;
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = Math.max(particle.life / 80, 0);
      ctx.fillRect(particle.x, particle.y, 2, 2);
    });
    ctx.globalAlpha = 1;
    if (!this.particles.length) {
      this.stop();
    }
  }
}

export function initFireworks(config) {
  const canvas = document.getElementById('bd-fireworks');
  const manager = new FireworksManager(canvas);

  const handleMotion = (disabled) => {
    if (disabled) manager.stop();
  };

  subscribeToMotionChange(handleMotion);
  if (isMotionDisabled()) handleMotion(true);

  document.addEventListener('bd:puzzle:solved', () => {
    manager.celebrate();
  });

  return manager;
}
