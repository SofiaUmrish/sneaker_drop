import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../config';
import './HeroSection.css';

const HeroSection = ({ onSetReminder }) => {
    const navigate = useNavigate();
    const [shoe, setShoe] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${config.API_BASE_URL}/shoes/soonest`)
            .then(res => res.json())
            .then(data => {
                setShoe(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching soonest drop:", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="hero-container" style={{ justifyContent: 'center', color: 'white' }}>Loading next drop...</div>;
    }
    if (!shoe) {
        return (
            <div className="hero-container" style={{ justifyContent: 'center', color: 'white' }}>
                <h2>No upcoming drops found. Stay tuned!</h2>
            </div>
        );
    }

    const isUpcoming = new Date(shoe.release_date) > new Date();

    return (
        <section className="hero-container">
            <div className="hero-content">
                <span className="drop-label">🔥 SOONEST DROP</span>
                <h1 className="hero-headline">{shoe.model_name}</h1>
                <p className="hero-description">
                    {shoe.description || "The classic returns. Don't miss out on the release date."}
                </p>

                {isUpcoming && (
                    <button
                        className="cta-button"
                        onClick={() => onSetReminder(shoe)}
                    >
                        SET REMINDER
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                    </button>
                )}
            </div>

            <div
                className="hero-visual"
                onClick={() => navigate(`/shoe/${shoe.id}`)}
                style={{ cursor: 'pointer' }}
            >
                <div className="sneaker-image-wrapper">
                    <p className="hero-date">
                        Release Date: {new Date(shoe.release_date).toLocaleDateString()}
                    </p>
                    <img
                        src={shoe.image_url}
                        alt={shoe.model_name}
                        className="sneaker-image"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                </div>
            </div>
        </section>
    );
};

export default HeroSection;