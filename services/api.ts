// services/api.ts
import { User, Employee, TimeLog, InventoryItem, StockTransaction, PurchaseOrder, Document, CalendarEvent, PayrollRun, Payslip, PayrollComponent, LeaveRequest, ChatMessage, CashAdvanceRequest, Json, EmployeeStatusKey, POStatusKey, DocumentStatusKey, DocumentType, LeaveType, LeaveRequestStatus, CashAdvanceRequestStatus, EmployeeAllowance, EmployeeDeduction, PayslipItem, ManagedUser, UserRole } from '../types';
import { DEFAULT_PAYROLL_COMPONENTS } from '../constants';

// --- MOCK DATA ---

const MOCK_EMPLOYEES: Employee[] = [
    { id: 'emp-001', name: 'สมชาย ใจดี', employeeCode: 'EMP001', email: 'somchai.j@example.com', phone: '0812345678', department: 'ฝ่ายขาย', position: 'ผู้จัดการ', status: 'Active', hireDate: '2022-01-15T00:00:00Z', baseSalary: 50000, recurringAllowances: [{id: '1', name: 'ค่าเดินทาง', amount: 3000}], recurringDeductions: [] },
    { id: 'emp-002', name: 'สมศรี มีสุข', employeeCode: 'EMP002', email: 'somsri.m@example.com', phone: '0823456789', department: 'ฝ่ายการตลาด', position: 'พนักงาน', status: 'Active', hireDate: '2023-03-10T00:00:00Z', baseSalary: 25000, recurringAllowances: [], recurringDeductions: [] },
    { id: 'emp-003', name: 'มานะ อดทน', employeeCode: 'EMP003', email: 'mana.o@example.com', phone: '0834567890', department: 'ฝ่ายไอที', position: 'ผู้เชี่ยวชาญ', status: 'On Leave', hireDate: '2021-11-20T00:00:00Z', baseSalary: 45000, recurringAllowances: [], recurringDeductions: [] },
];

const MOCK_MANAGED_USERS: ManagedUser[] = [
    { id: 'user-001', full_name: 'แอดมิน (Mock)', username: 'admin@officemate.com', role: UserRole.ADMIN, updated_at: new Date().toISOString() },
    { id: 'user-002', full_name: 'สมชาย ใจดี', username: 'somchai.j@example.com', role: UserRole.MANAGER, updated_at: new Date().toISOString() },
    { id: 'user-003', full_name: 'สมศรี มีสุข', username: 'somsri.m@example.com', role: UserRole.STAFF, updated_at: new Date().toISOString() },
]

// --- API Functions (Mocked) ---

const mockDelay = (ms = 200) => new Promise(res => setTimeout(res, ms));

// User Profiles
export const getUserProfile = async (userId: string) => { await mockDelay(); return null; };
export const getAllUserProfiles = async (): Promise<User[]> => { await mockDelay(); return []; };

// Employees
export const getAllEmployees = async (): Promise<Employee[]> => { await mockDelay(); return MOCK_EMPLOYEES; };
export const getEmployees = async (): Promise<Employee[]> => { await mockDelay(); return MOCK_EMPLOYEES; };
export const getEmployeeById = async (id: string): Promise<Employee | null> => { await mockDelay(); return MOCK_EMPLOYEES.find(e => e.id === id) || null; };
export const addEmployee = async (employeeData: Omit<Employee, 'id'>): Promise<Employee> => { await mockDelay(); return { ...employeeData, id: `mock-${Date.now()}` }; };
export const addBulkEmployees = async (employees: any[]): Promise<void> => { await mockDelay(); return; };
export const updateEmployee = async (updatedEmployee: Employee): Promise<Employee> => { await mockDelay(); return updatedEmployee; };
export const deleteEmployee = async (id: string) => { await mockDelay(); return; };

// Time Logs
export const getEmployeeTimeLogs = async (employeeId: string): Promise<TimeLog[]> => { await mockDelay(); return []; };
export const addTimeLog = async (logData: Omit<TimeLog, 'id'>): Promise<TimeLog> => { await mockDelay(); return { ...logData, id: `mock-log-${Date.now()}` }; };

// Inventory
export const getAllInventoryItems = async (category?: 'อุปกรณ์ IT' | 'General'): Promise<InventoryItem[]> => { await mockDelay(); return []; };
export const getInventoryItems = async (category?: 'อุปกรณ์ IT' | 'General'): Promise<InventoryItem[]> => { await mockDelay(); return []; };
export const getStockTransactions = async (): Promise<StockTransaction[]> => { await mockDelay(); return []; };
export const getInventoryItemTransactions = async (itemId: string): Promise<StockTransaction[]> => { await mockDelay(); return []; };
export const addInventoryItem = async (itemData: Omit<InventoryItem, 'id' | 'lastUpdated'>): Promise<InventoryItem> => { await mockDelay(); return { ...itemData, id: `mock-item-${Date.now()}`, lastUpdated: new Date().toISOString() }; };
export const addBulkInventoryItems = async (items: any[]): Promise<void> => { await mockDelay(); return; };
export const updateInventoryItem = async (updatedItem: InventoryItem): Promise<InventoryItem> => { await mockDelay(); return updatedItem; };
export const deleteInventoryItem = (id: string) => { mockDelay(); return; };
export const addStockTransaction = async (transactionData: Omit<StockTransaction, 'id' | 'date'>) => { await mockDelay(); return; };

// Purchase Orders
export const getAllPurchaseOrders = async (): Promise<PurchaseOrder[]> => { await mockDelay(); return []; };
export const getPurchaseOrders = async (): Promise<PurchaseOrder[]> => { await mockDelay(); return []; };
export const addPurchaseOrder = async (poData: Omit<PurchaseOrder, 'id'>): Promise<PurchaseOrder> => { await mockDelay(); return { ...poData, id: `mock-po-${Date.now()}` }; };
export const addBulkPurchaseOrders = async (pos: any[]): Promise<void> => { await mockDelay(); return; };
export const updatePurchaseOrder = async (po: PurchaseOrder): Promise<PurchaseOrder> => { await mockDelay(); return po; };
export const deletePurchaseOrder = (id: string) => { mockDelay(); return; };

// Documents
export const getDocuments = async (): Promise<Document[]> => { await mockDelay(); return []; };
export const addDocument = async (doc: Omit<Document, 'id'>): Promise<Document> => { await mockDelay(); return { ...doc, id: `mock-doc-${Date.now()}` }; };
export const addBulkDocuments = async (docs: any[]): Promise<void> => { await mockDelay(); return; };
export const updateDocument = async (doc: Document): Promise<Document> => { await mockDelay(); return doc; };
export const deleteDocument = (id: string) => { mockDelay(); return; };

// Chat
export const getChatMessages = async (roomId: string): Promise<ChatMessage[]> => { await mockDelay(); return []; };
export const addChatMessage = async (msg: Omit<ChatMessage, 'id'>): Promise<ChatMessage> => { await mockDelay(); return { ...msg, id: `mock-chat-${Date.now()}` }; };

// Calendar Events
export const getCalendarEvents = async (): Promise<CalendarEvent[]> => { await mockDelay(); return []; };
export const addCalendarEvent = async (event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> => { await mockDelay(); return { ...event, id: `mock-event-${Date.now()}` }; };
export const updateCalendarEvent = async (event: CalendarEvent): Promise<CalendarEvent> => { await mockDelay(); return event; };
export const deleteCalendarEvent = (id: string) => { mockDelay(); return; };

// Leave Requests
export const getAllLeaveRequests = async (): Promise<LeaveRequest[]> => { await mockDelay(); return []; };
export const getLeaveRequests = async (): Promise<LeaveRequest[]> => { await mockDelay(); return []; };
export const addLeaveRequest = async (req: Omit<LeaveRequest, 'id'>): Promise<LeaveRequest> => { await mockDelay(); return { ...req, id: `mock-leave-${Date.now()}` }; };
export const addBulkLeaveRequests = async (reqs: any[]): Promise<void> => { await mockDelay(); return; };
export const updateLeaveRequest = async (req: LeaveRequest): Promise<LeaveRequest> => { await mockDelay(); return req; };
export const deleteLeaveRequest = (id: string) => { mockDelay(); return; };

// Cash Advance
export const getCashAdvanceRequests = async (): Promise<CashAdvanceRequest[]> => { await mockDelay(); return []; };
export const addCashAdvanceRequest = async (req: Omit<CashAdvanceRequest, 'id'>): Promise<CashAdvanceRequest> => { await mockDelay(); return { ...req, id: `mock-ca-${Date.now()}` }; };
export const addBulkCashAdvanceRequests = async (reqs: any[]): Promise<void> => { await mockDelay(); return; };
export const updateCashAdvanceRequest = async (req: CashAdvanceRequest): Promise<CashAdvanceRequest> => { await mockDelay(); return req; };
export const deleteCashAdvanceRequest = (id: string) => { mockDelay(); return; };

// Payroll
export const getPayrollComponents = async (): Promise<PayrollComponent[]> => { await mockDelay(); return DEFAULT_PAYROLL_COMPONENTS; };
export const addPayrollComponent = async (comp: Omit<PayrollComponent, 'id'>): Promise<PayrollComponent> => { await mockDelay(); return { ...comp, id: `mock-comp-${Date.now()}` }; };
export const updatePayrollComponent = async (comp: PayrollComponent): Promise<PayrollComponent> => { await mockDelay(); return comp; };
export const deletePayrollComponent = (id: string) => { mockDelay(); return; };
export const getAllPayrollComponents = getPayrollComponents;
export const getPayrollRuns = async (): Promise<PayrollRun[]> => { await mockDelay(); return []; };
export const getPayrollRunById = async (id: string): Promise<PayrollRun | null> => { await mockDelay(); return null; };
export const addPayrollRun = async (run: Omit<PayrollRun, 'id'>): Promise<PayrollRun> => { await mockDelay(); return { ...run, id: `mock-run-${Date.now()}` }; };
export const updatePayrollRun = async (run: PayrollRun): Promise<PayrollRun> => { await mockDelay(); return run; };
export const deletePayrollRun = async (id: string) => { await mockDelay(); return; };
export const getPayslipsForRun = async (runId: string): Promise<Payslip[]> => { await mockDelay(); return []; };
export const getPayslipsForEmployee = async (employeeId: string): Promise<Payslip[]> => { await mockDelay(); return []; };
export const addPayslip = async (payslip: Payslip) => { await mockDelay(); return; };
export const updatePayslip = async (payslip: Payslip) => { await mockDelay(); return; };
export const deletePayslip = (id: string) => { mockDelay(); return; };

// Settings
export const getSetting = async (key: string): Promise<any | null> => {
    await mockDelay();
    if (key === 'global_announcement') return Promise.resolve('ยินดีต้อนรับ! นี่คือโหมดทดลองของแอปพลิเคชัน');
    return Promise.resolve(null);
};
export const saveSetting = async (key: string, value: any): Promise<void> => { await mockDelay(); return; };

// User Management
export const getManagedUsers = async (): Promise<ManagedUser[]> => { await mockDelay(); return MOCK_MANAGED_USERS; };
export const updateUserRole = async (userId: string, role: UserRole): Promise<ManagedUser> => {
    await mockDelay();
    const user = MOCK_MANAGED_USERS.find(u => u.id === userId);
    if(user) {
        return { ...user, role };
    }
    throw new Error('User not found in mock data');
};