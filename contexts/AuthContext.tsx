// src/contexts/AuthContext.tsx (เวอร์ชันหุ้มเกราะ)

import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

export interface AppUser { id: string; email: string; role: string; }
interface AuthContextType { user: AppUser | null; isLoading: boolean; }

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('[Auth] useEffect triggered. Setting up auth listener.');

    const checkUser = async () => {
      try {
        console.log('[Auth] Checking current session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw new Error(`Session Error: ${sessionError.message}`);
        console.log('[Auth] Session data:', session);

        if (session?.user) {
          console.log(`[Auth] User is logged in. Fetching profile for user ID: ${session.user.id}`);
          const { data: profile, error: profileError } = await supabase
            .from('users') // <-- เช็คชื่อตารางให้ดี
            .select('role') // <-- เช็คชื่อคอลัมน์ให้ดี
            .eq('user_id', session.user.id) // <-- เช็คชื่อคอลัมน์ให้ดี
            .single();

          if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows found
             throw new Error(`Profile Error: ${profileError.message}`);
          }
          
          console.log('[Auth] Profile data from DB:', profile);

          const userToSet = {
            id: session.user.id,
            email: session.user.email || '',
            role: profile?.role || 'staff',
          };
          console.log('[Auth] Setting user state:', userToSet);
          setUser(userToSet);

        } else {
          console.log('[Auth] No active session. Setting user to null.');
          setUser(null);
        }
      } catch (e) {
        console.error('[Auth] CRITICAL ERROR during user check:', e);
        setUser(null);
      } finally {
        console.log('[Auth] FINALLY BLOCK: Setting isLoading to false.');
        setIsLoading(false);
      }
    };
    
    checkUser(); // เรียกครั้งแรกเมื่อแอปโหลด
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        console.log('[Auth] Auth state changed!', _event);
        // เมื่อสถานะเปลี่ยน ก็ให้ checkUser ใหม่ทั้งหมด
        setIsLoading(true); // กลับไป loading ก่อน
        checkUser(); 
    });

    return () => {
      console.log('[Auth] Cleaning up auth listener.');
      subscription.unsubscribe();
    };
  }, []);

  // ส่วน login, logout ไม่ได้ใช้แล้วในเวอร์ชัน minimal นี้ แต่ใส่ไว้เผื่อ
  const login = async () => {};
  const logout = async () => {};

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
        {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;
