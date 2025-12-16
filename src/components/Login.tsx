import React, { useState } from 'react';
import './styles/Auth.css';

interface LoginProps {
    mode?: 'login' | 'register';
    onLogin?: (username: string, password: string) => void;
    onRegister?: (username: string, password: string) => void;
}

function Login({mode = 'login', onLogin, onRegister }: LoginProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [currentMode, setCurrentMode] = useState<'login' | 'register'>(mode);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username.trim() || !password.trim()) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (currentMode === 'register' && password !== confirmPassword) {
            setError('Mật khẩu không khớp');
            return;
        }

        if (password.length < 6) {
            setError('Mật khẩu phải ít nhất 6 ký tự');
            return;
        }

        setIsLoading(true);

        try {
            if (currentMode === 'login') {
                onLogin?.(username, password);
                // TODO: Chuyển hướng sang chat sau khi login thành công
                // navigate(ROUTES.CHAT);
            } else {
                onRegister?.(username, password);
                // TODO: Chuyển hướng sang login hoặc chat sau khi register thành công
                // setCurrentMode('login');
                // setPassword('');
                // setConfirmPassword('');
            }
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra');
        } finally {
            setIsLoading(false);
        }
    };

    const switchMode = () => {
        setCurrentMode(currentMode === 'login' ? 'register' : 'login');
        setError('');
        setPassword('');
        setConfirmPassword('');
        setUsername('');
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">
                    {currentMode === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}
                </h1>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="username">Tên đăng nhập</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Nhập tên đăng nhập"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nhập mật khẩu"
                        />
                    </div>

                    {currentMode === 'register' && (
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Xác nhận mật khẩu"
                                disabled={isLoading}
                            />
                        </div>
                    )}

                    <button type="submit" className="auth-button" disabled={isLoading}>
                        {isLoading
                            ? currentMode === 'login'
                                ? 'Đang đăng nhập...'
                                : 'Đang đăng ký...'
                            : currentMode === 'login'
                                ? 'Đăng Nhập'
                                : 'Đăng Ký'}
                    </button>
                </form>

                <p className="auth-footer">
                    {mode === 'login' ? (
                        <>
                            Chưa có tài khoản?{' '}
                            <button
                                type="button"
                                className="auth-link"
                                onClick={switchMode}
                            >
                                Đăng ký ngay
                            </button>
                        </>
                    ) : (
                        <>
                            Đã có tài khoản?{' '}
                            <button
                                type="button"
                                className="auth-link"
                                onClick={switchMode}
                            >
                                Đăng nhập
                            </button>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}

export default Login;