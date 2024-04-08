import {compileConnectedBlocks} from "./BlocklyScripts.js";

function displayPDF(pdfData) {
    var byteCharacters = atob(pdfData);
    var byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    var byteArray = new Uint8Array(byteNumbers);
    var blob = new Blob([byteArray], {type: 'application/pdf'});
    var pdfUrl = URL.createObjectURL(blob);
    updatePDFViewer(pdfUrl);
}

function updatePDFViewer(pdfUrl) {
    const viewerPath = `/pdfjs/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`;
    var pdfIframe = document.getElementById('pdfDisplay');
    if (window.previousPdfUrl) {
        URL.revokeObjectURL(window.previousPdfUrl);
    }
    window.previousPdfUrl = pdfUrl;

    // Use changeIframeSrc to update the iframe source
    changeIframeSrc(pdfIframe, viewerPath);
}

function changeIframeSrc(iframe, src) {
    const projectId = document.getElementById('projectId').value;
    const currentPage = localStorage.getItem('currentPdfPage' + projectId) || 1;
    // Ensure the page number is part of the src URL immediately
    const newSrc = `${src}#page=${currentPage}`;

    iframe.onload = () => {
        // Optionally, you could still use a slight delay here if needed, but it might not be necessary
        console.log(`PDF should be loaded on page ${currentPage}`);
    };

    var frame = iframe.cloneNode();
    frame.src = newSrc;
    iframe.parentNode.replaceChild(frame, iframe);
}

export function compileLatexContent(workspace) {
    const projectId = document.getElementById('projectId').value;
    const latexContent = compileConnectedBlocks(workspace) + '\\end{document}';
    
    var formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('latexCode', latexContent);

    fetch('/Editor/Compile', {
        method: 'POST',
        body: formData,
        headers: {
            // CSRF token header; adjust as needed based on how your application expects it
            'RequestVerificationToken': document.getElementsByName('__RequestVerificationToken')[0].value,
        }
    })
        .then(response => {
            if (response.ok) {
                return response.json(); // Process the response as JSON
            } else {
                throw new Error('Failed to compile');
            }
        })
        .then(data => {
            if (data.success && data.pdfData) {
                // Convert base64-encoded data to a Blob and display the PDF
                displayPDF(data.pdfData);
            } else {
                // Handle the case where compilation was successful but no PDF data was returned
                alert('Failed to load PDF.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

export function autoSaveLatexContent(workspace) {
    const projectId = document.getElementById('projectId').value;
    const latexContent = compileConnectedBlocks(workspace) + '\\end{document}';
    const workspaceState = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));
    
    var formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('latexCode', latexContent);
    formData.append('workspaceState', workspaceState);

    fetch('/Editor/ProxySaveLatex', {
        method: 'POST',
        body: formData,
        headers: {
            'RequestVerificationToken': document.getElementsByName('__RequestVerificationToken')[0].value,
            'Accept': 'application/json'
        }
    }).then(response => {
        if (!response.ok) {
            console.error('Failed to autosave');
            response.text().then(text => console.error(text));
        }
    }).catch(error => {
        console.error('Error:', error);
    });
}

export function debounce(func, wait, immediate) {
    let timeout;
    return function () {
        const context = this, args = arguments;
        const later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}
