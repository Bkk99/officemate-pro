// src/components/Layout.tsx (เวอร์ชันสมบูรณ์)

import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { NAV_ITEMS, APP_NAME, DEPARTMENTS } from '../constants'; // ตรวจสอบว่า import มาครบ

// ไอคอนต่างๆ ที่คุณเคยมี (คัดลอกส่วน SVG เดิมของคุณมาวางตรงนี้)
const Bars3Icon = (props: React.SVGProps<SVGSVGElement>) => (/* ... SVG code ... */);
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (/* ... SVG code ... */);
const UserCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (/* ... SVG code ... */);
const ArrowRightOnRectangleIcon = (props: React.SVGProps<SVGSVGElement>) => (/* ... SVG code ... */);


// ProtectedRoute (เวอร์ชันสมบูรณ์)
interface ProtectedRouteProps {
  children: JSX.Element;
}
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};


// MainLayout (นำโค้ดเก่าของคุณกลับมา แต่ปรับให้ปลอดภัยขึ้น)
export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  // Guard Clause: ถ้ายังไม่มี user ให้แสดงหน้า Loading เพื่อป้องกัน Error
  if (!user) {
    return <div className="flex h-screen items-center justify-center">Initializing user...</div>;
  }

  // Logic การกรองเมนูจากโค้ดเก่าของคุณ
  const filteredNavItems = NAV_ITEMS.filter(item => {
    const hrStaffOverride = item.path === '/leave-management' || item.path === '/employee-cards';
    if (hrStaffOverride && user.role === UserRole.STAFF && user.department === DEPARTMENTS[3]) {
        return true;
    }
    return item.allowedRoles.includes(user.role);
  });

  return (
    <div className="flex h-screen bg-gray-200 font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0`}>
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <Link to="/dashboard" className="text-xl font-bold">{APP_NAME}</Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {filteredNavItems.map(item => (
              <NavLink key={item.name} to={item.path} className={({ isActive }) => `flex items-center px-4 py-2 text-sm rounded-md ${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
                {/* คุณอาจจะมี Icon ตรงนี้ */}
                {item.name}
              </NavLink>
            ))}
          </nav>
          {/* User Profile Section */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center">
              <UserCircleIcon className="h-9 w-9 text-white" />
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-gray-400">{user.role} {user.department ? `(${user.department})` : ''}</p>
              </div>
            </div>
          </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="flex justify-between items-center bg-white p-4 shadow-md lg:justify-end">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-500 lg:hidden">
            <Bars3Icon className="h-6 w-6" />
          </button>
          <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center">
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
            Logout
          </button>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
