// updateFeaturedproducts.js

document.addEventListener('DOMContentLoaded', function() {
    fetchFeaturedproducts();
});

let selectedId = null; // Renamed for clarity

function fetchFeaturedproducts() {
    console.log('Fetching featured products...');
    fetch('/api/featured/products')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data)) {
                throw new Error('Expected data to be an array');
            }
            console.log('Featured products fetched:', data);
            displayFeaturedproducts(data);
        })
        .catch(error => console.error('Error fetching featured products:', error));
}

function displayFeaturedproducts(data) {
    const container = document.getElementById('featuredProductsContainer');
    if (!container) {
        console.error('Element with ID "featuredproductsContainer" not found.');
        return;
    }
    container.innerHTML = ''; // Clear previous content

    data.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('featured-item');
        itemDiv.dataset.id = item.id; // Set the id for later use

        itemDiv.innerHTML = `
            <img src="/uploads/products/${item.image_url}" alt="${item.name}" style="max-width: 150px; margin: 10px;" />
            <p>${item.name}</p>
        `;

        // Add click event to open the modal
        itemDiv.addEventListener('click', () => {
            console.log(`Clicked item with id: ${item.id}`);
            openItemSelectionModal(item.id);
        });

        container.appendChild(itemDiv);
    });
}

function openItemSelectionModal(id) {
    selectedId = id; // Store the id to use later when updating
    const modal = document.getElementById('itemSelectionModal');
    if (!modal) {
        console.error('Modal with ID "itemSelectionModal" not found.');
        return;
    }
    modal.style.display = 'block'; // Show the modal
    console.log(`Modal opened for item with id: ${id}`);

    // Fetch the list of available items
    fetchAvailableItems();
}

function fetchAvailableItems() {
    console.log('Fetching available products...');
    fetch('/api/products') // Fetch available products from products API
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data)) {
                throw new Error('Expected data to be an array');
            }
            console.log('Available products fetched:', data);
            displayAvailableItems(data);
        })
        .catch(error => console.error('Error fetching available items:', error));
}

function displayAvailableItems(items) {
    const itemList = document.getElementById('availableItemsList');
    if (!itemList) {
        console.error('Element with ID "availableItemsList" not found.');
        return;
    }
    itemList.innerHTML = ''; // Clear previous content

    items.forEach(item => {
        const listItem = document.createElement('li');
        listItem.classList.add('item-list'); // Optional: add a class for styling
        listItem.dataset.itemId = item.id; // Store item_id

        // Create an image element
        const image = document.createElement('img');
        image.src = `/uploads/products/${item.image_url}`;
        image.alt = item.name;
        image.style.maxWidth = '50px';
        image.style.marginRight = '10px';

        // Create a text element for the item name
        const itemName = document.createElement('span');
        itemName.textContent = item.name;

        // Click event to select this item
        listItem.addEventListener('click', () => {
            console.log(`Selected available item with id: ${item.id}`);
            updateFeaturedItem(item.id); // Pass item.id
        });

        // Append the image and name to the list item
        listItem.appendChild(image);
        listItem.appendChild(itemName);

        // Append the list item to the available items list
        itemList.appendChild(listItem);
    });
}

function updateFeaturedItem(newItemId) {
    const currentId = selectedId; // Use the selectedId stored earlier

    if (!currentId || !newItemId) {
        console.error('Both id and item_id are required to update the featured item.');
        alert('Failed to update: Missing id or item_id.');
        return;
    }

    console.log('Updating featured item:', { id: currentId, item_id: newItemId });

    // Make an API request to update the featured item
    fetch('/api/featured/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentId, item_id: newItemId }) // Send both `id` and `item_id`
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.message === 'Featured item updated successfully') {
            alert('Featured item updated successfully!');
            closeModal();
            fetchFeaturedproducts(); // Refresh the list of featured products
        } else {
            alert('Failed to update featured item');
        }
    })
    .catch(error => console.error('Error updating featured item:', error));
}

function closeModal() {
    const modal = document.getElementById('itemSelectionModal');
    if (!modal) {
        console.error('Modal with ID "itemSelectionModal" not found.');
        return;
    }
    modal.style.display = 'none'; // Hide the modal
}

// Event listener to close the modal when clicking outside of it
window.addEventListener('click', (event) => {
    const modal = document.getElementById('itemSelectionModal');
    if (event.target === modal) {
        closeModal();
    }
});

