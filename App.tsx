

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth/LoginPage';
import { MainLayout, ProtectedRoute } from './components/Layout';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { EmployeePage } from './features/employee/EmployeePage';
import { InventoryPage } from './features/inventory/InventoryPage';
import ItInventoryPage from './features/inventory/ItInventoryPage'; // New Import
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
import { EmployeeIdCardPage } from './features/idcard/EmployeeIdCardPage'; // New Import
import { CashAdvancePage } from './features/cash-advance/CashAdvancePage'; // New Import
import { UserRole } from './types';
import { useAuth } from './contexts/AuthContext';
import { DEPARTMENTS } from './constants';


const App: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route 
        path="/" 
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.Programmer]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="employees" element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.Programmer]}>
            <EmployeePage />
          </ProtectedRoute>
        } />
        <Route path="employee-cards" element={ // New Route for Employee ID Cards
          <ProtectedRoute 
            allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.Programmer]}
            hrStaffOverride={true} // HR Staff can access
          >
            <EmployeeIdCardPage />
          </ProtectedRoute>
        } />
        <Route path="leave-management" element={ 
          <ProtectedRoute 
            allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.Programmer]}
            hrStaffOverride={true} 
          >
            <LeaveManagementPage />
          </ProtectedRoute>
        } />
        <Route path="inventory" element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.Programmer]}>
            <InventoryPage />
          </ProtectedRoute>
        } />
        <Route path="inventory/it" element={ // New Route
          <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.Programmer]}>
            <ItInventoryPage />
          </ProtectedRoute>
        } />
        <Route path="purchase-orders" element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.Programmer]}>
            <PurchaseOrderPage />
          </ProtectedRoute>
        } />
        <Route path="documents" element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.Programmer]}>
            <DocumentPage />
          </ProtectedRoute>
        } />
        <Route path="payroll" >
            <Route index element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.Programmer]}>
                    <PayrollPage />
                </ProtectedRoute>
            } />
            <Route path=":runId" element={
                 <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.Programmer]}>
                    <PayrollRunDetailsPage />
                </ProtectedRoute>
            }/>
            <Route path="settings" element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.Programmer]}>
                    <PayrollSettingsPage />
                </ProtectedRoute>
            }/>
        </Route>
        <Route path="cash-advance" element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.Programmer]}>
            <CashAdvancePage />
          </ProtectedRoute>
        } />
        <Route path="chat" element={
         <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.Programmer]}>
            <ChatPage />
          </ProtectedRoute>
        } />
        <Route path="calendar" element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.Programmer]}>
            <CalendarPage />
          </ProtectedRoute>
        } />
        <Route path="reports" element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.Programmer]}>
            <ReportPage />
          </ProtectedRoute>
        } />
        <Route path="admin/users" element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.Programmer]}>
            <UserManagementPage />
          </ProtectedRoute>
        } />
        <Route path="admin/fingerprint-scanner" element={ 
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.Programmer]}>
                <FingerprintScannerSettingsPage />
            </ProtectedRoute>
        } />
         <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default App;