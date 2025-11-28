document.addEventListener('DOMContentLoaded', () => {
    const sortDropdown = document.getElementById('sort-dropdown');
    const filterDropdown = document.getElementById('filter-dropdown');
    const productGrid = document.getElementById('product-grid');
    const products = Array.from(productGrid.querySelectorAll('.product-card'));
    const applyFilterButton = document.getElementById('apply-filter');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    let cart = {}; 

    
    document.getElementById('sort-toggle').addEventListener('click', (e) => {
        e.stopPropagation(); 
        sortDropdown.classList.toggle('active');
        filterDropdown.classList.remove('active');
    });

    document.getElementById('filter-toggle').addEventListener('click', (e) => {
        e.stopPropagation();
        filterDropdown.classList.toggle('active');
        sortDropdown.classList.remove('active');
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.sort-container')) {
            sortDropdown.classList.remove('active');
        }
        if (!event.target.closest('.filter-container')) {
            filterDropdown.classList.remove('active');
        }
    });


    sortDropdown.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            sortProducts(link.getAttribute('data-sort'));
            sortDropdown.classList.remove('active');
        });
    });

    function sortProducts(sortType) {
        const visibleProducts = products.filter(p => p.style.display !== 'none');
        
        visibleProducts.sort((a, b) => {
            const nameA = a.getAttribute('data-name').toLowerCase();
            const nameB = b.getAttribute('data-name').toLowerCase();
            const priceA = parseInt(a.getAttribute('data-price')); 
            const priceB = parseInt(b.getAttribute('data-price')); 

            switch (sortType) {
                case 'price-asc':
                    return priceA - priceB;
                case 'price-desc':
                    return priceB - priceA;
                case 'name-asc':
                    return nameA.localeCompare(nameB, 'hu', { sensitivity: 'base' });
                case 'name-desc':
                    return nameB.localeCompare(nameA, 'hu', { sensitivity: 'base' });
                default:
                    return 0;
            }
        });

        visibleProducts.forEach(product => {
            productGrid.appendChild(product);
        });
    }


    applyFilterButton.addEventListener('click', () => {
        const checkedFilters = Array.from(filterDropdown.querySelectorAll('input[type="checkbox"]:checked'))
                                     .map(checkbox => checkbox.value);
        
        filterProducts(checkedFilters);
        filterDropdown.classList.remove('active');
        searchProducts(searchInput.value); 
    });

    function filterProducts(filters) {
        products.forEach(product => {
            const productType = product.getAttribute('data-type');
            if (filters.length === 0 || filters.includes(productType)) {
                product.style.display = 'block'; 
            } else {
                product.style.display = 'none'; 
            }
        });
    }
    

    searchButton.addEventListener('click', () => {
        searchProducts(searchInput.value);
    });
    
    searchInput.addEventListener('keyup', () => {
        searchProducts(searchInput.value);
    });

    function searchProducts(searchTerm) {
        const term = searchTerm.toLowerCase().trim();

        products.forEach(product => {
            const productName = product.getAttribute('data-name').toLowerCase();
            const productType = product.getAttribute('data-type');

            const currentFilters = Array.from(filterDropdown.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
            const isVisibleByFilter = currentFilters.length === 0 || currentFilters.includes(productType);

            const matchesSearch = term === '' || productName.includes(term);

            if (matchesSearch && isVisibleByFilter) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
    }
    

    productGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            const productId = e.target.getAttribute('data-product-id');
            const productCard = e.target.closest('.product-card');
            
            const product = {
                id: productId,
                name: productCard.querySelector('.product-name').textContent,
                price: parseInt(productCard.getAttribute('data-price'))
            };
            
            addToCart(product);
        }
    });

    function addToCart(product) {
        if (cart[product.id]) {
            cart[product.id].count++;
        } else {
            cart[product.id] = {
                ...product,
                count: 1
            };
        }
        updateCartUI();
    }

    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.closest('.remove-item-button')) {
            const productId = e.target.closest('.remove-item-button').getAttribute('data-product-id');
            delete cart[productId];
            updateCartUI();
        }
    });
    
    function updateCartUI() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let itemCount = 0;

        for (const id in cart) {
            const item = cart[id];
            
            const itemTotal = item.price * item.count;
            total += itemTotal;
            itemCount++;

            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <div>
                    <span class="cart-item-name">${item.name} (${item.count} db)</span>
                </div>
                <div style="display: flex; align-items: center;">
                    <span class="cart-item-price">${itemTotal.toLocaleString('hu-HU')} Ft</span>
                    <button class="remove-item-button" data-product-id="${id}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        }
        
        cartTotalElement.textContent = total.toLocaleString('hu-HU') + ' Ft';

        if (itemCount === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">A kosár üres.</p>';
        }
    }
});