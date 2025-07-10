import React, { useState, useEffect, useCallback } from 'react';
import { Employee, UserRole } from '../../types';
import { MOCK_EMPLOYEES, getEmployeeById } from '../../services/mockData';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import IdCardPreview from './IdCardPreview';
import { useAuth } from '../../contexts/AuthContext';
import { DEPARTMENTS } from '../../constants';

const PrinterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a8.25 8.25 0 018.586 0M12 18.75A2.25 2.25 0 019.75 21H6a2.25 2.25 0 01-2.25-2.25V15m3.75-3H6m12 0h3.75m-3.75 0V15m0-3.75V3.75A2.25 2.25 0 0015 1.5h-6A2.25 2.25 0 006.75 3.75v3.75m0 0h10.5m-10.5 0c.005.635.155 1.254.42 1.829M17.25 10.5c.265-.575.415-1.194.42-1.829" />
  </svg>
);
const ArrowPathRoundedSquareIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Flip card icon
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 4.006 4.006 0 00-3.662-.138M19.5 12v3.071c0 .92-.75 1.671-1.671 1.671H6.171A1.671 1.671 0 014.5 15.071V6.171A1.671 1.671 0 016.171 4.5h3.071" />
    </svg>
);
const ArrowsRightLeftIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Toggle orientation icon
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h18M16.5 3L21 7.5m0 0L16.5 12M21 7.5H3" />
    </svg>
);



export const EmployeeIdCardPage: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cardOrientation, setCardOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [cardSide, setCardSide] = useState<'front' | 'back'>('front');


  const cardIssueDate = new Date();
  const cardExpiryDate = new Date();
  cardExpiryDate.setFullYear(cardIssueDate.getFullYear() + 1);

  const isHRDeptStaff = user?.role === UserRole.STAFF && user.department === DEPARTMENTS[3]; 
  const isRegularStaff = user?.role === UserRole.STAFF && !isHRDeptStaff;
  const canSelectEmployee = user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER || isHRDeptStaff;

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let relevantEmployees = MOCK_EMPLOYEES;
    // For regular staff, we will still load all employees initially, but the selection will be fixed.
    // This is because HR Staff might fall under UserRole.STAFF but need full access.
    // The actual filtering for display/selection happens based on `canSelectEmployee`.
    
    setEmployees(relevantEmployees.filter(emp => emp.status === 'Active')); 
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    if (selectedEmployeeId) {
      const employeeDetails = getEmployeeById(selectedEmployeeId);
      setSelectedEmployee(employeeDetails || null);
    } else {
      setSelectedEmployee(null);
    }
  }, [selectedEmployeeId]);

  useEffect(() => { 
    if (isRegularStaff && user && employees.length > 0) {
        let staffEmployee = employees.find(emp => emp.id === user.id);
        if (!staffEmployee) {
           staffEmployee = employees.find(emp => emp.name === user.name && emp.department === user.department);
        }
        if (staffEmployee) {
            setSelectedEmployeeId(staffEmployee.id);
        } else {
            setSelectedEmployee(null); // Clear if no match
        }
    } else if (canSelectEmployee && employees.length > 0 && !selectedEmployeeId) {
        // For privileged users, if no one is selected yet, maybe default to first one or leave empty
        // setSelectedEmployeeId(employees[0].id); // Optional: select first employee for convenience for admin/HR
    }
  }, [user, employees, isRegularStaff, canSelectEmployee, selectedEmployeeId]);

  const handlePrint = () => {
    const printContents = document.getElementById('employee-id-card-preview')?.outerHTML;
    
    if (printContents) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>พิมพ์บัตรพนักงาน - ${selectedEmployee?.name || ''}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <script>
                tailwind.config = {
                  theme: {
                    extend: {
                       fontFamily: { sans: ['Tahoma', 'Sarabun', 'sans-serif'], },
                       colors: {
                        primary: {"50":"#fff5f7","100":"#ffeef2","200":"#fedde7","300":"#fecbd9","400":"#fdaac9","500":"#fc88b8","600":"#FB6F92","700":"#f4567f","800":"#e4426b","900":"#cc335c","950":"#a52346"},
                        secondary: {"50":"#f9fafb","100":"#f3f4f6","200":"#e5e7eb","300":"#d1d5db","400":"#9ca3af","500":"#6b7280","600":"#4b5563","700":"#374151","800":"#1f2937","900":"#111827","950":"#030712"}
                      }
                    }
                  }
                }
              </script>
              <style>
                body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background-color: #f0f0f0; }
                 @media print {
                  body { background-color: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; margin:0; padding:0; }
                  #employee-id-card-preview { 
                    width: ${cardOrientation === 'horizontal' ? '85.6mm' : '53.98mm'} !important;
                    height: ${cardOrientation === 'horizontal' ? '53.98mm' : '85.6mm'} !important;
                    box-sizing: border-box !important;
                    border: none !important; 
                    margin: 0 !important; 
                    padding: 0 !important;
                    box-shadow: none !important;
                    page-break-inside: avoid;
                  }
                 }
              </style>
            </head>
            <body>
                ${printContents}
              <script type="text/javascript">
                setTimeout(() => {
                  window.print();
                  window.onafterprint = function() { window.close(); }
                }, 300); 
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  if (isLoading || (isRegularStaff && !selectedEmployee && employees.length > 0)) { // Add check for regular staff waiting for auto-selection
      return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  const employeeOptions = employees.map(emp => ({ value: emp.id, label: `${emp.employeeCode || emp.id} - ${emp.name}` }));

  return (
    <div className="space-y-6">
      <Card title="สร้างบัตรพนักงาน">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            {canSelectEmployee ? (
                 <Select
                    label="เลือกพนักงาน"
                    options={employeeOptions}
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    placeholder="-- เลือกพนักงาน --"
                    disabled={isLoading}
                />
            ) : selectedEmployee ? (
                 <div>
                    <p className="block text-sm font-medium text-gray-700 mb-1">พนักงาน</p>
                    <p className="text-gray-900 bg-gray-100 p-2 rounded-md">{selectedEmployee.name} ({selectedEmployee.employeeCode || selectedEmployee.id})</p>
                 </div>
            ) : (
                <p className="text-gray-500">ไม่พบข้อมูลพนักงานของคุณ</p>
            )}
            
            {selectedEmployee && (
                <>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">รูปแบบบัตร</label>
                        <div className="flex space-x-2">
                            <Button 
                                variant={cardOrientation === 'horizontal' ? 'primary' : 'secondary'} 
                                onClick={() => setCardOrientation('horizontal')}
                                className="flex-1"
                            >แนวนอน</Button>
                            <Button 
                                variant={cardOrientation === 'vertical' ? 'primary' : 'secondary'} 
                                onClick={() => setCardOrientation('vertical')}
                                className="flex-1"
                            >แนวตั้ง</Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                         <label className="block text-sm font-medium text-gray-700">ด้านของบัตร</label>
                        <div className="flex space-x-2">
                            <Button 
                                variant={cardSide === 'front' ? 'primary' : 'secondary'} 
                                onClick={() => setCardSide('front')}
                                className="flex-1"
                            >ด้านหน้า</Button>
                            <Button 
                                variant={cardSide === 'back' ? 'primary' : 'secondary'} 
                                onClick={() => setCardSide('back')}
                                className="flex-1"
                            >ด้านหลัง</Button>
                        </div>
                    </div>
                </>
            )}


            {selectedEmployee && (
              <Button 
                onClick={handlePrint} 
                leftIcon={<PrinterIcon className="h-5 w-5"/>}
                className="w-full"
                disabled={!selectedEmployee}
              >
                พิมพ์บัตร ({cardSide === 'front' ? 'ด้านหน้า' : 'ด้านหลัง'}, {cardOrientation === 'horizontal' ? 'แนวนอน' : 'แนวตั้ง'})
              </Button>
            )}
             <div className="text-xs text-gray-500 mt-2">
                <p><strong>ขนาดบัตรมาตรฐาน:</strong> CR80 (85.6mm x 53.98mm)</p>
                <p>ตรวจสอบการตั้งค่าเครื่องพิมพ์เพื่อให้ได้ขนาดที่ถูกต้อง (เช่น ตั้งค่า scale เป็น 100% และเลือกขนาดกระดาษที่เหมาะสม)</p>
                <p>หากต้องการพิมพ์สองหน้า ให้พิมพ์ด้านหน้าก่อน จากนั้นพลิกกระดาษแล้วพิมพ์ด้านหลัง</p>
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col justify-center items-center space-y-4">
            <IdCardPreview 
                employee={selectedEmployee} 
                issueDate={cardIssueDate} 
                expiryDate={cardExpiryDate}
                orientation={cardOrientation}
                side={cardSide}
            />
             {selectedEmployee && (
                <div className="flex space-x-2">
                    <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setCardOrientation(o => o === 'horizontal' ? 'vertical' : 'horizontal')}
                        leftIcon={<ArrowsRightLeftIcon className="h-4 w-4" />}
                        title="เปลี่ยนรูปแบบบัตร"
                    >
                        {cardOrientation === 'horizontal' ? 'เป็นแนวตั้ง' : 'เป็นแนวนอน'}
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setCardSide(s => s === 'front' ? 'back' : 'front')}
                        leftIcon={<ArrowPathRoundedSquareIcon className="h-4 w-4" />}
                        title="พลิกดูอีกด้าน"
                    >
                        {cardSide === 'front' ? 'ดูด้านหลัง' : 'ดูด้านหน้า'}
                    </Button>
                </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
