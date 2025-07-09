// src

### 🔥 วิธีแก้ไข (ทำตามนี้ได้เลยครับ)

เราจะทำการเพิ่มบรรทัดที่ขาดหายไปกลับ/contexts/AuthContext.tsx (เวอร์ชันสมบูรณ์)

import React, { createContext, useState, useContextเข้าไปในไฟล์ **`AuthContext.tsx`**

1.  **เปิดไฟล์ `src/contexts/AuthContext, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, UserRole } from '../types';
import { Session } from '@supabase/supabase-js';.tsx`**

2.  **เลื่อน (Scroll) ไปที่บรรทัดสุดท้ายของไฟล์**

3

// Interface สำหรับ Context
interface AuthContextType {
  user: User | null;
  login: (email:.  **ตรวจสอบว่าคุณมีโค้ดส่วนนี้อยู่หรือไม่:**

    ```typescript
    export const useAuth = (): AuthContextType => {
      const context = useContext(AuthContext);
      if (context === undefined) string, password_DUMMY: string) => Promise<{ success: boolean; error: string | null }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  updateUserContext: (updatedUser {
        throw new Error('useAuth must be used within an AuthProvider');
      }
      return context: User) => void;
}

// สร้าง Context
const AuthContext = createContext<AuthContextType | undefined>(;
    };
    ```

**ผมค่อนข้างมั่นใจว่าโค้ดส่วนนี้ของคุณอาจจะขาดหายไป หรืออาจจะลืมใส่คำว่า `export` ไว้ข้างหน้า `const useAuth`**

---undefined);

// สร้าง Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({

### 🔥 โค้ด `AuthContext.tsx` ที่สมบูรณ์ที่สุด (คัดลอกไปวางท children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAndSetUserProfile = useCallback(async (session: Session | null) => {
    try {
      if (session?.user) {
        const authUserับได้เลย)

เพื่อความแน่นอน 100% ผมจะให้โค้ด `AuthContext.tsx` = session.user;
        const { data: profile, error } = await supabase
          .from('users')
          .select(`
            username,
            role,
            Employees ( first_name, last_name, department ทั้งหมดอีกครั้ง โดยเป็นเวอร์ชันล่าสุดที่รวมทุกการแก้ไขแล้ว และรับประกันว่ามีการ `export useAuth` อย่างถูกต้องแน่นอน

**ลบโค้ดทั้งหมดใน `src/contexts/AuthContext.tsx` ของคุณทิ้ง แล้ว )
          `)
          .eq('user_id', authUser.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (profile)วางโค้ดใหม่นี้เข้าไปแทน:**

```typescript
// src/contexts/AuthContext.tsx (เวอร์ชันล่าสุดและสมบูรณ์)

import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from ' {
          const employeeData = Array.isArray(profile.Employees) ? profile.Employees[0] : profile.Employees;
          const userToSet: User = {
            id: authUser.id,
            username:react';
import { supabase } from '../lib/supabaseClient';
import { User, UserRole } from '../types';
import { Session } from '@supabase/supabase-js';

// Interface สำหรับ Context
interface AuthContextType profile.username || authUser.email || '',
            role: profile.role as UserRole,
            name: `${employeeData?.first_name || ''} ${employeeData?.last_name || ''}`.trim() || authUser.email || 'N/A',
            department: employeeData?.department || undefined,
          };
           {
  user: User | null;
  login: (email: string, password_DUMMY: string) => Promise<{ success: boolean; error: string | null }>;
  logout: () => Promise<voidsetUser(userToSet);
        } else {
           await supabase.auth.signOut(); // ป้องกัน user ที่ไม่มี profile ค้างในระบบ
        }
      } else {
        setUser(null);
      }
    >;
  isLoading: boolean;
  updateUserContext: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser]} catch (error) {
      console.error("Error fetching user profile:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAndSetUserProfile = useCallback(async (session: Session | null) => {
    try {
      if (session?.user) {
        const authUser = session.user;
        const { data: profile {
      fetchAndSetUserProfile(session);
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchAndSetUserProfile]);

  const login = useCallback(async (email: string, password_DUMMY: string) => {
    const { error } = await supabase.auth., error } = await supabase
          .from('users')
          .select(`username, role, Employees(first_name, last_name, department)`)
          .eq('user_id', authUser.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        signInWithPassword({ email, password: password_DUMMY });
    return { success: !error, error: error ? "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" : null };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);
  
  constif (profile) {
          const employeeData = Array.isArray(profile.Employees) ? profile.Employees[0] : profile.Employees;
          const userToSet: User = {
            id: authUser.id,
            username: profile.username || authUser.email || '',
            role: profile.role as UserRole updateUserContext = useCallback((updatedUserData: User) => {
     if (user && user.id === updatedUserData.id) setUser(updatedUserData);
  }, [user]);

  return (
    <AuthContext.,
            name: `${employeeData?.first_name || ''} ${employeeData?.last_name || ''}`.trim() || authUser.email || 'N/A',
            department: employeeData?.department || undefined,
          };
          setUser(userToSet);
        } else {
          await supabase.auth.signOut();Provider value={{ user, login, logout, isLoading, updateUserContext }}>
      {children}
    </AuthContext.Provider>
  );
};

// ⭐️⭐️⭐️ บรรทัดสำคัญที่แก้ปัญหา ⭐️⭐️⭐️

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
    const { data: auth// สร้างและ Export Custom Hook ชื่อ useAuth
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
