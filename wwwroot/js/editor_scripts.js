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

    preventStartBlockDeletion(workspace);
    ensureDocumentStartBlockExists(workspace);
    Blockly.JavaScript.init(workspace);
    window.workspace = workspace;

    function preventStartBlockDeletion(workspace) {
        workspace.addChangeListener(function(event) {
            if (event.type === Blockly.Events.BLOCK_DELETE) {
                const blockIds = event.ids; // IDs of blocks being deleted
                const containsStartBlock = blockIds.some(id => {
                    const block = workspace.getBlockById(id);
                    return block && block.type === 'document_start_block';
                });

                if (containsStartBlock) {
                    // Directly stop the deletion of the start block
                    event.preventDefault(); // This only works if Blockly supports it, else use undo
                    // Blockly.Events.undo(workspace); // Alternative way to undo deletion, but it might not work as expected
                    alert("The document start block cannot be removed.");
                }
            }
        });
    }


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
        }
    }

    function compileAndSave() {
        const latexContent = compileConnectedBlocks(workspace) + '\\end{document}';
        autoSaveLatexContent(latexContent);
        compileLatexContent(latexContent);
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

    function compileLatexContent(latexContent) {
        console.log("Starting compilation process...", latexContent);
        const projectId = document.getElementById('projectId').value;
        fetchCompilation(latexContent, projectId);
    }

    function autoSaveLatexContent(latexContent) {
        const projectId = document.getElementById('projectId').value;
        console.log("Autosave latex content:", latexContent);
        fetch('/Editor/ProxySaveLatex', createFetchRequest(projectId, latexContent))
            .then(handleResponse)
            .catch(handleError);
    }

    function fetchCompilation(latexContent, projectId) {
        fetch('/Editor/Compile', createFetchRequest(projectId, latexContent))
            .then(handleResponse)
            .catch(handleError);
    }

    function createFetchRequest(projectId, latexContent) {
        var formData = new FormData();
        formData.append('projectId', projectId);
        formData.append('latexCode', latexContent);
        return {
            method: 'POST',
            body: formData,
            headers: {
                'RequestVerificationToken': document.getElementsByName('__RequestVerificationToken')[0].value,
                'Accept': 'application/json'
            }
        };
    }

    function handleResponse(response) {
        if (response.ok) {
            response.json().then(data => {
                if (data.pdfData) {
                    displayPDF(data.pdfData);
                } else {
                    alert('Failed to load PDF.');
                }
            });
        } else {
            console.error('Failed to save or compile');
        }
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
        pdfIframe.src = viewerPath;
        if (window.previousPdfUrl) {
            URL.revokeObjectURL(window.previousPdfUrl);
        }
        window.previousPdfUrl = pdfUrl;
    }

    function handleError(error) {
        console.error('Error:', error);
        alert('Failed to process request.');
    }
});

// Here is where the debounce functionality would go if needed.
// function debounce(func, wait, immediate) {...}

