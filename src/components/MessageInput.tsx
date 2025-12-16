import React, { useState, useRef } from 'react';
import './styles/MessageInput.css';

interface MessageInputProps {
    onSendMessage?: (message: string) => void;
}

function MessageInput({ onSendMessage }: MessageInputProps) {
    const [message, setMessage] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSend = () => {
        if (message.trim()) {
            onSendMessage?.(message);
            setMessage('');
            inputRef.current?.focus();
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="message-input">
            <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                className="input-field"
            />
            <button onClick={handleSend} className="send-btn">
                Gửi
            </button>
        </div>
    );
}

export default MessageInput;