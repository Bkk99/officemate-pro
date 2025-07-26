// services/realisticMockData.ts
import { 
    Employee, TimeLog, InventoryItem, StockTransaction, PurchaseOrder, Document, CalendarEvent, 
    PayrollRun, Payslip, PayrollComponent, LeaveRequest, ChatMessage, CashAdvanceRequest, UserRole,
    EmployeeStatusKey, POStatusKey, DocumentStatusKey, DocumentType, PayrollRunStatus, LeaveType, LeaveRequestStatus, CashAdvanceRequestStatus, ManagedUser
} from '../types';
import { DEPARTMENTS, POSITIONS, DEFAULT_PAYROLL_COMPONENTS, AI_ASSISTANT_ROOM_ID } from '../constants';

const today = new Date();
const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 15);
const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1);
const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
const yesterday = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000);

export const mockEmployees: Employee[] = [
    {
        id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', name: 'นาย สมชาย ใจดี', nameEn: 'Somchai Jaidee', email: 'admin@officemate.com', phone: '0812345678', department: 'บริหาร', position: 'ผู้จัดการทั่วไป', status: 'Active' as EmployeeStatusKey, hireDate: '2020-01-15T00:00:00Z', role: UserRole.ADMIN,
        employeeCode: 'EMP001', baseSalary: 85000, bankName: 'ธนาคารกสิกรไทย', bankAccountNumber: '123-4-56789-0', taxId: '1234567890123', socialSecurityNumber: '1-2345-67890-12-3', providentFundRateEmployee: 5, providentFundRateEmployer: 5,
        recurringAllowances: [{id: 'allow-1', name: 'ค่าตำแหน่ง', amount: 10000, payrollComponentId: 'comp_skill'}, {id: 'allow-2', name: 'ค่าเดินทาง', amount: 5000, payrollComponentId: 'comp_travel'}], recurringDeductions: [], fingerprintScannerId: 'FP001',
    },
    {
        id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1', name: 'นางสาว พรทิพย์ สุขเกษม', nameEn: 'Porntip Sukkasem', email: 'hr.manager@officemate.com', phone: '0898765432', department: 'ฝ่ายบุคคล', position: 'ผู้จัดการฝ่ายบุคคล', status: 'Active' as EmployeeStatusKey, hireDate: '2021-03-01T00:00:00Z', role: UserRole.MANAGER,
        employeeCode: 'EMP002', baseSalary: 65000, bankName: 'ธนาคารไทยพาณิชย์', bankAccountNumber: '987-6-54321-0', taxId: '2345678901234', socialSecurityNumber: '2-3456-78901-23-4', providentFundRateEmployee: 3, providentFundRateEmployer: 3,
        recurringAllowances: [{id: 'allow-3', name: 'ค่าเดินทาง', amount: 3000, payrollComponentId: 'comp_travel'}], recurringDeductions: [], fingerprintScannerId: 'FP002'
    },
    {
        id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef12', name: 'นาย อาทิตย์ ตั้งใจ', nameEn: 'Artit Tangjai', email: 'it.staff@officemate.com', phone: '0911223344', department: 'ฝ่ายไอที', position: 'เจ้าหน้าที่ไอที', status: 'Active' as EmployeeStatusKey, hireDate: '2022-06-20T00:00:00Z', role: UserRole.STAFF,
        employeeCode: 'EMP003', baseSalary: 28000, bankName: 'ธนาคารกรุงเทพ', bankAccountNumber: '111-2-33333-4', taxId: '3456789012345', socialSecurityNumber: '3-4567-89012-34-5', providentFundRateEmployee: 3, providentFundRateEmployer: 3,
        recurringAllowances: [{id: 'allow-4', name: 'ค่าทักษะพิเศษ', amount: 2500, payrollComponentId: 'comp_skill'}], recurringDeductions: [], fingerprintScannerId: 'FP003', passportNumber: 'AB1234567', passportExpiryDate: '2028-12-31T00:00:00Z'
    },
    {
        id: 'd4e5f6a7-b8c9-0123-4567-890abcdef123', name: 'นางสาว มานี ชูใจ', nameEn: 'Manee Chujai', email: 'sales1@officemate.com', phone: '0855667788', department: 'ฝ่ายขาย', position: 'พนักงานขาย', status: 'Active' as EmployeeStatusKey, hireDate: '2023-01-10T00:00:00Z', role: UserRole.STAFF,
        employeeCode: 'EMP004', baseSalary: 22000, bankName: 'ธนาคารกสิกรไทย', bankAccountNumber: '222-3-44444-5', taxId: '4567890123456', socialSecurityNumber: '4-5678-90123-45-6', providentFundRateEmployee: 0, providentFundRateEmployer: 0,
        recurringAllowances: [], recurringDeductions: [], fingerprintScannerId: 'FP004'
    },
    {
        id: 'e5f6a7b8-c9d0-1234-5678-90abcdef1234', name: 'นาย ปิติ ยินดี', nameEn: 'Piti Yindee', email: 'operation@officemate.com', phone: '0876543210', department: 'ฝ่ายปฏิบัติการ', position: 'พนักงาน', status: 'On Leave' as EmployeeStatusKey, hireDate: '2022-11-05T00:00:00Z', role: UserRole.STAFF,
        employeeCode: 'EMP005', baseSalary: 25000, bankName: 'ธนาคารกรุงไทย', bankAccountNumber: '333-4-55555-6', taxId: '5678901234567', socialSecurityNumber: '5-6789-01234-56-7', providentFundRateEmployee: 3, providentFundRateEmployer: 3,
        recurringAllowances: [], recurringDeductions: [], fingerprintScannerId: 'FP005'
    },
];

export const mockManagedUsers: ManagedUser[] = mockEmployees.map(e => ({
    id: e.id,
    full_name: e.name,
    username: e.email,
    role: e.role,
    updated_at: e.updated_at || new Date().toISOString()
}));

export const mockInventoryItems: InventoryItem[] = [
    { id: 'inv-001', name: 'กระดาษ A4 Double A (80 แกรม)', sku: 'SKU-P-A4-DA', category: 'General', quantity: 50, unitPrice: 120, supplier: 'OfficeMate', lastUpdated: new Date().toISOString() },
    { id: 'inv-002', name: 'ปากกาลูกลื่น Quantum (น้ำเงิน)', sku: 'SKU-PN-QT-BL', category: 'General', quantity: 200, unitPrice: 5, supplier: 'B2S', lastUpdated: new Date().toISOString() },
    { id: 'inv-003', name: 'หมึกพิมพ์ HP LaserJet 85A', sku: 'SKU-T-HP-85A', category: 'อุปกรณ์ IT', quantity: 15, unitPrice: 2500, supplier: 'JIB Computer', lastUpdated: new Date().toISOString() },
    { id: 'inv-004', name: 'Laptop Dell Latitude 5440', sku: 'SKU-LT-DELL-5440', category: 'อุปกรณ์ IT', quantity: 8, unitPrice: 35000, supplier: 'Dell Thailand', lastUpdated: new Date().toISOString() },
    { id: 'inv-005', name: 'คีย์บอร์ด Logitech K120', sku: 'SKU-KB-LOGI-K120', category: 'อุปกรณ์ IT', quantity: 25, unitPrice: 250, supplier: 'Advice IT', lastUpdated: new Date().toISOString() },
];

export const mockStockTransactions: StockTransaction[] = [
    { id: 'st-1', itemId: 'inv-001', itemName: 'กระดาษ A4 Double A (80 แกรม)', type: 'IN', quantity: 20, reason: 'รับสินค้าจากการซื้อ', date: threeDaysAgo.toISOString(), employeeId: mockEmployees[1].id, employeeName: mockEmployees[1].name },
    { id: 'st-2', itemId: 'inv-005', itemName: 'คีย์บอร์ด Logitech K120', type: 'OUT', quantity: 1, reason: 'เบิกใช้ภายใน', date: yesterday.toISOString(), employeeId: mockEmployees[2].id, employeeName: mockEmployees[2].name },
    { id: 'st-3', itemId: 'inv-004', itemName: 'Laptop Dell Latitude 5440', type: 'OUT', quantity: 1, reason: 'เบิกสำหรับพนักงานใหม่', date: yesterday.toISOString(), employeeId: mockEmployees[2].id, employeeName: mockEmployees[2].name },
];

export const mockPurchaseOrders: PurchaseOrder[] = [
    { id: 'po-1', poNumber: 'PO-202407-001', supplier: 'JIB Computer', items: [{itemId: 'inv-003', itemName: 'หมึกพิมพ์ HP LaserJet 85A', quantity: 10, unitPrice: 2450}], totalAmount: 24500, status: 'Completed' as POStatusKey, orderDate: lastWeek.toISOString(), expectedDeliveryDate: threeDaysAgo.toISOString() },
    { id: 'po-2', poNumber: 'PO-202407-002', supplier: 'OfficeMate', items: [{itemId: 'inv-001', itemName: 'กระดาษ A4 Double A (80 แกรม)', quantity: 50, unitPrice: 115}, {itemId: 'inv-002', itemName: 'ปากกาลูกลื่น Quantum (น้ำเงิน)', quantity: 100, unitPrice: 4.5}], totalAmount: 6200, status: 'Pending' as POStatusKey, orderDate: yesterday.toISOString(), expectedDeliveryDate: new Date(today.getTime() + 5 * 24*60*60*1000).toISOString() },
];

export const mockDocuments: Document[] = [
    { id: 'doc-1', docNumber: 'QUO-202407-001', type: DocumentType.QUOTATION, clientName: 'บริษัท ลูกค้าดีเด่น จำกัด', projectName: 'โครงการพัฒนาระบบใหม่', date: lastWeek.toISOString(), amount: 150000, status: 'Sent' as DocumentStatusKey },
    { id: 'doc-2', docNumber: 'INV-202406-015', type: DocumentType.INVOICE, clientName: 'บริษัท ขยันทำงาน จำกัด', projectName: 'ค่าบริการดูแลระบบเดือน มิ.ย.', date: twoMonthsAgo.toISOString(), amount: 35000, status: 'Paid' as DocumentStatusKey },
];

export const mockLeaveRequests: LeaveRequest[] = [
    { id: 'lr-1', employeeId: mockEmployees[2].id, employeeName: mockEmployees[2].name, leaveType: LeaveType.SICK, startDate: yesterday.toISOString(), endDate: yesterday.toISOString(), reason: 'มีไข้ ไม่สบาย', status: LeaveRequestStatus.APPROVED, requestedDate: yesterday.toISOString(), approverId: mockEmployees[1].id, approverName: mockEmployees[1].name, approvedDate: yesterday.toISOString(), durationInDays: 1 },
    { id: 'lr-2', employeeId: mockEmployees[3].id, employeeName: mockEmployees[3].name, leaveType: LeaveType.ANNUAL, startDate: new Date(today.getTime() + 10 * 24*60*60*1000).toISOString(), endDate: new Date(today.getTime() + 14 * 24*60*60*1000).toISOString(), reason: 'ไปเที่ยวพักผ่อน', status: LeaveRequestStatus.PENDING, requestedDate: threeDaysAgo.toISOString(), durationInDays: 5 },
    { id: 'lr-3', employeeId: mockEmployees[0].id, employeeName: mockEmployees[0].name, leaveType: LeaveType.PERSONAL, startDate: today.toISOString(), endDate: today.toISOString(), reason: 'ทำธุระส่วนตัว', status: LeaveRequestStatus.APPROVED, requestedDate: yesterday.toISOString(), approverId: mockEmployees[0].id, approverName: mockEmployees[0].name, approvedDate: yesterday.toISOString(), durationInDays: 1 },
];

export const mockCashAdvanceRequests: CashAdvanceRequest[] = [
    { id: 'ca-1', employeeId: mockEmployees[3].id, employeeName: mockEmployees[3].name, employeeCode: mockEmployees[3].employeeCode, requestDate: threeDaysAgo.toISOString(), amount: 3000, reason: 'ค่าเดินทางไปพบลูกค้าต่างจังหวัด', status: CashAdvanceRequestStatus.APPROVED, approverId: mockEmployees[0].id, approverName: mockEmployees[0].name, approvalDate: yesterday.toISOString() },
    { id: 'ca-2', employeeId: mockEmployees[2].id, employeeName: mockEmployees[2].name, employeeCode: mockEmployees[2].employeeCode, requestDate: yesterday.toISOString(), amount: 1500, reason: 'ค่าอุปกรณ์ IT ฉุกเฉิน', status: CashAdvanceRequestStatus.PENDING },
];

export const mockTimeLogs: TimeLog[] = [
    { id: 'tl-1', employeeId: mockEmployees[2].id, employeeName: mockEmployees[2].name, clockIn: new Date(yesterday.setHours(8, 55)).toISOString(), clockOut: new Date(yesterday.setHours(18, 2)).toISOString(), source: 'Scanner' },
    { id: 'tl-2', employeeId: mockEmployees[3].id, employeeName: mockEmployees[3].name, clockIn: new Date(yesterday.setHours(9, 5)).toISOString(), clockOut: new Date(yesterday.setHours(18, 1)).toISOString(), source: 'Scanner' },
    { id: 'tl-3', employeeId: mockEmployees[0].id, employeeName: mockEmployees[0].name, clockIn: new Date(yesterday.setHours(8, 30)).toISOString(), clockOut: new Date(yesterday.setHours(17, 35)).toISOString(), source: 'Manual', notes: 'ประชุมนอกสถานที่ช่วงเช้า' },
];

export const mockPayrollRuns: PayrollRun[] = [
    { id: 'run-1', periodMonth: lastMonth.getMonth() + 1, periodYear: lastMonth.getFullYear(), status: PayrollRunStatus.PAID, dateCreated: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 25).toISOString(), datePaid: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 28).toISOString(), payslipIds: mockEmployees.filter(e=>e.status==='Active').map(e => `ps-run1-${e.id}`), totalEmployees: 4, totalGrossPay: 206000, totalDeductions: 25000, totalNetPay: 181000 },
    { id: 'run-2', periodMonth: today.getMonth() + 1, periodYear: today.getFullYear(), status: PayrollRunStatus.DRAFT, dateCreated: new Date(today.getFullYear(), today.getMonth(), 25).toISOString(), payslipIds: mockEmployees.filter(e=>e.status==='Active').map(e => `ps-run2-${e.id}`), totalEmployees: 4, totalGrossPay: 206000, totalDeductions: 25000, totalNetPay: 181000 },
];

export const mockPayslips: Payslip[] = [
    // Dummy payslips for run-1 (Paid)
    { id: `ps-run1-${mockEmployees[0].id}`, payrollRunId: 'run-1', employeeId: mockEmployees[0].id, employeeName: mockEmployees[0].name, payPeriod: '...Previous Month...', baseSalary: 85000, allowances: [], grossPay: 100000, taxDeduction: 10000, socialSecurityDeduction: 750, providentFundDeduction: 4250, otherDeductions: [], totalDeductions: 15000, netPay: 85000, paymentDate: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 28).toISOString() },
    { id: `ps-run1-${mockEmployees[1].id}`, payrollRunId: 'run-1', employeeId: mockEmployees[1].id, employeeName: mockEmployees[1].name, payPeriod: '...Previous Month...', baseSalary: 65000, allowances: [], grossPay: 68000, taxDeduction: 5000, socialSecurityDeduction: 750, providentFundDeduction: 1950, otherDeductions: [], totalDeductions: 7700, netPay: 60300, paymentDate: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 28).toISOString() },
    // More detailed for run-2 (Draft)
    { id: `ps-run2-${mockEmployees[0].id}`, payrollRunId: 'run-2', employeeId: mockEmployees[0].id, employeeName: mockEmployees[0].name, payPeriod: `${new Date(today.getFullYear(), today.getMonth()).toLocaleString('th-TH', { month: 'long' })} ${today.getFullYear() + 543}`, baseSalary: 85000, allowances: [{name: 'ค่าตำแหน่ง', amount: 10000, payrollComponentId: 'comp_skill'}, {name: 'ค่าเดินทาง', amount: 5000, payrollComponentId: 'comp_travel'}], grossPay: 100000, taxDeduction: 9854.17, socialSecurityDeduction: 750, providentFundDeduction: 4250, otherDeductions: [], totalDeductions: 14854.17, netPay: 85145.83, employeeCode: 'EMP001', employeeDepartment: 'บริหาร' },
    { id: `ps-run2-${mockEmployees[1].id}`, payrollRunId: 'run-2', employeeId: mockEmployees[1].id, employeeName: mockEmployees[1].name, payPeriod: `${new Date(today.getFullYear(), today.getMonth()).toLocaleString('th-TH', { month: 'long' })} ${today.getFullYear() + 543}`, baseSalary: 65000, allowances: [{name: 'ค่าเดินทาง', amount: 3000, payrollComponentId: 'comp_travel'}], grossPay: 68000, taxDeduction: 4129.17, socialSecurityDeduction: 750, providentFundDeduction: 1950, otherDeductions: [], totalDeductions: 6829.17, netPay: 61170.83, employeeCode: 'EMP002', employeeDepartment: 'ฝ่ายบุคคล' },
    { id: `ps-run2-${mockEmployees[2].id}`, payrollRunId: 'run-2', employeeId: mockEmployees[2].id, employeeName: mockEmployees[2].name, payPeriod: `${new Date(today.getFullYear(), today.getMonth()).toLocaleString('th-TH', { month: 'long' })} ${today.getFullYear() + 543}`, baseSalary: 28000, allowances: [{name: 'ค่าทักษะพิเศษ', amount: 2500, payrollComponentId: 'comp_skill'}], grossPay: 30500, taxDeduction: 120.83, socialSecurityDeduction: 750, providentFundDeduction: 840, otherDeductions: [], totalDeductions: 1710.83, netPay: 28789.17, employeeCode: 'EMP003', employeeDepartment: 'ฝ่ายไอที' },
    { id: `ps-run2-${mockEmployees[3].id}`, payrollRunId: 'run-2', employeeId: mockEmployees[3].id, employeeName: mockEmployees[3].name, payPeriod: `${new Date(today.getFullYear(), today.getMonth()).toLocaleString('th-TH', { month: 'long' })} ${today.getFullYear() + 543}`, baseSalary: 22000, allowances: [], grossPay: 22000, taxDeduction: 0, socialSecurityDeduction: 750, providentFundDeduction: 0, otherDeductions: [], totalDeductions: 750, netPay: 21250, employeeCode: 'EMP004', employeeDepartment: 'ฝ่ายขาย' },
];

export const mockCalendarEvents: CalendarEvent[] = [
    { id: 'evt-1', title: 'ประชุมทีมผู้บริหารประจำสัปดาห์', start: new Date(today.setDate(today.getDate() - today.getDay() + 1)).setHours(10,0,0,0).toString(), end: new Date(today.setDate(today.getDate() - today.getDay() + 1)).setHours(11,0,0,0).toString(), attendees: [{employeeId: mockEmployees[0].id, employeeName: mockEmployees[0].name}, {employeeId: mockEmployees[1].id, employeeName: mockEmployees[1].name}]},
    { id: 'evt-2', title: 'ส่งรายงานสรุปยอดขาย', start: new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString(), end: new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString(), isAllDay: true, attendees: []},
    { id: 'evt-3', title: 'อบรมการใช้งานระบบ Officemate Pro', start: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).setHours(14,0,0,0).toString(), end: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).setHours(16,0,0,0).toString(), attendees: mockEmployees.map(e => ({employeeId: e.id, employeeName: e.name}))}
];

export const mockChatMessages: ChatMessage[] = [
    { id: 'chat-gen-1', roomId: 'general', senderId: mockEmployees[1].id, senderName: mockEmployees[1].name, timestamp: threeDaysAgo.toISOString(), text: 'สวัสดีค่ะทุกคน ขอแจ้งว่าวันศุกร์นี้จะมีการทำความสะอาดออฟฟิศครั้งใหญ่ช่วงเย็นนะคะ' },
    { id: 'chat-gen-2', roomId: 'general', senderId: mockEmployees[2].id, senderName: mockEmployees[2].name, timestamp: threeDaysAgo.toISOString(), text: 'รับทราบครับผม' },
    { id: 'chat-ai-1', roomId: AI_ASSISTANT_ROOM_ID, senderId: mockEmployees[3].id, senderName: mockEmployees[3].name, timestamp: yesterday.toISOString(), text: 'ช่วยร่างอีเมลแจ้งลูกค้าเรื่องวันหยุดยาวหน่อยครับ' },
    { id: 'chat-ai-2', roomId: AI_ASSISTANT_ROOM_ID, senderId: 'ai-assistant', senderName: 'AI Assistant', timestamp: yesterday.toISOString(), text: 'ได้เลยครับ นี่คือฉบับร่างครับ:\n\nเรื่อง: แจ้งวันหยุดทำการบริษัท\n\nเรียน ลูกค้าผู้มีอุปการคุณ,\n\nเนื่องในวันหยุดนักขัตฤกษ์ บริษัทจะปิดทำการในวันที่ [วันที่] และจะเปิดให้บริการตามปกติในวันที่ [วันที่]\n\nขออภัยในความไม่สะดวกมา ณ ที่นี้ครับ' },
];

export const mockPayrollComponents: PayrollComponent[] = DEFAULT_PAYROLL_COMPONENTS;
