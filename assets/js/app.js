// Groom Holding - Main Application Logic

$(document).ready(function() {
    // Hide loader when page is loaded
    setTimeout(function() {
        $('#loader').addClass('hidden');
    }, 500);

    // Dark Mode Toggle
    $('#dark-mode-toggle').on('click', function() {
        $('body').toggleClass('dark-mode');
        const isDarkMode = $('body').hasClass('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        
        // Update icon
        const icon = $(this).find('i');
        if (isDarkMode) {
            icon.removeClass('bi-moon').addClass('bi-sun');
        } else {
            icon.removeClass('bi-sun').addClass('bi-moon');
        }
    });

    // Load dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        $('body').addClass('dark-mode');
        $('#dark-mode-toggle').find('i').removeClass('bi-moon').addClass('bi-sun');
    }

    // Toast notification function
    window.showToast = function(message, type = 'success') {
        const toast = $('#toast');
        const toastMessage = $('#toast-message');
        const toastIcon = toast.find('.toast-header i');
        
        toastMessage.text(message);
        
        // Update icon based on type
        toastIcon.removeClass('text-success text-danger text-warning text-info');
        if (type === 'success') {
            toastIcon.addClass('text-success');
        } else if (type === 'error') {
            toastIcon.addClass('text-danger');
        } else if (type === 'warning') {
            toastIcon.addClass('text-warning');
        } else {
            toastIcon.addClass('text-info');
        }
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    };

    // Format price function
    window.formatPrice = function(price) {
        return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
    };

    // Initialize products in localStorage if not exists
    if (!localStorage.getItem('products')) {
        // Load default products from JSON file
        $.getJSON('data/products.json', function(data) {
            localStorage.setItem('products', JSON.stringify(data));
        }).fail(function() {
            // If JSON file doesn't exist, create default products
            const defaultProducts = [
                {
                    id: 1,
                    name: 'Samsung Galaxy A55',
                    price: 250000,
                    category: 'electronique',
                    description: 'Smartphone Samsung Galaxy A55 avec écran AMOLED 6.5 pouces, 128GB de stockage, appareil photo 50MP.',
                    image: 'https://via.placeholder.com/400x300/e6007e/ffffff?text=Samsung+Galaxy+A55',
                    quantity: 15,
                    stock: 15
                },
                {
                    id: 2,
                    name: 'Poulet Fermier',
                    price: 5000,
                    category: 'poulets',
                    description: 'Poulet fermier élevé en plein air, de haute qualité.',
                    image: 'https://via.placeholder.com/400x300/28a745/ffffff?text=Poulet+Fermier',
                    quantity: 50,
                    stock: 50
                },
                {
                    id: 3,
                    name: 'Thon Frais',
                    price: 8000,
                    category: 'poissons',
                    description: 'Thon frais de qualité premium, pêché localement.',
                    image: 'https://via.placeholder.com/400x300/17a2b8/ffffff?text=Thon+Frais',
                    quantity: 30,
                    stock: 30
                },
                {
                    id: 4,
                    name: 'Tomates Bio',
                    price: 1500,
                    category: 'legumes',
                    description: 'Tomates biologiques fraîches du jardin.',
                    image: 'https://via.placeholder.com/400x300/ffc107/000000?text=Tomates+Bio',
                    quantity: 100,
                    stock: 100
                },
                {
                    id: 5,
                    name: 'iPhone 15 Pro',
                    price: 650000,
                    category: 'electronique',
                    description: 'iPhone 15 Pro avec puce A17 Pro, appareil photo 48MP, titanium.',
                    image: 'https://via.placeholder.com/400x300/e6007e/ffffff?text=iPhone+15+Pro',
                    quantity: 8,
                    stock: 8
                },
                {
                    id: 6,
                    name: 'Poulet de Chair',
                    price: 4500,
                    category: 'poulets',
                    description: 'Poulet de chair tendre et savoureux.',
                    image: 'https://via.placeholder.com/400x300/28a745/ffffff?text=Poulet+de+Chair',
                    quantity: 75,
                    stock: 75
                },
                {
                    id: 7,
                    name: 'Carottes Fraîches',
                    price: 1200,
                    category: 'legumes',
                    description: 'Carottes fraîches et croquantes.',
                    image: 'https://via.placeholder.com/400x300/ffc107/000000?text=Carottes+Fraîches',
                    quantity: 80,
                    stock: 80
                },
                {
                    id: 8,
                    name: 'MacBook Air M3',
                    price: 850000,
                    category: 'electronique',
                    description: 'MacBook Air avec puce M3, 8GB RAM, 256GB SSD.',
                    image: 'https://via.placeholder.com/400x300/e6007e/ffffff?text=MacBook+Air+M3',
                    quantity: 5,
                    stock: 5
                },
                {
                    id: 9,
                    name: 'Maquereau',
                    price: 3500,
                    category: 'poissons',
                    description: 'Maquereau frais, riche en oméga-3.',
                    image: 'https://via.placeholder.com/400x300/17a2b8/ffffff?text=Maquereau',
                    quantity: 60,
                    stock: 60
                },
                {
                    id: 10,
                    name: 'Oignons',
                    price: 800,
                    category: 'legumes',
                    description: 'Oignons frais de qualité.',
                    image: 'https://via.placeholder.com/400x300/ffc107/000000?text=Oignons',
                    quantity: 120,
                    stock: 120
                }
            ];
            localStorage.setItem('products', JSON.stringify(defaultProducts));
        });
    }

    // Initialize categories in localStorage if not exists
    if (!localStorage.getItem('categories')) {
        const defaultCategories = ['electronique', 'poulets', 'poissons', 'legumes', 'divers'];
        localStorage.setItem('categories', JSON.stringify(defaultCategories));
    }

    // Initialize orders count in localStorage if not exists
    if (!localStorage.getItem('ordersCount')) {
        localStorage.setItem('ordersCount', '0');
    }

    // Initialize favorites in localStorage if not exists
    if (!localStorage.getItem('favorites')) {
        localStorage.setItem('favorites', JSON.stringify([]));
    }

    // Category click handler for homepage
    $('.category-card').on('click', function() {
        const category = $(this).data('category');
        window.location.href = `products.html?category=${category}`;
    });

    // Smooth scroll for anchor links
    $('a[href^="#"]').on('click', function(e) {
        const target = $(this.getAttribute('href'));
        if (target.length) {
            e.preventDefault();
            $('html, body').stop().animate({
                scrollTop: target.offset().top - 70
            }, 800);
        }
    });

    // Admin login button handler
    $('#admin-login-btn').on('click', function() {
        // Check if already logged in
        if (isAdminLoggedIn()) {
            window.location.href = 'admin.html';
            return;
        }
        // Show login modal
        const modal = new bootstrap.Modal(document.getElementById('adminLoginModal'));
        modal.show();
    });

    // Admin login form handler
    $('#admin-login-form').on('submit', function(e) {
        e.preventDefault();
        
        const username = $('#admin-username').val();
        const password = $('#admin-password').val();
        
        // Validate credentials
        if (username === 'contactgroomholding' && password === 'GroomHoldingDK') {
            // Store authentication
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminLoginTime', Date.now().toString());
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('adminLoginModal'));
            modal.hide();
            
            // Clear form
            $('#admin-login-form')[0].reset();
            
            // Show success message
            showToast('Connexion réussie!', 'success');
            
            // Redirect to admin page
            setTimeout(function() {
                window.location.href = 'admin.html';
            }, 1000);
        } else {
            showToast('Identifiants incorrects', 'error');
        }
    });
});

// Get products from localStorage
window.getProducts = function() {
    const products = localStorage.getItem('products');
    return products ? JSON.parse(products) : [];
};

// Save products to localStorage
window.saveProducts = function(products) {
    localStorage.setItem('products', JSON.stringify(products));
};

// Get categories from localStorage
window.getCategories = function() {
    const categories = localStorage.getItem('categories');
    return categories ? JSON.parse(categories) : ['electronique', 'poulets', 'poissons', 'legumes', 'divers'];
};

// Save categories to localStorage
window.saveCategories = function(categories) {
    localStorage.setItem('categories', JSON.stringify(categories));
};

// Get product by ID
window.getProductById = function(id) {
    const products = getProducts();
    return products.find(p => p.id === parseInt(id));
};

// Get favorites from localStorage
window.getFavorites = function() {
    const favorites = localStorage.getItem('favorites');
    return favorites ? JSON.parse(favorites) : [];
};

// Save favorites to localStorage
window.saveFavorites = function(favorites) {
    localStorage.setItem('favorites', JSON.stringify(favorites));
};

// Toggle favorite
window.toggleFavorite = function(productId) {
    let favorites = getFavorites();
    const index = favorites.indexOf(productId);
    
    if (index > -1) {
        favorites.splice(index, 1);
        showToast('Retiré des favoris', 'info');
    } else {
        favorites.push(productId);
        showToast('Ajouté aux favoris', 'success');
    }
    
    saveFavorites(favorites);
    return favorites;
};

// Check if product is favorite
window.isFavorite = function(productId) {
    const favorites = getFavorites();
    return favorites.includes(productId);
};

// Check if admin is logged in
window.isAdminLoggedIn = function() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    const loginTime = localStorage.getItem('adminLoginTime');
    
    // Session expires after 24 hours
    if (isLoggedIn && loginTime) {
        const elapsed = Date.now() - parseInt(loginTime);
        const hours = elapsed / (1000 * 60 * 60);
        if (hours > 24) {
            // Session expired
            localStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('adminLoginTime');
            return false;
        }
        return true;
    }
    return false;
};

// Admin logout
window.adminLogout = function() {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminLoginTime');
    showToast('Déconnexion réussie', 'info');
    window.location.href = 'index.html';
};
