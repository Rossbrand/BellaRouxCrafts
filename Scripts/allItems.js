document.addEventListener('DOMContentLoaded', function () {
    const viewPicker = document.getElementById('viewPicker');
    const itemsSection = document.getElementById('itemsSection');
    const paintingsSection = document.getElementById('paintingsSection');
    
    // Load items and paintings when the page loads
    fetchItems();
    fetchPaintings();

    // Function to update the view based on the picker value
    function updateView() {
        const selectedView = viewPicker.value;
        if (selectedView === 'items') {
            itemsSection.style.display = 'block';
            paintingsSection.style.display = 'none';
        } else {
            itemsSection.style.display = 'none';
            paintingsSection.style.display = 'block';
        }
    }

    // Add event listener to the picker
    viewPicker.addEventListener('change', updateView);

    // Handle URL parameter to set initial view
    const urlParams = new URLSearchParams(window.location.search);
    const initialView = urlParams.get('view');
    if (initialView) {
        viewPicker.value = initialView;
    }
    updateView();

    // Fetch items from the API and display them
    function fetchItems() {
        fetch('/api/products')  // Adjust API endpoint if necessary
            .then(response => response.json())
            .then(data => displayItems(data))
            .catch(error => console.error('Error fetching items:', error));
    }

    function displayItems(data) {
        const itemsContainer = document.getElementById('itemsContainer');
        itemsContainer.innerHTML = ''; // Clear previous content

        data.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item');
            itemDiv.innerHTML = `
                <a href="item-details.html?id=${item.id}">  <!-- Use id, not item_id -->
                    <img src="/uploads/products/${item.image_url}" alt="${item.name}">
                    <p>${item.name}</p>
                    <p> $${item.price}</p>

                </a>
            `;
            itemsContainer.appendChild(itemDiv);
        });
    }

    // Fetch paintings from the API and display them
    function fetchPaintings() {
        fetch('/api/paintings')  // Adjust API endpoint if necessary
            .then(response => response.json())
            .then(data => displayPaintings(data))
            .catch(error => console.error('Error fetching paintings:', error));
    }

    function displayPaintings(data) {
        const paintingsContainer = document.getElementById('paintingsContainer');
        paintingsContainer.innerHTML = ''; // Clear previous content

        data.forEach(item => {
            const paintingDiv = document.createElement('div');
            paintingDiv.classList.add('painting-item');
            paintingDiv.innerHTML = `
                <a href="painting-details.html?id=${item.id}">  <!-- Use id, not item_id -->
                    <img src="/uploads/paintings/${item.image_url}" alt="${item.name}">
                    <p>${item.name}</p>
                    <p>${item.price} / Per Person</p
                </a>
            `;
            paintingsContainer.appendChild(paintingDiv);
        });
    }
});
