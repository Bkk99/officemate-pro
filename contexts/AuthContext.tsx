import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, UserRole } from '../types';
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

  const fetchAndSetUserProfile = useCallback(async (session: Session | null) => {
    if (session?.user) {
        const authUser = session.user;
        
        // **Query the profiles table for the latest user data.**
        // This ensures that any changes made directly in the database (like changing a role)
        // are immediately reflected in the app upon login or refresh.
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('full_name, role, department')
            .eq('id', authUser.id)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is an error state for a logged in user
            console.error("Error fetching user profile:", error.message);
            // If we can't fetch the profile, log out the user to prevent inconsistent state
            await supabase.auth.signOut(); 
            setUser(null);
        } else if (profile) {
            setUser({
                id: authUser.id,
                username: authUser.email || '',
                // Use data from the 'profiles' table, with fallbacks.
                role: profile.role as UserRole || UserRole.STAFF, 
                name: profile.full_name || authUser.email || 'User',
                department: profile.department || undefined,
            });
        } else {
             // This case means a user is authenticated but has no profile. 
             // This shouldn't happen with the database trigger in place.
             // We can log them out to be safe.
             console.error(`User ${authUser.id} is authenticated but has no profile. Logging out.`);
             await supabase.auth.signOut();
             setUser(null);
        }

    } else {
        setUser(null);
    }
    setIsLoading(false);
  }, []);

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
  }, [fetchAndSetUserProfile]);

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
