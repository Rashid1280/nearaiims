import { createContext, useState, useEffect, useContext  } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // check for existing session on page load/refresh
  useEffect(() => {
    api.get('/api/auth/me')
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        setUser(null); 
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const value = { user, setUser, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}