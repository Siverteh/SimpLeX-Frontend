
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
    // Connect to WebSocket.
    connectToProject(projectId);

    // Listen for messages from the WebSocket.
    wsService.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.Action === 'cursorMove') {
            // Call a function to update or display the cursor based on the received data.
            updateRemoteCursor(message.Data);
        }
    };
}

// This function updates or displays the cursor for a remote user.
function updateRemoteCursor(data) {
    const { userId, x, y } = data;
    let cursor = document.getElementById(`cursor-${userId}`);
    if (!cursor) {
        // If a cursor does not exist for the user, create it.
        cursor = document.createElement('div');
        cursor.id = `cursor-${userId}`;
        cursor.className = 'remote-cursor'; // Make sure you have CSS to style this cursor.
        document.body.appendChild(cursor);
    }
    // Update the position of the cursor.
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;
}

// This function sends the local cursor's position to the server.
export function sendLocalCursorPosition(event) {
    console.log("Mouse did move"); // Log every time the function is called due to mouse movement
    const userId = getUserIdFromJWT(); // Retrieve the userId from JWT
    console.log(userId);
    if (!userId) return; // Do nothing if userId is not available

    const cursorPosition = {
        x: event.clientX,
        y: event.clientY,
        userId: userId
    };
    sendMessage('cursorMove', cursorPosition);
}


export function sendMessage(action, data) {
    const message = JSON.stringify({ Action: action, Data: data });
    if (wsService.socket && wsService.isConnected) {
        wsService.socket.send(message);
        console.log("Message sent:", message);
    } else {
        console.error('WebSocket is not connected.');
    }
}

function getUserIdFromJWT() {
    const token = localStorage.getItem('JWTToken');
    if (!token) {
        console.error('JWTToken not found in localStorage');
        return null;
    }

    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) {
            console.error('JWT structure is incorrect');
            return null;
        }
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));

        if (!payload.userId) {
            console.error('userId not found in JWT payload');
            return null;
        }

        console.log("User id:", payload.userId);
        return payload.userId;
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
}



