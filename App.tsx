// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate, useLocation, NavLink, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './features/auth/LoginPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
// import { EmployeePage } from './features/employee/EmployeePage'; // <--- ค่อยๆ นำกลับมาทีหลัง

// --- Component ที่ 1: ตัวจัดการการแสดงผลหลัก ---
const AppRouter: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>กำลังโหลด...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
      <Route path="/*" element={user ? <MainLayout /> : <Navigate to="/login" state={{ from: location }} />} />
    </Routes>
  );
};

// --- Component ที่ 2: Layout หลักของแอป ---
const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const logout = () => supabase.auth.signOut();

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside style={{ width: '250px', background: '#2c3e50', color: 'white', padding: '1rem' }}>
        <h2>OfficeMate</h2>
        <nav style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column' }}>
          <NavLink to="/dashboard" style={{ color: 'white', padding: '0.5rem' }}>Dashboard</NavLink>
          {(user?.role === 'admin' || user?.role === 'manager') && (
            // <NavLink to="/employees" style={{ color: 'white', padding: '0.5rem' }}>Employees</NavLink>
            <p style={{ color: 'gray', padding: '0.5rem' }}>Employees (Coming Soon)</p>
          )}
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <p>{user?.email}</p>
          <p>Role: {user?.role}</p>
          <button onClick={logout} style={{ background: 'red', color: 'white', border: 'none', padding: '0.5rem', cursor: 'pointer', width: '100%' }}>
            Logout
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};

// --- Component ที่ 3: ศูนย์กลางของ Layout ย่อยๆ ---
const MainLayoutRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<DashboardPage />} />
      {/* <Route path="employees" element={<EmployeePage />} /> */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

// --- Component หลักของ App ---
const App: React.FC = () => {
  return (
    <AuthProvider>
        <AppRouter />
    </AuthProvider>
  );
};

export default App;
