'use strict';
const search = document.getElementById('catalog-search');
const category = document.getElementById('catalog-category');
const cards = Array.from(document.querySelectorAll('[data-product]'));
const clear = document.getElementById('catalog-clear');
const searchText = text => text.toLocaleLowerCase().replace(/\b([a-z]{4,})s\b/g, '$1');
function filterCatalog() {
  const query = searchText(search.value.trim());
  let count = 0;
  cards.forEach(card => {
    const matches = (!category || !category.value || card.dataset.category === category.value) && searchText(`${card.dataset.category} ${card.textContent}`).includes(query);
    card.hidden = !matches;
    if (matches) count++;
  });
  document.getElementById('catalog-results').textContent = `${count} of ${cards.length} products`;
  document.getElementById('catalog-empty').hidden = count > 0;
  if (clear) clear.hidden = !query && (!category || !category.value);
  document.querySelectorAll('[data-catalog-category]').forEach(link => {
    if (link.dataset?.catalogCategory !== undefined) link.setAttribute('aria-current', String(link.dataset.catalogCategory === (category?.value || '')));
  });
  document.querySelectorAll('[data-product-section]').forEach(section => {
    section.hidden = !Array.from(section.querySelectorAll('[data-product]')).some(card => !card.hidden);
  });
}
if (search) {
  search.addEventListener('input', filterCatalog);
  if (category) category.addEventListener('change', filterCatalog);
  if (clear) clear.addEventListener('click', () => { search.value = ''; if (category) category.value = ''; filterCatalog(); search.focus(); });
  const selectInterest = hash => {
    search.value = '';
    if (category) category.value = document.getElementById(hash)?.dataset?.catalogCategory || '';
    filterCatalog();
  };
  // Category navigation always reveals its destination, including after a search.
  document.querySelectorAll('.pp-categories a[href^="/#"],.pp-browse,.category-rail a,a[href="#catalog"],[data-catalog-category]').forEach(link => {
    link.addEventListener('click', event => {
      if (event?.metaKey || event?.ctrlKey || event?.shiftKey || event?.altKey) return;
      selectInterest(link.getAttribute('href').split('#')[1]);
    });
  });
  if (category) {
    const syncHash = () => {
      const hash = location.hash.slice(1);
      if (!hash || hash === 'catalog' || document.getElementById(hash)?.dataset?.catalogCategory) selectInterest(hash);
    };
    window.addEventListener('hashchange', syncHash);
    syncHash();
  }
  filterCatalog();
}
document.querySelectorAll('[data-copy]').forEach(button => {
  button.hidden = false;
  button.addEventListener('click', async () => {
    const status = document.getElementById('copy-status');
    try {
      await navigator.clipboard.writeText(document.getElementById(button.dataset.copy).textContent);
      status.textContent = 'Sample copied.';
      button.dispatchEvent(new CustomEvent('promptpack:copied', {bubbles: true}));
    } catch {
      status.textContent = 'Select the sample text above and copy it manually.';
    }
  });
});
