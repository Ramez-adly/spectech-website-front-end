import React, { useState, useEffect } from 'react';
import LoginForm from './loginForm';
import RegistrationForm from './register';
import Home from './Home';
import Navbar from "./navbar";
import StoreRegistration from './StoreRegistration';
import Cart from './Cart';
import ProductDetails from './ProductDetails';
import Products from './Products';
import Footer from './Footer';
import AdminDashboard from './AdminDashboard';
import './main.css';

const Main = () => {
    const [currentPage, setCurrentPage] = useState('home');
    const [pageProps, setPageProps] = useState({});
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        checkAuthStatus();
    }, [currentPage]);

    const checkAuthStatus = async () => {
        try {
            const response = await fetch('http://localhost:5555/check-auth', {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            
            setIsAuthenticated(response.ok);
            setIsAdmin(data.isAdmin || false);

            // Redirect if trying to access protected pages while not authenticated
            if (!response.ok) {
                if (['cart', 'admin'].includes(currentPage)) {
                    setCurrentPage('login');
                }
            }
        } catch (err) {
            console.error('Auth check failed:', err);
            setIsAuthenticated(false);
            setIsAdmin(false);
        }
    };

    const navigate = (page, props = {}) => {
        // Check if page requires authentication
        if (['cart', 'admin'].includes(page) && !isAuthenticated) {
            setCurrentPage('login');
            return;
        }

        // Check if page requires admin privileges
        if (page === 'admin' && !isAdmin) {
            setCurrentPage('home');
            return;
        }

        setCurrentPage(page);
        setPageProps(props);
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
                return <Home navigate={navigate} isAuthenticated={isAuthenticated} />;
            case 'cart':
                return <Cart navigate={navigate} />;
            case 'product-details':
                return <ProductDetails productId={pageProps.productId} navigate={navigate} isAuthenticated={isAuthenticated} />;
            case 'products':
                return <Products navigate={navigate} isAuthenticated={isAuthenticated} />;
            case 'admin':
                return <AdminDashboard navigate={navigate} />;
            default:
                return null;
        }
    };

    return (
        <div className="main-container">
            <Navbar 
                navigate={navigate} 
                isAuthenticated={isAuthenticated} 
                isAdmin={isAdmin}
            />
            <div className="content">
                {renderPage()}
            </div>
            <Footer navigate={navigate}/>
        </div>
    );
};

export default Main;