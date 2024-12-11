import React, { useState } from 'react';

const LoginForm = ({ navigate }) => {
    let email = '';
    let password = '';
    let message = '';
    let name = '';

    const loginUser = () => {
        fetch('http://localhost:5555/user/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Invalid credentials');
            }
            //message = 'Login successful';
            document.cookie = `Username=${name}; path=/`
            alert(`Welcome, ${name}!`);
            navigate('home');
            //alert(message);
        })
        .catch((error) => {
            message = error.message;
            alert(message);
        });
    };
}

return (
    <div className="form-section">
        <h2>User Login</h2>
        <form>
            <div>
                <input
                    type="email"
                    placeholder="Email"
                    onChange={(e) => (email = e.target.value)}
                    required
                />
            </div>
            <br />
            <div>
                <input
                    type="password"
                    placeholder="Password"
                    onChange={(e) => (password = e.target.value)}
                    required
                />
            </div>
            <br />
            <div>
                <input
                    type="text"
                    placeholder="Name"
                    onChange={(e) => (name = e.target.value)}
                    required
                />
            </div>
            <br />
            <button type="button" onClick={loginUser}>
                Login
            </button>
            <p>
                Don't have an account?{' '}
                <span 
                    onClick={() => navigate('register')}
                    style={{ color: 'blue', cursor: 'pointer' }}
                >
                    Register here
                </span>
            </p>
        </form>
    </div>
);
export default LoginForm;
