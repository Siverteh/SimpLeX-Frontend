
import { WebSocketService } from './webSocketService.js';

import {debounce} from "../Editor/PdfViewerScripts.js";


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
        if ([Blockly.Events.MOVE, Blockly.Events.CREATE, Blockly.Events.DELETE, Blockly.Events.CHANGE].includes(event.type)) {
            const xml = Blockly.Xml.workspaceToDom(workspace);
            const xmlText = Blockly.Xml.domToText(xml);
            console.log("Broadcasting Blockly changes:", xmlText);
            // Send workspace updates as a direct string, now throttled
            sendMessage('blocklyUpdate', xmlText);
        }
    }, 100)

    // Listen to Blockly workspace changes
    workspace.addChangeListener(handleBlocklyChanges);

    // Handle incoming Blockly updates
    wsService.onMessage('blocklyUpdate', (data) => {
        // Temporary remove the listener to prevent sending back the received changes
        workspace.removeChangeListener(handleBlocklyChanges);
        console.log("onMessage blocklyUpdate:", data.toString());

        // Apply the Blockly changes received from other users
        const xml = Blockly.utils.xml.textToDom(data);
        Blockly.Xml.clearWorkspaceAndLoadFromXml(xml, workspace);

        // Re-apply the listener after changes are made
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

export async function sendLocalCursorPosition(event, workspace) {
    const response = await fetch('/Editor/GetUserInfo');
    if (!response.ok) {
        console.error('Failed to fetch user info');
        return;
    }
    const { userId, userName } = await response.json();

    // Obtain the workspace SVG element
    const svgElement = workspace.getParentSvg();

    // Use Blockly's utils.browserEvents.mouseToSvg function to translate mouse event coordinates
    // Need to obtain the inverted screen CTM (Current Transformation Matrix)
    const ctm = svgElement.getScreenCTM();
    const matrix = ctm ? ctm.inverse() : null;
    const svgPoint = Blockly.utils.browserEvents.mouseToSvg(event, svgElement, matrix);

    // Check if the SVGPoint is within the visible workspace bounds for cursor visibility
    let isVisible = svgPoint.x >= 0 && svgPoint.y >= 0 &&
        svgPoint.x <= workspace.getWidth() && svgPoint.y <= workspace.getHeight();

    const cursorPosition = {
        x: svgPoint.x,
        y: svgPoint.y,
        userId,
        userName,
        isVisible
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
