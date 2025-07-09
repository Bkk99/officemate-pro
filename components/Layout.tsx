// src/components/Layout.tsx (กลับมาใช้เวอร์ชัน Minimal ที่เคยทำงานได้)

import React, { useState, useEffect } from 'react'; 
import { NavLink, Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { NAV_ITEMS, APP_NAME, NavItem, DEPARTMENTS } from '../constants'; 
import { getGlobalAnnouncement, subscribeToGlobalAnnouncement, subscribeToGlobalChatUnreadCount } from '../services/notificationService'; // Added subscribeToGlobalChatUnreadCount

// Heroicon SVGs
const Bars3Icon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ArrowRightOnRectangleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
  </svg>
);

const UserCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

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
