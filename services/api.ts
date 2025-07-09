
// services/api.ts
import { supabase as supabaseInstance } from '../lib/supabaseClient';
import { User, Employee, TimeLog, InventoryItem, StockTransaction, PurchaseOrder, Document, CalendarEvent, PayrollRun, Payslip, PayrollComponent, LeaveRequest, ChatMessage, CashAdvanceRequest, Json, EmployeeStatusKey, POStatusKey, DocumentStatusKey, DocumentType, LeaveType, LeaveRequestStatus, CashAdvanceRequestStatus, EmployeeAllowance, EmployeeDeduction, PayslipItem, ManagedUser, UserRole } from '../types';
import { Database } from '../types';

if (!supabaseInstance) {
    throw new Error("Supabase client not initialized. Please check /lib/supabaseConfig.ts and ensure SUPABASE_URL and SUPABASE_ANON_KEY are set.");
}
const supabase = supabaseInstance;

// --- Type Aliases for DB Rows ---
type EmployeeRow = Database['public']['Tables']['employees']['Row'];
type TimeLogRow = Database['public']['Tables']['time_logs']['Row'];
type InventoryItemRow = Database['public']['Tables']['inventory_items']['Row'];
type StockTransactionRow = Database['public']['Tables']['stock_transactions']['Row'];
type PurchaseOrderRow = Database['public']['Tables']['purchase_orders']['Row'];
type DocumentRow = Database['public']['Tables']['documents']['Row'];
type CalendarEventRow = Database['public']['Tables']['calendar_events']['Row'];
type PayrollComponentRow = Database['public']['Tables']['payroll_components']['Row'];
type PayrollRunRow = Database['public']['Tables']['payroll_runs']['Row'];
type PayslipRow = Database['public']['Tables']['payslips']['Row'];
type LeaveRequestRow = Database['public']['Tables']['leave_requests']['Row'];
type ChatMessageRow = Database['public']['Tables']['chat_messages']['Row'];
type CashAdvanceRequestRow = Database['public']['Tables']['cash_advance_requests']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];


// Helper function to handle Supabase errors
const handleSupabaseError = <T>({ error, data }: { error: any, data: T }, context: string): T => {
    if (error) {
        console.error(`Error in ${context}:`, error.message);
        throw new Error(`Supabase Error: ${error.message}`);
    }
    return data;
};

// --- Mappers ---
const mapEmployeeFromDb = (r: EmployeeRow): Employee => ({
  id: r.id, name: r.name, nameEn: r.name_en || undefined, employeeCode: r.employee_code || undefined, email: r.email, phone: r.phone, department: r.department, position: r.position, status: r.status as EmployeeStatusKey, hireDate: r.hire_date, contractUrl: r.contract_url || undefined, profileImageUrl: r.profile_image_url || undefined, fingerprintScannerId: r.fingerprint_scanner_id || undefined, passportNumber: r.passport_number || undefined, passportExpiryDate: r.passport_expiry_date || undefined, baseSalary: r.base_salary || undefined, bankName: r.bank_name || undefined, bankAccountNumber: r.bank_account_number || undefined, taxId: r.tax_id || undefined, socialSecurityNumber: r.social_security_number || undefined, providentFundRateEmployee: r.provident_fund_rate_employee || undefined, providentFundRateEmployer: r.provident_fund_rate_employer || undefined, recurringAllowances: (r.recurring_allowances as unknown as EmployeeAllowance[]) || [], recurringDeductions: (r.recurring_deductions as unknown as EmployeeDeduction[]) || [],
});

// --- User Profiles ---
export const getUserProfile = async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error && error.code !== 'PGRST116') handleSupabaseError({data, error}, 'getUserProfile');
    return data;
};
export const getAllUserProfiles = async (): Promise<User[]> => {
    const { data, error } = await supabase.from('profiles').select(`id, username, full_name, role, department`);
    const profiles = handleSupabaseError({ data, error }, 'getAllUserProfiles') || [];
    return profiles.map((p: any) => ({ id: p.id, username: p.username, name: p.full_name, role: p.role, department: p.department }));
};

// --- Employees ---
export const getAllEmployees = async (): Promise<Employee[]> => {
    const { data, error } = await supabase.from('employees').select('*');
    const rows = handleSupabaseError({ data, error }, 'getAllEmployees') || [];
    return rows.map(mapEmployeeFromDb);
};
export const getEmployees = async (): Promise<Employee[]> => {
    const { data, error } = await supabase.from('employees').select('*').order('created_at', { ascending: false }).limit(100);
    const rows = handleSupabaseError({ data, error }, 'getEmployees') || [];
    return rows.map(mapEmployeeFromDb);
};
export const getEmployeeById = async (id: string): Promise<Employee | null> => {
    const { data, error } = await supabase.from('employees').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') { handleSupabaseError({data, error}, 'getEmployeeById'); return null; }
    return data ? mapEmployeeFromDb(data) : null;
};
export const addEmployee = async (employeeData: Omit<Employee, 'id'>): Promise<Employee> => {
    const dbData: Database['public']['Tables']['employees']['Insert'] = {
        name: employeeData.name,
        name_en: employeeData.nameEn || null,
        employee_code: employeeData.employeeCode || null,
        email: employeeData.email,
        phone: employeeData.phone,
        department: employeeData.department,
        position: employeeData.position,
        status: employeeData.status,
        hire_date: employeeData.hireDate,
        contract_url: employeeData.contractUrl || null,
        profile_image_url: employeeData.profileImageUrl || null,
        fingerprint_scanner_id: employeeData.fingerprintScannerId || null,
        passport_number: employeeData.passportNumber || null,
        passport_expiry_date: employeeData.passportExpiryDate || null,
        base_salary: employeeData.baseSalary || null,
        bank_name: employeeData.bankName || null,
        bank_account_number: employeeData.bankAccountNumber || null,
        tax_id: employeeData.taxId || null,
        social_security_number: employeeData.socialSecurityNumber || null,
        provident_fund_rate_employee: employeeData.providentFundRateEmployee || null,
        provident_fund_rate_employer: employeeData.providentFundRateEmployer || null,
        recurring_allowances: (employeeData.recurringAllowances as unknown as Json) || null,
        recurring_deductions: (employeeData.recurringDeductions as unknown as Json) || null,
    };
    const { data, error } = await supabase.from('employees').insert(dbData).select().single();
    return mapEmployeeFromDb(handleSupabaseError({ data, error }, 'addEmployee'));
};
export const addBulkEmployees = async (employees: Database['public']['Tables']['employees']['Insert'][]): Promise<void> => {
    const { error } = await supabase.from('employees').insert(employees);
    handleSupabaseError({ data: null, error }, 'addBulkEmployees');
};
export const updateEmployee = async (updatedEmployee: Employee): Promise<Employee> => {
    const { id, ...employeeData } = updatedEmployee;
    const dbData: Database['public']['Tables']['employees']['Update'] = {
        name: employeeData.name,
        name_en: employeeData.nameEn || null,
        employee_code: employeeData.employeeCode || null,
        email: employeeData.email,
        phone: employeeData.phone,
        department: employeeData.department,
        position: employeeData.position,
        status: employeeData.status,
        hire_date: employeeData.hireDate,
        contract_url: employeeData.contractUrl || null,
        profile_image_url: employeeData.profileImageUrl || null,
        fingerprint_scanner_id: employeeData.fingerprintScannerId || null,
        passport_number: employeeData.passportNumber || null,
        passport_expiry_date: employeeData.passportExpiryDate || null,
        base_salary: employeeData.baseSalary || null,
        bank_name: employeeData.bankName || null,
        bank_account_number: employeeData.bankAccountNumber || null,
        tax_id: employeeData.taxId || null,
        social_security_number: employeeData.socialSecurityNumber || null,
        provident_fund_rate_employee: employeeData.providentFundRateEmployee || null,
        provident_fund_rate_employer: employeeData.providentFundRateEmployer || null,
        recurring_allowances: (employeeData.recurringAllowances as unknown as Json) || null,
        recurring_deductions: (employeeData.recurringDeductions as unknown as Json) || null,
    };
    const { data, error } = await supabase.from('employees').update(dbData).eq('id', id).select().single();
    return mapEmployeeFromDb(handleSupabaseError({ data, error }, 'updateEmployee'));
};
export const deleteEmployee = async (id: string) => supabase.from('employees').delete().eq('id', id);


// --- Time Logs ---
export const getEmployeeTimeLogs = async (employeeId: string): Promise<TimeLog[]> => {
    const { data, error } = await supabase.from('time_logs').select('*').eq('employee_id', employeeId).order('clock_in', { ascending: false });
    const rows = handleSupabaseError({ data, error }, 'getEmployeeTimeLogs') || [];
    return rows.map((r:TimeLogRow) => ({ id: r.id, employeeId: r.employee_id, employeeName: r.employee_name, clockIn: r.clock_in, clockOut: r.clock_out || undefined, notes: r.notes || undefined, source: r.source as any }));
};
export const addTimeLog = async (logData: Omit<TimeLog, 'id'>): Promise<TimeLog> => {
    const dbData: Database['public']['Tables']['time_logs']['Insert'] = { 
        employee_id: logData.employeeId, 
        employee_name: logData.employeeName, 
        clock_in: logData.clockIn, 
        clock_out: logData.clockOut || null, 
        notes: logData.notes || null, 
        source: logData.source || null
    };
    const { data, error } = await supabase.from('time_logs').insert(dbData).select().single();
    const r = handleSupabaseError({ data, error }, 'addTimeLog');
    return { id: r.id, employeeId: r.employee_id, employeeName: r.employee_name, clockIn: r.clock_in, clockOut: r.clock_out || undefined, notes: r.notes || undefined, source: r.source as any };
};

// --- Inventory ---
export const getAllInventoryItems = async (category?: 'อุปกรณ์ IT' | 'General'): Promise<InventoryItem[]> => {
    let query = supabase.from('inventory_items').select('*');
    if (category) { (category === 'General') ? query = query.not('category', 'eq', 'อุปกรณ์ IT') : query = query.eq('category', category); }
    const { data, error } = await query;
    const rows = handleSupabaseError({ data, error }, 'getAllInventoryItems') || [];
    return rows.map((r: InventoryItemRow) => ({ id: r.id, name: r.name, sku: r.sku, category: r.category, quantity: r.quantity, minStockLevel: r.min_stock_level, unitPrice: r.unit_price, supplier: r.supplier || undefined, lastUpdated: r.last_updated, isLowStock: r.quantity < r.min_stock_level }));
};
export const getInventoryItems = async (category?: 'อุปกรณ์ IT' | 'General'): Promise<InventoryItem[]> => {
    let query = supabase.from('inventory_items').select('*').order('last_updated', { ascending: false }).limit(100);
    if (category) { (category === 'General') ? query = query.not('category', 'eq', 'อุปกรณ์ IT') : query = query.eq('category', category); }
    const { data, error } = await query;
    const rows = handleSupabaseError({ data, error }, 'getInventoryItems') || [];
    return rows.map((r: InventoryItemRow) => ({ id: r.id, name: r.name, sku: r.sku, category: r.category, quantity: r.quantity, minStockLevel: r.min_stock_level, unitPrice: r.unit_price, supplier: r.supplier || undefined, lastUpdated: r.last_updated, isLowStock: r.quantity < r.min_stock_level }));
};
export const getStockTransactions = async (): Promise<StockTransaction[]> => {
    const { data, error } = await supabase.from('stock_transactions').select('*').order('date', { ascending: false });
    const rows = handleSupabaseError({ data, error }, 'getStockTransactions') || [];
    return rows.map((r: StockTransactionRow) => ({ id: r.id, itemId: r.item_id, itemName: r.item_name, type: r.type, quantity: r.quantity, reason: r.reason, date: r.date, employeeId: r.employee_id || undefined, employeeName: r.employee_name || undefined }));
};
export const getInventoryItemTransactions = async (itemId: string): Promise<StockTransaction[]> => {
    const { data, error } = await supabase.from('stock_transactions').select('*').eq('item_id', itemId).order('date', { ascending: false });
    const rows = handleSupabaseError({ data, error }, 'getInventoryItemTransactions') || [];
    return rows.map((r: StockTransactionRow) => ({ id: r.id, itemId: r.item_id, itemName: r.item_name, type: r.type, quantity: r.quantity, reason: r.reason, date: r.date, employeeId: r.employee_id || undefined, employeeName: r.employee_name || undefined }));
};
export const addInventoryItem = async (itemData: Omit<InventoryItem, 'id' | 'lastUpdated' | 'isLowStock'>): Promise<InventoryItem> => {
    const dbData: Database['public']['Tables']['inventory_items']['Insert'] = { name: itemData.name, sku: itemData.sku, category: itemData.category, quantity: itemData.quantity, min_stock_level: itemData.minStockLevel, unit_price: itemData.unitPrice, supplier: itemData.supplier || null };
    const { data, error } = await supabase.from('inventory_items').insert(dbData).select().single();
    const r = handleSupabaseError({ data, error }, 'addInventoryItem');
    return { id: r.id, name: r.name, sku: r.sku, category: r.category, quantity: r.quantity, minStockLevel: r.min_stock_level, unitPrice: r.unit_price, supplier: r.supplier || undefined, lastUpdated: r.last_updated, isLowStock: r.quantity < r.min_stock_level };
};
export const addBulkInventoryItems = async (items: Database['public']['Tables']['inventory_items']['Insert'][]): Promise<void> => {
    const { error } = await supabase.from('inventory_items').insert(items);
    handleSupabaseError({ data: null, error }, 'addBulkInventoryItems');
};
export const updateInventoryItem = async (updatedItem: InventoryItem): Promise<InventoryItem> => {
    const { id, ...itemData } = updatedItem;
    const dbData: Database['public']['Tables']['inventory_items']['Update'] = { name: itemData.name, sku: itemData.sku, category: itemData.category, quantity: itemData.quantity, min_stock_level: itemData.minStockLevel, unit_price: itemData.unitPrice, supplier: itemData.supplier || null };
    const { data, error } = await supabase.from('inventory_items').update(dbData).eq('id', id).select().single();
    const r = handleSupabaseError({ data, error }, 'updateInventoryItem');
    return { id: r.id, name: r.name, sku: r.sku, category: r.category, quantity: r.quantity, minStockLevel: r.min_stock_level, unitPrice: r.unit_price, supplier: r.supplier || undefined, lastUpdated: r.last_updated, isLowStock: r.quantity < r.min_stock_level };
};
export const deleteInventoryItem = (id: string) => supabase.from('inventory_items').delete().eq('id', id);
export const addStockTransaction = async (transactionData: Omit<StockTransaction, 'id' | 'date'>) => {
    const { error } = await supabase.rpc('add_stock_transaction', { p_item_id: transactionData.itemId, p_item_name: transactionData.itemName, p_type: transactionData.type, p_quantity: transactionData.quantity, p_reason: transactionData.reason, p_employee_id: transactionData.employeeId!, p_employee_name: transactionData.employeeName! });
    if (error) handleSupabaseError({ data: null, error }, 'addStockTransaction RPC');
};

// --- Purchase Orders ---
const mapPoFromDb = (r: PurchaseOrderRow): PurchaseOrder => ({ id: r.id, poNumber: r.po_number, supplier: r.supplier, items: (r.items as unknown as any[]) || [], totalAmount: r.total_amount, status: r.status as POStatusKey, orderDate: r.order_date, expectedDeliveryDate: r.expected_delivery_date || undefined, notes: r.notes || undefined });

export const getAllPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
    const { data, error } = await supabase.from('purchase_orders').select('*');
    const rows = handleSupabaseError({ data, error }, 'getAllPurchaseOrders') || [];
    return rows.map(mapPoFromDb);
};
export const getPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
    const { data, error } = await supabase.from('purchase_orders').select('*').order('order_date', { ascending: false }).limit(100);
    const rows = handleSupabaseError({ data, error }, 'getPurchaseOrders') || [];
    return rows.map(mapPoFromDb);
};
export const addPurchaseOrder = async (poData: Omit<PurchaseOrder, 'id'>): Promise<PurchaseOrder> => {
    const dbData: Database['public']['Tables']['purchase_orders']['Insert'] = { supplier: poData.supplier, items: poData.items as unknown as Json, total_amount: poData.totalAmount, status: poData.status, order_date: poData.orderDate, expected_delivery_date: poData.expectedDeliveryDate || null, notes: poData.notes, po_number: poData.poNumber };
    const { data, error } = await supabase.from('purchase_orders').insert(dbData).select().single();
    return mapPoFromDb(handleSupabaseError({ data, error }, 'addPurchaseOrder'));
};
export const addBulkPurchaseOrders = async (pos: Database['public']['Tables']['purchase_orders']['Insert'][]): Promise<void> => {
    const { error } = await supabase.from('purchase_orders').insert(pos);
    handleSupabaseError({ data: null, error }, 'addBulkPurchaseOrders');
};
export const updatePurchaseOrder = async (po: PurchaseOrder): Promise<PurchaseOrder> => {
    const { id, ...rest } = po;
    const dbData: Database['public']['Tables']['purchase_orders']['Update'] = { supplier: rest.supplier, items: rest.items as unknown as Json, total_amount: rest.totalAmount, status: rest.status, order_date: rest.orderDate, expected_delivery_date: rest.expectedDeliveryDate || null, notes: rest.notes, po_number: rest.poNumber };
    const { data, error } = await supabase.from('purchase_orders').update(dbData).eq('id', id).select().single();
    return mapPoFromDb(handleSupabaseError({ data, error }, 'updatePurchaseOrder'));
};
export const deletePurchaseOrder = (id: string) => supabase.from('purchase_orders').delete().eq('id', id);


// --- Documents ---
const mapDocFromDb = (r: DocumentRow): Document => ({ id: r.id, docNumber: r.doc_number, type: r.type as DocumentType, clientName: r.client_name, projectName: r.project_name || undefined, date: r.date, amount: r.amount || undefined, status: r.status as DocumentStatusKey, pdfUrl: r.pdf_url || undefined });

export const getDocuments = async (): Promise<Document[]> => {
    const { data, error } = await supabase.from('documents').select('*').order('date', { ascending: false }).limit(100);
    return (handleSupabaseError({ data, error }, 'getDocuments') || []).map(mapDocFromDb);
};
export const addDocument = async (doc: Omit<Document, 'id'>): Promise<Document> => {
    const dbData: Database['public']['Tables']['documents']['Insert'] = { doc_number: doc.docNumber, type: doc.type, client_name: doc.clientName, project_name: doc.projectName || null, date: doc.date, amount: doc.amount || null, status: doc.status, pdf_url: doc.pdfUrl || null };
    const { data, error } = await supabase.from('documents').insert(dbData).select().single();
    return mapDocFromDb(handleSupabaseError({ data, error }, 'addDocument'));
};
export const addBulkDocuments = async (docs: Database['public']['Tables']['documents']['Insert'][]): Promise<void> => {
    const { error } = await supabase.from('documents').insert(docs);
    handleSupabaseError({ data: null, error }, 'addBulkDocuments');
};
export const updateDocument = async (doc: Document): Promise<Document> => {
    const { id, ...rest } = doc;
    const dbData: Database['public']['Tables']['documents']['Update'] = { doc_number: rest.docNumber, type: rest.type, client_name: rest.clientName, project_name: rest.projectName || null, date: rest.date, amount: rest.amount || null, status: rest.status, pdf_url: rest.pdfUrl || null };
    const { data, error } = await supabase.from('documents').update(dbData).eq('id', id).select().single();
    return mapDocFromDb(handleSupabaseError({ data, error }, 'updateDocument'));
};
export const deleteDocument = (id: string) => supabase.from('documents').delete().eq('id', id);

// --- Chat ---
const mapChatFromDb = (r: ChatMessageRow): ChatMessage => ({ id: r.id, roomId: r.room_id, senderId: r.sender_id, senderName: r.sender_name, timestamp: r.timestamp, text: r.text || undefined, fileUrl: r.file_url || undefined, fileName: r.file_name || undefined, link: r.link || undefined });
export const getChatMessages = async (roomId: string): Promise<ChatMessage[]> => {
    const { data, error } = await supabase.from('chat_messages').select('*').eq('room_id', roomId).order('timestamp', { ascending: true });
    return (handleSupabaseError({ data, error }, 'getChatMessages') || []).map(mapChatFromDb);
};
export const addChatMessage = async (msg: Omit<ChatMessage, 'id'>): Promise<ChatMessage> => {
    const dbData: Database['public']['Tables']['chat_messages']['Insert'] = { room_id: msg.roomId, sender_id: msg.senderId, sender_name: msg.senderName, timestamp: msg.timestamp, text: msg.text || null, file_url: msg.fileUrl || null, file_name: msg.fileName || null, link: msg.link || null };
    const { data, error } = await supabase.from('chat_messages').insert(dbData).select().single();
    return mapChatFromDb(handleSupabaseError({ data, error }, 'addChatMessage'));
};

// --- Calendar Events ---
const mapEventFromDb = (r: CalendarEventRow): CalendarEvent => ({ id: r.id, title: r.title, start: r.start, end: r.end, description: r.description || undefined, attendees: (r.attendees as unknown as any[]) || [], isAllDay: r.is_all_day || undefined, taskId: r.task_id || undefined });
export const getCalendarEvents = async (): Promise<CalendarEvent[]> => {
    const { data, error } = await supabase.from('calendar_events').select('*');
    return (handleSupabaseError({ data, error }, 'getCalendarEvents') || []).map(mapEventFromDb);
};
export const addCalendarEvent = async (event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> => {
    const dbData: Database['public']['Tables']['calendar_events']['Insert'] = { title: event.title, start: event.start, end: event.end, description: event.description || null, attendees: event.attendees as unknown as Json, is_all_day: event.isAllDay || null, task_id: event.taskId || null };
    const { data, error } = await supabase.from('calendar_events').insert(dbData).select().single();
    return mapEventFromDb(handleSupabaseError({ data, error }, 'addCalendarEvent'));
};
export const updateCalendarEvent = async (event: CalendarEvent): Promise<CalendarEvent> => {
    const { id, ...rest } = event;
    const dbData: Database['public']['Tables']['calendar_events']['Update'] = { title: rest.title, start: rest.start, end: rest.end, description: rest.description || null, attendees: rest.attendees as unknown as Json, is_all_day: rest.isAllDay || null, task_id: rest.taskId || null };
    const { data, error } = await supabase.from('calendar_events').update(dbData).eq('id', id).select().single();
    return mapEventFromDb(handleSupabaseError({ data, error }, 'updateCalendarEvent'));
};
export const deleteCalendarEvent = (id: string) => supabase.from('calendar_events').delete().eq('id', id);


// --- Leave Requests ---
const mapLeaveFromDb = (r: LeaveRequestRow): LeaveRequest => ({ id: r.id, employeeId: r.employee_id, employeeName: r.employee_name, leaveType: r.leave_type as LeaveType, startDate: r.start_date, endDate: r.end_date, reason: r.reason || undefined, status: r.status as LeaveRequestStatus, requestedDate: r.requested_date, approverId: r.approver_id || undefined, approverName: r.approver_name || undefined, approvedDate: r.approved_date || undefined, notes: r.notes || undefined, durationInDays: r.duration_in_days || undefined });

export const getAllLeaveRequests = async (): Promise<LeaveRequest[]> => {
    const { data, error } = await supabase.from('leave_requests').select('*').order('requested_date', { ascending: false });
    return (handleSupabaseError({data, error}, 'getAllLeaveRequests') || []).map(mapLeaveFromDb);
};
export const getLeaveRequests = async (): Promise<LeaveRequest[]> => {
    const { data, error } = await supabase.from('leave_requests').select('*').order('requested_date', { ascending: false }).limit(100);
    return (handleSupabaseError({data, error}, 'getLeaveRequests') || []).map(mapLeaveFromDb);
};
export const addLeaveRequest = async (req: Omit<LeaveRequest, 'id'>): Promise<LeaveRequest> => {
    const dbData: Database['public']['Tables']['leave_requests']['Insert'] = { employee_id: req.employeeId, employee_name: req.employeeName, leave_type: req.leaveType, start_date: req.startDate, end_date: req.endDate, reason: req.reason || null, status: req.status, requested_date: req.requestedDate, approver_id: req.approverId || null, approver_name: req.approverName || null, approved_date: req.approvedDate || null, notes: req.notes || null, duration_in_days: req.durationInDays || null };
    const { data, error } = await supabase.from('leave_requests').insert(dbData).select().single();
    return mapLeaveFromDb(handleSupabaseError({data, error}, 'addLeaveRequest'));
};
export const addBulkLeaveRequests = async (reqs: Database['public']['Tables']['leave_requests']['Insert'][]): Promise<void> => {
    const { error } = await supabase.from('leave_requests').insert(reqs);
    handleSupabaseError({ data: null, error }, 'addBulkLeaveRequests');
};
export const updateLeaveRequest = async (req: LeaveRequest): Promise<LeaveRequest> => {
    const { id, ...rest } = req;
    const dbData: Database['public']['Tables']['leave_requests']['Update'] = { employee_id: rest.employeeId, employee_name: rest.employeeName, leave_type: rest.leaveType, start_date: rest.startDate, end_date: rest.endDate, reason: rest.reason || null, status: rest.status, requested_date: rest.requestedDate, approver_id: rest.approverId || null, approver_name: rest.approverName || null, approved_date: rest.approvedDate || null, notes: rest.notes || null, duration_in_days: rest.durationInDays || null };
    const { data, error } = await supabase.from('leave_requests').update(dbData).eq('id', id).select().single();
    return mapLeaveFromDb(handleSupabaseError({data, error}, 'updateLeaveRequest'));
};
export const deleteLeaveRequest = (id: string) => supabase.from('leave_requests').delete().eq('id', id);

// --- Cash Advance ---
const mapCashAdvanceFromDb = (r: CashAdvanceRequestRow): CashAdvanceRequest => ({ id: r.id, employeeId: r.employee_id, employeeName: r.employee_name, employeeCode: r.employee_code || undefined, requestDate: r.request_date, amount: r.amount, reason: r.reason, status: r.status as CashAdvanceRequestStatus, approverId: r.approver_id || undefined, approverName: r.approver_name || undefined, approvalDate: r.approval_date || undefined, notes: r.notes || undefined, paymentDate: r.payment_date || undefined });
export const getCashAdvanceRequests = async (): Promise<CashAdvanceRequest[]> => {
    const {data, error} = await supabase.from('cash_advance_requests').select('*').order('request_date', {ascending: false}).limit(100);
    return (handleSupabaseError({data, error}, 'getCashAdvanceRequests') || []).map(mapCashAdvanceFromDb);
};
export const addCashAdvanceRequest = async (req: Omit<CashAdvanceRequest, 'id'>): Promise<CashAdvanceRequest> => {
    const dbData: Database['public']['Tables']['cash_advance_requests']['Insert'] = { employee_id: req.employeeId, employee_name: req.employeeName, employee_code: req.employeeCode || null, request_date: req.requestDate, amount: req.amount, reason: req.reason, status: req.status, approver_id: req.approverId || null, approver_name: req.approverName || null, approval_date: req.approvalDate || null, notes: req.notes || null, payment_date: req.paymentDate || null };
    const { data, error } = await supabase.from('cash_advance_requests').insert(dbData).select().single();
    return mapCashAdvanceFromDb(handleSupabaseError({data, error}, 'addCashAdvanceRequest'));
};
export const addBulkCashAdvanceRequests = async (reqs: Database['public']['Tables']['cash_advance_requests']['Insert'][]): Promise<void> => {
    const { error } = await supabase.from('cash_advance_requests').insert(reqs);
    handleSupabaseError({ data: null, error }, 'addBulkCashAdvanceRequests');
};
export const updateCashAdvanceRequest = async (req: CashAdvanceRequest): Promise<CashAdvanceRequest> => {
    const { id, ...rest } = req;
    const dbData: Database['public']['Tables']['cash_advance_requests']['Update'] = { employee_id: rest.employeeId, employee_name: rest.employeeName, employee_code: rest.employeeCode || null, request_date: rest.requestDate, amount: rest.amount, reason: rest.reason, status: rest.status, approver_id: rest.approverId || null, approver_name: rest.approverName || null, approval_date: rest.approvalDate || null, notes: rest.notes || null, payment_date: rest.paymentDate || null };
    const { data, error } = await supabase.from('cash_advance_requests').update(dbData).eq('id', id).select().single();
    return mapCashAdvanceFromDb(handleSupabaseError({data, error}, 'updateCashAdvanceRequest'));
};
export const deleteCashAdvanceRequest = (id: string) => supabase.from('cash_advance_requests').delete().eq('id', id);

// --- Payroll ---
const mapPayrollComponentFromDb = (r: PayrollComponentRow): PayrollComponent => ({ id: r.id, name: r.name, type: r.type as any, isTaxable: r.is_taxable || undefined, defaultAmount: r.default_amount || undefined, defaultRate: r.default_rate || undefined, calculationBasis: r.calculation_basis as any, cap: r.cap || undefined, isSystemCalculated: r.is_system_calculated || undefined });
export const getPayrollComponents = async (): Promise<PayrollComponent[]> => {
    const { data, error } = await supabase.from('payroll_components').select('*');
    return (handleSupabaseError({ data, error }, 'getPayrollComponents') || []).map(mapPayrollComponentFromDb);
};
export const addPayrollComponent = async (comp: Omit<PayrollComponent, 'id'>): Promise<PayrollComponent> => {
    const dbData: Database['public']['Tables']['payroll_components']['Insert'] = { name: comp.name, type: comp.type, is_taxable: comp.isTaxable ?? null, default_amount: comp.defaultAmount ?? null, default_rate: comp.defaultRate ?? null, calculation_basis: comp.calculationBasis ?? null, cap: comp.cap ?? null, is_system_calculated: comp.isSystemCalculated ?? null };
    const { data, error } = await supabase.from('payroll_components').insert(dbData).select().single();
    return mapPayrollComponentFromDb(handleSupabaseError({ data, error }, 'addPayrollComponent'));
};
export const updatePayrollComponent = async (comp: PayrollComponent): Promise<PayrollComponent> => {
    const { id, ...rest } = comp;
    const dbData: Database['public']['Tables']['payroll_components']['Update'] = { name: rest.name, type: rest.type, is_taxable: rest.isTaxable ?? null, default_amount: rest.defaultAmount ?? null, default_rate: rest.defaultRate ?? null, calculation_basis: rest.calculationBasis ?? null, cap: rest.cap ?? null, is_system_calculated: rest.isSystemCalculated ?? null };
    const { data, error } = await supabase.from('payroll_components').update(dbData).eq('id', id).select().single();
    return mapPayrollComponentFromDb(handleSupabaseError({ data, error }, 'updatePayrollComponent'));
};
export const deletePayrollComponent = (id: string) => supabase.from('payroll_components').delete().eq('id', id);
export const getAllPayrollComponents = getPayrollComponents; // Alias

const mapPayrollRunFromDb = (r: PayrollRunRow): PayrollRun => ({ id: r.id, periodMonth: r.period_month, periodYear: r.period_year, status: r.status as any, dateCreated: r.date_created, dateApproved: r.date_approved || undefined, datePaid: r.date_paid || undefined, payslipIds: r.payslip_ids || [], totalEmployees: r.total_employees, totalGrossPay: r.total_gross_pay, totalDeductions: r.total_deductions, totalNetPay: r.total_net_pay, notes: r.notes || undefined });
export const getPayrollRuns = async (): Promise<PayrollRun[]> => {
    const {data, error} = await supabase.from('payroll_runs').select('*').order('date_created', {ascending: false}).limit(50);
    return (handleSupabaseError({data, error}, 'getPayrollRuns') || []).map(mapPayrollRunFromDb);
};
export const getPayrollRunById = async (id: string): Promise<PayrollRun | null> => {
    const {data, error} = await supabase.from('payroll_runs').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') handleSupabaseError({data, error}, 'getPayrollRunById');
    return data ? mapPayrollRunFromDb(data) : null;
};
export const addPayrollRun = async (run: Omit<PayrollRun, 'id'>): Promise<PayrollRun> => {
    const dbData: Database['public']['Tables']['payroll_runs']['Insert'] = { period_month: run.periodMonth, period_year: run.periodYear, status: run.status, date_created: run.dateCreated, date_approved: run.dateApproved || null, date_paid: run.datePaid || null, payslip_ids: run.payslipIds || null, total_employees: run.totalEmployees, total_gross_pay: run.totalGrossPay, total_deductions: run.totalDeductions, total_net_pay: run.totalNetPay, notes: run.notes || null };
    const { data, error } = await supabase.from('payroll_runs').insert(dbData).select().single();
    return mapPayrollRunFromDb(handleSupabaseError({ data, error }, 'addPayrollRun'));
};
export const updatePayrollRun = async (run: PayrollRun): Promise<PayrollRun> => {
    const { id, ...rest } = run;
    const dbData: Database['public']['Tables']['payroll_runs']['Update'] = { period_month: rest.periodMonth, period_year: rest.periodYear, status: rest.status, date_created: rest.dateCreated, date_approved: rest.dateApproved || null, date_paid: rest.datePaid || null, payslip_ids: rest.payslipIds || null, total_employees: rest.totalEmployees, total_gross_pay: rest.totalGrossPay, total_deductions: rest.totalDeductions, total_net_pay: rest.totalNetPay, notes: rest.notes || null };
    const { data, error } = await supabase.from('payroll_runs').update(dbData).eq('id', id).select().single();
    return mapPayrollRunFromDb(handleSupabaseError({ data, error }, 'updatePayrollRun'));
};
export const deletePayrollRun = async (id: string) => {
    return handleSupabaseError({ ...(await supabase.rpc('delete_payroll_run', { p_run_id: id })) }, 'deletePayrollRun RPC');
};

const mapPayslipFromDb = (p: PayslipRow): Payslip => ({
    id: p.id,
    payrollRunId: p.payroll_run_id,
    employeeId: p.employee_id,
    employeeName: p.employee_name,
    employeeCode: p.employee_code || undefined,
    employeeDepartment: p.employee_department || undefined,
    employeePosition: p.employee_position || undefined,
    employeeTaxId: p.employee_tax_id || undefined,
    employeeSsn: p.employee_ssn || undefined,
    employeeJoiningDate: p.employee_joining_date || undefined,
    payPeriod: p.pay_period,
    baseSalary: p.base_salary,
    overtimeHours: p.overtime_hours || undefined,
    overtimeRate: p.overtime_rate || undefined,
    overtimePay: p.overtime_pay || undefined,
    allowances: (p.allowances as unknown as PayslipItem[]) || [],
    grossPay: p.gross_pay,
    taxDeduction: p.tax_deduction,
    socialSecurityDeduction: p.social_security_deduction,
    providentFundDeduction: p.provident_fund_deduction,
    otherDeductions: (p.other_deductions as unknown as PayslipItem[]) || [],
    totalDeductions: p.total_deductions,
    netPay: p.net_pay,
    bankName: p.bank_name || undefined,
    bankAccountNumber: p.bank_account_number || undefined,
    paymentDate: p.payment_date || undefined,
});

const mapPayslipToDb = (p: Partial<Payslip>): Database['public']['Tables']['payslips']['Insert'] => ({ 
    id: p.id, 
    payroll_run_id: p.payrollRunId!, 
    employee_id: p.employeeId!, 
    employee_name: p.employeeName!, 
    employee_code: p.employeeCode || null, 
    employee_department: p.employeeDepartment || null, 
    employee_position: p.employeePosition || null, 
    employee_tax_id: p.employeeTaxId || null, 
    employee_ssn: p.employeeSsn || null, 
    employee_joining_date: p.employeeJoiningDate || null, 
    pay_period: p.payPeriod!, 
    base_salary: p.baseSalary!, 
    gross_pay: p.grossPay!, 
    tax_deduction: p.taxDeduction!, 
    social_security_deduction: p.socialSecurityDeduction!, 
    provident_fund_deduction: p.providentFundDeduction!, 
    other_deductions: (p.otherDeductions as unknown as Json) || [],
    total_deductions: p.totalDeductions!, 
    net_pay: p.netPay!, 
    bank_name: p.bankName || null, 
    bank_account_number: p.bankAccountNumber || null, 
    payment_date: p.paymentDate || null, 
    overtime_hours: p.overtimeHours || null, 
    overtime_rate: p.overtimeRate || null, 
    overtime_pay: p.overtimePay || null, 
    allowances: (p.allowances as unknown as Json) || []
});
export const getPayslipsForRun = async (runId: string): Promise<Payslip[]> => {
    const { data, error } = await supabase.from('payslips').select('*').eq('payroll_run_id', runId);
    return (handleSupabaseError({ data, error }, 'getPayslipsForRun') || []).map(mapPayslipFromDb);
};
export const getPayslipsForEmployee = async (employeeId: string): Promise<Payslip[]> => {
    const { data, error } = await supabase.from('payslips').select('*').eq('employee_id', employeeId).order('pay_period', {ascending: false});
    return (handleSupabaseError({ data, error }, 'getPayslipsForEmployee') || []).map(mapPayslipFromDb);
};
export const addPayslip = async (payslip: Payslip) => {
    const { data, error } = await supabase.from('payslips').insert(mapPayslipToDb(payslip));
    return handleSupabaseError({data, error}, 'addPayslip');
};
export const updatePayslip = async (payslip: Payslip) => {
    const {id, ...rest} = payslip;
    const dbData: Database['public']['Tables']['payslips']['Update'] = {
        payroll_run_id: rest.payrollRunId,
        employee_id: rest.employeeId,
        employee_name: rest.employeeName,
        employee_code: rest.employeeCode || null,
        employee_department: rest.employeeDepartment || null,
        employee_position: rest.employeePosition || null,
        employee_tax_id: rest.employeeTaxId || null,
        employee_ssn: rest.employeeSsn || null,
        employee_joining_date: rest.employeeJoiningDate || null,
        pay_period: rest.payPeriod,
        base_salary: rest.baseSalary,
        overtime_hours: rest.overtimeHours || null,
        overtime_rate: rest.overtimeRate || null,
        overtime_pay: rest.overtimePay || null,
        allowances: (rest.allowances as unknown as Json) || [],
        gross_pay: rest.grossPay,
        tax_deduction: rest.taxDeduction,
        social_security_deduction: rest.socialSecurityDeduction,
        provident_fund_deduction: rest.providentFundDeduction,
        other_deductions: (rest.otherDeductions as unknown as Json) || [],
        total_deductions: rest.totalDeductions,
        net_pay: rest.netPay,
        bank_name: rest.bankName || null,
        bank_account_number: rest.bankAccountNumber || null,
        payment_date: rest.paymentDate || null
    };
    const { data, error } = await supabase.from('payslips').update(dbData).eq('id', id);
    return handleSupabaseError({data, error}, 'updatePayslip');
};
export const deletePayslip = (id: string) => supabase.from('payslips').delete().eq('id', id);


// --- Settings ---
export const getSetting = async (key: string): Promise<any | null> => {
    const { data, error } = await supabase.from('settings').select('value').eq('key', key).single();
    if (error && error.code !== 'PGRST116') handleSupabaseError({data, error}, 'getSetting');
    return data ? data.value : null;
};
export const saveSetting = async (key: string, value: any): Promise<void> => {
    const dbData: Database['public']['Tables']['settings']['Insert'] = { key, value: value as unknown as Json };
    const { error } = await supabase.from('settings').upsert(dbData as any);
    if (error) handleSupabaseError({ data: null, error }, 'saveSetting');
};

// --- New User Management Functions for Admins ---

const mapProfileToManagedUser = (p: ProfileRow): ManagedUser => ({
  id: p.id,
  full_name: p.full_name,
  username: p.username,
  role: p.role as UserRole,
  department: p.department,
  updated_at: p.updated_at,
});

export const getManagedUsers = async (): Promise<ManagedUser[]> => {
    // This query relies on the RLS policy for Admins being in place.
    const { data, error } = await supabase.from('profiles').select('*').order('username', { ascending: true });
    const profiles = handleSupabaseError({ data, error }, 'getManagedUsers') || [];
    return profiles.map(mapProfileToManagedUser);
};

export const updateUserRole = async (userId: string, role: UserRole): Promise<ManagedUser> => {
    const { data, error } = await supabase
        .from('profiles')
        .update({ role: role, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
    return mapProfileToManagedUser(handleSupabaseError({ data, error }, 'updateUserRole'));
};