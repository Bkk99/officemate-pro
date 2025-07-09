// src/App.tsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth/LoginPage';
import { MainLayout, ProtectedRoute } from './components/Layout';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { EmployeePage } from './features/employee/EmployeePage';
import { InventoryPage } from './features/inventory/InventoryPage';
import ItInventoryPage from './features/inventory/ItInventoryPage';
import { PurchaseOrderPage } from './features/po/PurchaseOrderPage';
import { DocumentPage } from './features/documents/DocumentPage';
import { ChatPage } from './features/chat/ChatPage';
import { CalendarPage } from './features/calendar/CalendarPage';
import { ReportPage } from './features/reports/ReportPage';
import { UserManagementPage } from './features/admin/UserManagementPage';
import { PayrollPage } from './features/payroll/PayrollPage';
import { PayrollRunDetailsPage } from './features/payroll/PayrollRunDetailsPage';
import { PayrollSettingsPage } from './features/payroll/PayrollSettingsPage';
import { FingerprintScannerSettingsPage } from './features/admin/FingerprintScannerSettingsPage';
import { LeaveManagementPage } from './features/leave/LeaveManagementPage'; 
import { EmployeeIdCardPage } from './features/idcard/EmployeeIdCardPage';
import { CashAdvancePage } from './features/cash-advance/CashAdvancePage';
import { UserRole } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // <--- แก้ไข import

// สร้าง Component สำหรับแสดงหน้า Loading ง่ายๆ
const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f3f4f6' }}>
    <p style={{ fontSize: '1.5rem', color: '#4b5563' }}>กำลังโหลดข้อมูล...</p>
  </div>
);

// สร้าง Component ใหม่เพื่อจัดการ Routes ซึ่งจะอยู่ภายใต้ AuthProvider
const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();

  // ถ้า Context กำลังโหลดข้อมูล user (เช็ค session) ให้แสดงหน้า Loading ก่อน
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* ถ้ายังไม่ login ให้ไปหน้า Login, ถ้า login แล้วพยายามเข้า /login ให้เด้งไป Dashboard */}
      <Route 
        path="/login" 
        element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />} 
      />
      
      {/* ถ้ายังไม่ login แล้วพยายามเข้าหน้าหลัก ให้เด้งไปหน้า Login */}
      <Route 
        path="/" 
        element={
          user ? (
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]}>
              <MainLayout />
            </ProtectedRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        
        {/* --- ใส่ Routes ทั้งหมดของคุณไว้ที่นี่ (โค้ดเดิมของคุณ) --- */}
        <Route path="employees" element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
            <EmployeePage />
          </ProtectedRoute>
        } />
        <Route path="employee-cards" element={
          <ProtectedRoute 
            allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]}
            hrStaffOverride={true}
          >
            <EmployeeIdCardPage />
          </ProtectedRoute>
        } />
        {/* ... ใส่ Routes อื่นๆ ของคุณต่อไปจนครบ ... */}

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

// Component หลักของ App จะทำหน้าที่แค่ห่อ Provider
const App: React.FC = () => {
  return (
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
  );
};

export default App;
