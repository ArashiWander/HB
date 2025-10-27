import { CONFIG } from './config.js';

class DOMCache {
  constructor() {
    this.cache = new Map();
  }

  get(selector) {
    if (!this.cache.has(selector)) {
      this.cache.set(selector, document.querySelector(selector));
    }
    return this.cache.get(selector);
  }

  all(selector) {
    return document.querySelectorAll(selector);
  }

  clear() {
    this.cache.clear();
  }
}

export const dom = new DOMCache();
export const $ = (selector) => dom.get(selector);
export const $$ = (selector) => dom.all(selector);

export const rand = (n) => Math.floor(Math.random() * n);
export const randRange = (min, max) => min + Math.random() * (max - min);

export const debounce = (fn, delay = 150) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const throttle = (fn, limit = 100) => {
  let inThrottle = false;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

export const storage = {
  get(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
};

export const downloadBlob = (blob, filename) => {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const sanitize = {
  text(str) {
    return String(str ?? '').slice(0, 500);
  },
  html(str) {
    return sanitize
      .text(str)
      .replace(/[<>'"&]/g, (c) => ({
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
        '&': '&amp;',
      })[c]);
  },
};

export function unsplash(baseUrl, width) {
  try {
    const url = new URL(baseUrl);
    url.searchParams.set('w', width);
    url.searchParams.set('auto', 'format');
    url.searchParams.set('fit', 'crop');
    url.searchParams.set('q', '80');
    return url.toString();
  } catch {
    return baseUrl;
  }
}

export function orbitsSince(isoDate = '2001-06-18') {
  const birth = new Date(isoDate);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  const hadBirthday =
    now.getMonth() > birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
  return hadBirthday ? years : years - 1;
}

export const perf = {
  start: performance.now(),
  mark(name) {
    const elapsed = performance.now() - perf.start;
    console.log(`⏱️ ${name}: ${elapsed.toFixed(2)}ms`);
  },
};

export function scaleCanvas(canvas, ctx) {
  const rect = canvas.getBoundingClientRect();
  const cssWidth = rect.width || window.innerWidth || 1;
  const cssHeight = rect.height || window.innerHeight || 1;
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  ctx.scale(dpr, dpr);
}

const matchMediaFn = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia.bind(window) : null;
const prefersReducedMotionQuery = matchMediaFn ? matchMediaFn('(prefers-reduced-motion: reduce)') : null;

export const motionState = {
  value: prefersReducedMotionQuery ? prefersReducedMotionQuery.matches : false,
};

export function subscribeToMotionChange(handler) {
  if (!prefersReducedMotionQuery) return () => {};
  const listener = (event) => {
    motionState.value = event.matches;
    handler(event.matches);
  };
  if (prefersReducedMotionQuery.addEventListener) {
    prefersReducedMotionQuery.addEventListener('change', listener);
    return () => prefersReducedMotionQuery.removeEventListener('change', listener);
  }
  prefersReducedMotionQuery.addListener(listener);
  return () => prefersReducedMotionQuery.removeListener(listener);
}

export function isMotionDisabled() {
  return motionState.value;
}

export function applyTheme(rootEl = document.querySelector('.bd-root')) {
  if (!rootEl) return;
  const theme = CONFIG.ui?.theme || 'default';
  if (theme && theme !== 'default') {
    rootEl.dataset.theme = theme;
  }
}

export function bindText(selector, keyPath, { html = false } = {}) {
  const target = document.querySelector(selector);
  if (!target) return;
  const value = keyPath.split('.').reduce((acc, key) => acc?.[key], CONFIG);
  if (value == null) return;
  if (html) {
    target.innerHTML = value;
  } else {
    target.textContent = value;
  }
}

export const lazyObserver =
  'IntersectionObserver' in window
    ? new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            observer.unobserve(img);
          }
        });
      }, { rootMargin: '50px' })
    : null;

export function loadImage(img) {
  if (!lazyObserver) {
    if (img.dataset.src) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    }
    return;
  }
  lazyObserver.observe(img);
}
