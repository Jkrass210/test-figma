export function counterAnim() {
  const ANIMATION_DURATION = 5000; // 5 секунд
  const FRAME_DURATION = 1000 / 60;

  const counterBlocks = document.querySelectorAll('.counter');

  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) * 1.1 &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  function animateCounter(counterBlock) {
    const hiddenNumberEl = counterBlock.querySelector('.counter__number.hide');
    const visibleNumberEl = counterBlock.querySelector('.counter__number.number');
    const spanEl = visibleNumberEl.querySelector('span');

    const numberText = hiddenNumberEl.textContent.replace(/\s+/g, '').replace('+', '');
    const hasDecimalPoint = numberText.includes('.');
    const hasDecimalComma = numberText.includes(',');
    const isDecimal = hasDecimalPoint || hasDecimalComma;

    const decimalSeparator = hasDecimalPoint ? '.' : ',';
    const targetNumber = parseFloat(numberText.replace(',', '.'));

    const totalFrames = Math.round(ANIMATION_DURATION / FRAME_DURATION);

    const originalSpan = spanEl ? spanEl.outerHTML : '';

    let frame = 0;
    const animate = () => {
      frame++;
      const progress = Math.min(frame / totalFrames, 1);
      let currentNumber = targetNumber * progress;

      if (isDecimal) {
        currentNumber = parseFloat(currentNumber.toFixed(1));
      } else {
        currentNumber = Math.floor(currentNumber);
      }

      let formattedNumber;
      if (isDecimal) {
        formattedNumber = currentNumber.toString().replace('.', decimalSeparator);
      } else {
        formattedNumber = currentNumber.toString();
      }

      if (spanEl) {
        visibleNumberEl.innerHTML = formattedNumber + originalSpan;
      } else {
        visibleNumberEl.textContent = formattedNumber;
      }

      if (frame < totalFrames) {
        requestAnimationFrame(animate);
      } else {
        let finalNumber;
        if (isDecimal) {
          finalNumber = targetNumber.toString().replace('.', decimalSeparator);
        } else {
          finalNumber = targetNumber.toString();
        }

        visibleNumberEl.innerHTML = spanEl
          ? `${finalNumber}${originalSpan}`
          : finalNumber;
        if (spanEl) {
          visibleNumberEl.querySelector('span').classList.add('active');
        }
      }
    };

    requestAnimationFrame(animate);
  }

  function handleScroll() {
    let allAnimated = true;

    counterBlocks.forEach(block => {
      if (!block.classList.contains('animated') && isElementInViewport(block)) {
        animateCounter(block);
        block.classList.add('animated');
      }

      if (!block.classList.contains('animated')) {
        allAnimated = false;
      }
    });

    if (allAnimated) {
      window.removeEventListener('scroll', handleScroll);
    }
  }

  let needScrollListener = false;

  counterBlocks.forEach(block => {
    if (isElementInViewport(block)) {
      animateCounter(block);
      block.classList.add('animated');
    } else {
      needScrollListener = true;
    }
  });

  if (needScrollListener) {
    window.addEventListener('scroll', handleScroll);
  }
}