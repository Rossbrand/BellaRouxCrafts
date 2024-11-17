document.addEventListener('DOMContentLoaded', function() {
    fetchFeaturedPaintings();
});

function fetchFeaturedPaintings() {
    fetch('/api/featured/paintings')
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
            displayFeaturedPaintings(data);
        })
        .catch(error => console.error('Error fetching featured paintings:', error));
}

function displayFeaturedPaintings(data) {
    const container = document.getElementById('featuredPaintingsContainer');
    if (!container) {
        console.error('Element with ID "featuredPaintingsContainer" not found.');
        return;
    }
    container.innerHTML = ''; // Clear previous content

    data.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('featured-item');

        itemDiv.innerHTML = `
            <img src="/uploads/paintings/${item.image_url}" alt="${item.name}" style="max-width: 150px; margin: 10px;" />
            <p>${item.name}</p>
        `;
        container.appendChild(itemDiv);
    });
}
