/**
 * Scroll-reveal animations.
 *
 * Reimplements the "fade in on scroll" effect the original Squarespace site
 * had. Squarespace's own stylesheet already ships the two classes involved:
 *
 *   .preFade { opacity: 0; transition-property: opacity }
 *   .fadeIn  { opacity: 1 !important }
 *
 * ...and its (removed) JS added `preFade` up front, then `fadeIn` as each
 * element scrolled into view, with the transition timing applied inline.
 * Values below are taken from the live site: ease / 0.9s, with delays
 * staggered in 0.0125s units.
 *
 * `preFade` is applied by this script rather than being baked into the HTML,
 * so if JavaScript fails or is disabled the content simply stays visible.
 */
(function () {
  // The original used 0.9s; shortened here so the reveal feels snappier
  // while keeping the same easing and staggered character.
  var DURATION = "0.55s";
  var EASING = "ease-out";
  var UNIT = 0.0125;      // base stagger unit, as in the original
  var STEP = 2;           // units between consecutive items in a group
  var MAX_STEPS = 5;      // cap so later items don't lag behind
  var HERO_TIMEOUT = 1500; // ms to wait on the hero image before starting

  /* On first paint the original cascades content in after the header rather
     than moving everything at once, which is what stops it reading as a
     single block popping into place. These are the offsets for that first
     batch (the original used ~0.2s + ~0.035s steps; tightened here). */
  var INITIAL_BASE = 0.12;  // seconds after the header starts
  var INITIAL_STEP = 0.05;  // seconds between consecutive items
  var INITIAL_MAX = 6;      // cap the cascade length

  function reducedMotion() {
    return window.matchMedia &&
           window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function init() {
    var all = Array.prototype.slice.call(
      document.querySelectorAll("[data-animation-role]")
    );
    if (!all.length) return;

    // Respect the user's motion preference: leave everything visible.
    if (reducedMotion()) return;

    var transitionsReady = false;
    var headerEls = [];
    var contentEls = [];
    all.forEach(function (el) {
      if (el.getAttribute("data-animation-role") === "header-element" ||
          el.closest("#header")) {
        headerEls.push(el);
      } else {
        contentEls.push(el);
      }
    });

    /* Hide the element with transitions switched off, so opacity:0 is committed
       instantly. If the transition were live at this point the element would
       merely *start* easing from 1 towards 0, and a reveal a frame later would
       snap back from ~1 with nothing to fade from. The transition is enabled
       afterwards in enableTransitions(). */
    function prime(el) {
      el.style.transition = "none";
      el.classList.add("preFade");
    }

    function enableTransitions(el, delaySeconds) {
      el.style.transition = "";
      el.style.transitionProperty = "opacity";
      el.style.transitionTimingFunction = EASING;
      el.style.transitionDuration = DURATION;
      el.style.transitionDelay = delaySeconds.toFixed(4) + "s";
    }

    function reveal(el) {
      el.classList.add("fadeIn");
      // image blocks additionally get this class in the original
      var wrap = el.closest(".image-block-outer-wrapper");
      if (wrap) wrap.classList.add("animation-loaded");
      if (el.classList.contains("image-block-outer-wrapper")) {
        el.classList.add("animation-loaded");
      }
    }

    /* ---- header: fades in on load, small stagger ---- */
    var headerDelay = {};
    headerEls.forEach(function (el, i) {
      prime(el);
      headerDelay[i] = i * UNIT;
    });

    /* ---- content: fades in as each section scrolls into view ---- */
    // stagger is per-section so groups animate together, like the original
    var groups = {};
    contentEls.forEach(function (el) {
      var sec = el.closest("section.page-section") || el.parentElement;
      var key = sec ? (sec.getAttribute("data-section-id") || sec.id ||
                       String(Object.keys(groups).length)) : "_";
      if (!groups[key]) groups[key] = [];
      groups[key].push(el);
    });

    var contentDelay = new WeakMap ? new WeakMap() : null;
    Object.keys(groups).forEach(function (key) {
      groups[key].forEach(function (el, i) {
        prime(el);
        var d = Math.min(i * STEP, MAX_STEPS * STEP) * UNIT;
        if (contentDelay) contentDelay.set(el, d);
        else el.setAttribute("data-fade-delay", d);
      });
    });

    // Commit the hidden state, then switch transitions on a frame later so the
    // browser has painted opacity:0 before anything is revealed.
    void document.body.offsetHeight;   // force reflow
    requestAnimationFrame(function () {
      headerEls.forEach(function (el, i) { enableTransitions(el, headerDelay[i]); });
      contentEls.forEach(function (el) {
        var d = contentDelay ? contentDelay.get(el)
                             : parseFloat(el.getAttribute("data-fade-delay")) || 0;
        enableTransitions(el, d || 0);
      });
      transitionsReady = true;
    });

    /* The section background is not animated - it just loads. Matching the
       original, hold the fade until that image has painted so the page fills
       in behind the content rather than text appearing over a blank area. */
    function whenHeroReady(cb) {
      var img = document.querySelector(".section-background img");
      if (!img || (img.complete && img.naturalWidth)) return cb();
      var done = false;
      function fire() {
        if (done) return;
        done = true;
        cb();
      }
      img.addEventListener("load", fire, { once: true });
      img.addEventListener("error", fire, { once: true });
      setTimeout(fire, HERO_TIMEOUT);
    }

    /* A scroll-position check is used rather than IntersectionObserver alone:
       if the viewport jumps (End key, hash link, fast fling) past an element,
       IO never reports it as intersecting and it would stay invisible for
       good. Here anything already scrolled past is revealed immediately. */
    var pending = contentEls.slice();
    var queued = false;
    var armed = false;   // set once the hero image has painted

    var firstBatch = true;

    function check() {
      queued = false;
      if (!armed) return;
      var vh = window.innerHeight;
      var still = [];
      var batch = [];
      for (var i = 0; i < pending.length; i++) {
        var el = pending[i];
        var r = el.getBoundingClientRect();
        if (r.bottom < 0) {
          // already scrolled past - show it at once, no animation needed
          el.style.transitionDuration = "0s";
          el.style.transitionDelay = "0s";
          reveal(el);
        } else if (r.top < vh * 0.92) {
          batch.push(el);
        } else {
          still.push(el);
        }
      }

      /* The first batch is whatever is on screen at load. Cascade it in
         document order so the hero fills in progressively instead of every
         element starting at the same instant. Later batches keep the
         per-section stagger assigned during priming, which reads correctly
         when a section scrolls into view as a unit. */
      if (firstBatch && batch.length) {
        firstBatch = false;
        batch.forEach(function (el, idx) {
          var steps = Math.min(idx, INITIAL_MAX);
          el.style.transitionDelay =
            (INITIAL_BASE + steps * INITIAL_STEP).toFixed(4) + "s";
        });
      }
      batch.forEach(reveal);
      pending = still;
      if (!pending.length) {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      }
    }

    function onScroll() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(check);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    whenHeroReady(function () {
      // wait until opacity:0 has been painted and transitions are live,
      // otherwise the reveal has nothing to fade from
      (function waitForTransitions() {
        if (!transitionsReady) return requestAnimationFrame(waitForTransitions);
        requestAnimationFrame(function () {
          headerEls.forEach(reveal);
          armed = true;
          check();
        });
      })();
    });

    window.addEventListener("load", function () { setTimeout(check, 300); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
