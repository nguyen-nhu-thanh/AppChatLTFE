const WS_URL = 'wss://chat.longapp.site/chat/chat';

export type ChatEvent =
    | 'REGISTER'
    | 'LOGIN'
    | 'RE_LOGIN'
    | 'LOGOUT'
    | 'CREATE_ROOM'
    | 'JOIN_ROOM'
    | 'GET_ROOM_CHAT_MES'
    | 'GET_PEOPLE_CHAT_MES'
    | 'SEND_CHAT'
    | 'CHECK_USER_ONLINE'
    | 'CHECK_USER_EXIST'
    | 'GET_USER_LIST';

interface ChatMessage {
    action: 'onchat';
    data:  {
        event: ChatEvent;
        data?: any;
    };
}

type MessageCallback = (data: any) => void;

class WebSocketService {
    private socket: WebSocket | null = null;
    private messageCallbacks: Map<string, MessageCallback[]> = new Map();
    private isConnected: boolean = false;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private pendingMessages: ChatMessage[] = [];

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                if (this.socket) {
                    this.socket.close();
                }

                console.log('🔌 Connecting to:', WS_URL);
                this.socket = new WebSocket(WS_URL);

                this.socket.onopen = () => {
                    console.log('WebSocket connected!');
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    this.flushPendingMessages();
                    resolve();
                };

                this.socket.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        console.log('Received:', data);
                        this.handleMessage(data);
                    } catch (error) {
                        console.error('Parse error:', error);
                    }
                };

                this.socket.onerror = (error) => {
                    console.error('WebSocket error:', error);
                };

                this.socket.onclose = (event) => {
                    console.log('WebSocket disconnected', event.code);
                    this.isConnected = false;
                    if (event.code !== 1000) {
                        this.attemptReconnect();
                    }
                };

                setTimeout(() => {
                    if (this.socket?.readyState === WebSocket.CONNECTING) {
                        this.socket.close();
                        reject(new Error('Connection timeout'));
                    }
                }, 10000);

            } catch (error) {
                reject(error);
            }
        });
    }

    private flushPendingMessages() {
        while (this.pendingMessages.length > 0) {
            const message = this.pendingMessages.shift();
            if (message) {
                this.sendImmediate(message);
            }
        }
    }

    private attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnecting...  Attempt ${this.reconnectAttempts}`);
            setTimeout(() => this.connect(), 3000);
        }
    }

    private handleMessage(data: any) {
        const eventType = data.event;
        const callbacks = this.messageCallbacks.get(eventType) || [];
        callbacks.forEach((callback) => callback(data));

        const allCallbacks = this.messageCallbacks.get('*') || [];
        allCallbacks.forEach((callback) => callback(data));
    }

    private sendImmediate(message: ChatMessage) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            console.log('Sending:', message);
            this.socket.send(JSON.stringify(message));
        }
    }

    private send(message: ChatMessage) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.sendImmediate(message);
        } else {
            console.log('Queueing message:', message);
            this.pendingMessages.push(message);
        }
    }

    on(event: string, callback: MessageCallback) {
        const callbacks = this.messageCallbacks.get(event) || [];
        callbacks.push(callback);
        this.messageCallbacks.set(event, callbacks);
    }

    off(event: string, callback?: MessageCallback) {
        if (callback) {
            const callbacks = this.messageCallbacks.get(event) || [];
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
                this.messageCallbacks.set(event, callbacks);
            }
        } else {
            this.messageCallbacks.delete(event);
        }
    }

    // ========== API METHODS ==========

    register(username: string, password:  string) {
        this.send({
            action: 'onchat',
            data: { event: 'REGISTER', data:  { user: username, pass: password } },
        });
    }

    login(username: string, password: string) {
        this.send({
            action: 'onchat',
            data:  { event: 'LOGIN', data: { user: username, pass:  password } },
        });
    }

    reLogin(username:  string, code: string) {
        this.send({
            action: 'onchat',
            data: { event: 'RE_LOGIN', data: { user:  username, code: code } },
        });
    }

    logout() {
        this.send({
            action: 'onchat',
            data: { event:  'LOGOUT' },
        });
    }

    createRoom(roomName: string) {
        this.send({
            action: 'onchat',
            data: { event: 'CREATE_ROOM', data: { name: roomName } },
        });
    }

    joinRoom(roomName: string) {
        this.send({
            action: 'onchat',
            data: { event: 'JOIN_ROOM', data: { name:  roomName } },
        });
    }

    getRoomMessages(roomName: string, page: number = 1) {
        this.send({
            action: 'onchat',
            data:  { event: 'GET_ROOM_CHAT_MES', data: { name: roomName, page } },
        });
    }

    getPeopleMessages(username: string, page: number = 1) {
        this.send({
            action: 'onchat',
            data: { event: 'GET_PEOPLE_CHAT_MES', data: { name: username, page } },
        });
    }

    sendMessage(type: 'room' | 'people', to: string, message: string) {
        this.send({
            action: 'onchat',
            data: { event: 'SEND_CHAT', data:  { type, to, mes: message } },
        });
    }

    checkUserOnline(username: string) {
        this.send({
            action: 'onchat',
            data: { event: 'CHECK_USER_ONLINE', data: { user:  username } },
        });
    }

    checkUserExist(username: string) {
        this.send({
            action: 'onchat',
            data:  { event: 'CHECK_USER_EXIST', data: { user: username } },
        });
    }

    getUserList() {
        this.send({
            action: 'onchat',
            data: { event: 'GET_USER_LIST' },
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.close(1000, 'User disconnect');
            this.socket = null;
        }
        this.isConnected = false;
    }

    getIsConnected(): boolean {
        return this.isConnected;
    }
}

const wsService = new WebSocketService();
export default wsService;
