// src/components/Layout.tsx (เวอร์ชันสุดท้าย)
import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { NAV_ITEMS, APP_NAME, DEPARTMENTS } from '../constants';
import { subscribeToGlobalAnnouncement } from '../services/notificationService';

// --- SVG Icons ---
const Bars3Icon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>);
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const ArrowRightOnRectangleIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>);
const UserCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);

// --- ProtectedRoute (เวอร์ชันเรียบง่ายและปลอดภัย) ---
export const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <div className="flex h-screen items-center justify-center">กำลังโหลดข้อมูล...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

// --- Sidebar ---
const Sidebar: React.FC<{ isOpen: boolean; toggleSidebar: () => void; }> = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  if (!user) return null; // Guard Clause ป้องกันการ Crash

  const filteredNavItems = NAV_ITEMS.filter(item => {
    const isHRStaff = user.role === UserRole.STAFF && user.department === DEPARTMENTS[3];
    if (['/leave-management', '/employee-cards'].includes(item.path)) {
      return item.allowedRoles.includes(user.role) || isHRStaff;
    }
    return item.allowedRoles.includes(user.role);
  });

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-30 bg-black opacity-50 lg:hidden" onClick={toggleSidebar}></div>}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-secondary-800 text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-secondary-700 lg:justify-center">
          <Link to="/dashboard" className="text-xl font-bold text-primary-400">{APP_NAME}</Link>
          <button onClick={toggleSidebar} className="text-secondary-300 hover:text-white lg:hidden"><XMarkIcon className="h-6 w-6" /></button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map(item => (
            <NavLink key={item.name} to={item.path} className={({ isActive }) => `group flex items-center px-2 py-2.5 text-sm font-medium rounded-md ${isActive ? 'bg-primary-500' : 'hover:bg-secondary-700'}`}>
              {item.name}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-secondary-700">
            <div className="flex items-center mb-3">
                <UserCircleIcon className="h-8 w-8 text-secondary-300 mr-2"/>
                <div>
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-secondary-400">{user.role} {user.department ? `- ${user.department}`: ''}</p>
                </div>
            </div>
            <button onClick={logout} className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-secondary-300 hover:bg-secondary-700 hover:text-white">
                <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                ออกจากระบบ
            </button>
        </div>
      </aside>
    </>
  );
};

// --- MainLayout ---
export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-secondary-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="sticky top-0 z-20 flex items-center justify-between h-16 bg-white shadow-md px-4">
            <button onClick={toggleSidebar} className="text-gray-500 lg:hidden"><Bars3Icon className="h-6 w-6" /></button>
            <div /> {/* Spacer */}
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
