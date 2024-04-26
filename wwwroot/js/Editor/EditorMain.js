import {autoSaveLatexContent, compileLatexContent, debounce} from "./PdfViewerScripts.js";
import {
    compileConnectedBlocks,
    ensureDocumentStartBlockExists,
    initializeBlockly,
    shouldAutosave
} from "./BlocklyScripts.js";
import { sendLocalCursorPosition, initializeCollaboration, throttle } from '../Collaboration/collaborationService.js';
import {loadChatMessages} from "./ChatLogic.js";

document.addEventListener('DOMContentLoaded', async function () {  // Note the async keyword here
    const workspace = initializeBlockly();
    const projectData = document.getElementById('projectData');
    const workspaceState = projectData.dataset.workspacestate;

    if (workspaceState && workspaceState.trim() !== '') {
        try {
            const xml = Blockly.utils.xml.textToDom(workspaceState);
            const xmlString = new XMLSerializer().serializeToString(xml);
            console.log(xmlString);
            Blockly.Xml.domToWorkspace(xml, workspace);
        } catch (e) {
            console.error('Error parsing workspace state:', e);
        }
    } else {
        ensureDocumentStartBlockExists(workspace);
    }

    // Initialize collaboration service
    const projectId = document.getElementById('projectId').value;
    await initializeCollaboration(workspace, projectId);  // Await the initialization
    await loadChatMessages(projectId);

    workspace.addChangeListener(function (event) {
        ensureDocumentStartBlockExists(workspace);
    });
    
    compileLatexContent(workspace);

    document.addEventListener('mousemove', throttle(async (event) => {
        await sendLocalCursorPosition(event);
    }, 50));
});




