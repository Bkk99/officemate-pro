
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PayrollRun, PayrollRunStatus, Payslip, UserRole, Employee } from '../../types';
import { 
  getPayrollRuns,
  addPayrollRun, 
  deletePayrollRun, 
  getEmployees,
  getPayslipsForEmployee,
  getEmployeeById,
  addPayslip,
  updatePayrollRun,
} from '../../services/api';
import { generatePayslipForEmployee } from './payrollCalculations';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { Table, TableColumn } from '../../components/ui/Table';
import { Textarea } from '../../components/ui/Input';
import { MONTH_OPTIONS, YEAR_OPTIONS, PAYROLL_RUN_STATUSES_TH, PAYROLL_RUN_STATUS_OPTIONS, PAYROLL_RUN_STATUS_COLORS, APP_NAME, COMPANY_ADDRESS_MOCK, COMPANY_LOGO_URL_MOCK } from '../../constants';
import { Spinner } from '../../components/ui/Spinner';
import { exportToCsv } from '../../utils/export';
import { useAuth } from '../../contexts/AuthContext';
import { PayslipView } from './PayslipView';

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
  </svg>
);
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
    <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.18l3.75-3.75a1.651 1.651 0 112.334 2.333L3.333 10l3.415 3.415a1.651 1.651 0 01-2.333 2.334l-3.75-3.75zM19.336 9.41a1.651 1.651 0 010 1.18l-3.75 3.75a1.651 1.651 0 11-2.333-2.333L16.667 10l-3.415-3.415a1.651 1.651 0 112.333-2.334l3.75 3.75z" clipRule="evenodd" />
  </svg>
);
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25V4c.827-.05 1.66-.075 2.5-.075zM8.47 9.03a.75.75 0 00-1.084-1.03l-1.5 1.75a.75.75 0 101.084 1.03l1.5-1.75zm3.116-1.03a.75.75 0 00-1.084 1.03l1.5 1.75a.75.75 0 101.084-1.03l-1.5-1.75z" clipRule="evenodd" />
  </svg>
);
const ArrowDownTrayIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1.25-7.75A.75.75 0 0010 9.5v2.25H7.75a.75.75 0 000 1.5H10v2.25a.75.75 0 001.5 0V13.5h2.25a.75.75 0 000-1.5H11.5V9.5zM10 2a.75.75 0 01.75.75v3.558c1.95.36 3.635 1.493 4.81 3.207a.75.75 0 01-1.12.99C13.551 8.89 11.853 8 10 8s-3.551.89-4.44 2.515a.75.75 0 01-1.12-.99A6.479 6.479 0 019.25 6.308V2.75A.75.75 0 0110 2z" clipRule="evenodd" />
  </svg>
);


const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

const initialRunState: Omit<PayrollRun, 'id' | 'dateCreated' | 'payslipIds' | 'totalEmployees' | 'totalGrossPay' | 'totalDeductions' | 'totalNetPay'> = {
  periodMonth: currentMonth,
  periodYear: currentYear,
  status: PayrollRunStatus.DRAFT,
  notes: '',
};

export const PayrollPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [myPayslips, setMyPayslips] = useState<Payslip[]>([]); // For Staff role
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateRunModalOpen, setIsCreateRunModalOpen] = useState(false);
  const [newRunData, setNewRunData] = useState(initialRunState);

  const [isPayslipViewModalOpen, setIsPayslipViewModalOpen] = useState(false);
  const [selectedPayslipForView, setSelectedPayslipForView] = useState<Payslip | null>(null);
  const [selectedEmployeeForView, setSelectedEmployeeForView] = useState<Employee | null>(null);


  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
        if (user.role === UserRole.STAFF) {
            const staffPayslips = await getPayslipsForEmployee(user.id);
            setMyPayslips(staffPayslips);
        } else {
            const runs = await getPayrollRuns();
            setPayrollRuns(runs);
        }
    } catch (error) {
        console.error("Failed to fetch payroll data:", error);
    } finally {
        setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateRunChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewRunData(prev => ({ ...prev, [name]: name === "periodMonth" || name === "periodYear" ? parseInt(value) : value }));
  };

  const handleCreateRunSubmit = async () => {
    const existingRun = payrollRuns.find(r => r.periodMonth === newRunData.periodMonth && r.periodYear === newRunData.periodYear);
    if (existingRun) {
        alert(`รอบการจ่ายเงินเดือนสำหรับ ${MONTH_OPTIONS.find(m=>m.value === newRunData.periodMonth)?.label} ${newRunData.periodYear + 543} มีอยู่แล้ว`);
        return;
    }
    
    const createdRunMeta = await addPayrollRun({
        ...newRunData,
        dateCreated: new Date().toISOString(),
        payslipIds: [],
        totalEmployees: 0,
        totalGrossPay: 0,
        totalDeductions: 0,
        totalNetPay: 0,
    });
    
    const activeEmployees = (await getEmployees()).filter(emp => emp.status === 'Active' && emp.baseSalary && emp.baseSalary > 0);
    let totalGross = 0;
    let totalDeductionsRun = 0;
    let totalNet = 0;
    const payslipIdsForRun: string[] = [];

    for (const emp of activeEmployees) {
        const payslip = await generatePayslipForEmployee(emp, createdRunMeta.periodMonth, createdRunMeta.periodYear, createdRunMeta.id);
        await addPayslip(payslip);
        payslipIdsForRun.push(payslip.id);
        totalGross += payslip.grossPay;
        totalDeductionsRun += payslip.totalDeductions;
        totalNet += payslip.netPay;
    }
    
    const finalRunData: PayrollRun = {
        ...createdRunMeta,
        payslipIds: payslipIdsForRun,
        totalEmployees: activeEmployees.length,
        totalGrossPay: totalGross,
        totalDeductions: totalDeductionsRun,
        totalNetPay: totalNet,
    };
    await updatePayrollRun(finalRunData);

    await fetchData();
    setIsCreateRunModalOpen(false);
    setNewRunData(initialRunState);
    navigate(`/payroll/${finalRunData.id}`);
  };

  const handleDeleteRun = async (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรอบการจ่ายเงินเดือนนี้และสลิปเงินเดือนที่เกี่ยวข้องทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
      await deletePayrollRun(id);
      await fetchData();
    }
  };

  const handleExportRuns = () => {
    const dataToExport = payrollRuns.map(run => ({
        'ID': run.id,
        'รอบเดือน': MONTH_OPTIONS.find(m => m.value === run.periodMonth)?.label,
        'ปี': run.periodYear + 543,
        'สถานะ': PAYROLL_RUN_STATUSES_TH[run.status],
        'วันที่สร้าง': new Date(run.dateCreated).toLocaleDateString('th-TH'),
        'วันที่อนุมัติ': run.dateApproved ? new Date(run.dateApproved).toLocaleDateString('th-TH') : '',
        'วันที่จ่าย': run.datePaid ? new Date(run.datePaid).toLocaleDateString('th-TH') : '',
        'จำนวนพนักงาน': run.totalEmployees,
        'ยอดรวมเงินได้': run.totalGrossPay.toFixed(2),
        'ยอดรวมหัก': run.totalDeductions.toFixed(2),
        'ยอดสุทธิ': run.totalNetPay.toFixed(2),
        'หมายเหตุ': run.notes || '',
    }));
    exportToCsv('payroll_runs_data', dataToExport);
  };
  
  const handleViewMyPayslip = async (payslip: Payslip) => {
    const employeeDetails = await getEmployeeById(payslip.employeeId);
    setSelectedPayslipForView(payslip);
    setSelectedEmployeeForView(employeeDetails || null);
    setIsPayslipViewModalOpen(true);
  };


  const adminManagerColumns: TableColumn<PayrollRun>[] = [
    { header: 'รอบการจ่าย', accessor: (item) => `${MONTH_OPTIONS.find(m=>m.value === item.periodMonth)?.label} ${item.periodYear + 543}` },
    { header: 'สถานะ', accessor: (item) => <span className={`px-2 py-1 text-xs font-semibold rounded-full ${PAYROLL_RUN_STATUS_COLORS[item.status]}`}>{PAYROLL_RUN_STATUSES_TH[item.status]}</span> },
    { header: 'จำนวนพนักงาน', accessor: 'totalEmployees', className: 'text-right' },
    { header: 'ยอดสุทธิ (บาท)', accessor: (item) => item.totalNetPay.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}), className: 'text-right font-semibold' },
    { header: 'วันที่สร้าง', accessor: (item) => new Date(item.dateCreated).toLocaleDateString('th-TH') },
    { header: 'การดำเนินการ', accessor: (item) => (
      <div className="space-x-2">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/payroll/${item.id}`)} title="ดูรายละเอียด"><EyeIcon className="h-4 w-4"/></Button>
        {item.status === PayrollRunStatus.DRAFT && (
            <Button variant="danger" size="sm" onClick={() => handleDeleteRun(item.id)} title="ลบรอบการจ่าย"><TrashIcon className="h-4 w-4"/></Button>
        )}
      </div>
    )},
  ];

  const staffPayslipColumns: TableColumn<Payslip>[] = [
    { header: 'รอบการจ่าย', accessor: 'payPeriod' },
    { header: 'ยอดเงินได้ (บาท)', accessor: (item) => item.grossPay.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}), className: 'text-right' },
    { header: 'ยอดเงินหัก (บาท)', accessor: (item) => item.totalDeductions.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}), className: 'text-right' },
    { header: 'ยอดสุทธิ (บาท)', accessor: (item) => item.netPay.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}), className: 'text-right font-semibold' },
    { header: 'วันที่จ่าย', accessor: (item) => item.paymentDate ? new Date(item.paymentDate).toLocaleDateString('th-TH') : 'รอดำเนินการ' },
    { header: 'การดำเนินการ', accessor: (item) => (
        <Button variant="ghost" size="sm" onClick={() => handleViewMyPayslip(item)} title="ดูสลิป"><EyeIcon className="h-4 w-4"/></Button>
    )},
  ];


  if (isLoading || !user) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  
  const isStaffRole = user.role === UserRole.STAFF;
  const pageTitle = isStaffRole ? "สลิปเงินเดือนของฉัน" : "รอบการจ่ายเงินเดือน";

  return (
    <div className="space-y-6">
      <Card 
        title={pageTitle}
        actions={!isStaffRole && (
            <div className="flex space-x-2">
                <Button onClick={handleExportRuns} variant="secondary" leftIcon={<ArrowDownTrayIcon className="h-5 w-5"/>}>ส่งออก CSV</Button>
                <Button onClick={() => setIsCreateRunModalOpen(true)} leftIcon={<PlusIcon className="h-5 w-5"/>}>สร้างรอบใหม่</Button>
            </div>
        )}
      >
        {isStaffRole ? (
            <Table columns={staffPayslipColumns} data={myPayslips} isLoading={isLoading} emptyMessage="ไม่พบสลิปเงินเดือนของคุณ"/>
        ) : (
            <Table columns={adminManagerColumns} data={payrollRuns} isLoading={isLoading} emptyMessage="ไม่พบรอบการจ่ายเงินเดือน"/>
        )}
      </Card>

      {!isStaffRole && (
        <Modal isOpen={isCreateRunModalOpen} onClose={() => setIsCreateRunModalOpen(false)} title="สร้างรอบการจ่ายเงินเดือนใหม่" size="md">
            <Select label="เดือน" name="periodMonth" value={newRunData.periodMonth} onChange={handleCreateRunChange} options={MONTH_OPTIONS} required />
            <Select label="ปี (พ.ศ.)" name="periodYear" value={newRunData.periodYear} onChange={handleCreateRunChange} options={YEAR_OPTIONS} required />
            <Textarea label="หมายเหตุ (ถ้ามี)" name="notes" value={newRunData.notes || ''} onChange={handleCreateRunChange} />
            <div className="mt-6 flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setIsCreateRunModalOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleCreateRunSubmit}>สร้างและคำนวณ</Button>
            </div>
        </Modal>
      )}

      {selectedPayslipForView && (
        <Modal isOpen={isPayslipViewModalOpen} onClose={() => setIsPayslipViewModalOpen(false)} title={`สลิปเงินเดือน - ${selectedPayslipForView.employeeName}`} size="xl">
          <PayslipView 
            payslip={selectedPayslipForView} 
            employee={selectedEmployeeForView || undefined}
            companyName={APP_NAME}
            companyAddress={COMPANY_ADDRESS_MOCK}
            companyLogoUrl={COMPANY_LOGO_URL_MOCK} 
            isPaid={selectedPayslipForView.paymentDate ? true : false}
          />
          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setIsPayslipViewModalOpen(false)}>ปิด</Button>
          </div>
        </Modal>
      )}

    </div>
  );
};
