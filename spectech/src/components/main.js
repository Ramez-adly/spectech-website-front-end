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
import StoreDashboard from './StoreDashboard';
import PCBuilder from './PCBuilder';
import './main.css';

const Main = () => {
    const [currentPage, setCurrentPage] = useState('home');
    const [pageProps, setPageProps] = useState({});
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userType, setUserType] = useState(null);

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
            console.log('Auth check response:', data); // Debug log
            
            if (response.ok && data.authenticated) {
                setIsAuthenticated(true);
                setUserType(data.customertype);
            } else {
                setIsAuthenticated(false);
                setUserType(null);
                // Only redirect if not authenticated
                if (!data.authenticated && ['cart', 'AdminDashboard', 'store-dashboard'].includes(currentPage)) {
                    setCurrentPage('login');
                }
            }
        } catch (err) {
            console.error('Auth check failed:', err);
            setIsAuthenticated(false);
            setUserType(null);
        }
    };

    useEffect(() => {
        checkAuthStatus();
        window.addEventListener('auth-change', checkAuthStatus);
        return () => window.removeEventListener('auth-change', checkAuthStatus);
    }, [currentPage]); // Add currentPage as dependency

    const navigate = (page, props = {}) => {
        setCurrentPage(page);
        setPageProps(props);
        // Check if page requires authentication
        if (['cart', 'AdminDashboard', 'store-dashboard', 'profile'].includes(page) && !isAuthenticated) {
            setCurrentPage('login');
            return;
        }

        // Check if page requires specific user type
        if (page === 'AdminDashboard' && userType !== 'admin') {
            setCurrentPage('home');
            return;
        }

        if (page === 'store-dashboard' && userType !== 'store') {
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
                return <ProductDetails 
                    productId={pageProps.productId} 
                    navigate={navigate} 
                    isAuthenticated={isAuthenticated}
                />;
            case 'products':
                return <Products 
                    navigate={navigate} 
                    isAuthenticated={isAuthenticated}
                />;
            case 'AdminDashboard':
                return <AdminDashboard navigate={navigate} />;
            case 'store-dashboard':
                return <StoreDashboard navigate={navigate} />;
            default:
                return <Home navigate={navigate} isAuthenticated={isAuthenticated} />;
            case 'PCBuilder':
                return <PCBuilder navigate={navigate} />
        }
    };

    return (
        <div className="main-container">
            <Navbar 
                navigate={navigate} 
                isAuthenticated={isAuthenticated}
                userType={userType}
            />
            {renderPage()}
            <Footer navigate={navigate}/>
        </div>
    );
}

export default Main;