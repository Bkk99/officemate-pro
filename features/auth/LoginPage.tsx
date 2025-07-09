// src/features/auth/LoginPage.tsx (เวอร์ชันที่สอดคล้อง)
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@officemate.com'); // ใส่ค่าเริ่มต้นเพื่อง่ายต่อการทดสอบ
  const [password, setPassword] = useState('123456'); // ใส่ค่าเริ่มต้นเพื่อง่ายต่อการทดสอบ
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
      navigate(from, { replace: true });
    } else {
      setError(authError || 'An unknown error occurred.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#fce4ec' }}>
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h2>เข้าสู่ระบบ</h2>
        <div style={{ marginTop: '1rem' }}>
          <label htmlFor="email">อีเมล</label>
          <input
            id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <div style={{ marginTop: '1rem' }}>
          <label htmlFor="password">รหัสผ่าน</label>
          <input
            id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
        <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '0.75rem', marginTop: '1.5rem', background: '#ec4899', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </form>
    </div>
  );
};
