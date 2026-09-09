/* ==========================================================================
   ImageWorks Creative — AI Website Design

   Two things on this page need a script. The entrance reveal, because it has
   to know when a section comes into view, and the process, because its four
   steps share one panel. Everything else is CSS.

   Both degrade to plain content if this file never runs: the stylesheet hides
   a reveal only while `data-anim` is set, and hides an inactive step panel
   only while `data-ready` is set, and this is the only thing that sets either.
   Without it every section is visible and the four steps stack.

   Loaded with `defer`, so the document is parsed by the time this runs, and
   wrapped so nothing here reaches the global scope.
   ========================================================================== */

(function () {
  'use strict';

  const root = document.documentElement;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ------------------------------------------------------------------------
     1 · ENTRANCE REVEALS
     Once per element, and only where the browser supports IntersectionObserver
     and the visitor has not asked for reduced motion.
     ------------------------------------------------------------------------ */
  function setupReveals() {
    const targets = Array.from(document.querySelectorAll('.reveal'));
    if (!targets.length) return;

    // Either way the flag goes on: the stylesheet only hides a reveal while
    // the page is in a position to bring it back.
    root.setAttribute('data-anim', 'on');

    if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
      for (const el of targets) el.classList.add('is-revealed');
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    for (const el of targets) observer.observe(el);

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
        observer.unobserve(el);
      }
      window.removeEventListener('scroll', revealRemainder);
    };

    window.addEventListener('scroll', revealRemainder, { passive: true });
    window.addEventListener('load', revealRemainder);
    revealRemainder();
  }

  /* ------------------------------------------------------------------------
     2 · THE PROCESS, AS STATIONS ON A RAIL
     Each tab shows its own step and fills the rail up to itself; everything
     behind it stays green. Keyboard behaviour follows the tablist pattern:
     one tab in the tab order, arrows to move, Home and End to the ends.
     ------------------------------------------------------------------------ */
  function setupSteps() {
    const steps = document.querySelector('[data-steps]');
    if (!steps) return;

    const tabs = Array.from(steps.querySelectorAll('[role="tab"]'));
    if (!tabs.length) return;

    const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
    if (panels.some((panel) => !panel)) return;

    const fill = steps.querySelector('[data-steps-fill]');

    // Nothing is hidden until the component is known to work.
    steps.setAttribute('data-ready', 'true');

    const select = (index) => {
      tabs.forEach((tab, n) => {
        const isCurrent = n === index;
        tab.classList.toggle('is-active', isCurrent);
        tab.classList.toggle('is-done', n < index);
        tab.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
        tab.tabIndex = isCurrent ? 0 : -1;
        panels[n].classList.toggle('is-active', isCurrent);
      });
      // the rail runs to the centre of the station, which is where its node sits
      if (fill) fill.style.width = (((index + 0.5) / tabs.length) * 100) + '%';
    };

    const nextIndex = (key, from) => {
      const last = tabs.length - 1;
      if (key === 'ArrowRight' || key === 'ArrowDown') return from === last ? 0 : from + 1;
      if (key === 'ArrowLeft' || key === 'ArrowUp') return from === 0 ? last : from - 1;
      if (key === 'Home') return 0;
      if (key === 'End') return last;
      return null;
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(index));
      tab.addEventListener('keydown', (event) => {
        const next = nextIndex(event.key, index);
        if (next === null) return;

        event.preventDefault();
        select(next);
        tabs[next].focus();
      });
    });

    select(0);
  }

  /* ------------------------------------------------------------------------
     3 · THE BEFORE / AFTER WIPE
     The divider's position is one custom property, and the range input is the
     only thing that sets it. The stylesheet defaults it to the halfway mark,
     so if this never runs both designs are still on screen — just fixed.
     ------------------------------------------------------------------------ */
  function setupCompare() {
    const compare = document.querySelector('[data-ba]');
    if (!compare) return;

    const range = compare.querySelector('[data-ba-range]');
    if (!range) return;

    const tags = Array.from(compare.querySelectorAll('[data-ba-side]'));

    const apply = () => {
      const position = Number(range.value);
      compare.style.setProperty('--ba', position + '%');

      // Each tag lights while its side is the one being shown. At the halfway
      // mark both are, in equal measure, so both stay lit.
      for (const tag of tags) {
        const showing = tag.dataset.baSide === 'before' ? position >= 50 : position <= 50;
        tag.classList.toggle('is-active', showing);
        tag.setAttribute('aria-pressed', showing ? 'true' : 'false');
      }
    };

    range.addEventListener('input', apply);

    // and each throws the divider to its own end
    for (const tag of tags) {
      tag.addEventListener('click', () => {
        range.value = tag.dataset.baSide === 'before' ? range.max : range.min;
        apply();
      });
    }

    apply();
  }

  /* ------------------------------------------------------------------------
     4 · BOOT
     ------------------------------------------------------------------------ */
  setupReveals();
  setupSteps();
  setupCompare();
}());
