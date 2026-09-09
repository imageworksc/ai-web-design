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
