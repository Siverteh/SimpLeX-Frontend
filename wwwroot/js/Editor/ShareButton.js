document.addEventListener('DOMContentLoaded', function() {
    const shareButton = document.querySelector('.share-btn');
    const projectId = document.getElementById('projectId').value;

    shareButton.addEventListener('click', function() {
        fetch(`/ProxyShare/${projectId}`)  // This should point to your frontend proxy route
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.link) {
                    const shareInput = document.getElementById('shareLinkInput');
                    shareInput.value = data.link; // Put the link in the modal's input
                    $('#shareLinkModal').modal('show'); // Use jQuery to show the modal
                } else {
                    alert("Failed to generate the share link. Please try again.");
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert("An error occurred while generating the link.");
            });
    });
});

function copyToClipboard() {
    const copyText = document.getElementById("shareLinkInput");
    copyText.select();
    document.execCommand("copy");
    alert("Link copied to clipboard!");
}
