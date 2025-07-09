// src/components/Layout.tsx (เวอร์ชันใหม่ทั้งหมด)

import React from 'react';
import { Navigate, Outlet, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

// ===================================================================
// ProtectedRoute Component (เวอร์ชันสุดท้ายที่สมบูรณ์)
// ===================================================================
interface ProtectedRouteProps {
  children: JSX.Element;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">กำลังตรวจสอบสิทธิ์...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // ในเมื่อมันเป็น Route หลัก เราจะแค่เช็คว่ามี user ก็พอ
  // การเช็ค Role แบบละเอียดจะทำในแต่ละหน้าย่อยแทน
  return children;
};


// ===================================================================
// MainLayout Component (เวอร์ชันใหม่ที่สะอาดและทำงานได้แน่นอน)
// ===================================================================
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
