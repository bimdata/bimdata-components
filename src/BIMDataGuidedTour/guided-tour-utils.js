/**
 * Parameters
 */

// Tooltip gap (in px)
const tooltipGap = 25;

/**
 * Internal utility functions
 */

function getElementCoord(elem) {
  let x, y, w, h;

  if (Array.isArray(elem)) {
    let widestXW, highestYH;

    elem.map(e => {
      const { x: currentX, y: currentY, width: currentW, height: currentH } = e.getBoundingClientRect();

      if (!widestXW || widestXW < currentX + currentW) {
        widestXW = currentX + currentW;
      }

      if (!highestYH || highestYH < currentY + currentH) {
        highestYH = currentY + currentH;
      }

      if (!x || x > currentX) {
        x = currentX;
      }

      if (!y || y > currentY) {
        y = currentY;
      }

      w = widestXW - x;
      h = highestYH - y;
    });
  } else {
    const { x: currentX, y: currentY, width: currentW, height: currentH } = elem.getBoundingClientRect();

    x = currentX;
    y = currentY;
    w = currentW;
    h = currentH;
  }

  return { x, y, w, h };
}

function getWindowSize() {
  return {
    wWindow: window.innerWidth,
    hWindow: window.innerHeight,
  };
}

function getWindowScroll() {
  return {
    offsetXWindow: window.pageXOffset,
    offsetYWindow: window.pageYOffset,
  };
}

/**
 * Exported utility functions
 */

function isNegative(num) {
  return Math.sign(num) === -1;
}

async function scrollToTarget(target, element) {
  const { y, h } = getElementCoord(target);
  const { hWindow } = getWindowSize();

  const offsetYElement = element.offsetTop;
  const scrolledTop = element.scrollTop;

  if (isNegative(y)) {
    element.scroll({
      top: scrolledTop + y - tooltipGap,
    });
  }

  if (y < offsetYElement) {
    element.scroll({
      top: scrolledTop + y - offsetYElement - tooltipGap,
    });
  }

  if (y + h > hWindow) {
    element.scroll({
      top: y + h - hWindow + scrolledTop + tooltipGap,
    });
  }
}

function setTooltipPosition(target, tooltip, arrow, yOffset = 0, xOffset = 0) {
  const { x: xTarget, y: yTarget, w: targetWidth, h: targetHeight } = getElementCoord(target);

  const { w: tooltipWidth, h: tooltipHeight } = getElementCoord(tooltip);
  const { wWindow, hWindow } = getWindowSize();

  const tooltipTop = tooltip.getElementsByClassName('tooltip__box__top')[0];
  const { h: tooltipTopHeight } = getElementCoord(tooltipTop);

  const { offsetXWindow, offsetYWindow } = getWindowScroll();

  let left, top;
  let adjustTop = 0;

  const targetLeft = offsetXWindow + xTarget;
  const tooltipTotalWidth = tooltipWidth + tooltipGap;

  const targetTop = offsetYWindow + yTarget;
  const tooltipTotalHeight = tooltipHeight + tooltipGap;

  const tooltipFitRight = wWindow - (targetLeft + targetWidth) > tooltipTotalWidth;
  const tooltipFitLeft = targetLeft > tooltipTotalWidth;

  if (tooltipFitRight) {
    left = targetLeft + targetWidth + tooltipGap;

    // align bottom
    if (hWindow - targetTop - targetHeight < tooltipTotalHeight - targetHeight) {
      if (targetHeight < tooltipTopHeight) {
        adjustTop = tooltipTopHeight / 2 + targetHeight / -2;
      }
      top = targetTop + targetHeight - tooltipHeight + adjustTop;
      arrow.dataset.position = 'down-right';
      // align top
    } else {
      if (targetHeight < tooltipTopHeight) {
        adjustTop = tooltipTopHeight / -2 + targetHeight / 2;
      }
      top = targetTop + adjustTop;
      arrow.dataset.position = 'up-right';
    }

    Object.assign(tooltip.style, {
      left: `${left + xOffset}px`,
      top: `${top + yOffset}px`,
    });
    return;
  }

  if (tooltipFitLeft) {
    left = targetLeft - tooltipTotalWidth;

    // align bottom
    if (hWindow - targetTop - targetHeight < tooltipTotalHeight - targetHeight) {
      if (targetHeight < tooltipTopHeight) {
        adjustTop = tooltipTopHeight / 2 + targetHeight / -2;
      }
      top = targetTop + targetHeight - tooltipHeight + adjustTop;
      arrow.dataset.position = 'down-left';
      // align top
    } else {
      if (targetHeight < tooltipTopHeight) {
        adjustTop = tooltipTopHeight / -2 + targetHeight / 2;
      }
      top = targetTop + adjustTop;
      arrow.dataset.position = 'up-left';
    }
    Object.assign(tooltip.style, {
      left: `${left + xOffset}px`,
      top: `${top + yOffset}px`,
    });
    return;
  }

  const tooltipFitTop = tooltipTotalHeight < targetTop - tooltipGap;
  const tooltipFitBottom = hWindow - (targetTop + targetHeight) > tooltipTotalHeight;

  if (tooltipFitTop) {
    arrow.dataset.position = 'bottom';
    Object.assign(tooltip.style, {
      left: `${targetLeft + xOffset}px`,
      top: `${targetTop - tooltipTotalHeight + yOffset}px`,
    });
    return;
  }

  if (tooltipFitBottom) {
    arrow.dataset.position = 'top';
    Object.assign(tooltip.style, {
      left: `${targetLeft + xOffset}px`,
      top: `${targetTop + targetHeight + tooltipGap + yOffset}px`,
    });
    return;
  }

  // tooltip in element
  arrow.dataset.position = 'hidden';
  Object.assign(tooltip.style, {
    left: `${targetLeft + targetWidth - tooltipWidth + xOffset}px`,
    top: `${targetTop + targetHeight - tooltipHeight + yOffset}px`,
  });
}

export { scrollToTarget, setTooltipPosition };
