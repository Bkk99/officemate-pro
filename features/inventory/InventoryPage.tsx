
import React, { useState, useEffect, useCallback } from 'react';
import { InventoryItem, StockTransaction, UserRole } from '../../types';
import { MOCK_INVENTORY_ITEMS, MOCK_STOCK_TRANSACTIONS, addInventoryItem, updateInventoryItem, deleteInventoryItem, addStockTransaction, getInventoryItemTransactions } from '../../services/mockData';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Table } from '../../components/ui/Table';
import { STOCK_TRANSACTION_REASONS, STOCK_TRANSACTION_TYPES_TH } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner } from '../../components/ui/Spinner';
import { exportToCsv } from '../../utils/export';

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
const ArrowDownTrayIcon = (props: React.SVGProps<SVGSVGElement>) => ( 
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
    <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
  </svg>
);
const ArrowUpTrayIcon = (props: React.SVGProps<SVGSVGElement>) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M10.75 17.25a.75.75 0 001.5 0V8.636l2.955 3.129a.75.75 0 001.09-1.03l-4.25-4.5a.75.75 0 00-1.09 0l-4.25 4.5a.75.75 0 101.09 1.03l2.955-3.129v8.614z" />
    <path d="M3.5 7.25a.75.75 0 00-1.5 0v-2.5A2.75 2.75 0 014.75 2h10.5A2.75 2.75 0 0118 4.75v2.5a.75.75 0 00-1.5 0v-2.5c0-.69-.56-1.25-1.25-1.25H4.75c-.69 0-1.25-.56-1.25-1.25v2.5z" />
  </svg>
);
const ArrowDownTrayIconExport = (props: React.SVGProps<SVGSVGElement>) => ( // Renamed for clarity
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1.25-7.75A.75.75 0 0010 9.5v2.25H7.75a.75.75 0 000 1.5H10v2.25a.75.75 0 001.5 0V13.5h2.25a.75.75 0 000-1.5H11.5V9.5zM10 2a.75.75 0 01.75.75v3.558c1.95.36 3.635 1.493 4.81 3.207a.75.75 0 01-1.12.99C13.551 8.89 11.853 8 10 8s-3.551.89-4.44 2.515a.75.75 0 01-1.12-.99A6.479 6.479 0 019.25 6.308V2.75A.75.75 0 0110 2z" clipRule="evenodd" />
  </svg>
);


const initialItemState: Omit<InventoryItem, 'id' | 'lastUpdated'> = {
  name: '', sku: '', category: '', quantity: 0, minStockLevel: 10, unitPrice: 0, supplier: ''
};

export const InventoryPage: React.FC = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [currentItem, setCurrentItem] = useState<Omit<InventoryItem, 'id' | 'lastUpdated'> | InventoryItem>(initialItemState);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  
  const [stockTransaction, setStockTransaction] = useState<{itemId: string; itemName: string; type: 'IN' | 'OUT'; quantity: number; reason: string}>({ itemId: '', itemName: '', type: 'IN', quantity: 1, reason: STOCK_TRANSACTION_REASONS[0] });
  const [selectedItemForHistory, setSelectedItemForHistory] = useState<InventoryItem | null>(null);

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    setInventory(MOCK_INVENTORY_ITEMS.map(item => ({...item, isLowStock: item.quantity < item.minStockLevel})));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleOpenItemModal = (item?: InventoryItem) => {
    if (user?.role === UserRole.STAFF) return; // Staff cannot open item modal
    if (item) {
      setCurrentItem(item);
      setEditingItemId(item.id);
    } else {
      setCurrentItem(initialItemState);
      setEditingItemId(null);
    }
    setIsItemModalOpen(true);
  };

  const handleCloseItemModal = () => {
    setIsItemModalOpen(false);
    setCurrentItem(initialItemState);
    setEditingItemId(null);
  };

  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numValue = (name === 'quantity' || name === 'minStockLevel' || name === 'unitPrice') ? parseFloat(value) : value;
    setCurrentItem(prev => ({ ...prev, [name]: numValue }));
  };

  const handleItemSubmit = async () => {
    if (user?.role === UserRole.STAFF) return; // Staff cannot submit item
    if (editingItemId) {
      updateInventoryItem(currentItem as InventoryItem);
    } else {
      addInventoryItem(currentItem as Omit<InventoryItem, 'id' | 'lastUpdated'>);
    }
    await fetchInventory();
    handleCloseItemModal();
  };

  const handleItemDelete = async (id: string) => {
    if (user?.role === UserRole.STAFF) return; // Staff cannot delete item
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้? (การดำเนินการนี้จะไม่ส่งผลต่อประวัติการทำธุรกรรม)')) {
      deleteInventoryItem(id);
      await fetchInventory();
    }
  };
  
  const handleOpenStockModal = (item: InventoryItem, type: 'IN' | 'OUT') => {
    if (type === 'IN' && user?.role === UserRole.STAFF) return; // Staff cannot do 'IN'
    setStockTransaction({ itemId: item.id, itemName: item.name, type, quantity: 1, reason: type === 'OUT' ? 'เบิกใช้ภายใน' : STOCK_TRANSACTION_REASONS[0] });
    setIsStockModalOpen(true);
  };

  const handleCloseStockModal = () => setIsStockModalOpen(false);

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStockTransaction(prev => ({ ...prev, [name]: name === 'quantity' ? parseInt(value) : value }));
  };

  const handleStockSubmit = async () => {
    if (!user) return;
    if (stockTransaction.type === 'IN' && user.role === UserRole.STAFF) { // Double check here too
        alert("พนักงานไม่สามารถทำรายการรับสินค้าเข้าสต็อกได้");
        return;
    }
    addStockTransaction({
      ...stockTransaction,
      employeeId: user.id,
      employeeName: user.name,
    });
    await fetchInventory(); 
    handleCloseStockModal();
  };

  const handleOpenHistoryModal = (item: InventoryItem) => {
    setSelectedItemForHistory(item);
    setIsHistoryModalOpen(true);
  };
  const handleCloseHistoryModal = () => {
    setSelectedItemForHistory(null);
    setIsHistoryModalOpen(false);
  };

  const handleExportInventory = () => {
    if (user?.role === UserRole.STAFF) return; // Staff cannot export CSV
    const dataToExport = inventory.map(item => ({
        'รหัสสินค้า (SKU)': item.sku,
        'ชื่อสินค้า': item.name,
        'หมวดหมู่': item.category,
        'จำนวนคงเหลือ': item.quantity,
        'สต็อกขั้นต่ำ': item.minStockLevel,
        'ราคาต่อหน่วย': item.unitPrice,
        'ซัพพลายเออร์': item.supplier || '',
        'อัปเดตล่าสุด': new Date(item.lastUpdated).toLocaleString('th-TH'),
        'สถานะสต็อกต่ำ': item.quantity < item.minStockLevel ? 'ใช่' : 'ไม่ใช่',
    }));
    exportToCsv('inventory_data', dataToExport);
  };


  const inventoryColumns = [
    { header: 'รหัสสินค้า (SKU)', accessor: 'sku' },
    { header: 'ชื่อสินค้า', accessor: 'name', 
      cell: (item: InventoryItem) => (
        <div>
          {item.name}
          {item.isLowStock && <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-red-800 bg-red-100 rounded-full">สินค้าเหลือน้อย</span>}
        </div>
      )
    },
    { header: 'หมวดหมู่', accessor: 'category' },
    { header: 'จำนวน', accessor: 'quantity', className: 'text-right' },
    { header: 'สต็อกขั้นต่ำ', accessor: 'minStockLevel', className: 'text-right' },
    { header: 'ราคาต่อหน่วย', accessor: (item: InventoryItem) => `฿${item.unitPrice.toFixed(2)}`, className: 'text-right' },
    { header: 'อัปเดตล่าสุด', accessor: (item: InventoryItem) => new Date(item.lastUpdated).toLocaleDateString('th-TH') },
    { header: 'การดำเนินการ', accessor: (item: InventoryItem) => (
      <div className="space-x-1 flex items-center">
        {user?.role !== UserRole.STAFF && (
            <Button variant="ghost" size="sm" onClick={() => handleOpenStockModal(item, 'IN')} title="รับสินค้าเข้า"><ArrowDownTrayIcon className="h-4 w-4 text-green-600"/></Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => handleOpenStockModal(item, 'OUT')} title="เบิกของ/จ่ายสินค้าออก"><ArrowUpTrayIcon className="h-4 w-4 text-red-600"/></Button>
        {user?.role !== UserRole.STAFF && (
          <>
            <Button variant="ghost" size="sm" onClick={() => handleOpenItemModal(item)} title="แก้ไขสินค้า"><PencilIcon className="h-4 w-4"/></Button>
            <Button variant="ghost" size="sm" onClick={() => handleItemDelete(item.id)} title="ลบสินค้า"><TrashIcon className="h-4 w-4 text-red-500"/></Button>
          </>
        )}
        <Button variant="ghost" size="sm" onClick={() => handleOpenHistoryModal(item)}>ประวัติ</Button>
      </div>
    )},
  ];
  
  const stockTransactionColumns = [
    { header: 'วันที่', accessor: (item: StockTransaction) => new Date(item.date).toLocaleString('th-TH') },
    { header: 'ประเภท', accessor: (item: StockTransaction) => <span className={`font-semibold ${item.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>{STOCK_TRANSACTION_TYPES_TH[item.type]}</span> },
    { header: 'จำนวน', accessor: 'quantity', className: 'text-right' },
    { header: 'เหตุผล', accessor: 'reason' },
    { header: 'โดย', accessor: 'employeeName' },
  ];


  if (isLoading) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <Card 
        title="จัดการสต็อกสินค้า"
        actions={
            <div className="flex space-x-2">
                {user?.role !== UserRole.STAFF && <Button onClick={handleExportInventory} variant="secondary" leftIcon={<ArrowDownTrayIconExport className="h-5 w-5"/>}>ส่งออก CSV</Button>}
                {user?.role !== UserRole.STAFF && <Button onClick={() => handleOpenItemModal()} leftIcon={<PlusIcon className="h-5 w-5"/>}>เพิ่มสินค้า</Button>}
            </div>
        }
      >
         <Table 
            columns={inventoryColumns.map(col => ({
                ...col,
                accessor: typeof col.accessor === 'string' ? col.accessor as keyof InventoryItem : col.accessor as (item: InventoryItem) => React.ReactNode,
                // @ts-ignore
                cell: col.cell 
            }))} 
            data={inventory} 
            isLoading={isLoading} 
            emptyMessage="ไม่พบข้อมูลสินค้าในสต็อก"
        />
      </Card>

      {user?.role !== UserRole.STAFF && isItemModalOpen && (
        <Modal isOpen={isItemModalOpen} onClose={handleCloseItemModal} title={editingItemId ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่'} size="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="ชื่อสินค้า" name="name" value={currentItem.name} onChange={handleItemChange} required />
              <Input label="รหัสสินค้า (SKU)" name="sku" value={currentItem.sku} onChange={handleItemChange} required />
              <Input label="หมวดหมู่" name="category" value={currentItem.category} onChange={handleItemChange} />
              <Input label="ซัพพลายเออร์" name="supplier" value={currentItem.supplier || ''} onChange={handleItemChange} />
              <Input label="จำนวนคงเหลือ" name="quantity" type="number" value={currentItem.quantity} onChange={handleItemChange} min="0" required />
              <Input label="ระดับสต็อกขั้นต่ำ" name="minStockLevel" type="number" value={currentItem.minStockLevel} onChange={handleItemChange} min="0" required />
              <Input label="ราคาต่อหน่วย (บาท)" name="unitPrice" type="number" value={currentItem.unitPrice} onChange={handleItemChange} step="0.01" min="0" required />
          </div>
          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="secondary" onClick={handleCloseItemModal}>ยกเลิก</Button>
            <Button onClick={handleItemSubmit}>{editingItemId ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มสินค้า'}</Button>
          </div>
        </Modal>
      )}

      <Modal isOpen={isStockModalOpen} onClose={handleCloseStockModal} title={`${STOCK_TRANSACTION_TYPES_TH[stockTransaction.type]}: ${stockTransaction.itemName}`} size="md">
        <Input label="สินค้า" value={stockTransaction.itemName} disabled />
        <Input label="จำนวน" name="quantity" type="number" value={stockTransaction.quantity} onChange={handleStockChange} min="1" required />
        <Select 
            label="เหตุผล" 
            name="reason" 
            value={stockTransaction.reason} 
            onChange={handleStockChange} 
            options={STOCK_TRANSACTION_REASONS.map(r => ({value: r, label: r}))} 
            required 
        />
        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="secondary" onClick={handleCloseStockModal}>ยกเลิก</Button>
          <Button onClick={handleStockSubmit}>ยืนยันการ{STOCK_TRANSACTION_TYPES_TH[stockTransaction.type]}</Button>
        </div>
      </Modal>

      {selectedItemForHistory && (
        <Modal isOpen={isHistoryModalOpen} onClose={handleCloseHistoryModal} title={`ประวัติสต็อกสำหรับ ${selectedItemForHistory.name}`} size="xl">
           <Table 
            columns={stockTransactionColumns.map(col => ({
                ...col,
                accessor: typeof col.accessor === 'string' ? col.accessor as keyof StockTransaction : col.accessor as (item: StockTransaction) => React.ReactNode,
            }))} 
            data={getInventoryItemTransactions(selectedItemForHistory.id)} 
            emptyMessage="ไม่พบประวัติการทำธุรกรรมสำหรับสินค้านี้"
           />
           <div className="mt-6 flex justify-end">
             <Button variant="secondary" onClick={handleCloseHistoryModal}>ปิด</Button>
           </div>
        </Modal>
      )}
    </div>
  );
};