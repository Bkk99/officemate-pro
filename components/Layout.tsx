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
export const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-200 font-sans">
      
      {/* --- Sidebar --- */}
      <aside className="w-64 flex-shrink-0 bg-gray-800 p-4 text-white">
        <h1 className="text-2xl font-bold mb-8">OfficeMate</h1>
        <nav className="flex flex-col space-y-2">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'bg-gray-700 p-2 rounded' : 'p-2 rounded hover:bg-gray-700'}>
            Dashboard
          </NavLink>
          <NavLink to="/employees" className={({ isActive }) => isActive ? 'bg-gray-700 p-2 rounded' : 'p-2 rounded hover:bg-gray-700'}>
            Employees
          </NavLink>
          {/* เพิ่ม Link อื่นๆ ที่นี่ */}
        </nav>
      </aside>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* --- Header --- */}
        <header className="flex justify-between items-center bg-white p-4 shadow-md">
          <div>
            <h2 className="text-xl font-semibold">Welcome, {user?.username || 'User'}!</h2>
          </div>
          <div>
            <button 
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </header>

        {/* --- Page Content (Rendered by Outlet) --- */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
};
