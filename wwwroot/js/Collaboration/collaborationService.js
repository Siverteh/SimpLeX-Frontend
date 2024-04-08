
import { WebSocketService } from './webSocketService.js';


const wsService = new WebSocketService();

function connectToProject(projectId) {
    if (projectId) {
        wsService.connect(projectId);
    } else {
        console.error("Project ID is not available.");
    }
}

export function initializeCollaboration(projectId) {
    connectToProject(projectId);

    // Register a listener for cursorMove messages
    wsService.onMessage('cursorMove', updateRemoteCursor);
}


// This function updates or displays the cursor for a remote user.
// This function updates or displays the cursor for a remote user.
function updateRemoteCursor(data) {
    console.log("Started updateRemoteCursor function");
    const { userId, userName, x, y, isVisible } = data; // Assuming isVisible is a boolean indicating cursor visibility

    let cursor = document.getElementById(`cursor-${userId}`);
    let label = document.getElementById(`label-${userId}`);

    if (!cursor) {
        // Create the cursor element if it doesn't exist
        cursor = document.createElement('div');
        cursor.id = `cursor-${userId}`;
        cursor.className = 'remote-cursor';
        document.body.appendChild(cursor);

        // Create a label for the userName
        label = document.createElement('div');
        label.id = `label-${userId}`;
        label.className = 'remote-cursor-label'; // Make sure to have CSS for this class
        label.textContent = userName;
        document.body.appendChild(label);
    }

    if (isVisible) {
        // If cursor is supposed to be visible, update position and show it
        cursor.style.left = `${x}px`;
        cursor.style.top = `${y}px`;
        cursor.style.display = ''; // Show the cursor

        // Position and show the label near the cursor
        label.style.left = `${x + 20}px`; // Adjust the offset as needed
        label.style.top = `${y}px`;
        label.style.display = ''; // Show the label
    } else {
        // Hide the cursor and label if not supposed to be visible
        cursor.style.display = 'none';
        label.style.display = 'none';
    }
}



// This function sends the local cursor's position to the server.
export function sendMessage(action, data) {
    const message = JSON.stringify({ Action: action, Data: data });
    if (wsService.socket && wsService.isConnected) {
        wsService.socket.send(message);
        //console.log("Message sent:", message);
    } else {
        console.error('WebSocket is not connected.');
    }
}

export async function sendLocalCursorPosition(event) {
    const response = await fetch('/Editor/GetUserInfo');
    if (!response.ok) {
        console.error('Failed to fetch user info');
        return;
    }
    const { userId, userName } = await response.json();

    // Get the bounding rectangles
    const blocklyWorkspaceRect = document.getElementById('blocklyDiv').getBoundingClientRect();
    const toolboxRect = document.getElementById('toolbox').getBoundingClientRect();
    const pdfViewerRect = document.getElementById('pdfDisplay').getBoundingClientRect();

    // Calculate combined area for visibility checks with a margin for leniency
    const margin = -50; // pixels of leniency on each side
    const combinedLeft = Math.min(blocklyWorkspaceRect.left, toolboxRect.left, pdfViewerRect.left) - margin;
    const combinedTop = Math.min(blocklyWorkspaceRect.top, toolboxRect.top, pdfViewerRect.top) - margin;
    const combinedRight = Math.max(blocklyWorkspaceRect.right, toolboxRect.right, pdfViewerRect.right) + margin;
    const combinedBottom = Math.max(blocklyWorkspaceRect.bottom, toolboxRect.bottom, pdfViewerRect.bottom) + margin;

    // Determine if the cursor is within the combined area with leniency
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

