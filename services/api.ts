
// services/api.ts
import { supabase } from '../lib/supabaseClient';
import { User, Employee, TimeLog, InventoryItem, StockTransaction, PurchaseOrder, Document, CalendarEvent, PayrollRun, Payslip, PayrollComponent, LeaveRequest, ChatMessage, CashAdvanceRequest, Json, EmployeeStatusKey, POStatusKey, DocumentStatusKey, DocumentType, LeaveType, LeaveRequestStatus, CashAdvanceRequestStatus, EmployeeAllowance, EmployeeDeduction, PayslipItem } from '../types';
import { Database } from '../types';

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
    if (!supabase) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error && error.code !== 'PGRST116') handleSupabaseError({data, error}, 'getUserProfile');
    return data;
};
export const getAllUserProfiles = async (): Promise<User[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('profiles').select(`id, username, full_name, role, department`);
    const profiles = handleSupabaseError({ data, error }, 'getAllUserProfiles') || [];
    return profiles.map((p: any) => ({ id: p.id, username: p.username, name: p.full_name, role: p.role, department: p.department }));
};

// --- Employees ---
export const getEmployees = async (): Promise<Employee[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('employees').select('*');
    const rows = handleSupabaseError({ data, error }, 'getEmployees') || [];
    return rows.map(mapEmployeeFromDb);
};
export const getEmployeeById = async (id: string): Promise<Employee | null> => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('employees').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') { handleSupabaseError({data, error}, 'getEmployeeById'); return null; }
    return data ? mapEmployeeFromDb(data) : null;
};
export const addEmployee = async (employeeData: Omit<Employee, 'id'>): Promise<Employee> => {
    if (!supabase) throw new Error("Supabase client not initialized");
    const dbData: Database['public']['Tables']['employees']['Insert'] = {
        name: employeeData.name,
        name_en: employeeData.nameEn,
        employee_code: employeeData.employeeCode,
        email: employeeData.email,
        phone: employeeData.phone,
        department: employeeData.department,
        position: employeeData.position,
        status: employeeData.status,
        hire_date: employeeData.hireDate,
        contract_url: employeeData.contractUrl,
        profile_image_url: employeeData.profileImageUrl,
        fingerprint_scanner_id: employeeData.fingerprintScannerId,
        passport_number: employeeData.passportNumber,
        passport_expiry_date: employeeData.passportExpiryDate,
        base_salary: employeeData.baseSalary,
        bank_name: employeeData.bankName,
        bank_account_number: employeeData.bankAccountNumber,
        tax_id: employeeData.taxId,
        social_security_number: employeeData.socialSecurityNumber,
        provident_fund_rate_employee: employeeData.providentFundRateEmployee,
        provident_fund_rate_employer: employeeData.providentFundRateEmployer,
        recurring_allowances: employeeData.recurringAllowances as unknown as Json,
        recurring_deductions: employeeData.recurringDeductions as unknown as Json,
    };
    const { data, error } = await supabase.from('employees').insert([dbData]).select().single();
    return mapEmployeeFromDb(handleSupabaseError({ data, error }, 'addEmployee'));
};
export const updateEmployee = async (updatedEmployee: Employee): Promise<Employee> => {
    if (!supabase) throw new Error("Supabase client not initialized");
    const { id, ...employeeData } = updatedEmployee;
    const dbData: Database['public']['Tables']['employees']['Update'] = {
        name: employeeData.name,
        name_en: employeeData.nameEn,
        employee_code: employeeData.employeeCode,
        email: employeeData.email,
        phone: employeeData.phone,
        department: employeeData.department,
        position: employeeData.position,
        status: employeeData.status,
        hire_date: employeeData.hireDate,
        contract_url: employeeData.contractUrl,
        profile_image_url: employeeData.profileImageUrl,
        fingerprint_scanner_id: employeeData.fingerprintScannerId,
        passport_number: employeeData.passportNumber,
        passport_expiry_date: employeeData.passportExpiryDate,
        base_salary: employeeData.baseSalary,
        bank_name: employeeData.bankName,
        bank_account_number: employeeData.bankAccountNumber,
        tax_id: employeeData.taxId,
        social_security_number: employeeData.socialSecurityNumber,
        provident_fund_rate_employee: employeeData.providentFundRateEmployee,
        provident_fund_rate_employer: employeeData.providentFundRateEmployer,
        recurring_allowances: employeeData.recurringAllowances as unknown as Json,
        recurring_deductions: employeeData.recurringDeductions as unknown as Json,
    };
    const { data, error } = await supabase.from('employees').update(dbData).eq('id', id).select().single();
    return mapEmployeeFromDb(handleSupabaseError({ data, error }, 'updateEmployee'));
};
export const deleteEmployee = async (id: string) => supabase?.from('employees').delete().eq('id', id);


// --- Time Logs ---
export const getEmployeeTimeLogs = async (employeeId: string): Promise<TimeLog[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('time_logs').select('*').eq('employee_id', employeeId).order('clock_in', { ascending: false });
    const rows = handleSupabaseError({ data, error }, 'getEmployeeTimeLogs') || [];
    return rows.map((r:TimeLogRow) => ({ id: r.id, employeeId: r.employee_id, employeeName: r.employee_name, clockIn: r.clock_in, clockOut: r.clock_out || undefined, notes: r.notes || undefined, source: r.source as any }));
};
export const addTimeLog = async (logData: Omit<TimeLog, 'id'>): Promise<TimeLog> => {
    if (!supabase) throw new Error("Supabase client not initialized");
    const dbData: Database['public']['Tables']['time_logs']['Insert'] = { 
        employee_id: logData.employeeId, 
        employee_name: logData.employeeName, 
        clock_in: logData.clockIn, 
        clock_out: logData.clockOut, 
        notes: logData.notes, 
        source: logData.source 
    };
    const { data, error } = await supabase.from('time_logs').insert([dbData]).select().single();
    const r = handleSupabaseError({ data, error }, 'addTimeLog');
    return { id: r.id, employeeId: r.employee_id, employeeName: r.employee_name, clockIn: r.clock_in, clockOut: r.clock_out || undefined, notes: r.notes || undefined, source: r.source as any };
};

// --- Inventory ---
export const getInventoryItems = async (category?: 'อุปกรณ์ IT' | 'General'): Promise<InventoryItem[]> => {
    if (!supabase) return [];
    let query = supabase.from('inventory_items').select('*');
    if (category) { (category === 'General') ? query = query.not('category', 'eq', 'อุปกรณ์ IT') : query = query.eq('category', category); }
    const { data, error } = await query;
    const rows = handleSupabaseError({ data, error }, 'getInventoryItems') || [];
    return rows.map((r: InventoryItemRow) => ({ id: r.id, name: r.name, sku: r.sku, category: r.category, quantity: r.quantity, minStockLevel: r.min_stock_level, unitPrice: r.unit_price, supplier: r.supplier || undefined, lastUpdated: r.last_updated, isLowStock: r.quantity < r.min_stock_level }));
};
export const getStockTransactions = async (): Promise<StockTransaction[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('stock_transactions').select('*').order('date', { ascending: false });
    const rows = handleSupabaseError({ data, error }, 'getStockTransactions') || [];
    return rows.map((r: StockTransactionRow) => ({ id: r.id, itemId: r.item_id, itemName: r.item_name, type: r.type, quantity: r.quantity, reason: r.reason, date: r.date, employeeId: r.employee_id || undefined, employeeName: r.employee_name || undefined }));
};
export const getInventoryItemTransactions = async (itemId: string): Promise<StockTransaction[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('stock_transactions').select('*').eq('item_id', itemId).order('date', { ascending: false });
    const rows = handleSupabaseError({ data, error }, 'getInventoryItemTransactions') || [];
    return rows.map((r: StockTransactionRow) => ({ id: r.id, itemId: r.item_id, itemName: r.item_name, type: r.type, quantity: r.quantity, reason: r.reason, date: r.date, employeeId: r.employee_id || undefined, employeeName: r.employee_name || undefined }));
};
export const addInventoryItem = async (itemData: Omit<InventoryItem, 'id' | 'lastUpdated' | 'isLowStock'>): Promise<InventoryItem> => {
    if (!supabase) throw new Error("Supabase client not initialized");
    const dbData: Database['public']['Tables']['inventory_items']['Insert'] = { name: itemData.name, sku: itemData.sku, category: itemData.category, quantity: itemData.quantity, min_stock_level: itemData.minStockLevel, unit_price: itemData.unitPrice, supplier: itemData.supplier };
    const { data, error } = await supabase.from('inventory_items').insert([dbData]).select().single();
    const r = handleSupabaseError({ data, error }, 'addInventoryItem');
    return { id: r.id, name: r.name, sku: r.sku, category: r.category, quantity: r.quantity, minStockLevel: r.min_stock_level, unitPrice: r.unit_price, supplier: r.supplier || undefined, lastUpdated: r.last_updated, isLowStock: r.quantity < r.min_stock_level };
};
export const updateInventoryItem = async (updatedItem: InventoryItem): Promise<InventoryItem> => {
     if (!supabase) throw new Error("Supabase client not initialized");
    const { id, ...itemData } = updatedItem;
    const dbData: Database['public']['Tables']['inventory_items']['Update'] = { name: itemData.name, sku: itemData.sku, category: itemData.category, quantity: itemData.quantity, min_stock_level: itemData.minStockLevel, unit_price: itemData.unitPrice, supplier: itemData.supplier };
    const { data, error } = await supabase.from('inventory_items').update(dbData).eq('id', id).select().single();
    const r = handleSupabaseError({ data, error }, 'updateInventoryItem');
    return { id: r.id, name: r.name, sku: r.sku, category: r.category, quantity: r.quantity, minStockLevel: r.min_stock_level, unitPrice: r.unit_price, supplier: r.supplier || undefined, lastUpdated: r.last_updated, isLowStock: r.quantity < r.min_stock_level };
};
export const deleteInventoryItem = (id: string) => supabase?.from('inventory_items').delete().eq('id', id);
export const addStockTransaction = async (transactionData: Omit<StockTransaction, 'id' | 'date'>) => {
    if (!supabase) throw new Error("Supabase client not initialized");
    const { error } = await supabase.rpc('add_stock_transaction', { p_item_id: transactionData.itemId, p_item_name: transactionData.itemName, p_type: transactionData.type, p_quantity: transactionData.quantity, p_reason: transactionData.reason, p_employee_id: transactionData.employeeId!, p_employee_name: transactionData.employeeName! });
    if (error) handleSupabaseError({ data: null, error }, 'addStockTransaction RPC');
};

// --- Purchase Orders ---
const mapPoFromDb = (r: PurchaseOrderRow): PurchaseOrder => ({ id: r.id, poNumber: r.po_number, supplier: r.supplier, items: (r.items as unknown as any[]) || [], totalAmount: r.total_amount, status: r.status as POStatusKey, orderDate: r.order_date, expectedDeliveryDate: r.expected_delivery_date || undefined, notes: r.notes || undefined });

export const getPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('purchase_orders').select('*');
    const rows = handleSupabaseError({ data, error }, 'getPurchaseOrders') || [];
    return rows.map(mapPoFromDb);
};
export const addPurchaseOrder = async (poData: Omit<PurchaseOrder, 'id'>): Promise<PurchaseOrder> => {
    if (!supabase) throw new Error("Supabase not initialized");
    const dbData: Database['public']['Tables']['purchase_orders']['Insert'] = { supplier: poData.supplier, items: poData.items as unknown as Json, total_amount: poData.totalAmount, status: poData.status, order_date: poData.orderDate, expected_delivery_date: poData.expectedDeliveryDate, notes: poData.notes, po_number: poData.poNumber };
    const { data, error } = await supabase.from('purchase_orders').insert([dbData]).select().single();
    return mapPoFromDb(handleSupabaseError({ data, error }, 'addPurchaseOrder'));
};
export const updatePurchaseOrder = async (po: PurchaseOrder): Promise<PurchaseOrder> => {
    if (!supabase) throw new Error("Supabase not initialized");
    const { id, ...rest } = po;
    const dbData: Database['public']['Tables']['purchase_orders']['Update'] = { supplier: rest.supplier, items: rest.items as unknown as Json, total_amount: rest.totalAmount, status: rest.status, order_date: rest.orderDate, expected_delivery_date: rest.expectedDeliveryDate, notes: rest.notes, po_number: rest.poNumber };
    const { data, error } = await supabase.from('purchase_orders').update(dbData).eq('id', id).select().single();
    return mapPoFromDb(handleSupabaseError({ data, error }, 'updatePurchaseOrder'));
};
export const deletePurchaseOrder = (id: string) => supabase?.from('purchase_orders').delete().eq('id', id);


// --- Documents ---
const mapDocFromDb = (r: DocumentRow): Document => ({ id: r.id, docNumber: r.doc_number, type: r.type as DocumentType, clientName: r.client_name, projectName: r.project_name || undefined, date: r.date, amount: r.amount || undefined, status: r.status as DocumentStatusKey, pdfUrl: r.pdf_url || undefined });

export const getDocuments = async (): Promise<Document[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('documents').select('*');
    return (handleSupabaseError({ data, error }, 'getDocuments') || []).map(mapDocFromDb);
};
export const addDocument = async (doc: Omit<Document, 'id'>): Promise<Document> => {
    if (!supabase) throw new Error("Supabase not initialized");
    const dbData: Database['public']['Tables']['documents']['Insert'] = { doc_number: doc.docNumber, type: doc.type, client_name: doc.clientName, project_name: doc.projectName, date: doc.date, amount: doc.amount, status: doc.status, pdf_url: doc.pdfUrl };
    const { data, error } = await supabase.from('documents').insert([dbData]).select().single();
    return mapDocFromDb(handleSupabaseError({ data, error }, 'addDocument'));
};
export const updateDocument = async (doc: Document): Promise<Document> => {
    if (!supabase) throw new Error("Supabase not initialized");
    const { id, ...rest } = doc;
    const dbData: Database['public']['Tables']['documents']['Update'] = { doc_number: rest.docNumber, type: rest.type, client_name: rest.clientName, project_name: rest.projectName, date: rest.date, amount: rest.amount, status: rest.status, pdf_url: rest.pdfUrl };
    const { data, error } = await supabase.from('documents').update(dbData).eq('id', id).select().single();
    return mapDocFromDb(handleSupabaseError({ data, error }, 'updateDocument'));
};
export const deleteDocument = (id: string) => supabase?.from('documents').delete().eq('id', id);

// --- Chat ---
const mapChatFromDb = (r: ChatMessageRow): ChatMessage => ({ id: r.id, roomId: r.room_id, senderId: r.sender_id, senderName: r.sender_name, timestamp: r.timestamp, text: r.text || undefined, fileUrl: r.file_url || undefined, fileName: r.file_name || undefined, link: r.link || undefined });
export const getChatMessages = async (roomId: string): Promise<ChatMessage[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('chat_messages').select('*').eq('room_id', roomId).order('timestamp', { ascending: true });
    return (handleSupabaseError({ data, error }, 'getChatMessages') || []).map(mapChatFromDb);
};
export const addChatMessage = async (msg: Omit<ChatMessage, 'id'>): Promise<ChatMessage> => {
    if (!supabase) throw new Error("Supabase not initialized");
    const dbData: Database['public']['Tables']['chat_messages']['Insert'] = { room_id: msg.roomId, sender_id: msg.senderId, sender_name: msg.senderName, timestamp: msg.timestamp, text: msg.text, file_url: msg.fileUrl, file_name: msg.fileName, link: msg.link };
    const { data, error } = await supabase.from('chat_messages').insert([dbData]).select().single();
    return mapChatFromDb(handleSupabaseError({ data, error }, 'addChatMessage'));
};

// --- Calendar Events ---
const mapEventFromDb = (r: CalendarEventRow): CalendarEvent => ({ id: r.id, title: r.title, start: r.start, end: r.end, description: r.description || undefined, attendees: (r.attendees as unknown as any[]) || [], isAllDay: r.is_all_day || undefined, taskId: r.task_id || undefined });
export const getCalendarEvents = async (): Promise<CalendarEvent[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('calendar_events').select('*');
    return (handleSupabaseError({ data, error }, 'getCalendarEvents') || []).map(mapEventFromDb);
};
export const addCalendarEvent = async (event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> => {
    if (!supabase) throw new Error("Supabase not initialized");
    const dbData: Database['public']['Tables']['calendar_events']['Insert'] = { title: event.title, start: event.start, end: event.end, description: event.description, attendees: event.attendees as unknown as Json, is_all_day: event.isAllDay, task_id: event.taskId };
    const { data, error } = await supabase.from('calendar_events').insert([dbData]).select().single();
    return mapEventFromDb(handleSupabaseError({ data, error }, 'addCalendarEvent'));
};
export const updateCalendarEvent = async (event: CalendarEvent): Promise<CalendarEvent> => {
    if (!supabase) throw new Error("Supabase not initialized");
    const { id, ...rest } = event;
    const dbData: Database['public']['Tables']['calendar_events']['Update'] = { title: rest.title, start: rest.start, end: rest.end, description: rest.description, attendees: rest.attendees as unknown as Json, is_all_day: rest.isAllDay, task_id: rest.taskId };
    const { data, error } = await supabase.from('calendar_events').update(dbData).eq('id', id).select().single();
    return mapEventFromDb(handleSupabaseError({ data, error }, 'updateCalendarEvent'));
};
export const deleteCalendarEvent = (id: string) => supabase?.from('calendar_events').delete().eq('id', id);


// --- Leave Requests ---
const mapLeaveFromDb = (r: LeaveRequestRow): LeaveRequest => ({ id: r.id, employeeId: r.employee_id, employeeName: r.employee_name, leaveType: r.leave_type as LeaveType, startDate: r.start_date, endDate: r.end_date, reason: r.reason || undefined, status: r.status as LeaveRequestStatus, requestedDate: r.requested_date, approverId: r.approver_id || undefined, approverName: r.approver_name || undefined, approvedDate: r.approved_date || undefined, notes: r.notes || undefined, durationInDays: r.duration_in_days || undefined });
export const getLeaveRequests = async (): Promise<LeaveRequest[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('leave_requests').select('*').order('requested_date', { ascending: false });
    return (handleSupabaseError({data, error}, 'getLeaveRequests') || []).map(mapLeaveFromDb);
};
export const addLeaveRequest = async (req: Omit<LeaveRequest, 'id'>): Promise<LeaveRequest> => {
    if (!supabase) throw new Error("Supabase not initialized");
    const dbData: Database['public']['Tables']['leave_requests']['Insert'] = { employee_id: req.employeeId, employee_name: req.employeeName, leave_type: req.leaveType, start_date: req.startDate, end_date: req.endDate, reason: req.reason, status: req.status, requested_date: req.requestedDate, approver_id: req.approverId, approver_name: req.approverName, approved_date: req.approvedDate, notes: req.notes, duration_in_days: req.durationInDays };
    const { data, error } = await supabase.from('leave_requests').insert([dbData]).select().single();
    return mapLeaveFromDb(handleSupabaseError({data, error}, 'addLeaveRequest'));
};
export const updateLeaveRequest = async (req: LeaveRequest): Promise<LeaveRequest> => {
    if (!supabase) throw new Error("Supabase not initialized");
    const { id, ...rest } = req;
    const dbData: Database['public']['Tables']['leave_requests']['Update'] = { employee_id: rest.employeeId, employee_name: rest.employeeName, leave_type: rest.leaveType, start_date: rest.startDate, end_date: rest.endDate, reason: rest.reason, status: rest.status, requested_date: rest.requestedDate, approver_id: rest.approverId, approver_name: rest.approverName, approved_date: rest.approvedDate, notes: rest.notes, duration_in_days: rest.durationInDays };
    const { data, error } = await supabase.from('leave_requests').update(dbData).eq('id', id).select().single();
    return mapLeaveFromDb(handleSupabaseError({data, error}, 'updateLeaveRequest'));
};
export const deleteLeaveRequest = (id: string) => supabase?.from('leave_requests').delete().eq('id', id);

// --- Cash Advance ---
const mapCashAdvanceFromDb = (r: CashAdvanceRequestRow): CashAdvanceRequest => ({ id: r.id, employeeId: r.employee_id, employeeName: r.employee_name, employeeCode: r.employee_code || undefined, requestDate: r.request_date, amount: r.amount, reason: r.reason, status: r.status as CashAdvanceRequestStatus, approverId: r.approver_id || undefined, approverName: r.approver_name || undefined, approvalDate: r.approval_date || undefined, notes: r.notes || undefined, paymentDate: r.payment_date || undefined });
export const getCashAdvanceRequests = async (): Promise<CashAdvanceRequest[]> => {
    if(!supabase) return [];
    const {data, error} = await supabase.from('cash_advance_requests').select('*').order('request_date', {ascending: false});
    return (handleSupabaseError({data, error}, 'getCashAdvanceRequests') || []).map(mapCashAdvanceFromDb);
};
export const addCashAdvanceRequest = async (req: Omit<CashAdvanceRequest, 'id'>): Promise<CashAdvanceRequest> => {
    if (!supabase) throw new Error("Supabase not initialized");
    const dbData: Database['public']['Tables']['cash_advance_requests']['Insert'] = { employee_id: req.employeeId, employee_name: req.employeeName, employee_code: req.employeeCode, request_date: req.requestDate, amount: req.amount, reason: req.reason, status: req.status, approver_id: req.approverId, approver_name: req.approverName, approval_date: req.approvalDate, notes: req.notes, payment_date: req.paymentDate };
    const { data, error } = await supabase.from('cash_advance_requests').insert([dbData]).select().single();
    return mapCashAdvanceFromDb(handleSupabaseError({data, error}, 'addCashAdvanceRequest'));
};
export const updateCashAdvanceRequest = async (req: CashAdvanceRequest): Promise<CashAdvanceRequest> => {
    if (!supabase) throw new Error("Supabase not initialized");
    const { id, ...rest } = req;
    const dbData: Database['public']['Tables']['cash_advance_requests']['Update'] = { employee_id: rest.employeeId, employee_name: rest.employeeName, employee_code: rest.employeeCode, request_date: rest.requestDate, amount: rest.amount, reason: rest.reason, status: rest.status, approver_id: rest.approverId, approver_name: rest.approverName, approval_date: rest.approvalDate, notes: rest.notes, payment_date: rest.paymentDate };
    const { data, error } = await supabase.from('cash_advance_requests').update(dbData).eq('id', id).select().single();
    return mapCashAdvanceFromDb(handleSupabaseError({data, error}, 'updateCashAdvanceRequest'));
};
export const deleteCashAdvanceRequest = (id: string) => supabase?.from('cash_advance_requests').delete().eq('id', id);

// --- Payroll ---
const mapPayrollComponentFromDb = (r: PayrollComponentRow): PayrollComponent => ({ id: r.id, name: r.name, type: r.type as any, isTaxable: r.is_taxable || undefined, defaultAmount: r.default_amount || undefined, defaultRate: r.default_rate || undefined, calculationBasis: r.calculation_basis as any, cap: r.cap || undefined, isSystemCalculated: r.is_system_calculated || undefined });
export const getPayrollComponents = async (): Promise<PayrollComponent[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('payroll_components').select('*');
    return (handleSupabaseError({ data, error }, 'getPayrollComponents') || []).map(mapPayrollComponentFromDb);
};
export const addPayrollComponent = async (comp: Omit<PayrollComponent, 'id'>): Promise<PayrollComponent> => {
    if(!supabase) throw new Error("Supabase not initialized");
    const dbData: Database['public']['Tables']['payroll_components']['Insert'] = { name: comp.name, type: comp.type, is_taxable: comp.isTaxable, default_amount: comp.defaultAmount, default_rate: comp.defaultRate, calculation_basis: comp.calculationBasis, cap: comp.cap, is_system_calculated: comp.isSystemCalculated };
    const { data, error } = await supabase.from('payroll_components').insert([dbData]).select().single();
    return mapPayrollComponentFromDb(handleSupabaseError({ data, error }, 'addPayrollComponent'));
};
export const updatePayrollComponent = async (comp: PayrollComponent): Promise<PayrollComponent> => {
    if(!supabase) throw new Error("Supabase not initialized");
    const { id, ...rest } = comp;
    const dbData: Database['public']['Tables']['payroll_components']['Update'] = { name: rest.name, type: rest.type, is_taxable: rest.isTaxable, default_amount: rest.defaultAmount, default_rate: rest.defaultRate, calculation_basis: rest.calculationBasis, cap: rest.cap, is_system_calculated: rest.isSystemCalculated };
    const { data, error } = await supabase.from('payroll_components').update(dbData).eq('id', id).select().single();
    return mapPayrollComponentFromDb(handleSupabaseError({ data, error }, 'updatePayrollComponent'));
};
export const deletePayrollComponent = (id: string) => supabase?.from('payroll_components').delete().eq('id', id);
export const getAllPayrollComponents = getPayrollComponents; // Alias

const mapPayrollRunFromDb = (r: PayrollRunRow): PayrollRun => ({ id: r.id, periodMonth: r.period_month, periodYear: r.period_year, status: r.status as any, dateCreated: r.date_created, dateApproved: r.date_approved || undefined, datePaid: r.date_paid || undefined, payslipIds: r.payslip_ids || [], totalEmployees: r.total_employees, totalGrossPay: r.total_gross_pay, totalDeductions: r.total_deductions, totalNetPay: r.total_net_pay, notes: r.notes || undefined });
export const getPayrollRuns = async (): Promise<PayrollRun[]> => {
    if(!supabase) return [];
    const {data, error} = await supabase.from('payroll_runs').select('*').order('date_created', {ascending: false});
    return (handleSupabaseError({data, error}, 'getPayrollRuns') || []).map(mapPayrollRunFromDb);
};
export const getPayrollRunById = async (id: string): Promise<PayrollRun | null> => {
    if(!supabase) return null;
    const {data, error} = await supabase.from('payroll_runs').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') handleSupabaseError({data, error}, 'getPayrollRunById');
    return data ? mapPayrollRunFromDb(data) : null;
};
export const addPayrollRun = async (run: Omit<PayrollRun, 'id'>): Promise<PayrollRun> => {
    if (!supabase) throw new Error("Supabase not initialized");
    const dbData: Database['public']['Tables']['payroll_runs']['Insert'] = { period_month: run.periodMonth, period_year: run.periodYear, status: run.status, date_created: run.dateCreated, date_approved: run.dateApproved, date_paid: run.datePaid, payslip_ids: run.payslipIds, total_employees: run.totalEmployees, total_gross_pay: run.totalGrossPay, total_deductions: run.totalDeductions, total_net_pay: run.totalNetPay, notes: run.notes };
    const { data, error } = await supabase.from('payroll_runs').insert([dbData]).select().single();
    return mapPayrollRunFromDb(handleSupabaseError({ data, error }, 'addPayrollRun'));
};
export const updatePayrollRun = async (run: PayrollRun): Promise<PayrollRun> => {
    if (!supabase) throw new Error("Supabase not initialized");
    const { id, ...rest } = run;
    const dbData: Database['public']['Tables']['payroll_runs']['Update'] = { period_month: rest.periodMonth, period_year: rest.periodYear, status: rest.status, date_created: rest.dateCreated, date_approved: rest.dateApproved, date_paid: rest.datePaid, payslip_ids: rest.payslipIds, total_employees: rest.totalEmployees, total_gross_pay: rest.totalGrossPay, total_deductions: rest.totalDeductions, total_net_pay: rest.totalNetPay, notes: rest.notes };
    const { data, error } = await supabase.from('payroll_runs').update(dbData).eq('id', id).select().single();
    return mapPayrollRunFromDb(handleSupabaseError({ data, error }, 'updatePayrollRun'));
};
export const deletePayrollRun = async (id: string) => {
    if (!supabase) throw new Error("Supabase not initialized");
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

const mapPayslipToDb = (p: Partial<Payslip>): Database['public']['Tables']['payslips']['Insert'] => ({ id: p.id, payroll_run_id: p.payrollRunId!, employee_id: p.employeeId!, employee_name: p.employeeName!, employee_code: p.employeeCode, employee_department: p.employeeDepartment, employee_position: p.employeePosition, employee_tax_id: p.employeeTaxId, employee_ssn: p.employeeSsn, employee_joining_date: p.employeeJoiningDate, pay_period: p.payPeriod!, base_salary: p.baseSalary!, gross_pay: p.grossPay!, tax_deduction: p.taxDeduction!, social_security_deduction: p.socialSecurityDeduction!, provident_fund_deduction: p.providentFundDeduction!, other_deductions: p.otherDeductions as unknown as Json, total_deductions: p.totalDeductions!, net_pay: p.netPay!, bank_name: p.bankName, bank_account_number: p.bankAccountNumber, payment_date: p.paymentDate, overtime_hours: p.overtimeHours, overtime_rate: p.overtimeRate, overtime_pay: p.overtimePay, allowances: p.allowances as unknown as Json });
export const getPayslipsForRun = async (runId: string): Promise<Payslip[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('payslips').select('*').eq('payroll_run_id', runId);
    return (handleSupabaseError({ data, error }, 'getPayslipsForRun') || []).map(mapPayslipFromDb);
};
export const getPayslipsForEmployee = async (employeeId: string): Promise<Payslip[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('payslips').select('*').eq('employee_id', employeeId).order('pay_period', {ascending: false});
    return (handleSupabaseError({ data, error }, 'getPayslipsForEmployee') || []).map(mapPayslipFromDb);
};
export const addPayslip = async (payslip: Payslip) => {
    if(!supabase) throw new Error("Supabase not initialized");
    const { data, error } = await supabase.from('payslips').insert([mapPayslipToDb(payslip)]);
    return handleSupabaseError({data, error}, 'addPayslip');
};
export const updatePayslip = async (payslip: Payslip) => {
    if(!supabase) throw new Error("Supabase not initialized");
    const {id, ...rest} = payslip;
    const dbData: Database['public']['Tables']['payslips']['Update'] = {
        payroll_run_id: rest.payrollRunId,
        employee_id: rest.employeeId,
        employee_name: rest.employeeName,
        employee_code: rest.employeeCode,
        employee_department: rest.employeeDepartment,
        employee_position: rest.employeePosition,
        employee_tax_id: rest.employeeTaxId,
        employee_ssn: rest.employeeSsn,
        employee_joining_date: rest.employeeJoiningDate,
        pay_period: rest.payPeriod,
        base_salary: rest.baseSalary,
        overtime_hours: rest.overtimeHours,
        overtime_rate: rest.overtimeRate,
        overtime_pay: rest.overtimePay,
        allowances: rest.allowances as unknown as Json,
        gross_pay: rest.grossPay,
        tax_deduction: rest.taxDeduction,
        social_security_deduction: rest.socialSecurityDeduction,
        provident_fund_deduction: rest.providentFundDeduction,
        other_deductions: rest.otherDeductions as unknown as Json,
        total_deductions: rest.totalDeductions,
        net_pay: rest.netPay,
        bank_name: rest.bankName,
        bank_account_number: rest.bankAccountNumber,
        payment_date: rest.paymentDate
    };
    const { data, error } = await supabase.from('payslips').update(dbData).eq('id', id);
    return handleSupabaseError({data, error}, 'updatePayslip');
};
export const deletePayslip = (id: string) => supabase?.from('payslips').delete().eq('id', id);


// --- Settings ---
export const getSetting = async (key: string): Promise<any | null> => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('settings').select('value').eq('key', key).single();
    if (error && error.code !== 'PGRST116') handleSupabaseError({data, error}, 'getSetting');
    return data ? data.value : null;
};
export const saveSetting = async (key: string, value: any): Promise<void> => {
     if (!supabase) throw new Error("Supabase client not initialized");
    const dbData: Database['public']['Tables']['settings']['Insert'] = { key, value: value as unknown as Json };
    const { error } = await supabase.from('settings').upsert([dbData]);
    if (error) handleSupabaseError({ data: null, error }, 'saveSetting');
};
