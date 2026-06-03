// Groom Holding - Products Logic

$(document).ready(function() {
    // Load popular products on homepage
    if ($('#popular-products').length) {
        loadPopularProducts();
    }

    // Load special offers on homepage
    if ($('#special-offers').length) {
        loadSpecialOffers();
    }

    // Load products grid on products page
    if ($('#products-grid').length) {
        loadProductsGrid();
        setupProductFilters();
    }

    // Load product details on product details page
    if ($('#product-details').length) {
        loadProductDetails();
    }
});

// Load popular products
function loadPopularProducts() {
    const products = getProducts();
    const popularProducts = products.slice(0, 4);
    
    const container = $('#popular-products');
    container.empty();
    
    popularProducts.forEach(product => {
        const productCard = createProductCard(product);
        container.append(productCard);
    });
}

// Load special offers
function loadSpecialOffers() {
    const products = getProducts();
    const offers = products.filter(p => p.stock > 0).slice(0, 3);
    
    const container = $('#special-offers');
    container.empty();
    
    offers.forEach(product => {
        const discount = Math.floor(Math.random() * 20) + 10;
        const offerCard = `
            <div class="col-md-4">
                <div class="offer-card">
                    <div class="offer-discount">-${discount}%</div>
                    <h4>${product.name}</h4>
                    <p class="mb-3">${formatPrice(product.price)}</p>
                    <a href="product-details.html?id=${product.id}" class="btn btn-light">
                        Voir l'offre
                    </a>
                </div>
            </div>
        `;
        container.append(offerCard);
    });
}

// Load products grid
function loadProductsGrid(products = null) {
    const allProducts = products || getProducts();
    const container = $('#products-grid');
    container.empty();
    
    if (allProducts.length === 0) {
        $('#no-products').show();
        return;
    }
    
    $('#no-products').hide();
    
    allProducts.forEach(product => {
        const productCard = createProductCard(product);
        container.append(productCard);
    });
}

// Create product card
function createProductCard(product) {
    const isFavorite = window.isFavorite(product.id);
    const stockClass = product.stock === 0 ? 'out' : product.stock < 10 ? 'low' : '';
    const stockText = product.stock === 0 ? 'Rupture' : product.stock < 10 ? 'Stock limité' : 'En stock';
    
    return `
        <div class="col-md-6 col-lg-4 col-xl-3">
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400x300/e6007e/ffffff?text=Image+non+disponible'">
                    ${product.stock < 10 ? '<span class="product-badge">Promo</span>' : ''}
                </div>
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <h5 class="product-name">${product.name}</h5>
                    <p class="product-price">${formatPrice(product.price)}</p>
                    <p class="product-stock ${stockClass}">${stockText} (${product.stock})</p>
                </div>
                <div class="product-actions">
                    <div class="d-flex gap-2">
                        <button class="btn btn-add-cart flex-grow-1" onclick="addToCart(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
                            <i class="bi bi-cart-plus"></i> Ajouter
                        </button>
                        <button class="btn btn-favorite ${isFavorite ? 'active' : ''}" onclick="toggleFavorite(${product.id}); $(this).toggleClass('active');">
                            <i class="bi bi-heart${isFavorite ? '-fill' : ''}"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Setup product filters
function setupProductFilters() {
    const searchInput = $('#search-input');
    const categoryFilter = $('#category-filter');
    const sortFilter = $('#sort-filter');
    const resetButton = $('#reset-filters');
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    
    if (categoryParam) {
        categoryFilter.val(categoryParam);
    }
    
    // Filter function
    function filterProducts() {
        let products = getProducts();
        
        // Search filter
        const searchTerm = searchInput.val().toLowerCase();
        if (searchTerm) {
            products = products.filter(p => 
                p.name.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm) ||
                p.category.toLowerCase().includes(searchTerm)
            );
        }
        
        // Category filter
        const category = categoryFilter.val();
        if (category) {
            products = products.filter(p => p.category === category);
        }
        
        // Sort filter
        const sort = sortFilter.val();
        switch(sort) {
            case 'price-asc':
                products.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                products.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                products.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                products.sort((a, b) => b.name.localeCompare(a.name));
                break;
        }
        
        loadProductsGrid(products);
    }
    
    // Event listeners
    searchInput.on('input', filterProducts);
    categoryFilter.on('change', filterProducts);
    sortFilter.on('change', filterProducts);
    
    // Reset filters
    resetButton.on('click', function() {
        searchInput.val('');
        categoryFilter.val('');
        sortFilter.val('default');
        loadProductsGrid();
    });
    
    // Initial filter
    filterProducts();
}

// Load product details
function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        window.location.href = 'products.html';
        return;
    }
    
    const product = getProductById(productId);
    
    if (!product) {
        window.location.href = 'products.html';
        return;
    }
    
    // Update breadcrumb
    $('#breadcrumb-product').text(product.name);
    
    // Update page title
    document.title = `${product.name} - Groom Holding`;
    
    // Determine stock status
    let stockClass = 'in-stock';
    let stockText = 'En stock';
    if (product.stock === 0) {
        stockClass = 'out-stock';
        stockText = 'Rupture de stock';
    } else if (product.stock < 10) {
        stockClass = 'low-stock';
        stockText = 'Stock limité';
    }
    
    // Create WhatsApp message
    const whatsappMessage = encodeURIComponent(
        `Bonjour Groom Holding,\n\nJe souhaite commander :\n\nProduit : ${product.name}\nPrix : ${formatPrice(product.price)}\n\nMerci.`
    );
    const whatsappUrl = `https://wa.me/221784790047?text=${whatsappMessage}`;
    
    const isFavorite = window.isFavorite(product.id);
    
    // Load product details
    const container = $('#product-details');
    container.html(`
        <div class="col-lg-6">
            <div class="product-details-gallery">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/600x400/e6007e/ffffff?text=Image+non+disponible'">
            </div>
        </div>
        <div class="col-lg-6">
            <div class="product-details-info">
                <span class="product-category">${product.category}</span>
                <h1 class="display-5 fw-bold">${product.name}</h1>
                <p class="product-details-price">${formatPrice(product.price)}</p>
                <span class="product-details-stock ${stockClass}">${stockText} (${product.stock} disponibles)</span>
                <p class="lead">${product.description}</p>
                <div class="mt-4">
                    <div class="d-flex gap-3">
                        <button class="btn btn-primary btn-lg" onclick="addToCart(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
                            <i class="bi bi-cart-plus"></i> Ajouter au panier
                        </button>
                        <a href="${whatsappUrl}" class="btn btn-success btn-lg" target="_blank" ${product.stock === 0 ? 'disabled' : ''}>
                            <i class="bi bi-whatsapp"></i> Commander via WhatsApp
                        </a>
                        <button class="btn btn-outline-danger btn-lg ${isFavorite ? 'active' : ''}" onclick="toggleFavorite(${product.id}); $(this).toggleClass('active'); $(this).find('i').toggleClass('bi-heart bi-heart-fill');">
                            <i class="bi bi-heart${isFavorite ? '-fill' : ''}"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `);
    
    // Load similar products
    loadSimilarProducts(product);
}

// Load similar products
function loadSimilarProducts(currentProduct) {
    const products = getProducts();
    const similarProducts = products
        .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
        .slice(0, 4);
    
    const container = $('#similar-products');
    container.empty();
    
    if (similarProducts.length === 0) {
        container.html('<p class="text-center col-12">Aucun produit similaire disponible.</p>');
        return;
    }
    
    similarProducts.forEach(product => {
        const productCard = createProductCard(product);
        container.append(productCard);
    });
}
