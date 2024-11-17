document.addEventListener('DOMContentLoaded', function() {
    var fileInput = document.getElementById('imageUpload');
    var imagePreviewContainer = document.getElementById('imagePreviewContainer');
    var updateDisplayForm = document.getElementById('updateDisplayForm');

    // Handle image upload and preview
    if (fileInput && imagePreviewContainer) {
        fileInput.addEventListener('change', function(event) {
            var files = event.target.files; // Get all selected files
            imagePreviewContainer.innerHTML = ''; // Clear previous previews

            Array.from(files).forEach(function(file) {
                if (file && file.type.startsWith('image')) {
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        // Create an image element for each file
                        var img = document.createElement('img');
                        img.src = e.target.result;
                        img.style.display = 'block'; // Make the image visible
                        img.style.maxWidth = '150px'; // Set max size for preview
                        img.style.margin = '10px'; // Add some spacing between images
                        imagePreviewContainer.appendChild(img); // Append to container
                    };
                    reader.readAsDataURL(file);
                } else {
                    alert('Please select a valid image file.');
                }
            });
        });
    }

    // Handle form submission
    if (updateDisplayForm) {
        updateDisplayForm.addEventListener('submit', function(event) {
            event.preventDefault();
    
            const formData = new FormData(this);
    
            fetch('/api/display', {
                method: 'POST',
                body: formData,
            })
            .then(response => response.json())
            .then(data => {
                alert('Display updated successfully!');
                console.log(data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    }
});
