import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
        setToken(null);
      }
    }

    setLoading(false);

  }, []);

  const login = (data) => {

    const { token: t, user: u } = data;

    localStorage.setItem('token', t);
    localStorage.setItem('role', u.role);
    localStorage.setItem('user', JSON.stringify(u));

    setToken(t);
    setUser(u);

  };

  const logout = () => {

    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');

    setToken(null);
    setUser(null);

  };

  // ⭐ NEW FUNCTION
  const updateUser = (updatedUser) => {

    const mergedUser = { ...user, ...updatedUser };

    localStorage.setItem('user', JSON.stringify(mergedUser));

    setUser(mergedUser);

  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      updateUser,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );

}

export function useAuth() {

  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return ctx;

}