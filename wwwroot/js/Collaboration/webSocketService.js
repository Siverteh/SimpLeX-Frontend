class WebSocketService {
    constructor() {
        this.socket = null;
        this.messageQueue = [];
        this.isConnected = false;
        this.listeners = {};
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.connectionTimeout = null;
    }

    connect(projectId, userName) {
        this.lastProjectId = projectId; // Save last projectId
        this.lastUserName = userName;   // Save last userName
        this.disconnect(); // Ensure any existing connection is closed 

        const url = `ws://127.0.0.1:41279/ws/${projectId}?userName=${encodeURIComponent(userName)}`;
        this.socket = new WebSocket(url);

        // Setup a connection timeout
        this.connectionTimeout = setTimeout(() => {
            if (!this.isConnected) {
                console.error('Connection timeout. Attempting to reconnect...');
                this.socket.close();
                this.reconnect(); // Attempt to reconnect
            }
        }, 10000); // 10 seconds timeout

        this.socket.onopen = () => {
            clearTimeout(this.connectionTimeout);
            console.log('WebSocket Connected');
            this.isConnected = true;
            this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
            this.flushMessageQueue();
        };

        this.socket.onmessage = (event) => this.handleMessage(event);

        this.socket.onclose = () => {
            console.log('WebSocket Disconnected');
            this.isConnected = false;
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnect(); // Optional: Attempt to reconnect
            }
        };

        this.socket.onerror = (error) => {
            console.log('WebSocket Error:', error);
            this.isConnected = false;
            this.socket.close();
        };
    }

    disconnect() {
        if (this.socket) {
            clearTimeout(this.connectionTimeout); // Clear any pending timeout
            if (this.socket.readyState === WebSocket.OPEN) {
                this.socket.close(1000); // Normal closure
            }
            this.socket = null;
            this.isConnected = false;
        }
    }

    reconnect() {
        this.reconnectAttempts++;
        console.log(`Reconnecting attempt ${this.reconnectAttempts}`);
        setTimeout(() => {
            this.connect(this.lastProjectId, this.lastUserName);
        }, Math.pow(2, this.reconnectAttempts) * 1000); // Exponential backoff
    }

    flushMessageQueue() {
        while (this.messageQueue.length > 0 && this.isConnected) {
            const message = this.messageQueue.shift();
            this.socket.send(message);
        }
    }

    handleMessage(event) {
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
    }

    onMessage(action, callback) {
        if (!this.listeners[action]) {
            this.listeners[action] = [];
        }
        this.listeners[action].push(callback);
    }

    sendMessage(action, data) {
        const message = JSON.stringify({Action: action, Data: data});
        if (this.isConnected) {
            this.socket.send(message);
        } else {
            console.error('WebSocket is not connected, queuing message');
            this.messageQueue.push(message);
        }
    }
}

export const wsService = new WebSocketService();
