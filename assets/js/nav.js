/**
 * Mobile navigation for the ported site.
 *
 * Squarespace's own bundle normally toggles `.header--menu-open` on <body> and
 * the header when the burger is tapped; its stylesheet already contains all the
 * open/closed styling, so we only need to reproduce the class toggling.
 */
(function () {
  function init() {
    // the theme renders more than one burger button (desktop/mobile variants),
    // so bind them all rather than just the first
    var burgers = document.querySelectorAll(".header-burger-btn, .burger");
    var header = document.querySelector("#header, .header");
    var menu = document.querySelector(".header-menu");
    if (!burgers.length || !header) return;

    // Squarespace colour-theme classes. While the overlay menu is open the
    // header drops its theme class so it picks up the overlay's colours.
    var THEMES = ["white", "white-bold", "light", "light-bold", "bright",
                  "bright-bold", "bright-inverse", "dark", "dark-bold",
                  "black", "black-bold"];
    var savedTheme = null;
    var savedSectionTheme = null;

    function setOpen(open) {
      document.body.classList.toggle("header--menu-open", open);

      if (open) {
        if (savedTheme === null) {
          savedTheme = THEMES.filter(function (t) {
            return header.classList.contains(t);
          });
        }
        savedTheme.forEach(function (t) { header.classList.remove(t); });

        // the overlay's colours come from data-section-theme; Squarespace
        // clears it while the menu is open so the overlay theme takes over
        if (savedSectionTheme === null) {
          savedSectionTheme = header.getAttribute("data-section-theme") || "";
        }
        header.setAttribute("data-section-theme", "");

        // match the live site: pad the menu down past the fixed header
        if (menu) {
          menu.style.paddingTop = header.getBoundingClientRect().height + "px";
        }

        // the root folder panel is the one shown first
        var rootFolder = document.querySelector('.header-menu-nav-folder[data-folder="root"]');
        if (rootFolder) rootFolder.classList.add("header-menu-nav-folder--active");
      } else {
        if (savedTheme) {
          savedTheme.forEach(function (t) { header.classList.add(t); });
          savedTheme = null;
        }
        if (savedSectionTheme !== null) {
          header.setAttribute("data-section-theme", savedSectionTheme);
          savedSectionTheme = null;
        }
        if (menu) menu.style.paddingTop = "";

        var rootFolderC = document.querySelector('.header-menu-nav-folder[data-folder="root"]');
        if (rootFolderC) {
          rootFolderC.classList.remove("header-menu-nav-folder--active",
                                       "header-menu-nav-folder--open");
        }
        document.querySelectorAll('.header-menu-nav-folder:not([data-folder="root"])')
          .forEach(function (f) { f.classList.remove("header-menu-nav-folder--active"); });
      }

      burgers.forEach(function (btn) {
        btn.classList.toggle("burger--active", open);
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
      var bw = document.querySelector(".header-burger");
      if (bw) bw.classList.add("preFade");

      document.documentElement.style.overflow = open ? "hidden" : "";
    }

    burgers.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        setOpen(!document.body.classList.contains("header--menu-open"));
      });
    });

    /* Squarespace's script hoists each folder panel out of the root panel so
       they become siblings; the stylesheet hides nested panels outright
       (`.header-menu-nav-folder .header-menu-nav-folder { display: none }`).
       Replicate that flattening once at startup. */
    var navList = document.querySelector(".header-menu-nav-list");
    if (navList) {
      document.querySelectorAll('.header-menu-nav-folder:not([data-folder="root"])')
        .forEach(function (f) {
          if (f.parentElement !== navList) navList.appendChild(f);
        });
    }

    /* ----- folder sub-panels inside the overlay -----
       Squarespace marks the root panel `--open` and the target panel
       `--active`; "Back" reverses it. Folder links must not navigate, because
       /about-1 and /galleries are folder placeholders with no real page. */
    var root = document.querySelector('.header-menu-nav-folder[data-folder="root"]');

    function openFolder(id) {
      var target = document.querySelector('.header-menu-nav-folder[data-folder="' + id + '"]');
      if (!target || !root) return false;
      root.classList.add("header-menu-nav-folder--open");
      target.classList.add("header-menu-nav-folder--active");
      return true;
    }

    function closeFolders() {
      if (root) root.classList.remove("header-menu-nav-folder--open");
      document.querySelectorAll('.header-menu-nav-folder:not([data-folder="root"])')
        .forEach(function (f) { f.classList.remove("header-menu-nav-folder--active"); });
    }

    if (menu) {
      menu.addEventListener("click", function (e) {
        var a = e.target.closest("a");
        if (!a) return;

        if (a.hasAttribute("data-folder-id")) {
          if (openFolder(a.getAttribute("data-folder-id"))) e.preventDefault();
          return;
        }
        if (a.getAttribute("data-action") === "back") {
          e.preventDefault();
          closeFolders();
          return;
        }
        // a genuine page link: close the overlay
        if (a.getAttribute("href")) {
          setOpen(false);
          closeFolders();
        }
      });
    }

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) setOpen(false);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
