/* ==========================================================================
   ImageWorks Creative — AI Website Design

   Everything else on the page is CSS. The one thing that needs a script is the
   entrance reveal, because it has to know when a section comes into view.
   Carried over unchanged from the Branding & Graphic Design page.

   Loaded with `defer`, so the document is parsed by the time this runs.
   ========================================================================== */

'use strict';

const root = document.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

/* --------------------------------------------------------------------------
   Entrance reveals. Once per element, and only where the browser supports
   IntersectionObserver and the visitor has not asked for reduced motion.
   -------------------------------------------------------------------------- */
function setupReveals() {
  const targets = Array.from(document.querySelectorAll('.reveal'));
  if (!targets.length) return;

  // Either way the flag goes on: the stylesheet only hides a reveal while the
  // page is in a position to bring it back.
  root.setAttribute('data-anim', 'on');

  if (reduced.matches || !('IntersectionObserver' in window)) {
    for (const el of targets) el.classList.add('is-revealed');
    return;
  }

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-revealed');
      io.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

  for (const el of targets) io.observe(el);

  // The negative rootMargin means anything sitting in the last slice of a
  // fully-scrolled page would never trigger. Once the visitor reaches the
  // bottom, reveal whatever is still waiting.
  const revealRemainder = () => {
    const atBottom = window.innerHeight + window.scrollY >=
                     document.documentElement.scrollHeight - 2;
    if (!atBottom) return;

    for (const el of targets) {
      if (el.classList.contains('is-revealed')) continue;
      el.classList.add('is-revealed');
      io.unobserve(el);
    }
    window.removeEventListener('scroll', revealRemainder);
  };

  window.addEventListener('scroll', revealRemainder, { passive: true });
  window.addEventListener('load', revealRemainder);
  revealRemainder();
}

setupReveals();

/* --------------------------------------------------------------------------
   The process, as stations on a rail. Each tab shows its own step and fills
   the rail up to itself; everything behind it stays green.

   The stylesheet only hides the inactive panels once `data-ready` is set
   here, so if this never runs the four steps simply stack and the process
   reads straight down the page. The copy is the point; the tabs are a
   convenience.
   -------------------------------------------------------------------------- */
function setupSteps() {
  const steps = document.querySelector('[data-steps]');
  if (!steps) return;

  const tabs = Array.from(steps.querySelectorAll('[role="tab"]'));
  if (!tabs.length) return;

  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
  if (panels.some((panel) => !panel)) return;

  const fill = steps.querySelector('[data-steps-fill]');
  steps.setAttribute('data-ready', 'true');

  const select = (i) => {
    tabs.forEach((tab, n) => {
      const on = n === i;
      tab.classList.toggle('is-active', on);
      tab.classList.toggle('is-done', n < i);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
      panels[n].classList.toggle('is-active', on);
    });
    // the rail runs to the centre of the station, which is where its node sits
    if (fill) fill.style.width = (((i + 0.5) / tabs.length) * 100) + '%';
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', (event) => {
      const last = tabs.length - 1;
      let next = null;

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = i === last ? 0 : i + 1;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = i === 0 ? last : i - 1;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = last;
      if (next === null) return;

      event.preventDefault();
      select(next);
      tabs[next].focus();
    });
  });

  select(0);
}

setupSteps();
