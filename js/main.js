(() => {
  'use strict';

  document.documentElement.classList.add('js');

  const header = document.querySelector('.header');
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('menuToggle');
  const stickyCta = document.getElementById('stickyCta');
  const hero = document.querySelector('.hero');
  const cta = document.getElementById('cta');

  // ----- Mobile menu -----
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  };
  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // ----- Header shadow -----
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ----- Sticky CTA: show after hero, hide over the CTA section -----
  if ('IntersectionObserver' in window) {
    let heroVisible = true;
    let ctaVisible = false;
    const update = () => stickyCta.classList.toggle('is-visible', !heroVisible && !ctaVisible);
    new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; update(); }).observe(hero);
    new IntersectionObserver(([e]) => { ctaVisible = e.isIntersecting; update(); }).observe(cta);
  }

  // ----- Reveal on scroll -----
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const siblings = [...entry.target.parentElement.children];
        entry.target.style.transitionDelay = `${siblings.indexOf(entry.target) * 100}ms`;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  // ----- Count-up stats -----
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const format = (n, decimals) => n.toLocaleString('ja-JP', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const countUp = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = format(target, decimals) + suffix; return; }
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(target * eased, decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        countUp(entry.target);
        cio.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach(countUp);
  }

  // ----- Pricing billing toggle -----
  const billingButtons = document.querySelectorAll('[data-billing]');
  billingButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cycle = btn.dataset.billing;
      billingButtons.forEach((b) => b.classList.toggle('is-active', b === btn));
      document.querySelectorAll('.plan .amount').forEach((el) => {
        el.textContent = Number(el.dataset[cycle]).toLocaleString('ja-JP');
      });
    });
  });

  // ----- Signup form (demo) -----
  const form = document.getElementById('signupForm');
  const msg = document.getElementById('formMsg');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msg.textContent = '正しいメールアドレスを入力してください。';
      form.email.focus();
      return;
    }
    // TODO: 実際の登録APIに接続する
    msg.textContent = 'ありがとうございます！確認メールを送信しました。';
    form.reset();
  });

  // ----- Footer year -----
  document.getElementById('year').textContent = new Date().getFullYear();
})();
