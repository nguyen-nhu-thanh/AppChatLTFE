export interface User {
    id: string;
    username: string;
    online?:  boolean;
}

export interface Room {
    id: string;
    name: string;
    participants?: number;
}

export interface Message {
    id?:  string;
    from: string;
    to: string;
    message: string;
    timestamp: number;
    type: 'room' | 'people';
}

// Thêm các response types từ server
export interface LoginResponse {
    status: 'success' | 'error';
    event: 'RE_LOGIN' | 'LOGIN';
    data?: {
        RE_LOGIN_CODE?:  string;
    };
    mes?: string;
}

export interface ChatMessageResponse {
    status: 'success' | 'error';
    event: string;
    data?: Message[];
}

export interface UserListResponse {
    status: 'success' | 'error';
    event: 'GET_USER_LIST';
    data?: User[];
}