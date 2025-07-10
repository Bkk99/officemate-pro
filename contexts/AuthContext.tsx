import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, UserRole, Database } from '../types';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  logout: () => void;
  isLoading: boolean;
  updateUserContext: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // This function now returns a boolean indicating if a profile was successfully loaded.
  const fetchAndSetUserProfile = useCallback(async (session: Session | null): Promise<boolean> => {
    if (session?.user) {
        const authUser = session.user;
        
        const { data: profile, error } = await supabase!
            .from('profiles')
            .select('full_name, role, department')
            .eq('id', authUser.id)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which we handle
            console.error("Error fetching user profile:", error.message);
            if (supabase) await supabase.auth.signOut(); 
            setUser(null);
            setIsLoading(false);
            return false;
        } else if (profile) { // Profile found, normal flow
            setUser({
                id: authUser.id,
                username: authUser.email || '',
                role: profile.role as UserRole || UserRole.STAFF, 
                name: profile.full_name || authUser.email || 'User',
                department: profile.department || undefined,
            });
            setIsLoading(false);
            return true;
        } else { // Profile NOT found, attempt to create it (self-healing mechanism)
             console.warn(`Profile for user ${authUser.id} not found. Attempting to create one.`);
             
             const newProfileData: Database['public']['Tables']['profiles']['Insert'] = {
                id: authUser.id,
                full_name: authUser.user_metadata?.full_name || authUser.email,
                username: authUser.email,
                role: (authUser.user_metadata?.role as UserRole) || UserRole.STAFF,
                department: authUser.user_metadata?.department || null
            };

            const { data: createdProfile, error: createError } = await supabase
                .from('profiles')
                .insert(newProfileData)
                .select()
                .single();
            
            if (createError) {
                console.error(`Failed to create profile for user ${authUser.id}:`, createError.message);
                if (supabase) await supabase.auth.signOut();
                setUser(null);
                setIsLoading(false);
                return false;
            }
            
            // If profile creation is successful, set the user and return true
            console.log(`Successfully created profile for user ${authUser.id}.`);
            setUser({
                id: authUser.id,
                username: authUser.email || '',
                role: createdProfile.role as UserRole || UserRole.STAFF,
                name: createdProfile.full_name || authUser.email || 'User',
                department: createdProfile.department || undefined,
            });
            setIsLoading(false);
            return true;
        }
    } else {
        setUser(null);
        setIsLoading(false);
        return false;
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const getSessionAndProfile = async () => {
        if (!supabase) {
          setIsLoading(false);
          return;
        }
        const { data: { session } } = await supabase.auth.getSession();
        await fetchAndSetUserProfile(session);
    };

    getSessionAndProfile();

    if (!supabase) return;
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
        await fetchAndSetUserProfile(session);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [fetchAndSetUserProfile]);

  const login = useCallback(async (username: string, password: string) => {
    if (!supabase) return { success: false, error: 'Supabase client not initialized.' };
    setIsLoading(true);
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: username,
        password: password,
    });

    // Handle admin auto-signup
    if (signInError && signInError.message === 'Invalid login credentials' && username === 'admin@officemate.com') {
        console.log('Admin login failed, attempting to create admin user...');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: username,
            password: password,
            options: {
                data: {
                    full_name: 'แอดมิน Officemate',
                    role: UserRole.ADMIN,
                    department: 'บริหาร',
                    username: username
                }
            }
        });
        
        if (signUpError) {
            setIsLoading(false);
            console.error("Supabase admin signup error:", signUpError.message);
            if (signUpError.message.includes('User already registered')) {
                 return { success: false, error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
            }
            return { success: false, error: `เกิดข้อผิดพลาดในการสร้างบัญชีแอดมิน: ${signUpError.message}` };
        }
        
        if (signUpData.session) {
            const profileSuccess = await fetchAndSetUserProfile(signUpData.session);
            if (profileSuccess) {
                return { success: true, error: null };
            } else {
                return { success: false, error: "สร้างบัญชีแอดมินสำเร็จ แต่ไม่สามารถโหลดโปรไฟล์ได้" };
            }
        } else {
             setIsLoading(false);
             return { success: false, error: "สร้างบัญชีสำเร็จแล้ว กรุณายืนยันอีเมลของคุณ" };
        }
    }
    
    if (signInError) {
        setIsLoading(false);
        console.error("Supabase login error:", signInError.message);
        return { success: false, error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
    }

    if (signInData.session) {
        const profileSuccess = await fetchAndSetUserProfile(signInData.session);
        if (profileSuccess) {
            return { success: true, error: null };
        } else {
            return { success: false, error: "เข้าสู่ระบบสำเร็จ แต่ไม่พบข้อมูลโปรไฟล์ผู้ใช้" };
        }
    }
    
    setIsLoading(false);
    return { success: false, error: "ไม่สามารถสร้างเซสชันได้" };
  }, [fetchAndSetUserProfile]);

  const logout = useCallback(async () => {
    if (!supabase) return;
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setIsLoading(false);
  }, []);
  
  const updateUserContext = useCallback(async (updatedUserData: User) => {
     if (user && user.id === updatedUserData.id) {
        setUser(updatedUserData);
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