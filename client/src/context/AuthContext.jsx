import React, { createContext, useContext, useState, useEffect } from 'react';
import config from '../config';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');
        if (savedUser && savedToken) {
            setUser(JSON.parse(savedUser));
            setToken(savedToken);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch(`${config.API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                const loggedUser = {
                    id: data.id,
                    name: data.name,
                    role: data.role.toLowerCase() === 'admin' ? 'Admin' : 'User',
                    email: email
                };

                setUser(loggedUser);
                setToken(data.token);

                localStorage.setItem('user', JSON.stringify(loggedUser));
                localStorage.setItem('token', data.token);

                return { success: true, role: loggedUser.role };
            } else {
                return { success: false, message: data.error || 'Invalid credentials' };
            }
        } catch (err) {
            console.error('Login error:', err);
            return { success: false, message: 'Database connection lost. Please try again later.' };
        }
    };

    const register = async (name, email, password) => {
        try {
            const response = await fetch(`${config.API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                return { success: true };
            } else {
                return { success: false, message: data.error || 'Registration failed' };
            }
        } catch (err) {
            console.error('Registration error:', err);
            return { success: false, message: 'Database connection lost. Please try again later.' };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    const updateUserProfile = async (name, email) => {
        try {
            const response = await fetch(`${config.API_BASE_URL}/user/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, email }),
            });

            const data = await response.json();

            if (response.ok) {
                const updatedUser = { ...user, name: data.name, email: data.email };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                return { success: true };
            } else {
                return { success: false, message: data.error || 'Update failed' };
            }
        } catch (err) {
            console.error('Update error:', err);
            return { success: false, message: 'Connection error' };
        }
    };

    const value = {
        user,
        token,
        login,
        register,
        logout,
        updateUserProfile,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'Admin',
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
