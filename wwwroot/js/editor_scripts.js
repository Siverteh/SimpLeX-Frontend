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

function changeIframeSrc(iframe, src) {
    var frame = iframe.cloneNode();
    frame.src = src;
    iframe.parentNode.replaceChild(frame, iframe);
}

document.getElementById('compileBtn').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent form submission

    var formData = new FormData();
    formData.append('projectId', document.getElementById('projectId').value);
    formData.append('latexCode', document.getElementById('latexCode').value);

    fetch('/Editor/Compile', {
        method: 'POST',
        body: formData,
        headers: {
            'RequestVerificationToken': document.getElementsByName('__RequestVerificationToken')[0].value,
            'Accept': 'application/json' // Expecting JSON response with base64-encoded PDF
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // Parse response as JSON
        })
        .then(data => {
            if (data.success && data.pdfData) {
                var byteCharacters = atob(data.pdfData);
                var byteNumbers = new Array(byteCharacters.length);
                for (var i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                var byteArray = new Uint8Array(byteNumbers);

                var blob = new Blob([byteArray], {type: 'application/pdf'});
                var pdfUrl = URL.createObjectURL(blob); // Create a blob URL from the Blob object

                // Use the blob URL with the PDF.js viewer
                const viewerPath = `/pdfjs/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`;

                // Get the iframe and change its src without affecting history
                var pdfIframe = document.getElementById('pdfDisplay');
                changeIframeSrc(pdfIframe, viewerPath);

                // Revoke old PDF blob URL to free memory
                if (window.previousPdfUrl) {
                    URL.revokeObjectURL(window.previousPdfUrl);
                }
                window.previousPdfUrl = pdfUrl;
            } else {
                alert('Failed to load PDF.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to load PDF.');
        });
});








