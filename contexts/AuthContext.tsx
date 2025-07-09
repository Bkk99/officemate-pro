// src/contexts/AuthContext.tsx (เวอร์ชันสมบูรณ์ที่สุด - คัดลอกอันนี้ไปใช้)

import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, UserRole } from '../types';
import { Session } from '@supabase/supabase-js';

// Interface สำหรับ Context
interface AuthContextType {
  user: User | null;
  login: (email: string, password_DUMMY: string) => Promise<{ success: boolean; error: string | null }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  updateUserContext: (updatedUser: User) => void;
}

// สร้าง Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// สร้าง Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAndSetUserProfile = useCallback(async (session: Session | null) => {
    try {
      if (session?.user) {
        const authUser = session.user;
        
        // Query เพื่อดึงข้อมูล User และ Employee ที่เชื่อมกัน
        const { data: profile, error } = await supabase
          .from('users')
          .select(`
            username,
            role,
            Employees (
              first_name,
              last_name,
              department
            )
          `)
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
          // ถ้า User มีใน Auth แต่ไม่มีในตาราง users ของเรา ให้ Sign out เพื่อป้องกัน Error
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
    // onAuthStateChange จะทำงานทันทีเมื่อโหลด และทุกครั้งที่สถานะเปลี่ยน
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchAndSetUserProfile(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchAndSetUserProfile]);

  const login = useCallback(async (email: string, password_DUMMY: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: password_DUMMY });
    // เราไม่ต้องทำอะไรต่อ onAuthStateChange จะจัดการ state ให้เอง
    return { success: !error, error: error ? "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" : null };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    // onAuthStateChange จะจัดการ state ให้เอง
  }, []);
  
  const updateUserContext = useCallback((updatedUserData: User) => {
     if (user && user.id === updatedUserData.id) setUser(updatedUserData);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, updateUserContext }}>
      {children}
    </AuthContext.Provider>
  );
};

// ==========================================================
// ⭐️⭐️⭐️ บรรทัดสำคัญที่สุดที่แก้ Error ของคุณ ⭐️⭐️⭐️
// สร้างและ Export Custom Hook ชื่อ useAuth
// ==========================================================
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
