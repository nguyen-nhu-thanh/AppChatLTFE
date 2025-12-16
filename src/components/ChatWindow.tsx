import React, { useState } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import RoomList from './RoomList';
import UserList from './UserList';
import { Message, Room, User } from '../types/chat';
import './styles/Chat.css';

interface ChatWindowProps {
    username: string;
    messages: Message[];
    rooms: Room[];
    users: User[];
    onCreateRoom?: (roomName: string) => void;
    onJoinRoom?: (roomName: string) => void;
    onSelectUser?: (userName: string) => void;
    onSendMessage?: (type: 'room' | 'people', to: string, message: string) => void;
    onLogout?: () => void;
}

function ChatWindow({
                        username,
                        messages,
                        rooms,
                        users,
                        onCreateRoom,
                        onJoinRoom,
                        onSelectUser,
                        onSendMessage,
                        onLogout,
                    }: ChatWindowProps) {
    const [tab, setTab] = useState<'rooms' | 'users'>('rooms');
    const [newRoomName, setNewRoomName] = useState('');
    const [newUserName, setNewUserName] = useState('');
    const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

    const handleCreateRoom = () => {
        if (!newRoomName.trim()) {
            alert('Vui lòng nhập tên phòng');
            return;
        }
        onCreateRoom?.(newRoomName);
        setNewRoomName('');
    };

    const handleJoinRoom = (roomName: string) => {
        setCurrentRoom({ id: roomName, name: roomName });
        onJoinRoom?.(roomName);
    };

    const handleSelectUser = (userName: string) => {
        setNewUserName(userName);
        onSelectUser?.(userName);
    };

    const handleSendMessage = (message: string) => {
        if (!message.trim()) return;

        if (tab === 'rooms' && currentRoom) {
            onSendMessage?.('room', currentRoom.name, message);
        } else if (tab === 'users' && newUserName) {
            onSendMessage?.('people', newUserName, message);
        }
    };

    return (
        <div className="chat-window">
            <div className="chat-sidebar">
                <div className="chat-header">
                    <h2>Chat App</h2>
                    <div className="user-info">
                        <span className="username-badge">{username}</span>
                        <button onClick={onLogout} className="logout-btn" title="Đăng xuất">
                            ✕
                        </button>
                    </div>
                </div>

                <div className="chat-tabs">
                    <button
                        className={`tab-btn ${tab === 'rooms' ? 'active' : ''}`}
                        onClick={() => setTab('rooms')}
                    >
                        Phòng
                    </button>
                    <button
                        className={`tab-btn ${tab === 'users' ? 'active' : ''}`}
                        onClick={() => setTab('users')}
                    >
                        Người dùng
                    </button>
                </div>

                {tab === 'rooms' ? (
                    <div className="chat-section">
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Tên phòng mới"
                                value={newRoomName}
                                onChange={(e) => setNewRoomName(e.target.value)}
                                className="input-field"
                            />
                            <button onClick={handleCreateRoom} className="action-btn">
                                Tạo
                            </button>
                        </div>
                        <RoomList rooms={rooms} onSelectRoom={handleJoinRoom} />
                    </div>
                ) : (
                    <div className="chat-section">
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Tên người dùng"
                                value={newUserName}
                                onChange={(e) => setNewUserName(e.target.value)}
                                className="input-field"
                            />
                            <button
                                onClick={() => handleSelectUser(newUserName)}
                                className="action-btn"
                                disabled={!newUserName.trim()}
                            >
                                Chọn
                            </button>
                        </div>
                        <UserList users={users} onSelectUser={handleSelectUser} />
                    </div>
                )}
            </div>

            <div className="chat-main">
                {currentRoom || newUserName ? (
                    <>
                        <div className="chat-title">
                            {currentRoom
                                ? `Phòng: ${currentRoom.name}`
                                : `Chat với: ${newUserName}`}
                        </div>
                        <MessageList messages={messages} currentUser={username} />
                        <MessageInput onSendMessage={handleSendMessage} />
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <p>Chọn một phòng hoặc người dùng để bắt đầu chat</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChatWindow;