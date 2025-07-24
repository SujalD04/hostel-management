import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api/apiClient';

// 1. Create the context
const AuthContext = createContext();

// 2. Create the provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for a stored user session when the app loads
  useEffect(() => {
    const storedUser = localStorage.getItem('userData');
    const storedCredentials = localStorage.getItem('userCredentials');


    if (storedUser && storedCredentials) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    // Encode credentials for Basic Auth
    const credentials = btoa(`${email}:${password}`);
    
    // Store credentials so the apiClient interceptor can use them for the next request
    localStorage.setItem('userCredentials', credentials);

    try {
      // Make a request to the /auth/me endpoint to verify credentials and get user data
      const response = await apiClient.get('/auth/me');
      
      const userData = response.data;
      
      // If successful, store user data in localStorage and update state
      localStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true };

    } catch (error) {
      // If login fails, clear the stored credentials
      localStorage.removeItem('userCredentials');
      console.error("Login failed:", error.response ? error.response.data : error.message);
      return { success: false, message: 'Invalid credentials' };
    }
  };

  const logout = () => {
    // Clear user from state and localStorage
    setUser(null);
    localStorage.removeItem('userData');
    localStorage.removeItem('userCredentials');
  };

  // The value provided to the consuming components
  const value = {
    user,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};


// 3. Create a custom hook for easy consumption of the context
export const useAuth = () => {
  return useContext(AuthContext);
};