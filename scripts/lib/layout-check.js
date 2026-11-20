// Layout check that runs in the app's page: UI texts that are cut off, wrap, stick out of the window
// or are covered. Shared by scripts/screenshots.js (all states, all languages) and
// scripts/store-screenshots.js (the Store motifs).
// Single-line UI texts that come from the language files. User data such as window titles may be
// shortened with an ellipsis by design and is not checked, nor is the sample-data hint in the footer
// (development only; it gives way first by design).
const CHECKED_TEXT = [
  '.wm-titlebar-title',
  '.wm-date-nav-label',
  '.wm-button-label',
  '.wm-segmented-option',
  '.wm-interval-pill-label',
  '.wm-timeline-empty',
  '.wm-timeline-event--inactive .wm-timeline-event-title',
  '.wm-tracking-status',
  '.wm-timeline-event-duration',
  '.wm-timeline-hour-label',
  '.wm-day-summary-value',
  '.wm-day-summary-label',
  '.wm-settings-title',
  '.wm-setting-row-title',
  '.wm-settings-website',
  '.wm-settings-version',
];

// Runs in the page: texts that are cut off, wrap onto a second line, stick out of the window, or
// lie under another element. Widths are compared unrounded: an ellipsis appears even when the text
// is only a fraction of a pixel too wide, which scrollWidth/clientWidth (whole pixels) miss.
function findLayoutProblems(selectors) {
  const problems = [];
  const describe = (el) => `${el.className.split(' ')[0]} "${el.textContent.trim()}"`;
  // Measured with the ellipsis switched off: an ellipsized text reports only its visible part.
  const textRects = (el) => {
    const { textOverflow } = el.style;
    el.style.textOverflow = 'clip';
    const range = document.createRange();
    range.selectNodeContents(el);
    const rects = [...range.getClientRects()].filter((r) => r.width > 0);
    el.style.textOverflow = textOverflow;
    return rects;
  };
  // Next to the sample-data hint (development only) the footer is narrower than in the real app;
  // the long-day shot checks the footer without it, the Store images hide the hint (display: none).
  const mockHint = document.querySelector('.wm-footer-mock');
  const devFooter = Boolean(mockHint) && getComputedStyle(mockHint).display !== 'none';
  const visibleArea = (el) => {
    const scroller = el.closest('.wm-timeline');
    return scroller ? scroller.getBoundingClientRect() : { top: 0, left: 0, right: innerWidth, bottom: innerHeight };
  };

  for (const el of document.querySelectorAll(selectors.join(','))) {
    const rects = textRects(el);
    const style = getComputedStyle(el);
    if (!el.textContent.trim() || !rects.length || style.visibility !== 'visible') continue;
    if (devFooter && el.closest('.wm-footer')) continue;
    const box = el.getBoundingClientRect();
    const contentWidth = box.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const textWidth = Math.max(...rects.map((r) => r.right)) - Math.min(...rects.map((r) => r.left));
    const lines = new Set(rects.map((r) => Math.round(r.bottom))).size;

    // A clipping parent cuts at its padding box; a button (fixed width, overflow: hidden) must keep
    // its padding too, or the label looks squeezed against the edge.
    let parentOverflow = 0;
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const ps = getComputedStyle(p);
      if (ps.overflowX === 'visible') continue;
      const pr = p.getBoundingClientRect();
      const keepPadding = p.classList.contains('wm-button');
      const left = pr.left + parseFloat(ps.borderLeftWidth) + (keepPadding ? parseFloat(ps.paddingLeft) : 0);
      const right = pr.right - parseFloat(ps.borderRightWidth) - (keepPadding ? parseFloat(ps.paddingRight) : 0);
      const textLeft = Math.min(...rects.map((r) => r.left));
      const textRight = Math.max(...rects.map((r) => r.right));
      parentOverflow = Math.max(left - textLeft, textRight - right);
      break;
    }

    if (lines > 1) problems.push(`wraps: ${describe(el)}`);
    else if (style.overflow !== 'visible' && textWidth > contentWidth + 0.05) {
      problems.push(`cut off by ${(textWidth - contentWidth).toFixed(1)}px: ${describe(el)}`);
    } else if (parentOverflow > 0.05) {
      problems.push(`cut off by its container by ${parentOverflow.toFixed(1)}px: ${describe(el)}`);
    }
    if (box.right > innerWidth + 1 || box.left < -1) problems.push(`outside the window: ${describe(el)}`);

    // Covered: the end of the text must be the topmost element there. The open zoom choice covers
    // the date on purpose, and it lets the pointer through, so hit testing cannot check its own texts.
    if (el.closest('.wm-interval-pill')) continue;
    const last = rects[rects.length - 1];
    const x = Math.min(last.right, box.right) - 1;
    const y = last.top + last.height / 2;
    const area = visibleArea(el);
    if (x < area.left || x > area.right || y < area.top || y > area.bottom) continue;
    const hit = document.elementFromPoint(x, y);
    // An ancestor as hit means el lets the pointer through (pointer-events: none); it is not covered.
    if (hit && !el.contains(hit) && !hit.contains(el) && !hit.closest('.wm-interval-pill')) {
      problems.push(`covered by ${hit.className.split(' ')[0] || hit.tagName}: ${describe(el)}`);
    }
  }
  if (document.documentElement.scrollWidth > innerWidth + 1) problems.push('page scrolls horizontally');
  return problems;
}

module.exports = { CHECKED_TEXT, findLayoutProblems };
