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

    var deleteModal = document.getElementById('deleteConfirmationModal');
    var deleteSpan = deleteModal.querySelector('.close');
    var confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    let projectIdToDelete = null;

    var leaveModal = document.getElementById('leaveConfirmationModal');
    var leaveSpan = leaveModal.querySelector('.close');
    var confirmLeaveBtn = document.getElementById('confirmLeaveBtn');
    let projectIdToLeave = null;

    window.confirmDelete = function(projectId, projectName) {
        projectIdToDelete = projectId;
        document.getElementById('deleteProjectName').textContent = projectName;
        deleteModal.style.display = 'flex';
    };

    deleteSpan.onclick = function() {
        deleteModal.style.display = 'none';
    };

    confirmDeleteBtn.onclick = async function() {
        try {
            const response = await fetch(`/Project/DeleteProject?projectId=${projectIdToDelete}`, {
                method: 'POST',
                headers: {'X-Requested-With': 'XMLHttpRequest'}
            });

            if (response.ok) {
                window.location.reload();
            } else {
                console.error('Failed to delete the project.');
            }
        } catch (error) {
            console.error('Error deleting project:', error);
        }
        deleteModal.style.display = 'none';
    };

    window.leaveProject = function(projectId, projectName) {
        projectIdToLeave = projectId;
        document.getElementById('leaveProjectName').textContent = projectName;
        leaveModal.style.display = 'flex';
    };

    leaveSpan.onclick = function() {
        leaveModal.style.display = 'none';
    };

    confirmLeaveBtn.onclick = async function() {
        try {
            const response = await fetch(`/Project/LeaveProject?projectId=${projectIdToLeave}`, {
                method: 'POST',
                headers: {'X-Requested-With': 'XMLHttpRequest'}
            });

            if (response.ok) {
                window.location.reload();
            } else {
                console.error('Failed to leave the project.');
            }
        } catch (error) {
            console.error('Error leaving project:', error);
        }
        leaveModal.style.display = 'none';
    };

    // Close modals if the user clicks outside of them
    window.onclick = function(event) {
        if (event.target === deleteModal) {
            deleteModal.style.display = 'none';
        }
        if (event.target === leaveModal) {
            leaveModal.style.display = 'none';
        }
    };
    
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

document.addEventListener('DOMContentLoaded', function () {
    const browseBtn = document.getElementById('browseTemplates');
    const templateModal = document.getElementById('templateSelectionModal');
    const closeModal = templateModal.querySelector('.close');

    // Event listener to open the modal and load templates
    browseBtn.addEventListener('click', function () {
        fetchTemplates();
        templateModal.style.display = 'flex';
    });

    // Close the modal
    closeModal.addEventListener('click', function () {
        templateModal.style.display = 'none';
    });

    function fetchTemplates() {
        fetch('/Templates/GetTemplates', { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Check if templates are wrapped in a `$values` property or similar
                    const templatesArray = data.templates.$values || data.templates;
                    if (Array.isArray(templatesArray)) {
                        populateTemplates(templatesArray);
                    } else {
                        console.error('Expected templates to be an array, received:', templatesArray);
                    }
                }
                else {
                    console.error('Failed to load templates');
                }
            })
            .catch(error => {
                console.error('Error fetching templates:', error);
            });
    }

    function populateTemplates(templates) {
        const gallery = document.querySelector('.template-gallery');
        gallery.innerHTML = ''; // Clear existing templates
        templates.forEach(template => {
            const div = document.createElement('div');
            div.className = 'template-item';
            div.innerHTML = `
            <img src="http://10.225.149.19:31958/images/${template.imagePath}" alt="${template.templateName}">
            <p>${template.templateName}</p>
            `;
            div.addEventListener('click', () => {
                selectTemplate(template.templateName, template.xmlContent);
                templateModal.style.display = 'none'; // Close modal on selection
            });
            gallery.appendChild(div);
        });
    }

    function selectTemplate(templateName, xmlContent) {
        const currentTemplateDisplay = document.querySelector('.current-template');
        currentTemplateDisplay.textContent = `Current template: ${templateName}`;

        const workspaceStateInput = document.getElementById('templateXMLContent');
        workspaceStateInput.value = xmlContent;
    }
});


