// Application data
const appData = {
  brand: {
    name: "MOREOVER",
    tagline: "Minimalist Fashion, Maximum Style",
    description: "Curated collection of minimalist clothing for the modern individual"
  },
  products: [],
  collections: [
    {
      name: "Anime",
      description: "Anime-inspired streetwear and essentials",
      image: "https://images.unsplash.com/photo-1705831156575-a5294d295a31?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWFuZ2F8ZW58MHx8MHx8fDA%3D"
    },
    {
      name: "F1",
      description: "Formula 1 racing inspired apparel",
      image: "https://images.unsplash.com/photo-1610905376670-5e7e0e8a3cfb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzZ8fEYxfGVufDB8fDB8fHww"
    },
    {
      name: "Harry Potter",
      description: "Wizarding world themed fashion",
      image: "https://images.unsplash.com/photo-1475353152807-97f4e3315977?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGhhcnJ5JTIwcG90dGVyfGVufDB8fDB8fHww"
    }
  ]
};

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmpc1pHsRSfpXI_EzQbRKsPq8-0_SZeTM",
  authDomain: "moreover-lookbook.firebaseapp.com",
  projectId: "moreover-lookbook",
  storageBucket: "moreover-lookbook.firebasestorage.app",
  messagingSenderId: "419804049795",
  appId: "1:419804049795:web:0e2dccfe9fa2217f16c6b6"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Fetch products from Firestore
async function fetchProductsFromFirestore() {
  try {
    const snapshot = await db.collection("products").get();
    appData.products = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        price: data.price,
        images: data.images,
        soldcount: data.soldcount,
        launchdate: data.launchdate,
        tag: data.tag,
        collection: data.collection
      };
    });
    filteredProducts = [...appData.products];
    // After fetching, load the current page
    if (currentPage === 'home') loadHomePage();
    if (currentPage === 'explore') loadExplorePage();
  } catch (error) {
    console.error('Error fetching products from Firestore:', error);
  }
}

// Application state
let currentPage = 'home';
let cart = [];
let currentProduct = null;
let filteredProducts = [];

// DOM elements - Initialize after DOM is loaded
let pages, navLinks, cartBtn, cartModal, cartCount, searchInput, categoryFilter, sortFilter;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  // Initialize DOM elements
  pages = document.querySelectorAll('.page');
  navLinks = document.querySelectorAll('.nav-link');
  cartBtn = document.getElementById('cartBtn');
  cartModal = document.getElementById('cartModal');
  cartCount = document.querySelector('.cart-count');
  searchInput = document.getElementById('searchInput');
  categoryFilter = document.getElementById('categoryFilter');
  sortFilter = document.getElementById('sortFilter');
  
  // Ensure modal is hidden on load
  if (cartModal) {
    cartModal.classList.add('hidden');
    cartModal.style.display = 'none';
  }
  
  // Initialize functionality
  initNavigation();
  initCart();
  initSearch();
  // Fetch products from Firestore and then load home page
  fetchProductsFromFirestore();
  updateCartCount();
  // Add click event to logo to go to home page
  const logo = document.querySelector('.nav-logo h1');
  if (logo) {
    logo.style.cursor = 'pointer';
    logo.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      navigateToPage('home');
    });
  }

  // Ensure address modal is hidden on load
  const addressModal = document.getElementById('addressModal');
  if (addressModal) {
    addressModal.classList.add('hidden');
    addressModal.style.display = 'none';
  }
});

// Navigation functionality
function initNavigation() {
  // Handle navigation clicks
  if (navLinks) {
    navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const page = this.dataset.page;
        if (page) {
          navigateToPage(page);
        }
      });
    });
  }

  // Handle hero CTA button
  const heroBtn = document.querySelector('.hero-content .btn');
  if (heroBtn) {
    heroBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      navigateToPage('explore');
    });
  }
}

function navigateToPage(page) {
  // Always scroll to top when navigating
  window.scrollTo(0, 0);
  // Update active nav link
  if (navLinks) {
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.dataset.page === page) {
        link.classList.add('active');
      }
    });
  }

  // Hide all pages
  if (pages) {
    pages.forEach(pageEl => {
      pageEl.classList.add('hidden');
    });
  }

  // Show target page
  const targetPage = document.getElementById(page + '-page');
  if (targetPage) {
    targetPage.classList.remove('hidden');
    currentPage = page;

    // Load page content
    if (page === 'home') {
      loadHomePage();
    } else if (page === 'explore') {
      loadExplorePage();
    } else if (page === 'collections') {
      loadCollectionsPage();
    }
  }
}

// Home page functionality
function loadHomePage() {
  loadNewArrivals();
  loadMostPopular();
  loadTrending();
  loadCollections();
}

function loadNewArrivals() {
  const container = document.getElementById('newArrivals');
  if (container) {
    const now = new Date();
    const newProducts = appData.products.filter(product => {
      if (!product.launchdate) return false;
      const launch = product.launchdate.toDate ? product.launchdate.toDate() : new Date(product.launchdate);
      return (now - launch) / (1000 * 60 * 60 * 24) <= 30; // last 30 days
    });
    renderProductGrid(container, newProducts);
  }
}

function loadMostPopular() {
  const container = document.getElementById('mostPopular');
  if (container) {
    const popularProducts = [...appData.products]
      .sort((a, b) => (b.soldcount || 0) - (a.soldcount || 0))
      .slice(0, 8); // top 8
    renderProductGrid(container, popularProducts);
  }
}

function loadTrending() {
  const container = document.getElementById('trending');
  if (container) {
    const trendingProducts = [...appData.products]
      .filter(product => {
        if (!product.launchdate) return false;
        const launch = product.launchdate.toDate ? product.launchdate.toDate() : new Date(product.launchdate);
        return (new Date() - launch) / (1000 * 60 * 60 * 24) <= 60; // last 60 days
      })
      .sort((a, b) => (b.soldcount || 0) - (a.soldcount || 0))
      .slice(0, 8);
    renderProductGrid(container, trendingProducts);
  }
}

function loadCollections() {
  const container = document.getElementById('collections');
  if (container) {
    container.innerHTML = '';
    appData.collections.forEach(collection => {
      const collectionCard = createCollectionCard(collection);
      container.appendChild(collectionCard);
    });
  }
}

function createCollectionCard(collection) {
  const card = document.createElement('div');
  card.className = 'collection-card';
  card.innerHTML = `
    <div class="collection-image">
      <img src="${collection.image}" alt="${collection.name}">
    </div>
    <div class="collection-info">
      <h3 class="collection-name">${collection.name}</h3>
      <p class="collection-description">${collection.description}</p>
    </div>
  `;
  return card;
}

// Explore page functionality
function loadExplorePage() {
  const container = document.getElementById('allProducts');
  if (container) {
    renderProductGrid(container, filteredProducts);
  }
}

function initSearch() {
  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      filterProducts();
    });
  }

  // Category filter
  if (categoryFilter) {
    categoryFilter.addEventListener('change', function() {
      filterProducts();
    });
  }

  // Sort filter
  if (sortFilter) {
    sortFilter.addEventListener('change', function() {
      filterProducts();
    });
  }
}

function filterProducts() {
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
  const selectedCategory = categoryFilter ? categoryFilter.value : '';
  const sortBy = sortFilter ? sortFilter.value : 'featured';

  // Filter products
  filteredProducts = appData.products.filter(product => {
    const matchesSearch = (product.title?.toLowerCase().includes(searchTerm) || "") ||
                         (product.collection?.toLowerCase().includes(searchTerm) || "");
    const matchesCategory = !selectedCategory || product.collection === selectedCategory || product.tag === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort products
  sortProducts(filteredProducts, sortBy);

  // Update display
  if (currentPage === 'explore') {
    const container = document.getElementById('allProducts');
    if (container) {
      renderProductGrid(container, filteredProducts);
    }
  }
}

function sortProducts(products, sortBy) {
  switch (sortBy) {
    case 'price-low':
      products.sort((a, b) => (a.price || 0) - (b.price || 0));
      break;
    case 'price-high':
      products.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
    case 'newest':
      products.sort((a, b) => {
        const aDate = a.launchdate?.toDate ? a.launchdate.toDate() : new Date(a.launchdate);
        const bDate = b.launchdate?.toDate ? b.launchdate.toDate() : new Date(b.launchdate);
        return bDate - aDate;
      });
      break;
    case 'popular':
      products.sort((a, b) => (b.soldcount || 0) - (a.soldcount || 0));
      break;
    default:
      // Keep original order for featured
      break;
  }
}

// Product display functionality
function renderProductGrid(container, products) {
  if (!container) return;
  container.innerHTML = '';
  products.forEach(product => {
    const productCard = createProductCard(product);
    container.appendChild(productCard);
  });
}

function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.dataset.productId = product.id;
  
  // Badges based on launchdate and soldcount
  const badges = [];
  // New: launched in last 30 days
  if (product.launchdate) {
    const launch = product.launchdate.toDate ? product.launchdate.toDate() : new Date(product.launchdate);
    if ((new Date() - launch) / (1000 * 60 * 60 * 24) <= 30) {
      badges.push('<span class="badge badge--new">New</span>');
    }
  }
  // Popular: top 8 by soldcount
  // We'll add badge if soldcount is in top 8
  const sortedBySold = [...appData.products].sort((a, b) => (b.soldcount || 0) - (a.soldcount || 0));
  if (sortedBySold.slice(0, 8).find(p => p.id === product.id)) {
    badges.push('<span class="badge badge--popular">Popular</span>');
  }
  // Trending: launched in last 60 days and high soldcount
  if (product.launchdate) {
    const launch = product.launchdate.toDate ? product.launchdate.toDate() : new Date(product.launchdate);
    if ((new Date() - launch) / (1000 * 60 * 60 * 24) <= 60 && (product.soldcount || 0) > 0) {
      badges.push('<span class="badge badge--trending">Trending</span>');
    }
  }
  
  card.innerHTML = `
    <div class="product-image">
      <img src="${product.images && product.images.length > 0 ? product.images[0] : ''}" alt="${product.title}">
      ${badges.length > 0 ? `<div class="product-badges">${badges.join('')}</div>` : ''}
    </div>
    <div class="product-info">
      <h3 class="product-name">${product.title}</h3>
      <p class="product-price">₹${Number(product.price).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
      <p class="product-category">${product.collection || product.tag || ''}</p>
    </div>
  `;
  
  // Add click handler directly to the card
  card.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    const productId = this.dataset.productId;
    showProductDetails(productId);
  });
  
  return card;
}

// Product details functionality
function showProductDetails(productId) {
  const product = appData.products.find(p => p.id === productId);
  if (!product) return;
  currentProduct = product;
  
  // Update product details
  const productImage = document.getElementById('productImage');
  const productName = document.getElementById('productName');
  const productPrice = document.getElementById('productPrice');
  const productDescription = document.getElementById('productDescription');
  
  if (productImage) {
    productImage.src = product.images && product.images.length > 0 ? product.images[0] : '';
    productImage.alt = product.title;
  }
  if (productName) productName.textContent = product.title;
  if (productPrice) productPrice.textContent = `₹${Number(product.price).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  if (productDescription) productDescription.textContent = product.description;
  
  // Update size options (not in Firestore, so use default)
  const sizeSelect = document.getElementById('sizeSelect');
  if (sizeSelect) {
    sizeSelect.innerHTML = '';
    // Example sizes
    ["XS", "S", "M", "L", "XL"].forEach(size => {
      const option = document.createElement('option');
      option.value = size;
      option.textContent = size;
      sizeSelect.appendChild(option);
    });
  }
  
  // Update color options (not in Firestore, so use default)
  const colorOptions = document.getElementById('colorOptions');
  if (colorOptions) {
    colorOptions.innerHTML = '';
    // Example colors
    ["Black", "White", "Lavender"].forEach((color, index) => {
      const colorOption = document.createElement('div');
      colorOption.className = `color-option ${index === 0 ? 'selected' : ''}`;
      colorOption.style.backgroundColor = getColorValue(color);
      colorOption.dataset.color = color;
      colorOption.title = color;
      colorOptions.appendChild(colorOption);
    });
    // Add color selection functionality
    /*colorOptions.addEventListener('click', function(e) {
      if (e.target.classList.contains('color-option')) {
        colorOptions.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
        e.target.classList.add('selected');
      }
    });*/
  }
  
  // Update specifications
  const specs = document.getElementById('productSpecs');
  if (specs) {
    specs.innerHTML = `
      <li><strong>Collection:</strong> ${product.collection || ''}</li>
      <li><strong>Tag:</strong> ${product.tag || ''}</li>
      <li><strong>Launch Date:</strong> ${product.launchdate?.toDate ? product.launchdate.toDate().toLocaleDateString() : new Date(product.launchdate).toLocaleDateString()}</li>
      <li><strong>Sold Count:</strong> ${product.soldcount || 0}</li>
    `;
  }
  
  // Load related products
  loadRelatedProducts(product);
  
  // Show product page
  if (pages) {
    pages.forEach(page => page.classList.add('hidden'));
  }
  const productPage = document.getElementById('product-page');
  if (productPage) {
    productPage.classList.remove('hidden');
  }
  currentPage = 'product';
  
  // Update nav
  if (navLinks) {
    navLinks.forEach(link => link.classList.remove('active'));
  }
  
  // Initialize add to cart button for this product
  const addToCartBtn = document.getElementById('addToCartBtn');
  if (addToCartBtn) {
    // Remove existing listeners
    addToCartBtn.onclick = null;
    // Add new listener
    addToCartBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      addToCart();
    });
  }
  // Initialize buy now button for this product
  const buyNowBtn = document.getElementById('buyNowBtn');
  if (buyNowBtn) {
    buyNowBtn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      // Show address modal
      const addressModal = document.getElementById('addressModal');
      if (addressModal) {
        addressModal.classList.remove('hidden');
        addressModal.style.display = 'flex';
      }
    };
  }

  // Modal close logic
  const addressModal = document.getElementById('addressModal');
  const closeAddressModal = document.getElementById('closeAddressModal');
  if (closeAddressModal && addressModal) {
    closeAddressModal.onclick = function() {
      addressModal.classList.add('hidden');
      addressModal.style.display = 'none';
    };
  }

  // Form submit logic
  const addressForm = document.getElementById('addressForm');
  if (addressForm) {
    addressForm.onsubmit = function(e) {
      e.preventDefault();
      // Get form values
      const name = document.getElementById('userName').value.trim();
      const phoneInput = document.getElementById('userPhone').value.trim();
      const email = document.getElementById('userEmail').value.trim();
      const address = document.getElementById('userAddress').value.trim();
      const city = document.getElementById('userCity').value.trim();
      const state = document.getElementById('userState').value.trim();
      const pin = document.getElementById('userPin').value.trim();
      // Get selected size
      const sizeSelect = document.getElementById('sizeSelect');
      const selectedSize = sizeSelect ? sizeSelect.value : '';
      // WhatsApp message
      const message = encodeURIComponent(
        `Hi, I'm interested in buying: *${currentProduct.title}*\n` +
        `*Size:* ${selectedSize}\n` +
        `*Price:* ${currentProduct.price}\n` +
        `*Name:* ${name}\n` +
        `*Phone:* ${phoneInput}\n` +
        `*Email:* ${email}\n` +
        `*Address:* ${address}\n` +
        `*City:* ${city}\n` +
        `*State:* ${state}\n` +
        `*Pin Code:* ${pin}`
      );
      const phone = '919425087686'; // Your WhatsApp number
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
      // Close modal
      addressModal.classList.add('hidden');
      addressModal.style.display = 'none';
      addressForm.reset();
    };
  }
  // Scroll to top after rendering
  setTimeout(() => { window.scrollTo(0, 0); }, 0);
}

function getColorValue(colorName) {
  const colorMap = {
    'Black': '#000000',
    'White': '#FFFFFF',
    'Lavender': '#B19CD9',
    'Charcoal': '#36454F',
    'Cream': '#F5F5DC',
    'Indigo': '#4B0082',
    'Light Wash': '#B0C4DE',
    'Navy': '#000080',
    'Tan': '#D2B48C'
  };
  return colorMap[colorName] || '#CCCCCC';
}

function loadRelatedProducts(currentProduct) {
  const relatedProducts = appData.products
    .filter(p => p.id !== currentProduct.id && p.collection === currentProduct.collection)
    .slice(0, 3);
  
  const container = document.getElementById('relatedProducts');
  if (container) {
    renderProductGrid(container, relatedProducts);
  }
}

// Cart functionality
function initCart() {
  // Cart modal
  if (cartBtn) {
    cartBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      showCartModal();
    });
  }

  // Close cart modal - multiple ways
  const closeCart1 = document.getElementById('closeCart');
  const closeCart2 = document.getElementById('closeCart2');
  
  if (closeCart1) {
    closeCart1.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      closeCartModal();
    });
  }
  
  if (closeCart2) {
    closeCart2.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      closeCartModal();
    });
  }
  
  // Close modal when clicking outside
  if (cartModal) {
    cartModal.addEventListener('click', function(e) {
      if (e.target === cartModal) {
        closeCartModal();
      }
    });
  }

  // Add checkout button functionality
  setTimeout(() => {
    const checkoutBtn = document.querySelector('.modal-footer .btn--primary');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (cart.length === 0) {
          alert('Your cart is empty!');
          return;
        }
        alert('Thank you for your purchase! This is a demo checkout.');
        cart = [];
        updateCartCount();
        closeCartModal();
      });
    }
  }, 100);
}

function addToCart() {
  if (!currentProduct) return;

  const sizeSelect = document.getElementById('sizeSelect');
  const selectedColorEl = document.querySelector('.color-option.selected');
  
  const selectedSize = sizeSelect ? sizeSelect.value : '';
  const selectedColor = selectedColorEl ? selectedColorEl.dataset.color : '';
  
  if (!selectedSize || !selectedColor) {
    alert('Please select size and color');
    return;
  }

  const cartItem = {
    id: currentProduct.id,
    name: currentProduct.title,
    price: currentProduct.price,
    image: currentProduct.images && currentProduct.images.length > 0 ? currentProduct.images[0] : '',
    size: selectedSize,
    color: selectedColor,
    quantity: 1
  };

  // Check if item already exists in cart
  const existingItem = cart.find(item => 
    item.id === cartItem.id && 
    item.size === cartItem.size && 
    item.color === cartItem.color
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push(cartItem);
  }

  updateCartCount();
  showCartModal();
}

function showCartModal() {
  updateCartDisplay();
  if (cartModal) {
    cartModal.classList.remove('hidden');
    cartModal.style.display = 'flex';
  }
}

function closeCartModal() {
  if (cartModal) {
    cartModal.classList.add('hidden');
    cartModal.style.display = 'none';
  }
}

function updateCartDisplay() {
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  
  if (!cartItems || !cartTotal) return;
  
  if (cart.length === 0) {
    cartItems.innerHTML = '<p style="text-align: center; color: var(--color-text-muted); padding: 20px;">Your cart is empty</p>';
    cartTotal.textContent = '0.00';
    return;
  }

  cartItems.innerHTML = '';
  let total = 0;

  cart.forEach((item, index) => {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-details">${item.size} | ${item.color} | Qty: ${item.quantity}</div>
      </div>
      <div class="cart-item-price">₹${(item.price * item.quantity).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
      <button class="btn btn--secondary btn--sm remove-item" data-index="${index}">Remove</button>
    `;
    
    // Add remove button functionality
    const removeBtn = cartItem.querySelector('.remove-item');
    if (removeBtn) {
      removeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const index = parseInt(this.dataset.index);
        removeFromCart(index);
      });
    }
    
    cartItems.appendChild(cartItem);
    total += item.price * item.quantity;
  });

  cartTotal.textContent = total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartCount();
  updateCartDisplay();
}

function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCount) {
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}

// Newsletter functionality
document.addEventListener('DOMContentLoaded', function() {
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = this.querySelector('input[type="email"]').value;
      if (email) {
        alert('Thank you for subscribing to our newsletter!');
        this.reset();
      }
    });
  }
});

// Search button functionality
document.addEventListener('DOMContentLoaded', function() {
  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      navigateToPage('explore');
      setTimeout(() => {
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    });
  }
});

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeCartModal();
  }
});

// Add error handling
window.addEventListener('error', function(e) {
  console.error('Application error:', e.error);
});

// Final initialization
window.addEventListener('load', function() {
  // Ensure modal is hidden
  if (cartModal) {
    cartModal.classList.add('hidden');
    cartModal.style.display = 'none';
  }
  
  // Load initial content
  if (currentPage === 'home') {
    loadHomePage();
  }
  updateCartCount();
});

// --- Collections Page Logic ---
function loadCollectionsPage() {
  const collectionsList = document.getElementById('collectionsList');
  const collectionProductsSection = document.getElementById('collectionProductsSection');
  const selectedCollectionTitle = document.getElementById('selectedCollectionTitle');
  const collectionProducts = document.getElementById('collectionProducts');
  const backToCollectionsBtn = document.getElementById('backToCollectionsBtn');

  // Show collections list, hide products section
  if (collectionsList) collectionsList.innerHTML = '';
  if (collectionProductsSection) collectionProductsSection.classList.add('hidden');
  if (collectionsList) collectionsList.parentElement.classList.remove('hidden');

  // Render collection cards
  appData.collections.forEach(collection => {
    const card = createCollectionCard(collection);
    card.style.cursor = 'pointer';
    card.addEventListener('click', function() {
      // Show products for this collection
      showCollectionProducts(collection.name);
    });
    collectionsList.appendChild(card);
  });

  // Back button
  if (backToCollectionsBtn) {
    backToCollectionsBtn.onclick = function() {
      if (collectionProductsSection) collectionProductsSection.classList.add('hidden');
      if (collectionsList) collectionsList.parentElement.classList.remove('hidden');
    };
  }
}

function showCollectionProducts(collectionName) {
  const collectionsList = document.getElementById('collectionsList');
  const collectionProductsSection = document.getElementById('collectionProductsSection');
  const selectedCollectionTitle = document.getElementById('selectedCollectionTitle');
  const collectionProducts = document.getElementById('collectionProducts');

  // Hide collections list, show products section
  if (collectionsList) collectionsList.parentElement.classList.add('hidden');
  if (collectionProductsSection) collectionProductsSection.classList.remove('hidden');

  // Set title
  if (selectedCollectionTitle) selectedCollectionTitle.textContent = collectionName;

  // Filter products by collection
  const products = appData.products.filter(p => p.collection === collectionName);
  if (collectionProducts) renderProductGrid(collectionProducts, products);
}