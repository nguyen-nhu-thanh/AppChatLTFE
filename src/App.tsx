import React, { useState } from 'react';
import Login from './components/Login';
import ChatWindow from './components/ChatWindow';
import { Message, Room, User } from './types/chat';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './router';

function App() {
    // State quản lý trạng thái đăng nhập
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUsername, setCurrentUsername] = useState('');

    // State quản lý dữ liệu chat (bạn sẽ điền logic ở đây)
    const [messages, setMessages] = useState<Message[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    // Hàm xử lý đăng nhập - BẠN THÊM LOGIC VÀO ĐÂY
    const handleLogin = (username: string, password: string) => {
        console.log('Login:', { username, password });
        // TODO: Thêm logic đăng nhập
        // - Gọi API /api/auth/login
        // - Kiểm tra username/password
        // - Lưu token nếu cần
        // - Set state
        setCurrentUsername(username);
        setIsLoggedIn(true);
    };

    // Hàm xử lý đăng ký - BẠN THÊM LOGIC VÀO ĐÂY
    const handleRegister = (username: string, password: string) => {
        console.log('Register:', { username, password });
        // TODO: Thêm logic đăng ký
        // - Gọi API /api/auth/register
        // - Tạo tài khoản mới
        // - Có thể tự động đăng nhập hoặc redirect to login
    };

    // Hàm xử lý tạo phòng - BẠN THÊM LOGIC VÀO ĐÂY
    const handleCreateRoom = (roomName: string) => {
        console.log('Create room:', roomName);
        // TODO: Thêm logic tạo phòng
        // - Gọi API POST /api/rooms
        // - Thêm phòng vào state
        const newRoom: Room = {
            id: roomName,
            name: roomName,
            participants: 1,
        };
        setRooms([...rooms, newRoom]);
    };

    // Hàm xử lý tham gia phòng - BẠN THÊM LOGIC VÀO ĐÂY
    const handleJoinRoom = (roomName: string) => {
        console.log('Join room:', roomName);
        // TODO: Thêm logic tham gia phòng
        // - Gọi API POST /api/rooms/:id/join
        // - Load tin nhắn của phòng
        // - Subscribe WebSocket để nhận tin mới
    };

    // Hàm xử lý chọn người dùng - BẠN THÊM LOGIC VÀO ĐÂY
    const handleSelectUser = (userName: string) => {
        console.log('Select user:', userName);
        // TODO: Thêm logic chọn người dùng
        // - Gọi API GET /api/messages/users/:userName
        // - Load tin nhắn trước đó
        // - Subscribe WebSocket để nhận tin mới
    };

    // Hàm xử lý gửi tin nhắn - BẠN THÊM LOGIC VÀO ĐÂY
    const handleSendMessage = (
        type: 'room' | 'people',
        to: string,
        message: string
    ) => {
        console.log('Send message:', { type, to, message });
        // TODO: Thêm logic gửi tin nhắn
        // - Tạo message object
        // - Gọi API POST /api/messages
        // - Thêm vào state messages (optimistic update)
        const newMessage: Message = {
            from: currentUsername,
            to,
            message,
            timestamp: Date.now(),
            type,
        };
        setMessages([...messages, newMessage]);
    };

    // Hàm xử lý đăng xuất - BẠN THÊM LOGIC VÀO ĐÂY
    const handleLogout = () => {
        console.log('Logout');
        // TODO: Thêm logic đăng xuất
        // - Gọi API /api/auth/logout
        // - Xóa token
        // - Reset state
        setIsLoggedIn(false);
        setCurrentUsername('');
        setMessages([]);
        setRooms([]);
        setUsers([]);
    };

    return (
        <Router>
            <Routes>
                {/* Auth Routes */}
                <Route
                    path={ROUTES.LOGIN}
                    element={
                        isLoggedIn ? (
                            <Navigate to={ROUTES.CHAT} replace />
                        ) : (
                            <Login
                                mode="login"
                                onLogin={handleLogin}
                                onRegister={handleRegister}
                            />
                        )
                    }
                />

                <Route
                    path={ROUTES.REGISTER}
                    element={
                        isLoggedIn ? (
                            <Navigate to={ROUTES.CHAT} replace />
                        ) : (
                            <Login
                                mode="register"
                                onLogin={handleLogin}
                                onRegister={handleRegister}
                            />
                        )
                    }
                />

                {/* Chat Route - Protected */}
                <Route
                    path={ROUTES.CHAT}
                    element={
                        isLoggedIn ? (
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
                        ) : (
                            <Navigate to={ROUTES.LOGIN} replace />
                        )
                    }
                />

                {/* Home redirect */}
                <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.LOGIN} replace />} />

                {/* 404 */}
                <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
            </Routes>
        </Router>
    );
}

export default App;