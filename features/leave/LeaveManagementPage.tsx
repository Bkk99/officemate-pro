
import React, { useState, useEffect, useCallback } from 'react';
import { LeaveRequest, LeaveType, LeaveRequestStatus, UserRole, Employee } from '../../types';
import { 
    getLeaveRequests,
    addLeaveRequest, 
    updateLeaveRequest, 
    deleteLeaveRequest, 
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
    LEAVE_TYPE_OPTIONS, LEAVE_TYPES_TH, 
    LEAVE_REQUEST_STATUS_OPTIONS, LEAVE_REQUEST_STATUS_TH, LEAVE_REQUEST_STATUS_COLORS,
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
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
);
const XCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
);
const ArrowDownTrayIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1.25-7.75A.75.75 0 0010 9.5v2.25H7.75a.75.75 0 000 1.5H10v2.25a.75.75 0 001.5 0V13.5h2.25a.75.75 0 000-1.5H11.5V9.5zM10 2a.75.75 0 01.75.75v3.558c1.95.36 3.635 1.493 4.81 3.207a.75.75 0 01-1.12.99C13.551 8.89 11.853 8 10 8s-3.551.89-4.44 2.515a.75.75 0 01-1.12-.99A6.479 6.479 0 019.25 6.308V2.75A.75.75 0 0110 2z" clipRule="evenodd" />
  </svg>
);
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.18l3.75-3.75a1.651 1.651 0 112.334 2.333L3.333 10l3.415 3.415a1.651 1.651 0 01-2.333 2.334l-3.75-3.75zM19.336 9.41a1.651 1.651 0 010 1.18l-3.75 3.75a1.651 1.651 0 11-2.333-2.333L16.667 10l-3.415-3.415a1.651 1.651 0 112.333-2.334l3.75 3.75z" clipRule="evenodd" />
    </svg>
  );


const initialLeaveRequestState: Omit<LeaveRequest, 'id' | 'requestedDate' | 'employeeName' | 'status'> = {
  employeeId: '',
  leaveType: LeaveType.ANNUAL,
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  reason: '',
};

export const LeaveManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [allLeaveRequests, setAllLeaveRequests] = useState<LeaveRequest[]>([]);
  const [employeesForSelect, setEmployeesForSelect] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<Partial<LeaveRequest>>(initialLeaveRequestState);
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [requestForApproval, setRequestForApproval] = useState<LeaveRequest | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);
  const [requestForView, setRequestForView] = useState<LeaveRequest | null>(null);


  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterLeaveType, setFilterLeaveType] = useState<string>('');
  const [filterEmployee, setFilterEmployee] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  const isHRDeptStaff = user?.role === UserRole.STAFF && user.department === DEPARTMENTS[3]; // DEPARTMENTS[3] is 'ฝ่ายบุคคล'
  const isManagerOrAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER;
  const canManageAllRequests = isHRDeptStaff || isManagerOrAdmin;
  const isRegularStaff = user?.role === UserRole.STAFF && !isHRDeptStaff;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
        const [requests, employees] = await Promise.all([
            getLeaveRequests(),
            getEmployees()
        ]);
        setAllLeaveRequests(requests.map(req => ({
            ...req,
            durationInDays: calculateDuration(req.startDate, req.endDate)
        })));
        setEmployeesForSelect(employees);
    } catch(error) {
        console.error("Failed to fetch leave data:", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const calculateDuration = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive of start and end date
    return diffDays > 0 ? diffDays : 0;
  };

  const handleOpenModal = (request?: LeaveRequest) => {
    if (request) {
      // HR/Admin editing existing request
      setCurrentRequest({ ...request, startDate: request.startDate.split('T')[0], endDate: request.endDate.split('T')[0] });
      setEditingRequestId(request.id);
    } else {
      // New request
      if (isRegularStaff && user) {
        // Employee self-request
        setCurrentRequest({ 
            ...initialLeaveRequestState, 
            employeeId: user.id, 
            employeeName: user.name,
            startDate: new Date().toISOString().split('T')[0], 
            endDate: new Date().toISOString().split('T')[0] 
        });
      } else {
        // HR/Admin creating for someone
        setCurrentRequest({ ...initialLeaveRequestState, startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] });
      }
      setEditingRequestId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentRequest(initialLeaveRequestState);
    setEditingRequestId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentRequest(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!user || !currentRequest.leaveType || !currentRequest.startDate || !currentRequest.endDate) {
        alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ประเภทการลา, วันที่เริ่ม, วันที่สิ้นสุด)");
        return;
    }
    
    let targetEmployeeId = currentRequest.employeeId;
    let targetEmployeeName = currentRequest.employeeName;

    if (isRegularStaff && user) {
        targetEmployeeId = user.id;
        targetEmployeeName = user.name;
    } else if (!targetEmployeeId && canManageAllRequests) {
        alert("กรุณาเลือกพนักงาน");
        return;
    }
    
    if (!targetEmployeeId) {
        alert("ไม่สามารถระบุพนักงานได้");
        return;
    }
    
    if (new Date(currentRequest.endDate) < new Date(currentRequest.startDate)) {
        alert("วันที่สิ้นสุดต้องไม่น้อยกว่าวันที่เริ่มต้น");
        return;
    }

    const employeeDetails = await getEmployeeById(targetEmployeeId);
    targetEmployeeName = employeeDetails ? employeeDetails.name : targetEmployeeName || 'N/A';

    const requestData: Partial<LeaveRequest> = {
      ...currentRequest,
      employeeId: targetEmployeeId,
      employeeName: targetEmployeeName,
      startDate: new Date(currentRequest.startDate).toISOString(),
      endDate: new Date(currentRequest.endDate).toISOString(),
    };

    try {
        if (editingRequestId) {
            await updateLeaveRequest({ ...requestData, id: editingRequestId } as LeaveRequest);
        } else {
            await addLeaveRequest({ 
                ...requestData, 
                status: LeaveRequestStatus.PENDING, 
                requestedDate: new Date().toISOString() 
            } as Omit<LeaveRequest, 'id'>);
        }
    } catch(error) {
        console.error("Failed to save leave request:", error);
        alert("เกิดข้อผิดพลาดในการบันทึกคำขอลา");
    } finally {
        await fetchData();
        handleCloseModal();
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!canManageAllRequests) return; // Only Admin/HR can delete
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบคำขอลานี้ถาวร (ใช้สำหรับกรณีข้อมูลผิดพลาด)?')) {
      await deleteLeaveRequest(id);
      await fetchData();
    }
  };

  const handleOpenApprovalModal = (request: LeaveRequest) => {
    setRequestForApproval(request);
    setApprovalNotes(request.notes || '');
    setIsApprovalModalOpen(true);
  };
  
  const handleOpenViewDetailsModal = (request: LeaveRequest) => {
    setRequestForView(request);
    setIsViewDetailsModalOpen(true);
  };


  const handleApproveOrReject = async (newStatus: LeaveRequestStatus.APPROVED | LeaveRequestStatus.REJECTED) => {
    if (!requestForApproval || !user || !isManagerOrAdmin) return; // Only Manager/Admin can approve/reject
    const updatedRequest: LeaveRequest = {
        ...requestForApproval,
        status: newStatus,
        approverId: user.id,
        approverName: user.name,
        approvedDate: new Date().toISOString(),
        notes: approvalNotes || requestForApproval.notes,
    };
    await updateLeaveRequest(updatedRequest);
    await fetchData();
    setIsApprovalModalOpen(false);
    setRequestForApproval(null);
  };
  
  const handleCancelRequest = async (request: LeaveRequest) => {
    const canCancelOwn = isRegularStaff && user && request.employeeId === user.id && (request.status === LeaveRequestStatus.PENDING || request.status === LeaveRequestStatus.APPROVED);
    const canAdminCancel = canManageAllRequests && (request.status === LeaveRequestStatus.PENDING || request.status === LeaveRequestStatus.APPROVED);

    if (!canCancelOwn && !canAdminCancel) return;

     if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำขอลานี้?')) {
        const updatedRequest: LeaveRequest = {
            ...request,
            status: LeaveRequestStatus.CANCELLED,
            notes: `${request.notes || ''} (ยกเลิกโดย ${user?.name} เมื่อ ${new Date().toLocaleDateString('th-TH')})`.trim()
        };
        await updateLeaveRequest(updatedRequest);
        await fetchData();
    }
  };

  const displayedRequests = isRegularStaff && user 
    ? allLeaveRequests.filter(req => req.employeeId === user.id)
    : allLeaveRequests;

  const filteredRequestsForTable = displayedRequests.filter(req => {
    if (!canManageAllRequests && isRegularStaff && user && req.employeeId !== user.id) { // Double ensure staff only see their own
        return false;
    }
    return (
        (filterStatus ? req.status === filterStatus : true) &&
        (filterLeaveType ? req.leaveType === filterLeaveType : true) &&
        (canManageAllRequests && filterEmployee ? req.employeeId === filterEmployee : true) && // Filter by employee only for managers
        (filterStartDate ? new Date(req.startDate) >= new Date(filterStartDate) : true) &&
        (filterEndDate ? new Date(req.endDate) <= new Date(filterEndDate) : true)
    );
  });
  
  const handleExportLeaves = () => {
    const dataToExport = filteredRequestsForTable.map(req => ({
        'ID คำขอ': req.id,
        'รหัสพนักงาน': req.employeeId,
        'ชื่อพนักงาน': req.employeeName,
        'ประเภทการลา': LEAVE_TYPES_TH[req.leaveType as LeaveType],
        'วันที่เริ่มลา': new Date(req.startDate).toLocaleDateString('th-TH'),
        'วันที่สิ้นสุดลา': new Date(req.endDate).toLocaleDateString('th-TH'),
        'จำนวนวัน': req.durationInDays,
        'เหตุผล': req.reason || '',
        'สถานะ': LEAVE_REQUEST_STATUS_TH[req.status as LeaveRequestStatus],
        'วันที่ยื่นขอ': new Date(req.requestedDate).toLocaleDateString('th-TH'),
        'ผู้อนุมัติ': req.approverName || '',
        'วันที่อนุมัติ/ปฏิเสธ': req.approvedDate ? new Date(req.approvedDate).toLocaleDateString('th-TH') : '',
        'หมายเหตุ (ผู้ดูแล)': req.notes || '',
    }));
    exportToCsv('leave_requests_data', dataToExport);
  };

  const columns: TableColumn<LeaveRequest>[] = [
    ...(canManageAllRequests ? [{ header: 'ชื่อพนักงาน', accessor: 'employeeName', className: 'whitespace-nowrap' } as TableColumn<LeaveRequest>] : []),
    { header: 'ประเภทการลา', accessor: (item) => LEAVE_TYPES_TH[item.leaveType] },
    { header: 'วันที่เริ่ม', accessor: (item) => new Date(item.startDate).toLocaleDateString('th-TH') },
    { header: 'วันที่สิ้นสุด', accessor: (item) => new Date(item.endDate).toLocaleDateString('th-TH') },
    { header: 'จำนวนวัน', accessor: (item) => item.durationInDays || calculateDuration(item.startDate, item.endDate), className: 'text-center' },
    { header: 'สถานะ', accessor: (item) => <span className={`px-2 py-1 text-xs font-semibold rounded-full ${LEAVE_REQUEST_STATUS_COLORS[item.status]}`}>{LEAVE_REQUEST_STATUS_TH[item.status]}</span> },
    { header: 'วันที่ยื่นขอ', accessor: (item) => new Date(item.requestedDate).toLocaleDateString('th-TH') },
    {
      header: 'การดำเนินการ',
      accessor: (item) => (
        <div className="space-x-1 whitespace-nowrap">
          <Button variant="ghost" size="sm" onClick={() => handleOpenViewDetailsModal(item)} title="ดูรายละเอียด"><EyeIcon className="h-4 w-4 text-gray-600"/></Button>
          {isManagerOrAdmin && item.status === LeaveRequestStatus.PENDING && (
            <Button variant="ghost" size="sm" onClick={() => handleOpenApprovalModal(item)} title="อนุมัติ/ปฏิเสธ">
                <CheckCircleIcon className="h-4 w-4 text-green-500 inline-block mr-1"/>
                <XCircleIcon className="h-4 w-4 text-red-500 inline-block"/>
            </Button>
          )}
          {canManageAllRequests && item.status === LeaveRequestStatus.PENDING && (
            <Button variant="ghost" size="sm" onClick={() => handleOpenModal(item)} title="แก้ไข (HR/Admin)"><PencilIcon className="h-4 w-4"/></Button>
          )}
          {/* Employee can cancel their own PENDING or APPROVED request */}
          {isRegularStaff && user && item.employeeId === user.id && (item.status === LeaveRequestStatus.PENDING || item.status === LeaveRequestStatus.APPROVED) && (
             <Button variant="ghost" size="sm" onClick={() => handleCancelRequest(item)} title="ยกเลิกคำขอ"><TrashIcon className="h-4 w-4 text-orange-500"/></Button>
          )}
          {/* HR/Admin can cancel PENDING or APPROVED requests */}
          {canManageAllRequests && (item.status === LeaveRequestStatus.PENDING || item.status === LeaveRequestStatus.APPROVED) && (
             <Button variant="ghost" size="sm" onClick={() => handleCancelRequest(item)} title="ยกเลิกคำขอ (HR/Admin)"><TrashIcon className="h-4 w-4 text-orange-500"/></Button>
          )}
          {/* HR/Admin can delete for error correction */}
          {canManageAllRequests && (
            <Button variant="ghost" size="sm" onClick={() => handleDeleteRequest(item.id)} title="ลบถาวร (สำหรับข้อผิดพลาด)"><TrashIcon className="h-4 w-4 text-red-600"/></Button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading || !user) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  
  const pageTitle = isRegularStaff ? "รายการลาของฉัน" : "ระบบจัดการการลาของพนักงาน";

  return (
    <div className="space-y-6">
      <Card 
        title={pageTitle}
        actions={(
            <div className='flex space-x-2'>
                {(isRegularStaff || canManageAllRequests) && <Button onClick={() => handleOpenModal()} leftIcon={<PlusIcon className="h-5 w-5"/>}>{isRegularStaff ? "ยื่นคำขอลา" : "เพิ่มคำขอลา"}</Button>}
                {canManageAllRequests && <Button onClick={handleExportLeaves} variant="secondary" leftIcon={<ArrowDownTrayIcon className="h-5 w-5"/>}>ส่งออก CSV</Button>}
            </div>
        )}
      >
        {canManageAllRequests && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4 p-4 border-b">
                <Select label="สถานะ" options={[{value:'', label: 'ทั้งหมด'}, ...LEAVE_REQUEST_STATUS_OPTIONS]} value={filterStatus} onChange={e => setFilterStatus(e.target.value)} placeholder="สถานะทั้งหมด" wrapperClassName="!mb-0"/>
                <Select label="ประเภทการลา" options={[{value:'', label: 'ทั้งหมด'}, ...LEAVE_TYPE_OPTIONS]} value={filterLeaveType} onChange={e => setFilterLeaveType(e.target.value)} placeholder="ประเภททั้งหมด" wrapperClassName="!mb-0"/>
                <Select label="พนักงาน" options={[{value:'', label: 'พนักงานทั้งหมด'}, ...employeesForSelect.map(emp => ({value: emp.id, label: emp.name}))]} value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)} placeholder="พนักงานทั้งหมด" wrapperClassName="!mb-0"/>
                <Input label="วันที่เริ่ม (ตั้งแต่)" type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} wrapperClassName="!mb-0"/>
                <Input label="วันที่สิ้นสุด (ถึง)" type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} wrapperClassName="!mb-0"/>
            </div>
        )}
        <Table columns={columns} data={filteredRequestsForTable} isLoading={isLoading} emptyMessage="ไม่พบคำขอลา"/>
      </Card>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingRequestId ? 'แก้ไขคำขอลา' : (isRegularStaff ? 'ยื่นคำขอลา' : 'เพิ่มคำขอลาใหม่')} size="lg">
            {canManageAllRequests && !isRegularStaff && !editingRequestId && (
                <Select label="พนักงาน" name="employeeId" value={currentRequest.employeeId || ''} onChange={handleChange} options={employeesForSelect.map(e => ({ value: e.id, label: e.name }))} required placeholder="เลือกพนักงาน"/>
            )}
            { (isRegularStaff || (editingRequestId && currentRequest.employeeName)) && (
                 <Input label="พนักงาน" value={isRegularStaff && user ? user.name : currentRequest.employeeName || ''} disabled wrapperClassName="mb-2"/>
            )}

          <Select label="ประเภทการลา" name="leaveType" value={currentRequest.leaveType || LeaveType.ANNUAL} onChange={handleChange} options={LEAVE_TYPE_OPTIONS} required placeholder="เลือกประเภทการลา"/>
          <Input label="วันที่เริ่มลา" name="startDate" type="date" value={currentRequest.startDate?.toString().split('T')[0] || ''} onChange={handleChange} required />
          <Input label="วันที่สิ้นสุดลา" name="endDate" type="date" value={currentRequest.endDate?.toString().split('T')[0] || ''} onChange={handleChange} required />
          <Textarea label="เหตุผลการลา" name="reason" value={currentRequest.reason || ''} onChange={handleChange} required={currentRequest.leaveType === LeaveType.SICK || currentRequest.leaveType === LeaveType.PERSONAL || currentRequest.leaveType === LeaveType.OTHER} />
           
           {editingRequestId && currentRequest.status && canManageAllRequests && (
             <Select label="สถานะ (สำหรับ HR/Admin)" name="status" value={currentRequest.status} onChange={handleChange} options={LEAVE_REQUEST_STATUS_OPTIONS} required />
           )}
           {editingRequestId && currentRequest.notes && canManageAllRequests && (
             <Textarea label="หมายเหตุจากผู้อนุมัติ (แสดง)" value={currentRequest.notes} disabled />
           )}

          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="secondary" onClick={handleCloseModal}>ยกเลิก</Button>
            <Button onClick={handleSubmit}>{editingRequestId ? 'บันทึกการแก้ไข' : (isRegularStaff ? 'ยื่นคำขอ' : 'บันทึกคำขอลา')}</Button>
          </div>
        </Modal>
      )}

      {isApprovalModalOpen && requestForApproval && (
        <Modal isOpen={isApprovalModalOpen} onClose={() => setIsApprovalModalOpen(false)} title={`พิจารณาคำขอลา: ${requestForApproval.employeeName}`} size="md">
            <p><strong>ประเภท:</strong> {LEAVE_TYPES_TH[requestForApproval.leaveType]}</p>
            <p><strong>ช่วงวันที่:</strong> {new Date(requestForApproval.startDate).toLocaleDateString('th-TH')} - {new Date(requestForApproval.endDate).toLocaleDateString('th-TH')} ({requestForApproval.durationInDays} วัน)</p>
            <p><strong>เหตุผล:</strong> {requestForApproval.reason || '-'}</p>
            <Textarea label="หมายเหตุประกอบการพิจารณา (ถ้ามี)" name="approvalNotes" value={approvalNotes} onChange={(e) => setApprovalNotes(e.target.value)} />
            <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={() => setIsApprovalModalOpen(false)}>ยกเลิก</Button>
                <Button variant="danger" onClick={() => handleApproveOrReject(LeaveRequestStatus.REJECTED)}>ปฏิเสธ</Button>
                <Button variant="primary" onClick={() => handleApproveOrReject(LeaveRequestStatus.APPROVED)}>อนุมัติ</Button>
            </div>
        </Modal>
      )}
      
      {isViewDetailsModalOpen && requestForView && (
         <Modal isOpen={isViewDetailsModalOpen} onClose={()=> setIsViewDetailsModalOpen(false)} title={`รายละเอียดคำขอลา: ${requestForView.employeeName}`} size="md">
            <div className="space-y-2 text-sm text-gray-800">
                <p><strong>พนักงาน:</strong> {requestForView.employeeName} ({requestForView.employeeId})</p>
                <p><strong>ประเภทการลา:</strong> {LEAVE_TYPES_TH[requestForView.leaveType]}</p>
                <p><strong>วันที่เริ่มลา:</strong> {new Date(requestForView.startDate).toLocaleDateString('th-TH')}</p>
                <p><strong>วันที่สิ้นสุดลา:</strong> {new Date(requestForView.endDate).toLocaleDateString('th-TH')}</p>
                <p><strong>จำนวนวันลา:</strong> {requestForView.durationInDays} วัน</p>
                <p><strong>เหตุผล:</strong> {requestForView.reason || '-'}</p>
                <p><strong>สถานะ:</strong> <span className={`px-1.5 py-0.5 text-xs font-semibold rounded-full ${LEAVE_REQUEST_STATUS_COLORS[requestForView.status]}`}>{LEAVE_REQUEST_STATUS_TH[requestForView.status]}</span></p>
                <p><strong>วันที่ยื่นคำขอ:</strong> {new Date(requestForView.requestedDate).toLocaleString('th-TH')}</p>
                {requestForView.approverName && <p><strong>ผู้ดำเนินการ:</strong> {requestForView.approverName}</p>}
                {requestForView.approvedDate && <p><strong>วันที่ดำเนินการ:</strong> {new Date(requestForView.approvedDate).toLocaleString('th-TH')}</p>}
                {requestForView.notes && <p><strong>หมายเหตุ:</strong> {requestForView.notes}</p>}
            </div>
             <div className="mt-6 flex justify-end">
                <Button variant="secondary" onClick={() => setIsViewDetailsModalOpen(false)}>ปิด</Button>
            </div>
         </Modal>
      )}

    </div>
  );
};
