// src/components/Layout.tsx (วางโค้ดนี้ทับทั้งหมด)

import React, { useState } from 'react';
import { NavLink, Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// --- SVG Icons (เหมือนเดิม) ---
const Bars3Icon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>);
const UserCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const ArrowRightOnRectangleIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>);

// --- ProtectedRoute (เวอร์ชันเรียบง่าย) ---
export const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

// --- MainLayout (เวอร์ชันปลอดภัย) ---
export const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();

  // Guard Clause ป้องกันการ Crash
  if (!user) return <div>Loading user data...</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2>OfficeMate</h2>
        <nav>
            <NavLink to="/dashboard">Dashboard</NavLink>
        </nav>
        <div className="mt-auto">
          <p>{user.name || user.username}</p>
          <button onClick={logout}>Logout</button>
        </div>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};
