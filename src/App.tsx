import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import Login from './components/Login';
import ChatWindow from './components/ChatWindow';
import './App.css';

function App() {
    const { auth, logout } = useAuth();

    if (!auth.isAuthenticated || !auth.username) {
        return <Login onLoginSuccess={() => {}} />;
    }

    return (
        <ChatWindow
            username={auth.username}
            onLogout={() => {
                logout();
            }}
        />
    );
}

export default App;