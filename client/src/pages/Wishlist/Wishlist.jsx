import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './Wishlist.css';

const Wishlist = () => {
    const { wishlist, toggleWishlist } = useWishlist();
    const { user } = useAuth();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [monthlyLimit, setMonthlyLimit] = useState(() => {
        return parseFloat(localStorage.getItem('wishlistLimit')) || 1000;
    });
    const [isEditingLimit, setIsEditingLimit] = useState(false);
    const [tempLimit, setTempLimit] = useState(monthlyLimit.toString());

    const printRef = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAndFilter = async () => {
            try {
                const url = config.API_BASE_URL.startsWith('http') 
                    ? `${config.API_BASE_URL}/shoes` 
                    : `${window.location.origin}${config.API_BASE_URL}/shoes`;

                const response = await fetch(url);
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

    const handleLimitSave = () => {
        const parsed = parseFloat(tempLimit);
        const newLimit = (tempLimit === '' || isNaN(parsed)) ? 0 : parsed;

        setMonthlyLimit(newLimit);
        localStorage.setItem('wishlistLimit', newLimit);
        setTempLimit(newLimit.toString());
        setIsEditingLimit(false);
    };

    const handleDownloadPDF = async () => {
        const element = printRef.current;
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('my-sneaker-wishlist.pdf');
        } catch (error) {
            console.error("PDF Error:", error);
            alert("Could not generate PDF. Please try on a computer.");
        }
    };

    if (loading) return <div className="wishlist-page">Loading your favorites...</div>;

    return (
        <div className="wishlist-page">
            <Link to="/" className="btn-back-home">
                Back to Home
            </Link>
            
            <div className="wishlist-header">
                <h1>My Wishlist</h1>
                {wishlistItems.length > 0 && (
                    <button className="print-btn" onClick={handleDownloadPDF}>
                        Download PDF
                    </button>
                )}
            </div>

            <div ref={printRef} style={{ padding: '20px', background: '#121212' }}> 
                
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
                                        />
                                        <button onClick={handleLimitSave} className="save-limit-btn">Save</button>
                                    </div>
                                ) : (
                                    <div className="limit-display" onClick={() => setIsEditingLimit(true)}>
                                        ${monthlyLimit.toLocaleString()}
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
                        </div>
                    </div>
                ) : (
                    <div className="guest-budget-banner">
                        <p style={{color: 'white', textAlign: 'center'}}>Sign in to see full budget tools</p>
                    </div>
                )}

                {wishlistItems.length === 0 ? (
                    <div className="empty-state">
                        <h2>Your wishlist is empty</h2>
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
                                    <img src={item.image_url} alt={item.model_name} crossOrigin="anonymous" />
                                </div>
                                <div className="card-content">
                                    <div className="card-info">
                                        <span className="brand-tag">{item.brand_name}</span>
                                        <h3 style={{color: 'white'}}>{item.model_name}</h3>
                                        <span className="price">${item.price}</span>
                                    </div>
                                    <button
                                        className="remove-btn"
                                        onClick={(e) => handleRemove(item.id, e)}
                                    >
                                        X
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;