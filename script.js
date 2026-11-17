(() => {
  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();

  const root = document.documentElement;
  const visual = document.querySelector('.visual');
  let frame = 0;
  const move = (event) => {
    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      root.style.setProperty('--pointer-x', `${event.clientX}px`);
      root.style.setProperty('--pointer-y', `${event.clientY}px`);
      if (visual && (matchMedia('(pointer: fine)').matches || event.pointerType === 'touch')) {
        const bounds = visual.getBoundingClientRect();
        const dx = (event.clientX - (bounds.left + bounds.width / 2)) / bounds.width;
        const dy = (event.clientY - (bounds.top + bounds.height / 2)) / bounds.height;
        visual.style.setProperty('--tilt-x', `${dx * 9}px`);
        visual.style.setProperty('--tilt-y', `${dy * 9}px`);
      }
    });
  };
  window.addEventListener('pointermove', move, { passive: true });
  window.addEventListener('pointerleave', () => {
    visual?.style.setProperty('--tilt-x', '0px');
    visual?.style.setProperty('--tilt-y', '0px');
  });

  const story = document.querySelector('.scroll-story');
  const storyPath = story?.querySelector('.story-path');
  const traveler = story?.querySelector('.story-traveler');
  const storyRing = story?.querySelector('.ring-a');
  const storyRingInner = story?.querySelector('.ring-b');
  const storyCenter = story?.querySelector('.story-center');
  const storySteps = [...(story?.querySelectorAll('[data-story-step]') || [])];
  const storyMeter = story?.querySelector('.story-meter');
  const meterFill = storyMeter?.querySelector('span');
  const progressNumber = story?.querySelector('.progress-number');
  let storyFrame = 0;
  let pathLength = 0;
  try {
    pathLength = storyPath?.getTotalLength() || 0;
    if (pathLength) storyPath.style.strokeDasharray = `${pathLength}`;
  } catch { /* Keep the story legible if SVG path measurement is unavailable. */ }

  const updateStory = () => {
    if (!story) return;
    const scrollRange = Math.max(1, story.offsetHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, -story.getBoundingClientRect().top / scrollRange));
    const stepIndex = Math.min(storySteps.length - 1, Math.floor(progress * storySteps.length));
    story.style.setProperty('--scroll-progress', `${progress}`);
    if (pathLength && storyPath) storyPath.style.strokeDashoffset = `${pathLength * (1 - progress)}`;
    if (pathLength && traveler && storyPath) {
      const point = storyPath.getPointAtLength(pathLength * progress);
      traveler.setAttribute('cx', `${point.x}`);
      traveler.setAttribute('cy', `${point.y}`);
    }
    if (storyRing) storyRing.style.transform = `rotate(${progress * 510}deg) scale(${0.92 + progress * 0.08})`;
    if (storyRingInner) storyRingInner.style.transform = `rotate(${-progress * 690}deg) scale(${1.08 - progress * 0.12})`;
    if (storyCenter) {
      storyCenter.style.transform = `scale(${0.7 + progress * 0.55})`;
      storyCenter.style.opacity = `${0.28 + progress * 0.52}`;
    }
    if (meterFill) meterFill.style.width = `${progress * 100}%`;
    if (storyMeter) storyMeter.setAttribute('aria-valuenow', `${Math.round(progress * 100)}`);
    if (progressNumber) progressNumber.textContent = `${Math.round(progress * 100)}`.padStart(2, '0');
    storySteps.forEach((item, index) => item.classList.toggle('is-active', index === stepIndex));
  };
  const requestStoryFrame = () => {
    if (storyFrame) return;
    storyFrame = requestAnimationFrame(() => {
      storyFrame = 0;
      updateStory();
    });
  };
  if (story) {
    window.addEventListener('scroll', requestStoryFrame, { passive: true });
    window.addEventListener('resize', requestStoryFrame, { passive: true });
    requestStoryFrame();
  }

  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries, current) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          current.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach((item) => observer.observe(item));
  } else {
    items.forEach((item) => item.classList.add('is-visible'));
  }
})();
