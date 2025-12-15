import React, { useState } from 'react';
// import { MessageList } from './MessageList';
// import { MessageInput } from './MessageInput';
// import { RoomList } from './RoomList';
// import { UserList } from './UserList';
// import { useChat } from '../../hooks/useChat';
import './styles/Chat.css';

interface ChatWindowProps {
  username: string;
  onLogout: () => void;
}

function ChatWindow({ username, onLogout }: ChatWindowProps) {
  const [tab, setTab] = useState<'rooms' | 'users'>('rooms');
  const [newRoomName, setNewRoomName] = useState('');
  const [newUserName, setNewUserName] = useState('');

  // const { chat, createRoom, joinRoom, sendMessage, loadRoomMessages, loadUserMessages } =
  //   useChat(username);

  // const handleCreateRoom = () => {
  //   if (!newRoomName.trim()) {
  //     alert('Vui lòng nhập tên phòng');
  //     return;
  //   }
  //   createRoom(newRoomName);
  //   setNewRoomName('');
  // };
  //
  // const handleJoinRoom = (roomName: string) => {
  //   joinRoom(roomName);
  // };
  //
  // const handleSelectUser = (userName: string) => {
  //   const user = { id: userName, username: userName };
  //   // Set current user and load messages
  //   loadUserMessages(userName, 1);
  // };
  //
  // const handleSendMessage = (message: string) => {
  //   if (!message.trim()) return;
  //
  //   if (tab === 'rooms' && chat.currentRoom) {
  //     sendMessage('room', chat.currentRoom.name, message);
  //   } else if (tab === 'users' && newUserName) {
  //     sendMessage('people', newUserName, message);
  //   }
  // };

  return (
    <div className="chat-window">
      {/* Sidebar */}
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

        {/* Tabs */}
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

        {/* Tab Content */}
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
              <button
                  // onClick={handleCreateRoom}
                      className="action-btn">
                Tạo
              </button>
            </div>
            {/*<RoomList rooms={chat.rooms} onSelectRoom={handleJoinRoom} />*/}
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
                // onClick={() => handleSelectUser(newUserName)}
                className="action-btn"
                disabled={!newUserName.trim()}
              >
                Chọn
              </button>
            </div>
            {/*<UserList users={chat.users} onSelectUser={handleSelectUser} />*/}
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      {/*<div className="chat-main">*/}
      {/*  {(chat.currentRoom || newUserName) ? (*/}
      {/*    <>*/}
      {/*      <div className="chat-title">*/}
      {/*        {chat.currentRoom ? `Phòng: ${chat.currentRoom.name}` : `Chat với: ${newUserName}`}*/}
      {/*      </div>*/}
      {/*      /!*<MessageList messages={chat.messages} currentUser={username} />*!/*/}
      {/*      /!*<MessageInput onSendMessage={handleSendMessage} />*!/*/}
      {/*    </>*/}
      {/*  ) : (*/}
      {/*    <div className="no-chat-selected">*/}
      {/*      <p>Chọn một phòng hoặc người dùng để bắt đầu chat</p>*/}
      {/*    </div>*/}
      {/*  )}*/}
      {/*</div>*/}
    </div>
  );
}

export default ChatWindow;
