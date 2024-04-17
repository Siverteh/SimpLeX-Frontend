import {wsService} from "../Collaboration/webSocketService.js";


document.addEventListener('DOMContentLoaded', function () {
    // Toggle chat window
    document.querySelector('.chat-btn').addEventListener('click', function () {
        var chatWindow = document.getElementById('chat-window');
        if (chatWindow.style.display === 'none' || chatWindow.style.display === '') {
            chatWindow.style.display = 'block';
            chatWindow.style.width = '20%';
            document.getElementById('pdf-viewer').style.width = '40%';
            document.getElementById('blocklyDiv').style.width = '40%';
        } else {
            chatWindow.style.display = 'none';
            document.getElementById('pdf-viewer').removeAttribute("style");
            document.getElementById('blocklyDiv').removeAttribute("style");
        }
    });
});


// Handle key press in chat input
const input = document.getElementById("chat-message-input")
input.addEventListener("keydown", (event) => {
    if (event.code === "Enter") {
        console.log("pressed enter")
        sendChat();
    }

});

let currentUser = null;

async function fetchUserData() {
    const response = await fetch('/Editor/GetUserInfo');
    if (!response.ok) {
        console.error('Failed to fetch user info');
        return;
    }
    currentUser = await response.json();
}

// Send message and display in chat content
async function sendChat() {
    const inputElement = document.querySelector('#chat-message-input');
    const chatContent = inputElement.value.trim();

    if (chatContent === "") {
        console.error('Cannot send an empty message.');
        return;
    }
    
    inputElement.value = "";
    fetchUserData().then(async r => {
            if (currentUser) {
                const chat = {
                    userName: currentUser.userName,
                    content: chatContent,
                    timestamp: new Date().toISOString(),
                    userId: currentUser.userId,
                };
                wsService.sendMessage('newChat', chat);
                await displayMessage(chat);
            } else {
                console.error('Failed to send message.')
            }
        }
    );
}

// Function to append messages to the chat content area
export async function displayMessage(chatMessage) {
    
    await fetchUserData();
    
    if (!chatMessage) {
        console.error('Chat message is null.');
        return;
    } else if (!currentUser){
        console.error('User data is null.');
        return;
    }

    const chatContainer = document.querySelector('.chat-content');

    // Create the chat bubble
    const messageBubble = document.createElement('div');
    messageBubble.classList.add('chat-bubble');

    // Check if the current user sent the message
    const isCurrentUser = chatMessage.userName === currentUser.userName;

    // Set the background color based on the user role or any specific criteria
    const bubbleColor = isCurrentUser ? 'blue' : 'grey';
    messageBubble.style.backgroundColor = bubbleColor;

    // Additional styling for the chat bubble here...

    // Align message to the right if it's from the current user
    if (isCurrentUser) {
        messageBubble.style.marginLeft = 'auto';
    } else {
        messageBubble.style.marginRight = 'auto';
    }

    // Add the text to the bubble
    const messageText = document.createElement('span');
    messageText.textContent = chatMessage.content;
    messageBubble.appendChild(messageText);

    // Add timestamp
    const timestamp = document.createElement('span');
    timestamp.textContent = chatMessage.timestamp;
    // Styling for the timestamp here...

    // Append the bubble to the chat content area
    chatContainer.appendChild(messageBubble);

    // Scroll to the bottom of the chat content to show the new message
    chatContainer.scrollTop = chatContainer.scrollHeight;
}
