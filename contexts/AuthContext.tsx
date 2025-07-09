// src/contexts/AuthContext.tsx (เวอร์ชัน Minimal)

import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

// สร้าง Type ของ User แบบง่ายๆ
export interface AppUser {
  id: string;
  email: string;
  role: string;
}

// Interface สำหรับ Context
interface AuthContextType {
  user: AppUser | null;
  login: (email: string, password_DUMMY: string) => Promise<{ success: boolean }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // ดึงข้อมูล Role จากตาราง 'users' ของเรา
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role: profile?.role || 'staff' // ถ้าไม่มี role ให้เป็น staff ไปก่อน
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => { authListener.subscription.unsubscribe(); };
  }, []);

  const login = useCallback(async (email: string, password_DUMMY: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: password_DUMMY });
    return { success: !error };
  }, []);

  const logout = useCallback(async () => { await supabase.auth.signOut(); }, []);

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
