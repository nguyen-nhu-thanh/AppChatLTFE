import React, { useState } from 'react';
// import { useAuth } from '../../hooks/useAuth';
import './styles/Auth.css';

// interface LoginProps {
//     onLoginSuccess: () => void;
// }

// function Login({ onLoginSuccess }: LoginProps) {
function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // const { auth, login } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        }

        setIsLoading(true);
        // login(username, password);

        // Listen for auth change
        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 3000);

        return () => clearTimeout(timeout);
    };

    // React.useEffect(() => {
    //     if (auth.isAuthenticated) {
    //         setIsLoading(false);
    //         onLoginSuccess();
    //     }
    // }, [auth.isAuthenticated, onLoginSuccess]);

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">Đăng Nhập</h1>

                {/*{auth.error && <div className="auth-error">{auth.error}</div>}*/}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="username">Tên đăng nhập</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Nhập tên đăng nhập"
                            disabled={isLoading}
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
                            disabled={isLoading}
                        />
                    </div>

                    <button type="submit" className="auth-button" disabled={isLoading}>
                        {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                    </button>
                </form>

                <p className="auth-footer">
                    Chưa có tài khoản?{' '}
                    <a href="#register" className="auth-link">
                        Đăng ký ngay
                    </a>
                </p>
            </div>
        </div>
    );
}

export default Login;