// src/features/auth/LoginPage.tsx (The Final Version)
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const { success, error: authError } = await login(email, password);
    
    setIsLoading(false);

    if (success) {
      // ไม่ต้อง navigate ที่นี่แล้ว เพราะ onAuthStateChange ใน AuthContext
      // จะอัปเดต user state ซึ่งจะทำให้ App.tsx redirect เราไปเอง
      console.log("Login successful, waiting for redirect...");
    } else {
      setError(authError?.message || 'Invalid login credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-100">
        <div className="p-8 bg-white rounded shadow-md w-96">
            <h2 className="text-2xl font-bold text-center mb-6">เข้าสู่ระบบ</h2>
            <form onSubmit={handleSubmit}>
                <Input label="อีเมล" id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                <Input label="รหัสผ่าน" id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                    {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                </Button>
            </form>
        </div>
    </div>
  );
};
