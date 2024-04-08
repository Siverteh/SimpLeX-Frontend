export class WebSocketService {
    constructor() {
        this.socket = null;
        this.messageQueue = []; // Queue to hold messages before connection
        this.isConnected = false;
        this.listeners = {};
    }

    connect(projectId) {
        // Update this URL to match the direct access URL of your backend
        const url = `ws://10.225.149.19:31958/ws/${projectId}`;
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            console.log('WebSocket Connected');
            this.isConnected = true;
            // Send all messages that were queued
            while(this.messageQueue.length > 0) {
                const message = this.messageQueue.shift();
                this.socket.send(message);
            }
        };

        this.socket.onmessage = (event) => {
            console.log('Message:', event.data);
            const message = JSON.parse(event.data);
            if (message.action === 'blockChange') {
                // Apply the block change (make sure this function is defined)
                applyBlockChange(message.data);
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
        const message = JSON.parse(event.data);
        if (this.listeners[message.Action]) {
            this.listeners[message.Action].forEach(callback => callback(message.Data));
        }
    }

    sendMessage(action, data) {
        if (this.isConnected) {
            const message = JSON.stringify({ action, data });
            this.socket.send(message);
        } else {
            console.error('WebSocket is not connected.');
        }
    }

}