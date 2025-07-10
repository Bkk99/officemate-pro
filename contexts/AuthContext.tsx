
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS, authenticateUser, getUserById } from '../services/mockData';

interface AuthContextType {
  user: User | null;
  login: (username: string, password_DUMMY: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  updateUserContext: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem('officemate-userId');
    if (storedUserId) {
      const foundUser = getUserById(storedUserId); // In a real app, this would be an API call
      if (foundUser) {
        setUser(foundUser);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password_DUMMY: string): Promise<boolean> => {
    setIsLoading(true);
    // In a real app, password would be used and sent to a backend
    // For this mock, we just use the username
    const authenticatedUser = authenticateUser(username, password_DUMMY);
    if (authenticatedUser) {
      setUser(authenticatedUser);
      localStorage.setItem('officemate-userId', authenticatedUser.id);
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('officemate-userId');
  }, []);
  
  const updateUserContext = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    if (updatedUser) {
       localStorage.setItem('officemate-userId', updatedUser.id);
    }
  }, []);


  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, updateUserContext }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
