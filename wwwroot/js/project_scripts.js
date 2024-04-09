document.addEventListener("DOMContentLoaded", function() {
    // Get the modal
    var modal = document.getElementById("createProjectModal");

    // Get the button that opens the modal
    var btn = document.getElementById("createProjectBtn");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on the button, open the modal
    btn.onclick = function() {
        modal.style.display = "flex"; // Use "flex" to align with your CSS for centering
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    const deleteModal = document.getElementById('deleteConfirmationModal');
    const closeDeleteModal = deleteModal.querySelector('.close');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    let projectIdToDelete;

    document.querySelectorAll('.delete-icon').forEach(button => {
        button.addEventListener('click', function() {
            const projectName = this.getAttribute('data-project-name');
            projectIdToDelete = this.getAttribute('data-project-id');
            document.getElementById('deleteProjectName').textContent = `${projectName}`;
            deleteModal.style.display = 'flex';
        });
    });

    confirmDeleteBtn.addEventListener('click', async function() {
        // Adjust the URL to match the route to your frontend controller's action
        const deleteUrl = `/Project/DeleteProject?projectId=${projectIdToDelete}`;

        try {
            const response = await fetch(deleteUrl, {
                method: 'POST',
                headers: {
                    // Add any necessary headers here
                    'X-Requested-With': 'XMLHttpRequest' // Example header
                }
                // No need to set the body for a simple query string request
            });

            if (response.ok) {
                // The project was successfully deleted
                // Refresh the page to reflect the deletion
                window.location.reload();
            } else {
                // Handle the error case
                console.error('Failed to delete project. Response status:', response.status);
            }
        } catch (error) {
            console.error('Error deleting project:', error);
        }

        // Hide the modal after attempting deletion
        deleteModal.style.display = 'none';
    });

    closeDeleteModal.addEventListener('click', function() {
        deleteModal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target == deleteModal) {
            deleteModal.style.display = 'none';
        }
    });
    
    var copyModal = document.getElementById("copyProjectModal");

    function openCopyModal(projectTitle, projectId) {
        // Find the input elements in the "Copy Project" modal
        var newProjectNameInput = document.getElementById('newProjectName');
        var originalProjectIdInput = document.getElementById('originalProjectId');

        // Set the value of the title input to the original title plus "(Copy)"
        newProjectNameInput.value = projectTitle + " (Copy)";

        // Set the value of the hidden input to the original project ID
        originalProjectIdInput.value = projectId;

        // Display the modal
        var copyModal = document.getElementById('copyProjectModal');
        copyModal.style.display = "flex";
    }


    window.openCopyModal = openCopyModal; // Make it accessible globally if it's not already

    var closeCopySpans = copyModal.getElementsByClassName("close");
    Array.from(closeCopySpans).forEach(span => {
        span.onclick = function() {
            copyModal.style.display = "none";
        };
    });

    var cancelCopyBtn = copyModal.querySelector(".cancel-btn");
    cancelCopyBtn.onclick = function() {
        copyModal.style.display = "none";
    };

    window.addEventListener('click', function(event) {
        if (event.target === copyModal) {
            copyModal.style.display = "none";
        }
    });
});

