document.getElementById('newPaintingForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(this);

    // Log form data before sending
    console.log('Form data being sent:');
    formData.forEach((value, key) => console.log(`${key}: ${value}`));

    fetch('/api/paintings', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        alert('Painting added successfully!');
        console.log(data);
        
        // Redirect to the manage paintings page
        window.location.href = 'manage-paintings.html'; // Redirect after successful submission
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

// Image preview logic
document.addEventListener('DOMContentLoaded', function() {
    const photosInput = document.getElementById('paintingPhotos');
    const photosPreview = document.getElementById('paintingPhotosPreview');

    photosInput.addEventListener('change', function() {
        // Clear previous previews
        photosPreview.innerHTML = '';

        // Validate the number of files
        if (this.files.length > 3 || this.files.length < 1) {
            alert('Please upload between 1 and 3 photos.');
            photosInput.value = ''; // Reset the input to allow fresh selection
            return;
        }

        // Preview the selected images
        Array.from(this.files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imgElement = document.createElement('img');
                    imgElement.src = e.target.result;
                    imgElement.style.width = '150px';
                    imgElement.style.margin = '10px';
                    photosPreview.appendChild(imgElement);
                };
                reader.readAsDataURL(file);
            } else {
                alert('Please select a valid image file.');
            }
        });
    });
});


