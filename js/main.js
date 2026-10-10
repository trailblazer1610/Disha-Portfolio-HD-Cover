/* Disha Gupta — Portfolio interactions.
   Each init* function is independent; nothing here is required for the content to be readable. */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (n, min = 0, max = 1) => Math.min(max, Math.max(min, n));
  const smoothstep = (t) => t * t * (3 - 2 * t);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ── Navigation: scrolled state, mobile menu, scroll-spy ─────────────── */
  function initNav() {
    const nav = $('[data-nav]');
    if (!nav) return;
    const toggle = $('[data-nav-toggle]', nav);
    const links = $$('[data-nav-link]', nav);

    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    nav.addEventListener('click', (e) => { if (e.target.closest('a:not([data-talk])')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });

    if (!('IntersectionObserver' in window)) return;
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('[data-section]').forEach((section) => spy.observe(section));
  }

  /* ── Entrance reveals ────────────────────────────────────────────────── */
  function initReveal() {
    const items = $$('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach((el) => io.observe(el));
  }

  /* ── Marquee: duplicate the list once so the loop is seamless ─────────── */
  function initMarquee() {
    const track = $('[data-marquee]');
    if (!track || reducedMotion.matches) return; // stays a static, wrapped list
    $$('li', track).forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
    track.classList.add('is-running');
  }

  /* ── Project grid: one shared focus state ─────────────────────────────
     Hovering (mouse/pen) or keyboard-focusing a card keeps it sharp and
     blurs its siblings via CSS. Touch never sets the state, so the grid
     stays clean on phones. Focus only resets when the pointer leaves the
     whole grid, so crossing the gap between cards does not flicker. */
  function initProjectFocus() {
    const grid = $('[data-projects]');
    if (!grid) return;
    const cards = $$('.project', grid);
    let hovered = null;
    let keyed = null;

    const render = () => {
      const active = keyed || hovered;
      grid.classList.toggle('has-focus', Boolean(active));
      cards.forEach((card) => card.classList.toggle('is-focused', card === active));
    };

    grid.addEventListener('pointerover', (e) => {
      if (e.pointerType === 'touch') return;
      const card = e.target.closest('.project');
      if (card && card !== hovered) { hovered = card; render(); }
    });
    grid.addEventListener('pointerleave', () => { hovered = null; render(); });
    // A touch that somehow left hover state behind (hybrid devices) clears it.
    grid.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch' && hovered) { hovered = null; render(); }
    });

    grid.addEventListener('focusin', (e) => {
      const card = e.target.closest('.project');
      keyed = card && card.matches(':focus-visible') ? card : null;
      render();
    });
    grid.addEventListener('focusout', (e) => {
      if (!grid.contains(e.relatedTarget)) { keyed = null; render(); }
    });
  }

  /* ── Scroll story: pinned five-stage sequence ─────────────────────────
     Scroll position inside [data-story-track] is mapped to a float stage
     index `s`; each stage's activeness (1 - distance from s) is written as
     a CSS custom property and CSS does the rest. Only enabled on viewports
     that can hold the pinned layout, and never with reduced motion. */
  function initStory() {
    const section = $('[data-story]');
    if (!section) return;
    const track = $('[data-story-track]', section);
    const sticky = $('[data-story-sticky]', section);
    const items = $$('[data-story-item]', section);
    const numerals = $$('[data-story-numeral]', section);
    const steps = $$('[data-story-step]', section);
    const jumps = $$('[data-story-jump]', section);
    const count = items.length;
    if (!track || !sticky || count < 2) return;

    const query = window.matchMedia('(min-width: 961px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)');
    let enabled = false;
    let visible = false;
    let frame = 0;
    let distance = 1; // scrollable distance while pinned
    let io = null;

    const set = (el, name, value) => {
      const next = value.toFixed(3);
      if (el.style.getPropertyValue(name) !== next) el.style.setProperty(name, next);
    };

    const update = () => {
      frame = 0;
      if (!enabled) return;
      const progress = clamp(-track.getBoundingClientRect().top / distance);
      // Each stage owns an equal slice of the scroll; it holds for part of the slice, then eases to the next.
      const u = clamp(progress * count - 0.5, 0, count - 1);
      const base = Math.floor(u);
      const stage = base + smoothstep(clamp((u - base - 0.2) / 0.6));

      items.forEach((item, i) => set(item, '--a', Math.max(0, 1 - Math.abs(stage - i))));
      numerals.forEach((numeral, i) => {
        set(numeral, '--a', Math.max(0, 1 - Math.abs(stage - i)));
        set(numeral, '--o', clamp(i - stage, -1, 1));
      });
      const stepPos = (stage / (count - 1)) * (steps.length - 1);
      steps.forEach((step, j) => set(step, '--c', clamp(stepPos - j + 1)));
      set(section, '--p', (stage + 1) / count);
    };

    const requestUpdate = () => { if (visible && !frame) frame = requestAnimationFrame(update); };

    const measure = () => {
      if (!enabled) return;
      distance = Math.max(1, track.offsetHeight - sticky.offsetHeight);
      // If the pinned layout cannot fit this viewport (e.g. very large text), fall back to the plain list.
      const inner = sticky.firstElementChild;
      if (inner && inner.scrollHeight > sticky.clientHeight - parseFloat(getComputedStyle(sticky).paddingTop)) {
        disable();
        return;
      }
      update();
    };

    function enable() {
      if (enabled) return;
      enabled = true;
      section.classList.add('is-pinned');
      section.style.setProperty('--stages', count);
      window.addEventListener('scroll', requestUpdate, { passive: true });
      window.addEventListener('resize', measure);
      io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; requestUpdate(); }, { rootMargin: '20% 0px' });
      io.observe(section);
      visible = true;
      measure();
    }

    function disable() {
      if (!enabled) return;
      enabled = false;
      section.classList.remove('is-pinned');
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', measure);
      if (io) { io.disconnect(); io = null; }
      if (frame) { cancelAnimationFrame(frame); frame = 0; }
      [section, ...items, ...numerals, ...steps].forEach((el) => {
        ['--a', '--o', '--c', '--p', '--stages'].forEach((name) => el.style.removeProperty(name));
      });
    }

    // Stage buttons scroll to the middle of that stage's slice (only visible while pinned).
    jumps.forEach((button, i) => {
      button.addEventListener('click', () => {
        if (!enabled) return;
        const top = window.scrollY + track.getBoundingClientRect().top + distance * ((i + 0.5) / count);
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });

    const sync = () => {
      if (query.matches) { enable(); if (!enabled) return; measure(); } else disable();
    };
    query.addEventListener('change', sync);
    // Re-test after a resize in case an earlier "does not fit" fallback no longer applies.
    let resizeTimer = 0;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { if (!enabled && query.matches) enable(); }, 200);
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    sync();
  }

  /* ── Contact: email from js/config.js + "Let's Talk" menu ──────────────
     Every [data-talk] trigger keeps its own look and position; JS wraps it
     and attaches a small menu (Email / LinkedIn / Behance) built from the
     config, so the details live in one place. */
  const ICONS = {
    email: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M3.5 6.5h17v11h-17zM4 7l8 6.5L20 7"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.8v1.6h.06c.53-1 1.83-1.9 3.76-1.9 4 0 4.88 2.5 4.88 6V21h-4v-4.9c0-1.3-.03-3-1.86-3-1.86 0-2.14 1.4-2.14 2.9V21h-4V9.75Z"/></svg>',
    behance: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M2 5h6.2c2.3 0 3.8 1.2 3.800 3.200 0 1.300-.6 2.200-1.700 2.700 1.500.4 2.400 1.600 2.400 3.300 0 2.400-1.800 3.800-4.400 3.800H2V5Zm2.800 2.300v3h2.900c1 0 1.600-.6 1.600-1.500s-.6-1.500-1.600-1.500H4.800Zm0 5.200v3.200H8c1.100 0 1.800-.6 1.800-1.600S9.100 12.500 8 12.500H4.800ZM18 9.500c-2.600 0-4.400 1.900-4.400 4.400 0 2.600 1.800 4.300 4.400 4.300 2 0 3.500-1 4-2.700h-2.400c-.3.5-.8.8-1.500.8-1.100 0-1.800-.7-1.900-1.800h6c.2-2.900-1.500-5-4.200-5Zm-1.800 3.500c.2-.9.8-1.500 1.800-1.500s1.600.6 1.700 1.500h-3.500Zm-.9-6.800h5.200v1.500h-5.200V6.200Z"/></svg>',
  };

  function initContact() {
    const contact = window.PORTFOLIO_CONTACT || {};
    if (contact.email) {
      $$('[data-email-link]').forEach((link) => { link.href = `mailto:${contact.email}`; });
      $$('[data-email-text]').forEach((el) => { el.textContent = contact.email; });
    }

    const options = [
      contact.email && { icon: 'email', label: 'Email Me', hint: contact.email, href: `mailto:${contact.email}` },
      contact.linkedin && { icon: 'linkedin', label: 'LinkedIn', hint: 'Opens in a new tab', href: contact.linkedin, external: true },
      contact.behance && { icon: 'behance', label: 'Behance', hint: 'Opens in a new tab', href: contact.behance, external: true },
    ].filter(Boolean);
    if (options.length < 2) return; // nothing to choose between: triggers stay plain mailto links

    let openWrap = null;
    const close = (returnFocus) => {
      if (!openWrap) return;
      const trigger = openWrap.firstElementChild;
      openWrap.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      if (returnFocus) trigger.focus();
      openWrap = null;
    };

    $$('[data-talk]').forEach((trigger, index) => {
      const wrap = document.createElement('span');
      wrap.className = `talk talk--${trigger.dataset.talk || 'down'}`;
      trigger.replaceWith(wrap);

      const menu = document.createElement('div');
      menu.className = 'talk__menu';
      menu.id = `talk-menu-${index}`;
      menu.setAttribute('role', 'menu');
      menu.setAttribute('aria-label', 'Contact options');
      menu.innerHTML = options.map((o) => `
        <a class="talk__item" role="menuitem" tabindex="-1" href="${o.href}"${o.external ? ' target="_blank" rel="noopener"' : ''}>
          <span class="talk__icon">${ICONS[o.icon]}</span>
          <span class="talk__text"><b>${o.label}</b><small>${o.hint}</small></span>
          <span class="talk__go" aria-hidden="true">${o.external ? '↗' : '→'}</span>
        </a>`).join('');
      wrap.append(trigger, menu);

      trigger.setAttribute('role', 'button');
      trigger.setAttribute('aria-haspopup', 'menu');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-controls', menu.id);
      const items = $$('.talk__item', menu);

      const open = (focusIndex) => {
        close(false);
        openWrap = wrap;
        wrap.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        if (focusIndex !== undefined) items[focusIndex].focus();
      };

      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        // e.detail === 0 means the click came from the keyboard, so move focus into the menu.
        if (openWrap === wrap) close(false); else open(e.detail === 0 ? 0 : undefined);
      });
      trigger.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); open(0); }
        if (e.key === 'ArrowUp') { e.preventDefault(); open(items.length - 1); }
      });
      menu.addEventListener('keydown', (e) => {
        const current = items.indexOf(document.activeElement);
        const move = { ArrowDown: current + 1, ArrowUp: current - 1, Home: 0, End: items.length - 1 }[e.key];
        if (move !== undefined) { e.preventDefault(); items[(move + items.length) % items.length].focus(); }
        if (e.key === 'Tab') close(false);
      });
      menu.addEventListener('click', (e) => { if (e.target.closest('.talk__item')) close(false); });
    });

    document.addEventListener('pointerdown', (e) => { if (openWrap && !openWrap.contains(e.target)) close(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && openWrap) { e.stopPropagation(); close(true); } }, true);
  }

  /* ── Design philosophy: scroll-linked Venn ────────────────────────────
     --v goes 0 → 1 as the diagram rises from the bottom of the viewport to
     roughly its middle; CSS turns that into the circles converging. */
  function initVenn() {
    const venn = $('.venn');
    if (!venn || reducedMotion.matches || !('IntersectionObserver' in window)) return; // CSS default = finished diagram
    let frame = 0;
    let visible = false;

    const update = () => {
      frame = 0;
      const rect = venn.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.95;                    // top edge enters near the bottom
      const end = vh * 0.5 - rect.height * 0.35;  // fully merged a little before centre
      const v = smoothstep(clamp((start - rect.top) / (start - end)));
      const next = v.toFixed(3);
      if (venn.style.getPropertyValue('--v') !== next) venn.style.setProperty('--v', next);
      venn.classList.toggle('is-merged', v > 0.995);
    };
    const requestUpdate = () => { if (visible && !frame) frame = requestAnimationFrame(update); };

    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; requestUpdate(); }, { rootMargin: '15% 0px' }).observe(venn);
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    update();
  }

  initContact();
  initVenn();
  initNav();
  initReveal();
  initMarquee();
  initProjectFocus();
  initStory();
})();
