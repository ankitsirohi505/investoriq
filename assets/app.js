(function () {
  'use strict';

  var CONFIG = {
    endpoint: 'https://miet3.my.site.com/investorsvforcesite/services/apexrest/iiq/access-request',
    timeoutMs: 20000,
    source: 'investoriq-site',
    fundCodes: ['AIF', 'CPF', 'GIF', 'GIF2'],
    blockPersonalEmail: false,
    personalEmailDomains: ['gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.com.au', 'hotmail.com', 'outlook.com', 'live.com', 'msn.com', 'icloud.com', 'me.com', 'aol.com', 'proton.me', 'protonmail.com', 'gmx.com', 'bigpond.com', 'optusnet.com.au']
  };

  var FUND_NAMES = {
    AIF: 'Australian Infrastructure Fund',
    CPF: 'Core Property Fund',
    GIF: 'Global Infrastructure Fund',
    GIF2: 'Global Infrastructure Fund II'
  };

  var root = document.documentElement;
  root.classList.add('js');

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function scrollToEl(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  function initHeader() {
    var header = $('#site-header');
    if (!header) return;
    var update = function () { header.classList.toggle('is-top', (window.scrollY || window.pageYOffset) < 24); };
    update();
    window.addEventListener('scroll', update, { passive: true });

    var toggle = $('.menu-toggle', header);
    var menu = $('#mobile-menu');
    if (!toggle || !menu) return;
    var label = $('.sr-only', toggle);

    function setOpen(open, restoreFocus) {
      toggle.setAttribute('aria-expanded', String(open));
      menu.hidden = !open;
      header.classList.toggle('is-open', open);
      root.classList.toggle('menu-open', open);
      if (label) label.textContent = open ? 'Close menu' : 'Menu';
      if (open) {
        var first = $('a', menu);
        if (first) first.focus();
      } else if (restoreFocus) {
        toggle.focus();
      }
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true', false);
    });
    $$('a', menu).forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false, false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setOpen(false, true);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1140 && toggle.getAttribute('aria-expanded') === 'true') setOpen(false, false);
    });
  }

  function initActiveNav() {
    var links = $$('.primary-nav a[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute('aria-current'); });
        var link = byId[entry.target.id];
        if (link) link.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main > section[id]').forEach(function (s) { observer.observe(s); });
  }

  function initReveal() {
    var items = $$('.reveal');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { observer.observe(el); });
  }

  function initPortfolio() {
    var chips = $$('[data-filter-btn]');
    var assets = $$('.asset');
    var groups = $$('.asset-group');
    var pins = $$('.pin');

    function applyFilter(code) {
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-filter-btn') === code)); });
      assets.forEach(function (a) { a.hidden = !(code === 'ALL' || a.getAttribute('data-fund') === code); });
      groups.forEach(function (g) { g.hidden = !$('.asset:not([hidden])', g); });
      pins.forEach(function (p) { p.classList.toggle('is-dim', code !== 'ALL' && !p.classList.contains('pin-' + code.toLowerCase())); });
    }

    chips.forEach(function (c) {
      c.addEventListener('click', function () { applyFilter(c.getAttribute('data-filter-btn')); });
    });
    $$('[data-filter]').forEach(function (a) {
      a.addEventListener('click', function () { applyFilter(a.getAttribute('data-filter')); });
    });

    function setHot(id, on) {
      if (!id) return;
      pins.forEach(function (p) { if (p.getAttribute('data-asset') === id) p.classList.toggle('is-hot', on); });
      assets.forEach(function (a) { if (a.getAttribute('data-asset') === id) a.classList.toggle('is-hot', on); });
    }
    assets.concat(pins).forEach(function (el) {
      var id = el.getAttribute('data-asset');
      el.addEventListener('mouseenter', function () { setHot(id, true); });
      el.addEventListener('mouseleave', function () { setHot(id, false); });
    });
  }

  function initTexture() {
    var svg = $('.access-texture');
    if (!svg) return;
    var ns = 'http://www.w3.org/2000/svg';
    var W = 640, H = 320, seed = 7;
    var cols = ['#3FD9A3', '#0F6A74', '#9BE8C9', '#1E8A7E', '#6FD4B0', '#E8A3B5', '#0C5660', '#F2C7D2'];
    function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('preserveAspectRatio', 'xMidYMax slice');
    var frag = document.createDocumentFragment();
    for (var i = 0; i < 560; i++) {
      var x = rnd() * W;
      var hill = 0.5 + 0.16 * Math.sin(x / 120) + 0.1 * Math.sin(x / 47 + 1.7) + 0.05 * Math.sin(x / 21 + 0.4);
      var top = H * (1 - hill);
      var y = top + Math.pow(rnd(), 0.8) * (H - top);
      var depth = (y - top) / (H - top + 1);
      var c = document.createElementNS(ns, 'circle');
      c.setAttribute('cx', x.toFixed(1));
      c.setAttribute('cy', y.toFixed(1));
      c.setAttribute('r', (0.9 + rnd() * 2.6 * (0.6 + depth)).toFixed(1));
      c.setAttribute('fill', cols[Math.floor(rnd() * cols.length)]);
      c.setAttribute('fill-opacity', Math.min(0.85, (0.18 + rnd() * 0.6) * (0.4 + depth * 0.7)).toFixed(2));
      frag.appendChild(c);
    }
    svg.appendChild(frag);
  }

  function normaliseFund(raw) {
    var code = String(raw || '').toUpperCase().replace(/[\s_-]/g, '');
    if (code === 'GIFII') code = 'GIF2';
    return CONFIG.fundCodes.indexOf(code) !== -1 ? code : '';
  }

  function initForm() {
    var form = $('#access-form');
    if (!form) return;
    var submitBtn = $('#form-submit');
    var btnLabel = $('.btn-label', submitBtn);
    var statusEl = $('#form-status');
    var alertEl = $('#form-alert');
    var alertTitle = $('#form-alert-title');
    var alertText = $('#form-alert-text');
    var retryBtn = $('#form-retry');
    var successEl = $('#form-success');
    var formTitle = $('#form-title');
    var sending = false;
    var attempted = false;

    var EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/;
    var PHONE_RE = /^\+?[0-9()\s.-]{6,20}$/;

    function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
    function checked(id) { var el = document.getElementById(id); return !!(el && el.checked); }
    function fundBoxes() { return $$('input[name="fundInterests"]', form); }
    function selectedFunds() {
      return CONFIG.fundCodes.filter(function (code) {
        return fundBoxes().some(function (b) { return b.value === code && b.checked; });
      });
    }
    function emailDomain(v) { var at = v.lastIndexOf('@'); return at === -1 ? '' : v.slice(at + 1).toLowerCase(); }
    function isPersonal(v) { return CONFIG.personalEmailDomains.indexOf(emailDomain(v)) !== -1; }

    var FIELDS = [
      { id: 'f-first', err: 'f-first-err', check: function () { return val('f-first') ? '' : 'Enter your first name.'; } },
      { id: 'f-last', err: 'f-last-err', check: function () { return val('f-last') ? '' : 'Enter your last name.'; } },
      { id: 'f-email', err: 'f-email-err', check: function () {
        var v = val('f-email');
        if (!v) return 'Enter your work email address.';
        if (!EMAIL_RE.test(v) || v.length > 80) return 'Enter a valid email address, like name@organisation.com.';
        if (CONFIG.blockPersonalEmail && isPersonal(v)) return 'Please use your work email address.';
        return '';
      } },
      { id: 'f-phone', err: 'f-phone-err', check: function () {
        var v = val('f-phone');
        return !v || PHONE_RE.test(v) ? '' : 'Enter a valid phone number, or leave it blank.';
      } },
      { id: 'f-org', err: 'f-org-err', check: function () { return val('f-org') ? '' : 'Enter the name of your organisation.'; } },
      { id: 'f-type', err: 'f-type-err', check: function () { return val('f-type') ? '' : 'Select your investor type.'; } },
      { id: 'f-funds', err: 'f-funds-err', group: true, check: function () { return selectedFunds().length ? '' : 'Select at least one fund.'; } },
      { id: 'f-wholesale', err: 'f-wholesale-err', check: function () { return checked('f-wholesale') ? '' : 'Please confirm your organisation is a wholesale or institutional investor.'; } },
      { id: 'f-privacy', err: 'f-privacy-err', check: function () { return checked('f-privacy') ? '' : 'Please agree so we can contact you about this request.'; } }
    ];

    function setError(field, message) {
      var el = document.getElementById(field.id);
      var errEl = document.getElementById(field.err);
      if (!el || !errEl) return;
      if (message) {
        errEl.textContent = message;
        errEl.hidden = false;
        if (field.group) {
          el.classList.add('is-invalid');
          fundBoxes().forEach(function (b) { b.setAttribute('aria-invalid', 'true'); });
        } else {
          el.setAttribute('aria-invalid', 'true');
        }
      } else {
        errEl.textContent = '';
        errEl.hidden = true;
        if (field.group) {
          el.classList.remove('is-invalid');
          fundBoxes().forEach(function (b) { b.removeAttribute('aria-invalid'); });
        } else {
          el.removeAttribute('aria-invalid');
        }
      }
    }

    function validateField(field) {
      var message = field.check();
      setError(field, message);
      return !message;
    }

    function validateAll() {
      var firstInvalid = null;
      FIELDS.forEach(function (field) {
        if (!validateField(field) && !firstInvalid) {
          firstInvalid = field.group ? fundBoxes()[0] : document.getElementById(field.id);
        }
      });
      return firstInvalid;
    }

    function fieldFor(id) {
      for (var i = 0; i < FIELDS.length; i++) if (FIELDS[i].id === id) return FIELDS[i];
      return null;
    }

    FIELDS.forEach(function (field) {
      if (field.group) {
        fundBoxes().forEach(function (b) {
          b.addEventListener('change', function () { if (attempted || selectedFunds().length) validateField(field); });
        });
        return;
      }
      var el = document.getElementById(field.id);
      if (!el) return;
      var isBox = el.type === 'checkbox';
      el.addEventListener(isBox || el.tagName === 'SELECT' ? 'change' : 'blur', function () {
        if (isBox && !attempted && !el.checked) return;
        if (!isBox && !attempted && !el.value.trim()) return;
        validateField(field);
      });
      if (!isBox) {
        el.addEventListener('input', function () {
          if (el.getAttribute('aria-invalid') === 'true') validateField(field);
        });
      }
    });

    var emailEl = document.getElementById('f-email');
    var emailHint = document.getElementById('f-email-hint');
    if (emailEl && emailHint) {
      emailEl.addEventListener('blur', function () {
        var v = emailEl.value.trim();
        var show = !CONFIG.blockPersonalEmail && EMAIL_RE.test(v) && isPersonal(v);
        emailHint.textContent = show ? 'This looks like a personal address. A work email helps us match your request to your organisation.' : '';
        emailHint.hidden = !show;
      });
    }

    function selectFund(code, announce) {
      var box = fundBoxes().filter(function (b) { return b.value === code; })[0];
      if (!box) return;
      box.checked = true;
      var field = fieldFor('f-funds');
      if (field) validateField(field);
      if (announce && statusEl) statusEl.textContent = FUND_NAMES[code] + ' is selected.';
    }

    $$('[data-fund]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var code = normaliseFund(btn.getAttribute('data-fund'));
        if (!code) return;
        e.preventDefault();
        if (!successEl.hidden) resetForm(false);
        selectFund(code, true);
        scrollToEl($('#request-access'));
        if (formTitle) formTitle.focus({ preventScroll: true });
      });
    });

    $$('[data-scroll-form]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        scrollToEl($('#request-access'));
        if (formTitle) formTitle.focus({ preventScroll: true });
      });
    });

    try {
      var params = new URLSearchParams(window.location.search);
      var wanted = params.get('fund');
      if (wanted) wanted.split(',').forEach(function (c) { var code = normaliseFund(c); if (code) selectFund(code, false); });
    } catch (e) {}

    function setSending(on) {
      sending = on;
      submitBtn.disabled = on;
      submitBtn.classList.toggle('is-sending', on);
      form.setAttribute('aria-busy', String(on));
      if (btnLabel) btnLabel.textContent = on ? 'Sending…' : 'Request access';
      if (statusEl) statusEl.textContent = on ? 'Sending your request securely…' : '';
    }

    function showAlert(kind, text) {
      alertEl.classList.toggle('is-info', kind === 'network');
      alertTitle.textContent = kind === 'network' ? 'We couldn’t reach InvestorIQ' : 'We couldn’t send your request';
      alertText.textContent = text;
      retryBtn.hidden = kind !== 'network';
      alertEl.hidden = false;
    }

    function hideAlert() {
      alertEl.hidden = true;
      alertText.textContent = '';
    }

    function parseJson(text) {
      if (!text) return null;
      try {
        var data = JSON.parse(text);
        if (typeof data === 'string') {
          try { data = JSON.parse(data); } catch (e) { return null; }
        }
        return data;
      } catch (e) {
        return null;
      }
    }

    function defaultError(status) {
      if (status >= 500) return 'Something went wrong on our side (error ' + status + '). Please try again in a few minutes.';
      if (status === 429) return 'We’ve received several requests from this connection. Please wait a minute and try again.';
      if (status >= 400) return 'We couldn’t accept this request (error ' + status + '). Please check your details and try again.';
      return 'We couldn’t confirm your request was received. Please try again.';
    }

    function buildPayload() {
      var honeypot = document.getElementById('f-website');
      return {
        firstName: val('f-first'),
        lastName: val('f-last'),
        email: val('f-email'),
        phone: val('f-phone'),
        title: val('f-title'),
        organisation: val('f-org'),
        investorType: val('f-type'),
        country: val('f-country') || 'Australia',
        fundInterests: selectedFunds(),
        commitmentRange: val('f-range'),
        message: val('f-message'),
        wholesaleConfirmed: checked('f-wholesale'),
        privacyConsent: checked('f-privacy'),
        website: honeypot ? honeypot.value : '',
        source: CONFIG.source
      };
    }

    function showSuccess(data, payload) {
      var ref = typeof data.reference === 'string' ? data.reference.trim() : '';
      var title = $('#success-title');
      $('#success-ref').textContent = ref;
      $('.success-ref', successEl).hidden = !ref;
      $('#success-message').textContent = typeof data.message === 'string' && data.message.trim()
        ? data.message.trim()
        : 'Your relationship manager will be in touch shortly.';
      title.textContent = 'Thank you, ' + payload.firstName + '. Your request is with us.';
      form.hidden = true;
      successEl.hidden = false;
      var card = $('.access-card');
      if (card && card.getBoundingClientRect().top < 0) scrollToEl(card);
      title.focus({ preventScroll: true });
    }

    function send(payload) {
      setSending(true);
      var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
      var finished = false;
      var timer = setTimeout(function () {
        if (finished) return;
        finished = true;
        if (ctrl) ctrl.abort();
        setSending(false);
        showAlert('network', 'The request took too long to reach InvestorIQ. Your details are still here; please try again.');
      }, CONFIG.timeoutMs);

      fetch(CONFIG.endpoint, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-store',
        referrerPolicy: 'no-referrer',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: ctrl ? ctrl.signal : undefined
      })
        .then(function (res) {
          return res.text().then(function (text) { return { res: res, data: parseJson(text) }; });
        })
        .then(function (r) {
          if (finished) return;
          finished = true;
          clearTimeout(timer);
          setSending(false);
          if (r.res.ok && r.data && r.data.ok === true) {
            showSuccess(r.data, payload);
            return;
          }
          var msg = r.data && typeof r.data.error === 'string' && r.data.error.trim() ? r.data.error.trim() : defaultError(r.res.ok ? 0 : r.res.status);
          showAlert('error', msg);
        })
        .catch(function () {
          if (finished) return;
          finished = true;
          clearTimeout(timer);
          setSending(false);
          showAlert('network', 'Please check your connection and try again. Your details are still here.');
        });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;
      attempted = true;
      hideAlert();
      var firstInvalid = validateAll();
      if (firstInvalid) {
        if (statusEl) statusEl.textContent = 'Please check the highlighted fields.';
        firstInvalid.focus();
        return;
      }
      send(buildPayload());
    });

    retryBtn.addEventListener('click', function () {
      if (typeof form.requestSubmit === 'function') form.requestSubmit();
      else submitBtn.click();
    });

    function resetForm(focus) {
      form.reset();
      attempted = false;
      FIELDS.forEach(function (f) { setError(f, ''); });
      if (emailHint) emailHint.hidden = true;
      hideAlert();
      if (statusEl) statusEl.textContent = '';
      successEl.hidden = true;
      form.hidden = false;
      if (focus) document.getElementById('f-first').focus();
    }

    $('#form-again').addEventListener('click', function () { resetForm(true); });
  }

  function initYear() {
    $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
  }

  function init() {
    initHeader();
    initActiveNav();
    initReveal();
    initPortfolio();
    initTexture();
    initForm();
    initYear();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
