

export enum UserRole {
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  STAFF = 'Staff',
}

export type EmployeeStatusKey = 'Active' | 'Inactive' | 'On Leave';
export type POStatusKey = 'Pending' | 'Approved' | 'Processing' | 'Shipped' | 'Completed' | 'Cancelled';
export type DocumentStatusKey = 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  department?: string; // Optional, can be relevant for managers
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
  minStockLevel: number;
  unitPrice: number;
  supplier?: string;
  lastUpdated: string;
  isLowStock?: boolean; // Added for UI indication
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
  department: string | null;
  updated_at: string | null;
}


// --- Supabase Types ---

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      calendar_events: {
        Row: {
          attendees: Json
          created_at: string
          description: string | null
          end: string
          id: string
          is_all_day: boolean | null
          start: string
          task_id: string | null
          title: string
        }
        Insert: {
          attendees: Json
          created_at?: string
          description?: string | null
          end: string
          id?: string
          is_all_day?: boolean | null
          start: string
          task_id?: string | null
          title: string
        }
        Update: {
          attendees?: Json
          created_at?: string
          description?: string | null
          end?: string
          id?: string
          is_all_day?: boolean | null
          start?: string
          task_id?: string | null
          title?: string
        }
      }
      cash_advance_requests: {
        Row: {
          amount: number
          approval_date: string | null
          approver_id: string | null
          approver_name: string | null
          created_at: string
          employee_code: string | null
          employee_id: string
          employee_name: string
          id: string
          notes: string | null
          payment_date: string | null
          reason: string
          request_date: string
          status: Database["public"]["Enums"]["cash_advance_request_status"]
        }
        Insert: {
          amount: number
          approval_date?: string | null
          approver_id?: string | null
          approver_name?: string | null
          created_at?: string
          employee_code?: string | null
          employee_id: string
          employee_name: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          reason: string
          request_date: string
          status: Database["public"]["Enums"]["cash_advance_request_status"]
        }
        Update: {
          amount?: number
          approval_date?: string | null
          approver_id?: string | null
          approver_name?: string | null
          created_at?: string
          employee_code?: string | null
          employee_id?: string
          employee_name?: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          reason?: string
          request_date?: string
          status?: Database["public"]["Enums"]["cash_advance_request_status"]
        }
      }
      chat_messages: {
        Row: {
          created_at: string
          file_name: string | null
          file_url: string | null
          id: string
          link: string | null
          room_id: string
          sender_id: string
          sender_name: string
          text: string | null
          timestamp: string
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          link?: string | null
          room_id: string
          sender_id: string
          sender_name: string
          text?: string | null
          timestamp: string
        }
        Update: {
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          link?: string | null
          room_id?: string
          sender_id?: string
          sender_name?: string
          text?: string | null
          timestamp?: string
        }
      }
      documents: {
        Row: {
          amount: number | null
          client_name: string
          created_at: string
          date: string
          doc_number: string
          id: string
          notes: string | null
          pdf_url: string | null
          project_name: string | null
          status: Database["public"]["Enums"]["document_status"]
          type: Database["public"]["Enums"]["document_type"]
        }
        Insert: {
          amount?: number | null
          client_name: string
          created_at?: string
          date: string
          doc_number: string
          id?: string
          notes?: string | null
          pdf_url?: string | null
          project_name?: string | null
          status: Database["public"]["Enums"]["document_status"]
          type: Database["public"]["Enums"]["document_type"]
        }
        Update: {
          amount?: number | null
          client_name?: string
          created_at?: string
          date?: string
          doc_number?: string
          id?: string
          notes?: string | null
          pdf_url?: string | null
          project_name?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          type?: Database["public"]["Enums"]["document_type"]
        }
      }
      employees: {
        Row: {
          bank_account_number: string | null
          bank_name: string | null
          base_salary: number | null
          contract_url: string | null
          created_at: string
          department: string
          email: string
          employee_code: string | null
          fingerprint_scanner_id: string | null
          hire_date: string
          id: string
          name: string
          name_en: string | null
          passport_expiry_date: string | null
          passport_number: string | null
          phone: string
          position: string
          profile_image_url: string | null
          provident_fund_rate_employee: number | null
          provident_fund_rate_employer: number | null
          recurring_allowances: Json | null
          recurring_deductions: Json | null
          social_security_number: string | null
          status: Database["public"]["Enums"]["employee_status"]
          tax_id: string | null
        }
        Insert: {
          bank_account_number?: string | null
          bank_name?: string | null
          base_salary?: number | null
          contract_url?: string | null
          created_at?: string
          department: string
          email: string
          employee_code?: string | null
          fingerprint_scanner_id?: string | null
          hire_date: string
          id?: string
          name: string
          name_en?: string | null
          passport_expiry_date?: string | null
          passport_number?: string | null
          phone: string
          position: string
          profile_image_url?: string | null
          provident_fund_rate_employee?: number | null
          provident_fund_rate_employer?: number | null
          recurring_allowances?: Json | null
          recurring_deductions?: Json | null
          social_security_number?: string | null
          status: Database["public"]["Enums"]["employee_status"]
          tax_id?: string | null
        }
        Update: {
          bank_account_number?: string | null
          bank_name?: string | null
          base_salary?: number | null
          contract_url?: string | null
          created_at?: string
          department?: string
          email?: string
          employee_code?: string | null
          fingerprint_scanner_id?: string | null
          hire_date?: string
          id?: string
          name?: string
          name_en?: string | null
          passport_expiry_date?: string | null
          passport_number?: string | null
          phone?: string
          position?: string
          profile_image_url?: string | null
          provident_fund_rate_employee?: number | null
          provident_fund_rate_employer?: number | null
          recurring_allowances?: Json | null
          recurring_deductions?: Json | null
          social_security_number?: string | null
          status?: Database["public"]["Enums"]["employee_status"]
          tax_id?: string | null
        }
      }
      inventory_items: {
        Row: {
          category: string
          created_at: string
          id: string
          last_updated: string
          min_stock_level: number
          name: string
          quantity: number
          sku: string
          supplier: string | null
          unit_price: number
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          min_stock_level: number
          name: string
          quantity: number
          sku: string
          supplier?: string | null
          unit_price: number
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          min_stock_level?: number
          name?: string
          quantity?: number
          sku?: string
          supplier?: string | null
          unit_price?: number
        }
      }
      leave_requests: {
        Row: {
          approved_date: string | null
          approver_id: string | null
          approver_name: string | null
          created_at: string
          duration_in_days: number | null
          employee_id: string
          employee_name: string
          end_date: string
          id: string
          leave_type: Database["public"]["Enums"]["leave_type"]
          notes: string | null
          reason: string | null
          requested_date: string
          start_date: string
          status: Database["public"]["Enums"]["leave_request_status"]
        }
        Insert: {
          approved_date?: string | null
          approver_id?: string | null
          approver_name?: string | null
          created_at?: string
          duration_in_days?: number | null
          employee_id: string
          employee_name: string
          end_date: string
          id?: string
          leave_type: Database["public"]["Enums"]["leave_type"]
          notes?: string | null
          reason?: string | null
          requested_date: string
          start_date: string
          status: Database["public"]["Enums"]["leave_request_status"]
        }
        Update: {
          approved_date?: string | null
          approver_id?: string | null
          approver_name?: string | null
          created_at?: string
          duration_in_days?: number | null
          employee_id?: string
          employee_name?: string
          end_date?: string
          id?: string
          leave_type?: Database["public"]["Enums"]["leave_type"]
          notes?: string | null
          reason?: string | null
          requested_date?: string
          start_date?: string
          status?: Database["public"]["Enums"]["leave_request_status"]
        }
      }
      payroll_components: {
        Row: {
          calculation_basis: string | null
          cap: number | null
          created_at: string
          default_amount: number | null
          default_rate: number | null
          id: string
          is_system_calculated: boolean | null
          is_taxable: boolean | null
          name: string
          type: string
        }
        Insert: {
          calculation_basis?: string | null
          cap?: number | null
          created_at?: string
          default_amount?: number | null
          default_rate?: number | null
          id?: string
          is_system_calculated?: boolean | null
          is_taxable?: boolean | null
          name: string
          type: string
        }
        Update: {
          calculation_basis?: string | null
          cap?: number | null
          created_at?: string
          default_amount?: number | null
          default_rate?: number | null
          id?: string
          is_system_calculated?: boolean | null
          is_taxable?: boolean | null
          name?: string
          type?: string
        }
      }
      payroll_runs: {
        Row: {
          created_at: string
          date_approved: string | null
          date_created: string
          date_paid: string | null
          id: string
          notes: string | null
          payslip_ids: string[] | null
          period_month: number
          period_year: number
          status: Database["public"]["Enums"]["payroll_run_status"]
          total_deductions: number
          total_employees: number
          total_gross_pay: number
          total_net_pay: number
        }
        Insert: {
          created_at?: string
          date_approved?: string | null
          date_created?: string
          date_paid?: string | null
          id?: string
          notes?: string | null
          payslip_ids?: string[] | null
          period_month: number
          period_year: number
          status: Database["public"]["Enums"]["payroll_run_status"]
          total_deductions: number
          total_employees: number
          total_gross_pay: number
          total_net_pay: number
        }
        Update: {
          created_at?: string
          date_approved?: string | null
          date_created?: string
          date_paid?: string | null
          id?: string
          notes?: string | null
          payslip_ids?: string[] | null
          period_month?: number
          period_year?: number
          status?: Database["public"]["Enums"]["payroll_run_status"]
          total_deductions?: number
          total_employees?: number
          total_gross_pay?: number
          total_net_pay?: number
        }
      }
      payslips: {
        Row: {
          allowances: Json
          bank_account_number: string | null
          bank_name: string | null
          base_salary: number
          created_at: string
          employee_code: string | null
          employee_department: string | null
          employee_id: string
          employee_joining_date: string | null
          employee_name: string
          employee_position: string | null
          employee_ssn: string | null
          employee_tax_id: string | null
          gross_pay: number
          id: string
          net_pay: number
          other_deductions: Json
          overtime_hours: number | null
          overtime_pay: number | null
          overtime_rate: number | null
          pay_period: string
          payment_date: string | null
          payroll_run_id: string
          provident_fund_deduction: number
          social_security_deduction: number
          tax_deduction: number
          total_deductions: number
        }
        Insert: {
          allowances: Json
          bank_account_number?: string | null
          bank_name?: string | null
          base_salary: number
          created_at?: string
          employee_code?: string | null
          employee_department?: string | null
          employee_id: string
          employee_joining_date?: string | null
          employee_name: string
          employee_position?: string | null
          employee_ssn?: string | null
          employee_tax_id?: string | null
          gross_pay: number
          id?: string
          net_pay: number
          other_deductions: Json
          overtime_hours?: number | null
          overtime_pay?: number | null
          overtime_rate?: number | null
          pay_period: string
          payment_date?: string | null
          payroll_run_id: string
          provident_fund_deduction: number
          social_security_deduction: number
          tax_deduction: number
          total_deductions: number
        }
        Update: {
          allowances?: Json
          bank_account_number?: string | null
          bank_name?: string | null
          base_salary?: number
          created_at?: string
          employee_code?: string | null
          employee_department?: string | null
          employee_id?: string
          employee_joining_date?: string | null
          employee_name?: string
          employee_position?: string | null
          employee_ssn?: string | null
          employee_tax_id?: string | null
          gross_pay?: number
          id?: string
          net_pay?: number
          other_deductions?: Json
          overtime_hours?: number | null
          overtime_pay?: number | null
          overtime_rate?: number | null
          pay_period?: string
          payment_date?: string | null
          payroll_run_id?: string
          provident_fund_deduction?: number
          social_security_deduction?: number
          tax_deduction?: number
          total_deductions?: number
        }
      }
      profiles: {
        Row: {
          department: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          department?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          department?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          username?: string | null
        }
      }
      purchase_orders: {
        Row: {
          created_at: string
          expected_delivery_date: string | null
          id: string
          items: Json
          notes: string | null
          order_date: string
          po_number: string
          status: Database["public"]["Enums"]["po_status"]
          supplier: string
          total_amount: number
        }
        Insert: {
          created_at?: string
          expected_delivery_date?: string | null
          id?: string
          items: Json
          notes?: string | null
          order_date: string
          po_number: string
          status: Database["public"]["Enums"]["po_status"]
          supplier: string
          total_amount: number
        }
        Update: {
          created_at?: string
          expected_delivery_date?: string | null
          id?: string
          items?: Json
          notes?: string | null
          order_date?: string
          po_number?: string
          status?: Database["public"]["Enums"]["po_status"]
          supplier?: string
          total_amount?: number
        }
      }
      settings: {
        Row: {
          created_at: string
          key: string
          value: Json | null
        }
        Insert: {
          created_at?: string
          key: string
          value?: Json | null
        }
        Update: {
          created_at?: string
          key?: string
          value?: Json | null
        }
      }
      stock_transactions: {
        Row: {
          created_at: string
          date: string
          employee_id: string | null
          employee_name: string | null
          id: string
          item_id: string
          item_name: string
          quantity: number
          reason: string
          type: Database["public"]["Enums"]["stock_transaction_type"]
        }
        Insert: {
          created_at?: string
          date?: string
          employee_id?: string | null
          employee_name?: string | null
          id?: string
          item_id: string
          item_name: string
          quantity: number
          reason: string
          type: Database["public"]["Enums"]["stock_transaction_type"]
        }
        Update: {
          created_at?: string
          date?: string
          employee_id?: string | null
          employee_name?: string | null
          id?: string
          item_id?: string
          item_name?: string
          quantity?: number
          reason?: string
          type?: Database["public"]["Enums"]["stock_transaction_type"]
        }
      }
      time_logs: {
        Row: {
          clock_in: string
          clock_out: string | null
          created_at: string
          employee_id: string
          employee_name: string
          id: string
          notes: string | null
          source: string | null
        }
        Insert: {
          clock_in: string
          clock_out?: string | null
          created_at?: string
          employee_id: string
          employee_name: string
          id?: string
          notes?: string | null
          source?: string | null
        }
        Update: {
          clock_in?: string
          clock_out?: string | null
          created_at?: string
          employee_id?: string
          employee_name?: string
          id?: string
          notes?: string | null
          source?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_stock_transaction: {
        Args: {
          p_item_id: string
          p_item_name: string
          p_type: string
          p_quantity: number
          p_reason: string
          p_employee_id: string
          p_employee_name: string
        }
        Returns: undefined
      }
      delete_payroll_run: {
        Args: {
          p_run_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      cash_advance_request_status:
        | "Pending"
        | "Approved"
        | "Rejected"
        | "Paid"
      document_status: "Draft" | "Sent" | "Paid" | "Overdue" | "Cancelled"
      document_type: "Quotation" | "Invoice" | "Delivery Note"
      employee_status: "Active" | "Inactive" | "On Leave"
      leave_request_status: "Pending" | "Approved" | "Rejected" | "Cancelled"
      leave_type: "Annual" | "Sick" | "Personal" | "Maternity" | "Ordination" | "Other"
      payroll_run_status: "Draft" | "Approved" | "Paid" | "Cancelled"
      po_status:
        | "Pending"
        | "Approved"
        | "Processing"
        | "Shipped"
        | "Completed"
        | "Cancelled"
      stock_transaction_type: "IN" | "OUT"
      user_role: "Admin" | "Manager" | "Staff"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
