

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/Layout';
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

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="employees" element={<EmployeePage />} />
        <Route path="employee-cards" element={<EmployeeIdCardPage />} />
        <Route path="leave-management" element={<LeaveManagementPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="inventory/it" element={<ItInventoryPage />} />
        <Route path="purchase-orders" element={<PurchaseOrderPage />} />
        <Route path="documents" element={<DocumentPage />} />
        <Route path="payroll" >
            <Route index element={<PayrollPage />} />
            <Route path=":runId" element={<PayrollRunDetailsPage />}/>
            <Route path="settings" element={<PayrollSettingsPage />}/>
        </Route>
        <Route path="cash-advance" element={<CashAdvancePage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="reports" element={<ReportPage />} />
        <Route path="admin/users" element={<UserManagementPage />} />
        <Route path="admin/fingerprint-scanner" element={<FingerprintScannerSettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
