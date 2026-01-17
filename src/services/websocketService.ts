const USE_MOCK = false;

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
    data: {
        event: ChatEvent;
        data?:  any;
    };
}

type MessageCallback = (data: any) => void;

const MOCK_USERS = [
    { name: '1', actionTime: 'online' },
    { name: '2', actionTime: 'offline' },
    { name: '3', actionTime: 'online' },
    { name: '4', actionTime: 'online' },
];

const MOCK_MESSAGES:  Record<string, any[]> = {
    'General': [
        { name: '1', mes: 'Hi', createAt: Date.now() - 60000 },
        { name:  '2', mes: 'Hello', createAt: Date.now() - 30000 },
    ],
};

class WebSocketService {
    private socket: WebSocket | null = null;
    private messageCallbacks: Map<string, MessageCallback[]> = new Map();
    private isConnected:  boolean = false;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private currentUser: string = '';

    connect(): Promise<void> {
        // MOCK
        if (USE_MOCK) {
            return new Promise((resolve) => {
                console.log('Mock connecting');
                setTimeout(() => {
                    this.isConnected = true;
                    console.log('Mock connected');
                    resolve();
                }, 500);
            });
        }

        // Real
        return new Promise((resolve, reject) => {
            try {
                if (this.socket) {
                    this.socket.close();
                }

                this.socket = new WebSocket(WS_URL);

                this.socket.onopen = () => {
                    console.log('WebSocket connected');
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
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

    private attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnecting...  ${this.reconnectAttempts}`);
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

    // Mock
    private mockResponse(event: string, data:  any, delay: number = 300) {
        setTimeout(() => {
            this.handleMessage({ status: 'success', event, data });
        }, delay);
    }

    private send(message: ChatMessage) {
        // MOCK
        if (USE_MOCK) {
            console.log('Mock send:', message);
            this.mockHandleSend(message);
            return;
        }

        // Real
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.error('WebSocket not connected');
        }
    }

    // Mock
    private mockHandleSend(message: ChatMessage) {
        const { event, data } = message.data;

        switch (event) {
            case 'REGISTER':
                this.mockResponse('REGISTER', { mes: 'Đăng ký thành công!' });
                break;

            case 'LOGIN':
                this.currentUser = data.user;
                this.mockResponse('LOGIN', {
                    RE_LOGIN_CODE: 'mock_code_123',
                    user: data.user
                });
                break;

            case 'RE_LOGIN':
                this.currentUser = data.user;
                this.mockResponse('RE_LOGIN', { user: data.user });
                break;

            case 'LOGOUT':
                this.currentUser = '';
                this.mockResponse('LOGOUT', {});
                break;

            case 'GET_USER_LIST':
                this.mockResponse('GET_USER_LIST', MOCK_USERS);
                break;

            case 'CREATE_ROOM':
                this.mockResponse('CREATE_ROOM', { name: data.name });
                break;

            case 'JOIN_ROOM':
                this.mockResponse('JOIN_ROOM', { name:  data.name });
                break;

            case 'GET_ROOM_CHAT_MES':
                const roomMsgs = MOCK_MESSAGES[data.name] || [];
                this.mockResponse('GET_ROOM_CHAT_MES', roomMsgs);
                break;

            case 'GET_PEOPLE_CHAT_MES':
                // Mock empty or some messages
                this.mockResponse('GET_PEOPLE_CHAT_MES', [
                    { name: data.name, mes: 'Hi', createAt: Date.now() - 10000 },
                ]);
                break;

            case 'SEND_CHAT':
                setTimeout(() => {
                    if (Math.random() > 0.5) {
                        this.handleMessage({
                            status: 'success',
                            event: 'SEND_CHAT',
                            data: {
                                type: data.type,
                                from: data.type === 'room' ? 'alice' : data.to,
                                to: data.to,
                                mes: 'OK',
                            }
                        });
                    }
                }, 1500);
                break;

            default:
                console.log('Unhandled mock event:', event);
        }
    }

    on(event: string, callback: MessageCallback) {
        const callbacks = this.messageCallbacks.get(event) || [];
        callbacks.push(callback);
        this.messageCallbacks.set(event, callbacks);
    }

    off(event: string, callback?:  MessageCallback) {
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

    // API

    register(username: string, password: string) {
        this.send({
            action: 'onchat',
            data: { event: 'REGISTER', data: { user: username, pass: password } },
        });
    }

    login(username: string, password:  string) {
        this.send({
            action: 'onchat',
            data: { event: 'LOGIN', data: { user: username, pass: password } },
        });
    }

    reLogin(username: string, code: string) {
        this.send({
            action: 'onchat',
            data:  { event: 'RE_LOGIN', data: { user: username, code:  code } },
        });
    }

    logout() {
        this.send({
            action: 'onchat',
            data: { event: 'LOGOUT' },
        });
    }

    createRoom(roomName: string) {
        this.send({
            action: 'onchat',
            data:  { event: 'CREATE_ROOM', data: { name: roomName } },
        });
    }

    joinRoom(roomName: string) {
        this.send({
            action: 'onchat',
            data: { event: 'JOIN_ROOM', data: { name: roomName } },
        });
    }

    getRoomMessages(roomName: string, page: number = 1) {
        this.send({
            action: 'onchat',
            data: { event: 'GET_ROOM_CHAT_MES', data: { name: roomName, page } },
        });
    }

    getPeopleMessages(username: string, page: number = 1) {
        this.send({
            action: 'onchat',
            data: { event: 'GET_PEOPLE_CHAT_MES', data:  { name: username, page } },
        });
    }

    sendMessage(type: 'room' | 'people', to: string, message: string) {
        this.send({
            action: 'onchat',
            data: { event: 'SEND_CHAT', data: { type, to, mes: message } },
        });
    }

    checkUserOnline(username: string) {
        this.send({
            action: 'onchat',
            data: { event: 'CHECK_USER_ONLINE', data: { user: username } },
        });
    }

    checkUserExist(username: string) {
        this.send({
            action: 'onchat',
            data: { event: 'CHECK_USER_EXIST', data: { user: username } },
        });
    }

    getUserList() {
        this.send({
            action: 'onchat',
            data: { event: 'GET_USER_LIST' },
        });
    }

    disconnect() {
        if (USE_MOCK) {
            this.isConnected = false;
            console.log('Mock disconnected');
            return;
        }
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