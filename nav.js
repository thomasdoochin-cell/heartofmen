/* ============================================================
   Heart of Men — shared site nav
   Injected on every page via <script src="/nav.js" defer>.
   Fixed top-right hamburger -> full-screen overlay menu.
   Keep this the single source of the nav (no duplicated markup).
   ============================================================ */
(function () {
  'use strict';

  var INSTAGRAM = 'https://www.instagram.com/heartofmencommunity/';

  // ---- styles ----
  var css =
    '.hom-nav-toggle{position:fixed;top:2rem;right:2rem;z-index:1100;width:48px;height:48px;' +
      'display:flex;align-items:center;justify-content:center;padding:0;cursor:pointer;' +
      'background:rgba(14,12,9,0.55);border:1px solid rgba(185,155,86,0.35);border-radius:50%;' +
      '-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);' +
      'transition:background 0.25s ease,border-color 0.25s ease;}' +
    '.hom-nav-toggle:hover,.hom-nav-toggle:focus-visible{background:rgba(14,12,9,0.8);border-color:#b99b56;outline:none;}' +
    '.hom-nav-toggle .hom-nav-bars{position:relative;width:22px;height:16px;}' +
    '.hom-nav-toggle .hom-nav-bars span{position:absolute;left:0;width:100%;height:2px;background:#b99b56;border-radius:2px;' +
      'transition:transform 0.3s ease,opacity 0.2s ease;}' +
    '.hom-nav-toggle .hom-nav-bars span:nth-child(1){top:0;}' +
    '.hom-nav-toggle .hom-nav-bars span:nth-child(2){top:7px;}' +
    '.hom-nav-toggle .hom-nav-bars span:nth-child(3){top:14px;}' +
    '.hom-nav-toggle.is-open .hom-nav-bars span:nth-child(1){transform:translateY(7px) rotate(45deg);}' +
    '.hom-nav-toggle.is-open .hom-nav-bars span:nth-child(2){opacity:0;}' +
    '.hom-nav-toggle.is-open .hom-nav-bars span:nth-child(3){transform:translateY(-7px) rotate(-45deg);}' +
    '.hom-nav-overlay{position:fixed;inset:0;z-index:1050;display:flex;align-items:center;justify-content:center;' +
      'background:rgba(14,12,9,0.97);opacity:0;visibility:hidden;pointer-events:none;' +
      'transition:opacity 0.35s ease,visibility 0s linear 0.35s;}' +
    '.hom-nav-overlay.is-open{opacity:1;visibility:visible;pointer-events:auto;transition:opacity 0.35s ease;}' +
    '.hom-nav-overlay ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;align-items:center;gap:2.5rem;text-align:center;}' +
    '.hom-nav-overlay a{display:inline-flex;align-items:center;gap:0.6rem;' +
      "font-family:'Playfair Display',Georgia,serif;text-transform:uppercase;letter-spacing:0.18em;" +
      'font-size:clamp(1.5rem,5vw,2.4rem);font-weight:500;color:#b99b56;text-decoration:none;' +
      'padding-bottom:0.2rem;border-bottom:1px solid transparent;transition:color 0.25s ease,border-color 0.25s ease;}' +
    '.hom-nav-overlay a:hover,.hom-nav-overlay a:focus-visible{color:#e8dfc8;border-bottom-color:#e8dfc8;outline:none;}' +
    '.hom-nav-overlay a[aria-current="page"]{font-weight:700;border-bottom-color:#b99b56;}' +
    '.hom-nav-overlay a[aria-current="page"]:hover,.hom-nav-overlay a[aria-current="page"]:focus-visible{border-bottom-color:#e8dfc8;}' +
    '.hom-nav-overlay li.hom-nav-cta-item{margin-bottom:0.5rem;}' +
    '.hom-nav-overlay a.hom-nav-cta{background:#b99b56;color:#0e0c09;font-weight:600;' +
      'padding:0.85rem 2rem;font-size:clamp(1.1rem,3.6vw,1.55rem);border:1px solid #b99b56;border-radius:2px;' +
      'box-shadow:0 0 22px rgba(185,155,86,0.25);transition:background 0.25s ease,box-shadow 0.25s ease;}' +
    '.hom-nav-overlay a.hom-nav-cta:hover,.hom-nav-overlay a.hom-nav-cta:focus-visible{' +
      'background:#c9ad68;color:#0e0c09;border-color:#c9ad68;border-bottom-color:#c9ad68;box-shadow:0 0 30px rgba(185,155,86,0.45);}' +
    '.hom-nav-overlay a.hom-nav-social{color:#e8dfc8;}' +
    '.hom-nav-overlay a.hom-nav-social:hover,.hom-nav-overlay a.hom-nav-social:focus-visible{color:#ffffff;border-bottom-color:#ffffff;}' +
    '.hom-nav-overlay svg{width:1em;height:1em;fill:currentColor;flex-shrink:0;}' +
    '@media (prefers-reduced-motion:reduce){.hom-nav-toggle .hom-nav-bars span,.hom-nav-overlay{transition:none;}}' +
    /* ---- Sunday Saunter pop-up (shared by every page that loads nav.js) ---- */
    '.hom-popup-overlay{position:fixed;inset:0;z-index:1200;background:rgba(14,12,9,0.82);' +
      'display:flex;align-items:flex-start;justify-content:center;padding:1.5rem;overflow-y:auto;' +
      'opacity:0;visibility:hidden;transition:opacity 0.3s ease,visibility 0.3s ease;}' +
    '.hom-popup-overlay.is-open{opacity:1;visibility:visible;}' +
    '.hom-popup-card{position:relative;margin:auto;background:#16110c;border:1px solid rgba(185,155,86,0.55);' +
      "max-width:520px;width:100%;padding:3.25rem 2.25rem 2.5rem;text-align:center;" +
      "font-family:'Playfair Display',Georgia,serif;}" +
    '.hom-popup-close{position:absolute;top:0.6rem;right:1rem;background:none;border:none;color:#e8dfc8;' +
      'font-size:1.7rem;line-height:1;cursor:pointer;padding:0.25rem;text-shadow:0 1px 4px rgba(0,0,0,0.8);z-index:2;}' +
    '.hom-popup-close:hover{color:#b99b56;}' +
    '.hom-popup-photo{display:block;width:calc(100% + 4.5rem);margin:-3.25rem -2.25rem 1.75rem;max-width:none;' +
      'aspect-ratio:2100 / 700;object-fit:cover;object-position:center;}' +
    ".hom-popup-head{font-family:'Cormorant Garamond',Georgia,serif;font-size:clamp(1.9rem,4.6vw,2.3rem);" +
      'font-weight:600;color:#e8dfc8;line-height:1.15;margin:0 0 1rem;}' +
    '.hom-popup-body{font-size:0.98rem;line-height:1.65;color:#c9bfa8;margin:0 0 1.75rem;}' +
    '.hom-popup-form{display:flex;gap:0;}' +
    '.hom-popup-form input{flex:1;min-width:0;padding:1rem 1.25rem;background:#1a1510;border:1px solid #2a2418;' +
      "border-right:none;color:#f5f0e8;font-family:'Playfair Display',Georgia,serif;font-size:0.95rem;outline:none;}" +
    '.hom-popup-form input:focus{border-color:#b99b56;}' +
    '.hom-popup-form button{padding:1rem 1.5rem;background:#b99b56;color:#0e0c09;' +
      "font-family:'Playfair Display',Georgia,serif;font-size:0.85rem;letter-spacing:0.1em;text-transform:uppercase;" +
      'font-weight:600;border:none;cursor:pointer;white-space:nowrap;}' +
    '.hom-popup-form button:hover{background:#c9ad68;}' +
    '.hom-popup-form button:disabled{opacity:0.6;cursor:default;}' +
    '.hom-popup-success{padding:1rem 1.25rem;background:#1a1510;border:1px solid #b99b56;color:#b99b56;font-size:0.95rem;}' +
    '.hom-popup-fine{font-size:0.78rem;color:#c9bfa8;margin:1rem 0 0;}' +
    '@media (max-width:520px){.hom-popup-form{flex-direction:column;}' +
      '.hom-popup-form input{border-right:1px solid #2a2418;border-bottom:none;}}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ---- current page detection ----
  function normalize(path) {
    path = (path || '/').split('?')[0].split('#')[0];
    path = path.replace(/\.html$/, '');
    if (path.length > 1) path = path.replace(/\/$/, '');
    if (path === '' || path === '/index') path = '/';
    return path;
  }
  var here = normalize(window.location.pathname);

  var links = [
    { href: '/', label: 'Living Leadership' },
    { href: '/full-circle-fund', label: 'Full Circle Fund' }
  ];

  // ---- markup ----
  var toggle = document.createElement('button');
  toggle.className = 'hom-nav-toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-label', 'Menu');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'hom-nav-overlay');
  toggle.innerHTML = '<span class="hom-nav-bars" aria-hidden="true"><span></span><span></span><span></span></span>';

  var overlay = document.createElement('nav');
  overlay.className = 'hom-nav-overlay';
  overlay.id = 'hom-nav-overlay';
  overlay.setAttribute('aria-label', 'Primary');
  overlay.setAttribute('aria-hidden', 'true');

  var ul = document.createElement('ul');

  // (The "Free, Live Masterclass" CTA button lived here; removed Sept 2026.
  //  The .hom-nav-cta / .hom-nav-cta-item styles above are kept for the next one.)

  links.forEach(function (item) {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = item.href;
    a.textContent = item.label;
    if (normalize(item.href) === here) a.setAttribute('aria-current', 'page');
    li.appendChild(a);
    ul.appendChild(li);
  });
  // Instagram (icon + label, new tab)
  var igLi = document.createElement('li');
  var igA = document.createElement('a');
  igA.className = 'hom-nav-social';
  igA.href = INSTAGRAM;
  igA.target = '_blank';
  igA.rel = 'noopener';
  igA.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.31-1.46.72-2.12 1.38C1.36 2.67.95 3.34.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.8.72 1.47 1.38 2.13.66.66 1.33 1.07 2.12 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.8-.31 1.47-.72 2.13-1.38.66-.66 1.07-1.33 1.38-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.12A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0Zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84Zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4Zm6.41-10.4a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44Z"/></svg>' +
    '<span>Instagram</span>';
  igLi.appendChild(igA);
  ul.appendChild(igLi);

  // Substack (icon + label, new tab)
  var subLi = document.createElement('li');
  var subA = document.createElement('a');
  subA.className = 'hom-nav-social';
  subA.href = 'https://heartofmen.substack.com/';
  subA.target = '_blank';
  subA.rel = 'noopener';
  subA.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.539 0H1.46v2.836h21.08V0z"/></svg>' +
    '<span>Substack</span>';
  subLi.appendChild(subA);
  ul.appendChild(subLi);

  overlay.appendChild(ul);

  document.body.appendChild(toggle);
  document.body.appendChild(overlay);

  // ---- position: drop the toggle below a top countdown bar (homepage) ----
  // so it never overlaps the bar and the bar's content can stay centered.
  // Pages without such a bar keep the CSS default (top: 2rem).
  function positionToggle() {
    var bar = document.querySelector('.countdown-bar:not(.bottom)');
    if (bar) {
      toggle.style.top = Math.round(bar.getBoundingClientRect().height + 14) + 'px';
    } else {
      toggle.style.top = '';
    }
  }
  positionToggle();
  window.addEventListener('load', positionToggle);
  window.addEventListener('resize', positionToggle);

  // ---- Sunday Saunter pop-up ----
  // Shows once per visitor (localStorage), 15s after load, on any page loading nav.js.
  // Set POPUP_ENABLED to false to switch it off everywhere.
  (function () {
    var POPUP_ENABLED = true;
    var DELAY_MS = 15000;
    var KEY = 'hom_saunter_popup_v2';
    if (!POPUP_ENABLED) return;

    var seen = null;
    try { seen = localStorage.getItem(KEY); } catch (e) {}
    if (seen) return;

    var overlay = document.createElement('div');
    overlay.className = 'hom-popup-overlay';
    overlay.id = 'hom-saunter-popup';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Sunday Saunter newsletter');
    overlay.innerHTML =
      '<div class="hom-popup-card">' +
        '<button class="hom-popup-close" type="button" aria-label="Close">&times;</button>' +
        '<img class="hom-popup-photo" src="/Images/sunday-saunter-header.jpg" alt="Sunday Saunter with Thomas Doochin" loading="lazy" decoding="async">' +
        '<p class="hom-popup-head">Join our beloved Sunday Tradition</p>' +
        '<p class="hom-popup-body">Each Sunday afternoon, we send a newsletter weaving inspiration from our programs, long-form reflections from our founder, and actionable insights to help you live a more audacious and authentic life in the week ahead.</p>' +
        '<div class="hom-popup-form-wrap">' +
          '<form class="hom-popup-form" action="https://formspree.io/f/xoealrwk" method="POST">' +
            '<input type="hidden" name="_subject" value="Sunday Saunter signup (pop-up)">' +
            '<input type="email" name="email" required placeholder="Your email address" aria-label="Your email address">' +
            '<button type="submit">I\u2019m In</button>' +
          '</form>' +
        '</div>' +
        '<p class="hom-popup-success" hidden>You\u2019re in \u2014 see you Sunday afternoon.</p>' +
        '<p class="hom-popup-fine">Your email will not be shared outside of Heart of Men.</p>' +
      '</div>';
    document.body.appendChild(overlay);

    var card = overlay.querySelector('.hom-popup-card');
    var formWrap = overlay.querySelector('.hom-popup-form-wrap');
    var form = overlay.querySelector('form');
    var submitBtn = form.querySelector('button');
    var success = overlay.querySelector('.hom-popup-success');

    function close() { overlay.classList.remove('is-open'); }
    overlay.querySelector('.hom-popup-close').addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitBtn.disabled = true;
      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (res) {
        if (!res.ok) throw new Error('Request failed');
        formWrap.hidden = true;
        success.hidden = false;
      }).catch(function () {
        submitBtn.disabled = false;
      });
    });

    setTimeout(function () {
      overlay.classList.add('is-open');
      try { localStorage.setItem(KEY, '1'); } catch (e) {}
    }, DELAY_MS);
  })();

  // ---- behaviour ----
  var isOpen = false;
  var lastFocus = null;

  function focusable() {
    return Array.prototype.slice.call(
      overlay.querySelectorAll('a[href]')
    ).concat([toggle]);
  }

  function open() {
    if (isOpen) return;
    isOpen = true;
    lastFocus = document.activeElement;
    toggle.classList.add('is-open');
    overlay.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    overlay.setAttribute('aria-hidden', 'false');
    var first = overlay.querySelector('a[href]');
    if (first) first.focus();
    document.addEventListener('keydown', onKeydown, true);
    document.addEventListener('click', onOutside, true);
  }

  function close(restore) {
    if (!isOpen) return;
    isOpen = false;
    toggle.classList.remove('is-open');
    overlay.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Menu');
    overlay.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', onKeydown, true);
    document.removeEventListener('click', onOutside, true);
    if (restore !== false) {
      (lastFocus && lastFocus.focus ? lastFocus : toggle).focus();
    }
  }

  function onKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === 'Tab') {
      var items = focusable();
      if (!items.length) return;
      var firstEl = items[0];
      var lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
  }

  function onOutside(e) {
    // clicking the empty overlay (not a link, not the toggle) closes it
    if (overlay.contains(e.target) && e.target.closest('a')) return;
    if (toggle.contains(e.target)) return;
    if (overlay.contains(e.target) || e.target === overlay) {
      close();
    }
  }

  toggle.addEventListener('click', function () {
    if (isOpen) close(); else open();
  });

  // close after following an in-page nav link (same-tab navigations)
  overlay.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (a && a.target !== '_blank') close(false);
  });
})();
