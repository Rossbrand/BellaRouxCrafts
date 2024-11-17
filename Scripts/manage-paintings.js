document.addEventListener('DOMContentLoaded', function() {
    const paintingsList = document.getElementById('paintingsList');

    // Fetch paintings from the API and populate the list
    fetchPaintings();

    // Function to fetch paintings from the database
    function fetchPaintings() {
        fetch('/api/paintings') // Update this with the actual API endpoint
            .then(response => response.json())
            .then(data => {
                displayPaintings(data);
            })
            .catch(error => {
                console.error('Error fetching paintings:', error);
            });
    }

    // Function to display paintings in the list
    function displayPaintings(paintings) {
        paintingsList.innerHTML = ''; // Clear existing paintings
    
        paintings.forEach(painting => {
            const paintingElement = document.createElement('div');
            paintingElement.classList.add('painting');
            paintingElement.innerHTML = `
                <img src="/uploads/paintings/${painting.image_url}" alt="${painting.name}" class="painting-image">
                <div class="painting-details">
                    <p>${painting.name}</p>
                    <button class="edit-button" data-id="${painting.id}">Edit</button>
                    <button class="delete-button" data-id="${painting.id}">Delete</button>
                </div>
            `;
            paintingsList.appendChild(paintingElement);

            // Attach delete event listener to each delete button
            const deleteButton = paintingElement.querySelector('.delete-button');
            deleteButton.addEventListener('click', () => deletePainting(painting.id));

            // Attach edit event listener to each edit button
            const editButton = paintingElement.querySelector('.edit-button');
            editButton.addEventListener('click', () => editPainting(painting.id));
        });
    }

    // Function to delete a painting
    function deletePainting(paintingId) {
        if (confirm('Are you sure you want to delete this painting?')) {
            fetch(`/api/paintings/${paintingId}`, {
                method: 'DELETE',
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Painting deleted successfully') {
                    alert('Painting deleted!');
                    fetchPaintings(); // Reload the list after deletion
                } else {
                    alert('Failed to delete the painting.');
                }
            })
            .catch(error => {
                console.error('Error deleting painting:', error);
            });
        }
    }

    // Function to navigate to the edit painting form
    function editPainting(paintingId) {
        window.location.href = `editPaintingForm.html?id=${paintingId}`;
    }
});
