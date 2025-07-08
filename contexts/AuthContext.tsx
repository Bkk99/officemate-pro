import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '../types';
import { getUserProfile } from '../services/api';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  login: (username: string, password_DUMMY: string) => Promise<{ success: boolean; error: string | null }>;
  logout: () => void;
  isLoading: boolean;
  updateUserContext: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAndSetUserProfile = async (session: Session | null) => {
    if (session?.user) {
        try {
            const profile = await getUserProfile(session.user.id);
            if (profile) {
                 setUser({
                    id: profile.id,
                    username: profile.username,
                    role: profile.role,
                    name: profile.full_name, // Make sure your profiles table has `full_name`
                    department: profile.department
                });
            } else {
                 // Handle case where user exists in auth but not in profiles table
                 console.warn(`No profile found for user ID: ${session.user.id}`);
                 setUser(null);
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            setUser(null);
        }
    } else {
        setUser(null);
    }
     setIsLoading(false);
  };

  useEffect(() => {
    setIsLoading(true);
    const getSessionAndProfile = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        await fetchAndSetUserProfile(session);
    };

    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setIsLoading(true);
        await fetchAndSetUserProfile(session);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password_DUMMY: string) => {
    if (!supabase) return { success: false, error: 'Supabase client not initialized.' };
    setIsLoading(true);
    
    // In a real scenario, you'd use a real password.
    // Here we'll allow login with a dummy password if one is not provided, 
    // useful for testing with Supabase's magic links or social auth if you add it.
    const passwordToUse = password_DUMMY || '123456'; // Default password for safety

    const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: passwordToUse,
    });
    
    setIsLoading(false);

    if (error) {
        console.error("Supabase login error:", error.message);
        return { success: false, error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
    }
    return { success: true, error: null };
  }, []);

  const logout = useCallback(async () => {
    if (!supabase) return;
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setIsLoading(false);
  }, []);
  
  const updateUserContext = useCallback(async (updatedUserData: User) => {
     if (user && user.id === updatedUserData.id) {
        // Just update local state for immediate feedback
        setUser(updatedUserData);
        // A more robust solution might refetch the profile from DB
        // await fetchAndSetUserProfile(await supabase.auth.getSession().data.session);
    }
  }, [user]);

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