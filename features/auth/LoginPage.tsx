
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { APP_NAME } from '../../constants';
import { supabase } from '../../lib/supabaseClient';

const LoginIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
);


export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

// ในไฟล์ src/features/auth/LoginPage.tsx

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // LOG 1: ยืนยันว่าฟังก์ชันทำงาน
    console.log('[LoginPage] 1. handleSubmit triggered. Attempting to log in with email:', email);

    // เรียกใช้ฟังก์ชัน login จาก Context เหมือนเดิม
    const { success, error: authError } = await login(email, password);

    // LOG 2: นี่คือส่วนที่สำคัญที่สุด! เราจะดูว่า login() คืนค่าอะไรกลับมา
    console.log('[LoginPage] 2. login() function returned:', { success, error: authError });

    setIsLoading(false);

    if (success) {
      // LOG 3: ถ้า success เป็น true เราจะเห็นข้อความนี้
      console.log('[LoginPage] 3. Success is TRUE! Navigating to:', from);
      navigate(from, { replace: true });
    } else {
      // LOG 4: ถ้า success เป็น false เราจะเห็นข้อความนี้
      console.error('[LoginPage] 4. Success is FALSE. Setting error message.');
      setError(authError || 'An unknown error occurred.');
    }
  };
