// src/contexts/AuthContext.tsx

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, UserRole } from '../types';
import { Session } from '@supabase/supabase-js';

// Interface ไม่ต้องแก้
interface AuthContextType {
  user: User | null;
  login: (email: string, password_DUMMY: string) => Promise<{ success: boolean; error: string | null }>;
  logout: () => void;
  isLoading: boolean;
  updateUserContext: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAndSetUserProfile = useCallback(async (session: Session | null) => {
    // --- START: แก้ไขส่วนนี้ ---
    if (session?.user) {
        const authUser = session.user;
        
        // แก้ชื่อตารางจาก 'profiles' เป็น 'users'
        // แก้ชื่อคอลัมน์จาก 'id' เป็น 'user_id'
        // แก้ select field ให้ตรงกับตาราง users
        const { data: profile, error } = await supabase
            .from('users') 
            .select('username, role') 
            .eq('user_id', authUser.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error("Error fetching user profile:", error.message);
            await supabase.auth.signOut(); 
            setUser(null);
        } else if (profile) {
            // ดึงข้อมูลจากตาราง users มาใส่ใน state
            setUser({
                id: authUser.id,
                username: profile.username || authUser.email || '',
                role: profile.role as UserRole || UserRole.STAFF, 
                // เนื่องจากตาราง users ไม่มี name และ department จึง comment ออกไปก่อน
                // name: profile.full_name || authUser.email || 'User',
                // department: profile.department || undefined,
            });
        } else {
             console.error(`User ${authUser.id} is authenticated but has no profile. Logging out.`);
             await supabase.auth.signOut();
             setUser(null);
        }

    } else {
        setUser(null);
    }
    setIsLoading(false);
    // --- END: แก้ไขส่วนนี้ ---
  }, []);

  // ส่วน useEffect ไม่ต้องแก้
  useEffect(() => {
    setIsLoading(true);
    const getSessionAndProfile = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        await fetchAndSetUserProfile(session);
    };

    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        // ไม่ต้อง setIsLoading(true) ตรงนี้ เพราะจะทำให้จอกระพริบ
        await fetchAndSetUserProfile(session);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [fetchAndSetUserProfile]);

  // --- START: แก้ไขส่วน login ---
  // แก้ไขฟังก์ชัน login ให้รอการอัปเดต state
  const login = useCallback(async (email: string, password_DUMMY: string) => {
    if (!supabase) return { success: false, error: 'Supabase client not initialized.' };
    
    const passwordToUse = password_DUMMY || '123456';

    const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: passwordToUse,
    });
    
    // ไม่ต้อง setIsLoading ที่นี่ onAuthStateChange จะจัดการเอง
    
    if (error) {
        console.error("Supabase login error:", error.message);
        return { success: false, error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
    }
    // เราไม่ต้องทำอะไรต่อ onAuthStateChange จะทำงานและอัปเดต state ให้เอง
    // การคืนค่า success ที่นี่เป็นเพียงการบอก LoginPage ว่าไม่มี error
    return { success: true, error: null };
  }, []);
  // --- END: แก้ไขส่วน login ---


  const logout = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    // ไม่ต้อง setUser และ setIsLoading ที่นี่ onAuthStateChange จัดการให้แล้ว
  }, []);
  
  // ส่วน updateUserContext ไม่ต้องแก้
  const updateUserContext = useCallback(async (updatedUserData: User) => {
     if (user && user.id === updatedUserData.id) {
        setUser(updatedUserData);
    }
  }, [user]);

  // --- START: แก้ไข return ---
  // เอา !isLoading ออก เพื่อให้ App.tsx เป็นคนจัดการ
  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, updateUserContext }}>
      {children}
    </AuthContext.Provider>
  );
  // --- END: แก้ไข return ---
};

// ส่วน useAuth ไม่ต้องแก้
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
