let allPlants = [];
let cart = [];

// DOM refs
const categoriesContainer = document.getElementById('categories');
const productsGrid       = document.getElementById('products-grid');
const cartItems          = document.getElementById('cart-items');
const cartTotal          = document.getElementById('cart-total');
const loading            = document.getElementById('loading');
const modal              = document.getElementById('treeModal');
const modalTitle         = document.getElementById('modalTitle');
const modalContent       = document.getElementById('modalContent');
const closeModalBtn      = document.getElementById('closeModal');

// API URLs
const API_BASE        = 'https://openapi.programming-hero.com/api';
const PLANTS_API      = `${API_BASE}/plants`;      
const CATEGORIES_API  = `${API_BASE}/categories`;  
const CATEGORY_API    = `${API_BASE}/category`;    
const PLANT_DETAIL_API= `${API_BASE}/plant`;      

//  init
document.addEventListener('DOMContentLoaded', init);

async function init() {
  showLoading();
  await loadCategories();
  await loadAllPlants();
  hideLoading();
}

function showLoading() {
  loading.classList.remove('hidden');
  productsGrid.innerHTML = '';
}
function hideLoading() {
  loading.classList.add('hidden');
}

function money(n) {
  const num = Number(n || 0);
  return `৳${num.toLocaleString('en-BD')}`;
}

/* ========== Fetchers ========== */
async function loadCategories() {
  try {
    const res  = await fetch(CATEGORIES_API);
    const data = await res.json();
    const categories = data?.categories || [];
    renderCategories(categories);
  } catch (err) {
    console.error('Categories load error:', err);
  }
}

async function loadAllPlants() {
  try {
    const res  = await fetch(PLANTS_API);
    const data = await res.json();
    allPlants  = data?.plants || [];
    renderPlants(allPlants);
  } catch (err) {
    console.error('All plants load error:', err);
    productsGrid.innerHTML = `<p class="text-center text-red-500 col-span-full">Couldn't load trees.</p>`;
  }
}

async function loadPlantsByCategory(categoryId) {
  try {
    const res  = await fetch(`${CATEGORY_API}/${categoryId}`);
    const data = await res.json();
    const plants = data?.plants || [];
    renderPlants(plants);
  } catch (err) {
    console.error('Plants by category error:', err);
    productsGrid.innerHTML = `<p class="text-center text-red-500 col-span-full">Couldn't load this category.</p>`;
  }
}

async function openTreeModal(plantId) {
  try {
    const res  = await fetch(`${PLANT_DETAIL_API}/${plantId}`);
    const data = await res.json();
    const plant = data?.plant || data?.plants || null; 

    if (!plant) return;

    modalTitle.textContent = plant.name || 'Tree Details';
    modalContent.innerHTML = `
      <img
        src="${plant.image || 'https://via.placeholder.com/800x500?text=Tree'}"
        alt="${plant.name || 'Tree'}"
        class="w-full h-64 object-cover rounded-lg mb-4"
        onerror="this.src='https://via.placeholder.com/800x500?text=Tree';"
      />
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 class="font-semibold text-gray-700 mb-1">Category</h4>
          <p class="text-gray-600">${plant.category || 'Tree'}</p>
        </div>
        <div>
          <h4 class="font-semibold text-gray-700 mb-1">Price</h4>
          <p class="text-gray-800 text-lg font-bold">${money(plant.price || 500)}</p>
        </div>
      </div>
      <div class="mb-6">
        <h4 class="font-semibold text-gray-700 mb-2">Description</h4>
        <p class="text-gray-600">${plant.description || 'A beautiful tree perfect for your garden.'}</p>
      </div>
      <button data-action="modal-add-cart" data-id="${plant.id}" data-name="${escapeHtml(
        plant.name || 'Tree'
      )}" data-price="${plant.price || 500}"
        class="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700">
        Add to Cart
      </button>
    `;
    modal.classList.remove('hidden');
  } catch (err) {
    console.error('Plant details error:', err);
  }
}

/* ========== Renderers ========== */
function renderCategories(categories) {
  const html = categories
    .map(
      (c) => `
    <button class="category-btn w-full text-left px-4 py-2 rounded text-gray-700 hover:bg-gray-100"
      data-category="${c.id}">
      ${escapeHtml(c.category_name)}
    </button>`
    )
    .join('');
 
  const existing = categoriesContainer.querySelector('.category-btn[data-category="all"]');
  if (existing) {
    existing.insertAdjacentHTML('afterend', html);
  } else {
    categoriesContainer.innerHTML = html;
  }
}

function renderPlants(plants) {
  if (!Array.isArray(plants) || plants.length === 0) {
    productsGrid.innerHTML =
      '<p class="text-center text-gray-500 col-span-full">No trees found.</p>';
    return;
  }

  productsGrid.innerHTML = plants
    .map(
      (p) => `
    <div 
  <div 
  class="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-500 hover:scale-105 hover:shadow-greenGlow opacity-0 animate-fadeIn"
>

    >
      <img
        src="${p.image || 'https://via.placeholder.com/300x200?text=Tree'}"
        alt="${escapeHtml(p.name || 'Tree')}"
        class="w-full h-48 object-cover"
        onerror="this.src='https://via.placeholder.com/300x200?text=Tree';"
      />
      <div class="p-4">
        <h3 class="text-lg font-semibold mb-2 cursor-pointer hover:text-green-600"
            data-action="open-modal" data-id="${p.id}">
          ${escapeHtml(p.name)}
        </h3>
        <p class="text-gray-600 text-sm mb-2 line-clamp-2">
          ${escapeHtml(p.description || 'Beautiful tree for your garden')}
        </p>
        <div class="flex justify-between items-center mb-3">
          <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
            ${escapeHtml(p.category || 'Tree')}
          </span>
          <span class="text-lg font-bold text-gray-800">${money(p.price || 500)}</span>
        </div>
        <button
          data-action="add-to-cart"
          data-id="${p.id}"
          data-name="${escapeHtml(p.name)}"
          data-price="${p.price || 500}"
          class="w-full bg-green-600 text-white py-2 rounded hover:bg-red-400 transition duration-300"
        >
          Add to Cart
        </button>
      </div>
    </div>`
    )
    .join('');
}


/* ========== Cart ========== */
function addToCart(id, name, price) {
  id = Number(id);
  price = Number(price || 0);
  const existing = cart.find((i) => i.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, name, price, quantity: 1 });
  }
  updateCart();
}

function removeFromCart(id) {
  id = Number(id);
  cart = cart.filter((i) => i.id !== id);
  updateCart();
}

function updateCart() {
  if (cart.length === 0) {
    cartItems.innerHTML = `<p class="text-gray-500 text-sm">Your cart is empty</p>`;
    cartTotal.textContent = money(0);
    return;
  }

  cartItems.innerHTML = cart
    .map(
      (i) => `
    <div class="flex justify-between items-center bg-gray-50 p-3 rounded">
      <div>
        <div class="font-medium text-sm">${escapeHtml(i.name)}</div>
        <div class="text-gray-600 text-xs">${money(i.price)} × ${i.quantity}</div>
      </div>
      <button data-action="remove-cart" data-id="${i.id}" class="text-red-500 hover:text-red-700">
        <i class="fas fa-times"></i>
      </button>
    </div>`
    )
    .join('');

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  cartTotal.textContent = money(total);
}

/* ========== Events (Delegation) ========== */

// Category buttons
categoriesContainer.addEventListener('click', async (e) => {
  const btn = e.target.closest('.category-btn');
  if (!btn) return;

  categoriesContainer.querySelectorAll('.category-btn').forEach((b) => {
    b.classList.remove('bg-green-600', 'text-white');
    b.classList.add('text-gray-700', 'hover:bg-gray-100');
  });
  btn.classList.add('bg-green-600', 'text-white');
  btn.classList.remove('text-gray-700', 'hover:bg-gray-100');

  const categoryId = btn.dataset.category;
  showLoading();
  if (categoryId === 'all') {
    await loadAllPlants();
  } else {
    await loadPlantsByCategory(categoryId);
  }
  hideLoading();
});

// Products grid
productsGrid.addEventListener('click', (e) => {
  const open = e.target.closest('[data-action="open-modal"]');
  if (open) {
    const id = Number(open.dataset.id);
    openTreeModal(id);
    return;
  }
  const add = e.target.closest('[data-action="add-to-cart"]');
  if (add) {
    addToCart(add.dataset.id, add.dataset.name, add.dataset.price);
  }
});

// Modal
modal.addEventListener('click', (e) => {
  const add = e.target.closest('[data-action="modal-add-cart"]');
  if (add) {
    addToCart(add.dataset.id, add.dataset.name, add.dataset.price);
    closeModal();
    return;
  }
  if (e.target === modal) closeModal();
});
closeModalBtn.addEventListener('click', closeModal);

//  Cart remove delegation
cartItems.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action="remove-cart"]');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  removeFromCart(id);
});

function closeModal() {
  modal.classList.add('hidden');
}

/* ========== Small Utilities ========== */
function escapeHtml(str = '') {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(str).replace(/[&<>"']/g, (m) => map[m]);
}


  // Toggle Mobile Menu
  const menuBtn = document.getElementById("menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });