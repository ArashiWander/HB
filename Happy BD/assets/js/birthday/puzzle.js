import { showToast } from './toast.js';

function createOptions(select, options, current) {
  select.innerHTML = '';
  options.forEach((size) => {
    const option = document.createElement('option');
    option.value = String(size);
    option.textContent = `${size} × ${size}`;
    if (size === current) option.selected = true;
    select.appendChild(option);
  });
}

class PuzzleGame {
  constructor(config, { gallery, fireworks }) {
    this.config = config;
    this.gallery = gallery;
    this.fireworks = fireworks;
    this.size = config.puzzle?.defaultSize || 3;
    this.stage = document.getElementById('bd-puzzle-stage');
    this.movesEl = document.getElementById('bd-puzzle-moves');
    this.timeEl = document.getElementById('bd-puzzle-time');
    this.selectEl = document.getElementById('bd-puzzle-size');
    this.revealBtn = document.getElementById('bd-puzzle-reveal');
    this.shuffleBtn = document.getElementById('bd-puzzle-shuffle');
    this.ghostBtn = document.getElementById('bd-puzzle-ghost');
    this.imageUrl = config.data?.puzzleImg;
    this.tiles = [];
    this.emptyIndex = -1;
    this.moves = 0;
    this.startTime = 0;
    this.timer = 0;
    this.isSolved = false;
  }

  init() {
    if (!this.stage) return;
    createOptions(this.selectEl, this.config.puzzle?.sizeOptions || [3, 4], this.size);
    this.bindControls();
    this.build();
    this.shuffle(true);
  }

  bindControls() {
    this.shuffleBtn?.addEventListener('click', () => {
      this.build();
      this.shuffle(true);
    });
    this.revealBtn?.addEventListener('click', () => {
      if (this.gallery) {
        this.gallery.openImage(this.imageUrl, this.config.messages?.puzzleOriginal || '拼图原图');
      }
    });
    this.selectEl?.addEventListener('change', (event) => {
      this.size = Number(event.target.value);
      this.build();
      this.shuffle(true);
    });
    this.ghostBtn?.addEventListener('click', () => {
      this.stage.classList.toggle('ghost');
      const enabled = this.stage.classList.contains('ghost');
      this.stage.style.backgroundImage = enabled ? `url(${this.imageUrl})` : 'none';
      this.ghostBtn.textContent = enabled ? '隐藏底图' : '显示底图';
    });
  }

  build() {
    this.stage.innerHTML = '';
    this.tiles = [];
    const total = this.size * this.size;
    this.stage.style.setProperty('--n', String(this.size));
    if (this.stage.classList.contains('ghost')) {
      this.stage.style.backgroundImage = `url(${this.imageUrl})`;
      this.stage.style.backgroundSize = '100% 100%';
    }
    for (let i = 0; i < total - 1; i += 1) {
      const tile = document.createElement('button');
      tile.className = 'tile';
      tile.type = 'button';
      tile.dataset.index = String(i);
      tile.style.width = `${100 / this.size}%`;
      tile.style.height = `${100 / this.size}%`;
      tile.style.backgroundImage = `url(${this.imageUrl})`;
      tile.style.backgroundSize = `${this.size * 100}% ${this.size * 100}%`;
      const x = i % this.size;
      const y = Math.floor(i / this.size);
      tile.style.backgroundPosition = `${(-x * 100) / (this.size - 1)}% ${(-y * 100) / (this.size - 1)}%`;
      tile.addEventListener('click', () => this.move(i));
      this.stage.appendChild(tile);
      this.tiles.push(tile);
    }
    this.emptyIndex = total - 1;
    this.moves = 0;
    this.updateStats();
  }

  position(index) {
    const x = index % this.size;
    const y = Math.floor(index / this.size);
    return { x, y };
  }

  index(x, y) {
    return y * this.size + x;
  }

  shuffle(start = false) {
    const total = this.size * this.size;
    const sequence = [...Array(total).keys()];
    const shuffleArray = (arr) => {
      for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    };
    shuffleArray(sequence);
    const emptyPos = sequence.indexOf(total - 1);
    [sequence[emptyPos], sequence[total - 1]] = [sequence[total - 1], sequence[emptyPos]];
    if (!this.isSolvable(sequence)) {
      [sequence[0], sequence[1]] = [sequence[1], sequence[0]];
    }
    sequence.forEach((value, index) => {
      if (value === total - 1) {
        this.emptyIndex = index;
        return;
      }
      const tile = this.tiles.find((t) => Number(t.dataset.index) === value);
      if (tile) {
        const { x, y } = this.position(index);
        tile.style.transform = `translate(${x * 100}%, ${y * 100}%)`;
        tile.dataset.position = String(index);
      }
    });
    this.moves = 0;
    this.isSolved = false;
    this.updateStats();
    if (start) {
      this.startTime = performance.now();
      clearInterval(this.timer);
      this.timer = window.setInterval(() => this.updateStats(), 500);
    }
  }

  isSolvable(sequence) {
    const total = this.size * this.size;
    const emptyRowFromBottom = this.size - Math.floor(sequence.indexOf(total - 1) / this.size);
    let inversions = 0;
    for (let i = 0; i < total - 1; i += 1) {
      for (let j = i + 1; j < total - 1; j += 1) {
        if (sequence[i] > sequence[j]) inversions += 1;
      }
    }
    if (this.size % 2 === 1) return inversions % 2 === 0;
    return (emptyRowFromBottom % 2 === 0) === (inversions % 2 === 1);
  }

  canMove(index) {
    const target = this.position(index);
    const empty = this.position(this.emptyIndex);
    return (
      (target.x === empty.x && Math.abs(target.y - empty.y) === 1) ||
      (target.y === empty.y && Math.abs(target.x - empty.x) === 1)
    );
  }

  move(index) {
    if (!this.canMove(index)) return;
    const tile = this.tiles.find((t) => Number(t.dataset.position ?? t.dataset.index) === index);
    if (!tile) return;
    const empty = this.position(this.emptyIndex);
    tile.style.transform = `translate(${empty.x * 100}%, ${empty.y * 100}%)`;
    tile.dataset.position = String(this.emptyIndex);
    this.emptyIndex = index;
    this.moves += 1;
    this.updateStats();
    this.checkSolved();
  }

  updateStats() {
    if (this.timeEl) {
      const seconds = Math.floor((performance.now() - this.startTime) / 1000);
      const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
      const secs = String(seconds % 60).padStart(2, '0');
      this.timeEl.textContent = `${minutes}:${secs}`;
    }
    if (this.movesEl) this.movesEl.textContent = String(this.moves);
  }

  checkSolved() {
    const total = this.size * this.size;
    const solved = this.tiles.every((tile) => {
      const pos = Number(tile.dataset.position ?? tile.dataset.index);
      return Number(tile.dataset.index) === pos;
    });
    if (solved && this.emptyIndex === total - 1 && !this.isSolved) {
      this.isSolved = true;
      clearInterval(this.timer);
      document.dispatchEvent(new CustomEvent('bd:puzzle:solved'));
      showToast('unlockSuccess', 'success');
      this.fireworks?.celebrate();
    }
  }
}

export function initPuzzle(config, context = {}) {
  const puzzle = new PuzzleGame(config, context);
  puzzle.init();
  return puzzle;
}
