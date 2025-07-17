


export enum UserRole {
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  STAFF = 'Staff',
  Programmer = 'Programmer',
}

export type EmployeeStatusKey = 'Active' | 'Inactive' | 'On Leave';
export type POStatusKey = 'Pending' | 'Approved' | 'Processing' | 'Shipped' | 'Completed' | 'Cancelled';
export type DocumentStatusKey = 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  department?: string;
}

export interface EmployeeAllowance {
  id: string;
  name: string; // e.g., "ค่าเดินทาง", "ค่าอาหาร"
  amount: number;
  payrollComponentId?: string; // Link to PayrollComponent for properties like taxability
}

export interface EmployeeDeduction {
  id: string;
  name: string; // e.g., "หักค่าปรับ", "ชำระคืนเงินกู้"
  amount: number;
  payrollComponentId?: string; // Link to PayrollComponent
}

export interface Employee {
  id: string;
  name: string;
  nameEn?: string; // New: English Name for ID Card
  employeeCode?: string; // New: For payslip
  email: string;
  phone: string;
  department: string;
  position: string;
  status: EmployeeStatusKey;
  hireDate: string; // Existing: Can be used as Joining Date
  contractUrl?: string; // Link to contract PDF
  profileImageUrl?: string;
  fingerprintScannerId?: string; // New: For HIP Time integration
  passportNumber?: string; // New: For ID Card
  passportExpiryDate?: string; // New: For ID Card (ISO Date string)


  // Payroll specific fields
  baseSalary?: number;
  bankName?: string;
  bankAccountNumber?: string;
  taxId?: string;
  socialSecurityNumber?: string;
  providentFundRateEmployee?: number; // Percentage e.g., 3 for 3%
  providentFundRateEmployer?: number; // Percentage e.g., 3 for 3%
  recurringAllowances?: EmployeeAllowance[];
  recurringDeductions?: EmployeeDeduction[];
  // defaultOvertimeRate?: number; // Future enhancement: per-employee OT rate
}

export interface TimeLog {
  id: string;
  employeeId: string;
  employeeName: string;
  clockIn: string; // ISO Date string
  clockOut?: string; // ISO Date string
  notes?: string;
  source?: 'Manual' | 'Scanner'; // New: To differentiate log source
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unitPrice: number;
  supplier?: string;
  lastUpdated: string;
}

export interface StockTransaction {
  id: string;
  itemId: string;
  itemName: string;
  type: 'IN' | 'OUT';
  quantity: number;
  reason: string; // e.g., 'ซ่อม', 'เบิก', 'Initial Stock', 'Adjustment'
  date: string;
  employeeId?: string; // Who performed or requested
  employeeName?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  items: { itemId: string; itemName: string; quantity: number; unitPrice: number }[];
  totalAmount: number;
  status: POStatusKey;
  orderDate: string;
  expectedDeliveryDate?: string;
  notes?: string;
}

export enum DocumentType {
  QUOTATION = 'Quotation',
  INVOICE = 'Invoice',
  DELIVERY_NOTE = 'Delivery Note',
}

export interface Document {
  id: string;
  docNumber: string;
  type: DocumentType;
  clientName: string;
  projectName?: string;
  date: string;
  amount?: number;
  status: DocumentStatusKey;
  pdfUrl?: string; // Link to generated PDF
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string; // Can be 'system-payroll' or 'system-announcement' for system messages
  senderName: string;
  timestamp: string; // ISO Date string
  text?: string;
  fileUrl?: string;
  fileName?: string;
  link?: string;
}

export interface ChatRoom {
  id: string;
  name: string; // e.g., 'General', 'Project Alpha', 'Sales Department'
  memberIds: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO Date string
  end: string; // ISO Date string
  description?: string;
  attendees: { employeeId: string; employeeName: string }[];
  isAllDay?: boolean;
  taskId?: string; // Link to a task if it's a task reminder
}

export interface ReportData {
  labels: string[];
  datasets: { label: string; data: number[]; backgroundColor?: string; borderColor?: string }[];
}

// --- Payroll Specific Types ---
export enum PayrollRunStatus {
  DRAFT = 'Draft',
  APPROVED = 'Approved',
  PAID = 'Paid',
  CANCELLED = 'Cancelled',
}

export type PayrollRunStatusKey = keyof typeof PayrollRunStatus;


export interface PayslipItem {
  payrollComponentId?: string; // Link to PayrollComponent for properties like taxability
  name: string;
  amount: number;
}

export interface Payslip {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeName: string;
  employeeCode?: string; 
  employeeDepartment?: string; 
  employeePosition?: string; 
  employeeTaxId?: string; 
  employeeSsn?: string; 
  employeeJoiningDate?: string; 

  payPeriod: string; // e.g., "May 2024"

  baseSalary: number;
  
  // Overtime specific fields, can be edited per payslip
  overtimeHours?: number;
  overtimeRate?: number; // Rate per hour
  overtimePay?: number;   // Calculated: hours * rate

  allowances: PayslipItem[]; // Includes recurring and one-off
  grossPay: number;

  taxDeduction: number;
  socialSecurityDeduction: number;
  providentFundDeduction: number;
  otherDeductions: PayslipItem[]; // Specific deductions not part of SSF, PF, Tax
  totalDeductions: number;

  netPay: number;

  bankName?: string;
  bankAccountNumber?: string;
  paymentDate?: string; 
  
  // Temporary fields for editing payslip modal, not necessarily saved directly in this raw form
  // but used to reconstruct allowances/OT before final calculation.
  _tempOneTimeAllowances?: PayslipItem[]; 
  _tempOneTimeDeductions?: PayslipItem[]; // New: For ad-hoc deductions
}

export interface PayrollRun {
  id: string;
  periodMonth: number; // 1-12
  periodYear: number;
  status: PayrollRunStatus;
  dateCreated: string; // ISO
  dateApproved?: string; // ISO
  datePaid?: string; // ISO
  payslipIds: string[]; // Store IDs of payslips belonging to this run
  totalEmployees: number;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  notes?: string;
}

export interface TaxBracket {
  minIncome: number;
  maxIncome?: number; // undefined for the highest bracket
  rate: number; // percentage, e.g., 0.05 for 5%
  cumulativeTaxAtPreviousBracket?: number; // Helps in calculation
}

export interface PayrollComponent {
  id: string;
  name: string;
  type: 'Allowance' | 'Deduction';
  isTaxable?: boolean; // for allowances
  defaultAmount?: number; // Can be overridden at employee level
  defaultRate?: number; // For percentage based, e.g. SSF rate
  calculationBasis?: 'Salary' | 'GrossPay'; // For percentage based
  cap?: number; // e.g. SSF cap
  isSystemCalculated?: boolean; // True for SSF, Tax, PF which are not user-deletable/directly editable from generic component list
}

export interface PayslipViewProps {
  payslip: Payslip;
  employee?: Employee; // Full employee details for richer display
  companyName?: string;
  companyAddress?: string;
  companyLogoUrl?: string;
  isPaid?: boolean; // To show "Paid" stamp
}

// For the EditPayslipModal
export interface EditPayslipFormData {
    baseSalary: number; // Display only, not editable here
    overtimeHours: number;
    overtimeRate: number;
    // Ad-hoc allowances to be added for this specific payslip
    oneTimeAllowances: { payrollComponentId: string; name: string; amount: number }[]; 
    // Ad-hoc deductions to be added for this specific payslip
    oneTimeDeductions: { payrollComponentId: string; name: string; amount: number }[];
}

// --- Fingerprint Scanner Integration Types ---
export interface FingerprintScannerSettings {
  ipAddress: string;
  port: string; // Typically a number, but string for input flexibility
  deviceId?: string; // Optional device identifier if multiple scanners
  lastSyncStatus?: 'Success' | 'Failed' | 'Pending' | 'Unknown'; // Sync from Scanner
  lastSyncTime?: string; // ISO Date string for sync from scanner
  lastSyncToScannerStatus?: 'Success' | 'Failed' | 'Pending' | 'Unknown'; // Sync to Scanner
  lastSyncToScannerTime?: string; // ISO Date string for sync to scanner
}

// --- Announcement Banner Types ---
export interface AnnouncementSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// --- Leave Management Types ---
export enum LeaveType {
  ANNUAL = 'Annual', // ลาพักร้อน
  SICK = 'Sick', // ลาป่วย
  PERSONAL = 'Personal', // ลากิจ
  MATERNITY = 'Maternity', // ลาคลอด
  ORDINATION = 'Ordination', // ลาบวช
  OTHER = 'Other', // ลาอื่นๆ
}

export enum LeaveRequestStatus {
  PENDING = 'Pending', // รอดำเนินการ
  APPROVED = 'Approved', // อนุมัติแล้ว
  REJECTED = 'Rejected', // ปฏิเสธ
  CANCELLED = 'Cancelled', // ยกเลิกโดยผู้ขอ/ผู้ดูแล
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string; // Denormalized for easy display
  leaveType: LeaveType;
  startDate: string; // ISO Date string (YYYY-MM-DD)
  endDate: string; // ISO Date string (YYYY-MM-DD)
  reason?: string;
  status: LeaveRequestStatus;
  requestedDate: string; // ISO Date string
  approverId?: string; // User ID of who approved/rejected
  approverName?: string;
  approvedDate?: string; // ISO Date string
  notes?: string; // Notes by approver or HR
  // For UI, might add calculated duration
  durationInDays?: number;
}

// --- Cash Advance Types ---
export enum CashAdvanceRequestStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  PAID = 'Paid', // After approval, HR/Finance marks it as paid
}

export interface CashAdvanceRequest {
  id: string;
  employeeId: string;
  employeeName: string; 
  employeeCode?: string;
  requestDate: string; // ISO Date String
  amount: number;
  reason: string;
  status: CashAdvanceRequestStatus;
  approverId?: string; 
  approverName?: string;
  approvalDate?: string; // ISO Date String
  notes?: string; // Notes by approver or HR
  paymentDate?: string; // When the cash was actually given
}


// --- New type for User Management Page ---
export interface ManagedUser {
  id: string;
  full_name: string | null;
  username: string | null; // This will hold the email
  role: UserRole | null;
  updated_at: string | null;
}
