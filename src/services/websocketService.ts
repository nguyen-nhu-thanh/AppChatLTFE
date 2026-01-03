// URL WebSocket server
const WS_URL = 'wss://chat.longapp.site/chat/chat';

// Các event types từ API
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

// Interface cho message gửi đi
interface ChatMessage {
    action: 'onchat';
    data: {
        event: ChatEvent;
        data?:  any;
    };
}

// Callback types
type MessageCallback = (data: any) => void;

class WebSocketService {
    private socket: WebSocket | null = null;
    private messageCallbacks: Map<string, MessageCallback[]> = new Map();
    private isConnected:  boolean = false;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;

    // Kết nối WebSocket
    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.socket = new WebSocket(WS_URL);

                this.socket.onopen = () => {
                    console.log('WebSocket connected! ');
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    resolve();
                };

                this.socket.onmessage = (event) => {
                    try {
                        const data = JSON. parse(event.data);
                        console.log('Received:', data);
                        this.handleMessage(data);
                    } catch (error) {
                        console.error('Parse error:', error);
                    }
                };

                this.socket. onerror = (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                };

                this.socket.onclose = () => {
                    console.log('WebSocket disconnected');
                    this.isConnected = false;
                    this.attemptReconnect();
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    // Tự động reconnect
    private attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnecting...  Attempt ${this.reconnectAttempts}`);
            setTimeout(() => this.connect(), 3000);
        }
    }

    // Xử lý message nhận được
    private handleMessage(data:  any) {
        const eventType = data.event;
        const callbacks = this.messageCallbacks.get(eventType) || [];
        callbacks.forEach((callback) => callback(data));

        // Callback cho tất cả messages
        const allCallbacks = this.messageCallbacks.get('*') || [];
        allCallbacks.forEach((callback) => callback(data));
    }

    // Gửi message
    private send(message: ChatMessage) {
        if (this.socket && this.isConnected) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.error('WebSocket not connected! ');
        }
    }

    // Đăng ký callback cho event
    on(event: string, callback: MessageCallback) {
        const callbacks = this.messageCallbacks. get(event) || [];
        callbacks.push(callback);
        this.messageCallbacks.set(event, callbacks);
    }

    // Xóa callback
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

    // ========== CÁC API METHODS ==========

    // Đăng ký tài khoản
    register(username: string, password: string) {
        this.send({
            action: 'onchat',
            data: {
                event: 'REGISTER',
                data: { user: username, pass: password },
            },
        });
    }

    // Đăng nhập
    login(username:  string, password: string) {
        this.send({
            action: 'onchat',
            data: {
                event: 'LOGIN',
                data: { user: username, pass: password },
            },
        });
    }

    // Đăng nhập lại với code
    reLogin(username: string, code: string) {
        this.send({
            action: 'onchat',
            data: {
                event: 'RE_LOGIN',
                data: { user: username, code: code },
            },
        });
    }

    // Đăng xuất
    logout() {
        this.send({
            action: 'onchat',
            data: { event: 'LOGOUT' },
        });
    }

    // Tạo phòng chat
    createRoom(roomName: string) {
        this.send({
            action: 'onchat',
            data:  {
                event: 'CREATE_ROOM',
                data:  { name: roomName },
            },
        });
    }

    // Tham gia phòng
    joinRoom(roomName: string) {
        this.send({
            action: 'onchat',
            data: {
                event: 'JOIN_ROOM',
                data: { name: roomName },
            },
        });
    }

    // Lấy tin nhắn của phòng
    getRoomMessages(roomName: string, page: number = 1) {
        this.send({
            action: 'onchat',
            data: {
                event: 'GET_ROOM_CHAT_MES',
                data: { name: roomName, page: page },
            },
        });
    }

    // Lấy tin nhắn với người dùng
    getPeopleMessages(username: string, page: number = 1) {
        this.send({
            action: 'onchat',
            data: {
                event: 'GET_PEOPLE_CHAT_MES',
                data: { name: username, page: page },
            },
        });
    }

    // Gửi tin nhắn
    sendMessage(type: 'room' | 'people', to: string, message: string) {
        this.send({
            action: 'onchat',
            data: {
                event:  'SEND_CHAT',
                data: { type:  type, to: to, mes: message },
            },
        });
    }

    // Kiểm tra user online
    checkUserOnline(username: string) {
        this.send({
            action: 'onchat',
            data:  {
                event: 'CHECK_USER_ONLINE',
                data: { user: username },
            },
        });
    }

    // Kiểm tra user tồn tại
    checkUserExist(username: string) {
        this.send({
            action: 'onchat',
            data: {
                event:  'CHECK_USER_EXIST',
                data: { user:  username },
            },
        });
    }

    // Lấy danh sách users
    getUserList() {
        this.send({
            action: 'onchat',
            data: { event: 'GET_USER_LIST' },
        });
    }

    // Ngắt kết nối
    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    // Check trạng thái kết nối
    getIsConnected(): boolean {
        return this.isConnected;
    }
}

// Singleton instance
const wsService = new WebSocketService();
export default wsService;