import React from 'react';
import { Room } from '../types/chat';
import './styles/RoomList.css';

interface RoomListProps {
    rooms: Room[];
    onSelectRoom?: (roomName: string) => void;
}

function RoomList({ rooms, onSelectRoom }: RoomListProps) {
    return (
        <div className="room-list">
            {rooms.length === 0 ? (
                <div className="empty-list">Chưa có phòng nào</div>
            ) : (
                rooms.map((room) => (
                    <div
                        key={room.id}
                        className="room-item"
                        onClick={() => onSelectRoom?.(room.name)}
                    >
                        <div className="room-name">{room.name}</div>
                        {room.participants && (
                            <div className="room-participants">
                                {room.participants} thành viên
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}

export default RoomList;