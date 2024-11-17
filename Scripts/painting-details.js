document.addEventListener('DOMContentLoaded', function () {
    const paintingId = new URLSearchParams(window.location.search).get('id'); // Get painting ID from the URL

    // Fetch painting data from API
    fetch(`/api/paintings/${paintingId}`)
        .then(response => response.json())
        .then(paintingData => {
            // Populate the painting details page with the data
            document.querySelector('.item-name').textContent = paintingData.name;
            document.querySelector('.item-price').textContent = `$${paintingData.price}`;
            document.querySelector('.item-description').textContent = paintingData.description;
            document.querySelector('.item-image').src = `/uploads/paintings/${paintingData.image_url}`;

            // Add event listener to the "Book Now" button
            document.querySelector('.add-to-cart-btn').addEventListener('click', () => {
                const quantityInput = document.getElementById('quantity');
                const quantity = parseInt(quantityInput.value, 10); // Get quantity from input

                // Check if quantity is less than 8
                if (quantity < 8) {
                    alert("The minimum number of participants is 8. Please increase the quantity.");
                    return; // Exit if quantity is less than 8
                }

                addToCart(paintingData, quantity); // Pass quantity to addToCart
            });
        })
        .catch(error => console.error('Error fetching painting details:', error));
});

// Function to add the selected painting to the cart
function addToCart(painting, quantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const existingItemIndex = cart.findIndex(cartItem => cartItem.id === painting.id);

    if (existingItemIndex !== -1) {
        // If the item is already in the cart, increase its quantity
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Add new item with the selected quantity
        cart.push({
            id: painting.id,
            name: painting.name,
            price: painting.price,
            image: painting.image_url,
            quantity: quantity,  // Set quantity dynamically
            productType: 'painting',  // Set the product type as "painting"
            length: painting.length,
            width: painting.width,
            height: painting.height,
            weight: painting.weight
        });
    }

    // Save the cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    window.location.href = 'cartview.html'; // Redirect to cart view
}
