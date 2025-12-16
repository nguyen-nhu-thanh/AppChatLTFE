import React, { useEffect, useRef } from 'react';
import { Message } from '../types/chat';
import './styles/MessageList.css';

interface MessageListProps {
    messages: Message[];
    currentUser: string;
}

function MessageList({ messages, currentUser }: MessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="message-list">
            {messages.length === 0 ? (
                <div className="no-messages">Chưa có tin nhắn nào</div>
            ) : (
                messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`message ${
                            msg.from === currentUser ? 'own-message' : 'other-message'
                        }`}
                    >
                        <div className="message-content">
                            <div className="message-header">
                                <span className="message-from">{msg.from}</span>
                                <span className="message-time">{formatTime(msg.timestamp)}</span>
                            </div>
                            <div className="message-text">{msg.message}</div>
                        </div>
                    </div>
                ))
            )}
            <div ref={messagesEndRef} />
        </div>
    );
}

export default MessageList;