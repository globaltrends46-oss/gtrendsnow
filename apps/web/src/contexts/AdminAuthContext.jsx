import React, { createContext, useState, useContext, useEffect } from 'react';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token === 'true') {
      setIsAdmin(true);
    }
    setIsLoading(false);
  }, []);

  const login = (password) => {
    // Using environment variable if available, fallback to default
    const validPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
    
    if (password === validPassword) {
      localStorage.setItem('adminToken', 'true');
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAdmin, login, logout, isLoading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);