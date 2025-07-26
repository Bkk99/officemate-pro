// services/api.ts
import { supabase } from '../lib/supabaseClient';
import { 
    Employee, TimeLog, InventoryItem, StockTransaction, PurchaseOrder, Document, CalendarEvent, 
    PayrollRun, Payslip, PayrollComponent, LeaveRequest, ChatMessage, CashAdvanceRequest, UserRole, 
    ManagedUser
} from '../types';
import * as MockData from './realisticMockData';
import { DEFAULT_PAYROLL_COMPONENTS } from '../constants';

// --- Snake Case Conversion Helpers ---
const camelToSnake = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const convertKeysToSnakeCase = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(v => convertKeysToSnakeCase(v));
    } else if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
        return Object.keys(obj).reduce((acc: Record<string, any>, key) => {
            const snakeKey = key.startsWith('_') ? key : camelToSnake(key);
            acc[snakeKey] = convertKeysToSnakeCase(obj[key]);
            return acc;
        }, {});
    }
    return obj;
};


// Helper to handle Supabase errors
const handleSupabaseError = ({ error, customMessage }: { error: any, customMessage: string }) => {
    if (error) {
        console.error(customMessage, error);
        const detailedMessage = [
            error.message,
            error.details ? `Details: ${error.details}` : '',
            error.hint ? `Hint: ${error.hint}` : ''
        ].filter(Boolean).join(' ');
        
        throw new Error(`${customMessage}: ${detailedMessage || 'An unknown error occurred'}`);
    }
}

// --- API Functions (Supabase with Mock Fallback) ---

// User Profile / Employee
export const getEmployees = async (): Promise<Employee[]> => {
    const { data, error } = await supabase.from('employees').select('*');
    handleSupabaseError({ error, customMessage: 'Failed to fetch employees' });
    if (data && data.length > 0) return data as Employee[];
    console.warn("Supabase 'employees' table is empty. Using mock data for demonstration.");
    return MockData.mockEmployees;
};

export const getEmployeeById = async (id: string): Promise<Employee | null> => {
    const { data, error } = await supabase.from('employees').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') { // Allow 'not found'
        handleSupabaseError({ error, customMessage: `Failed to fetch employee ${id}` });
    }
    if (data) return data as Employee;

    console.warn(`Employee ${id} not found in Supabase. Trying mock data.`);
    const mockEmployee = MockData.mockEmployees.find(e => e.id === id);
    return mockEmployee || null;
};

// Creates auth user and profile
export const addEmployee = async (employeeData: Omit<Employee, 'id'>, password?: string): Promise<Employee> => {
    if(!password) throw new Error("Password is required to create a new employee.");
    
    // Create the authentication user using the standard client
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: employeeData.email,
        password: password,
        options: {
            data: {
                full_name: employeeData.name,
            }
        }
    });
    handleSupabaseError({ error: authError, customMessage: 'Failed to create auth user' });
    if (!authData.user) throw new Error("User creation did not return a user object.");

    const profileData: Omit<Employee, 'id'> & { id: string } = {
        ...employeeData,
        id: authData.user.id,
        updated_at: new Date().toISOString()
    };
    
    const snakeCaseProfile = convertKeysToSnakeCase(profileData);
    const { data: profile, error: profileError } = await supabase.from('employees').insert([snakeCaseProfile] as any).select().single();
    handleSupabaseError({ error: profileError, customMessage: 'Failed to create employee profile' });

    if (!profile) {
        throw new Error("Failed to create employee profile: insert operation did not return the new profile.");
    }

    return profile as Employee;
};

export const addBulkEmployees = async (newEmployees: Partial<Employee>[]): Promise<void> => {
    const snakeCaseEmployees = convertKeysToSnakeCase(newEmployees);
    const { error } = await supabase.from('employees').insert(snakeCaseEmployees as any);
    handleSupabaseError({ error, customMessage: 'Failed to bulk insert employees' });
};

export const updateEmployee = async (updatedEmployee: Employee): Promise<Employee> => {
    const { id, ...updateData } = updatedEmployee;
    const snakeCaseData = convertKeysToSnakeCase({ ...updateData, updated_at: new Date().toISOString() });
    const { data, error } = await supabase.from('employees').update(snakeCaseData as any).eq('id', id).select().single();
    handleSupabaseError({ error, customMessage: `Failed to update employee ${id}` });
    if (!data) throw new Error('Update did not return data.');
    return data as Employee;
};

export const deleteEmployee = async (id: string): Promise<void> => {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    handleSupabaseError({ error, customMessage: `Failed to delete employee ${id}` });
};

export const getAllEmployees = getEmployees;

// Time Logs
export const getEmployeeTimeLogs = async (employeeId: string): Promise<TimeLog[]> => {
    const { data, error } = await supabase.from('time_logs').select('*').eq('employee_id', employeeId).order('clock_in', { ascending: false });
    handleSupabaseError({ error, customMessage: 'Failed to fetch time logs' });
    if (data && data.length > 0) return data as TimeLog[];
    console.warn(`No time logs in Supabase for employee ${employeeId}. Using mock data.`);
    return MockData.mockTimeLogs.filter(log => log.employeeId === employeeId);
};
export const addTimeLog = async (logData: Omit<TimeLog, 'id'>) => {
    const snakeCaseData = convertKeysToSnakeCase(logData);
    const { data, error } = await supabase.from('time_logs').insert([snakeCaseData] as any).select().single();
    handleSupabaseError({ error, customMessage: 'Failed to add time log' });
    return data as TimeLog;
};

// Generic CRUD factory
const createCrud = <T extends { id: string }>(tableName: string, mockDataArray: T[]) => ({
    getAll: async (): Promise<T[]> => {
        const { data, error } = await supabase.from(tableName).select('*');
        handleSupabaseError({ error, customMessage: `Failed to fetch all from ${tableName}` });
        if (data && data.length > 0) return data as T[];
        console.warn(`Supabase '${tableName}' table is empty. Using mock data for demonstration.`);
        return mockDataArray;
    },
    getById: async (id: string): Promise<T | null> => {
        const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single();
         if (error && error.code !== 'PGRST116') {
             handleSupabaseError({ error, customMessage: `Failed to fetch ${id} from ${tableName}` });
         }
        if (data) return data as T;
        console.warn(`${id} not found in Supabase '${tableName}'. Trying mock data.`);
        return mockDataArray.find(item => item.id === id) || null;
    },
    add: async (itemData: Omit<T, 'id'>): Promise<T> => {
        const snakeCaseData = convertKeysToSnakeCase(itemData);
        const { data, error } = await supabase.from(tableName).insert([snakeCaseData] as any).select().single();
        handleSupabaseError({ error, customMessage: `Failed to add to ${tableName}` });
        if (!data) throw new Error(`Add operation on ${tableName} did not return data.`);
        return data as T;
    },
    update: async (updatedItem: T): Promise<T> => {
        const { id, ...updateData } = updatedItem;
        const snakeCaseData = convertKeysToSnakeCase(updateData);
        const { data, error } = await supabase.from(tableName).update(snakeCaseData as any).eq('id', id).select().single();
        handleSupabaseError({ error, customMessage: `Failed to update ${id} in ${tableName}` });
        if (!data) throw new Error(`Update operation on ${tableName} did not return data.`);
        return data as T;
    },
    remove: async (id: string): Promise<void> => {
        const { error } = await supabase.from(tableName).delete().eq('id', id);
        handleSupabaseError({ error, customMessage: `Failed to remove ${id} from ${tableName}` });
    },
});

// Inventory
export const getInventoryItems = async (category?: string): Promise<InventoryItem[]> => {
    let query = supabase.from('inventory_items').select('*');
    if (category) {
        query = query.eq('category', category);
    }
    const { data, error } = await query;
    handleSupabaseError({ error, customMessage: 'Failed to fetch inventory items' });
    if (data && data.length > 0) return data as InventoryItem[];
    
    console.warn(`Supabase 'inventory_items' is empty. Using mock data.`);
    let mockItems = MockData.mockInventoryItems;
    if (category) {
        mockItems = mockItems.filter(item => item.category === category);
    }
    return mockItems;
};
export const addInventoryItem = createCrud<InventoryItem>('inventory_items', MockData.mockInventoryItems).add;
export const updateInventoryItem = createCrud<InventoryItem>('inventory_items', MockData.mockInventoryItems).update;
export const deleteInventoryItem = createCrud<InventoryItem>('inventory_items', MockData.mockInventoryItems).remove;

// Stock Transactions
export const getStockTransactions = async (): Promise<StockTransaction[]> => {
    const { data, error } = await supabase.from('stock_transactions').select('*').order('date', { ascending: false });
    handleSupabaseError({ error, customMessage: 'Failed to fetch stock transactions' });
    if (data && data.length > 0) return data as StockTransaction[];
    console.warn("Supabase 'stock_transactions' is empty. Using mock data.");
    return MockData.mockStockTransactions;
}
export const getInventoryItemTransactions = async (itemId: string): Promise<StockTransaction[]> => {
    const { data, error } = await supabase.from('stock_transactions').select('*').eq('item_id', itemId).order('date', { ascending: false });
    handleSupabaseError({ error, customMessage: `Failed to fetch transactions for item ${itemId}` });
    if (data && data.length > 0) return data as StockTransaction[];
    console.warn(`No transactions in Supabase for item ${itemId}. Using mock data.`);
    return MockData.mockStockTransactions.filter(t => t.itemId === itemId);
};
export const addStockTransaction = async (transactionData: Omit<StockTransaction, 'id'>): Promise<StockTransaction> => {
    // This is a special case using an RPC function to also update inventory quantity
    const { data, error } = await supabase.rpc('add_stock_transaction', {
        item_id: transactionData.itemId,
        item_name: transactionData.itemName,
        transaction_type: transactionData.type,
        quantity_change: transactionData.quantity,
        reason_text: transactionData.reason,
        transaction_date: transactionData.date,
        employee_id: transactionData.employeeId,
        employee_name: transactionData.employeeName,
    } as any);
    handleSupabaseError({ error, customMessage: 'Failed to add stock transaction via RPC' });
    // Note: RPC might not return the inserted row; this might need adjustment based on RPC definition
    return { ...transactionData, id: `rpc-${Date.now()}` } as StockTransaction; // Mock return
};

// Purchase Orders
const purchaseOrderCrud = createCrud<PurchaseOrder>('purchase_orders', MockData.mockPurchaseOrders);
export const getPurchaseOrders = purchaseOrderCrud.getAll;
export const addPurchaseOrder = purchaseOrderCrud.add;
export const updatePurchaseOrder = purchaseOrderCrud.update;
export const deletePurchaseOrder = purchaseOrderCrud.remove;
export const getAllPurchaseOrders = getPurchaseOrders;

// Documents
const documentCrud = createCrud<Document>('documents', MockData.mockDocuments);
export const getDocuments = documentCrud.getAll;
export const addDocument = documentCrud.add;
export const updateDocument = documentCrud.update;
export const deleteDocument = documentCrud.remove;

// Calendar Events
const calendarEventCrud = createCrud<CalendarEvent>('calendar_events', MockData.mockCalendarEvents);
export const getCalendarEvents = calendarEventCrud.getAll;
export const addCalendarEvent = calendarEventCrud.add;
export const updateCalendarEvent = calendarEventCrud.update;
export const deleteCalendarEvent = calendarEventCrud.remove;

// Settings
export const getSetting = async (key: string): Promise<any> => {
    const { data, error } = await supabase.from('settings').select('value').eq('key', key).single();
    if (error && error.code !== 'PGRST116') {
        handleSupabaseError({ error, customMessage: `Failed to get setting: ${key}` });
    }
    return data ? data.value : null;
};
export const saveSetting = async (key: string, value: any): Promise<void> => {
    const { error } = await supabase.from('settings').upsert([{ key, value }], { onConflict: 'key' });
    handleSupabaseError({ error, customMessage: `Failed to save setting: ${key}` });
};

// Payroll Runs
export const getPayrollRuns = async (): Promise<PayrollRun[]> => {
    const { data, error } = await supabase.from('payroll_runs').select('*').order('period_year', { ascending: false }).order('period_month', { ascending: false });
    handleSupabaseError({ error, customMessage: 'Failed to fetch payroll runs' });
    if(data && data.length > 0) return data as PayrollRun[];
    console.warn("Supabase 'payroll_runs' is empty. Using mock data.");
    return MockData.mockPayrollRuns;
};
export const getPayrollRunById = createCrud<PayrollRun>('payroll_runs', MockData.mockPayrollRuns).getById;
export const addPayrollRun = createCrud<PayrollRun>('payroll_runs', MockData.mockPayrollRuns).add;
export const updatePayrollRun = createCrud<PayrollRun>('payroll_runs', MockData.mockPayrollRuns).update;
export const deletePayrollRun = async (runId: string): Promise<void> => {
    const { error: payslipError } = await supabase.from('payslips').delete().eq('payroll_run_id', runId);
    handleSupabaseError({ error: payslipError, customMessage: 'Failed to delete payslips for run' });
    const { error: runError } = await supabase.from('payroll_runs').delete().eq('id', runId);
    handleSupabaseError({ error: runError, customMessage: 'Failed to delete payroll run' });
};

// Payslips
export const getPayslipsForRun = async (runId: string): Promise<Payslip[]> => {
    const { data, error } = await supabase.from('payslips').select('*').eq('payroll_run_id', runId);
    handleSupabaseError({ error, customMessage: 'Failed to fetch payslips for run' });
    if(data && data.length > 0) return data as Payslip[];
    console.warn(`No payslips in Supabase for run ${runId}. Using mock data.`);
    return MockData.mockPayslips.filter(p => p.payrollRunId === runId);
};
export const getPayslipsForEmployee = async (employeeId: string): Promise<Payslip[]> => {
    const { data, error } = await supabase.from('payslips').select('*').eq('employee_id', employeeId);
    handleSupabaseError({ error, customMessage: 'Failed to fetch payslips for employee' });
    if(data && data.length > 0) return data as Payslip[];
    console.warn(`No payslips in Supabase for employee ${employeeId}. Using mock data.`);
    return MockData.mockPayslips.filter(p => p.employeeId === employeeId);
};
export const addPayslip = createCrud<Payslip>('payslips', MockData.mockPayslips).add;
export const updatePayslip = createCrud<Payslip>('payslips', MockData.mockPayslips).update;
export const deletePayslip = createCrud<Payslip>('payslips', MockData.mockPayslips).remove;

// Payroll Components
export const getPayrollComponents = async(): Promise<PayrollComponent[]> => {
    const { data, error } = await supabase.from('payroll_components').select('*');
    handleSupabaseError({ error, customMessage: 'Failed to fetch payroll components' });
    if(data && data.length > 0) return data as PayrollComponent[];
    console.warn("Supabase 'payroll_components' is empty. Using default components from constants.");
    return DEFAULT_PAYROLL_COMPONENTS;
};
export const addPayrollComponent = createCrud<PayrollComponent>('payroll_components', MockData.mockPayrollComponents).add;
export const updatePayrollComponent = createCrud<PayrollComponent>('payroll_components', MockData.mockPayrollComponents).update;
export const deletePayrollComponent = createCrud<PayrollComponent>('payroll_components', MockData.mockPayrollComponents).remove;
export const getAllPayrollComponents = getPayrollComponents;

// Leave Requests
export const getLeaveRequests = async (): Promise<LeaveRequest[]> => {
    const { data, error } = await supabase.from('leave_requests').select('*').order('requested_date', { ascending: false });
    handleSupabaseError({ error, customMessage: 'Failed to fetch leave requests' });
    if(data && data.length > 0) return data as LeaveRequest[];
    console.warn("Supabase 'leave_requests' is empty. Using mock data.");
    return MockData.mockLeaveRequests;
};
export const addLeaveRequest = createCrud<LeaveRequest>('leave_requests', MockData.mockLeaveRequests).add;
export const updateLeaveRequest = createCrud<LeaveRequest>('leave_requests', MockData.mockLeaveRequests).update;
export const deleteLeaveRequest = createCrud<LeaveRequest>('leave_requests', MockData.mockLeaveRequests).remove;
export const getAllLeaveRequests = getLeaveRequests;

// Chat
export const getChatMessages = async (roomId: string): Promise<ChatMessage[]> => {
    const { data, error } = await supabase.from('chat_messages').select('*').eq('room_id', roomId).order('timestamp', { ascending: true });
    handleSupabaseError({ error, customMessage: 'Failed to fetch chat messages' });
    if(data && data.length > 0) return data as ChatMessage[];
    console.warn(`No messages in Supabase for room ${roomId}. Using mock data.`);
    return MockData.mockChatMessages.filter(m => m.roomId === roomId);
};
export const addChatMessage = createCrud<ChatMessage>('chat_messages', MockData.mockChatMessages).add;

// Cash Advance
export const getCashAdvanceRequests = async (): Promise<CashAdvanceRequest[]> => {
    const { data, error } = await supabase.from('cash_advance_requests').select('*').order('request_date', { ascending: false });
    handleSupabaseError({ error, customMessage: 'Failed to fetch cash advance requests' });
    if(data && data.length > 0) return data as CashAdvanceRequest[];
    console.warn("Supabase 'cash_advance_requests' is empty. Using mock data.");
    return MockData.mockCashAdvanceRequests;
};
export const addCashAdvanceRequest = createCrud<CashAdvanceRequest>('cash_advance_requests', MockData.mockCashAdvanceRequests).add;
export const updateCashAdvanceRequest = createCrud<CashAdvanceRequest>('cash_advance_requests', MockData.mockCashAdvanceRequests).update;
export const deleteCashAdvanceRequest = createCrud<CashAdvanceRequest>('cash_advance_requests', MockData.mockCashAdvanceRequests).remove;

// --- Admin ---
export const getManagedUsers = async (): Promise<ManagedUser[]> => {
    const { data, error } = await supabase.rpc('get_users_with_employee_roles');
    handleSupabaseError({ error, customMessage: 'Failed to fetch managed users' });
    if(Array.isArray(data) && data.length > 0) return data as ManagedUser[];
    console.warn("Supabase 'get_users_with_employee_roles' rpc returned empty. Using mock data.");
    return MockData.mockManagedUsers;
};

export const updateUserRole = async (userId: string, newRole: UserRole): Promise<void> => {
    const snakeCaseData = convertKeysToSnakeCase({ role: newRole, updated_at: new Date().toISOString() });
    const { error } = await supabase.from('employees').update(snakeCaseData as any).eq('id', userId);
    handleSupabaseError({ error, customMessage: `Failed to update role for user ${userId}` });
};
