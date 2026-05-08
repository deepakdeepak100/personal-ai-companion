import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser();
        } else {
            delete api.defaults.headers.common['Authorization'];
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const res = await api.get('/api/auth/me');
            setUser(res.data);
        } catch (error) {
            console.error("Error fetching user", error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await api.post('/api/auth/login', { email, password });
        const { token, ...userData } = res.data;
        setToken(token);
        setUser(userData);
        localStorage.setItem('token', token);
        return res.data;
    };

    const signup = async (name, email, password) => {
        const res = await api.post('/api/auth/signup', { name, email, password });
        const { token, ...userData } = res.data;
        setToken(token);
        setUser(userData);
        localStorage.setItem('token', token);
        return res.data;
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, token, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
