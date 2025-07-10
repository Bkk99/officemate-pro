import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  logout: () => void;
  isLoading: boolean;
  updateUserContext: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_ADMIN_USER: User = {
    id: 'mock-admin-id',
    username: 'admin@officemate.com',
    role: UserRole.ADMIN,
    name: 'แอดมิน (Mock)',
    department: 'บริหาร',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate checking for a session to persist login across reloads
        try {
            const sessionUser = sessionStorage.getItem('mockUser');
            if (sessionUser) {
                setUser(JSON.parse(sessionUser));
            }
        } catch (error) {
            console.error("Failed to parse mock user from session storage", error);
            sessionStorage.removeItem('mockUser');
        }
        setIsLoading(false);
    }, []);

    const login = async (username: string, password: string): Promise<{ success: boolean; error: string | null }> => {
        setIsLoading(true);
        await new Promise(res => setTimeout(res, 500)); // Simulate network delay

        if (username === 'admin@officemate.com' && password === 'admin12345') {
            setUser(MOCK_ADMIN_USER);
            sessionStorage.setItem('mockUser', JSON.stringify(MOCK_ADMIN_USER));
            setIsLoading(false);
            return { success: true, error: null };
        } else {
            setIsLoading(false);
            return { success: false, error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (นี่คือโหมดทดลอง)" };
        }
    };

    const logout = async () => {
        setIsLoading(true);
        await new Promise(res => setTimeout(res, 200));
        setUser(null);
        sessionStorage.removeItem('mockUser');
        setIsLoading(false);
    };
    
    const updateUserContext = (updatedUserData: User) => {
        if (user && user.id === updatedUserData.id) {
            setUser(updatedUserData);
             try {
                sessionStorage.setItem('mockUser', JSON.stringify(updatedUserData));
             } catch(e) {
                console.error("Failed to update user in session storage", e);
             }
        }
    };

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
