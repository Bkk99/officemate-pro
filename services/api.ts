// services/api.ts
import { supabase } from '../lib/supabaseClient';
import { 
    Employee, TimeLog, InventoryItem, StockTransaction, PurchaseOrder, Document, CalendarEvent, 
    PayrollRun, Payslip, PayrollComponent, LeaveRequest, ChatMessage, CashAdvanceRequest, UserRole, 
    ManagedUser
} from '../types';

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

// --- API Functions (Supabase) ---

// User Profile / Employee
export const getEmployees = async (): Promise<Employee[]> => {
    const { data, error } = await supabase.from('employees').select('*');
    handleSupabaseError({ error, customMessage: 'Failed to fetch employees' });
    return data || [];
};

export const getEmployeeById = async (id: string): Promise<Employee | null> => {
    const { data, error } = await supabase.from('employees').select('*').eq('id', id).single();
    // Allow not found error for auth checks
    if (error && error.code !== 'PGRST116') {
        handleSupabaseError({ error, customMessage: `Failed to fetch employee ${id}` });
    }
    return data;
};

// Creates auth user and profile
export const addEmployee = async (employeeData: Omit<Employee, 'id'>, password?: string): Promise<Employee> => {
    if(!password) throw new Error("Password is required to create a new employee.");
    
    // 1. Create Supabase auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: employeeData.email,
        password: password,
        options: {
            data: {
                full_name: employeeData.name,
                // role: employeeData.role, // Removing role from auth metadata to prevent potential signup conflicts
            }
        }
    });
    handleSupabaseError({ error: authError, customMessage: 'Failed to create auth user' });
    if (!authData.user) throw new Error("User creation did not return a user object.");

    // 2. Insert employee profile with the auth user's ID
    const profileData: Omit<Employee, 'id'> & { id: string } = {
        ...employeeData,
        id: authData.user.id,
        updated_at: new Date().toISOString()
    };
    
    const { data: profile, error: profileError } = await supabase.from('employees').insert([profileData]).select().single();
    handleSupabaseError({ error: profileError, customMessage: 'Failed to create employee profile' });

    return profile;
};

export const addBulkEmployees = async (newEmployees: Partial<Employee>[]): Promise<void> => {
    // This is complex with Supabase auth. For now, we'll just insert profiles.
    // In a real app, this should be a server-side function.
    const { error } = await supabase.from('employees').insert(newEmployees as any);
    handleSupabaseError({ error, customMessage: 'Failed to bulk insert employees' });
};

export const updateEmployee = async (updatedEmployee: Employee): Promise<Employee> => {
    const { id, ...updateData } = updatedEmployee;
    const { data, error } = await supabase.from('employees').update({ ...updateData, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    handleSupabaseError({ error, customMessage: `Failed to update employee ${id}` });
    return data;
};

export const deleteEmployee = async (id: string): Promise<void> => {
    // Note: This only deletes the profile, not the auth.user. 
    // Deleting auth users should be a protected server-side operation.
    const { error } = await supabase.from('employees').delete().eq('id', id);
    handleSupabaseError({ error, customMessage: `Failed to delete employee ${id}` });
};

export const getAllEmployees = getEmployees;

// Generic CRUD factory
const createCrud = <T extends { id: string }>(tableName: string) => ({
    getAll: async (): Promise<T[]> => {
        const { data, error } = await supabase.from(tableName).select('*');
        handleSupabaseError({ error, customMessage: `Failed to fetch all from ${tableName}` });
        return data || [];
    },
    getById: async (id: string): Promise<T | null> => {
        const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single();
        handleSupabaseError({ error, customMessage: `Failed to fetch ${id} from ${tableName}` });
        return data;
    },
    add: async (itemData: Omit<T, 'id'>): Promise<T> => {
        const { data, error } = await supabase.from(tableName).insert([itemData] as any).select().single();
        handleSupabaseError({ error, customMessage: `Failed to add to ${tableName}` });
        return data;
    },
    update: async (updatedItem: T): Promise<T> => {
        const { id, ...updateData } = updatedItem;
        const { data, error } = await supabase.from(tableName).update(updateData as any).eq('id', id).select().single();
        handleSupabaseError({ error, customMessage: `Failed to update ${id} in ${tableName}` });
        return data;
    },
    remove: async (id: string): Promise<void> => {
        const { error } = await supabase.from(tableName).delete().eq('id', id);
        handleSupabaseError({ error, customMessage: `Failed to remove ${id} from ${tableName}` });
    },
});

// Time Logs
export const getEmployeeTimeLogs = async (employeeId: string): Promise<TimeLog[]> => {
    const { data, error } = await supabase.from('time_logs').select('*').eq('employeeId', employeeId).order('clockIn', { ascending: false });
    handleSupabaseError({ error, customMessage: 'Failed to fetch time logs' });
    return data || [];
};
export const addTimeLog = async (logData: Omit<TimeLog, 'id'>) => {
    const { data, error } = await supabase.from('time_logs').insert([logData]).select().single();
    handleSupabaseError({ error, customMessage: 'Failed to add time log' });
    return data;
};

// Inventory
export const getInventoryItems = async (category?: string): Promise<InventoryItem[]> => {
    let query = supabase.from('inventory_items').select('*');
    if (category) {
        query = query.eq('category', category);
    }
    const { data, error } = await query;
    handleSupabaseError({ error, customMessage: 'Failed to fetch inventory items' });
    return data || [];
};
export const addInventoryItem = createCrud<InventoryItem>('inventory_items').add;
export const updateInventoryItem = createCrud<InventoryItem>('inventory_items').update;
export const deleteInventoryItem = createCrud<InventoryItem>('inventory_items').remove;

// Stock Transactions
export const getStockTransactions = createCrud<StockTransaction>('stock_transactions').getAll;
export const getInventoryItemTransactions = async (itemId: string): Promise<StockTransaction[]> => {
    const { data, error } = await supabase.from('stock_transactions').select('*').eq('itemId', itemId).order('date', { ascending: false });
    handleSupabaseError({ error, customMessage: `Failed to fetch transactions for item ${itemId}` });
    return data || [];
};
export const addStockTransaction = async (txData: Omit<StockTransaction, 'id'>) => {
    // This should be a transaction in a real backend.
    const { data: newTx, error: txError } = await supabase.from('stock_transactions').insert([txData]).select().single();
    handleSupabaseError({ error: txError, customMessage: 'Failed to add stock transaction' });

    const { data: item, error: itemError } = await supabase.from('inventory_items').select('quantity').eq('id', newTx.itemId).single();
    handleSupabaseError({ error: itemError, customMessage: `Failed to fetch item for stock update` });

    if (item) {
        const newQuantity = item.quantity + (newTx.type === 'IN' ? newTx.quantity : -newTx.quantity);
        const { error: updateError } = await supabase.from('inventory_items').update({ quantity: newQuantity, lastUpdated: new Date().toISOString() }).eq('id', newTx.itemId);
        handleSupabaseError({ error: updateError, customMessage: `Failed to update item quantity` });
    }
    return newTx;
};

// Purchase Orders
const poCrud = createCrud<PurchaseOrder>('purchase_orders');
export const getPurchaseOrders = poCrud.getAll;
export const addPurchaseOrder = poCrud.add;
export const updatePurchaseOrder = poCrud.update;
export const deletePurchaseOrder = poCrud.remove;
export const getAllPurchaseOrders = getPurchaseOrders;

// Documents
const documentCrud = createCrud<Document>('documents');
export const getDocuments = documentCrud.getAll;
export const addDocument = documentCrud.add;
export const updateDocument = documentCrud.update;
export const deleteDocument = documentCrud.remove;

// Chat
export const getChatMessages = async (roomId: string): Promise<ChatMessage[]> => {
    const { data, error } = await supabase.from('chat_messages').select('*').eq('roomId', roomId).order('timestamp', { ascending: true });
    handleSupabaseError({ error, customMessage: 'Failed to fetch chat messages' });
    return data || [];
};
export const addChatMessage = createCrud<ChatMessage>('chat_messages').add;

// Calendar
const calendarEventCrud = createCrud<CalendarEvent>('calendar_events');
export const getCalendarEvents = calendarEventCrud.getAll;
export const addCalendarEvent = calendarEventCrud.add;
export const updateCalendarEvent = calendarEventCrud.update;
export const deleteCalendarEvent = calendarEventCrud.remove;

// Leave Requests
const leaveRequestCrud = createCrud<LeaveRequest>('leave_requests');
export const getLeaveRequests = leaveRequestCrud.getAll;
export const addLeaveRequest = leaveRequestCrud.add;
export const updateLeaveRequest = leaveRequestCrud.update;
export const deleteLeaveRequest = leaveRequestCrud.remove;
export const getAllLeaveRequests = getLeaveRequests;

// Cash Advance
const cashAdvanceCrud = createCrud<CashAdvanceRequest>('cash_advance_requests');
export const getCashAdvanceRequests = cashAdvanceCrud.getAll;
export const addCashAdvanceRequest = cashAdvanceCrud.add;
export const updateCashAdvanceRequest = cashAdvanceCrud.update;
export const deleteCashAdvanceRequest = cashAdvanceCrud.remove;

// Payroll
const payrollComponentCrud = createCrud<PayrollComponent>('payroll_components');
const payrollRunCrud = createCrud<PayrollRun>('payroll_runs');
const payslipCrud = createCrud<Payslip>('payslips');
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
    // This should be a database transaction
    const run = await getPayrollRunById(runId);
    if (!run) {
        throw new Error(`Payroll run with ID ${runId} not found.`);
    }
    
    if (run.payslipIds && run.payslipIds.length > 0) {
        const { error: payslipError } = await supabase.from('payslips').delete().in('id', run.payslipIds);
        handleSupabaseError({ error: payslipError, customMessage: 'Failed to delete associated payslips' });
    }
    
    const { error: deleteRunError } = await supabase.from('payroll_runs').delete().eq('id', runId);
    handleSupabaseError({ error: deleteRunError, customMessage: 'Failed to delete payroll run' });
};

export const getPayslipsForRun = async (runId: string): Promise<Payslip[]> => {
    const { data, error } = await supabase.from('payslips').select('*').eq('payrollRunId', runId);
    handleSupabaseError({ error, customMessage: 'Failed to fetch payslips for run' });
    return data || [];
};
export const getPayslipsForEmployee = async (employeeId: string): Promise<Payslip[]> => {
    const { data, error } = await supabase.from('payslips').select('*').eq('employeeId', employeeId);
    handleSupabaseError({ error, customMessage: 'Failed to fetch payslips for employee' });
    return data || [];
};
export const addPayslip = payslipCrud.add;
export const updatePayslip = payslipCrud.update;
export const deletePayslip = payslipCrud.remove;

// Settings
export const getSetting = async (key: string): Promise<any | null> => {
    const { data, error } = await supabase.from('settings').select('value').eq('key', key).single();
    if (error && error.code !== 'PGRST116') { // Ignore "Row not found"
        handleSupabaseError({ error, customMessage: `Failed to get setting ${key}` });
    }
    return data ? data.value : null;
};
export const saveSetting = async (key: string, value: any): Promise<void> => {
    const { error } = await supabase.from('settings').upsert({ key, value });
    handleSupabaseError({ error, customMessage: `Failed to save setting ${key}` });
};

// User Management (Admin)
export const getManagedUsers = async (): Promise<ManagedUser[]> => {
    // This should ideally come from a view or auth.users, but based on previous structure:
    const { data, error } = await supabase.from('employees').select('id, name, email, role, updated_at');
    handleSupabaseError({ error, customMessage: `Failed to get managed users` });
    return (data || []).map(u => ({
        id: u.id,
        full_name: u.name,
        username: u.email,
        role: u.role,
        updated_at: u.updated_at
    }));
};
export const updateUserRole = async (userId: string, role: UserRole): Promise<void> => {
    // This updates the role in our public `employees` table.
    // Syncing with auth.users.role would need a server-side trigger.
    const { error } = await supabase.from('employees').update({ role, updated_at: new Date().toISOString() }).eq('id', userId);
    handleSupabaseError({ error, customMessage: `Failed to update user role` });
};