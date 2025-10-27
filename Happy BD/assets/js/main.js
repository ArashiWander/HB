import { CONFIG } from './birthday/config.js';
import {
  applyTheme,
  bindText,
  isMotionDisabled,
  subscribeToMotionChange,
} from './birthday/utils.js';
import { initHero } from './birthday/hero.js';
import { initGallery } from './birthday/gallery.js';
import { initTimeline } from './birthday/timeline.js';
import { initPuzzle } from './birthday/puzzle.js';
import { initFireworks } from './birthday/fireworks.js';
import { initBalloons } from './birthday/balloons.js';
import { initAudio } from './birthday/audio.js';
import { initToasts } from './birthday/toast.js';

document.addEventListener('DOMContentLoaded', () => {
  applyTheme(document.querySelector('.bd-root'));
  initToasts(CONFIG.messages);

  bindText('#bd-brand', 'site.brand');
  bindText('#bd-nav-photos', 'nav.photos');
  bindText('#bd-nav-timeline', 'nav.timeline');
  bindText('#bd-nav-puzzle', 'nav.puzzle');
  bindText('#bd-photos-title', 'sections.photos.title');
  bindText('#bd-photos-sub', 'sections.photos.sub');
  bindText('#bd-timeline-title', 'sections.timeline.title');
  bindText('#bd-timeline-tip', 'sections.timeline.tip');
  bindText('#bd-puzzle-title', 'sections.puzzle.title');
  bindText('#bd-puzzle-tip', 'sections.puzzle.tip');
  bindText('#bd-puzzle-shuffle', 'sections.puzzle.shuffle');
  bindText('#bd-puzzle-reveal', 'sections.puzzle.reveal');

  const footer = document.getElementById('bd-footer-text');
  if (footer) {
    footer.innerHTML = (CONFIG.sections.footer || '').replace('{year}', new Date().getFullYear());
  }

  const heroApi = initHero(CONFIG);
  const galleryApi = initGallery(CONFIG);
  initTimeline(CONFIG);
  const fireworksApi = initFireworks(CONFIG);
  initBalloons(CONFIG, fireworksApi);
  initPuzzle(CONFIG, { gallery: galleryApi, fireworks: fireworksApi });
  initAudio(CONFIG);

  subscribeToMotionChange((value) => {
    document.documentElement.classList.toggle('prefers-reduced-motion', value);
  });
  if (isMotionDisabled()) {
    document.documentElement.classList.add('prefers-reduced-motion');
  }
});
