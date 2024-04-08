
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
    const { userId, userName, x, y } = data; // Including userName in the data
    let cursor = document.getElementById(`cursor-${userId}`);
    let label;
    if (!cursor) {
        cursor = document.createElement('div');
        cursor.id = `cursor-${userId}`;
        cursor.className = 'remote-cursor';
        document.body.appendChild(cursor);

        // Create a label for the userName
        label = document.createElement('div');
        label.id = `label-${userId}`;
        label.className = 'remote-cursor-label'; // Add appropriate styling for this
        label.textContent = userName; // Set the userName as text
        document.body.appendChild(label);
    } else {
        // If the cursor already exists, just find the label to update it
        label = document.getElementById(`label-${userId}`);
    }

    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;

    // Position the label near the cursor
    label.style.left = `${x + 20}px`; // Offset by 20px or adjust as needed
    label.style.top = `${y}px`;
}


// This function sends the local cursor's position to the server.
export function sendMessage(action, data) {
    const message = JSON.stringify({ Action: action, Data: data });
    if (wsService.socket && wsService.isConnected) {
        wsService.socket.send(message);
        console.log("Message sent:", message);
    } else {
        console.error('WebSocket is not connected.');
    }
}


// Make sure this function is async to use await inside
export async function sendLocalCursorPosition(event) {
    console.log("Mouse did move");
    try {
        // Fetching user info instead of just userId
        const response = await fetch('/Editor/GetUserInfo');
        if (!response.ok) {
            throw new Error('Failed to fetch user info');
        }
        const { userId, userName } = await response.json();

        console.log('User info:', userId, userName); // Log both userId and userName

        if (!userId || !userName) {
            console.error("No user info found");
            return; // Do not proceed if user info is not available
        }

        const cursorPosition = {
            x: event.clientX,
            y: event.clientY,
            userId: userId,
            userName: userName // Including userName in the cursor position object
        };
        sendMessage('cursorMove', cursorPosition);
    } catch (error) {
        console.error('Error fetching user info:', error);
    }
}

