const itemId = new URLSearchParams(window.location.search).get('id'); // Get product ID from the URL

fetch(`/api/products/${itemId}`)
  .then(response => response.json())
  .then(itemData => {
    console.log("Fetched Product Data:", itemData);

    // Populate product details
    document.querySelector('.item-name').textContent = itemData.name;
    document.querySelector('.item-price').textContent = `$${itemData.price}`;
    document.querySelector('.item-description').textContent = itemData.description;
    document.querySelector('.item-image').src = `/uploads/products/${itemData.image_url}`;

    const addToCartBtn = document.querySelector('.add-to-cart-btn');

    // Check if the product is reserved
    if (itemData.status === 'reserved') {
      addToCartBtn.disabled = true;
      addToCartBtn.textContent = "Item Reserved. Try again later.";
    } else {
      // Add event listener to the "Add to Cart" button
      addToCartBtn.addEventListener('click', () => {
        reserveItemInDB(itemData.id)
          .then(response => {
            if (response.success) {
              addToCart(itemData);
            } else {
              addToCartBtn.disabled = true;
              addToCartBtn.textContent = "Item Reserved. Try again later.";
            }
          })
          .catch(error => console.error('Error reserving item:', error));
      });
    }
  })
  .catch(error => console.error('Error fetching item details:', error));

// Function to reserve item in the database
function reserveItemInDB(productId) {
  return fetch(`/api/products/reserve/${productId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'reserved' })
  })
  .then(response => response.json());
}

// Function to add the selected item to the cart
function addToCart(product) { 
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existingItemIndex = cart.findIndex(cartItem => cartItem.id === product.id);

  if (existingItemIndex !== -1) {
    cart[existingItemIndex].quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      quantity: 1,
      productType: 'product',
      length: product.length,
      width: product.width,
      height: product.height,
      weight: product.weight
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  window.location.href = 'cartview.html';
}
