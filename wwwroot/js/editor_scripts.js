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

document.getElementById('compileBtn').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    var formData = new FormData();
    formData.append('projectId', document.getElementById('projectId').value);
    formData.append('latexCode', document.getElementById('latexCode').value);

    fetch('/Editor/Compile', {
        method: 'POST',
        body: formData,
        headers: {
            'RequestVerificationToken': document.getElementsByName('__RequestVerificationToken')[0].value // Handling anti-forgery token
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Store the PDF in the browser's cache
                localStorage.setItem('compiledPdf', data.pdfData);

                // Optionally, redirect to the Edit page or refresh it to display the PDF from cache
            } else {
                alert(data.message); // Handle failure
            }

            if (localStorage.getItem('compiledPdf')) {
                var pdfData = localStorage.getItem('compiledPdf');
                var pdfDisplay = document.getElementById('pdfDisplay');
                pdfDisplay.setAttribute('src', 'data:application/pdf;base64,' + pdfData);
            }
        });
});
