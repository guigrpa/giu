// ==========================================
// Miscellaneous
// ==========================================
const COLORS = {
  dim: '#999',
  line: '#ccc',
};

const KEYS = {
  esc: 27,
  return: 13,
};

// ==========================================
// Scrollbar width
// ==========================================
let scrollbarWidth = null;
function updateScrollbarWidth() {
  const scrollDiv = document.createElement('div');
  scrollDiv.className = 'scrollbarMeasure';
  scrollDiv.style.position = 'fixed';
  scrollDiv.style.top = '0px';
  scrollDiv.style.left = '0px';
  scrollDiv.style.width = '100px';
  scrollDiv.style.height = '100px';
  scrollDiv.style.overflow = 'scroll';
  scrollDiv.style.opacity = '0.001';
  document.body.appendChild(scrollDiv);
  scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
  document.body.removeChild(scrollDiv);
}
function getScrollbarWidth() {
  if (scrollbarWidth == null) updateScrollbarWidth();
  return scrollbarWidth;
}

try {
  window.addEventListener('resize', updateScrollbarWidth);
} catch (err) { /* ignore */ }

// ==========================================
// Public API
// ==========================================
export {
  COLORS, KEYS,
  getScrollbarWidth,
};
