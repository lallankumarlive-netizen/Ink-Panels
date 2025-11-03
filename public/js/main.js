// API URLs
const API_URL = '/api';
const AUTH_TOKEN_KEY = 'auth_token';

// State management
let currentUser = null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let manga = [];

// Authentication functions
async function register(username, email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem(AUTH_TOKEN_KEY, data.token);
            await getCurrentUser();
            showNotification('Registration successful!', 'success');
            return true;
        } else {
            throw new Error(data.message || 'Registration failed');
        }
    } catch (error) {
        showNotification(error.message, 'error');
        return false;
    }
}

async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem(AUTH_TOKEN_KEY, data.token);
            await getCurrentUser();
            showNotification('Login successful!', 'success');
            return true;
        } else {
            throw new Error(data.message || 'Login failed');
        }
    } catch (error) {
        showNotification(error.message, 'error');
        return false;
    }
}

async function getCurrentUser() {
    try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (!token) {
            currentUser = null;
            return null;
        }

        const response = await fetch(`${API_URL}/users/me`, {
            headers: {
                'x-auth-token': token
            }
        });

        if (response.ok) {
            currentUser = await response.json();
            updateUIForUser();
            return currentUser;
        } else {
            throw new Error('Failed to get user');
        }
    } catch (error) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        currentUser = null;
        updateUIForUser();
        return null;
    }
}

function logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    currentUser = null;
    updateUIForUser();
    showNotification('Logged out successfully', 'success');
}

// Manga functions
async function getAllManga() {
    try {
        const response = await fetch(`${API_URL}/manga`);
        manga = await response.json();
        return manga;
    } catch (error) {
        console.error('Error fetching manga:', error);
        showNotification('Failed to load manga', 'error');
        return [];
    }
}

async function getMangaById(id) {
    try {
        const response = await fetch(`${API_URL}/manga/${id}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching manga details:', error);
        showNotification('Failed to load manga details', 'error');
        return null;
    }
}

// Cart functions
function addToCart(mangaId) {
    const mangaItem = manga.find(m => m._id === mangaId);
    if (!mangaItem) return;

    const existingItem = cart.find(item => item._id === mangaId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...mangaItem,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${mangaItem.title} added to cart!`);
}

function updateCartItem(mangaId, change) {
    const item = cart.find(item => item._id === mangaId);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
        cart = cart.filter(item => item._id !== mangaId);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartItems();
    updateCartCount();
}

function removeFromCart(mangaId) {
    cart = cart.filter(item => item._id !== mangaId);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartItems();
    updateCartCount();
    showNotification('Item removed from cart', 'error');
}

// Order functions
async function createOrder(shippingAddress) {
    try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (!token) {
            showNotification('Please login to place an order', 'error');
            return null;
        }

        const orderItems = cart.map(item => ({
            manga: item._id,
            quantity: item.quantity,
            price: item.price
        }));

        const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({
                items: orderItems,
                shippingAddress,
                totalAmount
            })
        });

        const data = await response.json();
        if (response.ok) {
            return data;
        } else {
            throw new Error(data.message || 'Failed to create order');
        }
    } catch (error) {
        showNotification(error.message, 'error');
        return null;
    }
}

// UI functions
function updateUIForUser() {
    const authSection = document.querySelector('.auth-section');
    const userSection = document.querySelector('.user-section');
    const accountLink = document.querySelector('.account-link');

    if (currentUser) {
        authSection?.classList.add('hidden');
        userSection?.classList.remove('hidden');
        accountLink.textContent = currentUser.username;
    } else {
        authSection?.classList.remove('hidden');
        userSection?.classList.add('hidden');
        accountLink.textContent = 'Account';
    }
}

function renderMangaGrid(mangaList, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = mangaList.map(manga => `
        <div class="manga-item" data-manga-id="${manga._id}">
            ${manga.badges ? manga.badges.map(badge => `<div class="manga-badge">${badge}</div>`).join('') : ''}
            <div class="manga-cover">
                <img src="${manga.image}" alt="${manga.title}" loading="lazy">
                <div class="quick-view" data-manga-id="${manga._id}">Quick View</div>
            </div>
            <div class="manga-info">
                <h3>${manga.title}</h3>
                <p class="author">${manga.author}</p>
                <div class="rating">
                    ${generateStarRating(manga.rating)}
                    <span>${manga.rating} (${manga.reviewCount})</span>
                </div>
                <div class="price">
                    <span class="current-price">$${manga.price.toFixed(2)}</span>
                    ${manga.originalPrice ? `<span class="original-price">$${manga.originalPrice.toFixed(2)}</span>` : ''}
                </div>
                <div class="manga-actions">
                    <button class="buy-button" data-manga-id="${manga._id}">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                    <button class="wishlist-button" data-manga-id="${manga._id}">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async function() {
    await getCurrentUser();
    await loadMangaData();
    setupEventListeners();
});

async function loadMangaData() {
    const allManga = await getAllManga();
    const newReleases = allManga.filter(m => m.isNewRelease);
    const featured = allManga.filter(m => !m.isNewRelease);

    renderMangaGrid(newReleases, 'new-releases-container');
    renderMangaGrid(featured, 'featured-manga');
}

// Event listeners and other UI functions remain the same as in the original code