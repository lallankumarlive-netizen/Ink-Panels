// Global state
let cartItems = [];
let isLoggedIn = false;
let currentUser = null;

// Auth Functions
function setupAuth() {
    checkAuthState();
    setupLogout();
}

async function checkAuthState() {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const userData = await response.json();
                updateUIForLoggedInUser(userData);
            } else {
                updateUIForLoggedOutUser();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            updateUIForLoggedOutUser();
        }
    } else {
        updateUIForLoggedOutUser();
    }
}

function updateUIForLoggedInUser(userData) {
    isLoggedIn = true;
    currentUser = userData;
    document.querySelector('.auth-section').classList.add('hidden');
    document.querySelector('.user-section').classList.remove('hidden');
    document.querySelector('.username').textContent = userData.username;
}

function updateUIForLoggedOutUser() {
    isLoggedIn = false;
    currentUser = null;
    document.querySelector('.auth-section').classList.remove('hidden');
    document.querySelector('.user-section').classList.add('hidden');
}

function setupLogout() {
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            updateUIForLoggedOutUser();
            window.location.href = '/';
        });
    }
}

// Cart Functions
function setupCart() {
    loadCartFromStorage();
    updateCartCount();
    setupCartModal();
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cartItems = JSON.parse(savedCart);
    }
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    cartCount.textContent = cartItems.length;
}

function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cartItems));
}

function addToCart(product) {
    cartItems.push(product);
    updateCartCount();
    saveCartToStorage();
}

// Product Loading
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Failed to load products:', error);
    }
}

function displayProducts(products) {
    const productGrid = document.querySelector('.product-grid');
    productGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p class="price">$${product.price}</p>
            <button onclick="addToCart(${JSON.stringify(product)})">
                Add to Cart
            </button>
        </div>
    `).join('');
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupCart();
    setupAuth();
});