import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import InstantAlertModal from '../../components/InstantAlertModal/InstantAlertModal';
import config from '../../config';
import './ShoeDetail.css';

const ShoeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, user } = useAuth();

    const [shoe, setShoe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { toggleWishlist, isInWishlist } = useWishlist();
    const isLiked = shoe ? isInWishlist(shoe.id) : false;

    const [isAlertOpen, setIsAlertOpen] = useState(false);

    useEffect(() => {
        const fetchShoeDetail = async () => {
            try {
                const response = await fetch(`${config.API_BASE_URL}/shoes`);
                const allShoes = await response.json();
                if (response.ok) {
                    const foundShoe = allShoes.find(s => String(s.id) === String(id));
                    if (foundShoe) {
                        setShoe(foundShoe);
                    } else {
                        setError('Shoe not found.');
                    }
                }
            } catch (err) {
                console.error('Fetch error:', err);
                setError('Database connection lost.');
            } finally {
                setLoading(false);
            }
        };

        fetchShoeDetail();
    }, [id]);

    const openAlertModal = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setIsAlertOpen(true);
    };

    const handleConfirmAlert = async () => {
        try {
            const response = await fetch(`${config.API_BASE_URL}/reminders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ shoe_id: shoe.id })
            });

            if (response.ok) {
                console.log("Reminder set successfully");
            } else {
                console.error("Failed to set reminder");
            }
        } catch (error) {
            console.error("Error setting reminder:", error);
        }
        setIsAlertOpen(false);
    };

    if (loading) return <div style={{ color: 'white', padding: '100px', textAlign: 'center' }}>Loading details...</div>;
    if (error) return <div style={{ color: 'white', padding: '100px', textAlign: 'center' }}>{error}</div>;

    const isUpcoming = new Date(shoe.release_date) > new Date();

    return (
        <div className="shoe-detail-page">
            <div className="detail-container">

                <div className="nav-header">
                    <Link to="/" className="back-button">
                        <span className="back-arrow">←</span> Back
                    </Link>
                </div>

                <div className="shoe-main-content">

                    <div className="image-column">
                        <div className="image-wrapper glass-panel">
                            <span className={`status-badge ${isUpcoming ? 'upcoming' : 'released'}`}>
                                {isUpcoming ? 'UPCOMING' : 'RELEASED'}
                            </span>
                            <img src={shoe.image_url} alt={shoe.model_name} className="main-image" />
                        </div>
                    </div>

                    <div className="info-column">
                        <div className="brand-row">
                            <h3 className="brand-name">{shoe.brand_name}</h3>
                            <div className="top-actions">
                                <button
                                    className={`action-btn ${isLiked ? 'liked' : ''}`}
                                    onClick={() => toggleWishlist(shoe.id)}
                                    aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                    </svg>
                                </button>

                                {isUpcoming && (
                                    <button
                                        className="action-btn"
                                        onClick={openAlertModal}
                                        aria-label="Set reminder"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        <h1 className="model-name">{shoe.model_name}</h1>

                        <div className="price-block">
                            <span className="current-price">${shoe.price}</span>
                            <span className="release-info">Release: {new Date(shoe.release_date).toLocaleDateString()}</span>
                        </div>

                        <a
                            href={shoe.shop_link || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-buy-now"
                        >
                            Buy Now
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        </a>

                        <div className="tech-details-grid">
                            <div className="tech-item">
                                <span className="label">SKU</span>
                                <span className="value">{shoe.sku || 'N/A'}</span>
                            </div>
                            <div className="tech-item">
                                <span className="label">Category</span>
                                <span className="value">{shoe.category_name}</span>
                            </div>
                            <div className="tech-item">
                                <span className="label">Brand</span>
                                <span className="value">{shoe.brand_name}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="shoe-description-full-width">
                    <h3>About the Release</h3>
                    <p>{shoe.description}</p>
                </div>

            </div>

            <InstantAlertModal
                isOpen={isAlertOpen}
                onClose={() => setIsAlertOpen(false)}
                onConfirm={handleConfirmAlert}
                shoe={shoe}
            />
        </div>
    );
};

export default ShoeDetail;