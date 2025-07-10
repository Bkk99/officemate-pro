
import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Payslip, PayrollComponent, Employee, EditPayslipFormData, PayslipItem } from '../../types';
import { MOCK_PAYROLL_COMPONENTS, generatePayslipForEmployee, getEmployeeById, getAllPayrollComponents } from '../../services/mockData'; 

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25V4c.827-.05 1.66-.075 2.5-.075zM8.47 9.03a.75.75 0 00-1.084-1.03l-1.5 1.75a.75.75 0 101.084 1.03l1.5-1.75zm3.116-1.03a.75.75 0 00-1.084 1.03l1.5 1.75a.75.75 0 101.084-1.03l-1.5-1.75z" clipRule="evenodd" />
  </svg>
);
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
  </svg>
);


interface EditPayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  payslip: Payslip;
  employee: Employee; // The full employee object for reference
  onSave: (updatedPayslip: Payslip) => void;
  payrollRunMonth: number;
  payrollRunYear: number;
}

export const EditPayslipModal: React.FC<EditPayslipModalProps> = ({ 
    isOpen, onClose, payslip, employee, onSave, payrollRunMonth, payrollRunYear 
}) => {
  const allPayrollComponents = getAllPayrollComponents();
  const [formData, setFormData] = useState<EditPayslipFormData>({
    baseSalary: payslip.baseSalary,
    overtimeHours: payslip.overtimeHours || 0,
    overtimeRate: payslip.overtimeRate || 0,
    oneTimeAllowances: [], 
    oneTimeDeductions: [], 
  });
  
  const [previewPayslip, setPreviewPayslip] = useState<Payslip>(payslip);

  const availableAllowanceComponents = allPayrollComponents.filter(c => c.type === 'Allowance' && !c.isSystemCalculated);
  const availableDeductionComponents = allPayrollComponents.filter(c => c.type === 'Deduction' && !c.isSystemCalculated);

  useEffect(() => {
    // Initialize oneTimeAllowances from the main payslip.allowances,
    // filtering out known recurring ones (this is a simplification)
    const adHocAllowances = payslip.allowances.filter(pa => {
        const isRecurring = employee.recurringAllowances?.some(ra => ra.name === pa.name || ra.payrollComponentId === pa.payrollComponentId);
        return !isRecurring;
    }).map(pa => ({ payrollComponentId: pa.payrollComponentId || '', name: pa.name, amount: pa.amount }));

    const adHocDeductions = payslip.otherDeductions.filter(pd => {
        const isRecurring = employee.recurringDeductions?.some(rd => rd.name === pd.name || rd.payrollComponentId === pd.payrollComponentId);
        const isSystemCalculated = MOCK_PAYROLL_COMPONENTS.find(pc => pc.id === pd.payrollComponentId || pc.name === pd.name)?.isSystemCalculated;
        return !isRecurring && !isSystemCalculated;
    }).map(pd => ({ payrollComponentId: pd.payrollComponentId || '', name: pd.name, amount: pd.amount }));


    setFormData({
        baseSalary: payslip.baseSalary,
        overtimeHours: payslip.overtimeHours || 0,
        overtimeRate: payslip.overtimeRate || 0,
        oneTimeAllowances: adHocAllowances,
        oneTimeDeductions: adHocDeductions 
    });
    setPreviewPayslip(payslip);
  }, [payslip, employee]);


  useEffect(() => {
    // Recalculate preview whenever formData changes
    const employeeDetails = getEmployeeById(payslip.employeeId);
    if (employeeDetails) {
        const tempPayslipData: Partial<Payslip> = {
            id: payslip.id, // Keep original ID
            overtimeHours: formData.overtimeHours,
            overtimeRate: formData.overtimeRate,
            _tempOneTimeAllowances: formData.oneTimeAllowances,
            _tempOneTimeDeductions: formData.oneTimeDeductions,
        };
        const recalculatedPreview = generatePayslipForEmployee(employeeDetails, payrollRunMonth, payrollRunYear, payslip.payrollRunId, tempPayslipData);
        setPreviewPayslip(recalculatedPreview);
    }
  }, [formData, payslip.employeeId, payslip.payrollRunId, payrollRunMonth, payrollRunYear, employee]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleItemChange = (
    type: 'allowance' | 'deduction', 
    index: number, 
    field: 'payrollComponentId' | 'amount', 
    value: string | number
  ) => {
    const items = type === 'allowance' ? [...formData.oneTimeAllowances] : [...formData.oneTimeDeductions];
    const componentList = type === 'allowance' ? availableAllowanceComponents : availableDeductionComponents;

    if (field === 'payrollComponentId') {
        const selectedComponent = componentList.find(c => c.id === value);
        items[index].payrollComponentId = value as string;
        items[index].name = selectedComponent ? selectedComponent.name : `Unknown ${type}`;
    } else if (field === 'amount') {
        items[index].amount = parseFloat(value as string) || 0;
    }

    if (type === 'allowance') {
        setFormData(prev => ({ ...prev, oneTimeAllowances: items }));
    } else {
        setFormData(prev => ({ ...prev, oneTimeDeductions: items }));
    }
  };

  const addItem = (type: 'allowance' | 'deduction') => {
    const newItem = { payrollComponentId: '', name: '', amount: 0 };
    if (type === 'allowance') {
        setFormData(prev => ({...prev, oneTimeAllowances: [...prev.oneTimeAllowances, newItem]}));
    } else {
        setFormData(prev => ({...prev, oneTimeDeductions: [...prev.oneTimeDeductions, newItem]}));
    }
  };

  const removeItem = (type: 'allowance' | 'deduction', index: number) => {
    if (type === 'allowance') {
        setFormData(prev => ({...prev, oneTimeAllowances: prev.oneTimeAllowances.filter((_, i) => i !== index)}));
    } else {
        setFormData(prev => ({...prev, oneTimeDeductions: prev.oneTimeDeductions.filter((_, i) => i !== index)}));
    }
  };

  const handleSubmit = () => {
    // The previewPayslip already has all calculations done based on formData
    onSave(previewPayslip); 
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`แก้ไขสลิปเงินเดือน: ${employee.name}`} size="xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Inputs */}
        <div className="md:col-span-2 space-y-4">
          <Input label="เงินเดือนพื้นฐาน (แสดงเท่านั้น)" type="number" value={formData.baseSalary} disabled />
          
          <fieldset className="border p-4 rounded-md">
            <legend className="text-sm font-medium px-1">ค่าล่วงเวลา (OT)</legend>
            <div className="grid grid-cols-2 gap-4 mt-2">
                <Input label="จำนวนชั่วโมง (OT)" name="overtimeHours" type="number" value={formData.overtimeHours} onChange={handleInputChange} wrapperClassName="!mb-0" />
                <Input label="อัตราต่อชั่วโมง (บาท)" name="overtimeRate" type="number" value={formData.overtimeRate} onChange={handleInputChange} wrapperClassName="!mb-0" />
            </div>
          </fieldset>

          <fieldset className="border p-4 rounded-md">
            <legend className="text-sm font-medium px-1">รายการเงินได้เพิ่มเติม (ครั้งเดียว)</legend>
            {formData.oneTimeAllowances.map((allowance, index) => (
              <div key={`allow-${index}`} className="grid grid-cols-12 gap-2 mb-2 items-end">
                <div className="col-span-6">
                  <Select
                    label={index === 0 ? "ประเภท" : undefined}
                    options={availableAllowanceComponents.map(c => ({ value: c.id, label: c.name }))}
                    value={allowance.payrollComponentId}
                    onChange={(e) => handleItemChange('allowance', index, 'payrollComponentId', e.target.value)}
                    placeholder="เลือกประเภทเงินได้"
                    wrapperClassName="!mb-0"
                  />
                </div>
                <div className="col-span-4">
                  <Input 
                    label={index === 0 ? "จำนวนเงิน (บาท)" : undefined}
                    type="number" 
                    value={allowance.amount} 
                    onChange={(e) => handleItemChange('allowance', index, 'amount', e.target.value)} 
                    wrapperClassName="!mb-0"
                    />
                </div>
                <div className="col-span-2">
                  <Button variant="danger" size="sm" onClick={() => removeItem('allowance', index)} className="w-full"><TrashIcon className="h-4 w-4 mx-auto"/></Button>
                </div>
              </div>
            ))}
            <Button variant="secondary" size="sm" onClick={() => addItem('allowance')} leftIcon={<PlusIcon className="h-4"/>}>เพิ่มรายการเงินได้</Button>
          </fieldset>

           <fieldset className="border p-4 rounded-md">
            <legend className="text-sm font-medium px-1">รายการเงินหักเพิ่มเติม (ครั้งเดียว)</legend>
            {formData.oneTimeDeductions.map((deduction, index) => (
              <div key={`deduct-${index}`} className="grid grid-cols-12 gap-2 mb-2 items-end">
                <div className="col-span-6">
                  <Select
                    label={index === 0 ? "ประเภท" : undefined}
                    options={availableDeductionComponents.map(c => ({ value: c.id, label: c.name }))}
                    value={deduction.payrollComponentId}
                    onChange={(e) => handleItemChange('deduction', index, 'payrollComponentId', e.target.value)}
                    placeholder="เลือกประเภทเงินหัก"
                    wrapperClassName="!mb-0"
                  />
                </div>
                <div className="col-span-4">
                  <Input 
                    label={index === 0 ? "จำนวนเงิน (บาท)" : undefined}
                    type="number" 
                    value={deduction.amount} 
                    onChange={(e) => handleItemChange('deduction', index, 'amount', e.target.value)} 
                    wrapperClassName="!mb-0"
                    />
                </div>
                <div className="col-span-2">
                  <Button variant="danger" size="sm" onClick={() => removeItem('deduction', index)} className="w-full"><TrashIcon className="h-4 w-4 mx-auto"/></Button>
                </div>
              </div>
            ))}
            <Button variant="secondary" size="sm" onClick={() => addItem('deduction')} leftIcon={<PlusIcon className="h-4"/>}>เพิ่มรายการเงินหัก</Button>
          </fieldset>
        </div>

        {/* Column 2: Preview */}
        <div className="md:col-span-1 space-y-2 bg-gray-50 p-4 rounded-md border">
          <h4 className="text-md font-semibold mb-2 border-b pb-1">ตัวอย่างสลิป (หลังแก้ไข)</h4>
          <p className="text-sm flex justify-between">เงินเดือน: <span>{previewPayslip.baseSalary.toFixed(2)}</span></p>
          {previewPayslip.allowances.map((a, i) => (
              <p key={`prev-allow-${i}`} className="text-sm flex justify-between">{a.name}: <span>{a.amount.toFixed(2)}</span></p>
          ))}
           {previewPayslip.overtimePay && previewPayslip.overtimePay > 0 && (
             <p className="text-sm flex justify-between">ค่าล่วงเวลา (OT): <span>{previewPayslip.overtimePay.toFixed(2)}</span></p>
           )}
          <p className="text-sm font-medium flex justify-between border-t pt-1 mt-1">รวมเงินได้: <span>{previewPayslip.grossPay.toFixed(2)}</span></p>
          
          <p className="text-sm flex justify-between mt-2">ภาษี: <span>{previewPayslip.taxDeduction.toFixed(2)}</span></p>
          <p className="text-sm flex justify-between">ประกันสังคม: <span>{previewPayslip.socialSecurityDeduction.toFixed(2)}</span></p>
          <p className="text-sm flex justify-between">กองทุนสำรองฯ: <span>{previewPayslip.providentFundDeduction.toFixed(2)}</span></p>
          {previewPayslip.otherDeductions.map((d, i) => (
              <p key={`prev-deduct-${i}`} className="text-sm flex justify-between">{d.name}: <span>{d.amount.toFixed(2)}</span></p>
          ))}
          <p className="text-sm font-medium flex justify-between border-t pt-1 mt-1">รวมเงินหัก: <span>{previewPayslip.totalDeductions.toFixed(2)}</span></p>
          
          <p className="text-lg font-bold flex justify-between text-primary-600 border-t-2 border-primary-500 pt-2 mt-2">ยอดสุทธิ: <span>{previewPayslip.netPay.toFixed(2)} บาท</span></p>
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-2">
        <Button variant="secondary" onClick={onClose}>ยกเลิก</Button>
        <Button onClick={handleSubmit}>บันทึกการเปลี่ยนแปลงสลิป</Button>
      </div>
    </Modal>
  );
};