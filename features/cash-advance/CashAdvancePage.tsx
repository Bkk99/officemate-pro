
import React, { useState, useEffect, useCallback } from 'react';
import { CashAdvanceRequest, CashAdvanceRequestStatus, UserRole, Employee } from '../../types';
import { 
    getCashAdvanceRequests,
    addCashAdvanceRequest, 
    updateCashAdvanceRequest, 
    deleteCashAdvanceRequest, 
    getEmployeeById,
    getEmployees
} from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Table, TableColumn } from '../../components/ui/Table';
import { 
    CASH_ADVANCE_REASONS,
    CASH_ADVANCE_STATUS_OPTIONS,
    CASH_ADVANCE_STATUS_TH,
    CASH_ADVANCE_STATUS_COLORS,
    DEPARTMENTS
} from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner } from '../../components/ui/Spinner';
import { exportToCsv } from '../../utils/export';

// Icons
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
  </svg>
);
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25V4c.827-.05 1.66-.075 2.5-.075zM8.47 9.03a.75.75 0 00-1.084-1.03l-1.5 1.75a.75.75 0 101.084 1.03l1.5-1.75zm3.116-1.03a.75.75 0 00-1.084 1.03l1.5 1.75a.75.75 0 101.084-1.03l-1.5-1.75z" clipRule="evenodd" />
  </svg>
);
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
);
const XCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
);
const BanknotesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v15c0 .621-.504 1.125-1.125 1.125h-15A1.125 1.125 0 012.25 20.25v-15c0-.621.504-1.125 1.125-1.125H3.75m15-3V4.5A2.25 2.25 0 0016.5 2.25h-12A2.25 2.25 0 002.25 4.5v1.5M12 12.75a.75.75 0 000-1.5H5.25a.75.75 0 000 1.5H12z" />
    </svg>
  );
const ArrowDownTrayIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1.25-7.75A.75.75 0 0010 9.5v2.25H7.75a.75.75 0 000 1.5H10v2.25a.75.75 0 001.5 0V13.5h2.25a.75.75 0 000-1.5H11.5V9.5zM10 2a.75.75 0 01.75.75v3.558c1.95.36 3.635 1.493 4.81 3.207a.75.75 0 01-1.12.99C13.551 8.89 11.853 8 10 8s-3.551.89-4.44 2.515a.75.75 0 01-1.12-.99A6.479 6.479 0 019.25 6.308V2.75A.75.75 0 0110 2z" clipRule="evenodd" />
    </svg>
);


const initialRequestState: Omit<CashAdvanceRequest, 'id' | 'requestDate' | 'employeeName' | 'status' | 'employeeCode'> = {
  employeeId: '',
  amount: 0,
  reason: '',
};

export const CashAdvancePage: React.FC = () => {
  const { user } = useAuth();
  const [allRequests, setAllRequests] = useState<CashAdvanceRequest[]>([]);
  const [employeesForSelect, setEmployeesForSelect] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<Partial<CashAdvanceRequest>>(initialRequestState);
  
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [requestForAction, setRequestForAction] = useState<CashAdvanceRequest | null>(null);
  const [actionNotes, setActionNotes] = useState('');

  const isHRDeptStaff = user?.role === UserRole.STAFF && user.department === DEPARTMENTS[3]; // 'ฝ่ายบุคคล'
  const isManagerOrAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER;
  const isFinanceAdmin = user?.role === UserRole.ADMIN || user?.department === DEPARTMENTS[4]; // 'ฝ่ายการเงิน'
  const canManageAllRequests = isManagerOrAdmin || isHRDeptStaff;
  const isRegularStaff = user?.role === UserRole.STAFF && !isHRDeptStaff;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
        const [requests, employees] = await Promise.all([
            getCashAdvanceRequests(),
            getEmployees()
        ]);
        setAllRequests(requests);
        setEmployeesForSelect(employees.filter(e => e.status === 'Active'));
    } catch(error) {
        console.error("Failed to fetch cash advance data:", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = () => {
    if (isRegularStaff && user) {
        setCurrentRequest({ 
            ...initialRequestState, 
            employeeId: user.id, 
        });
    } else {
        setCurrentRequest({ ...initialRequestState });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentRequest(initialRequestState);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentRequest(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) : value }));
  };

  const handleSubmit = async () => {
    if (!user || !currentRequest.amount || !currentRequest.reason) {
        alert("กรุณากรอกจำนวนเงินและเหตุผลให้ครบถ้วน");
        return;
    }
    
    let targetEmployeeId = isRegularStaff ? user.id : currentRequest.employeeId;
    if (!targetEmployeeId) {
        alert("กรุณาเลือกพนักงาน");
        return;
    }
    
    const employeeDetails = await getEmployeeById(targetEmployeeId);
    if (!employeeDetails) {
        alert("ไม่พบข้อมูลพนักงาน");
        return;
    }

    const requestData: Omit<CashAdvanceRequest, 'id'> = {
        employeeId: employeeDetails.id,
        employeeName: employeeDetails.name,
        employeeCode: employeeDetails.employeeCode,
        requestDate: new Date().toISOString(),
        amount: currentRequest.amount,
        reason: currentRequest.reason,
        status: CashAdvanceRequestStatus.PENDING,
    };
    try {
        await addCashAdvanceRequest(requestData);
        await fetchData();
        handleCloseModal();
    } catch (error) {
        console.error("Failed to submit cash advance request:", error);
        alert("เกิดข้อผิดพลาดในการยื่นคำขอ");
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!canManageAllRequests) return;
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการเบิกเงินนี้?')) {
      await deleteCashAdvanceRequest(id);
      await fetchData();
    }
  };

  const handleOpenActionModal = (request: CashAdvanceRequest) => {
    setRequestForAction(request);
    setActionNotes(request.notes || '');
    setIsApprovalModalOpen(true);
  };

  const handleApproveOrReject = async (newStatus: CashAdvanceRequestStatus.APPROVED | CashAdvanceRequestStatus.REJECTED) => {
    if (!requestForAction || !user || !isManagerOrAdmin) return;
    
    const updatedRequest: CashAdvanceRequest = {
        ...requestForAction,
        status: newStatus,
        approverId: user.id,
        approverName: user.name,
        approvalDate: new Date().toISOString(),
        notes: actionNotes,
    };
    await updateCashAdvanceRequest(updatedRequest);
    await fetchData();
    setIsApprovalModalOpen(false);
    setRequestForAction(null);
  };

  const handleMarkAsPaid = async (request: CashAdvanceRequest) => {
    if (!isFinanceAdmin) return;
    if (window.confirm(`ยืนยันการจ่ายเงินจำนวน ${request.amount.toLocaleString()} บาท ให้กับ ${request.employeeName}?`)) {
        const updatedRequest: CashAdvanceRequest = {
            ...request,
            status: CashAdvanceRequestStatus.PAID,
            paymentDate: new Date().toISOString(),
        };
        await updateCashAdvanceRequest(updatedRequest);
        await fetchData();
    }
  };

  const handleExportRequests = () => {
    if (!canManageAllRequests) return;
    const headerMapping = {
        id: 'ID คำขอ',
        employeeCode: 'รหัสพนักงาน',
        employeeName: 'ชื่อพนักงาน',
        requestDate: 'วันที่ขอเบิก',
        amount: 'จำนวนเงิน',
        reason: 'เหตุผล',
        status: 'สถานะ',
        approverName: 'ผู้อนุมัติ',
        approvalDate: 'วันที่อนุมัติ',
        paymentDate: 'วันที่จ่ายเงิน',
        notes: 'หมายเหตุ',
    };
    const dataToExport = allRequests.map(req => ({
        id: req.id,
        employeeCode: req.employeeCode,
        employeeName: req.employeeName,
        requestDate: new Date(req.requestDate).toLocaleDateString('th-TH'),
        amount: req.amount,
        reason: req.reason,
        status: CASH_ADVANCE_STATUS_TH[req.status],
        approverName: req.approverName || '-',
        approvalDate: req.approvalDate ? new Date(req.approvalDate).toLocaleDateString('th-TH') : '-',
        paymentDate: req.paymentDate ? new Date(req.paymentDate).toLocaleDateString('th-TH') : '-',
        notes: req.notes || '-',
    }));
    exportToCsv('cash_advance_requests_data', dataToExport, headerMapping);
  };

  const displayedRequests = isRegularStaff && user 
    ? allRequests.filter(req => req.employeeId === user.id)
    : allRequests;

  const columns: TableColumn<CashAdvanceRequest>[] = [
    { header: 'วันที่ขอเบิก', accessor: (item) => new Date(item.requestDate).toLocaleDateString('th-TH') },
    ...(canManageAllRequests ? [{ header: 'ชื่อพนักงาน', accessor: 'employeeName', className: 'whitespace-nowrap' } as TableColumn<CashAdvanceRequest>] : []),
    { header: 'จำนวนเงิน (บาท)', accessor: (item) => item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 }), className: 'text-right' },
    { header: 'เหตุผล', accessor: 'reason', className: 'truncate max-w-xs' },
    { header: 'สถานะ', accessor: (item) => <span className={`px-2 py-1 text-xs font-semibold rounded-full ${CASH_ADVANCE_STATUS_COLORS[item.status]}`}>{CASH_ADVANCE_STATUS_TH[item.status]}</span> },
    { header: 'ผู้อนุมัติ', accessor: (item) => item.approverName || '-' },
    {
      header: 'การดำเนินการ',
      accessor: (item) => (
        <div className="space-x-1 whitespace-nowrap">
          {isManagerOrAdmin && item.status === CashAdvanceRequestStatus.PENDING && (
            <Button variant="ghost" size="sm" onClick={() => handleOpenActionModal(item)} title="อนุมัติ/ปฏิเสธ">
                <CheckCircleIcon className="h-4 w-4 text-green-500 inline-block mr-1"/>
                <XCircleIcon className="h-4 w-4 text-red-500 inline-block"/>
            </Button>
          )}
          {isFinanceAdmin && item.status === CashAdvanceRequestStatus.APPROVED && (
             <Button variant="ghost" size="sm" onClick={() => handleMarkAsPaid(item)} title="ทำเครื่องหมายว่าจ่ายแล้ว">
                <BanknotesIcon className="h-4 w-4 text-green-600"/>
             </Button>
          )}
          {canManageAllRequests && item.status === CashAdvanceRequestStatus.PENDING && (
            <Button variant="ghost" size="sm" onClick={() => handleDeleteRequest(item.id)} title="ลบคำขอ"><TrashIcon className="h-4 w-4 text-red-600"/></Button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading || !user) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  
  const pageTitle = isRegularStaff ? "รายการเบิกเงินล่วงหน้าของฉัน" : "ระบบเบิกเงินล่วงหน้า";

  return (
    <div className="space-y-6">
      <Card 
        title={pageTitle}
        actions={
            <div className="flex space-x-2">
                {canManageAllRequests && <Button onClick={handleExportRequests} variant="secondary" leftIcon={<ArrowDownTrayIcon className="h-5 w-5"/>}>ส่งออก CSV</Button>}
                <Button onClick={handleOpenModal} leftIcon={<PlusIcon className="h-5 w-5" />}>ยื่นคำขอเบิกเงิน</Button>
            </div>
        }
      >
        <Table columns={columns} data={displayedRequests} isLoading={isLoading} emptyMessage="ไม่พบรายการเบิกเงิน"/>
      </Card>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="ยื่นคำขอเบิกเงินล่วงหน้า" size="lg">
            {!isRegularStaff && (
                <Select 
                    label="พนักงาน" 
                    name="employeeId" 
                    value={currentRequest.employeeId || ''} 
                    onChange={handleChange} 
                    options={employeesForSelect.map(e => ({ value: e.id, label: `${e.employeeCode} - ${e.name}` }))} 
                    required 
                    placeholder="-- เลือกพนักงาน --"
                />
            )}
            {isRegularStaff && user && (
                <Input label="พนักงาน" value={`${user.name}`} disabled />
            )}

            <Input label="จำนวนเงิน (บาท)" name="amount" type="number" min="0" step="100" value={currentRequest.amount || ''} onChange={handleChange} required />
            <Textarea label="เหตุผลการขอเบิก" name="reason" value={currentRequest.reason || ''} onChange={handleChange} required rows={4} />
          
            <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={handleCloseModal}>ยกเลิก</Button>
                <Button onClick={handleSubmit}>ส่งคำขอ</Button>
            </div>
        </Modal>
      )}

      {isApprovalModalOpen && requestForAction && (
        <Modal isOpen={isApprovalModalOpen} onClose={() => setIsApprovalModalOpen(false)} title={`พิจารณาคำขอเบิกเงิน: ${requestForAction.employeeName}`} size="md">
            <p><strong>จำนวนเงิน:</strong> {requestForAction.amount.toLocaleString()} บาท</p>
            <p><strong>เหตุผล:</strong> {requestForAction.reason}</p>
            <Textarea label="หมายเหตุ (ถ้ามี)" name="actionNotes" value={actionNotes} onChange={(e) => setActionNotes(e.target.value)} />
            <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={() => setIsApprovalModalOpen(false)}>ยกเลิก</Button>
                <Button variant="danger" onClick={() => handleApproveOrReject(CashAdvanceRequestStatus.REJECTED)}>ปฏิเสธ</Button>
                <Button variant="primary" onClick={() => handleApproveOrReject(CashAdvanceRequestStatus.APPROVED)}>อนุมัติ</Button>
            </div>
        </Modal>
      )}
    </div>
  );
};
