import React, { useState, useEffect, useCallback } from 'react';
import { TaxBracket, PayrollComponent } from '../../types';
import { MOCK_TAX_BRACKETS_SIMPLIFIED } from '../../constants';
import { getPayrollComponents, addPayrollComponent, updatePayrollComponent, deletePayrollComponent } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Table, TableColumn } from '../../components/ui/Table';
import { Spinner } from '../../components/ui/Spinner';

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

const initialComponentState: Omit<PayrollComponent, 'id' | 'isSystemCalculated'> = {
    name: '',
    type: 'Allowance',
    isTaxable: false,
    defaultAmount: 0,
};


export const PayrollSettingsPage: React.FC = () => {
  const [taxBrackets, setTaxBrackets] = useState<TaxBracket[]>([]);
  const [payrollComponents, setPayrollComponents] = useState<PayrollComponent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);
  const [currentComponent, setCurrentComponent] = useState<Omit<PayrollComponent, 'id' | 'isSystemCalculated'> | PayrollComponent>(initialComponentState);
  const [editingComponentId, setEditingComponentId] = useState<string | null>(null);


  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setTaxBrackets(MOCK_TAX_BRACKETS_SIMPLIFIED); // This is a constant
    try {
        const components = await getPayrollComponents();
        setPayrollComponents(components);
    } catch (error) {
        console.error("Failed to fetch payroll components:", error);
        // Optionally, set an error state to show in the UI
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleOpenComponentModal = (component?: PayrollComponent) => {
    if (component?.isSystemCalculated) {
        alert("ไม่สามารถแก้ไขรายการที่คำนวณโดยระบบได้โดยตรง");
        return;
    }
    if (component) {
      setCurrentComponent(component);
      setEditingComponentId(component.id);
    } else {
      setCurrentComponent(initialComponentState);
      setEditingComponentId(null);
    }
    setIsComponentModalOpen(true);
  };

  const handleCloseComponentModal = () => {
    setIsComponentModalOpen(false);
    setCurrentComponent(initialComponentState);
    setEditingComponentId(null);
  };

  const handleComponentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isSystem = editingComponentId ? payrollComponents.find(c=>c.id === editingComponentId)?.isSystemCalculated : false;

    if (isSystem && (name === 'name' || name === 'type')) { // Prevent changing name/type of system components
        return;
    }

    if (type === 'checkbox') {
        setCurrentComponent(prev => ({...prev, [name]: (e.target as HTMLInputElement).checked}));
    } else if (name === 'defaultAmount' || name === 'defaultRate' || name === 'cap') {
         setCurrentComponent(prev => ({...prev, [name]: parseFloat(value) || 0 }));
    }
    else {
        setCurrentComponent(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleComponentSubmit = async () => {
    try {
        if (editingComponentId) {
          const originalComponent = payrollComponents.find(c => c.id === editingComponentId);
          if (originalComponent?.isSystemCalculated) {
              const { name, type, calculationBasis, ...editableFields } = currentComponent as PayrollComponent;
              await updatePayrollComponent({ ...originalComponent, ...editableFields });
          } else {
            await updatePayrollComponent(currentComponent as PayrollComponent);
          }
        } else {
          await addPayrollComponent(currentComponent as Omit<PayrollComponent, 'id' | 'isSystemCalculated'>);
        }
    } catch (error) {
        console.error("Failed to save payroll component:", error);
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
        await fetchSettings(); 
        handleCloseComponentModal();
    }
  };

  const handleComponentDelete = async (id: string) => {
    const componentToDelete = payrollComponents.find(c => c.id === id);
    if (componentToDelete?.isSystemCalculated) {
        alert("ไม่สามารถลบรายการที่คำนวณโดยระบบได้");
        return;
    }
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) {
        try {
            await deletePayrollComponent(id);
            await fetchSettings();
        } catch(error) {
            console.error("Failed to delete component", error);
            alert("เกิดข้อผิดพลาดในการลบข้อมูล");
        }
    }
  };


  const taxBracketColumns: TableColumn<TaxBracket>[] = [
    { header: 'ขั้นต่ำ (บาท)', accessor: (item) => item.minIncome.toLocaleString() },
    { header: 'ขั้นสูง (บาท)', accessor: (item) => item.maxIncome ? item.maxIncome.toLocaleString() : 'ขึ้นไป' },
    { header: 'อัตราภาษี (%)', accessor: (item) => `${(item.rate * 100).toFixed(1)}%` },
  ];

  const componentColumns: TableColumn<PayrollComponent>[] = [
    { header: 'ชื่อรายการ', accessor: 'name' },
    { header: 'ประเภท', accessor: (item) => item.type === 'Allowance' ? 'เงินได้' : 'เงินหัก' },
    { header: 'เสียภาษี', accessor: (item) => item.type === 'Allowance' ? (item.isTaxable ? 'ใช่' : 'ไม่ใช่') : 'N/A' },
    { header: 'ค่าตั้งต้น', accessor: (item) => item.defaultAmount ? item.defaultAmount.toLocaleString() + ' บาท' : (item.defaultRate ? `${item.defaultRate*100}%` : '-') },
    { header: 'การดำเนินการ', accessor: (item) => {
        if (item.isSystemCalculated) { 
            return <span className="text-xs text-gray-500">รายการระบบ</span>;
        }
        return (
            <div className="space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleOpenComponentModal(item)} title="แก้ไข"><PencilIcon className="h-4 w-4"/></Button>
                <Button variant="ghost" size="sm" onClick={() => handleComponentDelete(item.id)} title="ลบ"><TrashIcon className="h-4 w-4 text-red-500"/></Button>
            </div>
        )}
    },
  ];

  if (isLoading) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <Card title="ขั้นบันไดอัตราภาษีเงินได้บุคคลธรรมดา (ตัวอย่าง)">
        <p className="text-sm text-gray-600 mb-2">ข้อมูลนี้ใช้เพื่อการคำนวณภาษีเบื้องต้นในระบบ (ไม่สามารถแก้ไขได้ในหน้านี้)</p>
        <Table columns={taxBracketColumns} data={taxBrackets} isLoading={isLoading} />
      </Card>

      <Card 
        title="รายการเงินได้และเงินหักเริ่มต้น"
        actions={<Button onClick={() => handleOpenComponentModal()} leftIcon={<PlusIcon className="h-5 w-5"/>}>เพิ่มรายการใหม่</Button>}
      >
        <p className="text-sm text-gray-600 mb-2">จัดการรายการเงินได้/เงินหักที่สามารถกำหนดให้พนักงานได้</p>
        <Table columns={componentColumns} data={payrollComponents} isLoading={isLoading} />
      </Card>

      {isComponentModalOpen && (
        <Modal isOpen={isComponentModalOpen} onClose={handleCloseComponentModal} title={editingComponentId ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'} size="md">
            <Input 
                label="ชื่อรายการ" 
                name="name" 
                value={currentComponent.name} 
                onChange={handleComponentChange} 
                required 
                disabled={!!(editingComponentId && payrollComponents.find(c=>c.id===editingComponentId)?.isSystemCalculated)}
            />
            <Select 
                label="ประเภท" 
                name="type" 
                value={currentComponent.type} 
                onChange={handleComponentChange} 
                options={[{value: 'Allowance', label: 'เงินได้'}, {value: 'Deduction', label: 'เงินหัก'}]}
                required
                disabled={!!(editingComponentId && payrollComponents.find(c=>c.id===editingComponentId)?.isSystemCalculated)}
            />
            {currentComponent.type === 'Allowance' && (
                <div className="mt-4">
                    <label className="flex items-center">
                        <input type="checkbox" name="isTaxable" checked={!!currentComponent.isTaxable} onChange={handleComponentChange} className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                        <span className="ml-2 text-sm text-gray-700">รายการนี้ต้องเสียภาษี</span>
                    </label>
                </div>
            )}
            <Input label="จำนวนเงินเริ่มต้น (บาท)" name="defaultAmount" type="number" value={currentComponent.defaultAmount || 0} onChange={handleComponentChange} />
            
            <div className="mt-6 flex justify-end space-x-2">
            <Button variant="secondary" onClick={handleCloseComponentModal}>ยกเลิก</Button>
            <Button onClick={handleComponentSubmit}>{editingComponentId ? 'บันทึก' : 'เพิ่มรายการ'}</Button>
            </div>
        </Modal>
      )}
    </div>
  );
};