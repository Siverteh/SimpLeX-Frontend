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

    fetch('/Editor/UploadImage', {
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


function addImageToGallery(url) {
    console.log("the url is:", url);
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
        alert('Image URL copied to clipboard!');
    }).catch(err => {
        alert('Could not copy text: ' + err);
    });
}
