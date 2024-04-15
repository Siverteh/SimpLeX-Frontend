document.getElementById('uploadImageButton').addEventListener('click', function() {
    document.getElementById('imageUploadInput').click();
});

document.getElementById('imageUploadInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) {
        console.error("No file selected");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Image = e.target.result.replace(/^data:image\/\w+;base64,/, "");  // Handle any image MIME type
        const projectId = document.getElementById('projectId').value;

        // Retrieve the CSRF token
        const csrfToken = document.querySelector('[name=__RequestVerificationToken]').value;
        if (!csrfToken) {
            console.error("CSRF token not found");
            return;
        }

        console.log("Project ID:", projectId);
        console.log("Base64 Image String:", base64Image.substring(0, 30) + "...");  // Log only part of the image string

        fetch('/Editor/UploadImage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken  // Correctly including the CSRF token in the request headers
            },
            body: JSON.stringify({ image: base64Image, projectId: projectId })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.url) {
                    addImageToGallery(data.url);  // Assuming the backend returns the URL of the image
                } else {
                    console.error('Failed to upload image:', data.message);
                }
            })
            .catch(error => {
                console.error('Error uploading image:', error.message);
            });
    };
    reader.readAsDataURL(file);
});


function addImageToGallery(url) {
    const imgElement = document.createElement('img');
    imgElement.src = url;
    imgElement.alt = 'Uploaded Image';
    imgElement.classList.add('img-thumbnail');
    imgElement.style.width = '100px';
    imgElement.style.height = '100px';
    imgElement.title = 'Click to copy URL';
    imgElement.onclick = function() { copyToClipboard(url); };
    document.getElementById('imageGallery').appendChild(imgElement);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Image URL copied to clipboard!');
    }, (err) => {
        console.error('Could not copy text: ', err);
    });
}
