import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import config from '../config';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]); 
    const { user, token } = useAuth();

    useEffect(() => {
        const fetchWishlist = async () => {
            if (!user || !token) {
                setWishlist([]);
                return;
            }

            try {
                const response = await fetch(`${config.API_BASE_URL}/wishlist`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const ids = data.map(item => item.shoe_id || item.id);
                    setWishlist(ids);
                }
            } catch (error) {
                console.error("Failed to fetch wishlist", error);
            }
        };

        fetchWishlist();
    }, [user, token]);

    const toggleWishlist = async (shoeId) => {
        if (!user) {
            alert("Please log in to save items to your wishlist!");
            return;
        }

        const isAlreadyIn = wishlist.includes(shoeId);
        
        if (isAlreadyIn) {
            setWishlist(prev => prev.filter(id => id !== shoeId));
        } else {
            setWishlist(prev => [...prev, shoeId]);
        }

        try {
            const response = await fetch(`${config.API_BASE_URL}/wishlist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ shoe_id: shoeId })
            });

            if (!response.ok) {
                console.error("Error updating wishlist on server");
                if (isAlreadyIn) {
                    setWishlist(prev => [...prev, shoeId]);
                } else {
                    setWishlist(prev => prev.filter(id => id !== shoeId));
                }
            }
        } catch (error) {
            console.error("Network error:", error);
        }
    };

    const isInWishlist = (shoeId) => {
        return wishlist.map(Number).includes(Number(shoeId));
    };

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};