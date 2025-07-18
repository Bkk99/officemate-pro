import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, UserRole } from '../types';
import { getEmployeeById } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                try {
                    const employeeProfile = await getEmployeeById(session.user.id);
                    if (employeeProfile) {
                        const appUser: User = {
                            id: employeeProfile.id,
                            username: employeeProfile.email,
                            role: employeeProfile.role,
                            name: employeeProfile.name,
                            department: employeeProfile.department,
                        };
                        setUser(appUser);
                    } else {
                        // Handle case where auth user exists but profile doesn't
                        setUser(null);
                        await supabase.auth.signOut();
                    }
                } catch (e) {
                    console.error("Error fetching employee profile on session load", e);
                    setUser(null);
                    await supabase.auth.signOut();
                }
            } else {
                setUser(null);
            }
            setIsLoading(false);
        }
        
        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if(event === 'SIGNED_IN' && session?.user) {
                try {
                    const employeeProfile = await getEmployeeById(session.user.id);
                    if (employeeProfile) {
                        const appUser: User = {
                            id: employeeProfile.id,
                            username: employeeProfile.email,
                            role: employeeProfile.role,
                            name: employeeProfile.name,
                            department: employeeProfile.department,
                        };
                        setUser(appUser);
                    }
                } catch(e) {
                     console.error("Error fetching employee profile on SIGNED_IN", e);
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
            }
        });

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    const login = async (username: string, password: string): Promise<{ success: boolean; error: string | null }> => {
        setIsLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email: username,
            password: password,
        });
        
        setIsLoading(false);
        if (error) {
            console.error("Login error:", error);
            // Programmer backdoor from previous implementation
            if (username === 'programmer@officemate.com' && password === 'password') {
                const mockUser: User = {
                    id: 'user_programmer_01',
                    username: 'programmer@officemate.com',
                    role: UserRole.Programmer,
                    name: 'Programmer',
                    department: 'ฝ่ายไอที'
                };
                setUser(mockUser);
                return { success: true, error: null };
            }
            return { success: false, error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
        }
        
        return { success: true, error: null };
    };

    const logout = async () => {
        setIsLoading(true);
        await supabase.auth.signOut();
        setUser(null);
        setIsLoading(false);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
