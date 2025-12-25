import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';
import './Wishlist.css';

const Wishlist = () => {
    const { wishlist, toggleWishlist } = useWishlist();
    const { user, token } = useAuth(); 
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [monthlyLimit, setMonthlyLimit] = useState(1000); 
    
    const [isEditingLimit, setIsEditingLimit] = useState(false);
    const [tempLimit, setTempLimit] = useState('1000');

    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.monthly_budget) {
            setMonthlyLimit(user.monthly_budget);
            setTempLimit(user.monthly_budget.toString());
        }
    }, [user]);

    useEffect(() => {
        const fetchAndFilter = async () => {
            try {
                const response = await fetch(`${config.API_BASE_URL}/shoes`);
                const allShoes = await response.json();
                if (response.ok) {
                    const filtered = allShoes.filter(shoe => wishlist.includes(shoe.id));
                    setWishlistItems(filtered);
                }
            } catch (err) {
                console.error('Fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAndFilter();
    }, [wishlist]);

    const handleRemove = (id, e) => {
        e.stopPropagation();
        toggleWishlist(id);
    };

    const totalCost = wishlistItems.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
    const remaining = monthlyLimit - totalCost;
    const progressPercent = Math.min((totalCost / monthlyLimit) * 100, 100);
    const isOverBudget = totalCost > monthlyLimit;

    const handleLimitSave = async () => {
        const parsed = parseFloat(tempLimit);
        const newLimit = (tempLimit === '' || isNaN(parsed)) ? 0 : parsed;

        if (!user || !token) {
            setMonthlyLimit(newLimit);
            setIsEditingLimit(false);
            return;
        }

        try {
            const response = await fetch(`${config.API_BASE_URL}/user/budget`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ limit: newLimit })
            });

            if (response.ok) {
                setMonthlyLimit(newLimit);
                setTempLimit(newLimit.toString());
                setIsEditingLimit(false);
            } else {
                console.error("Failed to save budget limit");
            }
        } catch (error) {
            console.error("Network error saving budget:", error);
        }
    };

    if (loading) return <div className="wishlist-page">Loading your favorites...</div>;

    return (
        <div className="wishlist-page">
            <Link to="/" className="btn-back-home">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back to Home
            </Link>
            
            <div className="wishlist-header">
                <h1>My Wishlist</h1>
            </div>

            {user ? (
                <div className={`budget-dashboard glass-panel ${isOverBudget ? 'over-budget' : ''}`}>
                    <div className="budget-header-row">
                        <h2>Interactive Budget Planner</h2>
                        <div className="budget-controls">
                            <label>Monthly Limit:</label>
                            {isEditingLimit ? (
                                <div className="limit-input-group">
                                    <input
                                        type="number"
                                        value={tempLimit}
                                        onChange={(e) => setTempLimit(e.target.value)}
                                        className="limit-input"
                                        placeholder="Set limit..."
                                    />
                                    <button onClick={handleLimitSave} className="save-limit-btn">Save</button>
                                </div>
                            ) : (
                                <div className="limit-display" onClick={() => setIsEditingLimit(true)} title="Click to edit">
                                    ${monthlyLimit.toLocaleString()}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="edit-icon"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="budget-metrics">
                        <div className="metric-item">
                            <span className="metric-label">Total Planned</span>
                            <span className={`metric-value ${isOverBudget ? 'text-red' : ''}`}>
                                ${totalCost.toLocaleString()}
                            </span>
                        </div>
                        <div className="metric-item">
                            <span className="metric-label">Remaining</span>
                            <span className={`metric-value ${remaining < 0 ? 'text-red' : 'text-green'}`}>
                                ${remaining.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <div className="budget-progress-container">
                        <div className="progress-bar-bg">
                            <div
                                className={`progress-fill ${isOverBudget ? 'bg-red' : ''}`}
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                        <span className="progress-text">
                            {Math.round(progressPercent)}% of budget used
                        </span>
                    </div>
                </div>
            ) : (
                <div className="guest-budget-banner">
                    <div className="budget-blur-bg">
                        <div className="budget-placeholder-row"><span>$1,000</span><span>50%</span></div>
                        <div className="budget-placeholder-row"><span>$240</span><span>Remaining</span></div>
                    </div>

                    <div className="locked-card">
                        <div className="locked-header">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lock-icon">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                            <h3>Unlock Budget Tools</h3>
                        </div>
                        <p>Sign in to manage your monthly spending limit and track costs.</p>
                        <Link to="/login" className="btn-unlock">Sign In to Access</Link>
                    </div>
                </div>
            )}

            {wishlistItems.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            <line x1="12" y1="5.67" x2="12" y2="21.23" transform="rotate(45 12 12)"></line>
                        </svg>
                    </div>
                    <h2>Your wishlist is empty</h2>
                    <p>Start exploring drops and save your favorites.</p>
                    <Link to="/" className="explore-btn">Browse Drops</Link>
                </div>
            ) : (
                <div className="wishlist-grid">
                    {wishlistItems.map(item => (
                        <div
                            key={item.id}
                            className="wishlist-card glass-panel"
                            onClick={() => navigate(`/shoe/${item.id}`)}
                        >
                            <div className="card-image-container">
                                <img src={item.image_url} alt={item.model_name} />
                            </div>
                            <div className="card-content">
                                <div className="card-info">
                                    <span className="brand-tag">{item.brand_name}</span>
                                    <h3>{item.model_name}</h3>
                                    <span className="price">${item.price}</span>
                                </div>
                                <button
                                    className="remove-btn"
                                    onClick={(e) => handleRemove(item.id, e)}
                                    title="Remove from Wishlist"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;