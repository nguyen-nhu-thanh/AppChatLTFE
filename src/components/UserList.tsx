import React from 'react';
import { User } from '../types/chat';
import './styles/UserList.css';

interface UserListProps {
    users?: User[];  // 🔧 Thêm ?
    onSelectUser?: (username: string) => void;
}

function UserList({ users = [], onSelectUser }: UserListProps) {  // 🔧 Default = []
    return (
        <div className="user-list">
            {!users || users.length === 0 ?  (  // 🔧 Check null/undefined
                <div className="empty-list">Chưa có người dùng nào</div>
            ) : (
                users.map((user) => (
                    <div
                        key={user.id}
                        className="user-item"
                        onClick={() => onSelectUser?.(user.username)}
                    >
                        <div className="user-status">
                            <span
                                className={`status-indicator ${
                                    user.online ? 'online' : 'offline'
                                }`}
                            />
                        </div>
                        <div className="user-name">{user.username}</div>
                    </div>
                ))
            )}
        </div>
    );
}

export default UserList;