// src/contexts/AuthContext.tsx (เวอร์ชันสุดท้าย)
import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, UserRole } from '../types';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  login: (email: string, password_DUMMY: string) => Promise<{ success: boolean; error: string | null }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  updateUserContext: (updatedUser: User) => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAndSetUserProfile = useCallback(async (session: Session | null) => {
    try {
      if (session?.user) {
        const authUser = session.user;
        const { data: profile, error } = await supabase
          .from('users')
          .select(`username, role, Employees(first_name, last_name, department)`)
          .eq('user_id', authUser.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (profile) {
          const employeeData = Array.isArray(profile.Employees) ? profile.Employees[0] : profile.Employees;
          const userToSet: User = {
            id: authUser.id,
            username: profile.username || authUser.email || '',
            role: profile.role as UserRole,
            name: `${employeeData?.first_name || ''} ${employeeData?.last_name || ''}`.trim() || authUser.email || 'N/A',
            department: employeeData?.department || undefined,
          };
          setUser(userToSet);
        } else {
          await supabase.auth.signOut();
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchAndSetUserProfile(session);
    });
    return () => { authListener.subscription.unsubscribe(); };
  }, [fetchAndSetUserProfile]);

  const login = useCallback(async (email: string, password_DUMMY: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: password_DUMMY });
    return { success: !error, error: error ? "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" : null };
  }, []);

  const logout = useCallback(async () => { await supabase.auth.signOut(); }, []);
  const updateUserContext = useCallback((updatedUserData: User) => { if (user && user.id === updatedUserData.id) setUser(updatedUserData); }, [user]);

  return <AuthContext.Provider value={{ user, login, logout, isLoading, updateUserContext }}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
