import React from 'react';
import { Link } from 'react-router-dom';
import logoIcon from '/logo.png';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer-container">
            <div className="footer-content">
                <div className="footer-column brand-column">
                    <Link to="/" className="footer-logo">
                        <img src={logoIcon} alt="Sneaker Drop Logo" className="footer-logo-img" />
                        SNEAKER DROP
                    </Link>
                    <p className="footer-tagline">
                        Your ultimate destination for upcoming sneaker releases. Stay ahead of the game.
                    </p>

                    <div className="social-icons">
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Twitter">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg>
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                        </a>
                        <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="TikTok">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
                        </a>
                    </div>
                </div>

                <div className="footer-column">
                    <h3 className="footer-heading">Explore</h3>
                    <ul className="footer-links">
                        <li><Link to="/" className="footer-link">Upcoming Drops</Link></li>
                        <li><Link to="/wishlist" className="footer-link">My Wishlist</Link></li>
                        <li><Link to="/profile" className="footer-link">My Profile</Link></li>
                    </ul>
                </div>

                <div className="footer-column">
                    <h3 className="footer-heading">Contact</h3>
                    <ul className="footer-links">
                        <li>
                            <a href="mailto:support@sneakerdrop.com" className="footer-link email-link">
                                support@sneakerdrop.com
                            </a>
                        </li>
                        <li className="footer-link" style={{ opacity: 0.6, cursor: 'default' }}>
                            Lviv, Ukraine
                        </li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p className="copyright-text">
                    © 2025 Sneaker Drop. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;