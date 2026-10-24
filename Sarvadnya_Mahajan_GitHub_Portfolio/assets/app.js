(() => {
  'use strict';
  const root = document.documentElement;
  const themeButton = document.querySelector('[data-theme-toggle]');
  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    if (themeButton) {
      const label = theme === 'dark' ? 'Switch to daylight theme' : 'Switch to lamplight theme';
      themeButton.setAttribute('aria-label', label);
      themeButton.title = label;
      themeButton.setAttribute('aria-pressed', String(theme === 'dark'));
    }
  };
  applyTheme(root.dataset.theme || 'light');
  themeButton?.addEventListener('click', () => {
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(theme);
    try { localStorage.setItem('sm-journal-theme', theme); } catch (_) { /* Theme still works without storage. */ }
  });

  const toast = document.querySelector('[data-toast]');
  let toastTimer;
  const announce = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 3000);
  };
  document.querySelector('[data-copy-email]')?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText('sm2992@cornell.edu'); announce('Email address copied'); }
    catch (_) { announce('Email: sm2992@cornell.edu'); }
  });

  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('[data-category]')];
  filterButtons.forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    let visible = 0;
    cards.forEach(card => {
      card.hidden = filter !== 'all' && !card.dataset.category.split(' ').includes(filter);
      if (!card.hidden) visible++;
    });
    const count = document.querySelector('[data-work-count]');
    if (count) count.textContent = `${String(visible).padStart(2, '0')} ${visible === 1 ? 'case study' : 'case studies'}`;
  }));

  const stepTabs = [...document.querySelectorAll('[data-step]')];
  const selectStep = (tab, focus = false) => {
    stepTabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(item.getAttribute('aria-controls'));
      if (panel) panel.hidden = !selected;
    });
    if (focus) tab.focus();
  };
  stepTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectStep(tab));
    tab.addEventListener('keydown', e => {
      let next;
      if (e.key === 'ArrowRight') next = (index + 1) % stepTabs.length;
      if (e.key === 'ArrowLeft') next = (index - 1 + stepTabs.length) % stepTabs.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = stepTabs.length - 1;
      if (next !== undefined) { e.preventDefault(); selectStep(stepTabs[next], true); }
    });
  });

  const calculator = document.querySelector('[data-calculator]');
  if (calculator) {
    const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
    const number = value => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
    const inputs = Object.fromEntries([...calculator.querySelectorAll('input')].map(input => [input.name, input]));
    const defaults = { budget: 25000, cpl: 50, conversion: 6, value: 1000 };
    const write = (key, value) => { const el = calculator.querySelector(`[data-output="${key}"]`); if (el) el.textContent = value; };
    const update = () => {
      const budget = Number(inputs.budget.value);
      const cpl = Number(inputs.cpl.value);
      const conversion = Number(inputs.conversion.value);
      const value = Number(inputs.value.value);
      const leads = budget / cpl;
      const customers = leads * conversion / 100;
      const revenue = customers * value;
      const roas = revenue / budget;
      write('budget-label', money(budget));
      write('cpl-label', money(cpl));
      write('conversion-label', `${conversion}%`);
      write('value-label', money(value));
      write('leads', number(leads));
      write('customers', number(customers));
      write('revenue', money(revenue));
      write('roas', `${roas.toFixed(2)}×`);
      write('leads-bar', number(leads));
      write('customers-bar', number(customers));
      const fill = calculator.querySelector('[data-conversion-bar]');
      if (fill) fill.style.width = `${conversion}%`;
      const note = calculator.querySelector('[data-scenario-note]');
      if (note) note.textContent = `At ${conversion}% lead-to-customer conversion, ${money(budget)} in media spend models ${money(revenue)} in revenue. Revenue less media spend is ${money(revenue - budget)}, before other costs.`;
    };
    Object.values(inputs).forEach(input => input.addEventListener('input', update));
    calculator.querySelector('[data-reset-calculator]')?.addEventListener('click', () => {
      Object.entries(defaults).forEach(([key, value]) => { inputs[key].value = value; });
      update(); announce('Planning assumptions reset');
    });
    update();
  }

  const chapterLinks = [...document.querySelectorAll('.chapter-tabs a')];
  if (chapterLinks.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) chapterLinks.forEach(link => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          if (active) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-8% 0px -65% 0px', threshold: 0 });
    document.querySelectorAll('main>section[id]').forEach(section => observer.observe(section));
  }
})();
