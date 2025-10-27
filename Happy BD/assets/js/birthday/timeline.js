export function initTimeline(config) {
  const lane = document.getElementById('bd-timeline-lane');
  if (!lane) return;
  lane.innerHTML = '';
  (config.data?.timeline || []).forEach((item) => {
    const card = document.createElement('div');
    card.className = 'tcard';
    const face = document.createElement('div');
    face.className = 'face';
    face.tabIndex = 0;
    face.setAttribute('role', 'button');
    face.setAttribute('aria-pressed', 'false');

    const front = document.createElement('div');
    front.className = 'front';
    front.innerHTML = `<h3>${item.when || ''}</h3><p>${item.front || ''}</p>`;

    const back = document.createElement('div');
    back.className = 'back';
    back.innerHTML = `<h3>${item.when || ''}</h3><p>${item.back || ''}</p>`;

    const toggle = () => {
      const isFlipped = face.classList.toggle('flip');
      face.setAttribute('aria-pressed', isFlipped ? 'true' : 'false');
    };

    face.addEventListener('click', toggle);
    face.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle();
      }
    });

    face.append(front, back);
    card.appendChild(face);
    lane.appendChild(card);
  });
}
