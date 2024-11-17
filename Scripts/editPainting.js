document.addEventListener('DOMContentLoaded', function() {
    const editPaintingForm = document.getElementById('editPaintingForm');
    const paintingId = new URLSearchParams(window.location.search).get('id'); // Get painting ID from URL
    const paintingPhotosInput = document.getElementById('paintingPhotos');
    let existingImages = []; // To hold the existing images

    // Fetch and prepopulate form with existing painting data
    fetch(`/api/paintings/${paintingId}`)
        .then(response => response.json())
        .then(paintingData => {
            // Populate the form with existing data
            document.getElementById('paintingName').value = paintingData.name;
            document.getElementById('paintingDescription').value = paintingData.description;
            document.getElementById('paintingPrice').value = paintingData.price;

            // Display existing images
            const photosPreview = document.getElementById('paintingPhotosPreview');
            photosPreview.innerHTML = ''; // Clear previous content
            if (paintingData.images && paintingData.images.length > 0) {
                existingImages = paintingData.images; // Save existing images
                paintingData.images.forEach(function(imagePath) {
                    const img = document.createElement('img');
                    img.src = `/uploads/paintings/${imagePath}`;
                    img.style.width = '150px';
                    img.style.margin = '10px';
                    photosPreview.appendChild(img);
                });
            }
        })
        .catch(error => console.error('Error fetching painting:', error));

    // Preview new uploaded images in real-time
    paintingPhotosInput.addEventListener('change', function(event) {
        const files = event.target.files;
        const photosPreview = document.getElementById('paintingPhotosPreview');
        photosPreview.innerHTML = ''; // Clear previous content

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.width = '150px';
                img.style.margin = '10px';
                photosPreview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    });

    // Handle form submission
    editPaintingForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        // Collect form data
        const formData = new FormData(editPaintingForm);

        // If no new images were uploaded, append existing images
        if (paintingPhotosInput.files.length === 0) {
            existingImages.forEach((image, index) => {
                formData.append(`existingImages[${index}]`, image); // Append existing images as part of formData
            });
        }

        // Send PUT request to update painting
        fetch(`/api/paintings/${paintingId}`, {
            method: 'PUT',
            body: formData, // Send form data as body
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Painting updated successfully') {
                alert('Painting updated successfully!');
                window.location.href = 'manage-paintings.html'; // Redirect to manage paintings page
            } else {
                alert('Failed to update painting.');
            }
        })
        .catch(error => console.error('Error updating painting:', error));
    });
});

