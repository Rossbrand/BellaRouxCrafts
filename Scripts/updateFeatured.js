// Scripts/updateFeatured.js

document.addEventListener('DOMContentLoaded', function() {
    fetchFeaturedItems();
});

function fetchFeaturedItems() {
    fetch('/api/featured')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('featuredPaintingsContainer');
            container.innerHTML = ''; // Clear previous content

            data.forEach(item => {
                if (item.item_type === 'painting') {
                    const itemDiv = document.createElement('div');
                    itemDiv.classList.add('featured-item');

                    // Create a dropdown picker
                    const select = document.createElement('select');
                    select.setAttribute('data-position', item.position);
                    select.addEventListener('change', handleSelectionChange);

                    // Fetch available paintings and populate the dropdown
                    fetch('/api/paintings')
                        .then(response => response.json())
                        .then(paintings => {
                            paintings.forEach(painting => {
                                const option = document.createElement('option');
                                option.value = painting.id;
                                option.text = painting.name;
                                option.setAttribute('data-image-url', painting.image_url);
                                if (painting.id === item.item_id) {
                                    option.selected = true;
                                }
                                select.appendChild(option);
                            });
                        })
                        .catch(error => console.error('Error fetching paintings:', error));

                    itemDiv.innerHTML = `
                        <img src="/uploads/paintings/${item.image_url}" alt="${item.name}" style="max-width: 150px; margin: 10px;" />
                        <p>${item.name}</p>
                    `;
                    itemDiv.appendChild(select);
                    container.appendChild(itemDiv);
                }
            });
        })
        .catch(error => console.error('Error fetching featured items:', error));
}

function handleSelectionChange(event) {
    const selectElement = event.target;
    const newItemId = parseInt(selectElement.value);
    const position = selectElement.getAttribute('data-position');
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const imageUrl = selectedOption.getAttribute('data-image-url');

    updateFeaturedItem(position, newItemId, 'painting', imageUrl);
}

function updateFeaturedItem(position, newItemId, itemType, imageUrl) {
    fetch('/api/featured/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            position: position,
            newItemId: newItemId,
            itemType: itemType,
            imageUrl: imageUrl
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Featured item updated successfully') {
            alert('Featured item updated successfully!');
            fetchFeaturedItems(); // Refresh the list
        } else {
            alert('Failed to update featured item');
        }
    })
    .catch(error => console.error('Error updating featured item:', error));
}
