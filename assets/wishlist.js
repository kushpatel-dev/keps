// assets/wishlist.js
(function () {
  const STORAGE_KEY = 'my_wishlist_v1';

  function getWishlist() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch(e){ return []; }
  }
  function saveWishlist(list) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }

  function normalizeItem(data){
    return {
      handle: data.productHandle || data.productTitle || '',
      title: data.productTitle || '',
      image: data.productImage || '',
      price: data.productPrice || '',
      url: data.productUrl || ''
    };
  }

  window.toggleWishlistFromBtn = function (btn) {
    const data = btn.dataset || {};
    const item = normalizeItem(data);
    if(!item.handle) return console.warn('Wishlist: no handle/title provided');

    const list = getWishlist();
    const idx = list.findIndex(i => i.handle === item.handle);

    if (idx === -1) {
      list.push(item);
      saveWishlist(list);
      btn.classList.add('in-wishlist');
      btn.querySelector('.wishlist_text')?.textContent = 'In Your Wishlist';
    } else {
      list.splice(idx, 1);
      saveWishlist(list);
      btn.classList.remove('in-wishlist');
      btn.querySelector('.wishlist_text')?.textContent = 'Not In Wishlist';
    }
    renderAllWishlistBlocks();
  };

  window.removeFromWishlist = function (handle) {
    let list = getWishlist();
    list = list.filter(i => i.handle !== handle);
    saveWishlist(list);
    renderAllWishlistBlocks();
    // update buttons on PDP if present
    document.querySelectorAll('.wishlist_button[data-product-handle="' + handle + '"]').forEach(b => {
      b.classList.remove('in-wishlist');
      b.querySelector('.wishlist_text')?.textContent = 'Not In Wishlist';
    });
  };

  function renderAllWishlistBlocks() {
    document.querySelectorAll('.js-wishlistBlock').forEach(renderWishlistBlock);
  }

  function escapeAttr(s) {
    return String(s || '').replace(/"/g, '&quot;').replace(/'/g, "\\'");
  }

  function renderWishlistBlock(el) {
    const list = getWishlist();
    if (!list || list.length === 0) {
      el.innerHTML = '<p class="wishlist-empty">Your wishlist is empty.</p>';
      return;
    }

    const html = list.map(item => `
      <div class="wishlist-item" data-handle="${escapeAttr(item.handle)}">
        <a class="wishlist-item__media" href="${item.url}">
          <img src="${item.image}" alt="${escapeAttr(item.title)}" />
        </a>
        <div class="wishlist-item__meta">
          <a class="wishlist-item__title" href="${item.url}">${item.title}</a>
          <div class="wishlist-item__price">${item.price}</div>
          <button type="button" class="wishlist-remove" onclick="removeFromWishlist('${escapeAttr(item.handle)}')">Remove</button>
        </div>
      </div>
    `).join('');

    el.innerHTML = html;
  }

  function initButtons() {
    document.querySelectorAll('.wishlist_button').forEach(btn => {
      const handle = btn.dataset.productHandle || btn.dataset.productTitle || '';
      const list = getWishlist();
      const exists = list.some(i => i.handle === handle);
      if (exists) {
        btn.classList.add('in-wishlist');
        btn.querySelector('.wishlist_text')?.textContent = 'In Your Wishlist';
      } else {
        btn.classList.remove('in-wishlist');
        btn.querySelector('.wishlist_text')?.textContent = 'Not In Wishlist';
      }
      if (!btn.onclick) {
        btn.addEventListener('click', function () { window.toggleWishlistFromBtn(btn); });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderAllWishlistBlocks();
    initButtons();
  });
})();
