//AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}
export const AuthProvider = ({ children }) => {
    const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken') || null);
const [user, setUser] = useState(() => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Errore nel parsing del JSON di user:", error);
    return null;
  }
});

    const navigate = useNavigate();

    // Funzione per verificare se il token è scaduto
    const isTokenExpired = (authToken) => {
        try {
            const decodedToken = jwtDecode(authToken);
            const currentTime = Date.now() / 1000; // Tempo corrente in secondi
            return decodedToken.exp < currentTime; // Verifica se il token è scaduto
        } catch (error) {
            return true; // In caso di errore nella decodifica, lo consideriamo scaduto
        }
    };

    // Effetto per verificare il token al caricamento
    useEffect(() => {
        if (authToken && isTokenExpired(authToken)) {
            logout(); // Se il token è scaduto, eseguiamo il logout
        }
    }, [authToken]);

    const login = (token, userData) => {
        setAuthToken(token);
        setUser(userData);
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));

        // Naviga alla dashboard solo dopo aver settato i dati utente
        navigate('/dashboard');
    };

    const logout = () => {
        setAuthToken(null);
        setUser(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const isAuthenticated = !!authToken && !isTokenExpired(authToken); // Aggiorna lo stato di autenticazione

    return (
        <AuthContext.Provider value={{ authToken, user, login, logout, isAuthenticated, setAuthToken }}>
            {children}
        </AuthContext.Provider>
    );
};
