document.addEventListener('DOMContentLoaded', function () {
    const toolbox = document.getElementById('toolbox');
    const workspace = Blockly.inject('blocklyDiv', {
        toolbox: toolbox,
        scrollbars: true,
        trashcan: true,
        move: {
            scrollbars: true,
            drag: true,
            wheel: true
        },
        zoom: {
            controls: true,
            wheel: true,
            startScale: 1.0,
            maxScale: 3,
            minScale: 0.3,
            scaleSpeed: 1.2
        }
    });
    
    Blockly.JavaScript.init(workspace);
    window.workspace = workspace;

    const projectData = document.getElementById('projectData');
    const workspaceState = projectData.dataset.workspacestate; // Retrieve workspace state
    if (workspaceState && workspaceState.trim() !== '') {
        try {
            const xml = Blockly.utils.xml.textToDom(workspaceState);
            Blockly.Xml.domToWorkspace(xml, workspace);
        } catch (e) {
            console.error('Error parsing workspace state:', e);
            // Handle error or set up a default state as needed
        }
    }
    else
    {
        ensureDocumentStartBlockExists(workspace);
    }


    workspace.addChangeListener(function(event) {
        ensureDocumentStartBlockExists(workspace);
    });

    function ensureDocumentStartBlockExists(workspace) {
        // Check if a document start block already exists
        const existingStartBlocks = workspace.getBlocksByType('document_start_block', false);
        if (existingStartBlocks.length === 0) {
            // No document start block found, so create one
            const startBlock = workspace.newBlock('document_start_block');
            startBlock.initSvg();
            startBlock.render();
            // Optionally, set the position of the block
            startBlock.moveBy(400, 50);
            compileAndSave();
        }
    }

    function compileAndSave(bool = 1) {
        const projectId = document.getElementById('projectId').value;
        const latexContent = compileConnectedBlocks(workspace) + '\\end{document}';
        const workspaceState = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));
        
        console.log("WorkspaceState compile and save:", workspaceState)
        
        if(bool === 0)
        {
            compileLatexContent(projectId, latexContent);
            return;
        }
        
        autoSaveLatexContent(projectId, latexContent, workspaceState);
        compileLatexContent(projectId, latexContent);
    }

    function debounce(func, wait, immediate) {
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
    workspace.addChangeListener(debounce(function (event) {
        // Check if the event should trigger an autosave
        // Avoid autosaving on events like selecting a block or scrolling the workspace
        if (shouldAutosave(event)) {
            compileAndSave();
        }
    }, 0));

    function compileConnectedBlocks(workspace) {
        let startBlock = workspace.getTopBlocks().find(block => block.type === 'document_start_block');
        if (!startBlock) {
            console.log('Document start block not found.');
            return '';
        }
        // Blockly handles connected blocks automatically, so you may just need to generate code for the start block.
        let code = Blockly.JavaScript.blockToCode(startBlock);
        return code;
    }

    function shouldAutosave(event) {
        // Events that indicate a meaningful change in the workspace content
        const meaningfulChangeEvents = [
            Blockly.Events.BLOCK_CREATE,
            Blockly.Events.BLOCK_CHANGE,
            Blockly.Events.BLOCK_DELETE,
            Blockly.Events.BLOCK_MOVE
        ];

        let isMeaningfulEvent = meaningfulChangeEvents.includes(event.type);

        // Handle BLOCK_MOVE events to ensure they result in a new connection or disconnection
        if (event.type === Blockly.Events.BLOCK_MOVE) {
            isMeaningfulEvent = !!event.newParentId || !!event.oldParentId;
        }

        // Handle BLOCK_CHANGE events to focus on changes to block fields
        if (event.type === Blockly.Events.BLOCK_CHANGE && event.element !== 'field') {
            isMeaningfulEvent = false;
        }

        // Specifically handle BLOCK_DELETE events to always trigger autosave
        if (event.type === Blockly.Events.BLOCK_DELETE) {
            isMeaningfulEvent = true;
        }

        return isMeaningfulEvent;
    }

    function compileLatexContent(projectId, latexContent) {
        console.log("Starting compilation process...");
        console.log("Latex code:", latexContent);

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

    function autoSaveLatexContent(projectId, latexContent, workspaceState) {
        console.log("Autosaving project...");

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
        console.log(`Loading PDF on page ${currentPage}`);

        iframe.onload = () => {
            // Optionally, you could still use a slight delay here if needed, but it might not be necessary
            console.log(`PDF should be loaded on page ${currentPage}`);
        };

        var frame = iframe.cloneNode();
        frame.src = newSrc;
        iframe.parentNode.replaceChild(frame, iframe);
    }


    function handleError(error) {
        console.error('Error:', error);
        alert('Failed to process request.');
    }

    compileAndSave(0);
});
