import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const DEMO_USERS = [
  { username: 'owner', name: 'Master Owner', role: 'owner' },
  { username: 'manager', name: 'Warehouse Manager', role: 'warehouse_manager' },
  { username: 'picker', name: 'Accessory Picker', role: 'accessory_picker' },
  { username: 'stitching', name: 'Job Work (Stitching)', role: 'job_work_stitching' },
  { username: 'finishing', name: 'Job Work (Finishing)', role: 'job_work_finishing' }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('kaypee_user');
    return savedUser ? JSON.parse(savedUser) : DEMO_USERS[0];
  });

  const [token, setToken] = useState(() => localStorage.getItem('kaypee_token') || 'demo_token');

  const login = async (username, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('kaypee_user', JSON.stringify(data.user));
      localStorage.setItem('kaypee_token', data.token);
      return data.user;
    } catch (err) {
      console.warn('API login failed, falling back to local quick auth:', err.message);
      const match = DEMO_USERS.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (match) {
        setUser(match);
        localStorage.setItem('kaypee_user', JSON.stringify(match));
        return match;
      }
      throw err;
    }
  };

  const switchRole = async (targetUsername) => {
    return login(targetUsername, 'password123');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('kaypee_user');
    localStorage.removeItem('kaypee_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, switchRole, logout, DEMO_USERS }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
