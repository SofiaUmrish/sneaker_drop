import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import config from '../config';

const WishlistContext = createContext();

export const useWishlist = () => {
    return useContext(WishlistContext);
};

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        const saved = localStorage.getItem('wishlist');
        if (saved) {
            try {
                setWishlist(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse wishlist from local storage", e);
                setWishlist([]);
            }
        }
    }, []);

    const toggleWishlist = async (id) => {
        const exists = wishlist.includes(id);
        let updated;
        if (exists) {
            updated = wishlist.filter(itemId => itemId !== id);
        } else {
            updated = [...wishlist, id];
        }
        setWishlist(updated);
        localStorage.setItem('wishlist', JSON.stringify(updated));

        if (user?.id) {
            try {
                const response = await fetch(`${config.API_BASE_URL}/wishlist`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ shoe_id: id }),
                });

                if (!response.ok) {
                    console.error('Wishlist sync failed');
                }
            } catch (error) {
                console.error('Wishlist sync error:', error);
            }
        }
    };

    const isInWishlist = (id) => {
        return wishlist.includes(id);
    };

    const value = {
        wishlist,
        toggleWishlist,
        isInWishlist
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};
