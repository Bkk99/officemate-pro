import { User, UserRole, Employee, TimeLog, InventoryItem, StockTransaction, PurchaseOrder, Document, DocumentType, CalendarEvent, PayrollRun, Payslip, PayrollRunStatus, TaxBracket, PayslipItem, EmployeeAllowance, EmployeeDeduction, PayrollComponent, EditPayslipFormData, FingerprintScannerSettings, LeaveRequest, LeaveType, LeaveRequestStatus, ChatMessage } from '../types';
import { DEPARTMENTS, POSITIONS, EMPLOYEE_STATUSES, PO_STATUSES, DOCUMENT_TYPES_ARRAY, DOCUMENT_STATUSES, STOCK_TRANSACTION_REASONS as INITIAL_STOCK_REASONS, SOCIAL_SECURITY_RATE, SOCIAL_SECURITY_CAP_MONTHLY_SALARY, SOCIAL_SECURITY_MIN_MONTHLY_SALARY, CURRENT_YEAR, STANDARD_DEDUCTION_ANNUAL, PERSONAL_ALLOWANCE_ANNUAL, MOCK_TAX_BRACKETS_SIMPLIFIED, DEFAULT_PAYROLL_COMPONENTS, MONTH_OPTIONS, LEAVE_TYPES_TH, CHAT_ROOMS_SAMPLE } from '../constants';
import { dispatchChatNotification } from './notificationService'; // Added import

// --- Users ---
export let MOCK_USERS: User[] = [
  { id: 'user1', username: 'admin', name: 'ผู้ดูแลระบบ', role: UserRole.ADMIN, department: DEPARTMENTS[7]},
  { id: 'user2', username: 'manager', name: 'ผู้จัดการฝ่ายบุคคล', role: UserRole.MANAGER, department: DEPARTMENTS[3] },
  { id: 'user3', username: 'staff', name: 'สมชาย ใจดี', role: UserRole.STAFF, department: DEPARTMENTS[2] },
  { id: 'user4', username: 'staff2', name: 'สมหญิง มุ่งมั่น', role: UserRole.STAFF, department: DEPARTMENTS[0] },
  { id: 'user5', username: 'demo_staff1', name: 'คุณเดโม่ สต๊าฟหนึ่ง', role: UserRole.STAFF, department: DEPARTMENTS[0] }, // Sales
  { id: 'user6', username: 'demo_staff2', name: 'คุณเดโม่ สต๊าฟสอง', role: UserRole.STAFF, department: DEPARTMENTS[1] }, // Marketing
];

export const authenticateUser = (username: string, password_DUMMY: string): User | null => {
  return MOCK_USERS.find(u => u.username === username) || null;
};
export const getUserById = (id: string): User | null => MOCK_USERS.find(u => u.id === id) || null;

export const addUserAccount = (userData: Omit<User, 'id'> & { password?: string }): User => {
    const newUser: User = { ...userData, id: `user${MOCK_USERS.length + 1 + Math.floor(Math.random()*1000)}` };
    MOCK_USERS.push(newUser);
    return newUser;
};
export const updateUserAccount = (updatedUser: User): User | null => {
    const index = MOCK_USERS.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
        MOCK_USERS[index] = { ...MOCK_USERS[index], ...updatedUser };
        return MOCK_USERS[index];
    }
    return null;
};
export const deleteUserAccount = (id: string): void => {
    MOCK_USERS = MOCK_USERS.filter(u => u.id !== id);
};


// --- Employees ---
const defaultEmployeeAllowances: EmployeeAllowance[] = [
  { id: 'allow1', name: 'ค่าเดินทาง', amount: 1000, payrollComponentId: 'comp_travel' },
  { id: 'allow2', name: 'ค่าอาหาร', amount: 1500, payrollComponentId: 'comp_food' },
];

export let MOCK_EMPLOYEES: Employee[] = [
  { id: 'emp1', employeeCode: 'E0001', name: 'อลิซ วันเดอร์แลนด์', nameEn: 'Alice Wonderland', email: 'alice@example.com', phone: '081-234-5678', department: DEPARTMENTS[0], position: POSITIONS[0], status: 'Active', hireDate: '2022-01-15', profileImageUrl: 'https://picsum.photos/seed/alice/200/200', contractUrl: '#', fingerprintScannerId: 'FP001', passportNumber: 'AB1234567', passportExpiryDate: '2028-12-31',
    baseSalary: 50000, bankName: 'ธนาคารกสิกรไทย', bankAccountNumber: '123-4-56789-0', taxId: '1100000000001', socialSecurityNumber: '1234567890', providentFundRateEmployee: 3, providentFundRateEmployer: 3, recurringAllowances: defaultEmployeeAllowances, recurringDeductions: [] },
  { id: 'emp2', employeeCode: 'E0002', name: 'บ็อบ เดอะบิวเดอร์', nameEn: 'Bob Thebuilder', email: 'bob@example.com', phone: '082-345-6789', department: DEPARTMENTS[2], position: POSITIONS[1], status: 'Active', hireDate: '2021-07-20', profileImageUrl: 'https://picsum.photos/seed/bob/200/200', fingerprintScannerId: 'FP002', passportNumber: 'CD8901234', passportExpiryDate: '2027-06-15',
    baseSalary: 35000, bankName: 'ธนาคารไทยพาณิชย์', bankAccountNumber: '987-6-54321-0', taxId: '1100000000002', socialSecurityNumber: '0987654321', providentFundRateEmployee: 5, providentFundRateEmployer: 5, recurringAllowances: [{id: 'allow1', name:'ค่าเดินทาง', amount: 800, payrollComponentId: 'comp_travel'}], recurringDeductions: [] },
  { id: 'emp3', employeeCode: 'E0003', name: 'ชาร์ลี บราวน์', nameEn: 'Charlie Brown', email: 'charlie@example.com', phone: '083-456-7890', department: DEPARTMENTS[1], position: POSITIONS[3], status: 'On Leave', hireDate: '2023-03-01', profileImageUrl: 'https://picsum.photos/seed/charlie/200/200', fingerprintScannerId: '', 
    baseSalary: 25000, bankName: 'ธนาคารกรุงเทพ', bankAccountNumber: '111-2-33333-4', taxId: '1100000000003', socialSecurityNumber: '1122334455', providentFundRateEmployee: 0, providentFundRateEmployer: 0, recurringAllowances: [], recurringDeductions: [] },
   { id: 'user3', employeeCode: 'E0004', name: MOCK_USERS.find(u=>u.id==='user3')?.name || 'สมชาย ใจดี', nameEn: 'Somchai Jaidee', email: 'somchai.j@example.com', phone: '090-000-0001', department: MOCK_USERS.find(u=>u.id==='user3')?.department || DEPARTMENTS[2], position: POSITIONS[3], status: 'Active', hireDate: '2020-05-10', profileImageUrl: 'https://picsum.photos/seed/somchai/200/200', fingerprintScannerId: 'FP003', passportNumber: 'EF5678901', passportExpiryDate: '2029-01-20',
    baseSalary: 30000, bankName: 'ธนาคารกรุงศรีอยุธยา', bankAccountNumber: '555-5-55555-5', taxId: '1100000000004', socialSecurityNumber: '9988776655', providentFundRateEmployee: 2, providentFundRateEmployer: 2, recurringAllowances: defaultEmployeeAllowances, recurringDeductions: [{id: 'deduct1', name: 'ผ่อนสินค้า', amount: 1200, payrollComponentId: 'comp_loan'}] },
   { id: 'user4', employeeCode: 'E0005', name: MOCK_USERS.find(u=>u.id==='user4')?.name || 'สมหญิง มุ่งมั่น', nameEn: 'Somying Mungman', email: 'somying.m@example.com', phone: '090-000-0002', department: MOCK_USERS.find(u=>u.id==='user4')?.department || DEPARTMENTS[0], position: POSITIONS[1], status: 'Active', hireDate: '2019-11-11', profileImageUrl: 'https://picsum.photos/seed/somying/200/200', fingerprintScannerId: 'FP004',
    baseSalary: 42000, bankName: 'ธนาคารกสิกรไทย', bankAccountNumber: '222-3-44444-5', taxId: '1100000000005', socialSecurityNumber: '1231231234', providentFundRateEmployee: 4, providentFundRateEmployer: 4, recurringAllowances: [{id:'allow_skill', name:'ค่าทักษะพิเศษ', amount: 2500, payrollComponentId: 'comp_skill'}], recurringDeductions: []},
  { 
    id: 'user5', 
    employeeCode: 'E0006', 
    name: 'คุณเดโม่ สต๊าฟหนึ่ง', 
    nameEn: 'Demo Staffone',
    email: 'demo.staff1@example.com', 
    phone: '091-111-1111', 
    department: DEPARTMENTS[0], 
    position: POSITIONS[3], 
    status: 'Active', 
    hireDate: '2023-10-01', 
    profileImageUrl: 'https://picsum.photos/seed/demostaff1/200/200',
    fingerprintScannerId: 'FP005',
    passportNumber: 'GH2345678',
    passportExpiryDate: '2026-10-31',
    baseSalary: 28000, 
    bankName: 'ธนาคารกรุงไทย', 
    bankAccountNumber: '101-0-10101-1', 
    taxId: '1100000000006', 
    socialSecurityNumber: '6655443322', 
    providentFundRateEmployee: 3, 
    providentFundRateEmployer: 3, 
    recurringAllowances: defaultEmployeeAllowances, 
    recurringDeductions: [] 
  },
  { 
    id: 'user6', 
    employeeCode: 'E0007', 
    name: 'คุณเดโม่ สต๊าฟสอง', 
    nameEn: 'Demo Stafftwo',
    email: 'demo.staff2@example.com', 
    phone: '092-222-2222', 
    department: DEPARTMENTS[1], 
    position: POSITIONS[3], 
    status: 'Active', 
    hireDate: '2023-11-15', 
    profileImageUrl: 'https://picsum.photos/seed/demostaff2/200/200',
    fingerprintScannerId: 'FP006',
    baseSalary: 26000, 
    bankName: 'ธนาคารออมสิน', 
    bankAccountNumber: '202-0-20202-2', 
    taxId: '1100000000007', 
    socialSecurityNumber: '7788990011', 
    providentFundRateEmployee: 2, 
    providentFundRateEmployer: 2, 
    recurringAllowances: [{id: 'allow1', name:'ค่าเดินทาง', amount: 700, payrollComponentId: 'comp_travel'}], 
    recurringDeductions: [] 
  },
];
export const addEmployee = (employeeData: Omit<Employee, 'id'>): Employee => {
  const newEmployee: Employee = { ...employeeData, id: `emp${MOCK_EMPLOYEES.length + 1 + Math.floor(Math.random()*1000)}`, employeeCode: `E${String(MOCK_EMPLOYEES.length + 1).padStart(4,'0')}` };
  MOCK_EMPLOYEES.push(newEmployee);
  return newEmployee;
};
export const updateEmployee = (updatedEmployee: Employee): Employee | null => {
  const index = MOCK_EMPLOYEES.findIndex(e => e.id === updatedEmployee.id);
  if (index !== -1) {
    MOCK_EMPLOYEES[index] = { ...MOCK_EMPLOYEES[index], ...updatedEmployee };
    return MOCK_EMPLOYEES[index];
  }
  return null;
};
export const deleteEmployee = (id: string): void => {
  MOCK_EMPLOYEES = MOCK_EMPLOYEES.filter(e => e.id !== id);
};
export const getEmployeeById = (id: string): Employee | undefined => {
    let employee = MOCK_EMPLOYEES.find(e => e.id === id);
    if (employee) return employee;

    const userMatch = MOCK_USERS.find(u => u.id === id);
    if (userMatch) {
      employee = MOCK_EMPLOYEES.find(e => e.id === userMatch.id);
      if (employee) return employee;
      if(userMatch.role === UserRole.STAFF){
         return MOCK_EMPLOYEES.find(e => e.name === userMatch.name && e.department === userMatch.department);
      }
    }
    return undefined;
}


// --- Time Logs ---
export let MOCK_TIME_LOGS: TimeLog[] = [
  { id: 'tl1', employeeId: 'emp1', employeeName: 'อลิซ วันเดอร์แลนด์', clockIn: new Date(Date.now() - 8*60*60*1000).toISOString(), clockOut: new Date(Date.now() - 1*60*60*1000).toISOString(), notes: 'ทำงานโปรเจกต์ X', source: 'Manual' },
  { id: 'tl2', employeeId: 'emp2', employeeName: 'บ็อบ เดอะบิวเดอร์', clockIn: new Date(Date.now() - 7*60*60*1000).toISOString(), notes: 'ประชุมทีม Y', source: 'Manual' },
  { id: 'tl3', employeeId: 'emp1', employeeName: 'อลิซ วันเดอร์แลนด์', clockIn: new Date(Date.now() - 2*24*60*60*1000 - 8*60*60*1000).toISOString(), clockOut: new Date(Date.now() - 2*24*60*60*1000 - 1*60*60*1000).toISOString(), notes: 'แก้ไขบั๊ก Z', source: 'Scanner' },
  { id: 'tl4', employeeId: 'user3', employeeName: MOCK_EMPLOYEES.find(e=>e.id==='user3')?.name || 'สมชาย ใจดี', clockIn: new Date(Date.now() - (8 * 60 * 60 * 1000)).toISOString(), clockOut: new Date(Date.now() - (30 * 60 * 1000)).toISOString(), notes: 'ลูกค้าสัมพันธ์', source: 'Manual' },
  { id: 'tl5', employeeId: 'user4', employeeName: MOCK_EMPLOYEES.find(e=>e.id==='user4')?.name || 'สมหญิง มุ่งมั่น', clockIn: new Date(Date.now() - (9 * 60 * 60 * 1000)).toISOString(), notes: 'กำลังทำงาน', source: 'Scanner' },

];
export const addTimeLog = (logData: Omit<TimeLog, 'id'>): TimeLog => {
  if (logData.source === 'Scanner') {
    const existingScan = MOCK_TIME_LOGS.find(
      tl => tl.employeeId === logData.employeeId && 
            tl.source === 'Scanner' && 
            new Date(tl.clockIn).getTime() === new Date(logData.clockIn).getTime()
    );
    if (existingScan) {
      if (logData.clockOut && !existingScan.clockOut) {
        existingScan.clockOut = logData.clockOut;
        existingScan.notes = logData.notes || existingScan.notes; 
        return existingScan;
      }
      return existingScan; 
    }
  }
  const newLog: TimeLog = { ...logData, id: `tl${MOCK_TIME_LOGS.length + 1 + Math.floor(Math.random()*1000)}` };
  MOCK_TIME_LOGS.push(newLog);
  return newLog;
};
export const getEmployeeTimeLogs = (employeeId: string): TimeLog[] => {
  return MOCK_TIME_LOGS.filter(log => log.employeeId === employeeId).sort((a,b) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime());
};

// --- Inventory ---
export let MOCK_INVENTORY_ITEMS: InventoryItem[] = [
  { id: 'item1', name: 'กระดาษ A4 80 แกรม', sku: 'PPR-A4-80G', category: 'เครื่องเขียน', quantity: 50, minStockLevel: 20, unitPrice: 120, supplier: 'ดับเบิ้ลเอ', lastUpdated: new Date().toISOString() },
  { id: 'item2', name: 'ปากกาลูกลื่นสีน้ำเงิน (แพ็ค 12)', sku: 'PEN-BL-12PK', category: 'เครื่องเขียน', quantity: 15, minStockLevel: 10, unitPrice: 85, supplier: 'ควอนตั้ม', lastUpdated: new Date().toISOString() },
  { id: 'item3', name: 'แฟ้มสันกว้าง A4 สีดำ', sku: 'FLD-A4-BK', category: 'อุปกรณ์สำนักงาน', quantity: 30, minStockLevel: 15, unitPrice: 55, supplier: 'ตราช้าง', lastUpdated: new Date().toISOString() },
  { id: 'item4', name: 'หมึกพิมพ์เลเซอร์ HP CB435A (35A)', sku: 'INK-HP-35A', category: 'หมึกและโทนเนอร์', quantity: 8, minStockLevel: 5, unitPrice: 1800, supplier: 'เอชพี (ประเทศไทย)', lastUpdated: new Date().toISOString() },
  { id: 'item5', name: 'เก้าอี้สำนักงาน รุ่น ERGO-COMFORT', sku: 'CHR-ERG-001', category: 'เฟอร์นิเจอร์', quantity: 3, minStockLevel: 2, unitPrice: 3500, supplier: 'โมเดอร์นฟอร์ม', lastUpdated: new Date().toISOString() },
];
export const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'lastUpdated'>): InventoryItem => {
  const newItem: InventoryItem = { ...itemData, id: `item${MOCK_INVENTORY_ITEMS.length + 1 + Math.floor(Math.random()*1000)}`, lastUpdated: new Date().toISOString() };
  MOCK_INVENTORY_ITEMS.push(newItem);
  return newItem;
};
export const updateInventoryItem = (updatedItem: InventoryItem): InventoryItem | null => {
  const index = MOCK_INVENTORY_ITEMS.findIndex(i => i.id === updatedItem.id);
  if (index !== -1) {
    MOCK_INVENTORY_ITEMS[index] = { ...MOCK_INVENTORY_ITEMS[index], ...updatedItem, lastUpdated: new Date().toISOString() };
    return MOCK_INVENTORY_ITEMS[index];
  }
  return null;
};
export const deleteInventoryItem = (id: string): void => {
  MOCK_INVENTORY_ITEMS = MOCK_INVENTORY_ITEMS.filter(i => i.id !== id);
};


// --- Stock Transactions ---
export const STOCK_TRANSACTION_REASONS = [...INITIAL_STOCK_REASONS];
if (!STOCK_TRANSACTION_REASONS.includes('เบิกใช้ภายใน')) {
    STOCK_TRANSACTION_REASONS.push('เบิกใช้ภายใน');
}
if (!STOCK_TRANSACTION_REASONS.includes('เบิกสำหรับโครงการ')) {
    STOCK_TRANSACTION_REASONS.push('เบิกสำหรับโครงการ');
}


export let MOCK_STOCK_TRANSACTIONS: StockTransaction[] = [
  { id: 'st1', itemId: 'item1', itemName: 'กระดาษ A4 80 แกรม', type: 'IN', quantity: 50, reason: 'สต็อกเริ่มต้น', date: new Date(Date.now() - 10*24*60*60*1000).toISOString(), employeeId: 'user1', employeeName: 'ผู้ดูแลระบบ' },
  { id: 'st2', itemId: 'item2', itemName: 'ปากกาลูกลื่นสีน้ำเงิน (แพ็ค 12)', type: 'IN', quantity: 20, reason: 'รับสินค้าจากการซื้อ', date: new Date(Date.now() - 5*24*60*60*1000).toISOString(), employeeId: 'user2', employeeName: MOCK_USERS.find(u=>u.id ==='user2')?.name || 'Manager' },
  { id: 'st3', itemId: 'item1', itemName: 'กระดาษ A4 80 แกรม', type: 'OUT', quantity: 5, reason: 'คำสั่งซื้อจากลูกค้า', date: new Date(Date.now() - 2*24*60*60*1000).toISOString(), employeeId: 'user3', employeeName: MOCK_USERS.find(u=>u.id ==='user3')?.name || 'Staff' },
];
export const addStockTransaction = (transactionData: Omit<StockTransaction, 'id' | 'date'>): StockTransaction => {
  const newTransaction: StockTransaction = { ...transactionData, id: `st${MOCK_STOCK_TRANSACTIONS.length + 1 + Math.floor(Math.random()*1000)}`, date: new Date().toISOString() };
  MOCK_STOCK_TRANSACTIONS.push(newTransaction);
  const itemIndex = MOCK_INVENTORY_ITEMS.findIndex(item => item.id === newTransaction.itemId);
  if (itemIndex !== -1) {
    if (newTransaction.type === 'IN') {
      MOCK_INVENTORY_ITEMS[itemIndex].quantity += newTransaction.quantity;
    } else {
      MOCK_INVENTORY_ITEMS[itemIndex].quantity -= newTransaction.quantity;
    }
    MOCK_INVENTORY_ITEMS[itemIndex].lastUpdated = new Date().toISOString();
  }
  return newTransaction;
};
export const getInventoryItemTransactions = (itemId: string): StockTransaction[] => {
  return MOCK_STOCK_TRANSACTIONS.filter(t => t.itemId === itemId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};


// --- Purchase Orders ---
export let MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
  { id: 'po1', poNumber: 'PO-2024-0075', supplier: 'ดับเบิ้ลเอ', items: [{ itemId: 'item1', itemName: 'กระดาษ A4 80 แกรม', quantity: 20, unitPrice: 115 }], totalAmount: 2300, status: 'Completed', orderDate: '2024-05-01', expectedDeliveryDate: '2024-05-05' },
  { id: 'po2', poNumber: 'PO-2024-0076', supplier: 'ควอนตั้ม', items: [{ itemId: 'item2', itemName: 'ปากกาลูกลื่นสีน้ำเงิน (แพ็ค 12)', quantity: 10, unitPrice: 80 }], totalAmount: 800, status: 'Shipped', orderDate: '2024-05-10', expectedDeliveryDate: '2024-05-15' },
  { id: 'po3', poNumber: 'PO-2024-0077', supplier: 'เอชพี (ประเทศไทย)', items: [{ itemId: 'item4', itemName: 'หมึกพิมพ์เลเซอร์ HP CB435A (35A)', quantity: 5, unitPrice: 1750 }], totalAmount: 8750, status: 'Pending', orderDate: new Date().toISOString().split('T')[0] },
];
const generatePONumber = (): string => {
    const year = new Date().getFullYear();
    const count = MOCK_PURCHASE_ORDERS.length + 1 + Math.floor(Math.random()*100); 
    return `PO-${year}-${String(count).padStart(4, '0')}`;
}
export const addPurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'poNumber'>): PurchaseOrder => {
  const newPO: PurchaseOrder = { ...poData, id: `po${MOCK_PURCHASE_ORDERS.length + 1 + Math.floor(Math.random()*1000)}`, poNumber: generatePONumber() };
  MOCK_PURCHASE_ORDERS.push(newPO);
  return newPO;
};
export const updatePurchaseOrder = (updatedPO: PurchaseOrder): PurchaseOrder | null => {
  const index = MOCK_PURCHASE_ORDERS.findIndex(p => p.id === updatedPO.id);
  if (index !== -1) {
    MOCK_PURCHASE_ORDERS[index] = { ...MOCK_PURCHASE_ORDERS[index], ...updatedPO };
    return MOCK_PURCHASE_ORDERS[index];
  }
  return null;
};
export const deletePurchaseOrder = (id: string): void => {
  MOCK_PURCHASE_ORDERS = MOCK_PURCHASE_ORDERS.filter(p => p.id !== id);
};


// --- Documents ---
export let MOCK_DOCUMENTS: Document[] = [
  { id: 'doc1', docNumber: 'QUO-2024-0123', type: DocumentType.QUOTATION, clientName: 'บริษัท กขค จำกัด', projectName: 'ออกแบบเว็บไซต์', date: '2024-04-20', amount: 50000, status: 'Sent', pdfUrl: '/mock-pdfs/QUO-2024-0123.pdf' },
  { id: 'doc2', docNumber: 'INV-2024-0056', type: DocumentType.INVOICE, clientName: 'คุณสมศรี มีสุข', projectName: 'ติดตั้งระบบ POS', date: '2024-05-05', amount: 25000, status: 'Paid', pdfUrl: '/mock-pdfs/INV-2024-0056.pdf' },
  { id: 'doc3', docNumber: 'DN-2024-0089', type: DocumentType.DELIVERY_NOTE, clientName: 'ห้างหุ้นส่วนจำกัด งจฉ', projectName: 'ส่งสินค้าล็อตใหญ่', date: '2024-05-12', status: 'Sent' },
];
const generateDocNumber = (type: DocumentType): string => {
    const prefix = type.substring(0,3).toUpperCase();
    const year = new Date().getFullYear();
    const count = MOCK_DOCUMENTS.filter(d => d.type === type).length + 1 + Math.floor(Math.random()*100);
    return `${prefix}-${year}-${String(count).padStart(4, '0')}`;
}
export const addDocument = (docData: Omit<Document, 'id' | 'docNumber'>): Document => {
  const newDoc: Document = { ...docData, id: `doc${MOCK_DOCUMENTS.length + 1 + Math.floor(Math.random()*1000)}`, docNumber: generateDocNumber(docData.type) };
  MOCK_DOCUMENTS.push(newDoc);
  return newDoc;
};
export const updateDocument = (updatedDoc: Document): Document | null => {
  const index = MOCK_DOCUMENTS.findIndex(d => d.id === updatedDoc.id);
  if (index !== -1) {
    MOCK_DOCUMENTS[index] = { ...MOCK_DOCUMENTS[index], ...updatedDoc };
    return MOCK_DOCUMENTS[index];
  }
  return null;
};
export const deleteDocument = (id: string): void => {
  MOCK_DOCUMENTS = MOCK_DOCUMENTS.filter(d => d.id !== id);
};

// --- Calendar Events ---
export let MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  { id: 'evt1', title: 'ประชุมทีมขายรายสัปดาห์', start: new Date(Date.now() + 2*24*60*60*1000 + 2*60*60*1000).toISOString(), end: new Date(Date.now() + 2*24*60*60*1000 + 3*60*60*1000).toISOString(), attendees: [{employeeId: 'user2', employeeName:MOCK_USERS.find(u=>u.id==='user2')?.name || ''}, {employeeId: 'user4', employeeName:MOCK_USERS.find(u=>u.id==='user4')?.name || ''}], description: 'สรุปยอดขายและวางแผนสัปดาห์หน้า' },
  { id: 'evt2', title: 'สัมภาษณ์ผู้สมัครตำแหน่ง Staff', start: new Date(Date.now() + 3*24*60*60*1000 + 5*60*60*1000).toISOString(), end: new Date(Date.now() + 3*24*60*60*1000 + 6*60*60*1000).toISOString(), attendees: [{employeeId: 'user1', employeeName:MOCK_USERS.find(u=>u.id==='user1')?.name || ''}, {employeeId: 'user2', employeeName:MOCK_USERS.find(u=>u.id==='user2')?.name || ''}], isAllDay: false },
  { id: 'evt3', title: 'อบรมการใช้งานระบบใหม่', start: new Date(Date.now() + 7*24*60*60*1000).toISOString(), end: new Date(Date.now() + 7*24*60*60*1000).toISOString(), attendees: MOCK_USERS.filter(u => u.role === UserRole.STAFF).map(u => ({employeeId: u.id, employeeName:u.name})), isAllDay: true, description: 'เรียนรู้ฟังก์ชันใหม่ของ OfficeMate V2' },
];
export const addCalendarEvent = (eventData: Omit<CalendarEvent, 'id'>): CalendarEvent => {
  const newEvent: CalendarEvent = { ...eventData, id: `evt${MOCK_CALENDAR_EVENTS.length + 1 + Math.floor(Math.random()*1000)}` };
  MOCK_CALENDAR_EVENTS.push(newEvent);
  return newEvent;
};
export const updateCalendarEvent = (updatedEvent: CalendarEvent): CalendarEvent | null => {
  const index = MOCK_CALENDAR_EVENTS.findIndex(e => e.id === updatedEvent.id);
  if (index !== -1) {
    MOCK_CALENDAR_EVENTS[index] = { ...MOCK_CALENDAR_EVENTS[index], ...updatedEvent };
    return MOCK_CALENDAR_EVENTS[index];
  }
  return null;
};
export const deleteCalendarEvent = (id: string): void => {
  MOCK_CALENDAR_EVENTS = MOCK_CALENDAR_EVENTS.filter(e => e.id !== id);
};

// --- Chat Messages ---
export const initialMessages: { [roomId: string]: ChatMessage[] } = {
  'general': [
    { id: 'msg1', roomId: 'general', senderId: MOCK_USERS[0].id, senderName: MOCK_USERS[0].name, timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), text: 'ยินดีต้อนรับสู่ห้องแชททั่วไป!' },
    { id: 'msg2', roomId: 'general', senderId: MOCK_USERS[1].id, senderName: MOCK_USERS[1].name, timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(), text: 'สวัสดีทุกคน! ดีใจที่ได้มาอยู่ที่นี่' },
  ],
  'project-phoenix': [
    { id: 'msg3', roomId: 'project-phoenix', senderId: MOCK_USERS[2].id, senderName: MOCK_USERS[2].name, timestamp: new Date().toISOString(), text: 'มีอัปเดตเกี่ยวกับงาน 3.2 ไหมครับ?' },
  ],
   'sales-team': [],
   [CHAT_ROOMS_SAMPLE.find(r => r.name === 'ประกาศจากฝ่ายบุคคล')?.id || 'hr-announcements']: [ 
    { id: 'msg-hr1', roomId: CHAT_ROOMS_SAMPLE.find(r => r.name === 'ประกาศจากฝ่ายบุคคล')?.id || 'hr-announcements', senderId: MOCK_USERS.find(u => u.department === "ฝ่ายบุคคล")?.id || MOCK_USERS[1].id, senderName: MOCK_USERS.find(u => u.department === "ฝ่ายบุคคล")?.name || MOCK_USERS[1].name, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), text: 'ประกาศ: วันหยุดนักขัตฤกษ์เดือนหน้าคือวันที่ 15' },
   ],
};

export const addChatMessageToStore = (message: ChatMessage): void => {
  if (!initialMessages[message.roomId]) {
    initialMessages[message.roomId] = [];
  }
  if (!initialMessages[message.roomId].find(m => m.id === message.id)) {
      initialMessages[message.roomId].push(message);
  }
  dispatchChatNotification(message);
};


// --- Payroll ---
export let MOCK_PAYROLL_RUNS: PayrollRun[] = [];
export let MOCK_PAYSLIPS: Payslip[] = [];
export let MOCK_PAYROLL_COMPONENTS: PayrollComponent[] = [...DEFAULT_PAYROLL_COMPONENTS];


const generatePayrollRunId = (): string => `PRUN-${CURRENT_YEAR}-${String(MOCK_PAYROLL_RUNS.length + 1 + Math.floor(Math.random()*100)).padStart(3, '0')}`;
const generatePayslipId = (): string => `PSLP-${CURRENT_YEAR}-${String(MOCK_PAYSLIPS.length + 1 + Math.floor(Math.random()*1000)).padStart(5, '0')}`;

export const calculateSocialSecurity = (salary: number): number => {
  const applicableSalary = Math.max(SOCIAL_SECURITY_MIN_MONTHLY_SALARY, Math.min(salary, SOCIAL_SECURITY_CAP_MONTHLY_SALARY));
  const ssfComponent = MOCK_PAYROLL_COMPONENTS.find(c => c.id === 'comp_ssf_calculated');
  const rate = ssfComponent?.defaultRate || SOCIAL_SECURITY_RATE;
  return applicableSalary * rate;
};

export const calculateProvidentFund = (salary: number, employeeRatePercent?: number): {employeeContribution: number} => {
  const empRate = employeeRatePercent || 0;
  return {
    employeeContribution: salary * (empRate / 100),
  }
};


export const calculateTax = (annualNetIncome: number, brackets: TaxBracket[] = MOCK_TAX_BRACKETS_SIMPLIFIED): number => {
  let annualTax = 0;
  for (const bracket of brackets) {
      if (annualNetIncome > bracket.minIncome) {
          const taxableInBracket = Math.min(annualNetIncome, bracket.maxIncome ?? Infinity) - bracket.minIncome;
          if (taxableInBracket > 0) {
              annualTax += taxableInBracket * bracket.rate;
          }
      } else {
          break; 
      }
  }
  return Math.max(0, annualTax / 12); 
};

export const generatePayslipForEmployee = (
    employee: Employee, 
    periodMonth: number, 
    periodYear: number, 
    payrollRunId: string,
    existingPayslipData?: Partial<Payslip> 
): Payslip => {
  const baseSalary = employee.baseSalary || 0;

  let allAllowances: PayslipItem[] = (employee.recurringAllowances || []).map(ra => ({ 
    name: ra.name, 
    amount: ra.amount,
    payrollComponentId: ra.payrollComponentId 
  }));

  if (existingPayslipData?._tempOneTimeAllowances) {
    existingPayslipData._tempOneTimeAllowances.forEach(tempAllow => {
        const existingIndex = allAllowances.findIndex(a => a.payrollComponentId === tempAllow.payrollComponentId || a.name === tempAllow.name);
        if (existingIndex > -1 && tempAllow.amount !== 0) { 
            allAllowances[existingIndex] = { ...allAllowances[existingIndex], amount: tempAllow.amount, payrollComponentId: tempAllow.payrollComponentId || allAllowances[existingIndex].payrollComponentId };
        } else if (existingIndex === -1 && tempAllow.amount !== 0) { 
            allAllowances.push({ name: tempAllow.name, amount: tempAllow.amount, payrollComponentId: tempAllow.payrollComponentId });
        } else if (existingIndex > -1 && tempAllow.amount === 0) { 
             allAllowances.splice(existingIndex, 1);
        }
    });
  }
  
  const overtimeHours = existingPayslipData?.overtimeHours || 0;
  const overtimeRate = existingPayslipData?.overtimeRate || 0; 
  const overtimePay = overtimeHours * overtimeRate;

  let grossPay = baseSalary + overtimePay;
  let annualTaxableIncome = (baseSalary + overtimePay) * 12; 

  allAllowances.forEach(allowance => {
    grossPay += allowance.amount;
    const component = MOCK_PAYROLL_COMPONENTS.find(c => c.id === allowance.payrollComponentId || c.name === allowance.name);
    if (component?.isTaxable) {
      annualTaxableIncome += allowance.amount * 12;
    }
  });
  
  const socialSecurityDeduction = calculateSocialSecurity(baseSalary); 
  const { employeeContribution: providentFundDeduction } = calculateProvidentFund(baseSalary, employee.providentFundRateEmployee);
  
  const annualSocialSecurity = socialSecurityDeduction * 12;
  const annualProvidentFund = providentFundDeduction * 12;
  
  const netTaxableAnnualIncomeAfterDeductions = Math.max(0, annualTaxableIncome - annualSocialSecurity - annualProvidentFund - STANDARD_DEDUCTION_ANNUAL - PERSONAL_ALLOWANCE_ANNUAL);
  const taxDeduction = calculateTax(netTaxableAnnualIncomeAfterDeductions);

  let otherDeductions: PayslipItem[] = (employee.recurringDeductions || []).map(rd => ({ 
      name: rd.name, 
      amount: rd.amount, 
      payrollComponentId: rd.payrollComponentId 
    }));

  if (existingPayslipData?._tempOneTimeDeductions) {
    existingPayslipData._tempOneTimeDeductions.forEach(tempDeduct => {
        const existingIndex = otherDeductions.findIndex(d => d.payrollComponentId === tempDeduct.payrollComponentId || d.name === tempDeduct.name);
        if (existingIndex > -1 && tempDeduct.amount !== 0) { 
            otherDeductions[existingIndex] = { ...otherDeductions[existingIndex], amount: tempDeduct.amount, payrollComponentId: tempDeduct.payrollComponentId || otherDeductions[existingIndex].payrollComponentId };
        } else if (existingIndex === -1 && tempDeduct.amount !== 0) { 
            otherDeductions.push({ name: tempDeduct.name, amount: tempDeduct.amount, payrollComponentId: tempDeduct.payrollComponentId });
        } else if (existingIndex > -1 && tempDeduct.amount === 0) { 
            otherDeductions.splice(existingIndex, 1);
        }
    });
  }

  const totalOtherDeductionsAmount = otherDeductions.reduce((sum, d) => sum + d.amount, 0);
  const totalDeductions = socialSecurityDeduction + providentFundDeduction + taxDeduction + totalOtherDeductionsAmount;
  const netPay = grossPay - totalDeductions;

  const payPeriod = `${MONTH_OPTIONS.find(m=>m.value === periodMonth)?.label} ${periodYear + 543}`;

  return {
    id: existingPayslipData?.id || generatePayslipId(),
    payrollRunId,
    employeeId: employee.id,
    employeeName: employee.name,
    employeeCode: employee.employeeCode,
    employeeDepartment: employee.department,
    employeePosition: employee.position,
    employeeTaxId: employee.taxId,
    employeeSsn: employee.socialSecurityNumber,
    employeeJoiningDate: employee.hireDate,
    payPeriod,
    baseSalary,
    overtimeHours,
    overtimeRate,
    overtimePay: parseFloat(overtimePay.toFixed(2)),
    allowances: allAllowances, 
    grossPay: parseFloat(grossPay.toFixed(2)),
    taxDeduction: parseFloat(taxDeduction.toFixed(2)),
    socialSecurityDeduction: parseFloat(socialSecurityDeduction.toFixed(2)),
    providentFundDeduction: parseFloat(providentFundDeduction.toFixed(2)),
    otherDeductions,
    totalDeductions: parseFloat(totalDeductions.toFixed(2)),
    netPay: parseFloat(netPay.toFixed(2)),
    bankName: employee.bankName,
    bankAccountNumber: employee.bankAccountNumber,
    paymentDate: existingPayslipData?.paymentDate, 
  };
};


export const addPayrollRun = (runData: Omit<PayrollRun, 'id' | 'dateCreated' | 'payslipIds' | 'totalEmployees' | 'totalGrossPay' | 'totalDeductions' | 'totalNetPay'>): PayrollRun => {
  const newRun: PayrollRun = {
    ...runData,
    id: generatePayrollRunId(),
    dateCreated: new Date().toISOString(),
    payslipIds: [],
    totalEmployees: 0,
    totalGrossPay: 0,
    totalDeductions: 0,
    totalNetPay: 0,
  };
  MOCK_PAYROLL_RUNS.push(newRun);
  return newRun;
};

export const updatePayrollRun = (updatedRun: PayrollRun): PayrollRun | null => {
  const index = MOCK_PAYROLL_RUNS.findIndex(r => r.id === updatedRun.id);
  if (index !== -1) {
    MOCK_PAYROLL_RUNS[index] = { ...MOCK_PAYROLL_RUNS[index], ...updatedRun };
    return MOCK_PAYROLL_RUNS[index];
  }
  return null;
};

export const deletePayrollRun = (id: string): void => {
  MOCK_PAYROLL_RUNS = MOCK_PAYROLL_RUNS.filter(r => r.id !== id);
  MOCK_PAYSLIPS = MOCK_PAYSLIPS.filter(p => p.payrollRunId !== id); 
};

export const getPayrollRunById = (id: string): PayrollRun | undefined => {
    return MOCK_PAYROLL_RUNS.find(r => r.id === id);
}

export const getPayslipsForRun = (payrollRunId: string): Payslip[] => {
    return MOCK_PAYSLIPS.filter(p => p.payrollRunId === payrollRunId);
}
export const getPayslipById = (id: string): Payslip | undefined => {
    return MOCK_PAYSLIPS.find(p => p.id === id);
}

export const getPayslipsForEmployee = (employeeId: string): Payslip[] => {
    const targetEmployee = MOCK_EMPLOYEES.find(emp => emp.id === employeeId);
    if (!targetEmployee) return [];

    return MOCK_PAYSLIPS.filter(p => p.employeeId === targetEmployee.id)
      .sort((a, b) => {
        const [aMonthStr, aYearStrBE] = a.payPeriod.split(' ');
        const [bMonthStr, bYearStrBE] = b.payPeriod.split(' ');
        
        const aMonth = MONTH_OPTIONS.find(m => m.label === aMonthStr)?.value || 0;
        const bMonth = MONTH_OPTIONS.find(m => m.label === bMonthStr)?.value || 0;
        
        const aYearCE = parseInt(aYearStrBE) - 543;
        const bYearCE = parseInt(bYearStrBE) - 543;

        if (aYearCE !== bYearCE) return bYearCE - aYearCE;
        return bMonth - aMonth;
      });
};


export const addPayslip = (payslip: Payslip): Payslip => {
    if (!MOCK_PAYSLIPS.find(p => p.id === payslip.id)) {
        MOCK_PAYSLIPS.push(payslip);
    } else { 
        return updatePayslip(payslip) || payslip;
    }
    return payslip;
}

export const updatePayslip = (updatedPayslip: Payslip): Payslip | null => {
    const index = MOCK_PAYSLIPS.findIndex(p => p.id === updatedPayslip.id);
    if (index !== -1) {
        MOCK_PAYSLIPS[index] = { ...MOCK_PAYSLIPS[index], ...updatedPayslip };
        const run = MOCK_PAYROLL_RUNS.find(r => r.id === updatedPayslip.payrollRunId);
        if (run) {
            const payslipsInRun = MOCK_PAYSLIPS.filter(p => p.payrollRunId === run.id);
            run.totalGrossPay = payslipsInRun.reduce((sum, p) => sum + p.grossPay, 0);
            run.totalDeductions = payslipsInRun.reduce((sum, p) => sum + p.totalDeductions, 0);
            run.totalNetPay = payslipsInRun.reduce((sum, p) => sum + p.netPay, 0);
            updatePayrollRun(run);
        }
        return MOCK_PAYSLIPS[index];
    }
    return null;
}

export const deletePayslip = (id: string): void => {
    const payslipIndex = MOCK_PAYSLIPS.findIndex(p => p.id === id);
    if (payslipIndex === -1) return;

    const payslipToDelete = MOCK_PAYSLIPS[payslipIndex];
    const run = MOCK_PAYROLL_RUNS.find(r => r.id === payslipToDelete.payrollRunId);

    MOCK_PAYSLIPS = MOCK_PAYSLIPS.filter(p => p.id !== id);

    if (run) {
        run.payslipIds = run.payslipIds.filter(pid => pid !== id);
        run.totalEmployees = run.payslipIds.length;
        const remainingPayslips = MOCK_PAYSLIPS.filter(p => p.payrollRunId === run.id);
        run.totalGrossPay = remainingPayslips.reduce((sum, p) => sum + p.grossPay, 0);
        run.totalDeductions = remainingPayslips.reduce((sum, p) => sum + p.totalDeductions, 0);
        run.totalNetPay = remainingPayslips.reduce((sum, p) => sum + p.netPay, 0);
        updatePayrollRun(run);
    }
}

// Payroll Components
export const getAllPayrollComponents = (): PayrollComponent[] => [...MOCK_PAYROLL_COMPONENTS];

export const addPayrollComponent = (componentData: Omit<PayrollComponent, 'id' | 'isSystemCalculated'>): PayrollComponent => {
  const newComponent: PayrollComponent = { ...componentData, id: `comp${MOCK_PAYROLL_COMPONENTS.length + 1 + Date.now()}` , isSystemCalculated: false};
  MOCK_PAYROLL_COMPONENTS.push(newComponent);
  return newComponent;
};
export const updatePayrollComponent = (updatedComponent: PayrollComponent): PayrollComponent | null => {
  const index = MOCK_PAYROLL_COMPONENTS.findIndex(c => c.id === updatedComponent.id);
  if (index !== -1) {
    if (MOCK_PAYROLL_COMPONENTS[index].isSystemCalculated && updatedComponent.isSystemCalculated === false) {
        console.warn("Cannot change isSystemCalculated for a system component."); 
        return MOCK_PAYROLL_COMPONENTS[index]; 
    }
    MOCK_PAYROLL_COMPONENTS[index] = { ...MOCK_PAYROLL_COMPONENTS[index], ...updatedComponent };
    return MOCK_PAYROLL_COMPONENTS[index];
  }
  return null;
};
export const deletePayrollComponent = (id: string): void => {
  const component = MOCK_PAYROLL_COMPONENTS.find(c => c.id === id);
  if (component && component.isSystemCalculated) {
    alert("ไม่สามารถลบรายการส่วนประกอบของระบบได้");
    return;
  }
  MOCK_PAYROLL_COMPONENTS = MOCK_PAYROLL_COMPONENTS.filter(c => c.id !== id);
};


// --- Fingerprint Scanner Settings ---
let MOCK_FINGERPRINT_SCANNER_SETTINGS: FingerprintScannerSettings = {
    ipAddress: '',
    port: '',
    lastSyncStatus: 'Unknown',
    lastSyncTime: undefined,
    lastSyncToScannerStatus: 'Unknown',
    lastSyncToScannerTime: undefined,
};

export const getFingerprintScannerSettings = async (): Promise<FingerprintScannerSettings | null> => {
    await new Promise(resolve => setTimeout(resolve, 100)); 
    const stored = localStorage.getItem('fingerprintScannerSettings');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            MOCK_FINGERPRINT_SCANNER_SETTINGS = {
                ipAddress: parsed.ipAddress || '',
                port: parsed.port || '',
                deviceId: parsed.deviceId,
                lastSyncStatus: parsed.lastSyncStatus || 'Unknown',
                lastSyncTime: parsed.lastSyncTime,
                lastSyncToScannerStatus: parsed.lastSyncToScannerStatus || 'Unknown',
                lastSyncToScannerTime: parsed.lastSyncToScannerTime,
            };
        } catch (e) { console.error("Error parsing scanner settings from localStorage", e); }
    }
    return { ...MOCK_FINGERPRINT_SCANNER_SETTINGS };
};

export const saveFingerprintScannerSettings = async (settings: FingerprintScannerSettings): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 100)); 
    MOCK_FINGERPRINT_SCANNER_SETTINGS = { ...MOCK_FINGERPRINT_SCANNER_SETTINGS, ...settings };
    localStorage.setItem('fingerprintScannerSettings', JSON.stringify(MOCK_FINGERPRINT_SCANNER_SETTINGS));
};

export const fetchTimeLogsFromScannerAPI = async (scannerConfig: FingerprintScannerSettings): Promise<Array<{ scannerUserId: string, timestamp: string, type: 'clock-in' | 'clock-out' }>> => {
    console.log("Simulating fetch from scanner at:", scannerConfig.ipAddress, scannerConfig.port);
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    const mockRawData = [
        { scannerUserId: "FP001", timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), type: "clock-in" as const },
        { scannerUserId: "FP002", timestamp: new Date(Date.now() - 7.5 * 60 * 60 * 1000).toISOString(), type: "clock-in" as const },
        { scannerUserId: "FP001", timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), type: "clock-out" as const },
        { scannerUserId: "FP999", timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), type: "clock-in" as const }, 
    ];
    return mockRawData;
};

// --- Leave Management ---
export let MOCK_LEAVE_REQUESTS: LeaveRequest[] = [
    { 
        id: 'leave1', 
        employeeId: 'emp1', 
        employeeName: MOCK_EMPLOYEES.find(e=>e.id==='emp1')?.name || '', 
        leaveType: LeaveType.ANNUAL, 
        startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reason: 'พักผ่อนประจำปี', 
        status: LeaveRequestStatus.APPROVED, 
        requestedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        approverId: 'user1',
        approverName: MOCK_USERS.find(u=>u.id==='user1')?.name,
        approvedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    { 
        id: 'leave2', 
        employeeId: 'emp2', 
        employeeName: MOCK_EMPLOYEES.find(e=>e.id==='emp2')?.name || '',
        leaveType: LeaveType.SICK, 
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reason: 'ป่วยกะทันหัน มีไข้', 
        status: LeaveRequestStatus.PENDING, 
        requestedDate: new Date().toISOString(),
    },
     { 
        id: 'leave3', 
        employeeId: 'user3', 
        employeeName: MOCK_EMPLOYEES.find(e=>e.id==='user3')?.name || '',
        leaveType: LeaveType.PERSONAL, 
        startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reason: 'ทำธุระส่วนตัวสำคัญ', 
        status: LeaveRequestStatus.PENDING, 
        requestedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
];

export const addLeaveRequest = (requestData: Omit<LeaveRequest, 'id'>): LeaveRequest => {
  const newRequest: LeaveRequest = { ...requestData, id: `leave${MOCK_LEAVE_REQUESTS.length + 1 + Math.floor(Math.random()*1000)}` };
  MOCK_LEAVE_REQUESTS.push(newRequest);
  return newRequest;
};

export const updateLeaveRequest = (updatedRequest: LeaveRequest): LeaveRequest | null => {
  const index = MOCK_LEAVE_REQUESTS.findIndex(r => r.id === updatedRequest.id);
  if (index !== -1) {
    MOCK_LEAVE_REQUESTS[index] = { ...MOCK_LEAVE_REQUESTS[index], ...updatedRequest };
    return MOCK_LEAVE_REQUESTS[index];
  }
  return null;
};

export const deleteLeaveRequest = (id: string): void => {
  MOCK_LEAVE_REQUESTS = MOCK_LEAVE_REQUESTS.filter(r => r.id !== id);
};


export { MOCK_TAX_BRACKETS_SIMPLIFIED };
export { initialMessages as MOCK_CHAT_MESSAGES }; 