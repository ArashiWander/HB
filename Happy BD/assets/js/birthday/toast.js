let container;
let messagesConfig;

export function initToasts(messages = {}) {
  messagesConfig = messages;
  container = document.getElementById('toast-container');
}

export function showToast(messageKey, variant = 'info') {
  if (!container) return;
  const text = messagesConfig?.[messageKey] || messageKey;
  const toast = document.createElement('div');
  toast.className = `toast toast-${variant}`;
  toast.textContent = text;
  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.add('enter');
  });
  setTimeout(() => {
    toast.classList.remove('enter');
    toast.classList.add('exit');
    setTimeout(() => toast.remove(), 500);
  }, 3200);
}
