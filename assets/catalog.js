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
  // Category navigation always reveals its destination, including after a search.
  document.querySelectorAll('.pp-categories a,.pp-browse,.category-rail a,a[href="#catalog"]').forEach(link => {
    link.addEventListener('click', () => {
      search.value = '';
      const destination = link.getAttribute?.('href')?.split('#')[1];
      const interest = document.getElementById(destination)?.dataset?.catalogCategory;
      if (category) category.value = interest || '';
      filterCatalog();
    });
  });
  document.querySelectorAll('[data-catalog-category]').forEach(link => {
    if (link.dataset?.catalogCategory === undefined) return;
    link.addEventListener('click', () => { search.value = ''; if (category) category.value = link.dataset.catalogCategory; filterCatalog(); });
  });
  if (category && typeof location !== 'undefined') category.value = document.getElementById(location.hash.slice(1))?.dataset?.catalogCategory || '';
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
