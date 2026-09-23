/* Language (EN/ES) + small UI bits. No dependencies. */
(function () {
  'use strict';
  var root = document.documentElement;
  var KEY = 'acv-lang';

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(l) { try { localStorage.setItem(KEY, l); } catch (e) { /* storage blocked */ } }
  function valid(l) { return l === 'es' || l === 'en'; }

  // Priority: ?lang=es|en in the URL > last choice > browser language
  var fromUrl = new URLSearchParams(window.location.search).get('lang');
  var saved = read();
  var lang = valid(fromUrl) ? fromUrl
           : valid(saved) ? saved
           : ((navigator.language || '').toLowerCase().indexOf('es') === 0 ? 'es' : 'en');
  if (valid(fromUrl)) save(fromUrl);
  root.lang = lang; // set before first paint to avoid a flash of the wrong language

  document.addEventListener('DOMContentLoaded', function () {
    var title = document.querySelector('title');
    var toggle = document.querySelector('.lang-toggle');

    function render() {
      var l = root.lang;
      if (title && title.getAttribute('data-' + l)) title.textContent = title.getAttribute('data-' + l);
      if (toggle) {
        toggle.textContent = l === 'en' ? 'ES' : 'EN';
        toggle.setAttribute('aria-label', l === 'en' ? 'Cambiar a español' : 'Switch to English');
      }
    }
    if (toggle) {
      toggle.addEventListener('click', function () {
        root.lang = root.lang === 'en' ? 'es' : 'en';
        save(root.lang);
        render();
      });
    }
    render();

    // Mobile menu
    var header = document.querySelector('.site-header');
    var menuBtn = document.querySelector('.nav-toggle');
    function setMenu(open) {
      header.classList.toggle('nav-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
    }
    if (header && menuBtn) {
      menuBtn.addEventListener('click', function () { setMenu(!header.classList.contains('nav-open')); });
      document.querySelectorAll('.nav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    }

    // Footer year
    document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
        // Lightbox for gallery images
    var zoomBtns = document.querySelectorAll('.media--zoom');
    if (zoomBtns.length) {
      var lb = document.createElement('div');
      lb.className = 'lightbox';
      lb.innerHTML = '<button class="lightbox-close" type="button" aria-label="Close">&times;</button><img alt="">';
      document.body.appendChild(lb);
      var lbImg = lb.querySelector('img');
      var lbClose = lb.querySelector('.lightbox-close');
      var lastFocus = null;

      function openLb(src, alt) {
        lastFocus = document.activeElement;
        lbImg.src = src;
        lbImg.alt = alt || '';
        lb.classList.add('is-open');
        lbClose.focus();
      }
      function closeLb() {
        lb.classList.remove('is-open');
        lbImg.src = '';
        if (lastFocus) lastFocus.focus();
      }
      zoomBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          openLb(btn.getAttribute('data-full'), btn.getAttribute('aria-label'));
        });
      });
      lbClose.addEventListener('click', closeLb);
      lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb.classList.contains('is-open')) closeLb(); });
    }
  });
})();
