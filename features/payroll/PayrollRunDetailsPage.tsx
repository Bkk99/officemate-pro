import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PayrollRun, Payslip, Employee, PayrollRunStatus, UserRole } from '../../types';
import { 
    getPayrollRunById, 
    getPayslipsForRun, 
    getEmployeeById, 
    updatePayrollRun, 
    deletePayslip, 
    generatePayslipForEmployee, 
    addPayslip, 
    updatePayslip, 
    MOCK_EMPLOYEES 
} from '../../services/mockData';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Table, TableColumn } from '../../components/ui/Table';
import { Select } from '../../components/ui/Select';
// import { Input } from '../../components/ui/Input'; // Not directly used here anymore
import { Spinner } from '../../components/ui/Spinner';
import { PAYROLL_RUN_STATUSES_TH, PAYROLL_RUN_STATUS_OPTIONS, MONTH_OPTIONS, PAYROLL_RUN_STATUS_COLORS, APP_NAME, COMPANY_ADDRESS_MOCK, COMPANY_LOGO_URL_MOCK } from '../../constants';
import { PayslipView } from './PayslipView';
import { EditPayslipModal } from './EditPayslipModal'; 
import { exportToCsv } from '../../utils/export';
import { useAuth } from '../../contexts/AuthContext';
import { dispatchPayrollStatusNotification } from '../../services/notificationService'; // New

const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
  </svg>
);
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25V4c.827-.05 1.66-.075 2.5-.075zM8.47 9.03a.75.75 0 00-1.084-1.03l-1.5 1.75a.75.75 0 101.084 1.03l1.5-1.75zm3.116-1.03a.75.75 0 00-1.084 1.03l1.5 1.75a.75.75 0 101.084 1.03l-1.5-1.75z" clipRule="evenodd" />
  </svg>
);
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
    <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.18l3.75-3.75a1.651 1.651 0 112.334 2.333L3.333 10l3.415 3.415a1.651 1.651 0 01-2.333 2.334l-3.75-3.75zM19.336 9.41a1.651 1.651 0 010 1.18l-3.75 3.75a1.651 1.651 0 11-2.333-2.333L16.667 10l-3.415-3.415a1.651 1.651 0 112.333-2.334l3.75 3.75z" clipRule="evenodd" />
  </svg>
);
const ArrowDownTrayIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1.25-7.75A.75.75 0 0010 9.5v2.25H7.75a.75.75 0 000 1.5H10v2.25a.75.75 0 001.5 0V13.5h2.25a.75.75 0 000-1.5H11.5V9.5zM10 2a.75.75 0 01.75.75v3.558c1.95.36 3.635 1.493 4.81 3.207a.75.75 0 01-1.12.99C13.551 8.89 11.853 8 10 8s-3.551.89-4.44 2.515a.75.75 0 01-1.12-.99A6.479 6.479 0 019.25 6.308V2.75A.75.75 0 0110 2z" clipRule="evenodd" />
  </svg>
);

export const PayrollRunDetailsPage: React.FC = () => {
  const { user } = useAuth(); 
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const [payrollRun, setPayrollRun] = useState<PayrollRun | null>(null);
  const [displayedPayslips, setDisplayedPayslips] = useState<Payslip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isViewPayslipModalOpen, setIsViewPayslipModalOpen] = useState(false);
  const [selectedPayslipForView, setSelectedPayslipForView] = useState<Payslip | null>(null);
  const [selectedEmployeeForView, setSelectedEmployeeForView] = useState<Employee | null>(null);
  
  const [isEditPayslipModalOpen, setIsEditPayslipModalOpen] = useState(false);
  const [selectedPayslipForEdit, setSelectedPayslipForEdit] = useState<Payslip | null>(null);
  const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState<Employee | null>(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<PayrollRunStatus | ''>('');


  const fetchDetails = useCallback(async () => {
    if (!runId || !user) return;
    setIsLoading(true);
    // await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
    const run = getPayrollRunById(runId);
    if (run) {
      setPayrollRun(run);
      const allPayslipsForRun = getPayslipsForRun(runId);
      if (user.role === UserRole.STAFF) {
        const staffEmployeeRecord = MOCK_EMPLOYEES.find(emp => emp.id === user.id || (emp.name === user.name && emp.department === user.department));
        setDisplayedPayslips(allPayslipsForRun.filter(p => p.employeeId === staffEmployeeRecord?.id));
      } else {
        setDisplayedPayslips(allPayslipsForRun);
      }
    } else {
      navigate('/payroll', {replace: true}); 
    }
    setIsLoading(false);
  }, [runId, navigate, user]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleViewPayslip = (payslip: Payslip) => {
    const employee = getEmployeeById(payslip.employeeId);
    setSelectedPayslipForView(payslip);
    setSelectedEmployeeForView(employee || null);
    setIsViewPayslipModalOpen(true);
  };
  
  const handleOpenEditPayslipModal = (payslip: Payslip) => {
    if (!payrollRun || payrollRun.status !== PayrollRunStatus.DRAFT) {
        alert("สามารถแก้ไขสลิปได้เฉพาะเมื่อรอบการจ่ายอยู่ในสถานะ 'ฉบับร่าง' เท่านั้น");
        return;
    }
    const employee = getEmployeeById(payslip.employeeId);
    if (employee) {
        setSelectedPayslipForEdit(payslip);
        setSelectedEmployeeForEdit(employee);
        setIsEditPayslipModalOpen(true);
    } else {
        alert("ไม่พบข้อมูลพนักงานสำหรับสลิปนี้");
    }
  };

  const handleSaveEditedPayslip = (updatedPayslipData: Payslip) => {
    updatePayslip(updatedPayslipData); 
    fetchDetails(); // Re-fetch to update run totals and payslip list
    setIsEditPayslipModalOpen(false);
  };


  const handleDeletePayslip = async (payslipId: string) => {
    if (!payrollRun || (user && user.role === UserRole.STAFF)) return; 
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสลิปเงินเดือนนี้?')) {
        deletePayslip(payslipId);
        fetchDetails(); // Re-fetch details
    }
  };
  
  const handleStatusChange = async () => {
    if (!payrollRun || !newStatus || (user && user.role === UserRole.STAFF)) return; 
    
    const updatedRunData: Partial<PayrollRun> = { status: newStatus };
    if (newStatus === PayrollRunStatus.APPROVED && !payrollRun.dateApproved) {
        updatedRunData.dateApproved = new Date().toISOString();
    } else if (newStatus === PayrollRunStatus.PAID && !payrollRun.datePaid) {
        updatedRunData.datePaid = new Date().toISOString();
        const allPayslipsInRun = getPayslipsForRun(payrollRun.id);
        allPayslipsInRun.forEach(ps => {
            if (!ps.paymentDate) {
                updatePayslip({...ps, paymentDate: updatedRunData.datePaid});
            }
        });
    }

    const updatedRunResult = updatePayrollRun({ ...payrollRun, ...updatedRunData });
    if (updatedRunResult) {
        setPayrollRun(updatedRunResult);
        // Dispatch notification if status is Approved or Paid
        if (newStatus === PayrollRunStatus.APPROVED || newStatus === PayrollRunStatus.PAID) {
            const periodTextForNotif = `${MONTH_OPTIONS.find(m => m.value === updatedRunResult.periodMonth)?.label} ${updatedRunResult.periodYear + 543}`;
            dispatchPayrollStatusNotification(periodTextForNotif, newStatus);
        }
    }
    setIsStatusModalOpen(false);
    setNewStatus('');
    await fetchDetails(); 
  };

  const handleRecalculateRun = () => {
    if (!payrollRun || (user && user.role === UserRole.STAFF)) return; 
    if (!window.confirm("การคำนวณใหม่จะลบสลิปเงินเดือนที่มีอยู่ทั้งหมดและสร้างใหม่จากข้อมูลพนักงานล่าสุด คุณแน่ใจหรือไม่?")) return;

    // Delete existing payslips for this run
    [...payrollRun.payslipIds].forEach(pid => deletePayslip(pid)); // Iterate over a copy

    const activeEmployees = MOCK_EMPLOYEES.filter(emp => emp.status === 'Active' && emp.baseSalary && emp.baseSalary > 0);
    let totalGross = 0;
    let totalDeductionsRun = 0;
    let totalNet = 0;
    const newPayslipIds: string[] = [];

    activeEmployees.forEach(emp => {
        // Pass undefined for existingPayslipData to generate a fresh payslip
        const payslip = generatePayslipForEmployee(emp, payrollRun.periodMonth, payrollRun.periodYear, payrollRun.id, undefined);
        addPayslip(payslip); // This will also update MOCK_PAYSLIPS
        newPayslipIds.push(payslip.id);
        totalGross += payslip.grossPay;
        totalDeductionsRun += payslip.totalDeductions;
        totalNet += payslip.netPay;
    });
    
    const updatedRunDetails: PayrollRun = {
        ...payrollRun,
        payslipIds: newPayslipIds,
        totalEmployees: activeEmployees.length,
        totalGrossPay: totalGross,
        totalDeductions: totalDeductionsRun,
        totalNetPay: totalNet,
        status: PayrollRunStatus.DRAFT, 
        dateApproved: undefined,
        datePaid: undefined,
    };
    updatePayrollRun(updatedRunDetails);
    fetchDetails(); 
  };
  
  const handleExportPayslips = () => {
    if ((user && user.role === UserRole.STAFF)) return; 
    if (!displayedPayslips || displayedPayslips.length === 0) {
        alert("ไม่พบสลิปเงินเดือนสำหรับส่งออก");
        return;
    }
    const dataToExport = displayedPayslips.map(ps => ({
        'ID สลิป': ps.id,
        'ID พนักงาน': ps.employeeId,
        'ชื่อพนักงาน': ps.employeeName,
        'รอบการจ่าย': ps.payPeriod,
        'เงินเดือนพื้นฐาน': ps.baseSalary.toFixed(2),
        'ค่าล่วงเวลาชม.': ps.overtimeHours || 0,
        'อัตราค่าล่วงเวลา': ps.overtimeRate || 0,
        'รวมค่าล่วงเวลา': ps.overtimePay ? ps.overtimePay.toFixed(2) : 0,
        ...ps.allowances.reduce((obj, allow, idx) => ({...obj, [`เงินได้ ${idx+1} (${allow.name})`]: allow.amount.toFixed(2) }), {}),
        'รวมเงินได้': ps.grossPay.toFixed(2),
        'หักภาษี': ps.taxDeduction.toFixed(2),
        'หักประกันสังคม': ps.socialSecurityDeduction.toFixed(2),
        'หักกองทุนสำรองเลี้ยงชีพ': ps.providentFundDeduction.toFixed(2),
        ...ps.otherDeductions.reduce((obj, deduct, idx) => ({...obj, [`เงินหักอื่น ${idx+1} (${deduct.name})`]: deduct.amount.toFixed(2) }), {}),
        'รวมเงินหัก': ps.totalDeductions.toFixed(2),
        'เงินสุทธิ': ps.netPay.toFixed(2),
        'ธนาคาร': ps.bankName || '',
        'เลขที่บัญชี': ps.bankAccountNumber || '',
        'วันที่จ่าย (สลิป)': ps.paymentDate ? new Date(ps.paymentDate).toLocaleDateString('th-TH') : '',
    }));
    exportToCsv(`payslips_run_${runId}`, dataToExport);
  };


  const payslipColumns: TableColumn<Payslip>[] = [
    { header: 'รหัสพนักงาน', accessor: 'employeeCode' },
    { header: 'ชื่อพนักงาน', accessor: 'employeeName' },
    { header: 'ตำแหน่ง', accessor: 'employeePosition' },
    { header: 'เงินได้รวม (บาท)', accessor: (item) => item.grossPay.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}), className: 'text-right' },
    { header: 'เงินหักรวม (บาท)', accessor: (item) => item.totalDeductions.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}), className: 'text-right' },
    { header: 'เงินสุทธิ (บาท)', accessor: (item) => item.netPay.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}), className: 'text-right font-semibold' },
    { header: 'การดำเนินการ', accessor: (item) => (
      <div className="space-x-1">
        <Button variant="ghost" size="sm" onClick={() => handleViewPayslip(item)} title="ดูสลิปเงินเดือน"><EyeIcon className="h-4 w-4"/></Button>
        {user && user.role !== UserRole.STAFF && payrollRun?.status === PayrollRunStatus.DRAFT && (
            <>
                <Button variant="ghost" size="sm" onClick={() => handleOpenEditPayslipModal(item)} title="แก้ไขสลิป"><PencilIcon className="h-4 w-4 text-blue-600"/></Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeletePayslip(item.id)} title="ลบสลิป"><TrashIcon className="h-4 w-4 text-red-500"/></Button>
            </>
        )}
      </div>
    )},
  ];

  if (isLoading || !payrollRun || !user) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  
  const periodText = `${MONTH_OPTIONS.find(m=>m.value === payrollRun.periodMonth)?.label} ${payrollRun.periodYear + 543}`;
  const isStaffRole = user.role === UserRole.STAFF;


  return (
    <div className="space-y-6">
      <div className="mb-4">
        <Link to="/payroll" className="text-sm text-primary-600 hover:underline">&larr; กลับไปรายการ{isStaffRole ? 'สลิปของฉัน' : 'รอบการจ่าย'}</Link>
      </div>

      <Card title={`รายละเอียดรอบการจ่าย: ${periodText}`}
        actions={ !isStaffRole && (
          <div className="flex space-x-2 items-center">
             <span className={`px-3 py-1.5 text-sm font-semibold rounded-full ${PAYROLL_RUN_STATUS_COLORS[payrollRun.status]}`}>{PAYROLL_RUN_STATUSES_TH[payrollRun.status]}</span>
            {payrollRun.status !== PayrollRunStatus.PAID && payrollRun.status !== PayrollRunStatus.CANCELLED && (
                 <Button size="sm" variant="secondary" onClick={() => { setNewStatus(payrollRun.status); setIsStatusModalOpen(true); }}>เปลี่ยนสถานะ</Button>
            )}
          </div>
        )}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-secondary-50 rounded-lg">
          {!isStaffRole && (
            <>
              <div><span className="font-semibold">ID รอบจ่าย:</span> {payrollRun.id}</div>
              <div><span className="font-semibold">สร้างเมื่อ:</span> {new Date(payrollRun.dateCreated).toLocaleString('th-TH')}</div>
              <div><span className="font-semibold">พนักงาน:</span> {payrollRun.totalEmployees} คน</div>
              <div><span className="font-semibold">ยอดเงินได้รวม:</span> {payrollRun.totalGrossPay.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} บาท</div>
              <div><span className="font-semibold">ยอดเงินหักรวม:</span> {payrollRun.totalDeductions.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} บาท</div>
              <div><span className="font-semibold">ยอดสุทธิรวม:</span> {payrollRun.totalNetPay.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} บาท</div>
              {payrollRun.dateApproved && <div><span className="font-semibold">อนุมัติเมื่อ:</span> {new Date(payrollRun.dateApproved).toLocaleString('th-TH')}</div>}
              {payrollRun.datePaid && <div><span className="font-semibold">จ่ายเมื่อ:</span> {new Date(payrollRun.datePaid).toLocaleString('th-TH')}</div>}
              {payrollRun.notes && <div className="md:col-span-3"><span className="font-semibold">หมายเหตุ:</span> {payrollRun.notes}</div>}
            </>
          )}
           {isStaffRole && displayedPayslips.length > 0 && (
            <div className="md:col-span-3 text-center text-lg font-semibold">
                สถานะรอบจ่าย: <span className={`px-2 py-1 text-sm font-semibold rounded-full ${PAYROLL_RUN_STATUS_COLORS[payrollRun.status]}`}>{PAYROLL_RUN_STATUSES_TH[payrollRun.status]}</span>
            </div>
          )}
        </div>
        
        {!isStaffRole && payrollRun.status === PayrollRunStatus.DRAFT && (
             <Button onClick={handleRecalculateRun} variant="secondary" size="sm" className="mb-4">คำนวณรอบนี้ใหม่ทั้งหมด</Button>
        )}
      </Card>

      <Card 
        title={isStaffRole && displayedPayslips.length > 0 ? "สลิปเงินเดือนของคุณในรอบนี้" : isStaffRole && displayedPayslips.length === 0 ? "คุณไม่มีสลิปเงินเดือนในรอบการจ่ายนี้" : "สลิปเงินเดือนในรอบนี้"}
        actions={!isStaffRole && (<Button onClick={handleExportPayslips} variant="secondary" leftIcon={<ArrowDownTrayIcon className="h-5 w-5"/>}>ส่งออกสลิป CSV</Button>)}
      >
        {displayedPayslips.length > 0 ? (
            <Table columns={payslipColumns} data={displayedPayslips} isLoading={isLoading} emptyMessage="ไม่พบสลิปเงินเดือน"/>
        ) : !isLoading && (
            <p className="text-center text-gray-500 py-4">{isStaffRole ? "คุณไม่มีสลิปเงินเดือนในรอบการจ่ายนี้" : "ไม่พบสลิปเงินเดือนในรอบนี้"}</p>
        )}
      </Card>

      {selectedPayslipForView && (
        <Modal isOpen={isViewPayslipModalOpen} onClose={() => setIsViewPayslipModalOpen(false)} title={`สลิปเงินเดือน - ${selectedPayslipForView.employeeName}`} size="xl">
          <PayslipView 
            payslip={selectedPayslipForView} 
            employee={selectedEmployeeForView || undefined}
            companyName={APP_NAME}
            companyAddress={COMPANY_ADDRESS_MOCK}
            companyLogoUrl={COMPANY_LOGO_URL_MOCK} 
            isPaid={payrollRun.status === PayrollRunStatus.PAID || !!selectedPayslipForView.paymentDate}
          />
          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setIsViewPayslipModalOpen(false)}>ปิด</Button>
          </div>
        </Modal>
      )}

      {selectedPayslipForEdit && selectedEmployeeForEdit && payrollRun && (
        <EditPayslipModal
            isOpen={isEditPayslipModalOpen}
            onClose={() => setIsEditPayslipModalOpen(false)}
            payslip={selectedPayslipForEdit}
            employee={selectedEmployeeForEdit}
            onSave={handleSaveEditedPayslip}
            payrollRunMonth={payrollRun.periodMonth}
            payrollRunYear={payrollRun.periodYear}
        />
      )}


      {!isStaffRole && (
        <Modal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} title="เปลี่ยนสถานะรอบการจ่าย" size="sm">
            <Select 
                label="สถานะใหม่"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as PayrollRunStatus)}
                options={PAYROLL_RUN_STATUS_OPTIONS.filter(opt => {
                    if (payrollRun.status === PayrollRunStatus.DRAFT) return [PayrollRunStatus.APPROVED, PayrollRunStatus.CANCELLED].includes(opt.value as PayrollRunStatus);
                    if (payrollRun.status === PayrollRunStatus.APPROVED) return [PayrollRunStatus.PAID, PayrollRunStatus.CANCELLED, PayrollRunStatus.DRAFT].includes(opt.value as PayrollRunStatus);
                    return false; 
                })}
                placeholder="เลือกสถานะ"
            />
            <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={() => setIsStatusModalOpen(false)}>ยกเลิก</Button>
                <Button onClick={handleStatusChange} disabled={!newStatus || newStatus === payrollRun.status}>ยืนยัน</Button>
            </div>
        </Modal>
      )}
    </div>
  );
};
