// src/components/Layout.tsx (กลับมาใช้เวอร์ชัน Minimal ที่เคยทำงานได้)

import React from 'react';
import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <div>กำลังโหลด...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  if (!user) return <div>กำลังเตรียมข้อมูลผู้ใช้...</div>;

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside style={{ width: '250px', background: '#2c3e50', color: 'white', padding: '1rem' }}>
        <h2>OfficeMate</h2>
        <nav style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column' }}>
          <NavLink to="/dashboard" style={{ color: 'white', padding: '0.5rem' }}>Dashboard</NavLink>
          {(user.role === 'admin' || user.role === 'manager') && (
            <NavLink to="/employees" style={{ color: 'white', padding: '0.5rem' }}>Employees</NavLink>
          )}
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <p>{user.email}</p>
          <p>Role: {user.role}</p>
          <button onClick={logout} style={{ background: 'red', color: 'white', border: 'none', padding: '0.5rem', cursor: 'pointer', width: '100%' }}>
            Logout
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <h1>Main Content Area</h1>
        <hr style={{ margin: '1rem 0' }}/>
        <Outlet />
      </main>
    </div>
  );
};
