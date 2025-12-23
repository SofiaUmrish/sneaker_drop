import React, { useEffect } from 'react';
import './ReminderModal.css';

const ReminderModal = ({ isOpen, onClose, title, children, sneakerName, sneakerImage, onEnableAlert }) => {
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

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>

                <div className="alert-icon-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                </div>

                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="close-btn" onClick={onClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="modal-body">
                    <p className="modal-description center-text">
                        We will send a notification to your Header Bell when this drop goes live.
                    </p>
                    <div className="product-preview-container">
                        <img src={sneakerImage} alt={sneakerName} className="product-image" />
                        <div className="product-info">
                            <h4>{sneakerName}</h4>
                            <p>Release: Dec 22</p>
                        </div>
                    </div>

                    <button className="modal-btn primary-alert-btn" onClick={onEnableAlert}>
                        ENABLE IN-APP ALERT
                    </button>

                    <div className="cancel-link-wrapper">
                        <button className="cancel-link" onClick={onClose}>Cancel</button>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
};

export default ReminderModal;