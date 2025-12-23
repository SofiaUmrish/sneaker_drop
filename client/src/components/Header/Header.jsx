
import React from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import logoIcon from '/logo.png';
import './Header.css';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAdmin } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const { wishlist } = useWishlist();
    const wishlistCount = wishlist.length;

    const isHomePage = location.pathname === '/';

    const handleSearch = (e) => {
        const query = e.target.value;
        if (query) {
            setSearchParams({ search: query });
        } else {
            setSearchParams({});
        }
    };

    return (
        <header className="header glass-panel">
            <Link to="/" className="logo">
                <img src={logoIcon} alt="Sneaker Drop Logo" className="logo-img" />
                SNEAKER DROP
            </Link>

            <div className="search-bar">
                {isHomePage ? (
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search releases..."
                        onChange={handleSearch}
                        value={searchParams.get('search') || ''}
                    />
                ) : (
                    <div style={{ width: '300px' }}></div>
                )}
            </div>

            <div className="header-icons">

                {isAdmin && (
                    <Link to="/admin-dashboard" className="admin-panel-btn">
                        Admin Panel
                    </Link>
                )}

                <div className="icon-wrapper">
                    <button
                        className="icon-btn"
                        aria-label="Wishlist"
                        onClick={() => navigate('/wishlist')}
                        title="My Wishlist"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                    {wishlistCount > 0 && (
                        <span className="notification-badge"></span>
                    )}
                </div>

                <Link
                    to={user ? "/profile" : "/login"}
                    className="user-avatar"
                    style={{ cursor: 'pointer', textDecoration: 'none' }}
                    title={user ? `Logged in as ${user.name}` : "Sign In"}
                >
                    {user ? (
                        <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>
                            {user.name.charAt(0)}
                        </span>
                    ) : (
                        <svg className="guest-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    )}
                </Link>
            </div>
        </header>
    );
};

export default Header;