// src/contexts/AuthContext.tsx (เวอร์ชัน Minimal และปลอดภัย)
import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

export interface AppUser { id: string; email: string; role: string; }
interface AuthContextType {
  user: AppUser | null;
  login: (email: string, password_DUMMY: string) => Promise<{ success: boolean; error: string | null }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
    const updateUserState = async (session: Session | null) => {
      try {
        if (session?.user) {
          const { data: profile, error } = await supabase
            .from('users')
            .select('role')
            .eq('user_id', session.user.id)
            .single();

          // ถ้ามี Error จาก Supabase (เช่น RLS บล็อก) ให้โยน Error ออกไป
          if (error) throw error;

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            role: profile?.role || 'staff'
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        // ดักจับ Error แล้วแสดงใน Console
        console.error("AuthContext: Error fetching user data:", error);
        setUser(null); // เคลียร์ user ถ้าเกิดปัญหา
      } finally {
        // บล็อกนี้จะทำงาน "เสมอ"
        setIsLoading(false);
      }
    };

    // เรียกครั้งแรกเพื่อเช็ค session ที่อาจมีอยู่
    supabase.auth.getSession().then(({ data: { session } }) => {
        updateUserState(session);
    });
    
    // ดักฟังการเปลี่ยนแปลง
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        updateUserState(session);
    });

    return () => { authListener.subscription.unsubscribe(); };
}, []);
  
  const login = useCallback(async (email: string, password_DUMMY: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: password_DUMMY });
      if (error) throw error;
      return { success: true, error: null };
    } catch (error: any) {
      console.error("Login function error:", error.message);
      return { success: false, error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
    }
  }, []);

  const logout = useCallback(async () => { await supabase.auth.signOut(); }, []);

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
