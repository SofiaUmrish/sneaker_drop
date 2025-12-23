import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';
import DatePicker from 'react-datepicker';
import Dropdown from '../../components/Dropdown/Dropdown';
import "react-datepicker/dist/react-datepicker.css";
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { user, logout, updateUserProfile } = useAuth();
    const navigate = useNavigate();

    const [shoes, setShoes] = useState([]);
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [hypeDrops, setHypeDrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);


    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editProfileError, setEditProfileError] = useState('');
    const [editProfileSuccess, setEditProfileSuccess] = useState('');

    const openEditProfileModal = () => {
        setEditName(user?.name || '');
        setEditEmail(user?.email || '');
        setEditProfileError('');
        setEditProfileSuccess('');
        setShowEditProfileModal(true);
    };

    const handleSaveProfile = async () => {
        setEditProfileError('');
        setEditProfileSuccess('');

        const result = await updateUserProfile(editName, editEmail);

        if (result.success) {
            setEditProfileSuccess('Profile updated successfully!');
            setTimeout(() => {
                setShowEditProfileModal(false);
            }, 1000);
        } else {
            setEditProfileError(result.message);
        }
    };

    const [newDrop, setNewDrop] = useState({
        name: '',
        brand_id: '',
        category_id: '',
        description: '',
        price: '',
        date: new Date(),
        image: '',
        purchase_url: '',
        sku: ''
    });

    const handleEdit = (shoeToEdit) => {
        if (shoeToEdit) {
            setNewDrop({
                name: shoeToEdit.model_name,
                brand_id: shoeToEdit.brand_id.toString(),
                category_id: shoeToEdit.category_id.toString(),
                description: shoeToEdit.description || '',
                price: shoeToEdit.price.toString(),
                date: new Date(shoeToEdit.release_date),
                image: shoeToEdit.image_url || '',
                purchase_url: shoeToEdit.shop_link || '',
                sku: shoeToEdit.sku || ''
            });
            setIsEditing(true);
            setEditingId(shoeToEdit.id);
            setError('');
            setSuccessMsg('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingId(null);
        setNewDrop({
            name: '',
            brand_id: brands.length > 0 ? brands[0].id.toString() : '',
            category_id: categories.length > 0 ? categories[0].id.toString() : '',
            description: '',
            price: '',
            date: new Date(),
            image: '',
            purchase_url: '',
            sku: ''
        });
        setError('');
        setSuccessMsg('');
    };

    const handleDeleteDrop = (id, name) => {
        setItemToDelete({ id, name });
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            const response = await fetch(`${config.API_BASE_URL}/shoes/${itemToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                setSuccessMsg(`Successfully deleted: ${itemToDelete.name}`);
                setShoes(prev => prev.filter(s => s.id !== itemToDelete.id));
                if (editingId === itemToDelete.id) {
                    handleCancelEdit();
                }
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to delete sneaker.');
            }
        } catch (err) {
            console.error('Delete error:', err);
            setError('Failed to connect to server for deletion.');
        } finally {
            setShowDeleteModal(false);
            setItemToDelete(null);
        }
    };

    const fetchData = async () => {
        try {
            const [shoesRes, brandsRes, catsRes, hypeRes] = await Promise.all([
                fetch(`${config.API_BASE_URL}/shoes`),
                fetch(`${config.API_BASE_URL}/brands`),
                fetch(`${config.API_BASE_URL}/categories`),
                fetch(`${config.API_BASE_URL}/analytics/hype`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                })
            ]);

            const [shoesData, brandsData, catsData, hypeData] = await Promise.all([
                shoesRes.json(),
                brandsRes.json(),
                catsRes.json(),
                hypeRes.json()
            ]);

            if (shoesRes.ok) setShoes(shoesData);
            if (hypeRes.ok) setHypeDrops(hypeData);
            if (brandsRes.ok) {
                setBrands(brandsData);
                if (brandsData.length > 0) setNewDrop(prev => ({ ...prev, brand_id: brandsData[0].id.toString() }));
            }
            if (catsRes.ok) {
                setCategories(catsData);
                if (catsData.length > 0) setNewDrop(prev => ({ ...prev, category_id: catsData[0].id.toString() }));
            }

        } catch (err) {
            console.error('Fetch error:', err);
            setError('Database connection lost. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewDrop(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (date) => {
        setNewDrop(prev => ({ ...prev, date: date }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        const payload = {
            model_name: newDrop.name,
            description: newDrop.description,
            price: parseFloat(newDrop.price),
            release_date: newDrop.date.toISOString(),
            image_url: newDrop.image,
            shop_link: newDrop.purchase_url,
            brand_id: parseInt(newDrop.brand_id),
            category_id: parseInt(newDrop.category_id),
            sku: newDrop.sku,
            admin_id: user?.id
        };

        try {
            if (isEditing) {
                const response = await fetch(`${config.API_BASE_URL}/shoes/${editingId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(payload),
                });
                const data = await response.json();

                if (response.ok) {
                    setSuccessMsg(`Drop Updated: ${newDrop.name}`);
                    setShoes(prev => prev.map(s => s.id === editingId ? { ...s, ...data.updatedShoe } : s));
                    handleCancelEdit();
                } else {
                    setError(data.error || 'Failed to update shoe');
                }
            } else {
                const response = await fetch(`${config.API_BASE_URL}/shoes`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(payload),
                });
                const data = await response.json();

                if (response.ok) {
                    setSuccessMsg(`New Drop Added: ${newDrop.name}`);
                    setShoes(prev => [data, ...prev]);
                    handleCancelEdit();
                } else {
                    setError(data.error || 'Failed to add shoe');
                }
            }
        } catch (err) {
            console.error('Submit error:', err);
            setError('Database connection lost. Please try again later.');
        }
    };

    if (loading) return <div className="admin-page"><p>Loading Dashboard...</p></div>;

    return (
        <div className="admin-page">
            <header className="admin-header">
                <h1>Admin Dashboard</h1>
                <div className="header-actions">
                    <Link to="/" className="btn-back-home">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                        Go to Website
                    </Link>
                </div>
            </header>

            {error && <div className="error-message global-error">{error}</div>}
            {successMsg && <div className="success-message global-success">{successMsg}</div>}

            <section className="dashboard-section glass-panel analytics-section">
                <div className="section-header">
                    <h2>Hype Analytics</h2>
                    <span className="count-badge">Top Wishlisted</span>
                </div>
                <div className="hype-list">
                    {hypeDrops.map((shoe, index) => (
                        <div key={shoe.id} className="hype-card">
                            <span className="rank-number">#{index + 1}</span>
                            <img src={shoe.image_url} alt={shoe.model_name} className="hype-thumb" />
                            <div className="hype-info">
                                <h4>{shoe.model_name}</h4>
                            </div>
                            <div className="hype-indicator">
                                <span className="likes-count">{shoe.likes_count}</span>
                                <span className="likes-label">Likes</span>
                            </div>
                        </div>
                    ))}
                    {hypeDrops.length === 0 && <p style={{ gridColumn: '1/-1', textAlign: 'center', opacity: 0.5 }}>No hype data yet. Start wishlisting!</p>}
                </div>
            </section>

            <div className="admin-content-stack">
                <div className="add-drop-container">
                    <section className="dashboard-section glass-panel add-drop-section">
                        <div className="section-header">
                            <h2>{isEditing ? 'Edit Drop' : 'Add New Drop'}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="admin-form">
                            <div className="form-group">
                                <label>Model Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={newDrop.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Air Jordan 4"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Brand</label>
                                    <Dropdown
                                        options={brands}
                                        value={newDrop.brand_id}
                                        onSelect={(opt) => setNewDrop(prev => ({ ...prev, brand_id: opt.id }))}
                                        placeholder="Select Brand"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <Dropdown
                                        options={categories}
                                        value={newDrop.category_id}
                                        onSelect={(opt) => setNewDrop(prev => ({ ...prev, category_id: opt.id }))}
                                        placeholder="Select Category"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={newDrop.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe the release details..."
                                    rows="4"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>SKU (Stock Keeping Unit)</label>
                                <input
                                    type="text"
                                    name="sku"
                                    value={newDrop.sku}
                                    onChange={handleInputChange}
                                    placeholder="e.g. DZ5485-612"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Price</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={newDrop.price}
                                        onChange={handleInputChange}
                                        onKeyDown={(e) => ["-", "e", "E"].includes(e.key) && e.preventDefault()}
                                        placeholder="200"
                                        step="0.01"
                                        min="0"
                                        required
                                    />
                                </div>
                                <div className="form-group datepicker-group">
                                    <label>Release Date</label>
                                    <DatePicker
                                        selected={newDrop.date}
                                        onChange={handleDateChange}
                                        showTimeSelect
                                        timeFormat="HH:mm"
                                        timeIntervals={30}
                                        timeCaption="Time"
                                        dateFormat="MMMM d, yyyy h:mm aa"
                                        placeholderText="Select date and time"
                                        className="custom-datepicker"
                                        calendarClassName="professional-dark-calendar"
                                        portalId="portal-root"
                                        popperPlacement="bottom-end"
                                        fixedHeight
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Image URL</label>
                                <input
                                    type="url"
                                    name="image"
                                    value={newDrop.image}
                                    onChange={handleInputChange}
                                    placeholder="https://..."
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Shop Link</label>
                                <input
                                    type="url"
                                    name="purchase_url"
                                    value={newDrop.purchase_url}
                                    onChange={handleInputChange}
                                    placeholder="https://shop.com/..."
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn-add-drop">
                                    {isEditing ? 'Update Drop' : '+ Add Drop'}
                                </button>
                                {isEditing && (
                                    <button
                                        type="button"
                                        className="btn-cancel-edit"
                                        onClick={handleCancelEdit}
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </section>
                </div>

                <div className="inventory-container">
                    <section className="dashboard-section glass-panel drops-list-section">
                        <div className="section-header">
                            <h2>Inventory Management</h2>
                            <span className="count-badge">{shoes.length} Items</span>
                        </div>

                        <div className="inventory-table-wrapper">
                            <div className="inventory-header">
                                <div>Image</div>
                                <div>Name</div>
                                <div>SKU</div>
                                <div>Status</div>
                                <div>Price</div>
                                <div>Actions</div>
                            </div>
                            <div className="inventory-list">
                                {shoes.map(shoe => (
                                    <div key={shoe.id} className="inventory-row">
                                        <div className="col-image">
                                            <div className="thumb-wrapper">
                                                <img src={shoe.image_url} alt={shoe.model_name} />
                                            </div>
                                        </div>
                                        <div className="col-name">
                                            <span className="shoe-name">{shoe.model_name}</span>
                                            <span className="shoe-brand">{shoe.brand_name}</span>
                                        </div>
                                        <div className="col-sku">
                                            <code className="sku-code">{shoe.sku || 'N/A'}</code>
                                        </div>
                                        <div className="col-status">
                                            <span className={`status-badge ${shoe.status?.toLowerCase() || 'upcoming'}`}>
                                                {shoe.status || 'Upcoming'}
                                            </span>
                                        </div>
                                        <div className="col-price">${shoe.price}</div>
                                        <div className="col-actions">
                                            <button
                                                className="icon-action edit"
                                                title="Edit Drop"
                                                onClick={() => handleEdit(shoe)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                </svg>
                                            </button>
                                            <button
                                                className="icon-action delete"
                                                title="Delete Drop"
                                                onClick={() => handleDeleteDrop(shoe.id, shoe.model_name)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {shoes.length === 0 && (
                                    <div className="no-items">No shoes found</div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
            <div id="portal-root"></div>
            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Delete Drop?</h3>
                            <button className="close-x" onClick={() => setShowDeleteModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to delete <strong>{itemToDelete?.name}</strong>?</p>
                            <p className="warning-text">This action cannot be undone.</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            <button className="btn-danger" onClick={confirmDelete}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {showLogoutModal && (
                <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Log Out?</h3>
                            <button className="close-x" onClick={() => setShowLogoutModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to log out of the admin panel?</p>
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

            {showEditProfileModal && (
                <div className="modal-overlay" onClick={() => setShowEditProfileModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Edit Profile</h3>
                            <button className="close-x" onClick={() => setShowEditProfileModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            {editProfileError && <div style={{ color: '#ff453a', marginBottom: '15px', fontSize: '14px', background: 'rgba(255, 69, 58, 0.1)', padding: '10px', borderRadius: '8px' }}>{editProfileError}</div>}
                            {editProfileSuccess && <div style={{ color: '#32d74b', marginBottom: '15px', fontSize: '14px', background: 'rgba(50, 215, 75, 0.1)', padding: '10px', borderRadius: '8px' }}>{editProfileSuccess}</div>}

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
                            <button className="btn-secondary" onClick={() => setShowEditProfileModal(false)}>Cancel</button>
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

export default AdminDashboard;