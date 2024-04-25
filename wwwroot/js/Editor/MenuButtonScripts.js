document.addEventListener('DOMContentLoaded', function() {
    var menuBtn = document.querySelector('.menu-btn');
    var dropdownContent = document.querySelector('.dropdown-content');

    menuBtn.addEventListener('click', function() {
        dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
    });

    // Close the dropdown if the user clicks outside of it
    window.onclick = function(event) {
        if (!event.target.matches('.menu-btn')) {
            var dropdowns = document.getElementsByClassName("dropdown-content");
            for (var i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (openDropdown.style.display === 'block') {
                    openDropdown.style.display = 'none';
                }
            }
        }
    }
});

function renameProject() {
    // Implement renaming logic here
}

function exportAsPDF() {
    const projectId = document.getElementById('projectId').value; // Retrieve the project ID
    if (projectId) {
        window.location.href = `/Project/ExportAsPDF?projectId=${projectId}`; // Redirect to the export URL
    } else {
        console.error('Project ID not found'); // Log an error if the ID isn't found
        alert('Unable to find the project ID. Please try again.'); // Optionally alert the user
    }
}


function exportAsTEX() {
    const projectId = document.getElementById('projectId').value; // Retrieve the project ID
    if (projectId) {
        window.location.href = `/Project/ExportAsTEX?projectId=${projectId}`; // Redirect to the export URL
    } else {
        console.error('Project ID not found'); // Log an error if the ID isn't found
        alert('Unable to find the project ID. Please try again.'); // Optionally alert the user
    }
}

async function saveAsTemplate() {
    const templateName = prompt("Please enter a name for the template:");
    if (!templateName) {
        alert("Template creation cancelled or no name entered.");
        return; // Exit if no name is provided
    }

    // Fetch user info as you've started in the function
    const response = await fetch('/Editor/GetUserInfo');
    if (!response.ok) {
        console.error('Failed to fetch user info');
        alert('Failed to retrieve user information. Please try again.');
        return;
    }
    const { userId } = await response.json();

    // Assuming 'workspaceState' is a global variable that holds the XML state of the workspace
    const projectData = document.getElementById('projectData');
    const workspaceState = projectData.dataset.workspacestate;
    const xml = Blockly.utils.xml.textToDom(workspaceState);
    const xmlString = new XMLSerializer().serializeToString(xml);

    const data = {
        TemplateName: templateName,
        XMLContent: xmlString,
        ImagePath: null, // Assume there's no image path, or handle this accordingly
        IsCustom: true,
        userId: userId
    };

    // Make the POST request to add the template
    try {
        const postResponse = await fetch('/Templates/AddTemplate', {
            method: 'POST',
            headers: {
                'RequestVerificationToken': document.getElementsByName('__RequestVerificationToken')[0].value,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (postResponse.ok) {
            const result = await postResponse.json();
            alert('Template saved successfully!');
            console.log(result); // Log the server response or handle it as needed
        } else {
            const errorResult = await postResponse.text();
            alert('Failed to save the template: ' + errorResult);
            console.error(errorResult); // Log the error response
        }
    } catch (error) {
        console.error('Error saving the template:', error);
        alert('An error occurred while saving the template.');
    }
}

