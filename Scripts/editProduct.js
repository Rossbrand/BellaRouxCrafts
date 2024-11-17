document.addEventListener('DOMContentLoaded', function() {
    const editProductForm = document.getElementById('editProductForm');
    const productId = new URLSearchParams(window.location.search).get('id'); // Get product ID from URL
    const productPhotosInput = document.getElementById('productPhotos');
    let existingImages = []; // To hold the existing images

    console.log('Product Edit Page Loaded. Product ID:', productId);

    // Fetch and prepopulate form with existing product data
    fetch(`/api/products/${productId}`)
        .then(response => {
            console.log('Fetching product data for Product ID:', productId);
            return response.json();
        })
        .then(productData => {
            console.log('Product data received:', productData);

            // Populate the form with existing data
            document.getElementById('productName').value = productData.name;
            document.getElementById('productDescription').value = productData.description;
            document.getElementById('productPrice').value = productData.price;

            // Display existing images
            const photosPreview = document.getElementById('productPhotosPreview');
            photosPreview.innerHTML = ''; // Clear previous content
            if (productData.image_url) {
                console.log('Displaying existing images:', productData.image_url);
                existingImages = [productData.image_url]; // Save existing image
                existingImages.forEach(function(imagePath) {
                    const img = document.createElement('img');
                    img.src = `/uploads/products/${imagePath}`;
                    img.style.width = '150px';
                    img.style.margin = '10px';
                    photosPreview.appendChild(img);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching product data:', error);
        });

    // Preview new uploaded images in real-time
    productPhotosInput.addEventListener('change', function(event) {
        console.log('New images selected for upload:', event.target.files);
        const files = event.target.files;
        const photosPreview = document.getElementById('productPhotosPreview');
        photosPreview.innerHTML = ''; // Clear previous content

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                console.log('Previewing image:', file.name);
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
    editProductForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission
        console.log('Submitting form to update product');

        // Collect form data
        const formData = new FormData(editProductForm);

        // If no new images were uploaded, append existing images
        if (productPhotosInput.files.length === 0) {
            console.log('No new images uploaded. Using existing images:', existingImages);
            existingImages.forEach((image, index) => {
                formData.append(`existingImages[${index}]`, image); // Append existing images as part of formData
            });
        }

        // Send PUT request to update product
        fetch(`/api/products/${productId}`, {
            method: 'PUT',
            body: formData, // Send form data as body
        })
        .then(response => {
            console.log('PUT request sent to update product. Awaiting response...');
            return response.json();
        })
        .then(data => {
            if (data.message === 'Product updated successfully') {
                console.log('Product updated successfully:', data);
                alert('Product updated successfully!');
                window.location.href = 'manage-products.html'; // Redirect to manage products page
            } else {
                console.error('Failed to update product:', data);
                alert('Failed to update product.');
            }
        })
        .catch(error => {
            console.error('Error updating product:', error);
        });
    });
});
