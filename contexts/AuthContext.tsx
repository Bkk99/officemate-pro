// src/contexts/AuthContext.tsx (เวอร์ชันแก้ไขสมบูรณ์)

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
          .select('username, role')
          .eq('user_id', authUser.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (profile) {
          setUser({
            id: authUser.id,
            username: profile.username || authUser.email || '',
            role: profile.role as UserRole || UserRole.STAFF,
          });
        } else {
          throw new Error(`Profile not found for user: ${authUser.id}`);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error in fetchAndSetUserProfile:", error);
      setUser(null);
    } finally {
      // บล็อคนี้จะทำงานเสมอ ทำให้มั่นใจว่า loading จะจบลง
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // ไม่ต้อง setIsLoading(true) ตรงนี้แล้ว เพราะ fetchAndSetUserProfile จะจัดการเอง
    fetchAndSetUserProfile(null); // เรียกครั้งแรกเพื่อเช็ค session ที่อาจมีอยู่

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchAndSetUserProfile(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchAndSetUserProfile]);

  const login = useCallback(async (email: string, password_DUMMY: string) => {
    const passwordToUse = password_DUMMY || '123456';
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: passwordToUse,
    });

    if (error) {
      return { success: false, error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
    }
    return { success: true, error: null };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);
  
  const updateUserContext = useCallback((updatedUserData: User) => {
     if (user && user.id === updatedUserData.id) {
        setUser(updatedUserData);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, updateUserContext }}>
      {children}
    </AuthContext.Provider>
  );
}; // <--- นี่คือปีกกา } ที่น่าจะหายไป

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
