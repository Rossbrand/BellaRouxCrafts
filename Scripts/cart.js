document.addEventListener('DOMContentLoaded', function () {
    const cartItemsContainer = document.querySelector('.cart-items');
    const totalAmountElement = document.querySelector('.total-amount');

    // Function to load cart from localStorage
    function loadCart() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        // Clear the current cart items display
        cartItemsContainer.innerHTML = '';

        // If the cart is empty, show a message
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            totalAmountElement.textContent = 'Subtotal: $0.00';
            return;
        }

        // Loop through cart items and display them
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');

            const price = parseFloat(item.price); // Ensure price is a number

            // Determine image path based on product type (painting or product)
            const imagePath = item.productType === 'painting' 
                ? `uploads/paintings/${item.image}` 
                : `uploads/products/${item.image}`; 

            cartItem.innerHTML = `
                <img src="${imagePath}" alt="${item.name}">
                <div class="item-details">
                    <p class="item-name">${item.name}</p>
                    <p class="item-price">$${price.toFixed(2)}</p>
                </div>
                <div class="item-quantity">
                    <label for="quantity">Quantity:</label>
                    <p>${item.quantity}</p>
                </div>
                <button class="remove-item" data-id="${item.id}">Remove</button>
            `;

            cartItemsContainer.appendChild(cartItem);
        });

        // Recalculate total after rendering the cart
        calculateTotal();
    }

    // Function to calculate the total price
    function calculateTotal() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        let total = 0;

        cart.forEach(item => {
            const price = parseFloat(item.price); // Ensure price is a number
            total += price * item.quantity; // Multiply price by quantity
        });

        totalAmountElement.textContent = `Subtotal: $${total.toFixed(2)}`;
    }

    // Event delegation for quantity change and remove buttons
    cartItemsContainer.addEventListener('change', function (event) {
        if (event.target.matches('input[type="number"]')) {
            const itemId = event.target.getAttribute('data-id');
            const newQuantity = parseInt(event.target.value);

            if (newQuantity < 1) {
                event.target.value = 1; // Ensure the quantity is at least 1
                return;
            }

            // Update quantity in localStorage
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const itemIndex = cart.findIndex(item => item.id === itemId);
            if (itemIndex !== -1) {
                cart[itemIndex].quantity = newQuantity;
                localStorage.setItem('cart', JSON.stringify(cart));
                calculateTotal();
            }
        }
    });

    cartItemsContainer.addEventListener('click', function (event) {
        if (event.target.matches('.remove-item')) {
            const itemId = event.target.getAttribute('data-id');
            const itemName = event.target.closest('.cart-item').querySelector('.item-name').textContent;
    
            // Add confirmation before removing the item
            const confirmation = confirm(`Are you sure you want to remove "${itemName}" from your cart?`);
    
            if (confirmation) {
                console.log("Remove button clicked");
                console.log("Removing item with ID:", itemId);
    
                // Remove item from localStorage
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                const initialLength = cart.length;
    
                // Ensure both itemId and item.id are of the same type for comparison
                cart = cart.filter(item => String(item.id) !== String(itemId));
    
                console.log("Cart length before:", initialLength, " after removal:", cart.length);
    
                // Update localStorage with the updated cart
                localStorage.setItem('cart', JSON.stringify(cart));
    
                // Reload the cart
                loadCart();
            } else {
                console.log("Item removal canceled");
            }
        }
    });
    
    
    document.querySelector('.checkout-button').addEventListener('click', function () {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Ensure that the cart contains items
        if (cart.length === 0) {
            alert("Your cart is empty. Please add items before proceeding to checkout.");
            return;
        }
    
        // Proceed to the checkout page with the cart information stored in localStorage
        window.location.href = 'checkout.html'; // Redirect to the checkout page
    });
    

    // Load the cart on page load
    loadCart();
});
