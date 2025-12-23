import React, { useEffect } from 'react';
import './InstantAlertModal.css';

const InstantAlertModal = ({ isOpen, onClose, onConfirm, shoe }) => {

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !shoe) return null;

    return (
        <div className="alert-modal-overlay" onClick={onClose}>
            <div className="alert-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="alert-icon-wrapper">
                    <div className="alert-icon-glow"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="alert-icon">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                </div>

                <h2 className="alert-title">Get Notified Instantly</h2>
                <p className="alert-description">
                    We will send a notification to your Header Bell when this drop goes live.
                </p>

                <div className="product-preview">
                    <div className="preview-image-wrapper" style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: '#222'
                    }}>
                        <img
                            src={shoe.image_url}
                            alt={shoe.model_name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    </div>

                    <div className="preview-details">
                        <span className="preview-name">{shoe.model_name}</span>
                        <span className="preview-status" style={{ color: '#303ed1ff', fontSize: '12px', fontWeight: 'bold' }}>
                            UPCOMING
                        </span>
                    </div>
                </div>

                <button className="pro-btn primary-glow" onClick={onConfirm}>
                    ENABLE IN-APP ALERT
                </button>

                <button className="cancel-link" onClick={onClose}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default InstantAlertModal;