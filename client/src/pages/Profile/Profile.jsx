import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';
import './Profile.css';

const Profile = () => {
    const { user, logout, updateUserProfile, token } = useAuth();
    const navigate = useNavigate();

    const [trackedDrops, setTrackedDrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editError, setEditError] = useState('');
    const [editSuccess, setEditSuccess] = useState('');

    useEffect(() => {
        const fetchReminders = async () => {
            if (!token) return;

            try {
                const response = await fetch(`${config.API_BASE_URL}/user/reminders`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setTrackedDrops(data);
                }
            } catch (err) {
                console.error("Failed to fetch reminders", err);
            } finally {
                setLoading(false);
            }
        };

        fetchReminders();
    }, [token]);

    const handleRemoveReminder = async (reminderId) => {
        try {
            const response = await fetch(`${config.API_BASE_URL}/reminders/${reminderId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setTrackedDrops(prev => prev.filter(item => item.reminder_id !== reminderId));
            }
        } catch (err) {
            console.error("Failed to remove reminder", err);
        }
    };

    const openEditModal = () => {
        setEditName(user?.name || '');
        setEditEmail(user?.email || '');
        setEditError('');
        setEditSuccess('');
        setShowEditModal(true);
    };

    const handleSaveProfile = async () => {
        setEditError('');
        setEditSuccess('');

        const result = await updateUserProfile(editName, editEmail);

        if (result.success) {
            setEditSuccess('Profile updated successfully!');
            setTimeout(() => {
                setShowEditModal(false);
            }, 1000);
        } else {
            setEditError(result.message);
        }
    };

    return (
        <div className="profile-page">
            <Link to="/" className="btn-back-home">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back to Home
            </Link>

            <div className="profile-layout">
                <aside className="profile-sidebar glass-panel">
                    <div className="avatar-circle">
                        {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
                    </div>
                    <h1 className="user-name">{user?.name}</h1>
                    <p className="user-email">{user?.email}</p>

                    <button
                        className="btn-secondary btn-edit-profile"
                        onClick={openEditModal}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        Edit Profile
                    </button>

                    <button
                        className="btn-danger btn-logout-sidebar"
                        onClick={() => setShowLogoutModal(true)}
                    >
                        Logout
                    </button>
                </aside>

                <main className="profile-feed">
                    <h2 className="section-title">
                        <span className="bell-icon">🔔</span> My Tracked Drops
                    </h2>

                    <div className="tracked-list">
                        {loading ? (
                            <div style={{ color: '#888' }}>Loading reminders...</div>
                        ) : trackedDrops.length > 0 ? (
                            trackedDrops.map(shoe => (
                                <div key={shoe.reminder_id} className="tracked-item glass-panel">
                                    <div className="tracked-thumb">
                                        <img src={shoe.image_url} alt={shoe.model_name} />
                                    </div>
                                    <div className="tracked-info">
                                        <h3>{shoe.model_name}</h3>
                                        <p className="release-date">
                                            {new Date(shoe.release_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div className="tracked-actions">
                                        {shoe.shop_link && (
                                            <a href={shoe.shop_link} target="_blank" rel="noopener noreferrer" className="btn-go-site">
                                                Go to Site
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                            </a>
                                        )}
                                        <button
                                            className="btn-remove-track"
                                            onClick={() => handleRemoveReminder(shoe.reminder_id)}
                                            title="Stop Tracking"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-tracked glass-panel">
                                <p>You haven't set any drop reminders yet.</p>
                                <p className="sub-text">Click the 🔔 on a drop to stay updated!</p>
                                <Link to="/" className="btn-browse-drops">Browse Drops</Link>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {showLogoutModal && (
                <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Log Out?</h3>
                            <button className="close-x" onClick={() => setShowLogoutModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to log out?</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowLogoutModal(false)}>Cancel</button>
                            <button
                                className="btn-danger"
                                onClick={() => {
                                    logout();
                                    navigate('/');
                                }}
                            >
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Edit Profile</h3>
                            <button className="close-x" onClick={() => setShowEditModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            {editError && <div style={{ color: '#ff453a', marginBottom: '15px', fontSize: '14px', background: 'rgba(255, 69, 58, 0.1)', padding: '10px', borderRadius: '8px' }}>{editError}</div>}
                            {editSuccess && <div style={{ color: '#32d74b', marginBottom: '15px', fontSize: '14px', background: 'rgba(50, 215, 75, 0.1)', padding: '10px', borderRadius: '8px' }}>{editSuccess}</div>}

                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '14px' }}>Full Name</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '14px' }}>Email Address</label>
                                <input
                                    type="email"
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                    style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                            <button
                                className="btn-primary"
                                onClick={handleSaveProfile}
                                style={{
                                    background: '#0044CC',
                                    color: '#fff',
                                    border: 'none',
                                    boxShadow: '0 0 15px rgba(0, 68, 204, 0.4)'
                                }}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;