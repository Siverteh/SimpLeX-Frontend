export class WebSocketService {
    constructor() {
        this.socket = null;
        this.messageQueue = []; // Queue to hold messages before connection
        this.isConnected = false;
        this.listeners = {};
    }

    connect(projectId, userName) {
        const url = `ws://10.225.149.19:31958/ws/${projectId}?userName=${encodeURIComponent(userName)}`;
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            console.log('WebSocket Connected');
            this.isConnected = true;
            this.sendMessage('userConnected', { userName });
            while (this.messageQueue.length > 0) {
                const message = this.messageQueue.shift();
                this.socket.send(message);
            }
        };

        this.socket.onmessage = (event) => {
            if (typeof event.data === 'string') {
                try {
                    const message = JSON.parse(event.data);
                    console.log("Received message:", message);
                    if (this.listeners[message.Action]) {
                        this.listeners[message.Action].forEach(callback => callback(message.Data));
                    }
                } catch (error) {
                    console.error("Error parsing message:", error);
                }
            } else {
                console.error('Message format is not a string:', event.data);
            }
        };

        this.socket.onclose = () => {
            console.log('WebSocket Disconnected');
            this.isConnected = false;
        };

        this.socket.onerror = (error) => {
            console.log('WebSocket Error:', error);
            this.isConnected = false;
        };
    }


    onMessage(action, callback) {
        this.listeners[action] = this.listeners[action] || [];
        this.listeners[action].push(callback);
    }

    handleMessage(event) {
        if (typeof event.data === 'string') {
            this.processMessage(event.data);
        } else {
            // Assume binary data and read it as text
            const reader = new FileReader();
            reader.onload = () => {
                this.processMessage(reader.result);
            };
            reader.readAsText(event.data);
        }
    }

    processMessage(data) {
        const message = JSON.parse(data);
        console.log("Parsed message:", message);

        if (message.Action === "updateCollaborators") {
            updateCollaboratorsDisplay(message.Data);
        } else if (this.listeners[message.Action]) {
            this.listeners[message.Action].forEach(callback => callback(message.Data));
        }
    }



    sendMessage(action, data) {
        const message = JSON.stringify({ Action: action, Data: data });
        if (this.isConnected) {
            this.socket.send(message);
        } else {
            console.error('WebSocket is not connected.');
            this.messageQueue.push(message); // Queue messages if not connected
        }
    }
}



