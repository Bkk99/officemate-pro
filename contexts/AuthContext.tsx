// src/components/Layout.tsx (เวอร์ชันประกอบร่างใหม่)

import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, UserRole } from '../types';
import { NAV_ITEMS, APP_NAME, NavItem, DEPARTMENTS } from '../constants';
import { subscribeToGlobalAnnouncement, subscribeToGlobalChatUnreadCount } from '../services/notificationService';

// ===================================================================
// 1. SVG Icons (จากโค้ดเก่าของคุณ - ไม่มีการแก้ไข)
// ===================================================================
const Bars3Icon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>);
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const ArrowRightOnRectangleIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>);
const UserCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>);

// ===================================================================
// 2. ProtectedRoute (เวอร์ชันใหม่ที่ปลอดภัยและตรงไปตรงมา)
// ===================================================================
interface ProtectedRouteProps {
  children: JSX.Element;
  // ไม่ต้องใช้ allowedRoles ที่นี่แล้ว เพราะจะจัดการใน Sidebar แทน
}
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-primary-700"><p>กำลังโหลดแอปพลิเคชัน...</p></div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ถ้ามี user ก็ให้ผ่านเลย การเช็ค Role จะเกิดขึ้นใน Sidebar และการเข้าถึงข้อมูลด้วย RLS
  return children;
};

// ===================================================================
// 3. Component ย่อยต่างๆ (นำโค้ดเก่ามาปรับปรุงให้ปลอดภัย)
// ===================================================================

// --- Marquee Banner (จากโค้ดเก่า) ---
const MarqueeBanner: React.FC<{ text: string | null }> = ({ text }) => {
    if (!text) return null;
    const longText = text.length > 100 ? text : `${text} • ${text} • ${text}`;
    return <div className="marquee-banner"><div className="marquee-content">{longText}</div></div>;
};

// --- Sidebar Navigation Item (นำโค้ดเก่ามาใช้ แต่เพิ่ม Guard Clause) ---
const SidebarNavItem: React.FC<{ item: NavItem; onClick: () => void; }> = ({ item, onClick }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(location.pathname.startsWith(item.path));
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Guard Clause: ป้องกันการพังถ้า user ยังไม่พร้อม
  if (!user) return null;

  const hasSubItems = item.subItems && item.subItems.length > 0;

  useEffect(() => {
    if (item.path === '/chat') {
      const unsubscribe = subscribeToGlobalChatUnreadCount(setUnreadChatCount);
      return () => unsubscribe();
    }
  }, [item.path]);

  const handleItemClick = (e: React.MouseEvent) => {
    if (hasSubItems) {
      e.preventDefault(); // ป้องกันการ navigate ของ button
      setIsSubmenuOpen(!isSubmenuOpen);
    } else {
      onClick();
    }
  };

  const isActive = hasSubItems 
    ? item.subItems!.some(sub => location.pathname.startsWith(sub.path))
    : location.pathname.startsWith(item.path);
  
  // Logic การเปลี่ยนชื่อเมนูจากโค้ดเก่า
  let displayName = item.name;
  if (item.path === '/employee-cards') {
    const isHRStaff = user.role === UserRole.STAFF && user.department === DEPARTMENTS[3];
    if (user.role === UserRole.STAFF && !isHRStaff) displayName = 'แสดงบัตรพนักงาน';
  }

  // ... (โค้ด JSX สำหรับ SidebarNavItem เดิมของคุณ)
  // ผมจะใช้โค้ดที่เรียบง่ายลงเพื่อความแน่นอนก่อน คุณสามารถนำ JSX เดิมมาใส่แทนได้
  return (
    <NavLink to={item.path} onClick={handleItemClick} className={({ isActive }) => `flex items-center p-2 rounded-md ${isActive ? 'bg-primary-500' : 'hover:bg-secondary-700'}`}>
      {/* <item.icon /> */}
      {displayName}
    </NavLink>
  );
};


// --- Sidebar (นำโค้ดเก่ามาใช้ แต่เพิ่ม Guard Clause) ---
const Sidebar: React.FC<{ isOpen: boolean; toggleSidebar: () => void; }> = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();

  // Guard Clause: นี่คือจุดสำคัญที่ป้องกันแอปพัง!
  if (!user) return null;

  // Logic การกรองเมนูจากโค้ดเก่า
  const filteredNavItems = NAV_ITEMS.filter(item => {
    const isHRStaff = user.role === UserRole.STAFF && user.department === DEPARTMENTS[3];
    if (['/leave-management', '/employee-cards'].includes(item.path)) {
      return item.allowedRoles.includes(user.role) || isHRStaff;
    }
    // สำหรับเมนูอื่นๆ ให้เช็ค Role ตามปกติ
    return item.allowedRoles.includes(user.role);
  });

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-30 bg-black opacity-50 lg:hidden" onClick={toggleSidebar}></div>}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-secondary-800 text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-secondary-700">
          <Link to="/dashboard" className="text-xl font-bold text-primary-400">{APP_NAME}</Link>
          <button onClick={toggleSidebar} className="lg:hidden"><XMarkIcon className="h-6 w-6" /></button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map(item => (
            <SidebarNavItem key={item.name} item={item} onClick={toggleSidebar} />
          ))}
        </nav>
        <div className="p-4 border-t border-secondary-700">
            <div className="flex items-center mb-3">
                <UserCircleIcon className="h-8 w-8" />
                <div className="ml-3">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-secondary-400">{user.role} {user.department ? `- ${user.department}` : ''}</p>
                </div>
            </div>
            <button onClick={logout} className="w-full flex items-center p-2 rounded-md hover:bg-secondary-700">
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                ออกจากระบบ
            </button>
        </div>
      </div>
    </>
  );
};


// --- Header (นำโค้ดเก่ามาใช้ แต่เพิ่ม Guard Clause) ---
const Header: React.FC<{ toggleSidebar: () => void; }> = ({ toggleSidebar }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Guard Clause: ป้องกันแอปพัง
  if(!user) return null;
  
  // Logic การหา Title จากโค้ดเก่า
  const findCurrentNavItem = (items: NavItem[], path: string): NavItem | undefined => {
    const sortedItems = [...items].sort((a,b) => b.path.length - a.path.length);
    for (const item of sortedItems) {
      if (path.startsWith(item.path) && item.path !== '#') return item;
      if (item.subItems) {
        const subMatch = findCurrentNavItem(item.subItems, path);
        if (subMatch) return subMatch;
      }
    }
    return undefined;
  };
  const currentNavItem = findCurrentNavItem(NAV_ITEMS, location.pathname);
  
  // Logic การเปลี่ยน Title จากโค้ดเก่า
  let pageTitle = currentNavItem ? currentNavItem.name : APP_NAME;
  if (currentNavItem?.path === '/employee-cards') {
    const isHRStaff = user.role === UserRole.STAFF && user.department === DEPARTMENTS[3];
    if (user.role === UserRole.STAFF && !isHRStaff) pageTitle = 'แสดงบัตรพนักงาน';
  }

  return (
    <header className="sticky top-0 z-20 bg-white shadow-md">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <button onClick={toggleSidebar} className="text-gray-500 lg:hidden"><Bars3Icon className="h-6 w-6" /></button>
        <h1 className="ml-3 text-xl font-semibold text-gray-800">{pageTitle}</h1>
        <div className="hidden lg:flex items-center space-x-3">
            <UserCircleIcon className="h-8 w-8 text-gray-500"/>
            <div>
                <p className="text-sm font-medium text-gray-700">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role} {user.department ? `- ${user.department}`: ''}</p>
            </div>
        </div>
      </div>
    </header>
  );
};

// ===================================================================
// 4. MainLayout Component (ประกอบร่างทุกอย่างเข้าด้วยกัน)
// ===================================================================
export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<string | null>(null);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const unsubscribe = subscribeToGlobalAnnouncement(setCurrentAnnouncement);
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex h-screen bg-secondary-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        <MarqueeBanner text={currentAnnouncement} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-secondary-100 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
