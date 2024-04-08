import {autoSaveLatexContent, compileLatexContent, debounce} from "./PdfViewerScripts.js";
import {
    compileConnectedBlocks,
    ensureDocumentStartBlockExists,
    initializeBlockly,
    shouldAutosave
} from "./BlocklyScripts.js";
import { sendLocalCursorPosition, initializeCollaboration } from '../Collaboration/collaborationService.js';

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
    initializeCollaboration(projectId);
    
    workspace.addChangeListener(function (event) {
        ensureDocumentStartBlockExists(workspace);

        //handleBlocklyEvent(event);
        
        if (shouldAutosave(event)) {
            autoSaveLatexContent(workspace);
            compileLatexContent(workspace);
        }
    });
    compileLatexContent(workspace);

    document.addEventListener('mousemove', async (event) => {
        await sendLocalCursorPosition(event);
    });
});



/*function handleBlocklyEvent(event) {
    const meaningfulChangeEvents = [
        Blockly.Events.BLOCK_CREATE,
        Blockly.Events.BLOCK_CHANGE,
        Blockly.Events.BLOCK_DELETE,
        Blockly.Events.BLOCK_MOVE
    ];
    
    if (meaningfulChangeEvents.includes(event.type)) {
        sendMessage(event.type, event.blockId); // Assuming event.type and event.blockId are the correct values to send
        console.log("Event sent:", event.type, event.blockId);
    }
    else
    {
        console.log("No event happening");
    }
}*/