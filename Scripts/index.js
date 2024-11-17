// Fetch and display main display, featured paintings, and featured products on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    fetchMainDisplay();
    fetchFeaturedPaintings();
    fetchFeaturedProducts();
});

// Fetch the main display image, headline, and content
function fetchMainDisplay() {
    fetch('/api/display')
        .then(response => response.json())
        .then(data => {
            if (data.image_url) {
                document.getElementById('displayImage').src = `/uploads/display/${data.image_url}`;
            }
            if (data.headline) {
                document.getElementById('displayHeadline').textContent = data.headline;
            }
            if (data.news_content) {
                document.getElementById('displayContent').textContent = data.news_content;
            }
        })
        .catch(error => console.error('Error fetching main display:', error));
}

// Fetch and display the featured paintings
function fetchFeaturedPaintings() {
    fetch('/api/featured/paintings')
        .then(response => response.json())
        .then(data => displayFeaturedPaintings(data))
        .catch(error => console.error('Error fetching featured paintings:', error));
}

//
// Function to dynamically load featured paintings
function displayFeaturedPaintings(data) {
    const container = document.getElementById('paintingsContainer');
    container.innerHTML = ''; // Clear previous content

    data.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('painting-item');

        // Use the item_id (not the featured item id) to link to the details page
        itemDiv.innerHTML = `
            <img src="/uploads/paintings/${item.image_url}" alt="${item.name}">
            <p>${item.name}</p>
        `;

        // Attach click event to navigate to the painting details page
        itemDiv.addEventListener('click', () => {
            window.location.href = `painting-details.html?id=${item.item_id}`; // Use item_id here
        });

        container.appendChild(itemDiv);
    });

    // Create and append "View All" button at the end
    const viewAllButton = document.createElement('button');
    viewAllButton.textContent = 'View All';
    viewAllButton.onclick = () => location.href = 'allitems.html?view=paintings'; // Pass view=paintings in URL
    viewAllButton.classList.add('view-all-button');
    
    container.appendChild(viewAllButton);
}


function fetchFeaturedProducts() {
    fetch('/api/featured/products')
        .then(response => response.json())
        .then(data => displayFeaturedItems(data))
        .catch(error => console.error('Error fetching featured products:', error));
}

function displayFeaturedItems(data) {
    const container = document.getElementById('itemsContainer');
    container.innerHTML = ''; // Clear previous content

    data.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('item');
        
        // Use item_id to navigate to item details page
        itemDiv.addEventListener('click', () => {
            window.location.href = `item-details.html?id=${item.item_id}`; // Use item_id here
        });

        itemDiv.innerHTML = `
            <img src="/uploads/products/${item.image_url}" alt="${item.name}">
            <p>${item.name}</p>
        `;

        container.appendChild(itemDiv);
    });

    const viewAllButton = document.createElement('button');
    viewAllButton.textContent = 'View All';
    viewAllButton.onclick = () => location.href = 'allitems.html?view=items';
    viewAllButton.classList.add('view-all-button');
    container.appendChild(viewAllButton);
}


