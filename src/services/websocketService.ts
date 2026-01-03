// // URL WebSocket server
// const WS_URL = 'wss://chat.longapp.site/chat/chat';
//
// export type ChatEvent =
//     | 'REGISTER'
//     | 'LOGIN'
//     | 'RE_LOGIN'
//     | 'LOGOUT'
//     | 'CREATE_ROOM'
//     | 'JOIN_ROOM'
//     | 'GET_ROOM_CHAT_MES'
//     | 'GET_PEOPLE_CHAT_MES'
//     | 'SEND_CHAT'
//     | 'CHECK_USER_ONLINE'
//     | 'CHECK_USER_EXIST'
//     | 'GET_USER_LIST';
//
// interface ChatMessage {
//     action: 'onchat';
//     data:  {
//         event: ChatEvent;
//         data?:  any;
//     };
// }
//
// type MessageCallback = (data: any) => void;
//
// class WebSocketService {
//     private socket: WebSocket | null = null;
//     private messageCallbacks: Map<string, MessageCallback[]> = new Map();
//     private isConnected:  boolean = false;
//     private reconnectAttempts: number = 0;
//     private maxReconnectAttempts: number = 5;
//     private pendingMessages: ChatMessage[] = []; // 🔧 Queue cho messages chờ gửi
//     private connectionPromise: Promise<void> | null = null; // 🔧 Track connection state
//
//     connect(): Promise<void> {
//         // 🔧 Nếu đang kết nối, return promise hiện tại
//         if (this.connectionPromise) {
//             return this.connectionPromise;
//         }
//
//         // 🔧 Nếu đã kết nối, return resolved
//         if (this.isConnected && this.socket?. readyState === WebSocket. OPEN) {
//             return Promise.resolve();
//         }
//
//         this.connectionPromise = new Promise((resolve, reject) => {
//             try {
//                 // 🔧 Đóng socket cũ nếu có
//                 if (this.socket) {
//                     this.socket.close();
//                 }
//
//                 this.socket = new WebSocket(WS_URL);
//
//                 this.socket.onopen = () => {
//                     console.log('✅ WebSocket connected! ');
//                     this.isConnected = true;
//                     this.reconnectAttempts = 0;
//                     this.connectionPromise = null;
//
//                     // 🔧 Gửi các messages đang chờ
//                     this.flushPendingMessages();
//
//                     resolve();
//                 };
//
//                 this. socket.onmessage = (event) => {
//                     try {
//                         const data = JSON.parse(event.data);
//                         console.log('📩 Received:', data);
//                         this.handleMessage(data);
//                     } catch (error) {
//                         console.error('Parse error:', error);
//                     }
//                 };
//
//                 this. socket.onerror = (error) => {
//                     console.error('❌ WebSocket error:', error);
//                     this.connectionPromise = null;
//                     // Không reject ngay, để onclose xử lý
//                 };
//
//                 this.socket.onclose = (event) => {
//                     console.log('🔌 WebSocket disconnected', event. code, event.reason);
//                     this.isConnected = false;
//                     this.connectionPromise = null;
//
//                     // 🔧 Chỉ reconnect nếu không phải đóng có chủ đích
//                     if (event.code !== 1000) {
//                         this.attemptReconnect();
//                     }
//                 };
//
//                 // 🔧 Timeout cho connection
//                 setTimeout(() => {
//                     if (this.socket?.readyState === WebSocket. CONNECTING) {
//                         this.socket. close();
//                         this.connectionPromise = null;
//                         reject(new Error('Connection timeout'));
//                     }
//                 }, 10000);
//
//             } catch (error) {
//                 this.connectionPromise = null;
//                 reject(error);
//             }
//         });
//
//         return this. connectionPromise;
//     }
//
//     // 🔧 Gửi messages đang chờ
//     private flushPendingMessages() {
//         while (this.pendingMessages.length > 0) {
//             const message = this.pendingMessages. shift();
//             if (message) {
//                 this.sendImmediate(message);
//             }
//         }
//     }
//
//     private attemptReconnect() {
//         if (this.reconnectAttempts < this.maxReconnectAttempts) {
//             this.reconnectAttempts++;
//             console.log(`🔄 Reconnecting... Attempt ${this.reconnectAttempts}`);
//             setTimeout(() => this.connect(), 3000);
//         } else {
//             console.error('❌ Max reconnect attempts reached');
//         }
//     }
//
//     private handleMessage(data: any) {
//         const eventType = data.event;
//         const callbacks = this.messageCallbacks.get(eventType) || [];
//         callbacks.forEach((callback) => callback(data));
//
//         const allCallbacks = this.messageCallbacks.get('*') || [];
//         allCallbacks.forEach((callback) => callback(data));
//     }
//
//     // 🔧 Gửi ngay lập tức (internal)
//     private sendImmediate(message: ChatMessage) {
//         if (this.socket && this.socket.readyState === WebSocket. OPEN) {
//             console.log('📤 Sending:', message);
//             this.socket.send(JSON.stringify(message));
//         } else {
//             console.error('❌ Cannot send - socket not ready');
//         }
//     }
//
//     // 🔧 Gửi message - có queue nếu chưa kết nối
//     private send(message: ChatMessage) {
//         if (this.socket && this.socket.readyState === WebSocket.OPEN) {
//             this.sendImmediate(message);
//         } else if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
//             // 🔧 Đang kết nối - thêm vào queue
//             console.log('⏳ Queueing message (connecting):', message);
//             this.pendingMessages.push(message);
//         } else {
//             // 🔧 Chưa kết nối - thử kết nối rồi gửi
//             console.log('⏳ Queueing message (not connected):', message);
//             this.pendingMessages.push(message);
//             this.connect().catch(console.error);
//         }
//     }
//
//     on(event: string, callback: MessageCallback) {
//         const callbacks = this.messageCallbacks. get(event) || [];
//         callbacks.push(callback);
//         this.messageCallbacks.set(event, callbacks);
//     }
//
//     off(event: string, callback?:  MessageCallback) {
//         if (callback) {
//             const callbacks = this.messageCallbacks.get(event) || [];
//             const index = callbacks.indexOf(callback);
//             if (index > -1) {
//                 callbacks.splice(index, 1);
//                 this.messageCallbacks.set(event, callbacks);
//             }
//         } else {
//             this.messageCallbacks.delete(event);
//         }
//     }
//
//     // ========== API METHODS ==========
//
//     register(username: string, password: string) {
//         this.send({
//             action: 'onchat',
//             data: {
//                 event: 'REGISTER',
//                 data: { user: username, pass: password },
//             },
//         });
//     }
//
//     login(username: string, password: string) {
//         this.send({
//             action: 'onchat',
//             data: {
//                 event: 'LOGIN',
//                 data: { user: username, pass: password },
//             },
//         });
//     }
//
//     reLogin(username: string, code: string) {
//         this.send({
//             action: 'onchat',
//             data: {
//                 event: 'RE_LOGIN',
//                 data: { user: username, code: code },
//             },
//         });
//     }
//
//     logout() {
//         this.send({
//             action: 'onchat',
//             data:  { event: 'LOGOUT' },
//         });
//     }
//
//     createRoom(roomName: string) {
//         this.send({
//             action: 'onchat',
//             data: {
//                 event: 'CREATE_ROOM',
//                 data: { name: roomName },
//             },
//         });
//     }
//
//     joinRoom(roomName: string) {
//         this.send({
//             action: 'onchat',
//             data: {
//                 event:  'JOIN_ROOM',
//                 data: { name: roomName },
//             },
//         });
//     }
//
//     getRoomMessages(roomName: string, page: number = 1) {
//         this.send({
//             action: 'onchat',
//             data: {
//                 event: 'GET_ROOM_CHAT_MES',
//                 data: { name: roomName, page: page },
//             },
//         });
//     }
//
//     getPeopleMessages(username: string, page: number = 1) {
//         this.send({
//             action: 'onchat',
//             data: {
//                 event: 'GET_PEOPLE_CHAT_MES',
//                 data: { name: username, page: page },
//             },
//         });
//     }
//
//     sendMessage(type: 'room' | 'people', to: string, message: string) {
//         this.send({
//             action: 'onchat',
//             data: {
//                 event:  'SEND_CHAT',
//                 data: { type: type, to: to, mes: message },
//             },
//         });
//     }
//
//     checkUserOnline(username: string) {
//         this.send({
//             action: 'onchat',
//             data: {
//                 event:  'CHECK_USER_ONLINE',
//                 data: { user:  username },
//             },
//         });
//     }
//
//     checkUserExist(username: string) {
//         this.send({
//             action: 'onchat',
//             data: {
//                 event: 'CHECK_USER_EXIST',
//                 data: { user: username },
//             },
//         });
//     }
//
//     getUserList() {
//         this.send({
//             action: 'onchat',
//             data: { event: 'GET_USER_LIST' },
//         });
//     }
//
//     disconnect() {
//         this.pendingMessages = []; // Clear queue
//         if (this.socket) {
//             this.socket.close(1000, 'User disconnect'); // 🔧 Normal close
//             this.socket = null;
//         }
//         this.isConnected = false;
//         this.connectionPromise = null;
//     }
//
//     getIsConnected(): boolean {
//         return this.isConnected && this.socket?.readyState === WebSocket.OPEN;
//     }
// }
//
// const wsService = new WebSocketService();
// export default wsService;

// 🎭 MOCK MODE - Đặt true để test không cần server
const USE_MOCK = true;

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

// 🎭 Mock data
const MOCK_USERS = [
    { name: 'alice', actionTime: 'online' },
    { name: 'bob', actionTime: 'offline' },
    { name: 'charlie', actionTime: 'online' },
    { name: 'david', actionTime: 'online' },
];

const MOCK_MESSAGES:  Record<string, any[]> = {
    'General': [
        { name: 'alice', mes: 'Xin chào mọi người! ', createAt: Date.now() - 60000 },
        { name:  'bob', mes: 'Hello! ', createAt: Date.now() - 30000 },
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
        // 🎭 MOCK MODE
        if (USE_MOCK) {
            return new Promise((resolve) => {
                console.log('🎭 Mock mode - Simulating connection.. .');
                setTimeout(() => {
                    this.isConnected = true;
                    console.log('✅ Mock connected!');
                    resolve();
                }, 500);
            });
        }

        // Real connection code
        return new Promise((resolve, reject) => {
            try {
                if (this.socket) {
                    this.socket.close();
                }

                this.socket = new WebSocket(WS_URL);

                this.socket.onopen = () => {
                    console.log('✅ WebSocket connected!');
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    resolve();
                };

                this.socket.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        console.log('📩 Received:', data);
                        this.handleMessage(data);
                    } catch (error) {
                        console.error('Parse error:', error);
                    }
                };

                this. socket.onerror = (error) => {
                    console.error('❌ WebSocket error:', error);
                };

                this.socket.onclose = (event) => {
                    console.log('🔌 WebSocket disconnected', event.code);
                    this.isConnected = false;
                    if (event.code !== 1000) {
                        this.attemptReconnect();
                    }
                };

                setTimeout(() => {
                    if (this.socket?. readyState === WebSocket. CONNECTING) {
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
            console.log(`🔄 Reconnecting...  Attempt ${this.reconnectAttempts}`);
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

    // 🎭 Mock response helper
    private mockResponse(event: string, data:  any, delay: number = 300) {
        setTimeout(() => {
            this.handleMessage({ status: 'success', event, data });
        }, delay);
    }

    private send(message: ChatMessage) {
        // 🎭 MOCK MODE - Simulate responses
        if (USE_MOCK) {
            console.log('🎭 Mock send:', message);
            this.mockHandleSend(message);
            return;
        }

        // Real send
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON. stringify(message));
        } else {
            console.error('❌ WebSocket not connected! ');
        }
    }

    // 🎭 Mock message handler
    private mockHandleSend(message: ChatMessage) {
        const { event, data } = message. data;

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
                    { name: data.name, mes: 'Hey! ', createAt: Date.now() - 10000 },
                ]);
                break;

            case 'SEND_CHAT':
                // Echo back the sent message
                setTimeout(() => {
                    // Simulate receiving a reply after 1-2 seconds
                    if (Math.random() > 0.5) {
                        this.handleMessage({
                            status: 'success',
                            event: 'SEND_CHAT',
                            data: {
                                type: data.type,
                                from: data.type === 'room' ? 'alice' : data.to,
                                to: data. to,
                                mes: 'Đây là tin nhắn mock reply!  👋',
                            }
                        });
                    }
                }, 1500);
                break;

            default:
                console.log('🎭 Unhandled mock event:', event);
        }
    }

    on(event: string, callback: MessageCallback) {
        const callbacks = this.messageCallbacks. get(event) || [];
        callbacks.push(callback);
        this.messageCallbacks.set(event, callbacks);
    }

    off(event: string, callback?:  MessageCallback) {
        if (callback) {
            const callbacks = this.messageCallbacks.get(event) || [];
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks. splice(index, 1);
                this.messageCallbacks.set(event, callbacks);
            }
        } else {
            this.messageCallbacks.delete(event);
        }
    }

    // ========== API METHODS ==========

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
            console.log('🎭 Mock disconnected');
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