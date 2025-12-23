import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import Dropdown from '../Dropdown/Dropdown';
import config from '../../config';
import './DropsGrid.css';

const DropsGrid = ({ onSetReminder }) => {
    const [shoes, setShoes] = useState([]);
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedBrand, setSelectedBrand] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSort, setSelectedSort] = useState('Newest First');

    const [searchParams] = useSearchParams();
    const sectionRef = useRef(null);

    const { toggleWishlist, isInWishlist } = useWishlist();
    const navigate = useNavigate();

    useEffect(() => {
        const searchQuery = searchParams.get('search');
        if (searchQuery && sectionRef.current) {
            setTimeout(() => {
                sectionRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const searchQuery = searchParams.get('search');
                let shoesUrl = `${config.API_BASE_URL}/shoes`;
                if (searchQuery) {
                    shoesUrl += `?search=${encodeURIComponent(searchQuery)}`;
                }

                const [shoesRes, brandsRes, catsRes] = await Promise.all([
                    fetch(shoesUrl),
                    fetch(`${config.API_BASE_URL}/brands`),
                    fetch(`${config.API_BASE_URL}/categories`)
                ]);

                if (shoesRes.ok) setShoes(await shoesRes.json());
                if (brandsRes.ok) setBrands(await brandsRes.json());
                if (catsRes.ok) setCategories(await catsRes.json());

            } catch (err) {
                console.error('Fetch error:', err);
                setError('Database connection lost. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [searchParams]);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (loading) return <div className="drops-loading" ref={sectionRef}>Loading amazing drops...</div>;
    if (error) return <div className="drops-error-message glass-panel">{error}</div>;

    const filteredShoes = shoes
        .filter(shoe => {
            const brandMatch = !selectedBrand || shoe.brand_id === selectedBrand;
            const categoryMatch = !selectedCategory || shoe.category_id === selectedCategory;
            return brandMatch && categoryMatch;
        })
        .sort((a, b) => {
            if (selectedSort === 'Newest First') return new Date(b.release_date) - new Date(a.release_date);
            if (selectedSort === 'Oldest First') return new Date(a.release_date) - new Date(b.release_date);
            if (selectedSort === 'Price: Low to High') return a.price - b.price;
            return 0;
        });

    const brandOptions = [{ id: 'all', name: 'All Brands' }, ...brands];
    const categoryOptions = [{ id: 'all', name: 'All Categories' }, ...categories];

    return (
        <section className="drops-section" ref={sectionRef}>
            <div className="drops-header">
                <div className="filter-group">
                    <Dropdown
                        label="All Brands"
                        options={brandOptions}
                        value={selectedBrand || 'all'}
                        onSelect={(opt) => setSelectedBrand(opt.id === 'all' ? null : opt.id)}
                    />
                    <Dropdown
                        label="All Categories"
                        options={categoryOptions}
                        value={selectedCategory || 'all'}
                        onSelect={(opt) => setSelectedCategory(opt.id === 'all' ? null : opt.id)}
                    />
                    <Dropdown
                        label="Sort by Date"
                        options={['Newest First', 'Oldest First', 'Price: Low to High']}
                        value={selectedSort}
                        onSelect={(opt) => setSelectedSort(opt)}
                    />
                </div>
            </div>

            <div className="drops-grid">
                {filteredShoes.length === 0 ? (
                    <p className="no-data">
                        {searchParams.get('search')
                            ? `No drops found for "${searchParams.get('search')}"`
                            : "No drops found matching the criteria."}
                    </p>
                ) : (
                    filteredShoes.map((sneaker) => {
                        const isUpcoming = new Date(sneaker.release_date) > new Date();

                        return (
                            <div
                                key={sneaker.id}
                                className="drop-card"
                                onClick={() => navigate(`/shoe/${sneaker.id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="card-image-wrapper">
                                    <span className={`date-badge ${sneaker.status.toLowerCase()}`}>
                                        {formatDate(sneaker.release_date)} • {sneaker.status}
                                    </span>

                                    <img
                                        src={sneaker.image_url}
                                        alt={sneaker.model_name}
                                        className="card-image"
                                    />
                                </div>

                                <div className="card-details">
                                    <h3 className="card-title">{sneaker.model_name}</h3>
                                    <div className="card-price">${sneaker.price}</div>

                                    <div className="card-actions">
                                        <button
                                            className={`action-btn ${isInWishlist(sneaker.id) ? 'liked' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleWishlist(sneaker.id);
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isInWishlist(sneaker.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                            </svg>
                                        </button>

                                        {isUpcoming && (
                                            <button
                                                className="action-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSetReminder(sneaker);
                                                }}
                                                title="Set Reminder"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </section>
    );
};

export default DropsGrid;