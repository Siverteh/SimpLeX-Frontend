import {wsService} from "../Collaboration/webSocketService.js";


document.addEventListener('DOMContentLoaded', function () {
    // Toggle chat window
    document.querySelector('.chat-btn').addEventListener('click', function () {
        var chatWindow = document.getElementById('chat-window');
        if (chatWindow.style.display === 'none' || chatWindow.style.display === '') {
            chatWindow.style.display = 'block';
            chatWindow.style.width = '350px';


            document.getElementById('pdf-viewer').style.width = '40%';
            document.getElementById('blocklyDiv').style.width = '40%';

        } else {
            chatWindow.style.display = 'none';
            document.getElementById('pdf-viewer').removeAttribute("style");
            document.getElementById('blocklyDiv').removeAttribute("style");
        }
        chatWindow.scrollTop = chatWindow.scrollHeight;
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
                    content: chatContent,
                    timestamp: new Date().toLocaleString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                        hour12: false
                    }),
                    userId: currentUser.userId,
                    userName: currentUser.userName,
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
    } else if (!currentUser) {
        console.error('User data is null.');
        return;
    }

    const chatContainer = document.querySelector('.chat-content');
    const messageBubble = document.createElement('div');

    // Ternary operation to set the class name based on user ID comparison
    messageBubble.className = currentUser.userId === chatMessage.userId
        ? "talk-bubble-right tri-right btm-right"
        : "talk-bubble-left tri-right btm-left";

    const messageTextContainer = document.createElement('div');
    messageTextContainer.className = 'talktext';

    const messageParagraph = document.createElement('p');
    messageParagraph.textContent = chatMessage.content;
    messageTextContainer.appendChild(messageParagraph);

    // Creating the chat meta div that will hold the username or some other identifier
    const chatMeta = document.createElement('div');
    chatMeta.className = currentUser.userId === chatMessage.userId
        ? "chat-meta-right"
        : "chat-meta-left";

    const chatMetaParagraph = document.createElement('p');
    chatMetaParagraph.textContent = `${chatMessage.userName} - ${chatMessage.timestamp}`
    chatMeta.appendChild(chatMetaParagraph);

    // Append the message text and meta information to the message bubble
    messageBubble.appendChild(messageTextContainer);
    messageBubble.appendChild(chatMeta);

    // Append the message bubble to the chat container
    chatContainer.appendChild(messageBubble);

    // Scroll to the bottom of the chat content to show the new message
    chatContainer.scrollTop = chatContainer.scrollHeight;
}


export async function loadChatMessages(projectId) {
    const response = await fetch(`/Editor/ProxyGetChatMessages?projectId=${projectId}`);
    if (!response.ok) {
        console.error('Failed to load chat messages:', response.statusText);
        return;
    }

    const data = await response.json();
    const messages = data.$values;

    messages.forEach(message => {
        displayMessage({
            messageId: message.messageId,
            content: message.message,
            timestamp: message.timestamp,
            userId: message.userId,
            userName: message.userName
        });
    });
}
