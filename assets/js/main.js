// Evi's Mykonos Villa — shared site behavior

document.addEventListener('DOMContentLoaded', function () {
  /* Mobile nav toggle */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      toggle.classList.toggle('open');
    });

    // On mobile, tapping a dropdown label expands its submenu instead of navigating
    document.querySelectorAll('.main-nav .dropdown > .nav-link').forEach(function (link) {
      link.addEventListener('click', function (e) {
        if (window.innerWidth <= 760) {
          e.preventDefault();
          link.parentElement.classList.toggle('open');
        }
      });
    });
  }

  /* Simple lightbox for gallery pages */
  var galleryLinks = document.querySelectorAll('.gallery-grid a[data-lightbox]');
  if (galleryLinks.length) {
    var lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML =
      '<button class="lightbox-close" aria-label="Close">&times;</button>' +
      '<button class="lightbox-nav lightbox-prev" aria-label="Previous">&#8249;</button>' +
      '<img src="" alt="">' +
      '<button class="lightbox-nav lightbox-next" aria-label="Next">&#8250;</button>';
    document.body.appendChild(lightbox);

    var imgEl = lightbox.querySelector('img');
    var images = Array.prototype.map.call(galleryLinks, function (a) {
      return a.getAttribute('href');
    });
    var current = 0;

    function show(index) {
      current = (index + images.length) % images.length;
      imgEl.src = images[current];
    }
    function open(index) {
      show(index);
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }

    galleryLinks.forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        open(i);
      });
    });

    lightbox.querySelector('.lightbox-close').addEventListener('click', close);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', function () { show(current - 1); });
    lightbox.querySelector('.lightbox-next').addEventListener('click', function () { show(current + 1); });
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) close();
    });
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }
});
