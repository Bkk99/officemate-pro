
import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Payslip, Employee, EditPayslipFormData, PayrollComponent, PayslipItem } from '../../types';
import { generatePayslipForEmployee } from './payrollCalculations';
import { getAllPayrollComponents } from '../../services/api'; 

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
  employee: Employee;
  onSave: (updatedPayslip: Payslip) => void;
  payrollRunMonth: number;
  payrollRunYear: number;
}

export const EditPayslipModal: React.FC<EditPayslipModalProps> = ({ isOpen, onClose, payslip, employee, onSave, payrollRunMonth, payrollRunYear }) => {
  const [formData, setFormData] = useState<EditPayslipFormData>({
    baseSalary: payslip.baseSalary,
    overtimeHours: payslip.overtimeHours || 0,
    overtimeRate: payslip.overtimeRate || 0,
    oneTimeAllowances: [],
    oneTimeDeductions: []
  });

  const [availableComponents, setAvailableComponents] = useState<{ allowances: PayrollComponent[]; deductions: PayrollComponent[] }>({ allowances: [], deductions: [] });

  useEffect(() => {
    // Separate recurring from one-time allowances/deductions
    const recurringAllowancesIds = new Set(employee.recurringAllowances?.map(a => a.payrollComponentId));
    const recurringDeductionsIds = new Set(employee.recurringDeductions?.map(d => d.payrollComponentId));
    
    // An overtime allowance is also technically a recurring one if rate is set
    recurringAllowancesIds.add('comp_ot');

    setFormData(prev => ({
      ...prev,
      oneTimeAllowances: payslip.allowances.filter(a => !recurringAllowancesIds.has(a.payrollComponentId)).map(a => ({...a, payrollComponentId: a.payrollComponentId || '' })),
      oneTimeDeductions: payslip.otherDeductions.filter(d => !recurringDeductionsIds.has(d.payrollComponentId)).map(d => ({...d, payrollComponentId: d.payrollComponentId || '' })),
    }));

    const fetchComponents = async () => {
        const allComponents = await getAllPayrollComponents();
        setAvailableComponents({
            allowances: allComponents.filter(c => c.type === 'Allowance' && !c.isSystemCalculated),
            deductions: allComponents.filter(c => c.type === 'Deduction' && !c.isSystemCalculated)
        });
    };
    fetchComponents();
  }, [payslip, employee]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: parseFloat(value) || 0}));
  };
  
  const handleAdHocChange = (type: 'allowance' | 'deduction', index: number, field: 'payrollComponentId' | 'amount', value: string) => {
    const items = type === 'allowance' ? [...formData.oneTimeAllowances] : [...formData.oneTimeDeductions];
    if (field === 'payrollComponentId') {
        const selectedComponent = availableComponents[type === 'allowance' ? 'allowances' : 'deductions'].find(c => c.id === value);
        items[index].payrollComponentId = value;
        items[index].name = selectedComponent?.name || '';
    } else {
        items[index].amount = parseFloat(value) || 0;
    }
    setFormData(prev => type === 'allowance' ? {...prev, oneTimeAllowances: items} : {...prev, oneTimeDeductions: items});
  };

  const addAdHocItem = (type: 'allowance' | 'deduction') => {
    const newItem = { id: `temp-adhoc-${Date.now()}`, payrollComponentId: '', name: '', amount: 0 };
    setFormData(prev => type === 'allowance' ? {...prev, oneTimeAllowances: [...prev.oneTimeAllowances, newItem]} : {...prev, oneTimeDeductions: [...prev.oneTimeDeductions, newItem]});
  };

  const removeAdHocItem = (type: 'allowance' | 'deduction', index: number) => {
    setFormData(prev => type === 'allowance' ? {...prev, oneTimeAllowances: prev.oneTimeAllowances.filter((_, i) => i !== index)} : {...prev, oneTimeDeductions: prev.oneTimeDeductions.filter((_, i) => i !== index)});
  };

  const handleSave = async () => {
    const payslipToRecalculate: Partial<Payslip> = {
        ...payslip,
        overtimeHours: formData.overtimeHours,
        overtimeRate: formData.overtimeRate,
        _tempOneTimeAllowances: formData.oneTimeAllowances,
        _tempOneTimeDeductions: formData.oneTimeDeductions
    };

    const updatedPayslip = await generatePayslipForEmployee(employee, payrollRunMonth, payrollRunYear, payslip.payrollRunId, payslipToRecalculate);
    onSave(updatedPayslip);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`แก้ไขสลิป: ${payslip.employeeName}`} size="xl">
        <div className="space-y-6">
            <fieldset className="border p-4 rounded-md">
                <legend className="text-md font-semibold px-2">ค่าล่วงเวลา (OT)</legend>
                <div className="grid grid-cols-2 gap-4">
                    <Input label="จำนวนชั่วโมง" name="overtimeHours" type="number" value={formData.overtimeHours} onChange={handleChange} />
                    <Input label="อัตราต่อชั่วโมง" name="overtimeRate" type="number" value={formData.overtimeRate} onChange={handleChange} />
                </div>
            </fieldset>

            <fieldset className="border p-4 rounded-md">
                <legend className="text-md font-semibold px-2">เงินได้อื่นๆ (เฉพาะกิจ)</legend>
                {formData.oneTimeAllowances.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-end">
                        <div className="col-span-6"><Select label={index === 0 ? "ประเภท" : undefined} value={item.payrollComponentId} onChange={e => handleAdHocChange('allowance', index, 'payrollComponentId', e.target.value)} options={availableComponents.allowances.map(c => ({value: c.id, label: c.name}))} wrapperClassName="!mb-0" placeholder="เลือกประเภท"/></div>
                        <div className="col-span-4"><Input label={index === 0 ? "จำนวนเงิน" : undefined} type="number" value={item.amount} onChange={e => handleAdHocChange('allowance', index, 'amount', e.target.value)} wrapperClassName="!mb-0" /></div>
                        <div className="col-span-2"><Button variant="danger" size="sm" onClick={() => removeAdHocItem('allowance', index)}><TrashIcon className="h-4 w-4 mx-auto"/></Button></div>
                    </div>
                ))}
                <Button variant="secondary" size="sm" onClick={() => addAdHocItem('allowance')} leftIcon={<PlusIcon className="h-4"/>}>เพิ่มเงินได้</Button>
            </fieldset>
            
            <fieldset className="border p-4 rounded-md">
                <legend className="text-md font-semibold px-2">เงินหักอื่นๆ (เฉพาะกิจ)</legend>
                 {formData.oneTimeDeductions.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-end">
                        <div className="col-span-6"><Select label={index === 0 ? "ประเภท" : undefined} value={item.payrollComponentId} onChange={e => handleAdHocChange('deduction', index, 'payrollComponentId', e.target.value)} options={availableComponents.deductions.map(c => ({value: c.id, label: c.name}))} wrapperClassName="!mb-0" placeholder="เลือกประเภท"/></div>
                        <div className="col-span-4"><Input label={index === 0 ? "จำนวนเงิน" : undefined} type="number" value={item.amount} onChange={e => handleAdHocChange('deduction', index, 'amount', e.target.value)} wrapperClassName="!mb-0" /></div>
                        <div className="col-span-2"><Button variant="danger" size="sm" onClick={() => removeAdHocItem('deduction', index)}><TrashIcon className="h-4 w-4 mx-auto"/></Button></div>
                    </div>
                ))}
                <Button variant="secondary" size="sm" onClick={() => addAdHocItem('deduction')} leftIcon={<PlusIcon className="h-4"/>}>เพิ่มเงินหัก</Button>
            </fieldset>

        </div>
        <div className="mt-6 flex justify-end space-x-2">
            <Button variant="secondary" onClick={onClose}>ยกเลิก</Button>
            <Button onClick={handleSave}>คำนวณใหม่และบันทึก</Button>
        </div>
    </Modal>
  );
};
