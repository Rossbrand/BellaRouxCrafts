document.getElementById('newProductForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(this);


    // Set default values for dimensions if not provided
    if (!formData.has('length') || formData.get('length') === '') {
        formData.set('length', '24.00');
    }
    if (!formData.has('width') || formData.get('width') === '') {
        formData.set('width', '24.00');
    }
    if (!formData.has('height') || formData.get('height') === '') {
        formData.set('height', '8.00');
    }
    if (!formData.has('weight') || formData.get('weight') === '') {
        formData.set('weight', '5.50');
    }


    // Log form data before sending
    console.log('Form data being sent:');
    formData.forEach((value, key) => console.log(`${key}: ${value}`));

    fetch('/api/products', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        alert('Product added successfully!');
        console.log(data);
        
        // Redirect to the manage products page
        window.location.href = 'manage-products.html'; // Redirect after successful submission
    })
    .catch(error => {
        console.error('Error:', error);
    });
});



// Image preview logic
document.addEventListener('DOMContentLoaded', function() {
    const photosInput = document.getElementById('productPhotos');
    const photosPreview = document.getElementById('productPhotosPreview');

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
