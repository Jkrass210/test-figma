/**
 * Lazy images for <img img-lazy ...>
 *
 * Markup:
 *   <img img-lazy data-src="img/picture.jpg" src="img/placeholder.svg" alt="..." />
 *
 * Optional:
 *   data-srcset="..." (will be moved to srcset on load)
 *   data-sizes="..."  (will be moved to sizes on load)
 *
 * Behavior:
 * - Adds class "Load" until the image fires "load" (or "error").
 * - Uses IntersectionObserver to start loading only near viewport.
 * - Works for dynamically inserted DOM (AJAX) via MutationObserver.
 */

const IMG_SELECTOR = 'img[img-lazy]';
const INIT_ATTR = 'data-img-lazy-init';
const LOAD_CLASS = 'Load';
const LOAD_ERROR_CLASS = 'Load--error';

const TRANSPARENT_GIF =
  'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=';

function isLoaded(img) {
  return img.complete && img.naturalWidth > 0;
}

function hasLazyPayload(img) {
  if (!(img instanceof HTMLImageElement)) return false;
  if (img.getAttribute('data-src') || img.getAttribute('data-srcset')) return true;

  const picture = typeof img.closest === 'function' ? img.closest('picture') : null;
  if (!picture || typeof picture.querySelector !== 'function') return false;

  return Boolean(picture.querySelector('source[data-srcset],source[data-sizes]'));
}

function ensureNonBlockingHints(img) {
  // Use attributes for widest browser/tooling compatibility
  if (!img.getAttribute('loading')) img.setAttribute('loading', 'lazy');
  if (!img.getAttribute('decoding')) img.setAttribute('decoding', 'async');
  if (!img.getAttribute('fetchpriority')) img.setAttribute('fetchpriority', 'low');
}

function setLoadingClass(img) {
  img.classList.add(LOAD_CLASS);
}

function clearLoadingClass(img) {
  img.classList.remove(LOAD_CLASS);
}

function setErrorClass(img) {
  img.classList.add(LOAD_ERROR_CLASS);
}

function attachLoadHandlers(img) {
  const onLoad = () => {
    // Placeholder can fire "load" before data-src -> src swap.
    // We only consider "done" when the lazy payload is already applied.
    if (hasLazyPayload(img)) return;
    clearLoadingClass(img);
    img.removeEventListener('load', onLoad);
    img.removeEventListener('error', onError);
  };

  const onError = () => {
    // Ignore placeholder errors; mark error only for the real payload.
    if (hasLazyPayload(img)) return;
    clearLoadingClass(img);
    setErrorClass(img);
    img.removeEventListener('load', onLoad);
    img.removeEventListener('error', onError);
  };

  img.addEventListener('load', onLoad);
  img.addEventListener('error', onError);
}

function applyPictureSources(img) {
  const picture = typeof img.closest === 'function' ? img.closest('picture') : null;
  if (!picture) return;

  picture.querySelectorAll('source').forEach((source) => {
    const srcset = source.getAttribute('data-srcset');
    const sizes = source.getAttribute('data-sizes');

    if (srcset) {
      source.setAttribute('srcset', srcset);
      source.removeAttribute('data-srcset');
    }

    if (sizes) {
      source.setAttribute('sizes', sizes);
      source.removeAttribute('data-sizes');
    }
  });
}

function applyRealSource(img) {
  const src = img.getAttribute('data-src');
  const picture = typeof img.closest === 'function' ? img.closest('picture') : null;
  const hasPictureSources = Boolean(
    picture && typeof picture.querySelector === 'function'
      ? picture.querySelector('source[data-srcset],source[data-sizes]')
      : null
  );

  // For <picture>, sources may be the real lazy payload.
  if (!src && !hasPictureSources) return;

  // keep placeholder if provided; otherwise set a minimal placeholder
  if (!img.getAttribute('src')) {
    img.setAttribute('src', TRANSPARENT_GIF);
  }

  applyPictureSources(img);

  const srcset = img.getAttribute('data-srcset');
  const sizes = img.getAttribute('data-sizes');

  if (src) {
    img.setAttribute('src', src);
    img.removeAttribute('data-src');
  }

  if (srcset) {
    img.setAttribute('srcset', srcset);
    img.removeAttribute('data-srcset');
  }

  if (sizes) {
    img.setAttribute('sizes', sizes);
    img.removeAttribute('data-sizes');
  }
}

function initOne(img, io) {
  if (!(img instanceof HTMLImageElement)) return;
  if (img.hasAttribute(INIT_ATTR)) return;

  img.setAttribute(INIT_ATTR, '1');
  ensureNonBlockingHints(img);
  setLoadingClass(img);

  // Don't treat a placeholder as "loaded" when a lazy payload exists.
  if (!hasLazyPayload(img) && isLoaded(img)) {
    clearLoadingClass(img);
    return;
  }

  attachLoadHandlers(img);

  if (!img.getAttribute('data-src') && !img.getAttribute('data-srcset')) {
    // Nothing to lazy-load; still keep Load until actual load/error.
    return;
  }

  if (io) {
    io.observe(img);
  } else {
    // Fallback: no IntersectionObserver support
    applyRealSource(img);
  }
}

function initInRoot(root, io) {
  if (!root) return;
  const scope = root instanceof Document ? root : root;
  if (!scope.querySelectorAll) return;

  scope.querySelectorAll(IMG_SELECTOR).forEach((img) => initOne(img, io));
}

function createIntersectionObserver() {
  if (!('IntersectionObserver' in window)) return null;

  return new IntersectionObserver(
    (entries, io) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        io.unobserve(img);
        applyRealSource(img);
      });
    },
    {
      root: null,
      rootMargin: '200px 0px',
      threshold: 0.01,
    }
  );
}

function startMutationObserver(io) {
  if (!('MutationObserver' in window)) return;

  const mo = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          // Support AJAX insertions that append DocumentFragments as well.
          const isQueryable =
            node instanceof Element || (typeof DocumentFragment !== 'undefined' && node instanceof DocumentFragment);
          if (!isQueryable) return;

          if (node instanceof Element && typeof node.matches === 'function' && node.matches(IMG_SELECTOR)) {
            initOne(node, io);
            return;
          }

          if (typeof node.querySelector === 'function' && node.querySelector(IMG_SELECTOR)) {
            initInRoot(node, io);
          }
        });
      }

      if (mutation.type === 'attributes') {
        const target = mutation.target;
        if (!(target instanceof HTMLImageElement)) continue;
        if (!target.matches(IMG_SELECTOR)) continue;
        if (!hasLazyPayload(target)) continue;

        // If the image was inserted first and data-* attributes were set later,
        // ensure it gets observed/applied.
        if (io) io.observe(target);
        else applyRealSource(target);
      }
    }
  });

  mo.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['img-lazy', 'data-src', 'data-srcset', 'data-sizes'],
  });
}

function start() {
  const io = createIntersectionObserver();
  initInRoot(document, io);
  startMutationObserver(io);
}

// module in <head> with defer: DOM will be ready by the time this runs,
// but we still guard for safety.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}

