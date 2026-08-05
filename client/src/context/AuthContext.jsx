import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// the actual context object - starts empty, gets filled in by the Provider below
const AuthContext = createContext();

// wraps the app, holds the actual auth state, makes it available to everything inside
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // on first load, check if a valid session already exists (e.g. page refresh)
  useEffect(() => {
    axios.get('http://localhost:5000/api/auth/me', { withCredentials: true })
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        setUser(null); // no valid session - not an error worth showing the user
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

// a small custom hook so components don't need to import useContext + AuthContext separately every time
export function useAuth() {
  return useContext(AuthContext);
}