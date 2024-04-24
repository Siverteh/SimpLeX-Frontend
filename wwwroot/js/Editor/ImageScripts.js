document.addEventListener('DOMContentLoaded', function() {
    const projectIdElement = document.getElementById('projectId');
    if (projectIdElement && projectIdElement.value) {
        loadProjectImages(projectIdElement.value);
    }

    const projectSelectElement = document.getElementById('projectSelect');
    if (projectSelectElement) {
        projectSelectElement.addEventListener('change', function() {
            loadProjectImages(this.value);
        });
    }

    document.getElementById('uploadImageButton').addEventListener('click', function() {
        document.getElementById('imageUploadInput').click();
    });

    document.getElementById('imageUploadInput').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (!file) {
            console.error("No file selected");
            return;
        }

        const projectId = document.getElementById('projectId').value;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectId', projectId);

        const csrfToken = document.querySelector('input[name="__RequestVerificationToken"]').value;

        fetch('/Images/UploadImage', {
            method: 'POST',
            body: formData,
            headers: {
                'RequestVerificationToken': csrfToken
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.url) {
                    addImageToGallery(data.url);
                } else {
                    console.error('Failed to upload image:', data.message);
                }
            })
            .catch(error => {
                console.error('Error uploading image:', error.message);
            });
    });
});



function loadProjectImages(projectId) {
    console.log("LoadProjectImage projectId:", projectId);
    fetch(`/Images/GetProjectImages?projectId=${projectId}`)
        .then(response => response.json())
        .then(data => {
            const imagesArray = data.images.$values;
            // Now 'imagesArray' contains the array of image objects
            imagesArray.forEach(image => {
                addImageToGallery(image.imagePath)
            });
        })
        .catch(error => console.error('Failed to load images:', error));

}

function addImageToGallery(imagePath) {
    const gallery = document.getElementById('imageGallery');
    const imgWrapper = document.createElement('div');
    imgWrapper.classList.add('image-item');

    const imgElement = document.createElement('img');
    imgElement.src = `http://10.225.149.19:31958/images/${imagePath}`;
    imgElement.alt = 'Uploaded Image';
    imgElement.classList.add('img-thumbnail');

    // Setup onclick for image selection
    imgElement.onclick = function() {
        localStorage.setItem('selectedImagePath', imagePath);  // Store the selected image path
        $('#imageGalleryModal').modal('hide');  // Hide the modal upon selection
    };

    const deleteIcon = document.createElement('span');  // Use 'span' for the delete icon
    deleteIcon.innerHTML = '×';
    deleteIcon.classList.add('image-close');
    deleteIcon.onclick = function(event) {
        event.stopPropagation();  // Prevent the image selection event when clicking the delete button
        deleteImage(imagePath, imgWrapper);  // Call delete image function
    };

    imgWrapper.appendChild(imgElement);
    imgWrapper.appendChild(deleteIcon);
    gallery.appendChild(imgWrapper);
}

function deleteImage(imagePath, imgWrapper) {
    fetch(`/Images/DeleteImage?imagePath=${encodeURIComponent(imagePath)}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (response.ok) {
                imgWrapper.remove();  // Remove the image element from the gallery
                console.log('Image deleted successfully.');
            } else {
                throw new Error('Failed to delete the image.');
            }
        })
        .catch(error => {
            console.error('Error deleting the image:', error);
            alert('Error deleting the image.');
        });
}

