import React, { useState } from 'react';
import LoginForm from './loginForm';
import RegistrationForm from './register';
import Home from './Home';
import Navbar from "./navbar";
import StoreRegistration from './StoreRegistration';

const Main = () => {
    const [currentPage, setCurrentPage] = useState('home');

    const navigate = (page) => {
        setCurrentPage(page);
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'login':
                return <LoginForm navigate={navigate} />;
            case 'register':
                return <RegistrationForm navigate={navigate} />;
            case 'storeregistration':
                return <StoreRegistration navigate={navigate} />;
            case 'home':
            default:
                return <Home navigate={navigate} />;
        }
    };

    return (
        <div className="main-container">
            <Navbar navigate={navigate}/>
            {renderPage()}
        </div>
    );
};

export default Main;