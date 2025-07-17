// services/api.ts
import { 
    User, Employee, TimeLog, InventoryItem, StockTransaction, PurchaseOrder, Document, CalendarEvent, 
    PayrollRun, Payslip, PayrollComponent, LeaveRequest, ChatMessage, CashAdvanceRequest, UserRole, 
    ManagedUser, LeaveType, EmployeeStatusKey 
} from '../types';
import { DEPARTMENTS, POSITIONS, DEFAULT_PAYROLL_COMPONENTS, CHAT_ROOMS_SAMPLE, AI_ASSISTANT_ROOM_ID } from '../constants';

// --- Mock Database (using localStorage) ---
const getFromStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

const saveToStorage = (key: string, value: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error writing to localStorage key “${key}”:`, error);
    }
};

const generateId = (prefix: string = 'id') => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Initialize mock data
const initMockData = () => {
    const defaultUsers = [
        { id: 'user-admin-01', username: 'admin@officemate.com', name: 'คุณแอดมิน', role: UserRole.ADMIN, department: DEPARTMENTS[7] },
        { id: 'user-manager-01', username: 'manager@officemate.com', name: 'คุณเมเนเจอร์', role: UserRole.MANAGER, department: DEPARTMENTS[0] },
        { id: 'user-staff-01', username: 'staff@officemate.com', name: 'คุณสตาฟ', role: UserRole.STAFF, department: DEPARTMENTS[1] },
        { id: 'user-hr-01', username: 'hr@officemate.com', name: 'คุณเอชอาร์', role: UserRole.STAFF, department: DEPARTMENTS[3] },
        { id: 'user-programmer-01', username: 'programmer@officemate.com', name: 'โปรแกรมเมอร์', role: UserRole.Programmer, department: DEPARTMENTS[5] },
    ];
    const defaultEmployees: Employee[] = defaultUsers.map(u => ({
        id: u.id.replace('user-','emp-'),
        name: u.name,
        nameEn: u.name.replace('คุณ', 'Mr.'),
        employeeCode: `EMP${u.id.slice(-2)}`,
        email: u.username,
        phone: '081-234-5678',
        department: u.department,
        position: u.role === UserRole.ADMIN ? 'ผู้บริหาร' : u.role === UserRole.MANAGER ? 'ผู้จัดการ' : u.role === UserRole.Programmer ? 'นักพัฒนา' : 'พนักงาน',
        status: 'Active' as EmployeeStatusKey,
        hireDate: new Date(2023, 0, 15).toISOString(),
        profileImageUrl: `https://i.pravatar.cc/150?u=${u.id}`,
        baseSalary: u.role === UserRole.ADMIN ? 80000 : u.role === UserRole.MANAGER ? 60000 : 40000
    }));

    if (!localStorage.getItem('mock_users')) saveToStorage('mock_users', defaultUsers);
    if (!localStorage.getItem('mock_employees')) saveToStorage('mock_employees', defaultEmployees);
    if (!localStorage.getItem('mock_inventory_items')) saveToStorage('mock_inventory_items', []);
    if (!localStorage.getItem('mock_stock_transactions')) saveToStorage('mock_stock_transactions', []);
    if (!localStorage.getItem('mock_purchase_orders')) saveToStorage('mock_purchase_orders', []);
    if (!localStorage.getItem('mock_documents')) saveToStorage('mock_documents', []);
    if (!localStorage.getItem('mock_chat_messages')) {
        const initialMessages: ChatMessage[] = [
            { id: generateId('msg'), roomId: 'general', senderId: 'user-admin-01', senderName: 'คุณแอดมิน', timestamp: new Date().toISOString(), text: 'สวัสดีทุกคน ขอต้อนรับสู่ห้องแชททั่วไปครับ' },
            { id: generateId('msg'), roomId: AI_ASSISTANT_ROOM_ID, senderId: 'ai-assistant', senderName: 'AI Assistant', timestamp: new Date().toISOString(), text: 'สวัสดีครับ มีอะไรให้ผมช่วยไหมครับ?' },
        ];
        saveToStorage('mock_chat_messages', initialMessages);
    }
    if (!localStorage.getItem('mock_calendar_events')) saveToStorage('mock_calendar_events', []);
    if (!localStorage.getItem('mock_payroll_components')) saveToStorage('mock_payroll_components', DEFAULT_PAYROLL_COMPONENTS);
    if (!localStorage.getItem('mock_payroll_runs')) saveToStorage('mock_payroll_runs', []);
    if (!localStorage.getItem('mock_payslips')) saveToStorage('mock_payslips', []);
    if (!localStorage.getItem('mock_leave_requests')) saveToStorage('mock_leave_requests', []);
    if (!localStorage.getItem('mock_cash_advance_requests')) saveToStorage('mock_cash_advance_requests', []);
    if (!localStorage.getItem('mock_settings')) saveToStorage('mock_settings', {});
};

initMockData();

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- API Functions (Mock) ---

// User Profiles
export const getUserProfile = async (userId: string): Promise<User | null> => {
    await delay(100);
    const users = getFromStorage<User[]>('mock_users', []);
    return users.find(u => u.id === userId) || null;
};
export const getAllUserProfiles = async (): Promise<User[]> => {
    await delay(100);
    return getFromStorage<User[]>('mock_users', []);
};

// Employees
export const getEmployees = async (): Promise<Employee[]> => {
    await delay(200);
    return getFromStorage<Employee[]>('mock_employees', []);
};
export const getEmployeeById = async (id: string): Promise<Employee | null> => {
    await delay(100);
    const employees = getFromStorage<Employee[]>('mock_employees', []);
    return employees.find(e => e.id === id) || null;
};
export const addEmployee = async (employeeData: Omit<Employee, 'id'>): Promise<Employee> => {
    await delay(200);
    const employees = getFromStorage<Employee[]>('mock_employees', []);
    const newEmployee = { ...employeeData, id: generateId('emp') };
    employees.push(newEmployee);
    saveToStorage('mock_employees', employees);
    return newEmployee;
};
export const addBulkEmployees = async (newEmployees: Partial<Employee>[]): Promise<void> => {
    await delay(500);
    const employees = getFromStorage<Employee[]>('mock_employees', []);
    const processedEmployees = newEmployees.map(e => ({ ...e, id: generateId('emp') } as Employee));
    saveToStorage('mock_employees', [...employees, ...processedEmployees]);
};
export const updateEmployee = async (updatedEmployee: Employee): Promise<Employee> => {
    await delay(200);
    let employees = getFromStorage<Employee[]>('mock_employees', []);
    employees = employees.map(e => e.id === updatedEmployee.id ? updatedEmployee : e);
    saveToStorage('mock_employees', employees);
    return updatedEmployee;
};
export const deleteEmployee = async (id: string): Promise<void> => {
    await delay(200);
    let employees = getFromStorage<Employee[]>('mock_employees', []);
    employees = employees.filter(e => e.id !== id);
    saveToStorage('mock_employees', employees);
};
export const getAllEmployees = getEmployees;

// Time Logs
export const getEmployeeTimeLogs = async (employeeId: string): Promise<TimeLog[]> => {
    await delay(150);
    const allLogs = getFromStorage<TimeLog[]>('mock_time_logs', []);
    return allLogs.filter(log => log.employeeId === employeeId).sort((a,b) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime());
};
export const addTimeLog = async (logData: Omit<TimeLog, 'id'>): Promise<TimeLog> => {
    await delay(100);
    const logs = getFromStorage<TimeLog[]>('mock_time_logs', []);
    const newLog = { ...logData, id: generateId('log') };
    logs.push(newLog);
    saveToStorage('mock_time_logs', logs);
    return newLog;
};

// Generic CRUD for simplicity
const createMockCrud = <T extends { id: string }>(storageKey: string, delayMs: number = 100) => ({
    getAll: async (): Promise<T[]> => {
        await delay(delayMs);
        return getFromStorage<T[]>(storageKey, []);
    },
    getById: async (id: string): Promise<T | null> => {
        await delay(delayMs);
        const items = getFromStorage<T[]>(storageKey, []);
        return items.find(item => item.id === id) || null;
    },
    add: async (itemData: Omit<T, 'id'>): Promise<T> => {
        await delay(delayMs);
        const items = getFromStorage<T[]>(storageKey, []);
        const newItem = { ...itemData, id: generateId(storageKey) } as T;
        items.push(newItem);
        saveToStorage(storageKey, items);
        return newItem;
    },
    update: async (updatedItem: T): Promise<T> => {
        await delay(delayMs);
        let items = getFromStorage<T[]>(storageKey, []);
        items = items.map(item => item.id === updatedItem.id ? updatedItem : item);
        saveToStorage(storageKey, items);
        return updatedItem;
    },
    remove: async (id: string): Promise<void> => {
        await delay(delayMs);
        let items = getFromStorage<T[]>(storageKey, []);
        items = items.filter(item => item.id !== id);
        saveToStorage(storageKey, items);
    },
});

const inventoryCrud = createMockCrud<InventoryItem>('mock_inventory_items');
const stockTransactionCrud = createMockCrud<StockTransaction>('mock_stock_transactions');
const poCrud = createMockCrud<PurchaseOrder>('mock_purchase_orders');
const documentCrud = createMockCrud<Document>('mock_documents');
const calendarEventCrud = createMockCrud<CalendarEvent>('mock_calendar_events');
const payrollComponentCrud = createMockCrud<PayrollComponent>('mock_payroll_components');
const payrollRunCrud = createMockCrud<PayrollRun>('mock_payroll_runs');
const payslipCrud = createMockCrud<Payslip>('mock_payslips');
const leaveRequestCrud = createMockCrud<LeaveRequest>('mock_leave_requests');
const cashAdvanceCrud = createMockCrud<CashAdvanceRequest>('mock_cash_advance_requests');
const chatMessageCrud = createMockCrud<ChatMessage>('mock_chat_messages');

// Inventory
export const getInventoryItems = (category?: 'อุปกรณ์ IT' | 'General') => {
    const allItems = getFromStorage<InventoryItem[]>('mock_inventory_items', []);
    if (!category) return Promise.resolve(allItems);
    return Promise.resolve(allItems.filter(item => item.category === category));
};
export const getStockTransactions = stockTransactionCrud.getAll;
export const getInventoryItemTransactions = async (itemId: string) => {
    const all = await stockTransactionCrud.getAll();
    return all.filter(t => t.itemId === itemId);
};
export const addInventoryItem = inventoryCrud.add;
export const updateInventoryItem = inventoryCrud.update;
export const deleteInventoryItem = inventoryCrud.remove;
export const addStockTransaction = async (txData: Omit<StockTransaction, 'id'>) => {
    const newTx = await stockTransactionCrud.add(txData);
    const item = await inventoryCrud.getById(newTx.itemId);
    if (item) {
        const newQuantity = item.quantity + (newTx.type === 'IN' ? newTx.quantity : -newTx.quantity);
        await inventoryCrud.update({ ...item, quantity: newQuantity, lastUpdated: new Date().toISOString() });
    }
    return newTx;
};

// POs
export const getPurchaseOrders = poCrud.getAll;
export const addPurchaseOrder = poCrud.add;
export const updatePurchaseOrder = poCrud.update;
export const deletePurchaseOrder = poCrud.remove;
export const getAllPurchaseOrders = getPurchaseOrders;

// Documents
export const getDocuments = documentCrud.getAll;
export const addDocument = documentCrud.add;
export const updateDocument = documentCrud.update;
export const deleteDocument = documentCrud.remove;

// Chat
export const getChatMessages = async (roomId: string) => {
    const all = await chatMessageCrud.getAll();
    return all.filter(m => m.roomId === roomId);
};
export const addChatMessage = chatMessageCrud.add;

// Calendar
export const getCalendarEvents = calendarEventCrud.getAll;
export const addCalendarEvent = calendarEventCrud.add;
export const updateCalendarEvent = calendarEventCrud.update;
export const deleteCalendarEvent = calendarEventCrud.remove;

// Leave Requests
export const getLeaveRequests = leaveRequestCrud.getAll;
export const addLeaveRequest = leaveRequestCrud.add;
export const updateLeaveRequest = leaveRequestCrud.update;
export const deleteLeaveRequest = leaveRequestCrud.remove;
export const getAllLeaveRequests = getLeaveRequests;

// Cash Advance
export const getCashAdvanceRequests = cashAdvanceCrud.getAll;
export const addCashAdvanceRequest = cashAdvanceCrud.add;
export const updateCashAdvanceRequest = cashAdvanceCrud.update;
export const deleteCashAdvanceRequest = cashAdvanceCrud.remove;

// Payroll
export const getPayrollComponents = payrollComponentCrud.getAll;
export const addPayrollComponent = payrollComponentCrud.add;
export const updatePayrollComponent = payrollComponentCrud.update;
export const deletePayrollComponent = payrollComponentCrud.remove;
export const getAllPayrollComponents = getPayrollComponents;

export const getPayrollRuns = payrollRunCrud.getAll;
export const getPayrollRunById = payrollRunCrud.getById;
export const addPayrollRun = payrollRunCrud.add;
export const updatePayrollRun = payrollRunCrud.update;
export const deletePayrollRun = async (runId: string) => {
    const run = await payrollRunCrud.getById(runId);
    if (run) {
        let allPayslips = await payslipCrud.getAll();
        const payslipsToKeep = allPayslips.filter(p => !run.payslipIds.includes(p.id));
        saveToStorage('mock_payslips', payslipsToKeep);
    }
    await payrollRunCrud.remove(runId);
};
export const getPayslipsForRun = async (runId: string) => {
    const all = await payslipCrud.getAll();
    return all.filter(p => p.payrollRunId === runId);
};
export const getPayslipsForEmployee = async (employeeId: string) => {
    const all = await payslipCrud.getAll();
    return all.filter(p => p.employeeId === employeeId);
};
export const addPayslip = payslipCrud.add;
export const updatePayslip = payslipCrud.update;
export const deletePayslip = payslipCrud.remove;

// Settings
export const getSetting = async (key: string): Promise<any | null> => {
    await delay(50);
    const settings = getFromStorage<any>('mock_settings', {});
    return settings[key] || null;
};
export const saveSetting = async (key: string, value: any): Promise<void> => {
    await delay(50);
    const settings = getFromStorage<any>('mock_settings', {});
    settings[key] = value;
    saveToStorage('mock_settings', settings);
};

// User Management (Admin)
export const getManagedUsers = async (): Promise<ManagedUser[]> => {
    await delay(200);
    const users = getFromStorage<User[]>('mock_users', []);
    return users.map(u => ({
        id: u.id,
        full_name: u.name,
        username: u.username,
        role: u.role,
        updated_at: new Date().toISOString(),
    }));
};

export const updateUserRole = async (userId: string, role: UserRole): Promise<void> => {
    await delay(200);
    let users = getFromStorage<User[]>('mock_users', []);
    users = users.map(u => u.id === userId ? { ...u, role } : u);
    saveToStorage('mock_users', users);
};
