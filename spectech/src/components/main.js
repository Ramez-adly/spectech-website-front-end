import React, { useState } from 'react';
import LoginForm from './loginForm';
import RegistrationForm from './register';
import Home from './Home';
import Navbar from "./navbar";
import StoreRegistration from './StoreRegistration';
import Cart from './Cart';
import ProductDetails from './ProductDetails';
import Footer from './Footer';
import './main.css';

const Main = () => {
    const [currentPage, setCurrentPage] = useState('home');
    const [pageProps, setPageProps] = useState({});

    const navigate = (page, props = {}) => {
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
                return <Home navigate={navigate} />;
            case 'cart':
                return <Cart navigate={navigate} />;
            case 'product-details':
                return <ProductDetails productId={pageProps.productId} navigate={navigate} />;
            default:
                return null;
        }
    };

    return (
        <div className="main-container">
            <Navbar navigate={navigate}/>
            <div className="content">
                {renderPage()}
            </div>
            <Footer navigate={navigate}/>
        </div>
    );
};

export default Main;