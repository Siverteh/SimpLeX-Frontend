import {compileConnectedBlocks} from "./BlocklyScripts.js";
import {globalLanguage, globalDocType} from "../Blockly/PreliminaryBlocks.js";

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

window.addEventListener('message', function(event) {
    if (event.data.type === 'PDF_JS_READY') {
        navigateToSavedPage(); // This should now navigate correctly
    }
    if (event.data.type === 'CURRENT_PAGE') {
        console.log("Received current page from PDF.js viewer:", event.data.page);
        localStorage.setItem('currentPdfPage', event.data.page.toString());
    }
});

function navigateToSavedPage() {
    const currentPage = parseInt(localStorage.getItem('currentPdfPage') || "1", 10);
    const pdfIframe = document.getElementById('pdfDisplay');

    if (pdfIframe && pdfIframe.contentWindow) {
        let attempts = 0;
        const maxAttempts = 50;
        const interval = setInterval(async () => {
            const PDFApp = pdfIframe.contentWindow.PDFViewerApplication;

            if (PDFApp && PDFApp.pdfViewer && PDFApp.pdfDocument && PDFApp.initialized) {
                try {
                    const numPages = PDFApp.pdfDocument.numPages;
                    if (currentPage > 0 && currentPage <= numPages) {
                        clearInterval(interval);
                        PDFApp.page = currentPage;
                        console.log(`Navigated to page ${currentPage} after ${attempts + 1} attempts.`);
                    } else {
                        console.error(`currentPageNumber: "${currentPage}" is not a valid page.`);
                        clearInterval(interval);
                    }
                } catch (error) {
                    console.error("Error navigating in PDF:", error);
                    clearInterval(interval);
                }
            } else if (attempts >= maxAttempts) {
                clearInterval(interval);
                console.error("Failed to navigate within maximum attempts.");
            }
            attempts++;
        }, 25);
    }
}




function requestCurrentPage() {
    const pdfIframe = document.getElementById('pdfDisplay');
    if (pdfIframe.contentWindow) {
        console.log("Requesting current page from PDF.js viewer...");
        pdfIframe.contentWindow.postMessage({ type: 'GET_CURRENT_PAGE' }, '*');
    } else {
        console.log("PDF iframe contentWindow not accessible.");
    }
}

function generateBibliographyTitle() {
    if (globalDocType === "report" && globalLanguage === "english") {
        return "Bibliography";
    } else if (globalDocType === "article" && globalLanguage === "english") {
        return "References";
    } else if (globalDocType === "report" && globalLanguage === "norsk") {
        return "Bibliografi";
    } else if (globalDocType === "article" && globalLanguage === "norsk") {
        return "Kilder";
    }
    return "Bibliography"; // Default title if no condition matches
}


export function compileLatexContent(workspace) {
    requestCurrentPage()
    const projectId = document.getElementById('projectId').value;
    const bibliographyTitle = generateBibliographyTitle();
    const latexContent = compileConnectedBlocks(workspace) + `\\newpage\\printbibliography[heading=bibintoc, title={${bibliographyTitle}}]\\end{document}`;

    var formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('latexCode', latexContent);

    fetch('/Editor/Compile', {
        method: 'POST',
        body: formData,
        headers: {
            'RequestVerificationToken': document.getElementsByName('__RequestVerificationToken')[0].value,
            'Accept': 'application/json' // Ensure the server responds with JSON
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
                // Display the PDF if compilation was successful and data was received
                displayPDF(data.pdfData);
                updateProjectTitle(data.wordCount);
                
            } else {
                // Handle the case where compilation was successful but no PDF data was returned
                console.error('Failed to load PDF:', data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function updateProjectTitle(wordCount) {
    const wordCountElement = document.getElementById('wordCount');
    wordCountElement.textContent = `WORDS: ${wordCount}`; // Set text content to new word count
}

export function autoSaveLatexContent(workspace) {
    const projectId = document.getElementById('projectId').value;
    const bibliographyTitle = generateBibliographyTitle();
    const latexContent = compileConnectedBlocks(workspace) + `\\newpage\\printbibliography[heading=bibintoc, title={${bibliographyTitle}}]\\end{document}`;
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
