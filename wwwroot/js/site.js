// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
/*
document.addEventListener('DOMContentLoaded', function() {
    const latexEditor = document.getElementById('latexCode');
    latexEditor.addEventListener('input', debounce(autoSaveAndCompile, 500));
    compileLatexContent();
});

function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        }, wait);
        if (immediate && !timeout) func.apply(context, args);
    };
}

function compileLatexContent() {
    console.log("Compiling LaTeX content...");
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
            updatePDFViewer(data.pdfData);
        } else {
            console.error('Failed to load PDF.');
        }
    })
    .catch(error => console.error('Error during compilation:', error));
}

function autoSaveAndCompile() {
    const currentContent = document.getElementById('latexCode').value;
    const projectId = document.getElementById('projectId').value;

    fetch('/Editor/ProxySaveLatex', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'RequestVerificationToken': document.getElementsByName('__RequestVerificationToken')[0].value
        },
        body: JSON.stringify({ projectId: projectId, latexCode: currentContent })
    })
    .then(response => {
        if (response.ok) {
            console.log('Document auto-saved');
            compileLatexContent();
        } else {
            console.error('Failed to auto-save');
        }
    })
    .catch(error => console.error('Error during auto-save:', error));
}

function updatePDFViewer(pdfData) {
    const currentPage = localStorage.getItem('currentPdfPage') || 1;
    var byteCharacters = atob(pdfData);
    var byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    var byteArray = new Uint8Array(byteNumbers);
    var blob = new Blob([byteArray], {type: 'application/pdf'});
    var pdfUrl = URL.createObjectURL(blob);
    const viewerPath = `/pdfjs/web/viewer.html?file=${encodeURIComponent(pdfUrl)}#page=${currentPage}`;

    console.log(`Loading PDF on page ${currentPage}`);
    changeIframeSrc(document.getElementById('pdfDisplay'), viewerPath);
}

function changeIframeSrc(iframe, src) {
    var frame = iframe.cloneNode();
    frame.src = src;
    iframe.parentNode.replaceChild(frame, iframe);
    frame.onload = () => console.log(`PDF viewer updated to page ${localStorage.getItem('currentPdfPage') || 1}`);
}

window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'CURRENT_PAGE') {
        localStorage.setItem('currentPdfPage', event.data.page.toString());
        console.log("Current page updated:", event.data.page);
    }
});

 */