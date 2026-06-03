// Groom Holding - Admin Panel Logic

$(document).ready(function() {
    // Check if admin is logged in
    if (!isAdminLoggedIn()) {
        alert('Accès non autorisé. Veuillez vous connecter.');
        window.location.href = 'index.html';
        return;
    }

    // Load dashboard stats
    loadDashboardStats();
    
    // Load products table
    loadAdminProducts();
    
    // Load categories
    loadCategories();
    
    // Setup product form
    setupProductForm();
    
    // Setup category filter
    setupAdminFilters();

    // Setup logout button
    $('#admin-logout-btn').on('click', adminLogout);
});

// Load dashboard statistics
function loadDashboardStats() {
    const products = getProducts();
    
    // Total products
    $('#stat-products').text(products.length);
    
    // In stock
    const inStock = products.filter(p => p.stock > 0).length;
    $('#stat-stock').text(inStock);
    
    // Low stock
    const lowStock = products.filter(p => p.stock > 0 && p.stock < 10).length;
    $('#stat-low').text(lowStock);
    
    // Orders count
    const ordersCount = localStorage.getItem('ordersCount') || '0';
    $('#stat-orders').text(ordersCount);
}

// Load admin products table
function loadAdminProducts(categoryFilter = '') {
    let products = getProducts();
    
    // Filter by category
    if (categoryFilter) {
        products = products.filter(p => p.category === categoryFilter);
    }
    
    const container = $('#admin-products-table');
    container.empty();
    
    if (products.length === 0) {
        container.html('<tr><td colspan="6" class="text-center">Aucun produit trouvé</td></tr>');
        return;
    }
    
    products.forEach(product => {
        const stockClass = product.stock === 0 ? 'text-danger' : product.stock < 10 ? 'text-warning' : 'text-success';
        
        const row = `
            <tr>
                <td>
                    <img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;" onerror="this.src='https://via.placeholder.com/50x50/e6007e/ffffff?text=Image'">
                </td>
                <td>${product.name}</td>
                <td><span class="badge bg-secondary">${product.category}</span></td>
                <td>${formatPrice(product.price)}</td>
                <td class="${stockClass}">${product.stock}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editProduct(${product.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        container.append(row);
    });
}

// Load categories
function loadCategories() {
    const categories = getCategories();
    const container = $('#categories-list');
    container.empty();
    
    categories.forEach(category => {
        const badge = `
            <span class="category-badge ${category}">
                ${category}
                <button type="button" class="btn-close btn-close-white ms-2" onclick="deleteCategory('${category}')"></button>
            </span>
        `;
        container.append(badge);
    });
}

// Setup product form
function setupProductForm() {
    const form = $('#product-form');
    const saveButton = $('#save-product');
    const cancelButton = $('#cancel-edit');
    const formTitle = $('#product-form-title');
    
    // Image preview handler
    $('#product-image').on('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                $('#image-preview').show().find('img').attr('src', e.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            $('#image-preview').hide();
        }
    });
    
    // Form submit
    form.on('submit', function(e) {
        e.preventDefault();
        
        const productId = $('#product-id').val();
        const imageFile = $('#product-image')[0].files[0];
        
        // Handle image
        let imageData = 'https://via.placeholder.com/400x300/e6007e/ffffff?text=Image';
        
        if (imageFile) {
            // Convert file to base64
            const reader = new FileReader();
            reader.onload = function(e) {
                saveProductWithImage(productId, e.target.result);
            };
            reader.readAsDataURL(imageFile);
            return;
        } else if (productId) {
            // Keep existing image if editing and no new file
            const existingProduct = getProductById(parseInt(productId));
            if (existingProduct) {
                imageData = existingProduct.image;
            }
        }
        
        saveProductWithImage(productId, imageData);
    });
    
    // Cancel edit
    cancelButton.on('click', resetProductForm);
}

// Save product with image data
function saveProductWithImage(productId, imageData) {
    const productData = {
        id: productId ? parseInt(productId) : Date.now(),
        name: $('#product-name').val(),
        price: parseFloat($('#product-price').val()),
        category: $('#product-category').val(),
        quantity: parseInt($('#product-quantity').val()),
        stock: parseInt($('#product-quantity').val()),
        description: $('#product-description').val(),
        image: imageData
    };
    
    let products = getProducts();
    
    if (productId) {
        // Update existing product
        const index = products.findIndex(p => p.id === parseInt(productId));
        if (index > -1) {
            products[index] = productData;
            showToast('Produit modifié avec succès', 'success');
        }
    } else {
        // Add new product
        products.push(productData);
        showToast('Produit ajouté avec succès', 'success');
    }
    
    saveProducts(products);
    loadAdminProducts();
    loadDashboardStats();
    resetProductForm();
}

// Reset product form
function resetProductForm() {
    $('#product-form')[0].reset();
    $('#product-id').val('');
    $('#product-form-title').text('Ajouter un Produit');
    $('#save-product').html('<i class="bi bi-save"></i> Enregistrer');
    $('#cancel-edit').hide();
    $('#image-preview').hide();
}

// Edit product
window.editProduct = function(productId) {
    const product = getProductById(productId);
    
    if (!product) {
        showToast('Produit non trouvé', 'error');
        return;
    }
    
    $('#product-id').val(product.id);
    $('#product-name').val(product.name);
    $('#product-price').val(product.price);
    $('#product-category').val(product.category);
    $('#product-quantity').val(product.quantity);
    $('#product-description').val(product.description);
    
    // Show existing image preview
    if (product.image) {
        $('#image-preview').show().find('img').attr('src', product.image);
    }
    
    $('#product-form-title').text('Modifier le Produit');
    $('#save-product').html('<i class="bi bi-save"></i> Mettre à jour');
    $('#cancel-edit').show();
    
    // Scroll to form
    $('html, body').animate({
        scrollTop: $('#product-form').offset().top - 100
    }, 500);
}

// Delete product
window.deleteProduct = function(productId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
        let products = getProducts();
        products = products.filter(p => p.id !== productId);
        saveProducts(products);
        loadAdminProducts();
        loadDashboardStats();
        showToast('Produit supprimé', 'info');
    }
}

// Setup admin filters
function setupAdminFilters() {
    $('#admin-category-filter').on('change', function() {
        const category = $(this).val();
        loadAdminProducts(category);
    });
}

// Add category
$('#category-form').on('submit', function(e) {
    e.preventDefault();
    
    const newCategory = $('#new-category').val().toLowerCase().trim();
    
    if (!newCategory) {
        showToast('Veuillez entrer une catégorie', 'warning');
        return;
    }
    
    let categories = getCategories();
    
    if (categories.includes(newCategory)) {
        showToast('Cette catégorie existe déjà', 'warning');
        return;
    }
    
    categories.push(newCategory);
    saveCategories(categories);
    loadCategories();
    $('#new-category').val('');
    
    // Update category select in product form
    const categorySelect = $('#product-category');
    categorySelect.append(`<option value="${newCategory}">${newCategory}</option>`);
    
    showToast('Catégorie ajoutée avec succès', 'success');
});

// Delete category
window.deleteCategory = function(category) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category}"?`)) {
        let categories = getCategories();
        categories = categories.filter(c => c !== category);
        saveCategories(categories);
        loadCategories();
        
        // Remove from product form select
        $('#product-category option[value="' + category + '"]').remove();
        
        showToast('Catégorie supprimée', 'info');
    }
}
