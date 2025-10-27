import { loadImage, sanitize } from './utils.js';
import { showToast } from './toast.js';

function buildTags(photos) {
  const tags = new Set(['all']);
  photos.forEach((photo) => {
    if (photo.tag) tags.add(photo.tag);
  });
  return [...tags];
}

function createPhotoFigure(photo) {
  const figure = document.createElement('figure');
  figure.className = 'photo';
  figure.dataset.tag = photo.tag || 'all';

  const img = document.createElement('img');
  img.alt = `${photo.place || ''} ${photo.time || ''}`.trim() || '相册照片';
  img.decoding = 'async';
  img.loading = 'lazy';
  img.dataset.src = photo.src;
  loadImage(img);

  const caption = document.createElement('figcaption');
  caption.innerHTML = `${sanitize.html(photo.place || '')} · ${sanitize.html(
    photo.time || '',
  )}<br>${sanitize.html(photo.say || '')}`;

  figure.append(img, caption);
  figure.addEventListener('click', () => {
    openLightbox(photo.src, `${photo.place || ''} ${photo.time || ''}`, photo.say);
  });
  return figure;
}

let lightbox;
let lightboxImage;
let lightboxCaption;
let closeButton;

function setupLightbox() {
  lightbox = document.getElementById('bd-lightbox');
  lightboxImage = document.getElementById('bd-lightbox-image');
  lightboxCaption = document.getElementById('bd-lightbox-caption');
  closeButton = document.getElementById('bd-lightbox-close');
  if (!lightbox || !closeButton) return;
  closeButton.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !lightbox.hasAttribute('hidden')) {
      closeLightbox();
    }
  });
}

function openLightbox(src, title, description) {
  if (!lightbox) setupLightbox();
  if (!lightbox || !lightboxImage || !lightboxCaption) return;
  lightboxImage.src = src;
  lightboxImage.alt = title || '';
  lightboxCaption.textContent = description || '';
  lightbox.removeAttribute('hidden');
  lightbox.classList.add('open');
  closeButton?.focus();
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  lightbox.setAttribute('hidden', '');
}

export function initGallery(config) {
  const galleryEl = document.getElementById('bd-gallery');
  const tagsEl = document.getElementById('bd-photo-tags');
  if (!galleryEl || !tagsEl) return { openImage: () => {} };

  const state = {
    photos: [...(config.data?.photos || [])],
    unlocked: false,
    activeTag: 'all',
  };

  const renderPhotos = () => {
    galleryEl.innerHTML = '';
    const filtered = state.photos.filter(
      (photo) => state.activeTag === 'all' || photo.tag === state.activeTag,
    );
    filtered.forEach((photo) => {
      galleryEl.appendChild(createPhotoFigure(photo));
    });
    galleryEl.dataset.state = 'ready';
  };

  const renderTags = () => {
    tagsEl.innerHTML = '';
    buildTags(state.photos).forEach((tag) => {
      const button = document.createElement('button');
      button.className = 'tag';
      button.type = 'button';
      button.textContent = tag === 'all' ? '全部' : tag;
      button.setAttribute('aria-pressed', tag === state.activeTag ? 'true' : 'false');
      button.addEventListener('click', () => {
        state.activeTag = tag;
        tagsEl.querySelectorAll('.tag').forEach((el) => el.setAttribute('aria-pressed', 'false'));
        button.setAttribute('aria-pressed', 'true');
        renderPhotos();
      });
      tagsEl.appendChild(button);
    });
  };

  renderTags();
  renderPhotos();

  document.addEventListener('bd:secret:success', () => {
    if (state.unlocked) return;
    state.unlocked = true;
    showToast('unlockSuccess', 'success');
  });

  setupLightbox();

  return {
    openImage: (src, caption) => openLightbox(src, caption, caption),
  };
}
