// services/api.ts
import { supabase } from '../lib/supabaseClient';
import { User, Employee, TimeLog, InventoryItem, StockTransaction, PurchaseOrder, Document, CalendarEvent, PayrollRun, Payslip, PayrollComponent, LeaveRequest, ChatMessage, CashAdvanceRequest, Json, UserRole, ManagedUser, Database } from '../types';

// --- Helper Functions ---
const handleApiError = (error: any, context: string) => {
    console.error(`Supabase error in ${context}:`, error);
    throw new Error(`Failed to ${context}. ${error.message}`);
};

// --- API Functions (Live Supabase) ---

// User Profiles
export const getUserProfile = async (userId: string): Promise<User | null> => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) handleApiError(error, `fetch profile for user ${userId}`);
    
    const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('department')
        .eq('email', data?.username || '')
        .single();

    return data ? {
        id: data.id,
        username: data.username || '',
        name: data.full_name || 'No Name',
        role: data.role || UserRole.STAFF,
        department: employeeData?.department || undefined
    } : null;
};

export const getAllUserProfiles = async (): Promise<User[]> => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) handleApiError(error, 'fetch all profiles');
    return (data || []).map(p => ({
        id: p.id,
        username: p.username || '',
        name: p.full_name || 'No Name',
        role: p.role || UserRole.STAFF,
    }));
};

// Employees
export const getEmployees = async (): Promise<Employee[]> => {
    const { data, error } = await supabase.from('employees').select('*').order('created_at', { ascending: false });
    if (error) handleApiError(error, 'fetch employees');
    return (data || []).map(e => ({...e, recurringAllowances: (e.recurring_allowances as any) || [], recurringDeductions: (e.recurring_deductions as any) || []}));
};
export const getEmployeeById = async (id: string): Promise<Employee | null> => {
    const { data, error } = await supabase.from('employees').select('*').eq('id', id).single();
    if (error) handleApiError(error, `fetch employee ${id}`);
    return data ? {...data, recurringAllowances: (data.recurring_allowances as any) || [], recurringDeductions: (data.recurring_deductions as any) || []} : null;
};
export const addEmployee = async (employeeData: Omit<Employee, 'id'>): Promise<Employee> => {
    const { data, error } = await supabase.from('employees').insert([employeeData]).select().single();
    if (error) handleApiError(error, 'add employee');
    return data;
};
export const addBulkEmployees = async (employees: Database['public']['Tables']['employees']['Insert'][]): Promise<void> => {
    const { error } = await supabase.from('employees').insert(employees);
    if (error) handleApiError(error, 'bulk add employees');
};
export const updateEmployee = async (updatedEmployee: Employee): Promise<Employee> => {
    const { id, ...updateData } = updatedEmployee;
    const { data, error } = await supabase.from('employees').update(updateData).eq('id', id).select().single();
    if (error) handleApiError(error, `update employee ${id}`);
    return data;
};
export const deleteEmployee = async (id: string): Promise<void> => {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) handleApiError(error, `delete employee ${id}`);
};
export const getAllEmployees = getEmployees;

// Time Logs
export const getEmployeeTimeLogs = async (employeeId: string): Promise<TimeLog[]> => {
    const { data, error } = await supabase.from('time_logs').select('*').eq('employee_id', employeeId).order('clock_in', { ascending: false });
    if (error) handleApiError(error, `fetch time logs for employee ${employeeId}`);
    return data || [];
};
export const addTimeLog = async (logData: Omit<TimeLog, 'id'>): Promise<TimeLog> => {
    const { data, error } = await supabase.from('time_logs').insert([logData]).select().single();
    if (error) handleApiError(error, 'add time log');
    return data;
};

// Inventory
export const getInventoryItems = async (category?: 'อุปกรณ์ IT' | 'General'): Promise<InventoryItem[]> => {
    let query = supabase.from('inventory_items').select('*');
    if (category) {
        query = query.eq('category', category);
    }
    const { data, error } = await query.order('name', { ascending: true });
    if (error) handleApiError(error, `fetch inventory items (category: ${category})`);
    return data || [];
};
export const getStockTransactions = async (): Promise<StockTransaction[]> => {
    const { data, error } = await supabase.from('stock_transactions').select('*').order('date', { ascending: false });
    if (error) handleApiError(error, 'fetch all stock transactions');
    return data || [];
};
export const getInventoryItemTransactions = async (itemId: string): Promise<StockTransaction[]> => {
    const { data, error } = await supabase.from('stock_transactions').select('*').eq('item_id', itemId).order('date', { ascending: false });
    if (error) handleApiError(error, `fetch transactions for item ${itemId}`);
    return data || [];
};
export const addInventoryItem = async (itemData: Omit<InventoryItem, 'id' | 'lastUpdated'>): Promise<InventoryItem> => {
    const { data, error } = await supabase.from('inventory_items').insert([itemData]).select().single();
    if (error) handleApiError(error, 'add inventory item');
    return data;
};
export const updateInventoryItem = async (updatedItem: InventoryItem): Promise<InventoryItem> => {
    const { id, lastUpdated, ...updateData } = updatedItem;
    const { data, error } = await supabase.from('inventory_items').update({ ...updateData, last_updated: new Date().toISOString() }).eq('id', id).select().single();
    if (error) handleApiError(error, `update inventory item ${id}`);
    return data;
};
export const deleteInventoryItem = async (id: string): Promise<void> => {
    const { error } = await supabase.from('inventory_items').delete().eq('id', id);
    if (error) handleApiError(error, `delete inventory item ${id}`);
};
export const addStockTransaction = async (transactionData: Omit<StockTransaction, 'id' | 'date'>): Promise<StockTransaction> => {
    const { data, error } = await supabase.from('stock_transactions').insert([{ ...transactionData, date: new Date().toISOString() }]).select().single();
    if (error) handleApiError(error, 'add stock transaction');
    
    // Also update inventory item quantity
    const { error: updateError } = await supabase.rpc('add_stock_transaction', {
      p_item_id: transactionData.itemId,
      p_item_name: transactionData.itemName,
      p_type: transactionData.type,
      p_quantity: transactionData.quantity,
      p_reason: transactionData.reason,
      p_employee_id: transactionData.employeeId,
      p_employee_name: transactionData.employeeName,
    });
    if (updateError) handleApiError(updateError, `update inventory quantity for item ${transactionData.itemId}`);

    return data;
};

// Purchase Orders
export const getPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
    const { data, error } = await supabase.from('purchase_orders').select('*').order('order_date', { ascending: false });
    if (error) handleApiError(error, 'fetch purchase orders');
    return data || [];
};
export const addPurchaseOrder = async (poData: Omit<PurchaseOrder, 'id'>): Promise<PurchaseOrder> => {
    const { data, error } = await supabase.from('purchase_orders').insert([poData]).select().single();
    if (error) handleApiError(error, 'add purchase order');
    return data;
};
export const updatePurchaseOrder = async (po: PurchaseOrder): Promise<PurchaseOrder> => {
    const { id, ...updateData } = po;
    const { data, error } = await supabase.from('purchase_orders').update(updateData).eq('id', id).select().single();
    if (error) handleApiError(error, `update purchase order ${id}`);
    return data;
};
export const deletePurchaseOrder = async (id: string): Promise<void> => {
    const { error } = await supabase.from('purchase_orders').delete().eq('id', id);
    if (error) handleApiError(error, `delete purchase order ${id}`);
};
export const getAllPurchaseOrders = getPurchaseOrders;

// Documents
export const getDocuments = async (): Promise<Document[]> => {
    const { data, error } = await supabase.from('documents').select('*').order('date', { ascending: false });
    if (error) handleApiError(error, 'fetch documents');
    return data || [];
};
export const addDocument = async (doc: Omit<Document, 'id'>): Promise<Document> => {
    const { data, error } = await supabase.from('documents').insert([doc]).select().single();
    if (error) handleApiError(error, 'add document');
    return data;
};
export const updateDocument = async (doc: Document): Promise<Document> => {
    const { id, ...updateData } = doc;
    const { data, error } = await supabase.from('documents').update(updateData).eq('id', id).select().single();
    if (error) handleApiError(error, `update document ${id}`);
    return data;
};
export const deleteDocument = async (id: string): Promise<void> => {
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) handleApiError(error, `delete document ${id}`);
};

// Chat
export const getChatMessages = async (roomId: string): Promise<ChatMessage[]> => {
    const { data, error } = await supabase.from('chat_messages').select('*').eq('room_id', roomId).order('timestamp', { ascending: true });
    if (error) handleApiError(error, `fetch chat messages for room ${roomId}`);
    return data || [];
};
export const addChatMessage = async (msg: Omit<ChatMessage, 'id'>): Promise<ChatMessage> => {
    const { data, error } = await supabase.from('chat_messages').insert([msg]).select().single();
    if (error) handleApiError(error, 'add chat message');
    return data;
};

// Calendar Events
export const getCalendarEvents = async (): Promise<CalendarEvent[]> => {
    const { data, error } = await supabase.from('calendar_events').select('*').order('start', { ascending: true });
    if (error) handleApiError(error, 'fetch calendar events');
    return data || [];
};
export const addCalendarEvent = async (event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> => {
    const { data, error } = await supabase.from('calendar_events').insert([event]).select().single();
    if (error) handleApiError(error, 'add calendar event');
    return data;
};
export const updateCalendarEvent = async (event: CalendarEvent): Promise<CalendarEvent> => {
    const { id, ...updateData } = event;
    const { data, error } = await supabase.from('calendar_events').update(updateData).eq('id', id).select().single();
    if (error) handleApiError(error, `update calendar event ${id}`);
    return data;
};
export const deleteCalendarEvent = async (id: string): Promise<void> => {
    const { error } = await supabase.from('calendar_events').delete().eq('id', id);
    if (error) handleApiError(error, `delete calendar event ${id}`);
};

// Leave Requests
export const getLeaveRequests = async (): Promise<LeaveRequest[]> => {
    const { data, error } = await supabase.from('leave_requests').select('*').order('requested_date', { ascending: false });
    if (error) handleApiError(error, 'fetch leave requests');
    return data || [];
};
export const addLeaveRequest = async (req: Omit<LeaveRequest, 'id'>): Promise<LeaveRequest> => {
    const { data, error } = await supabase.from('leave_requests').insert([req]).select().single();
    if (error) handleApiError(error, 'add leave request');
    return data;
};
export const updateLeaveRequest = async (req: LeaveRequest): Promise<LeaveRequest> => {
    const { id, ...updateData } = req;
    const { data, error } = await supabase.from('leave_requests').update(updateData).eq('id', id).select().single();
    if (error) handleApiError(error, `update leave request ${id}`);
    return data;
};
export const deleteLeaveRequest = async (id: string): Promise<void> => {
    const { error } = await supabase.from('leave_requests').delete().eq('id', id);
    if (error) handleApiError(error, `delete leave request ${id}`);
};
export const getAllLeaveRequests = getLeaveRequests;


// Cash Advance
export const getCashAdvanceRequests = async (): Promise<CashAdvanceRequest[]> => {
    const { data, error } = await supabase.from('cash_advance_requests').select('*').order('request_date', { ascending: false });
    if (error) handleApiError(error, 'fetch cash advance requests');
    return data || [];
};
export const addCashAdvanceRequest = async (req: Omit<CashAdvanceRequest, 'id'>): Promise<CashAdvanceRequest> => {
    const { data, error } = await supabase.from('cash_advance_requests').insert([req]).select().single();
    if (error) handleApiError(error, 'add cash advance request');
    return data;
};
export const updateCashAdvanceRequest = async (req: CashAdvanceRequest): Promise<CashAdvanceRequest> => {
    const { id, ...updateData } = req;
    const { data, error } = await supabase.from('cash_advance_requests').update(updateData).eq('id', id).select().single();
    if (error) handleApiError(error, `update cash advance request ${id}`);
    return data;
};
export const deleteCashAdvanceRequest = async (id: string): Promise<void> => {
    const { error } = await supabase.from('cash_advance_requests').delete().eq('id', id);
    if (error) handleApiError(error, `delete cash advance request ${id}`);
};

// Payroll
export const getPayrollComponents = async (): Promise<PayrollComponent[]> => {
    const { data, error } = await supabase.from('payroll_components').select('*');
    if (error) handleApiError(error, 'fetch payroll components');
    return data || [];
};
export const addPayrollComponent = async (comp: Omit<PayrollComponent, 'id'>): Promise<PayrollComponent> => {
    const { data, error } = await supabase.from('payroll_components').insert([comp]).select().single();
    if (error) handleApiError(error, 'add payroll component');
    return data;
};
export const updatePayrollComponent = async (comp: PayrollComponent): Promise<PayrollComponent> => {
    const { id, ...updateData } = comp;
    const { data, error } = await supabase.from('payroll_components').update(updateData).eq('id', id).select().single();
    if (error) handleApiError(error, `update payroll component ${id}`);
    return data;
};
export const deletePayrollComponent = async (id: string): Promise<void> => {
    const { error } = await supabase.from('payroll_components').delete().eq('id', id);
    if (error) handleApiError(error, `delete payroll component ${id}`);
};
export const getAllPayrollComponents = getPayrollComponents;

export const getPayrollRuns = async (): Promise<PayrollRun[]> => {
    const { data, error } = await supabase.from('payroll_runs').select('*').order('date_created', { ascending: false });
    if (error) handleApiError(error, 'fetch payroll runs');
    return data || [];
};
export const getPayrollRunById = async (id: string): Promise<PayrollRun | null> => {
    const { data, error } = await supabase.from('payroll_runs').select('*').eq('id', id).single();
    if (error) {
        // Don't throw if not found, just return null
        if (error.code === 'PGRST116') return null; 
        handleApiError(error, `fetch payroll run ${id}`);
    }
    return data;
};
export const addPayrollRun = async (run: Omit<PayrollRun, 'id'>): Promise<PayrollRun> => {
    const { data, error } = await supabase.from('payroll_runs').insert([run]).select().single();
    if (error) handleApiError(error, 'add payroll run');
    return data;
};
export const updatePayrollRun = async (run: Partial<PayrollRun> & {id: string}): Promise<PayrollRun> => {
    const { id, ...updateData } = run;
    const { data, error } = await supabase.from('payroll_runs').update(updateData).eq('id', id).select().single();
    if (error) handleApiError(error, `update payroll run ${id}`);
    return data;
};
export const deletePayrollRun = async (id: string): Promise<void> => {
    const { error } = await supabase.rpc('delete_payroll_run', { p_run_id: id });
    if (error) handleApiError(error, `delete payroll run ${id}`);
};
export const getPayslipsForRun = async (runId: string): Promise<Payslip[]> => {
    const { data, error } = await supabase.from('payslips').select('*').eq('payroll_run_id', runId);
    if (error) handleApiError(error, `fetch payslips for run ${runId}`);
    return (data || []).map(p => ({...p, allowances: (p.allowances as any) || [], otherDeductions: (p.other_deductions as any) || []}));
};
export const getPayslipsForEmployee = async (employeeId: string): Promise<Payslip[]> => {
    const { data, error } = await supabase.from('payslips').select('*').eq('employee_id', employeeId).order('pay_period', { ascending: false });
    if (error) handleApiError(error, `fetch payslips for employee ${employeeId}`);
    return (data || []).map(p => ({...p, allowances: (p.allowances as any) || [], otherDeductions: (p.other_deductions as any) || []}));
};
export const addPayslip = async (payslip: Payslip): Promise<void> => {
    const { error } = await supabase.from('payslips').insert([payslip]);
    if (error) handleApiError(error, 'add payslip');
};
export const updatePayslip = async (payslip: Payslip): Promise<void> => {
    const { id, ...updateData } = payslip;
    const { error } = await supabase.from('payslips').update(updateData).eq('id', id);
    if (error) handleApiError(error, `update payslip ${id}`);
};
export const deletePayslip = async (id: string): Promise<void> => {
    const { error } = await supabase.from('payslips').delete().eq('id', id);
    if (error) handleApiError(error, `delete payslip ${id}`);
};

// Settings
export const getSetting = async (key: string): Promise<any | null> => {
    const { data, error } = await supabase.from('settings').select('value').eq('key', key).single();
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found, which is fine
      handleApiError(error, `get setting ${key}`);
    }
    return data ? data.value : null;
};
export const saveSetting = async (key: string, value: any): Promise<void> => {
    const { error } = await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
    if (error) handleApiError(error, `save setting ${key}`);
};

// User Management (Admin)
export const getManagedUsers = async (): Promise<ManagedUser[]> => {
    const { data, error } = await supabase.rpc('get_all_users');
    if (error) handleApiError(error, 'get managed users via RPC');
    return data || [];
};

export const updateUserRole = async (userId: string, role: UserRole): Promise<void> => {
    const { error } = await supabase.rpc('update_user_role', { user_id_to_update: userId, new_role: role });
    if (error) handleApiError(error, `update role for user ${userId} via RPC`);
};
