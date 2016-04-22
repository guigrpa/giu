// ==========================================
// Miscellaneous
// ==========================================
const COLORS = {
  dim: '#999',
};

// ==========================================
// Scrollbar width
// ==========================================
let scrollbarWidth = null;
function getScrollbarWidth() {
  if (scrollbarWidth == null) {
    const scrollDiv = document.createElement('div');
    scrollDiv.className = 'scrollbarMeasure';
    document.body.appendChild(scrollDiv);
    scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
  }
  return scrollbarWidth;
}

try {
  window.addEventListener('resize', () => {
    scrollbarWidth = null;
    getScrollbarWidth();
  });
} catch (err) { /* ignore */ }

// ==========================================
// Public API
// ==========================================
export {
  COLORS,
  getScrollbarWidth,
};
