import React, { useState, useEffect, useCallback } from 'react';
import { Employee, TimeLog, UserRole, PayrollComponent, EmployeeAllowance, EmployeeDeduction, FingerprintScannerSettings, User, EmployeeStatusKey } from '../../types';
import { 
    getEmployees, addEmployee, updateEmployee, deleteEmployee, 
    addTimeLog, getEmployeeTimeLogs, getPayrollComponents,
    saveSetting, getSetting, addBulkEmployees
} from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Table } from '../../components/ui/Table';
import { DEPARTMENTS, POSITIONS, EMPLOYEE_STATUSES_OPTIONS, EMPLOYEE_STATUSES_TH } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner } from '../../components/ui/Spinner';
import { TableColumn } from '../../components/ui/Table'; 
import { exportToCsv, parseCsvFile } from '../../utils/export';
import { ImportCsvModal } from '../../components/ui/ImportCsvModal';

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
  </svg>
);
const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
  </svg>
);
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25V4c.827-.05 1.66-.075 2.5-.075zM8.47 9.03a.75.75 0 00-1.084-1.03l-1.5 1.75a.75.75 0 101.084 1.03l1.5-1.75zm3.116-1.03a.75.75 0 00-1.084 1.03l1.5 1.75a.75.75 0 101.084-1.03l-1.5-1.75z" clipRule="evenodd" />
  </svg>
);
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
  </svg>
);
const ArrowDownTrayIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1.25-7.75A.75.75 0 0010 9.5v2.25H7.75a.75.75 0 000 1.5H10v2.25a.75.75 0 001.5 0V13.5h2.25a.75.75 0 000-1.5H11.5V9.5zM10 2a.75.75 0 01.75.75v3.558c1.95.36 3.635 1.493 4.81 3.207a.75.75 0 01-1.12.99C13.551 8.89 11.853 8 10 8s-3.551.89-4.44 2.515a.75.75 0 01-1.12-.99A6.479 6.479 0 019.25 6.308V2.75A.75.75 0 0110 2z" clipRule="evenodd" />
  </svg>
);
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
);
const ArrowUpTrayIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);

const employeeCsvHeaderMapping = {
    name: 'ชื่อ-นามสกุล (ไทย)',
    nameEn: 'ชื่อ-นามสกุล (อังกฤษ)',
    employeeCode: 'รหัสพนักงาน',
    email: 'อีเมล',
    phone: 'เบอร์โทรศัพท์',
    department: 'แผนก',
    position: 'ตำแหน่ง',
    status: 'สถานะ',
    hireDate: 'วันที่เริ่มงาน (YYYY-MM-DD)',
    baseSalary: 'เงินเดือนพื้นฐาน',
    bankName: 'ชื่อธนาคาร',
    bankAccountNumber: 'เลขบัญชีธนาคาร',
    taxId: 'เลขประจำตัวผู้เสียภาษี',
    socialSecurityNumber: 'เลขประกันสังคม',
    fingerprintScannerId: 'รหัสสแกนนิ้ว',
    passportNumber: 'เลขที่หนังสือเดินทาง',
    passportExpiryDate: 'หนังสือเดินทางหมดอายุ (YYYY-MM-DD)',
};


const initialEmployeeState: Omit<Employee, 'id'> = {
  name: '', nameEn: '', employeeCode: '', email: '', phone: '', department: DEPARTMENTS[0], position: POSITIONS[0], status: 'Active', hireDate: new Date().toISOString().split('T')[0], profileImageUrl: `https://picsum.photos/seed/${Date.now()}/200/200`,
  role: UserRole.STAFF, // Default role
  passportNumber: '', passportExpiryDate: '',
  baseSalary: 0, bankName: '', bankAccountNumber: '', taxId: '', socialSecurityNumber: '', providentFundRateEmployee: 0, providentFundRateEmployer: 0, recurringAllowances: [], recurringDeductions: [], fingerprintScannerId: ''
};

const userRoleOptions = Object.values(UserRole).map(role => ({ value: role, label: role }));

export const EmployeePage: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]); 
  const [payrollComponents, setPayrollComponents] = useState<PayrollComponent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTimeLogModalOpen, setIsTimeLogModalOpen] = useState(false);
  const [isViewLogsModalOpen, setIsViewLogsModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Omit<Employee, 'id'> | Employee>(initialEmployeeState);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [password, setPassword] = useState(''); // For new employee creation
  const [selectedEmployeeForLogs, setSelectedEmployeeForLogs] = useState<Employee | null>(null);
  
  const [manualTimeLog, setManualTimeLog] = useState<{employeeId: string; clockIn: string; clockOut: string; notes: string}>({ employeeId: '', clockIn: '', clockOut: '', notes: '' });
  const [activeTab, setActiveTab] = useState<'details' | 'payroll'>('details');

  const [isSyncingScanner, setIsSyncingScanner] = useState(false);
  const [scannerSyncMessage, setScannerSyncMessage] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
        const [empData, pcData] = await Promise.all([
            getEmployees(),
            getPayrollComponents(),
        ]);
        setEmployees(empData);
        setPayrollComponents(pcData);
    } catch (error) {
        console.error("Failed to fetch employee data:", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleOpenModal = (employee?: Employee) => {
    if (employee) {
      setCurrentEmployee(employee);
      setEditingEmployeeId(employee.id);
    } else {
      setCurrentEmployee({...initialEmployeeState, profileImageUrl: `https://picsum.photos/seed/${Date.now()}/200/200`});
      setEditingEmployeeId(null);
      setPassword('');
    }
    setActiveTab('details');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentEmployee(initialEmployeeState);
    setEditingEmployeeId(null);
    setPassword('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const numFields = ['baseSalary', 'providentFundRateEmployee', 'providentFundRateEmployer'];
    if (numFields.includes(name)) {
        setCurrentEmployee(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
        setCurrentEmployee(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleRecurringItemChange = (type: 'allowance' | 'deduction', index: number, field: 'payrollComponentId' | 'amount', value: string | number) => {
    setCurrentEmployee(prev => {
        const items = type === 'allowance' ? [...(prev.recurringAllowances || [])] : [...(prev.recurringDeductions || [])];
        if (!items[index]) return prev; 
        if (field === 'payrollComponentId') {
            const selectedComponent = payrollComponents.find(pc => pc.id === value);
            items[index].payrollComponentId = value as string;
            items[index].name = selectedComponent ? selectedComponent.name : 'N/A';
        } else if (field === 'amount') {
            items[index].amount = parseFloat(value as string) || 0;
        }
        return type === 'allowance' ? { ...prev, recurringAllowances: items as EmployeeAllowance[] } : { ...prev, recurringDeductions: items as EmployeeDeduction[] };
    });
  };

  const addRecurringItem = (type: 'allowance' | 'deduction') => {
    setCurrentEmployee(prev => {
        const newItem = { id: `temp-${Date.now()}`, payrollComponentId: '', name: '', amount: 0 };
        return type === 'allowance' ? { ...prev, recurringAllowances: [...(prev.recurringAllowances || []), newItem] } : { ...prev, recurringDeductions: [...(prev.recurringDeductions || []), newItem] };
    });
  };

  const removeRecurringItem = (type: 'allowance' | 'deduction', index: number) => {
    setCurrentEmployee(prev => {
        const items = type === 'allowance' ? prev.recurringAllowances || [] : prev.recurringDeductions || [];
        return type === 'allowance' ? { ...prev, recurringAllowances: items.filter((_, i) => i !== index) } : { ...prev, recurringDeductions: items.filter((_, i) => i !== index) };
    });
  };

  const handleSubmit = async () => {
    try {
        if (editingEmployeeId) {
            await updateEmployee(currentEmployee as Employee);
        } else {
            if (!password || password.length < 6) {
                alert("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
                return;
            }
            await addEmployee(currentEmployee as Omit<Employee, 'id'>, password);
        }
    } catch (error: any) {
        console.error("Failed to save employee:", error);
        alert(`เกิดข้อผิดพลาดในการบันทึกข้อมูลพนักงาน: ${error.message}`);
    } finally {
        await fetchAllData(); 
        handleCloseModal();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบพนักงานคนนี้? การดำเนินการนี้อาจส่งผลกระทบต่อข้อมูลที่เกี่ยวข้อง และไม่สามารถย้อนกลับได้')) {
      try {
        await deleteEmployee(id);
        await fetchAllData();
      } catch (error) {
        console.error("Failed to delete employee:", error);
        alert("เกิดข้อผิดพลาดในการลบพนักงาน");
      }
    }
  };

  const handleOpenTimeLogModal = (employee: Employee) => {
    setSelectedEmployeeForLogs(employee);
    setManualTimeLog({ employeeId: employee.id, clockIn: new Date().toISOString().slice(0,16), clockOut: '', notes: '' });
    setIsTimeLogModalOpen(true);
  };
  
  const handleCloseTimeLogModal = () => {
    setIsTimeLogModalOpen(false);
    setSelectedEmployeeForLogs(null);
  };

  const handleTimeLogChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setManualTimeLog(prev => ({...prev, [name]: value}));
  };

  const handleTimeLogSubmit = async () => {
    if (!selectedEmployeeForLogs || !manualTimeLog.clockIn) {
        alert("จำเป็นต้องระบุพนักงานและเวลาเข้างาน");
        return;
    }
    try {
        await addTimeLog({
            employeeId: selectedEmployeeForLogs.id,
            employeeName: selectedEmployeeForLogs.name,
            clockIn: new Date(manualTimeLog.clockIn).toISOString(),
            clockOut: manualTimeLog.clockOut ? new Date(manualTimeLog.clockOut).toISOString() : undefined,
            notes: manualTimeLog.notes,
            source: 'Manual',
        });
        alert("บันทึกเวลาสำเร็จ");
        handleCloseTimeLogModal();
    } catch (error) {
        console.error("Failed to add time log:", error);
        alert("เกิดข้อผิดพลาดในการบันทึกเวลา");
    }
  };

  const handleOpenViewLogsModal = async (employee: Employee) => {
    setSelectedEmployeeForLogs(employee);
    setIsViewLogsModalOpen(true);
    try {
        const logs = await getEmployeeTimeLogs(employee.id);
        setTimeLogs(logs);
    } catch(error) {
        console.error(`Failed to fetch time logs for ${employee.name}`, error);
        setTimeLogs([]);
    }
  };

  const handleCloseViewLogsModal = () => {
    setIsViewLogsModalOpen(false);
    setSelectedEmployeeForLogs(null);
    setTimeLogs([]);
  };
  
  const handleExportEmployees = () => {
    const dataToExport = employees.map(emp => ({
        name: emp.name,
        nameEn: emp.nameEn || '',
        employeeCode: emp.employeeCode || '',
        email: emp.email,
        phone: emp.phone,
        department: emp.department,
        position: emp.position,
        status: EMPLOYEE_STATUSES_TH[emp.status as keyof typeof EMPLOYEE_STATUSES_TH] || emp.status,
        hireDate: emp.hireDate.split('T')[0],
        baseSalary: emp.baseSalary || 0,
        bankName: emp.bankName || '',
        bankAccountNumber: emp.bankAccountNumber || '',
        taxId: emp.taxId || '',
        socialSecurityNumber: emp.socialSecurityNumber || '',
        fingerprintScannerId: emp.fingerprintScannerId || '',
        passportNumber: emp.passportNumber || '',
        passportExpiryDate: emp.passportExpiryDate ? emp.passportExpiryDate.split('T')[0] : '',
    }));
    exportToCsv('employees_data', dataToExport, employeeCsvHeaderMapping);
  };

  const handleImportEmployees = async (parsedData: any[]): Promise<{success: boolean, message: string}> => {
    try {
        const employeesToInsert: Partial<Employee>[] = parsedData.map((row, index) => {
            const thaiName = row[employeeCsvHeaderMapping.name];
            if (!thaiName) {
                throw new Error(`แถวที่ ${index + 2}: ไม่พบข้อมูล 'ชื่อ-นามสกุล (ไทย)' ซึ่งเป็นข้อมูลบังคับ`);
            }

            const statusKey = Object.keys(EMPLOYEE_STATUSES_TH).find(key => EMPLOYEE_STATUSES_TH[key as EmployeeStatusKey] === row[employeeCsvHeaderMapping.status]) || 'Active';
            
            return {
                name: thaiName,
                nameEn: row[employeeCsvHeaderMapping.nameEn] || undefined,
                employeeCode: row[employeeCsvHeaderMapping.employeeCode] || undefined,
                email: row[employeeCsvHeaderMapping.email] || `user${Date.now()+index}@example.com`,
                phone: row[employeeCsvHeaderMapping.phone] || '',
                department: row[employeeCsvHeaderMapping.department] || DEPARTMENTS[0],
                position: row[employeeCsvHeaderMapping.position] || POSITIONS[0],
                status: statusKey as EmployeeStatusKey,
                hireDate: new Date(row[employeeCsvHeaderMapping.hireDate] || Date.now()).toISOString(),
                baseSalary: parseFloat(row[employeeCsvHeaderMapping.baseSalary]) || 0,
                bankName: row[employeeCsvHeaderMapping.bankName] || undefined,
                bankAccountNumber: row[employeeCsvHeaderMapping.bankAccountNumber] || undefined,
                taxId: row[employeeCsvHeaderMapping.taxId] || undefined,
                socialSecurityNumber: row[employeeCsvHeaderMapping.socialSecurityNumber] || undefined,
                fingerprintScannerId: row[employeeCsvHeaderMapping.fingerprintScannerId] || undefined,
                passportNumber: row[employeeCsvHeaderMapping.passportNumber] || undefined,
                passportExpiryDate: row[employeeCsvHeaderMapping.passportExpiryDate] ? new Date(row[employeeCsvHeaderMapping.passportExpiryDate]).toISOString() : undefined,
                role: UserRole.STAFF, // Default role for import
            };
        });

        if (employeesToInsert.length > 0) {
            await addBulkEmployees(employeesToInsert);
        }
        
        await fetchAllData();
        return { success: true, message: `นำเข้าสำเร็จ! เพิ่มพนักงานใหม่ ${employeesToInsert.length} คน (หมายเหตุ: บัญชีผู้ใช้ยังไม่ได้ถูกสร้าง)` };
    } catch (error: any) {
        console.error(error);
        return { success: false, message: `การนำเข้าล้มเหลว: ${error.message}` };
    }
  };

  const handleSimulateScannerSyncMain = async () => {
    setIsSyncingScanner(true);
    setScannerSyncMessage("กำลังซิงค์ข้อมูลจากเครื่องสแกนนิ้ว (จำลอง)...");
    const scannerSettings: FingerprintScannerSettings | null = await getSetting('fingerprintSettings');
    if (!scannerSettings || !scannerSettings.ipAddress || !scannerSettings.port) {
        setScannerSyncMessage("ข้อผิดพลาด: กรุณาตั้งค่าเครื่องสแกนนิ้วก่อนในหน้า 'ตั้งค่าระบบ > ตั้งค่าเครื่องสแกนนิ้ว'");
        setIsSyncingScanner(false);
        return;
    }
    await new Promise(resolve => setTimeout(resolve, 2000)); 
    setScannerSyncMessage("ซิงค์สำเร็จ! (จำลอง)");
    setIsSyncingScanner(false);
    await fetchAllData(); 
    setTimeout(() => setScannerSyncMessage(null), 5000); 
  };

  const employeeColumns: TableColumn<Employee>[] = [
    { header: 'รูปภาพ', accessor: (item) => <img src={item.profileImageUrl || `https://picsum.photos/seed/${item.id}/40/40`} alt={item.name} className="h-10 w-10 rounded-full" />, className:"w-16" },
    { header: 'รหัส', accessor: 'employeeCode'}, { header: 'ชื่อ-นามสกุล', accessor: 'name' }, { header: 'แผนก', accessor: 'department' }, { header: 'ตำแหน่ง', accessor: 'position' },
    { header: 'สถานะ', accessor: (item) => <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'Active' ? 'bg-green-100 text-green-800' : item.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{EMPLOYEE_STATUSES_TH[item.status as keyof typeof EMPLOYEE_STATUSES_TH] || item.status}</span> },
    { header: 'วันที่เริ่มงาน', accessor: (item) => new Date(item.hireDate).toLocaleDateString('th-TH') },
    { header: 'การดำเนินการ', accessor: (item) => (
      <div className="space-x-2">
        {user?.role === UserRole.ADMIN && (
          <>
            <Button variant="ghost" size="sm" onClick={() => handleOpenModal(item)} title="แก้ไขข้อมูลพนักงาน"><PencilIcon className="h-4 w-4"/></Button>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} title="ลบพนักงาน"><TrashIcon className="h-4 w-4 text-red-500"/></Button>
          </>
        )}
         {(user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER) && (<Button variant="ghost" size="sm" onClick={() => handleOpenTimeLogModal(item)} title="บันทึกเวลา (ด้วยตนเอง)"><ClockIcon className="h-4 w-4 text-primary-500"/></Button>)}
        <Button variant="ghost" size="sm" onClick={() => handleOpenViewLogsModal(item)} title="ดูประวัติการลงเวลา">ดูประวัติ</Button>
      </div>
    )},
  ];

  const timeLogColumns: TableColumn<TimeLog>[] = [
    { header: 'พนักงาน', accessor: 'employeeName'}, { header: 'เวลาเข้างาน', accessor: (item) => new Date(item.clockIn).toLocaleString('th-TH') }, { header: 'เวลาออกงาน', accessor: (item) => item.clockOut ? new Date(item.clockOut).toLocaleString('th-TH') : 'N/A' },
    { header: 'ระยะเวลา', accessor: (item) => { if (!item.clockOut) return 'N/A'; const durationMs = new Date(item.clockOut).getTime() - new Date(item.clockIn).getTime(); const hours = Math.floor(durationMs / (1000 * 60 * 60)); const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60)); return `${hours} ชม. ${minutes} นาที`; }},
    { header: 'แหล่งที่มา', accessor: (item) => item.source === 'Scanner' ? <span className="text-blue-600">สแกนนิ้ว</span> : 'ด้วยตนเอง' }, { header: 'หมายเหตุ', accessor: 'notes' },
  ];

  if (isLoading) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;

  const availableAllowanceComponents = payrollComponents.filter(pc => pc.type === 'Allowance' && !pc.isSystemCalculated);
  const availableDeductionComponents = payrollComponents.filter(pc => pc.type === 'Deduction' && !pc.isSystemCalculated);

  return (
    <div className="space-y-6">
      <Card title="จัดการข้อมูลพนักงาน" actions={ <div className="flex space-x-2"> {(user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER) && (<Button onClick={handleSimulateScannerSyncMain} variant="secondary" disabled={isSyncingScanner} leftIcon={<ArrowPathIcon className={`h-5 w-5 ${isSyncingScanner ? 'animate-spin':''}`}/>}> {isSyncingScanner ? "กำลังซิงค์..." : "ซิงค์จากสแกนเนอร์"} </Button>)} <Button onClick={handleExportEmployees} variant="secondary" leftIcon={<ArrowDownTrayIcon className="h-5 w-5"/>}>ส่งออก CSV</Button> {user?.role === UserRole.ADMIN && <Button onClick={() => setIsImportModalOpen(true)} variant="secondary" leftIcon={<ArrowUpTrayIcon className="h-5 w-5"/>}>นำเข้า CSV</Button>} {user?.role === UserRole.ADMIN && <Button onClick={() => handleOpenModal()} leftIcon={<PlusIcon className="h-5 w-5"/>}>เพิ่มพนักงาน</Button>} </div> }>
        {scannerSyncMessage && (<div className={`mb-4 p-3 rounded-md text-sm ${scannerSyncMessage.includes("สำเร็จ") ? 'bg-green-50 text-green-700' : scannerSyncMessage.includes("ข้อผิดพลาด") ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}> {scannerSyncMessage} </div>)}
        <Table columns={employeeColumns} data={employees} isLoading={isLoading} emptyMessage="ไม่พบข้อมูลพนักงาน"/>
      </Card>
      
      {user?.role === UserRole.ADMIN && (
        <ImportCsvModal 
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            onImport={handleImportEmployees}
            headerMapping={employeeCsvHeaderMapping}
            templateFilename="employee_import_template.csv"
            modalTitle="นำเข้าข้อมูลพนักงานจาก CSV"
        />
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingEmployeeId ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานใหม่'} size="xl">
        <div className="border-b border-gray-200 mb-4">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button onClick={() => setActiveTab('details')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'details' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>ข้อมูลทั่วไปและส่วนตัว</button>
                <button onClick={() => setActiveTab('payroll')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'payroll' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>ข้อมูลเงินเดือนและสวัสดิการ</button>
            </nav>
        </div>
        {activeTab === 'details' && (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Input label="รหัสพนักงาน" name="employeeCode" value={currentEmployee.employeeCode || ''} onChange={handleChange} />
                    <Input label="ชื่อ-นามสกุล (ไทย)" name="name" value={currentEmployee.name} onChange={handleChange} required />
                    <Input label="ชื่อ-นามสกุล (อังกฤษ)" name="nameEn" value={currentEmployee.nameEn || ''} onChange={handleChange} placeholder="Firstname Lastname"/>
                    <Input label="อีเมล (สำหรับเข้าระบบ)" name="email" type="email" value={currentEmployee.email} onChange={handleChange} required disabled={!!editingEmployeeId} />
                    {!editingEmployeeId && (
                         <Input label="รหัสผ่าน (สำหรับเข้าระบบ)" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                    )}
                    <Select label="สิทธิ์การใช้งาน" name="role" value={(currentEmployee as Employee).role} onChange={handleChange} options={userRoleOptions} />
                    <Input label="เบอร์โทรศัพท์" name="phone" type="tel" value={currentEmployee.phone} onChange={handleChange} />
                    <Select label="แผนก" name="department" value={currentEmployee.department} onChange={handleChange} options={DEPARTMENTS.map(d => ({ value: d, label: d }))} />
                    <Select label="ตำแหน่ง" name="position" value={currentEmployee.position} onChange={handleChange} options={POSITIONS.map(p => ({ value: p, label: p }))} />
                    <Select label="สถานะ" name="status" value={currentEmployee.status} onChange={handleChange} options={EMPLOYEE_STATUSES_OPTIONS} />
                    <Input label="วันที่เริ่มงาน" name="hireDate" type="date" value={currentEmployee.hireDate?.split('T')[0]} onChange={handleChange} required />
                    <Input label="URL รูปโปรไฟล์" name="profileImageUrl" value={currentEmployee.profileImageUrl || ''} onChange={handleChange} placeholder="https://picsum.photos/..."/>
                    <Input label="URL สัญญาจ้าง (ถ้ามี)" name="contractUrl" value={currentEmployee.contractUrl || ''} onChange={handleChange} placeholder="ลิงก์ไปยัง PDF"/>
                    <Input label="รหัสเครื่องสแกนนิ้ว (ถ้ามี)" name="fingerprintScannerId" value={currentEmployee.fingerprintScannerId || ''} onChange={handleChange} placeholder="เช่น FP001"/>
                </div>
                <h4 className="text-md font-semibold mt-6 mb-2">ข้อมูลหนังสือเดินทาง (สำหรับบัตรพนักงาน)</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="เลขที่หนังสือเดินทาง" name="passportNumber" value={currentEmployee.passportNumber || ''} onChange={handleChange} />
                    <Input label="หนังสือเดินทางหมดอายุ" name="passportExpiryDate" type="date" value={currentEmployee.passportExpiryDate?.split('T')[0] || ''} onChange={handleChange} />
                 </div>
            </>
        )}
        {activeTab === 'payroll' && (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="เงินเดือนพื้นฐาน (บาท)" name="baseSalary" type="number" value={currentEmployee.baseSalary || 0} onChange={handleChange} min="0" />
                    <Input label="ชื่อธนาคาร" name="bankName" value={currentEmployee.bankName || ''} onChange={handleChange} />
                    <Input label="เลขบัญชีธนาคาร" name="bankAccountNumber" value={currentEmployee.bankAccountNumber || ''} onChange={handleChange} />
                    <Input label="เลขประจำตัวผู้เสียภาษี" name="taxId" value={currentEmployee.taxId || ''} onChange={handleChange} />
                    <Input label="เลขประกันสังคม" name="socialSecurityNumber" value={currentEmployee.socialSecurityNumber || ''} onChange={handleChange} />
                    <Input label="อัตรากองทุนสำรองเลี้ยงชีพ (ลูกจ้าง %)" name="providentFundRateEmployee" type="number" value={currentEmployee.providentFundRateEmployee || 0} onChange={handleChange} min="0" max="15" step="0.5"/>
                    <Input label="อัตรากองทุนสำรองเลี้ยงชีพ (นายจ้าง %)" name="providentFundRateEmployer" type="number" value={currentEmployee.providentFundRateEmployer || 0} onChange={handleChange} min="0" max="15" step="0.5"/>
                </div>
                <div>
                    <h4 className="text-md font-semibold mb-2">รายการเงินได้ประจำ</h4>
                    {(currentEmployee.recurringAllowances || []).map((allowance, index) => (
                        <div key={`allow-${index}`} className="grid grid-cols-12 gap-2 mb-2 items-end">
                            <div className="col-span-6"><Select label={index === 0 ? "ประเภทเงินได้" : undefined} value={allowance.payrollComponentId} onChange={(e) => handleRecurringItemChange('allowance', index, 'payrollComponentId', e.target.value)} options={availableAllowanceComponents.map(c => ({value: c.id, label: c.name}))} placeholder="เลือกประเภท"/></div>
                            <div className="col-span-4"><Input label={index === 0 ? "จำนวนเงิน (บาท)" : undefined} type="number" value={allowance.amount} onChange={(e) => handleRecurringItemChange('allowance', index, 'amount', e.target.value)} /></div>
                            <div className="col-span-2"><Button variant="danger" size="sm" onClick={() => removeRecurringItem('allowance', index)} className="w-full"><TrashIcon className="h-4 w-4 mx-auto"/></Button></div>
                        </div>
                    ))}
                    <Button variant="secondary" size="sm" onClick={() => addRecurringItem('allowance')} leftIcon={<PlusIcon className="h-4"/>}>เพิ่มเงินได้ประจำ</Button>
                </div>
                <div>
                    <h4 className="text-md font-semibold mb-2">รายการเงินหักประจำ</h4>
                    {(currentEmployee.recurringDeductions || []).map((deduction, index) => (
                        <div key={`deduct-${index}`} className="grid grid-cols-12 gap-2 mb-2 items-end">
                           <div className="col-span-6"><Select label={index === 0 ? "ประเภทเงินหัก" : undefined} value={deduction.payrollComponentId} onChange={(e) => handleRecurringItemChange('deduction', index, 'payrollComponentId', e.target.value)} options={availableDeductionComponents.map(c => ({value: c.id, label: c.name}))} placeholder="เลือกประเภท"/></div>
                           <div className="col-span-4"><Input label={index === 0 ? "จำนวนเงิน (บาท)" : undefined} type="number" value={deduction.amount} onChange={(e) => handleRecurringItemChange('deduction', index, 'amount', e.target.value)} /></div>
                           <div className="col-span-2"><Button variant="danger" size="sm" onClick={() => removeRecurringItem('deduction', index)} className="w-full"><TrashIcon className="h-4 w-4 mx-auto"/></Button></div>
                        </div>
                    ))}
                    <Button variant="secondary" size="sm" onClick={() => addRecurringItem('deduction')} leftIcon={<PlusIcon className="h-4"/>}>เพิ่มเงินหักประจำ</Button>
                </div>
            </div>
        )}
        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="secondary" onClick={handleCloseModal}>ยกเลิก</Button>
          <Button onClick={handleSubmit}>{editingEmployeeId ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มพนักงาน'}</Button>
        </div>
      </Modal>

      {selectedEmployeeForLogs && (
        <Modal isOpen={isTimeLogModalOpen} onClose={handleCloseTimeLogModal} title={`บันทึกเวลาด้วยตนเองสำหรับ ${selectedEmployeeForLogs.name}`} size="md">
            <Input label="เวลาเข้างาน" name="clockIn" type="datetime-local" value={manualTimeLog.clockIn} onChange={handleTimeLogChange} required />
            <Input label="เวลาออกงาน (ถ้ามี)" name="clockOut" type="datetime-local" value={manualTimeLog.clockOut} onChange={handleTimeLogChange} />
            <Textarea label="หมายเหตุ" name="notes" value={manualTimeLog.notes} onChange={handleTimeLogChange} placeholder="เหตุผลการบันทึก, โครงการที่ทำ, ฯลฯ"/>
            <div className="mt-6 flex justify-end space-x-2">
            <Button variant="secondary" onClick={handleCloseTimeLogModal}>ยกเลิก</Button>
            <Button onClick={handleTimeLogSubmit}>บันทึกเวลา</Button>
            </div>
        </Modal>
      )}

       {selectedEmployeeForLogs && (
        <Modal isOpen={isViewLogsModalOpen} onClose={handleCloseViewLogsModal} title={`ประวัติการลงเวลาของ ${selectedEmployeeForLogs.name}`} size="xl">
            <Table columns={timeLogColumns} data={timeLogs} emptyMessage="ไม่พบประวัติการลงเวลาสำหรับพนักงานคนนี้" />
            <div className="mt-6 flex justify-end"><Button variant="secondary" onClick={handleCloseViewLogsModal}>ปิด</Button></div>
        </Modal>
       )}
    </div>
  );
};
