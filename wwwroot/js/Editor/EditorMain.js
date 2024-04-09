import {autoSaveLatexContent, compileLatexContent, debounce} from "./PdfViewerScripts.js";
import {
    compileConnectedBlocks,
    ensureDocumentStartBlockExists,
    initializeBlockly,
    shouldAutosave
} from "./BlocklyScripts.js";
import { sendLocalCursorPosition, initializeCollaboration, throttle } from '../Collaboration/collaborationService.js';

document.addEventListener('DOMContentLoaded', function () {
    const workspace = initializeBlockly();
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


    // Initialize collaboration service
    const projectId = document.getElementById('projectId').value;
    initializeCollaboration(workspace, projectId);
    
    workspace.addChangeListener(function (event) {
        ensureDocumentStartBlockExists(workspace);

        //handleBlocklyEvent(event);
        
        if (shouldAutosave(event)) {
            autoSaveLatexContent(workspace);
            compileLatexContent(workspace);
        }
    });
    compileLatexContent(workspace);

    document.addEventListener('mousemove', throttle(async (event) => {
        await sendLocalCursorPosition(event);
    }, 50));
});

