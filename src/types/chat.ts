// src/types/chat.ts

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

export interface WebSocketMessage {
  action: string;
  data: {
    event: string;
    data?: Record<string, any>;
    status?: string;
    error?: string;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  reLoginCode: string | null;
  error: string | null;
}

export interface ChatState {
  currentRoom: Room | null;
  currentUser: User | null;
  messages: Message[];
  rooms: Room[];
  users: User[];
  loading: boolean;
  error: string | null;
}
