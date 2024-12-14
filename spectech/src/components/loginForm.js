import React, { useState } from 'react';
import './LoginForm.css';

const LoginForm = ({ navigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const loginUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5555/user/login', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            const data = await response.json();
            
            if (data.message === "Login successful") {  
                window.dispatchEvent(new Event('auth-change'));
                alert('Welcome back!');
                navigate('home');
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-section">
            <h2>User Login</h2>
            <form onSubmit={loginUser}>
                <div>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <br />
                <div>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                <button type="button" className="login-with-google-btn">
                    Sign in with Google
                </button>
                <p className="register-link">
                    Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigate('register'); }}>Register here</a>
                </p>
            </form>
        </div>
    );
};

export default LoginForm;