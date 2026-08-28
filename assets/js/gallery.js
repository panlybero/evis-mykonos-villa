/**
 * Standalone reimplementation of the three Squarespace gallery layouts used on
 * this site, so the galleries render without Squarespace's JS bundle:
 *
 *   GalleryStrips  - justified rows (target rowHeight, scaled to fill width)
 *   GalleryGrid    - uniform N-column grid with a fixed aspect ratio
 *   GalleryMasonry - N columns, images keep natural aspect, balanced by height
 *
 * Layout parameters are read from each gallery's own data-props attribute,
 * exactly as the original markup specifies them.
 */
(function () {
  var ASPECT = {
    "square": 1,
    "standard": 4 / 3,
    "widescreen": 16 / 9,
    "three-four-vertical": 3 / 4,
    "two-three-vertical": 2 / 3,
    "nine-sixteen-vertical": 9 / 16,
    "four-three": 4 / 3,
    "three-two": 3 / 2,
  };

  function props(el) {
    try {
      return JSON.parse(el.getAttribute("data-props") || "{}");
    } catch (e) {
      return {};
    }
  }

  function items(el) {
    return Array.prototype.slice.call(
      el.querySelectorAll(".gallery-strips-item, .gallery-grid-item, .gallery-masonry-item")
    );
  }

  function ratioOf(fig) {
    var img = fig.querySelector("img");
    var d = img && img.getAttribute("data-image-dimensions");
    if (d && /^\d+x\d+$/.test(d)) {
      var p = d.split("x");
      return parseInt(p[0], 10) / parseInt(p[1], 10);
    }
    if (img && img.naturalWidth && img.naturalHeight) {
      return img.naturalWidth / img.naturalHeight;
    }
    return 1.5;
  }

  function styleImg(fig) {
    var img = fig.querySelector("img");
    if (!img) return;
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    img.style.display = "block";
    img.style.opacity = "1";
    img.style.position = "static";
  }

  /* ---------- justified rows ---------- */
  function layoutStrips(el) {
    var p = props(el);
    var gutter = p.gutter != null ? p.gutter : 20;
    var target = p.rowHeight || 300;
    var figs = items(el);
    if (!figs.length) return;

    var wrapper = el.querySelector(".gallery-strips-wrapper") || el;
    var width = wrapper.getBoundingClientRect().width || el.clientWidth;
    if (!width) return;

    // cache the original figure order, then rebuild rows from scratch so the
    // layout is idempotent across resizes
    if (!wrapper.__figs) wrapper.__figs = figs.slice();
    figs = wrapper.__figs;
    Array.prototype.slice.call(wrapper.querySelectorAll(".js-strip-row"))
      .forEach(function (r) { r.parentNode.removeChild(r); });

    wrapper.style.display = "block";

    var row = [];
    var ratioSum = 0;

    function flush(isLast) {
      if (!row.length) return;
      var gutters = gutter * (row.length - 1);
      // justify: scale the row so it exactly fills the container width
      var h = (width - gutters) / ratioSum;
      // a lone trailing image shouldn't be blown up far past the target height
      if (isLast && h > target * 1.5) h = target;

      // explicit flex row: avoids inline-block sub-pixel wrapping
      var rowEl = document.createElement("div");
      rowEl.className = "js-strip-row";
      rowEl.style.display = "flex";
      rowEl.style.flexWrap = "nowrap";
      rowEl.style.gap = gutter + "px";
      rowEl.style.marginBottom = isLast ? "0" : gutter + "px";
      wrapper.appendChild(rowEl);

      row.forEach(function (f) {
        var w = ratioOf(f) * h;
        f.style.flex = "0 0 auto";
        f.style.width = w + "px";
        f.style.height = h + "px";
        f.style.margin = "0";
        f.style.overflow = "hidden";
        rowEl.appendChild(f);
        styleImg(f);
      });
      row = [];
      ratioSum = 0;
    }

    // Justified rows. Images are added to a row while the height needed to fill
    // the width stays above the target. When adding one more would drop below
    // the target, we keep whichever option lands *geometrically* closer to it
    // (i.e. compare target/h_below against h_above/target). This reproduces
    // Squarespace's own strip layout exactly.
    var idx = 0;
    while (idx < figs.length) {
      row = [];
      ratioSum = 0;
      while (idx < figs.length) {
        var r = ratioOf(figs[idx]);
        var nextSum = ratioSum + r;
        var nextN = row.length + 1;
        var hNext = (width - gutter * (nextN - 1)) / nextSum;
        if (hNext < target && row.length) {
          var hCur = (width - gutter * (row.length - 1)) / ratioSum;
          if (target / hNext < hCur / target) {
            row.push(figs[idx]);
            ratioSum = nextSum;
            idx++;
          }
          break;
        }
        row.push(figs[idx]);
        ratioSum = nextSum;
        idx++;
      }
      flush(idx >= figs.length);
    }
  }

  /* ---------- uniform grid ---------- */
  function layoutGrid(el) {
    var p = props(el);
    var gutter = p.gutter != null ? p.gutter : 50;
    var cols = p.numColumns || 2;
    var ar = ASPECT[p.aspectRatio] || 1;
    var figs = items(el);
    if (!figs.length) return;

    var wrapper = el.querySelector(".gallery-grid-wrapper") || el;
    var width = wrapper.clientWidth || el.clientWidth;
    if (!width) return;

    if (window.innerWidth <= 640) cols = 1;

    wrapper.style.display = "grid";
    wrapper.style.gridTemplateColumns = "repeat(" + cols + ", 1fr)";
    wrapper.style.gap = gutter + "px";

    var colW = (width - gutter * (cols - 1)) / cols;
    figs.forEach(function (f) {
      f.style.width = "100%";
      f.style.height = colW / ar + "px";
      f.style.margin = "0";
      f.style.overflow = "hidden";
      styleImg(f);
    });
  }

  /* ---------- masonry ---------- */
  function layoutMasonry(el) {
    var p = props(el);
    var gutter = p.gutter != null ? p.gutter : 20;
    var cols = p.numColumns || 2;
    var figs = items(el);
    if (!figs.length) return;

    var wrapper = el.querySelector(".gallery-masonry-wrapper") || el;
    var width = wrapper.clientWidth || el.clientWidth;
    if (!width) return;

    if (window.innerWidth <= 640) cols = 1;

    var colW = (width - gutter * (cols - 1)) / cols;
    var heights = new Array(cols).fill(0);

    wrapper.style.position = "relative";
    wrapper.style.display = "block";

    figs.forEach(function (f) {
      var shortest = heights.indexOf(Math.min.apply(null, heights));
      var h = colW / ratioOf(f);
      f.style.position = "absolute";
      f.style.width = colW + "px";
      f.style.height = h + "px";
      f.style.left = shortest * (colW + gutter) + "px";
      f.style.top = heights[shortest] + "px";
      f.style.margin = "0";
      f.style.overflow = "hidden";
      styleImg(f);
      heights[shortest] += h + gutter;
    });

    wrapper.style.height = (Math.max.apply(null, heights) - gutter) + "px";
  }

  function layoutAll() {
    document.querySelectorAll('[data-controller="GalleryStrips"]').forEach(layoutStrips);
    document.querySelectorAll('[data-controller="GalleryGrid"]').forEach(layoutGrid);
    document.querySelectorAll('[data-controller="GalleryMasonry"]').forEach(layoutMasonry);
  }

  function init() {
    layoutAll();
    // re-run once images have decoded (in case dimensions were missing)
    window.addEventListener("load", layoutAll);
    var t;
    window.addEventListener("resize", function () {
      clearTimeout(t);
      t = setTimeout(layoutAll, 120);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
