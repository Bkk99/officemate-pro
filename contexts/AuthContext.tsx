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
const fetchAndSetUserProfile = useCallback(async (session: Session | null) => {
    // ใช้ try...catch...finally เพื่อดักจับ Error ทั้งหมด
    try {
        if (session?.user) {
            const authUser = session.user;
            
            const { data: profile, error } = await supabase
                .from('users') 
                .select('username, role') 
                .eq('user_id', authUser.id)
                .single();

            // ถ้ามี error จาก supabase (เช่น RLS บล็อค) ให้โยน error ออกไป
            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (profile) {
                // ถ้าเจอโปรไฟล์ ให้ตั้งค่า user
                setUser({
                    id: authUser.id,
                    username: profile.username || authUser.email || '',
                    role: profile.role as UserRole || UserRole.STAFF, 
                });
            } else {
                // ถ้าไม่เจอโปรไฟล์ (ซึ่งไม่ควรเกิดถ้า trigger ทำงาน) ให้โยน error
                throw new Error(`Profile not found for user: ${authUser.id}`);
            }
        } else {
            // ถ้าไม่มี session ให้เคลียร์ค่า user
            setUser(null);
        }
    } catch (error) {
        // ถ้าเกิด Error ใดๆ ใน try block ให้มาทำงานที่นี่
        console.error("Error fetching user profile:", error);
        setUser(null); // เคลียร์ค่า user เพื่อความปลอดภัย
    } finally {
        // บล็อคนี้จะทำงาน "เสมอ" ไม่ว่า try จะสำเร็จหรือเกิด error
        // ซึ่งเป็นที่ที่เหมาะที่สุดในการตั้งค่า loading ให้เสร็จสิ้น
        setIsLoading(false);
    }
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
