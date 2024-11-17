document.addEventListener('DOMContentLoaded', function() {
    const productsList = document.getElementById('productsList');

    // Fetch products from the API and populate the list
    fetchProducts();

    // Function to fetch products from the database
    function fetchProducts() {
        fetch('/api/products') // Update this with the actual API endpoint
            .then(response => response.json())
            .then(data => {
                displayProducts(data);
            })
            .catch(error => {
                console.error('Error fetching products:', error);
            });
    }

    // Function to display products in the list
    function displayProducts(products) {
        productsList.innerHTML = ''; // Clear existing products
    
        products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.classList.add('product');
            productElement.innerHTML = `
                <img src="/uploads/products/${product.image_url}" alt="${product.name}" class="product-image">
                <div class="product-details">
                    <p>${product.name}</p>
                    <button class="edit-button" data-id="${product.id}">Edit</button>
                    <button class="delete-button" data-id="${product.id}">Delete</button>
                </div>
            `;
            productsList.appendChild(productElement);
    
            // Attach delete event listener to each delete button
            const deleteButton = productElement.querySelector('.delete-button');
            deleteButton.addEventListener('click', () => deleteProduct(product.id));
    
            // Attach edit event listener to each edit button
            const editButton = productElement.querySelector('.edit-button');
            editButton.addEventListener('click', () => editProduct(product.id));
        });
    }
    

    // Function to delete a product
    function deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            fetch(`/api/products/${productId}`, {
                method: 'DELETE',
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Product deleted successfully') {
                    alert('Product deleted!');
                    fetchProducts(); // Reload the list after deletion
                } else {
                    alert('Failed to delete the product.');
                }
            })
            .catch(error => {
                console.error('Error deleting product:', error);
            });
        }
    }

    // Function to navigate to the edit product form
    function editProduct(productId) {
        window.location.href = `editProductForm.html?id=${productId}`;
    }
});
