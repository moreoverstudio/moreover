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

// Application state
let cart = [];
let currentProduct = null;
let filteredProducts = [];

// DOM elements - Initialize after DOM is loaded
let cartBtn, cartModal, cartCount, searchInput, categoryFilter, sortFilter;

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
        collection: data.collection,
        mrp: data.mrp
      };
    });
    filteredProducts = [...appData.products];
    
    // Load content based on current page
    const currentPage = getCurrentPage();
    if (currentPage === 'home') loadHomePage();
    if (currentPage === 'explore') loadExplorePage();
    if (currentPage === 'collections') loadCollectionsPage();
    if (currentPage === 'product') loadProductPage();
  } catch (error) {
    console.error('Error fetching products from Firestore:', error);
  }
}

// Get current page from URL
function getCurrentPage() {
  const path = window.location.pathname;
  if (path.includes('home.html') || path === '/' || path === '/index.html') return 'home';
  if (path.includes('explore.html')) return 'explore';
  if (path.includes('collections.html')) return 'collections';
  if (path.includes('product.html')) return 'product';
  if (path.includes('about.html')) return 'about';
  if (path.includes('contact.html')) return 'contact';
  return 'home';
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  // Initialize DOM elements
  cartBtn = document.getElementById('cartBtn');
  cartModal = document.getElementById('cartModal');
  cartCount = document.querySelector('.cart-count');
  searchInput = document.getElementById('searchInput');
  categoryFilter = document.getElementById('categoryFilter');
  sortFilter = document.getElementById('sortFilter');
  
  // Ensure modals are hidden on load
  if (cartModal) {
    cartModal.classList.add('hidden');
    cartModal.style.display = 'none';
  }
  
  // Ensure address modal is hidden on load
  const addressModal = document.getElementById('addressModal');
  if (addressModal) {
    addressModal.classList.add('hidden');
    addressModal.style.display = 'none';
  }
  
  // Initialize functionality
  initCart();
  initSearch();
  initAddressModal();
  
  // Initialize size selector for product page
  if (getCurrentPage() === 'product') {
    initSizeSelector();
  }
  
  // Fetch products and load appropriate page
  fetchProductsFromFirestore();
});

// Initialize hero carousel for home page
function initHeroCarousel() {
  const carousel = document.getElementById('heroCarousel');
  const indicators = document.getElementById('heroCarouselIndicators');
  
  if (!carousel || !indicators || !appData.collections) return;
  
  // Use collections data for carousel slides
  const slides = appData.collections.slice(0, 4).map(collection => ({
    image: collection.image,
    title: collection.name,
    subtitle: collection.description,
    collectionName: collection.name
  }));
  
  // Add a default slide if no collections are available
  if (slides.length === 0) {
    slides.push({
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      title: "New Collection",
      subtitle: "Discover the latest trends",
      collectionName: null
    });
  }
  
  let currentSlide = 0;
  let interval;
  
  function renderSlides() {
    carousel.innerHTML = slides.map((slide, idx) => `
      <div class="hero-slide ${idx === 0 ? 'active' : ''}" style="background-image: url('${slide.image}')">
        <div class="hero-content">
          <a href="${slide.collectionName ? `collections.html?collection=${encodeURIComponent(slide.collectionName)}` : 'explore.html'}" class="btn btn--primary">Shop Now</a>
        </div>
      </div>
    `).join('');
    
    indicators.innerHTML = slides.map((_, idx) => `
      <button class="carousel-indicator ${idx === 0 ? 'active' : ''}" onclick="goToSlide(${idx})"></button>
    `).join('');
  }
  
  function goToSlide(idx) {
    const slideElements = carousel.querySelectorAll('.hero-slide');
    const indicatorElements = indicators.querySelectorAll('.carousel-indicator');
    
    slideElements[currentSlide].classList.remove('active');
    indicatorElements[currentSlide].classList.remove('active');
    
    currentSlide = idx;
    
    slideElements[currentSlide].classList.add('active');
    indicatorElements[currentSlide].classList.add('active');
    
    resetInterval();
  }
  
  function nextSlide() {
    goToSlide((currentSlide + 1) % slides.length);
  }
  
  function resetInterval() {
    clearInterval(interval);
    interval = setInterval(nextSlide, 5000);
  }
  
  // Make goToSlide globally accessible
  window.goToSlide = goToSlide;
  
  renderSlides();
  resetInterval();
}

// Load home page content
function loadHomePage() {
  initHeroCarousel();
  loadNewArrivals();
  loadMostPopular();
  loadTrending();
  loadCollections();
}

// Load new arrivals section
function loadNewArrivals() {
  const container = document.getElementById('newArrivals');
  if (!container) return;
  
  const newProducts = appData.products
    .sort((a, b) => new Date(b.launchdate) - new Date(a.launchdate))
    .slice(0, 8);
  
  renderProductGrid(container, newProducts);
}

// Load most popular section
function loadMostPopular() {
  const container = document.getElementById('mostPopular');
  if (!container) return;
  
  const popularProducts = appData.products
    .sort((a, b) => (b.soldcount || 0) - (a.soldcount || 0))
    .slice(0, 8);
  
  renderProductGrid(container, popularProducts);
}

// Load trending section
function loadTrending() {
  const container = document.getElementById('trending');
  if (!container) return;
  
  const trendingProducts = appData.products
    .filter(product => product.tag && product.tag.includes('trending'))
    .slice(0, 8);
  
  renderProductGrid(container, trendingProducts);
}

// Load collections section
function loadCollections() {
  const container = document.getElementById('collections');
  if (!container) return;
  
  container.innerHTML = appData.collections.map(collection => 
    createCollectionCard(collection)
  ).join('');
}

// Create collection card
function createCollectionCard(collection) {
  return `
    <div class="collection-card" onclick="window.location.href='collections.html?collection=${encodeURIComponent(collection.name)}'">
      <div class="collection-image">
        <img src="${collection.image}" alt="${collection.name}">
      </div>
      <div class="collection-info">
        <h3>${collection.name}</h3>
        <p>${collection.description}</p>
      </div>
    </div>
  `;
}

// Load explore page content
function loadExplorePage() {
  if (!searchInput || !categoryFilter || !sortFilter) return;
  
  renderProductGrid(document.getElementById('allProducts'), filteredProducts);
}

// Initialize search functionality
function initSearch() {
  if (!searchInput || !categoryFilter || !sortFilter) return;
  
  searchInput.addEventListener('input', filterProducts);
  categoryFilter.addEventListener('change', filterProducts);
  sortFilter.addEventListener('change', filterProducts);
}

// Filter products based on search and filters
function filterProducts() {
  const searchTerm = searchInput.value.toLowerCase();
  const category = categoryFilter.value;
  const sortBy = sortFilter.value;
  
  filteredProducts = appData.products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm) ||
                         product.description.toLowerCase().includes(searchTerm);
    const matchesCategory = !category || product.collection === category;
    
    return matchesSearch && matchesCategory;
  });
  
  // Sort products
  filteredProducts = sortProducts(filteredProducts, sortBy);
  
  // Update display
  const container = document.getElementById('allProducts');
  if (container) {
    renderProductGrid(container, filteredProducts);
  }
}

// Sort products
function sortProducts(products, sortBy) {
  switch (sortBy) {
    case 'price-low':
      return [...products].sort((a, b) => a.price - b.price);
    case 'price-high':
      return [...products].sort((a, b) => b.price - a.price);
    case 'newest':
      return [...products].sort((a, b) => new Date(b.launchdate) - new Date(a.launchdate));
    case 'popular':
      return [...products].sort((a, b) => (b.soldcount || 0) - (a.soldcount || 0));
    default:
      return products;
  }
}

// Render product grid
function renderProductGrid(container, products) {
  if (!container) return;
  
  container.innerHTML = products.map(product => 
    createProductCard(product)
  ).join('');
}

// Create product card
function createProductCard(product) {
  const discount = product.mrp && product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
    : 0;
  
  return `
    <div class="product-card" onclick="window.location.href='product.html?id=${product.id}'">
      <div class="product-image">
        <img src="${product.images[0]}" alt="${product.title}">
        ${discount > 0 ? `<span class="discount-badge">-${discount}%</span>` : ''}
      </div>
      <div class="product-info">
        <h3>${product.title}</h3>
        <div class="product-price-row">
          <span class="product-price">₹${product.price}</span>
          ${product.mrp && product.mrp > product.price ? `<span class="product-mrp">₹${product.mrp}</span>` : ''}
        </div>
        <p class="product-description">${product.description}</p>
      </div>
    </div>
  `;
}

// Load product page
function loadProductPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  if (!productId) {
    window.location.href = 'home.html';
    return;
  }
  
  const product = appData.products.find(p => p.id === productId);
  if (!product) {
    window.location.href = 'home.html';
    return;
  }
  
  currentProduct = product;
  displayProductDetails(product);
  loadRelatedProducts(product);
}

// Display product details
function displayProductDetails(product) {
  document.getElementById('productName').textContent = product.title;
  document.getElementById('productPrice').textContent = `₹${product.price}`;
  document.getElementById('productDescription').textContent = product.description;
  
  const mrpElement = document.getElementById('productMrp');
  if (product.mrp && product.mrp > product.price) {
    mrpElement.textContent = `₹${product.mrp}`;
    mrpElement.style.display = 'block';
  } else {
    mrpElement.style.display = 'none';
  }
  
  // Set main image
  const mainImage = document.getElementById('productImage');
  mainImage.src = product.images[0];
  mainImage.alt = product.title;
  
  // Create thumbnails
  const thumbnailsContainer = document.getElementById('productThumbnails');
  thumbnailsContainer.innerHTML = product.images.map((image, index) => `
    <img src="${image}" alt="${product.title}" onclick="changeMainImage('${image}')" class="${index === 0 ? 'active' : ''}">
  `).join('');
  
  // Load specifications
  const specsContainer = document.getElementById('productSpecs');
  specsContainer.innerHTML = `
    <li><strong>Material:</strong> 100% Cotton</li>
    <li><strong>Care:</strong> Machine wash cold</li>
    <li><strong>Fit:</strong> Oversized fit</li>
    <li><strong>Collection:</strong> ${product.collection || 'General'}</li>
  `;
  
  // Initialize buy now button
  const buyNowBtn = document.getElementById('buyNowBtn');
  buyNowBtn.onclick = () => {
    const sizeSelect = document.getElementById('sizeSelect');
    const selectedSize = sizeSelect ? sizeSelect.value : 'M';
    addToCart(product, selectedSize);
    showAddressModal();
  };
}

// Change main product image
function changeMainImage(imageSrc) {
  const mainImage = document.getElementById('productImage');
  mainImage.src = imageSrc;
  
  // Update active thumbnail
  const thumbnails = document.querySelectorAll('#productThumbnails img');
  thumbnails.forEach(thumb => {
    thumb.classList.remove('active');
    if (thumb.src === imageSrc) {
      thumb.classList.add('active');
    }
  });
}

// Load related products
function loadRelatedProducts(currentProduct) {
  const container = document.getElementById('relatedProducts');
  if (!container) return;
  
  const relatedProducts = appData.products
    .filter(product => product.id !== currentProduct.id && 
                      (product.collection === currentProduct.collection || 
                       product.tag === currentProduct.tag))
    .slice(0, 4);
  
  renderProductGrid(container, relatedProducts);
}

// Initialize cart functionality
function initCart() {
  // Load cart from localStorage
  const savedCart = localStorage.getItem('moreoverCart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartCount();
  }
}

// Add to cart
function addToCart(product, size) {
  const existingItem = cart.find(item => item.id === product.id && item.size === size);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images[0],
      size: size,
      quantity: 1
    });
  }
  
  // Save to localStorage
  localStorage.setItem('moreoverCart', JSON.stringify(cart));
  updateCartCount();
}

// Update cart count
function updateCartCount() {
  if (cartCount) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
  }
}

// Initialize address modal
function initAddressModal() {
  const addressModal = document.getElementById('addressModal');
  const closeAddressModal = document.getElementById('closeAddressModal');
  const addressForm = document.getElementById('addressForm');
  
  if (!addressModal || !closeAddressModal || !addressForm) return;
  
  // Ensure modal is hidden by default
  addressModal.classList.add('hidden');
  addressModal.style.display = 'none';
  
  // Close modal when clicking outside
  addressModal.onclick = (e) => {
    if (e.target === addressModal) {
      addressModal.classList.add('hidden');
      addressModal.style.display = 'none';
    }
  };
  
  // Close modal with X button
  closeAddressModal.onclick = () => {
    addressModal.classList.add('hidden');
    addressModal.style.display = 'none';
  };
  
  // Handle form submission
  addressForm.onsubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    alert('Order placed successfully!');
    addressModal.classList.add('hidden');
    addressModal.style.display = 'none';
    cart = [];
    localStorage.removeItem('moreoverCart');
    updateCartCount();
  };
  
  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !addressModal.classList.contains('hidden')) {
      addressModal.classList.add('hidden');
      addressModal.style.display = 'none';
    }
  });
}

// Show address modal
function showAddressModal() {
  const addressModal = document.getElementById('addressModal');
  if (addressModal) {
    addressModal.classList.remove('hidden');
    addressModal.style.display = 'flex';
  }
}

// Load collections page
function loadCollectionsPage() {
  const collectionsList = document.getElementById('collectionsList');
  const collectionProductsSection = document.getElementById('collectionProductsSection');
  const collectionsHeader = document.querySelector('.collections-header');
  
  if (!collectionsList) return;
  
  // Check if a specific collection is requested
  const urlParams = new URLSearchParams(window.location.search);
  const requestedCollection = urlParams.get('collection');
  
  if (requestedCollection) {
    showCollectionProducts(requestedCollection);
  } else {
    // Show all collections
    collectionsList.innerHTML = appData.collections.map(collection => 
      createCollectionCard(collection)
    ).join('');
  }
}

// Show collection products
function showCollectionProducts(collectionName) {
  const collectionsList = document.getElementById('collectionsList');
  const collectionProductsSection = document.getElementById('collectionProductsSection');
  const selectedCollectionTitle = document.getElementById('selectedCollectionTitle');
  const collectionProducts = document.getElementById('collectionProducts');
  const backToCollectionsBtn = document.getElementById('backToCollectionsBtn');
  
  if (!collectionsList || !collectionProductsSection) return;
  
  // Hide collections list and show products
  collectionsList.style.display = 'none';
  collectionProductsSection.classList.remove('hidden');
  
  // Set collection title
  selectedCollectionTitle.textContent = collectionName;
  
  // Filter products by collection
  const collectionProductsList = appData.products.filter(product => 
    product.collection === collectionName
  );
  
  // Render products
  renderProductGrid(collectionProducts, collectionProductsList);
  
  // Handle back button
  if (backToCollectionsBtn) {
    backToCollectionsBtn.onclick = () => {
      collectionsList.style.display = 'block';
      collectionProductsSection.classList.add('hidden');
      window.history.pushState({}, '', 'collections.html');
    };
  }
}

// Initialize size selector for product page
function initSizeSelector() {
  const sizeSelect = document.getElementById('sizeSelect');
  if (!sizeSelect) return;
  
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  sizeSelect.innerHTML = sizes.map(size => 
    `<option value="${size}">${size}</option>`
  ).join('');
  
  // Set default size to 'M'
  sizeSelect.value = 'M';
}