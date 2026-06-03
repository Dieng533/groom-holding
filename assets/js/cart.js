// Groom Holding - Cart Logic

$(document).ready(function() {
    // Update cart count on all pages
    updateCartCount();
    
    // Load cart on cart page
    if ($('#cart-items').length) {
        loadCart();
        setupCartActions();
    }
});

// Get cart from localStorage
window.getCart = function() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
};

// Save cart to localStorage
window.saveCart = function(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
};

// Update cart count
function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    $('#cart-count').text(totalItems);
}

// Add product to cart
window.addToCart = function(productId) {
    const product = getProductById(productId);
    
    if (!product) {
        showToast('Produit non trouvé', 'error');
        return;
    }
    
    if (product.stock === 0) {
        showToast('Produit en rupture de stock', 'error');
        return;
    }
    
    let cart = getCart();
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        if (existingItem.quantity >= product.stock) {
            showToast('Stock maximum atteint', 'warning');
            return;
        }
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
            maxQuantity: product.stock
        });
    }
    
    saveCart(cart);
    showToast('Produit ajouté au panier!', 'success');
}

// Remove item from cart
window.removeFromCart = function(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    loadCart();
    showToast('Produit retiré du panier', 'info');
}

// Update item quantity
window.updateQuantity = function(productId, newQuantity) {
    let cart = getCart();
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        if (newQuantity < 1) {
            removeFromCart(productId);
            return;
        }
        
        if (newQuantity > item.maxQuantity) {
            showToast('Stock maximum atteint', 'warning');
            newQuantity = item.maxQuantity;
        }
        
        item.quantity = parseInt(newQuantity);
        saveCart(cart);
        loadCart();
    }
}

// Load cart
function loadCart() {
    const cart = getCart();
    const container = $('#cart-items');
    const emptyCart = $('#empty-cart');
    
    if (cart.length === 0) {
        container.hide();
        emptyCart.show();
        $('#subtotal').text('0 FCFA');
        $('#total').text('0 FCFA');
        return;
    }
    
    container.show();
    emptyCart.hide();
    container.empty();
    
    cart.forEach(item => {
        const cartItem = `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.src='https://via.placeholder.com/100x100/e6007e/ffffff?text=Image'">
                <div class="cart-item-info">
                    <h5 class="cart-item-name">${item.name}</h5>
                    <p class="cart-item-price">${formatPrice(item.price)}</p>
                </div>
                <div class="cart-item-quantity">
                    <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <input type="number" value="${item.quantity}" min="1" max="${item.maxQuantity}" onchange="updateQuantity(${item.id}, this.value)">
                    <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        container.append(cartItem);
    });
    
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    $('#subtotal').text(formatPrice(subtotal));
    $('#total').text(formatPrice(subtotal));
}

// Setup cart actions
function setupCartActions() {
    // WhatsApp order
    $('#whatsapp-order').on('click', function() {
        const cart = getCart();
        
        if (cart.length === 0) {
            showToast('Votre panier est vide', 'warning');
            return;
        }
        
        let message = 'Bonjour Groom Holding,\n\nJe souhaite commander :\n\n';
        let total = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            message += `- ${item.name} x${item.quantity} : ${formatPrice(itemTotal)}\n`;
        });
        
        message += `\nTotal : ${formatPrice(total)}\n\nMerci.`;
        
        const whatsappUrl = `https://wa.me/221784790047?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        
        // Increment orders count
        const ordersCount = parseInt(localStorage.getItem('ordersCount') || '0');
        localStorage.setItem('ordersCount', (ordersCount + 1).toString());
        
        showToast('Redirection vers WhatsApp...', 'success');
    });
    
    // Clear cart
    $('#clear-cart').on('click', function() {
        if (confirm('Êtes-vous sûr de vouloir vider votre panier?')) {
            saveCart([]);
            loadCart();
            showToast('Panier vidé', 'info');
        }
    });
}
