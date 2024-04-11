
import { WebSocketService } from './webSocketService.js';

import {debounce} from "../Editor/PdfViewerScripts.js";

import {shouldAutosave} from "../Editor/BlocklyScripts.js";

import {autoSaveLatexContent, compileLatexContent} from "../Editor/PdfViewerScripts.js";

const wsService = new WebSocketService();

function connectToProject(projectId) {
    if (projectId) {
        wsService.connect(projectId);
    } else {
        console.error("Project ID is not available.");
    }
}

export function initializeCollaboration(workspace, projectId) {
    connectToProject(projectId);

    // Enhanced function to handle Blockly workspace changes
    const handleBlocklyChanges = debounce((event) => {
        console.log('Event Fired:', event.type, 'Block ID:', event.blockId);
        if (shouldAutosave(event, workspace)) {
            const xml = Blockly.Xml.workspaceToDom(workspace);
            const xmlText = Blockly.Xml.domToText(xml);
            autoSaveLatexContent(workspace);
            compileLatexContent(workspace);
            sendMessage('blocklyUpdateImportant', xmlText);  // Send only meaningful updates
        }
        else if ([Blockly.Events.MOVE, Blockly.Events.CREATE, Blockly.Events.DELETE, Blockly.Events.CHANGE].includes(event.type)) 
        {
            const xml = Blockly.Xml.workspaceToDom(workspace);
            const xmlText = Blockly.Xml.domToText(xml);

            sendMessage('blocklyUpdate', xmlText);
        }
    }, 0);


    // Listen to Blockly workspace changes
    workspace.addChangeListener(handleBlocklyChanges);

    // Handle incoming Blockly updates
    wsService.onMessage('blocklyUpdateImportant', (data) => {
        workspace.removeChangeListener(handleBlocklyChanges);
        const xml = Blockly.utils.xml.textToDom(data);
        Blockly.Xml.clearWorkspaceAndLoadFromXml(xml, workspace);
        autoSaveLatexContent(workspace);
        compileLatexContent(workspace);
        workspace.addChangeListener(handleBlocklyChanges);
    });
    wsService.onMessage('blocklyUpdate', (data) => {
        workspace.removeChangeListener(handleBlocklyChanges);
        const xml = Blockly.utils.xml.textToDom(data);
        Blockly.Xml.clearWorkspaceAndLoadFromXml(xml, workspace);
        workspace.addChangeListener(handleBlocklyChanges);
    });

    // Listen for cursor movement updates
    wsService.onMessage('cursorMove', updateRemoteCursor);
}

// sendMessage function adjusted to match backend expectations
export function sendMessage(action, data) {
    // Ensuring data is sent as a direct string under 'Data'
    const message = JSON.stringify({ Action: action, Data: data });
    if (wsService.socket && wsService.isConnected) {
        wsService.socket.send(message);
    } else {
        console.error('WebSocket is not connected.');
    }
}


// This function updates or displays the cursor for a remote user.
// Cursor cache to store references to cursor and label elements
const cursorCache = {};

function updateRemoteCursor(data) {
    const { userId, userName, x, y, isVisible } = data;

    // Check if the cursor is already cached
    let cursor = cursorCache[userId]?.cursor;
    let label = cursorCache[userId]?.label;

    // If not in cache, create and cache it
    if (!cursor) {
        cursor = document.createElement('div');
        cursor.id = `cursor-${userId}`;
        cursor.className = 'remote-cursor';
        document.body.appendChild(cursor);

        label = document.createElement('div');
        label.id = `label-${userId}`;
        label.className = 'remote-cursor-label';
        label.textContent = userName;
        document.body.appendChild(label);

        // Add to cache
        cursorCache[userId] = { cursor, label };
    }

    // Update cursor and label visibility based on isVisible
    if (isVisible) {
        cursor.style.left = `${x}px`;
        cursor.style.top = `${y}px`;
        cursor.style.display = ''; // Show cursor

        label.style.left = `${x + 20}px`;
        label.style.top = `${y}px`;
        label.style.display = ''; // Show label
    } else {
        cursor.style.display = 'none'; // Hide cursor
        label.style.display = 'none'; // Hide label
    }
}

export async function sendLocalCursorPosition(event) {
    const response = await fetch('/Editor/GetUserInfo');
    if (!response.ok) {
        console.error('Failed to fetch user info');
        return;
    }
    const {userId, userName} = await response.json();

    // Get the bounding rectangles
    const blocklyWorkspaceRect = document.getElementById('blocklyDiv').getBoundingClientRect();
    const toolboxRect = document.getElementById('toolbox').getBoundingClientRect();
    const pdfViewerRect = document.getElementById('pdfDisplay').getBoundingClientRect();

    // Calculate combined area for visibility checks
    const combinedLeft = Math.min(blocklyWorkspaceRect.left, toolboxRect.left, pdfViewerRect.left);
    const combinedTop = Math.min(blocklyWorkspaceRect.top, toolboxRect.top, pdfViewerRect.top);
    const combinedRight = Math.max(blocklyWorkspaceRect.right, toolboxRect.right, pdfViewerRect.right);
    const combinedBottom = Math.max(blocklyWorkspaceRect.bottom, toolboxRect.bottom, pdfViewerRect.bottom);

    // Determine if the cursor is within the combined area
    let isVisible = event.clientX >= combinedLeft && event.clientX <= combinedRight &&
        event.clientY >= combinedTop && event.clientY <= combinedBottom;

    const cursorPosition = {
        x: event.clientX,
        y: event.clientY,
        userId,
        userName,
        isVisible // This flag determines if the cursor should be displayed or not
    };
    sendMessage('cursorMove', cursorPosition);
}


export function throttle(callback, delay) {
    let lastCall = 0;
    return function(...args) {
        const now = new Date().getTime();
        if (now - lastCall < delay) return;
        lastCall = now;
        callback(...args);
    };
}
