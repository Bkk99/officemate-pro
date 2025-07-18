

import React from 'react';
import { UserRole, Employee, PurchaseOrder, Document, DocumentType, PayrollRunStatus, TaxBracket, PayrollComponent, LeaveType, LeaveRequestStatus, CashAdvanceRequestStatus, EmployeeStatusKey, POStatusKey, DocumentStatusKey } from './types';

// Heroicon SVGs (outline style)
const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
  </svg>
);

export const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const ArchiveBoxIcon = (props: React.SVGProps<SVGSVGElement>) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10.5 11.25h3M12 15V7.5M3 7.5h18M3 7.5a2.25 2.25 0 00-2.25 2.25v1.125c0 .621.504 1.125 1.125 1.125h16.5c.621 0 1.125-.504 1.125-1.125V9.75A2.25 2.25 0 0019.5 7.5M2.25 9.75h19.5" />
  </svg>
);

const DocumentTextIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

export const ShoppingCartIcon = (props: React.SVGProps<SVGSVGElement>) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
  </svg>
);

const ChatBubbleLeftRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3.543-3.091A9.117 9.117 0 0112 15.502V13.12m0 0c0-.993.242-1.927.685-2.748-.443-.279-.94-.441-1.484-.536A9.006 9.006 0 006 9.752V13.12m0 0V15.5m0-2.38v-2.38m0 2.38v2.38M10.125 11.25V9.75m0 1.5V9.75m0 1.5v1.5m4.5-1.5V9.75m0 1.5V9.75m0 1.5v1.5M12 6.75m-1.03.001a1.03 1.03 0 112.06 0 1.03 1.03 0 01-2.06 0zM12 6.75V4.876c0-.609-.491-1.1-1.099-1.1-.608 0-1.1.491-1.1 1.1V6.75m2.198 0h-.001M14.199 6.75h.001M16.3 6.75h.001M18.4 6.75h.001M12 6.75V9.75M9.801 9.75h.001M7.601 9.75h.001M5.4 9.75h.001M3.75 13.12v-3.368c0-.97.616-1.816 1.5-2.097" />
  </svg>
);

const CalendarDaysIcon = (props: React.SVGProps<SVGSVGElement>) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-3.75h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
  </svg>
);

const ChartBarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 013 21v-7.875zM12.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM21 3C21 2.448 20.552 2 20 2h-.375c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h.375c.552 0 1-.448 1-1V3z" />
  </svg>
);

const CogIcon = (props: React.SVGProps<SVGSVGElement>) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5.75l-2.25-2.25M5.25 12.75l-2.25 2.25M18.75 12.75l2.25 2.25M18.75 11.25l2.25-2.25M5.25 11.25l2.25-2.25M12 4.5v.75m0 13.5v.75m-6.75-7.5h.75m12 0h.75M12 12a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
  </svg>
);

const BanknotesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v15c0 .621-.504 1.125-1.125 1.125h-15A1.125 1.125 0 012.25 20.25v-15c0-.621.504-1.125 1.125-1.125H3.75m15-3V4.5A2.25 2.25 0 0016.5 2.25h-12A2.25 2.25 0 002.25 4.5v1.5M12 12.75a.75.75 0 000-1.5H5.25a.75.75 0 000 1.5H12z" />
  </svg>
);

const WalletIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 12m18 0v6.25a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18.25V12m18 0V5.75A2.25 2.25 0 0018.75 3.5H5.25A2.25 2.25 0 003 5.75v.5M21 12a2.25 2.25 0 00-2.25-2.25H5.25a2.25 2.25 0 00-2.25 2.25m18 0v6.25a2.25 2.25 0 01-2.25 2.25H5.25a2.25 2.25 0 01-2.25-2.25V12M9 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
);

const CogSettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.11v1.093c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.27.96-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.78.93l-.15.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.149-.894c-.07-.424-.384-.764-.78-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-.96.27-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.272.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.11v-1.094c0 .55.398-1.019.94-1.11l.894-.149c.424-.07.764-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773c.39-.39.902-.44 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.93l.149-.894z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const FingerprintIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.601 10.44M12 10.5c.203.553.379 1.13.527 1.728m-1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565m-1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.601 10.44m0 0A14.917 14.917 0 0012 21.75c2.662 0 5.133-.722 7.257-1.962M14.25 10.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
  </svg>
);

export const CalendarUserIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Icon for Leave Management
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75V15m0 6V12.75m0 0H9.75m2.25 0H14.25M3.75 3v1.5M20.25 3v1.5M3.75 10.5h16.5M3.75 14.25h16.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 3v18M18 3v18" />
  </svg>
);

const CreditCardIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Icon for Employee ID Card
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3M3.75 5.25c0-.621.504-1.125 1.125-1.125h14.25c.621 0 1.125.504 1.125 1.125v13.5c0 .621-.504-1.125-1.125-1.125H4.875c-.621 0-1.125-.504-1.125-1.125V5.25z" />
  </svg>
);

export const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.5 21.75l-.398-1.178a3.375 3.375 0 00-2.455-2.456L12.75 18l1.178-.398a3.375 3.375 0 002.455-2.456L16.5 14.25l.398 1.178a3.375 3.375 0 002.456 2.456L20.25 18l-1.178.398a3.375 3.375 0 00-2.456 2.456z" />
  </svg>
);

const ComputerDesktopIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
    </svg>
);
const CubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
);


export interface NavItem {
  name: string;
  path: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  allowedRoles: UserRole[];
  subItems?: NavItem[]; 
}

export const NAV_ITEMS: NavItem[] = [
  { name: 'แดชบอร์ด', path: '/dashboard', icon: HomeIcon, allowedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.Programmer] },
  { name: 'จัดการพนักงาน', path: '/employees', icon: UsersIcon, allowedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.Programmer] },
  { name: 'สร้างบัตรพนักงาน', path: '/employee-cards', icon: CreditCardIcon, allowedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.Programmer] },
  { name: 'จัดการการลา', path: '/leave-management', icon: CalendarUserIcon, allowedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.Programmer] },
  { 
    name: 'จัดการสต็อก', 
    path: '#', 
    icon: ArchiveBoxIcon, 
    allowedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.Programmer],
    subItems: [
        { name: 'สต็อกทั่วไป', path: '/inventory', icon: CubeIcon, allowedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.Programmer] },
        { name: 'สต็อก IT', path: '/inventory/it', icon: ComputerDesktopIcon, allowedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.Programmer] },
    ]
  },
  { name: 'ใบสั่งซื้อ (PO)', path: '/purchase-orders', icon: ShoppingCartIcon, allowedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.Programmer] },
  { name: 'จัดการเอกสาร', path: '/documents', icon: DocumentTextIcon, allowedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.Programmer] },
  { name: 'ระบบบัญชีเงินเดือน', path: '/payroll', icon: BanknotesIcon, allowedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.Programmer] },
  { name: 'เบิกเงินล่วงหน้า', path: '/cash-advance', icon: WalletIcon, allowedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.Programmer] },
  { name: 'แชทภายในองค์กร', path: '/chat', icon: ChatBubbleLeftRightIcon, allowedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.Programmer] },
  { name: 'ปฏิทินองค์กร', path: '/calendar', icon: CalendarDaysIcon, allowedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.Programmer] },
  { name: 'รายงาน', path: '/reports', icon: ChartBarIcon, allowedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.Programmer] },
  { 
    name: 'ตั้งค่าระบบ', 
    path: '#', // Placeholder as it's a parent
    icon: CogIcon, 
    allowedRoles: [UserRole.ADMIN, UserRole.Programmer],
    subItems: [
        { name: 'จัดการผู้ใช้งาน', path: '/admin/users', icon: UsersIcon, allowedRoles: [UserRole.ADMIN, UserRole.Programmer] },
        { name: 'ตั้งค่าเงินเดือน', path: '/payroll/settings', icon: CogSettingsIcon, allowedRoles: [UserRole.ADMIN, UserRole.Programmer] },
        { name: 'ตั้งค่าเครื่องสแกนนิ้ว', path: '/admin/fingerprint-scanner', icon: FingerprintIcon, allowedRoles: [UserRole.ADMIN, UserRole.Programmer] },
    ]
  },
];

export const APP_NAME = "ออฟฟิศเมท คู่ใจบริการ";
export const COMPANY_ADDRESS_MOCK = "123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110";
export const COMPANY_LOGO_URL_MOCK = "/logo-placeholder.png"; // You can create a placeholder image

export const DEPARTMENTS = ["ฝ่ายขาย", "ฝ่ายการตลาด", "ฝ่ายปฏิบัติการ", "ฝ่ายบุคคล", "ฝ่ายการเงิน", "ฝ่ายไอที", "ฝ่ายบริการลูกค้า", "บริหาร"];
export const POSITIONS = ["ผู้จัดการ", "ผู้เชี่ยวชาญ", "ผู้ประสานงาน", "พนักงาน", "นักศึกษาฝึกงาน", "ผู้อำนวยการ", "รองประธาน", "เจ้าหน้าที่"];

export const EMPLOYEE_STATUSES_TH: Record<EmployeeStatusKey, string> = {
    'Active': 'ใช้งาน',
    'Inactive': 'ไม่ใช้งาน',
    'On Leave': 'ลาพัก'
};
export const EMPLOYEE_STATUSES_OPTIONS = (Object.keys(EMPLOYEE_STATUSES_TH) as EmployeeStatusKey[]).map(key => ({ value: key, label: EMPLOYEE_STATUSES_TH[key] }));
export const EMPLOYEE_STATUSES: Employee['status'][] = ['Active', 'Inactive', 'On Leave'];

export const PO_STATUSES_TH: Record<POStatusKey, string> = {
    'Pending': 'รอดำเนินการ',
    'Approved': 'อนุมัติแล้ว',
    'Processing': 'กำลังดำเนินการ',
    'Shipped': 'จัดส่งแล้ว',
    'Completed': 'เสร็จสมบูรณ์',
    'Cancelled': 'ยกเลิกแล้ว'
};
export const PO_STATUSES_OPTIONS = (Object.keys(PO_STATUSES_TH) as POStatusKey[]).map(key => ({ value: key, label: PO_STATUSES_TH[key] }));
export const PO_STATUSES: PurchaseOrder['status'][] = ['Pending', 'Approved', 'Processing', 'Shipped', 'Completed', 'Cancelled'];

export const DOCUMENT_TYPES_TH: Record<DocumentType, string> = {
    [DocumentType.QUOTATION]: 'ใบเสนอราคา',
    [DocumentType.INVOICE]: 'ใบแจ้งหนี้',
    [DocumentType.DELIVERY_NOTE]: 'ใบส่งของ'
};
export const DOCUMENT_TYPES_ARRAY: DocumentType[] = [DocumentType.QUOTATION, DocumentType.INVOICE, DocumentType.DELIVERY_NOTE];
export const DOCUMENT_TYPES_OPTIONS = DOCUMENT_TYPES_ARRAY.map(type => ({ value: type, label: DOCUMENT_TYPES_TH[type] }));


export const DOCUMENT_STATUSES_TH: Record<DocumentStatusKey, string> = {
    'Draft': 'ฉบับร่าง',
    'Sent': 'ส่งแล้ว',
    'Paid': 'ชำระแล้ว',
    'Overdue': 'เกินกำหนด',
    'Cancelled': 'ยกเลิก'
};
export const DOCUMENT_STATUSES_OPTIONS = (Object.keys(DOCUMENT_STATUSES_TH) as DocumentStatusKey[]).map(key => ({ value: key, label: DOCUMENT_STATUSES_TH[key] }));
export const DOCUMENT_STATUSES: Document['status'][] = ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'];


export const STOCK_TRANSACTION_REASONS = ["สต็อกเริ่มต้น", "รับสินค้าจากการซื้อ", "คำสั่งซื้อจากลูกค้า", "ใช้ภายในองค์กร", "สินค้าเสียหาย/หมดอายุ", "ปรับปรุงสต็อก", "รับคืนสินค้า", "เบิกใช้ภายใน", "เบิกสำหรับโครงการ"];
export const STOCK_TRANSACTION_TYPES_TH = {'IN': 'รับเข้า', 'OUT': 'จ่ายออก'};

export const AI_ASSISTANT_ROOM_ID = 'ai-assistant';
export const CHAT_ROOMS_SAMPLE = [
  { id: AI_ASSISTANT_ROOM_ID, name: 'AI Assistant', icon: SparklesIcon },
  { id: 'general', name: 'ห้องสนทนาทั่วไป' },
  { id: 'project-phoenix', name: 'อัปเดตโปรเจกต์ฟีนิกซ์' },
  { id: 'sales-team', name: 'ช่องทางทีมขาย' },
  { id: 'hr-announcements', name: 'ประกาศจากฝ่ายบุคคล' },
];


// --- Payroll Constants ---
export const PAYROLL_RUN_STATUSES_TH: Record<PayrollRunStatus, string> = {
  [PayrollRunStatus.DRAFT]: 'ฉบับร่าง',
  [PayrollRunStatus.APPROVED]: 'อนุมัติแล้ว',
  [PayrollRunStatus.PAID]: 'จ่ายแล้ว',
  [PayrollRunStatus.CANCELLED]: 'ยกเลิกแล้ว',
};
export const PAYROLL_RUN_STATUS_OPTIONS = (Object.values(PayrollRunStatus)).map(status => ({ value: status, label: PAYROLL_RUN_STATUSES_TH[status] }));

export const PAYROLL_RUN_STATUS_COLORS: Record<PayrollRunStatus, string> = {
    [PayrollRunStatus.DRAFT]: 'bg-gray-100 text-gray-800',
    [PayrollRunStatus.APPROVED]: 'bg-blue-100 text-blue-800',
    [PayrollRunStatus.PAID]: 'bg-green-100 text-green-800',
    [PayrollRunStatus.CANCELLED]: 'bg-red-100 text-red-800',
};


export const MONTH_OPTIONS = [
    { value: 1, label: 'มกราคม' }, { value: 2, label: 'กุมภาพันธ์' }, { value: 3, label: 'มีนาคม' },
    { value: 4, label: 'เมษายน' }, { value: 5, label: 'พฤษภาคม' }, { value: 6, label: 'มิถุนายน' },
    { value: 7, label: 'กรกฎาคม' }, { value: 8, label: 'สิงหาคม' }, { value: 9, label: 'กันยายน' },
    { value: 10, label: 'ตุลาคม' }, { value: 11, label: 'พฤศจิกายน' }, { value: 12, label: 'ธันวาคม' }
];

export const CURRENT_YEAR = new Date().getFullYear();
export const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => ({ value: CURRENT_YEAR - i, label: (CURRENT_YEAR - i + 543).toString() })); // Show in B.E.

export const MOCK_TAX_BRACKETS_SIMPLIFIED: TaxBracket[] = [
  { minIncome: 0, maxIncome: 150000, rate: 0, cumulativeTaxAtPreviousBracket: 0 },
  { minIncome: 150001, maxIncome: 300000, rate: 0.05, cumulativeTaxAtPreviousBracket: 0 }, 
  { minIncome: 300001, maxIncome: 500000, rate: 0.10, cumulativeTaxAtPreviousBracket: 7500 }, 
  { minIncome: 500001, maxIncome: 750000, rate: 0.15, cumulativeTaxAtPreviousBracket: 27500 }, 
  { minIncome: 750001, maxIncome: 1000000, rate: 0.20, cumulativeTaxAtPreviousBracket: 65000 }, 
  { minIncome: 1000001, maxIncome: 2000000, rate: 0.25, cumulativeTaxAtPreviousBracket: 115000 },
  { minIncome: 2000001, maxIncome: 5000000, rate: 0.30, cumulativeTaxAtPreviousBracket: 365000 },
  { minIncome: 5000001, rate: 0.35, cumulativeTaxAtPreviousBracket: 1265000 }, 
];

export const SOCIAL_SECURITY_RATE = 0.05; 
export const SOCIAL_SECURITY_CAP_MONTHLY_SALARY = 15000; 
export const SOCIAL_SECURITY_MIN_MONTHLY_SALARY = 1650; 
export const STANDARD_DEDUCTION_ANNUAL = 100000; 
export const PERSONAL_ALLOWANCE_ANNUAL = 60000; 


export const DEFAULT_PAYROLL_COMPONENTS: PayrollComponent[] = [
    { id: 'comp_travel', name: 'ค่าเดินทาง', type: 'Allowance', isTaxable: true, defaultAmount: 1000 },
    { id: 'comp_food', name: 'ค่าอาหาร', type: 'Allowance', isTaxable: true, defaultAmount: 1500 },
    { id: 'comp_skill', name: 'ค่าทักษะพิเศษ', type: 'Allowance', isTaxable: true, defaultAmount: 2000 },
    { id: 'comp_loan', name: 'หักคืนเงินกู้', type: 'Deduction', defaultAmount: 500 },

    // New benefit components
    { id: 'comp_annual_bonus', name: 'โบนัสประจำปี', type: 'Allowance', isTaxable: true, defaultAmount: 0 },
    { id: 'comp_kpi_bonus', name: 'โบนัส KPI', type: 'Allowance', isTaxable: true, defaultAmount: 0 },
    { id: 'comp_special_bonus', name: 'โบนัสพิเศษ', type: 'Allowance', isTaxable: true, defaultAmount: 0 },
    { id: 'comp_holiday_work', name: 'ค่าทำงานวันหยุด', type: 'Allowance', isTaxable: true, defaultAmount: 0 },
    { id: 'comp_ot', name: 'ค่าล่วงเวลา (OT)', type: 'Allowance', isTaxable: true, defaultAmount: 0 }, // Primarily for categorization
    { id: 'comp_medical_expense', name: 'ค่ารักษาพยาบาล', type: 'Allowance', isTaxable: false, defaultAmount: 0 },
    { id: 'comp_advance_deduct', name: 'หักเบิกเงินล่วงหน้า', type: 'Deduction', defaultAmount: 0 }, // New for "หักเบิก"

    // System calculated components (managed by system, not user-deletable/directly editable from generic component list)
    { id: 'comp_ssf_calculated', name: 'ประกันสังคม (คำนวณ)', type: 'Deduction', isSystemCalculated: true, defaultRate: SOCIAL_SECURITY_RATE, calculationBasis: 'Salary', cap: SOCIAL_SECURITY_CAP_MONTHLY_SALARY * SOCIAL_SECURITY_RATE },
    { id: 'comp_pf_calculated', name: 'กองทุนสำรองเลี้ยงชีพ (คำนวณ)', type: 'Deduction', isSystemCalculated: true, calculationBasis: 'Salary' }, // Rate from employee
    { id: 'comp_tax_calculated', name: 'ภาษีเงินได้บุคคลธรรมดา (คำนวณ)', type: 'Deduction', isSystemCalculated: true },
];

// --- Leave Management Constants ---
export const LEAVE_TYPES_TH: Record<LeaveType, string> = {
  [LeaveType.ANNUAL]: 'ลาพักร้อน',
  [LeaveType.SICK]: 'ลาป่วย',
  [LeaveType.PERSONAL]: 'ลากิจส่วนตัว',
  [LeaveType.MATERNITY]: 'ลาคลอด',
  [LeaveType.ORDINATION]: 'ลาอุปสมบท',
  [LeaveType.OTHER]: 'ลาอื่นๆ',
};
export const LEAVE_TYPE_OPTIONS = (Object.values(LeaveType)).map(type => ({ value: type, label: LEAVE_TYPES_TH[type] }));

export const LEAVE_REQUEST_STATUS_TH: Record<LeaveRequestStatus, string> = {
  [LeaveRequestStatus.PENDING]: 'รอดำเนินการ',
  [LeaveRequestStatus.APPROVED]: 'อนุมัติแล้ว',
  [LeaveRequestStatus.REJECTED]: 'ปฏิเสธ',
  [LeaveRequestStatus.CANCELLED]: 'ยกเลิก',
};
export const LEAVE_REQUEST_STATUS_OPTIONS = (Object.values(LeaveRequestStatus)).map(status => ({ value: status, label: LEAVE_REQUEST_STATUS_TH[status] }));

export const LEAVE_REQUEST_STATUS_COLORS: Record<LeaveRequestStatus, string> = {
  [LeaveRequestStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [LeaveRequestStatus.APPROVED]: 'bg-green-100 text-green-800',
  [LeaveRequestStatus.REJECTED]: 'bg-red-100 text-red-800',
  [LeaveRequestStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
};

// --- Cash Advance Constants ---
export const CASH_ADVANCE_REASONS = ["ค่าเดินทาง/ที่พัก", "ค่ารักษาพยาบาลฉุกเฉิน", "ค่าใช้จ่ายส่วนตัวเร่งด่วน", "ค่ารับรองลูกค้า", "อื่นๆ (โปรดระบุ)"];

export const CASH_ADVANCE_STATUS_TH: Record<CashAdvanceRequestStatus, string> = {
  [CashAdvanceRequestStatus.PENDING]: 'รอดำเนินการ',
  [CashAdvanceRequestStatus.APPROVED]: 'อนุมัติแล้ว',
  [CashAdvanceRequestStatus.REJECTED]: 'ปฏิเสธ',
  [CashAdvanceRequestStatus.PAID]: 'จ่ายแล้ว',
};
export const CASH_ADVANCE_STATUS_OPTIONS = (Object.values(CashAdvanceRequestStatus)).map(status => ({ value: status, label: CASH_ADVANCE_STATUS_TH[status] }));

export const CASH_ADVANCE_STATUS_COLORS: Record<CashAdvanceRequestStatus, string> = {
  [CashAdvanceRequestStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [CashAdvanceRequestStatus.APPROVED]: 'bg-blue-100 text-blue-800',
  [CashAdvanceRequestStatus.REJECTED]: 'bg-red-100 text-red-800',
  [CashAdvanceRequestStatus.PAID]: 'bg-green-100 text-green-800',
};