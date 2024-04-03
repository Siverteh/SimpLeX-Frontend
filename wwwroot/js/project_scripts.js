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
    
    
    const copyModal = document.getElementById('copyProjectModal');
    const closeCopyModalSpan = copyModal.querySelector('.close');
    const confirmCopyBtn = document.getElementById('confirmCopyBtn');

    // Function to open the copy project modal with pre-filled data
    window.openCopyModal = function(projectName, projectId) {
        document.getElementById('newProjectName').value = projectName + ' (Copy)';
        document.getElementById('originalProjectId').value = projectId;
        copyModal.style.display = 'flex';
    };

    // Close the modal when the user clicks on <span> (x)
    closeCopyModalSpan.onclick = function() {
        copyModal.style.display = 'none';
    };

    // Close the modal when the user clicks anywhere outside of it
    window.onclick = function(event) {
        if (event.target == copyModal) {
            copyModal.style.display = 'none';
        }
    };

    // Handle copy button click
    confirmCopyBtn.addEventListener('click', async function() {
        var Title = document.getElementById('newProjectName').value;
        var ProjectId = document.getElementById('originalProjectId').value;

        // Construct the request payload
        var payload = {
            ProjectId: ProjectId,
            Title: Title // Assuming your ProjectViewModel expects a Title field
        };
        
        console.log(payload);

        // Fetch API call to your frontend controller's CopyProject action
        try {
            const response = await fetch('/Project/CopyProject', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest', // If needed for AJAX detection on server-side
                    // Authorization header if needed
                },
                body: JSON.stringify(payload)
            });

            if(response.ok) {
                // The project was successfully copied
                window.location.reload(); // Refresh the page or navigate as needed
            } else {
                // Handle failure to copy the project
                console.error('Failed to copy project. Response status:', response.status);
            }
        } catch (error) {
            console.error('Error copying project:', error);
        } finally {
            // Hide the modal regardless of success or failure
            copyModal.style.display = 'none';
        }
    });
});    

