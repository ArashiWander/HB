import { showToast } from './toast.js';

export function initAudio(config) {
  const audio = document.getElementById('bd-audio');
  if (!audio) return;
  const navInner = document.querySelector('.nav-inner');
  const bgm = config.data?.bgm;
  if (bgm && navInner) {
    audio.src = bgm;
    audio.loop = true;
    const button = document.createElement('button');
    button.className = 'pill';
    button.type = 'button';
    button.textContent = '🔇';
    let playing = false;
    button.addEventListener('click', async () => {
      try {
        if (playing) {
          audio.pause();
          button.textContent = '🔇';
        } else {
          await audio.play();
          button.textContent = '🎵';
        }
        playing = !playing;
      } catch (error) {
        showToast('autoplayBlocked', 'info');
      }
    });
    navInner.appendChild(button);
  }

  document.addEventListener('bd:puzzle:solved', () => {
    const surprise = config.data?.surpriseAudio;
    if (!surprise) return;
    audio.src = surprise;
    audio.loop = false;
    audio.play().catch(() => {
      showToast('autoplayBlocked', 'info');
    });
  });
}
