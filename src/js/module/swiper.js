let observerStarted = false;

function isSwiperAlive(slider) {
  // Swiper обычно кладёт инстанс в element.swiper
  const instance = slider?.swiper;
  return Boolean(instance && instance.destroyed === false);
}

function buildOptionsForSlider(slider) {
  // Общие параметры для всех слайдеров (если понадобятся — добавляйте здесь)
  const commonOptions = {};

  // Уникальные параметры для каждого слайдера через класс
  if (slider.classList.contains('swiper-decision')) {
    return {
      ...commonOptions,
      slidesPerView: 1,
      centeredSlides: true,
      watchSlidesProgress: true,
      effect: 'creative',
      creativeEffect: {
        prev: {
          translate: [0, 8, -200],
          scale: 0.85,
        },
        next: {
          translate: [0, -18, -16],
          scale: 0.99,
        },
      },
      navigation: {
        nextEl: slider.querySelector('.swiper-btn-type-1.--next'),
        prevEl: slider.querySelector('.swiper-btn-type-1.--prev'),
      },
      on: {
        progress(swiper) {
          swiper.slides.forEach((slide) => {
            slide.style.setProperty('--swiper-slide-progress', slide.progress);
          });
        },
      },
    };
  }

  return commonOptions;
}

/**
 * Инициализирует Swiper внутри заданного root (document по умолчанию).
 * Безопасно для AJAX: повторный вызов не "ломает" уже созданные инстансы.
 */
export function initSwiper(root = document) {
  const scope = root instanceof Document ? root : root?.ownerDocument ?? document;
  const host = root instanceof Document ? root : root;
  if (!host?.querySelectorAll) return;

  const sliders = host.querySelectorAll('.swiper-container');

  sliders.forEach((slider) => {
    if (!(slider instanceof HTMLElement)) return;
    if (isSwiperAlive(slider)) return;

    const options = buildOptionsForSlider(slider);
    // eslint-disable-next-line no-new
    new Swiper(slider, options);
  });

  // Если root не document (например, AJAX вставка) — наблюдатель не обязателен.
  // Его лучше включить один раз на странице, отдельной функцией ниже.
}

/**
 * Автоматически инициализирует Swiper на динамически добавляемых DOM-узлах.
 * Вызывайте один раз при старте приложения (например, после DOMContentLoaded).
 */
export function initSwiperAuto() {
  if (observerStarted) return;
  observerStarted = true;

  initSwiper(document);

  const mo = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;

        // 1) Если добавили сам контейнер
        if (node.classList.contains('swiper-container')) {
          initSwiper(node.ownerDocument);
          return;
        }

        // 2) Или добавили кусок DOM, внутри которого есть контейнеры
        if (node.querySelector?.('.swiper-container')) {
          initSwiper(node);
        }
      });
    }
  });

  mo.observe(document.documentElement, { childList: true, subtree: true });
}