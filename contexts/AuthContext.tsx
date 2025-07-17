

import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole } from '../types';
import { DEPARTMENTS } from '../constants';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  logout: () => void;
  isLoading: boolean;
  updateUserContext: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define mock users internally
const mockUsersWithPasswords = [
  { id: 'user-admin-01', username: 'admin@officemate.com', password: 'password', name: 'คุณแอดมิน', role: UserRole.ADMIN, department: DEPARTMENTS[7] },
  { id: 'user-manager-01', username: 'manager@officemate.com', password: 'password', name: 'คุณเมเนเจอร์', role: UserRole.MANAGER, department: DEPARTMENTS[0] },
  { id: 'user-staff-01', username: 'staff@officemate.com', password: 'password', name: 'คุณสตาฟ', role: UserRole.STAFF, department: DEPARTMENTS[1] },
  { id: 'user-hr-01', username: 'hr@officemate.com', password: 'password', name: 'คุณเอชอาร์', role: UserRole.STAFF, department: DEPARTMENTS[3] },
  { id: 'user-programmer-01', username: 'programmer@officemate.com', password: 'password', name: 'โปรแกรมเมอร์', role: UserRole.Programmer, department: DEPARTMENTS[5] },
];


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for logged in user in localStorage on initial load
        try {
            const storedUser = localStorage.getItem('officemate_user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem('officemate_user');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = async (username: string, password: string): Promise<{ success: boolean; error: string | null }> => {
        setIsLoading(true);
        await new Promise(res => setTimeout(res, 500)); // Simulate network delay

        const foundUser = mockUsersWithPasswords.find(
            u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
        );
        
        setIsLoading(false);
        if (foundUser) {
            const { password: _p, ...userToStore } = foundUser; // Exclude password from stored object
            setUser(userToStore);
            localStorage.setItem('officemate_user', JSON.stringify(userToStore));
            return { success: true, error: null };
        } else {
            return { success: false, error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('officemate_user');
    };
    
    const updateUserContext = (updatedUserData: Partial<User>) => {
      setUser(prevUser => {
        if (!prevUser) return null;
        const newUser = { ...prevUser, ...updatedUserData };
        localStorage.setItem('officemate_user', JSON.stringify(newUser));
        return newUser;
      });
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
