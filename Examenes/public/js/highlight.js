document.addEventListener('DOMContentLoaded', () => {
  const COLORS = [
    { key: 'yellow', label: 'amarillo' },
    { key: 'green', label: 'verde' },
    { key: 'pink', label: 'rosa' },
  ];

  let toolbar = null;

  function createToolbar() {
    toolbar = document.createElement('div');
    toolbar.className = 'highlight-toolbar hidden';

    const underlineBtn = document.createElement('button');
    underlineBtn.type = 'button';
    underlineBtn.title = 'Subrayar';
    underlineBtn.textContent = 'Subrayar';
    underlineBtn.addEventListener('mousedown', (e) => e.preventDefault());
    underlineBtn.addEventListener('click', () => applyMark('user-underline'));
    toolbar.appendChild(underlineBtn);

    COLORS.forEach((c) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.title = `Resaltar en ${c.label}`;
      btn.innerHTML = `<span class="swatch swatch-${c.key}"></span>`;
      btn.addEventListener('mousedown', (e) => e.preventDefault());
      btn.addEventListener('click', () => applyMark('user-highlight', c.key));
      toolbar.appendChild(btn);
    });

    document.body.appendChild(toolbar);
  }

  function hideToolbar() {
    if (toolbar) toolbar.classList.add('hidden');
  }

  function showToolbarAt(rect) {
    if (!toolbar) createToolbar();
    toolbar.classList.remove('hidden');
    const top = rect.top - toolbar.offsetHeight - 8;
    const left = rect.left + rect.width / 2 - toolbar.offsetWidth / 2;
    toolbar.style.top = `${Math.max(8, top)}px`;
    toolbar.style.left = `${Math.max(8, Math.min(left, window.innerWidth - toolbar.offsetWidth - 8))}px`;
  }

  function getSelectionInZone() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    const node = range.commonAncestorContainer;
    const el = node.nodeType === 1 ? node : node.parentElement;
    const zone = el ? el.closest('.highlight-zone') : null;
    if (!zone) return null;
    return { sel, range };
  }

  function applyMark(className, colorKey) {
    const info = getSelectionInZone();
    if (!info) return;
    const { sel, range } = info;

    const span = document.createElement('span');
    span.className = colorKey ? `${className} ${colorKey}` : className;

    try {
      range.surroundContents(span);
    } catch (err) {
      const frag = range.extractContents();
      span.appendChild(frag);
      range.insertNode(span);
    }

    sel.removeAllRanges();
    hideToolbar();
  }

  function unwrapMark(mark) {
    const parent = mark.parentNode;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
    parent.normalize();
  }

  document.addEventListener('mouseup', () => {
    const info = getSelectionInZone();
    if (!info) {
      hideToolbar();
      return;
    }
    const rect = info.range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      hideToolbar();
      return;
    }
    showToolbarAt(rect);
  });

  document.addEventListener('mousedown', (e) => {
    if (toolbar && !toolbar.contains(e.target)) hideToolbar();
  });

  document.addEventListener('click', (e) => {
    const mark = e.target.closest('.user-highlight, .user-underline');
    if (!mark) return;
    if (window.getSelection().toString()) return;
    unwrapMark(mark);
  });

  document.querySelectorAll('.clear-highlights-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const zoneRoot = document.getElementById(btn.dataset.target);
      if (!zoneRoot) return;
      zoneRoot.querySelectorAll('.user-highlight, .user-underline').forEach(unwrapMark);
    });
  });
});
