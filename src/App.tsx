import React, { useState, useEffect, useCallback } from 'react';
import Login from './components/Login';
import ChatWindow from './components/ChatWindow';
import { Message, Room, User } from './types/chat';
import wsService from './services/websocketService';
import './App.css';

const RELOGIN_KEY = 'chat_relogin_code';
const USERNAME_KEY = 'chat_username';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUsername, setCurrentUsername] = useState('');
    const [isConnecting, setIsConnecting] = useState(true);
    const [error, setError] = useState('');

    const [messages, setMessages] = useState<Message[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [currentTarget, setCurrentTarget] = useState<{ type: 'room' | 'people'; name: string } | null>(null);

    useEffect(() => {
        const initConnection = async () => {
            try {
                setIsConnecting(true);
                await wsService.connect();

                const savedCode = localStorage.getItem(RELOGIN_KEY);
                const savedUsername = localStorage.getItem(USERNAME_KEY);

                if (savedCode && savedUsername) {
                    setCurrentUsername(savedUsername);
                    wsService.reLogin(savedUsername, savedCode);
                } else {
                    setIsConnecting(false);
                }
            } catch (err) {
                console.error('Connection error:', err);
                // 🔧 Thông báo rõ ràng hơn
                setError('Server chat đang offline hoặc không thể kết nối.  Vui lòng thử lại sau.');
                setIsConnecting(false);
            }
        };

        initConnection();

        return () => {
            wsService.disconnect();
        };
    }, []);

    useEffect(() => {
        // Xử lý login response
        const handleLogin = (data: any) => {
            if (data.status === 'success') {
                setIsLoggedIn(true);
                setError('');

                if (data.data?. RE_LOGIN_CODE) {
                    localStorage.setItem(RELOGIN_KEY, data.data.RE_LOGIN_CODE);
                    localStorage.setItem(USERNAME_KEY, currentUsername);
                }

                wsService.getUserList();
            } else {
                setError(data.mes || 'Đăng nhập thất bại');
            }
            setIsConnecting(false);
        };

        const handleReLogin = (data: any) => {
            if (data.status === 'success') {
                const savedUsername = localStorage.getItem(USERNAME_KEY);
                if (savedUsername) {
                    setCurrentUsername(savedUsername);
                    setIsLoggedIn(true);
                    wsService.getUserList();
                }
            } else {
                localStorage.removeItem(RELOGIN_KEY);
                localStorage.removeItem(USERNAME_KEY);
            }
            setIsConnecting(false);
        };

        const handleRegister = (data: any) => {
            if (data.status === 'success') {
                alert('Đăng ký thành công!  Vui lòng đăng nhập.');
            } else {
                setError(data.mes || 'Đăng ký thất bại');
            }
        };

        const handleUserList = (data: any) => {
            if (data. status === 'success' && data.data) {
                const userList:  User[] = data.data. map((u: any, index: number) => ({
                    id: String(index),
                    username: u.name || u,
                    online: u.actionTime === 'online',
                }));
                setUsers(userList);
            }
        };

        const handleNewMessage = (data: any) => {
            if (data.event === 'SEND_CHAT' && data.status === 'success') {
                const newMsg: Message = {
                    from: data.data?. from || data.data?.name,
                    to: data.data?.to,
                    message: data.data?. mes,
                    timestamp: Date.now(),
                    type: data.data?.type || 'people',
                };
                setMessages((prev) => [...prev, newMsg]);
            }
        };

        const handleRoomMessages = (data: any) => {
            if (data.status === 'success' && data.event === 'GET_ROOM_CHAT_MES') {
                const messageList: Message[] = (data.data || []).map((m: any) => ({
                    from: m.name,
                    to: currentTarget?.name || '',
                    message: m.mes,
                    timestamp: new Date(m.createAt).getTime(),
                    type: 'room' as const,
                }));
                setMessages(messageList. reverse());
            }
        };

        const handlePeopleMessages = (data: any) => {
            if (data.status === 'success' && data.event === 'GET_PEOPLE_CHAT_MES') {
                const messageList: Message[] = (data.data || []).map((m: any) => ({
                    from: m.name,
                    to: currentTarget?.name || '',
                    message: m.mes,
                    timestamp: new Date(m. createAt).getTime(),
                    type: 'people' as const,
                }));
                setMessages(messageList.reverse());
            }
        };

        const handleCreateRoom = (data: any) => {
            if (data.status === 'success') {
                // Thêm phòng mới vào list
                const newRoom: Room = {
                    id: data.data?.name,
                    name: data.data?. name,
                };
                setRooms((prev) => [...prev, newRoom]);
            } else {
                alert(data.mes || 'Tạo phòng thất bại');
            }
        };

        const handleJoinRoom = (data: any) => {
            if (data. status === 'success') {
                // Load tin nhắn sau khi join thành công
                if (currentTarget?.type === 'room') {
                    wsService.getRoomMessages(currentTarget.name);
                }
            }
        };

        wsService.on('RE_LOGIN', handleLogin);
        wsService.on('AUTH', handleLogin);
        wsService.on('LOGIN', handleLogin);
        wsService.on('REGISTER', handleRegister);
        wsService.on('GET_USER_LIST', handleUserList);
        wsService.on('SEND_CHAT', handleNewMessage);
        wsService.on('GET_ROOM_CHAT_MES', handleRoomMessages);
        wsService.on('GET_PEOPLE_CHAT_MES', handlePeopleMessages);
        wsService.on('CREATE_ROOM', handleCreateRoom);
        wsService.on('JOIN_ROOM', handleJoinRoom);

        return () => {
            wsService.off('RE_LOGIN');
            wsService.off('AUTH');
            wsService.off('LOGIN');
            wsService.off('REGISTER');
            wsService.off('GET_USER_LIST');
            wsService.off('SEND_CHAT');
            wsService.off('GET_ROOM_CHAT_MES');
            wsService.off('GET_PEOPLE_CHAT_MES');
            wsService.off('CREATE_ROOM');
            wsService.off('JOIN_ROOM');
        };
    }, [currentTarget, currentUsername]);

    const handleLogin = useCallback((username: string, password: string) => {
        setCurrentUsername(username);
        wsService.login(username, password);
    }, []);

    const handleRegister = useCallback((username: string, password: string) => {
        wsService.register(username, password);
    }, []);

    const handleLogout = useCallback(() => {
        wsService.logout();
        localStorage.removeItem(RELOGIN_KEY);
        localStorage.removeItem(USERNAME_KEY);
        setIsLoggedIn(false);
        setCurrentUsername('');
        setMessages([]);
        setRooms([]);
        setUsers([]);
        setCurrentTarget(null);
    }, []);

    const handleCreateRoom = useCallback((roomName: string) => {
        wsService.createRoom(roomName);
    }, []);

    const handleJoinRoom = useCallback((roomName: string) => {
        setCurrentTarget({ type: 'room', name: roomName });
        wsService.joinRoom(roomName);
        wsService.getRoomMessages(roomName);
    }, []);

    const handleSelectUser = useCallback((userName: string) => {
        setCurrentTarget({ type: 'people', name: userName });
        setMessages([]); // Clear messages
        wsService.getPeopleMessages(userName);
    }, []);

    const handleSendMessage = useCallback(
        (type: 'room' | 'people', to:  string, message: string) => {
            wsService.sendMessage(type, to, message);

            const newMsg: Message = {
                from: currentUsername,
                to: to,
                message: message,
                timestamp: Date.now(),
                type: type,
            };
            setMessages((prev) => [...prev, newMsg]);
        },
        [currentUsername]
    );

    if (isConnecting) {
        return (
            <div className="app-loading">
                <div className="loading-spinner"></div>
                <p>Đang kết nối...</p>
            </div>
        );
    }

    return (
        <div className="app">
            {!isLoggedIn ? (
                <Login
                    onLogin={handleLogin}
                    onRegister={handleRegister}
                />
            ) : (
                <ChatWindow
                    username={currentUsername}
                    messages={messages}
                    rooms={rooms}
                    users={users}
                    onCreateRoom={handleCreateRoom}
                    onJoinRoom={handleJoinRoom}
                    onSelectUser={handleSelectUser}
                    onSendMessage={handleSendMessage}
                    onLogout={handleLogout}
                />
            )}

            {error && (
                <div className="error-toast">
                    {error}
                    <button onClick={() => setError('')}>×</button>
                </div>
            )}
        </div>
    );
}

export default App;