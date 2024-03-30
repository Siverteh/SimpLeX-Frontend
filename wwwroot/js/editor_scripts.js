document.addEventListener('DOMContentLoaded', function() {
    const latexEditor = document.getElementById('latexCode');
    let lastSavedContent = latexEditor.value;

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
    
    function compileLatexContent() {
        
        console.log("Starting compilation process...");
        requestCurrentPage();
        const projectId = document.getElementById('projectId').value;
        const currentPage = localStorage.getItem('currentPdfPage_' + projectId) || 1;
        var formData = new FormData();
        formData.append('projectId', document.getElementById('projectId').value);
        formData.append('latexCode', document.getElementById('latexCode').value);

        fetch('/Editor/Compile', {
            method: 'POST',
            body: formData,
            headers: {
                'RequestVerificationToken': document.getElementsByName('__RequestVerificationToken')[0].value,
                'Accept': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.pdfData) {
                    var byteCharacters = atob(data.pdfData);
                    var byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    var byteArray = new Uint8Array(byteNumbers);

                    var blob = new Blob([byteArray], {type: 'application/pdf'});
                    var pdfUrl = URL.createObjectURL(blob);

                    const viewerPath = `/pdfjs/web/viewer.html?file=${encodeURIComponent(pdfUrl)}#page=${currentPage}`;

                    var pdfIframe = document.getElementById('pdfDisplay');
                    changeIframeSrc(pdfIframe, viewerPath);

                    if (window.previousPdfUrl) {
                        URL.revokeObjectURL(window.previousPdfUrl);
                    }
                    window.previousPdfUrl = pdfUrl;

                    setTimeout(() => {
                        navigateToSavedPage();
                    }, 50);
                } else {
                    alert('Failed to load PDF.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to load PDF.');
            });
    }

    function autoSaveLatexContent() {
        const currentContent = latexEditor.value;
        const projectId = document.getElementById('projectId').value;

        if (currentContent !== lastSavedContent) {
            const data = {
                projectId: projectId,
                latexCode: currentContent
            };

            fetch('/Editor/ProxySaveLatex', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'RequestVerificationToken': document.getElementsByName('__RequestVerificationToken')[0].value
                },
                body: JSON.stringify(data)
            })
                .then(response => {
                    if (response.ok) {
                        console.log('Document auto-saved at ' + new Date().toLocaleTimeString());
                        lastSavedContent = currentContent;
                        compileLatexContent();
                    } else {
                        console.error('Failed to auto-save');
                    }
                })
                .catch(error => console.error('Error during autosave:', error));
        }
    }

    latexEditor.addEventListener('input', debounce(autoSaveLatexContent, 500));
    compileLatexContent();
});

function requestCurrentPage() {
    const pdfIframe = document.getElementById('pdfDisplay');
    if (pdfIframe.contentWindow) {
        console.log("Requesting current page from PDF.js viewer...");
        pdfIframe.contentWindow.postMessage({ type: 'GET_CURRENT_PAGE' }, '*');
    } else {
        console.log("PDF iframe contentWindow not accessible.");
    }
}

window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'CURRENT_PAGE') {
        const projectId = document.getElementById('projectId').value;
        console.log("Received current page from PDF.js viewer:", event.data.page);
        localStorage.setItem('currentPdfPage_' + projectId, event.data.page.toString());
    }
});


function changeIframeSrc(iframe, src) {
    const projectId = document.getElementById('projectId').value;
    const currentPage = localStorage.getItem('currentPdfPage' + projectId) || 1;
    // Ensure the page number is part of the src URL immediately
    const newSrc = `${src}#page=${currentPage}`;
    console.log(`Loading PDF on page ${currentPage}`);

    iframe.onload = () => {
        // Optionally, you could still use a slight delay here if needed, but it might not be necessary
        console.log(`PDF should be loaded on page ${currentPage}`);
    };

    var frame = iframe.cloneNode();
    frame.src = newSrc;
    iframe.parentNode.replaceChild(frame, iframe);
}


function navigateToSavedPage() {
    const projectId = document.getElementById('projectId').value;
    const currentPage = localStorage.getItem('currentPdfPage_' + projectId) || 1;
    const pdfIframe = document.getElementById('pdfDisplay');
    if (pdfIframe && pdfIframe.contentWindow) {
        // This assumes PDF.js exposes a method or can process a hash change to navigate to a page
        // There's no direct method without modifying PDF.js, so this is indicative
        pdfIframe.contentWindow.location.hash = `#page=${currentPage}`;
        console.log(`Attempted to navigate to page ${currentPage}`);
    }
}


