
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

const SidebarNavItem: React.FC<{ item: NavItem; isOpenMobile: boolean; toggleMobileSidebar: () => void; }> = ({ item, isOpenMobile, toggleMobileSidebar }) => {
  const location = useLocation();
  const { user } = useAuth(); // Get user from auth context
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(location.pathname.startsWith(item.path) && item.path !== '#');
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const hasSubItems = item.subItems && item.subItems.length > 0;

  useEffect(() => {
    if (item.path === '/chat') { // Only subscribe for the chat item
      const unsubscribe = subscribeToGlobalChatUnreadCount(setUnreadChatCount);
      return () => unsubscribe();
    }
  }, [item.path]);

  const handleItemClick = () => {
    if (hasSubItems) {
      setIsSubmenuOpen(!isSubmenuOpen);
    } else {
      if (isOpenMobile) toggleMobileSidebar();
    }
  };
  
  const isActive = hasSubItems 
    ? item.subItems!.some(sub => location.pathname.startsWith(sub.path))
    : location.pathname.startsWith(item.path);

  // Determine the display name for "Employee ID Cards" link
  let displayName = item.name;
  if (user && item.path === '/employee-cards') {
    const isHRStaff = user.role === UserRole.STAFF && user.department === DEPARTMENTS[3]; // DEPARTMENTS[3] is 'ฝ่ายบุคคล'
    if (user.role === UserRole.STAFF && !isHRStaff) {
      displayName = 'แสดงบัตรพนักงาน';
    }
    // For Admin, Manager, and HR Staff, it keeps item.name which is "สร้างบัตรพนักงาน"
  }


  if (hasSubItems) {
    return (
      <div className="relative">
        <button
          onClick={handleItemClick}
          className={`group flex items-center justify-between w-full px-2 py-2.5 text-sm font-medium rounded-md transition-colors duration-150 ${
            isActive
              ? 'bg-primary-500 text-white'
              : 'text-secondary-100 hover:bg-secondary-700 hover:text-white'
          }`}
        >
          <div className="flex items-center">
            <item.icon className="mr-3 flex-shrink-0 h-5 w-5" aria-hidden="true" />
            {/* Use displayName for sub-menu parent too if needed, though typically not the case for this specific item */}
            {displayName}
          </div>
          <ChevronDownIcon className={`h-4 w-4 transform transition-transform duration-150 ${isSubmenuOpen ? 'rotate-180' : ''}`} />
        </button>
        {isSubmenuOpen && (
          <div className="pl-5 mt-1 space-y-1">
            {item.subItems!.map(subItem => (
              <NavLink
                key={subItem.name}
                to={subItem.path}
                onClick={() => { if (isOpenMobile) toggleMobileSidebar(); }}
                className={({ isActive: isSubActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                    isSubActive
                      ? 'bg-primary-400 text-white' 
                      : 'text-secondary-200 hover:bg-secondary-600 hover:text-white'
                  }`
                }
              >
                <subItem.icon className="mr-3 flex-shrink-0 h-5 w-5" aria-hidden="true" />
                {subItem.name}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      onClick={handleItemClick}
      className={({ isActive: isNavItemActive }) =>
        `group relative flex items-center px-2 py-2.5 text-sm font-medium rounded-md transition-colors duration-150 ${ // Added "relative"
          isNavItemActive
            ? 'bg-primary-500 text-white'
            : 'text-secondary-100 hover:bg-secondary-700 hover:text-white'
        }`
      }
    >
      <item.icon className="mr-3 flex-shrink-0 h-5 w-5" aria-hidden="true" />
      {displayName}
      {item.path === '/chat' && unreadChatCount > 0 && (
        <span 
          className="absolute top-1.5 right-1.5 flex items-center justify-center h-5 w-5 bg-red-600 text-white text-[10px] font-bold rounded-full ring-2 ring-secondary-800"
          title={`${unreadChatCount} ห้องที่ยังไม่ได้อ่าน`}
        >
          {unreadChatCount > 9 ? '9+' : unreadChatCount}
        </span>
      )}
    </NavLink>
  );
};


const Sidebar: React.FC<{ isOpen: boolean; toggleSidebar: () => void; }> = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-30 bg-black opacity-50 lg:hidden" onClick={toggleSidebar}></div>}
      
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-secondary-800 text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-secondary-700 lg:justify-center">
          <Link to="/dashboard" className="text-xl font-bold text-primary-400">{APP_NAME}</Link>
          <button onClick={toggleSidebar} className="text-secondary-300 hover:text-white lg:hidden">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS
            .filter(item => {
              const isHRStaff = user.role === UserRole.STAFF && user.department === DEPARTMENTS[3]; // DEPARTMENTS[3] is 'ฝ่ายบุคคล'
              if (item.path === '/leave-management' || item.path === '/employee-cards') { 
                return item.allowedRoles.includes(user.role) || isHRStaff; 
              }
              return item.allowedRoles.includes(user.role);
            })
            .map((item) => (
              <SidebarNavItem 
                key={item.name} 
                item={item} 
                isOpenMobile={isOpen} 
                toggleMobileSidebar={toggleSidebar} 
              />
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
            <button
                onClick={logout}
                className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-secondary-300 hover:bg-secondary-700 hover:text-white"
            >
                <ArrowRightOnRectangleIcon className="mr-3 flex-shrink-0 h-5 w-5" aria-hidden="true" />
                ออกจากระบบ
            </button>
        </div>
      </div>
    </>
  );
};

const Header: React.FC<{ toggleSidebar: () => void; }> = ({ toggleSidebar }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  const findCurrentNavItem = (items: NavItem[], path: string): NavItem | undefined => {
    const sortedItems = [...items].sort((a,b) => b.path.length - a.path.length);
    for (const item of sortedItems) {
        if (path.startsWith(item.path) && item.path !== '#') {
            return item;
        }
        if (item.subItems) {
            const subMatch = findCurrentNavItem(item.subItems, path);
            if (subMatch) return subMatch;
        }
    }
    return undefined;
  };
  
  const currentNavItem = findCurrentNavItem(NAV_ITEMS, location.pathname);
  
  // Dynamic page title based on user role for employee cards
  let pageTitle = currentNavItem ? currentNavItem.name : APP_NAME;
  if (user && currentNavItem?.path === '/employee-cards') {
    const isHRStaff = user.role === UserRole.STAFF && user.department === DEPARTMENTS[3];
    if (user.role === UserRole.STAFF && !isHRStaff) {
      pageTitle = 'แสดงบัตรพนักงาน';
    }
    // For Admin, Manager, HR Staff - it keeps "สร้างบัตรพนักงาน"
  }


  return (
    <header className="sticky top-0 z-20 bg-white shadow-md">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <h1 className="ml-3 text-xl font-semibold text-gray-800">{pageTitle}</h1>
          </div>
          {user && (
             <div className="hidden lg:flex items-center space-x-3">
                <UserCircleIcon className="h-8 w-8 text-gray-500"/>
                <div>
                    <p className="text-sm font-medium text-gray-700">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.role} {user.department ? `- ${user.department}`: ''}</p>
                </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const MarqueeBanner: React.FC<{ text: string | null }> = ({ text }) => {
    if (!text) return null;
    const longText = text.length > 100 ? text : `${text} • ${text} • ${text}`;
  
    return (
      <div className="marquee-banner">
        <div className="marquee-content">{longText}</div>
      </div>
    );
};

// ... (ส่วนอื่นๆ ของไฟล์) ...

export const MainLayout: React.FC = () => {
    return (
        // ...
        <div className="flex-1 flex flex-col">
            <header>Header Test</header>
            <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
                <h2>--- Main Area Start ---</h2>
                <Outlet />
                <h2>--- Main Area End ---</h2>
            </main>
        </div>
        // ...
    );
};
interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles: UserRole[];
  hrStaffOverride?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles, hrStaffOverride }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-primary-700"><p>กำลังโหลดแอปพลิเคชัน...</p></div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  let canAccess = allowedRoles.includes(user.role);

  if (hrStaffOverride && user.role === UserRole.STAFF && user.department === DEPARTMENTS[3]) { 
    canAccess = true;
  }


  if (!canAccess) {
    const currentTopLevelNav = NAV_ITEMS.find(item => location.pathname.startsWith(item.path));
    if (currentTopLevelNav && currentTopLevelNav.subItems) {
        const canAccessSubItem = currentTopLevelNav.subItems.some(sub => sub.allowedRoles.includes(user.role));
        if (canAccessSubItem) { 
             return children;
        }
    }
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return children;
};
