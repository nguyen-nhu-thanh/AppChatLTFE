export interface User {
    id: string;
    username: string;
    online?: boolean;
}

export interface Room {
    id: string;
    name: string;
    participants?: number;
}

export interface Message {
    id?: string;
    from: string;
    to: string;
    message: string;
    timestamp: number;
    type: 'room' | 'people';
}