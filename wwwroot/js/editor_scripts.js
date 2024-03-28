document.addEventListener('DOMContentLoaded', function() {
    const latexEditor = document.getElementById('latexCode'); // Your LaTeX editor element
    let lastSavedContent = latexEditor.value; // Initialize with the current content to avoid unnecessary initial autosave

    // Debounce function to limit how often a function is executed
    function debounce(func, wait, immediate) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    // Autosave function to be executed upon input in the LaTeX editor
    function autoSaveLatexContent() {
        const currentContent = latexEditor.value;
        const projectId = document.getElementById('projectId').value; // Assuming you have an input element with the project ID

        // Only proceed if content has changed
        if (currentContent !== lastSavedContent) {
            // Prepare the request payload
            const data = {
                projectId: projectId,
                latexCode: currentContent
            };

            fetch('/Editor/ProxySaveLatex', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Ensure to include the request verification token for ASP.NET Core anti-forgery validation
                    'RequestVerificationToken': document.getElementsByName("__RequestVerificationToken")[0].value
                },
                body: JSON.stringify(data)
            })
                .then(response => {
                    if (response.ok) {
                        console.log('Document auto-saved at ' + new Date().toLocaleTimeString());
                        lastSavedContent = currentContent; // Update the last saved content to the current content after successful autosave
                    } else {
                        console.error('Failed to auto-save');
                    }
                })
                .catch(error => console.error('Error during autosave:', error));
        }
    }

    // Listen for input events on the LaTeX editor and debounce the autosave function
    latexEditor.addEventListener('input', debounce(autoSaveLatexContent, 500)); // Adjust debounce time as needed
});
