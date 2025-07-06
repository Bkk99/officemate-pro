
import React, { useState, useEffect, useCallback } from 'react';
import { PurchaseOrder, InventoryItem, UserRole } from '../../types';
import { MOCK_PURCHASE_ORDERS, MOCK_INVENTORY_ITEMS, addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder } from '../../services/mockData';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Table } from '../../components/ui/Table';
import { PO_STATUSES_OPTIONS, PO_STATUSES_TH } from '../../constants';
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
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1.25-7.75A.75.75 0 0010 9.5v2.25H7.75a.75.75 0 000 1.5H10v2.25a.75.75 0 001.5 0V13.5h2.25a.75.75 0 000-1.5H11.5V9.5zM10 2a.75.75 0 01.75.75v3.558c1.95.36 3.635 1.493 4.81 3.207a.75.75 0 01-1.12.99C13.551 8.89 11.853 8 10 8s-3.551.89-4.44 2.515a.75.75 0 01-1.12-.99A6.479 6.479 0 019.25 6.308V2.75A.75.75 0 0110 2z" clipRule="evenodd" />
  </svg>
);


type POItemForm = { itemId: string; itemName: string; quantity: number; unitPrice: number; };

const initialPOState: Omit<PurchaseOrder, 'id' | 'totalAmount' | 'poNumber'> = {
  supplier: '', items: [], status: 'Pending', orderDate: new Date().toISOString().split('T')[0],
};

export const PurchaseOrderPage: React.FC = () => {
  const { user } = useAuth();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPO, setCurrentPO] = useState<Omit<PurchaseOrder, 'id' | 'totalAmount' | 'poNumber'> | PurchaseOrder>(initialPOState);
  const [editingPOId, setEditingPOId] = useState<string | null>(null);

  const fetchPOs = useCallback(async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    setPurchaseOrders(MOCK_PURCHASE_ORDERS);
    setInventoryItems(MOCK_INVENTORY_ITEMS); 
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchPOs();
  }, [fetchPOs]);

  const calculateTotalAmount = (items: POItemForm[]): number => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };
  
  const handleOpenModal = (po?: PurchaseOrder) => {
    if (po) {
      setCurrentPO({...po, items: po.items.map(i => ({itemId: i.itemId, itemName: i.itemName, quantity: i.quantity, unitPrice: i.unitPrice}))});
      setEditingPOId(po.id);
    } else {
      setCurrentPO({...initialPOState, items: [], orderDate: new Date().toISOString().split('T')[0]});
      setEditingPOId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentPO(initialPOState);
    setEditingPOId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentPO(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, field: 'itemId' | 'quantity' | 'unitPrice', value: string | number) => {
    const updatedItems = [...currentPO.items]; 
    const currentItem = updatedItems[index];

    if (field === 'itemId') {
      const selectedItem = inventoryItems.find(invItem => invItem.id === String(value));
      currentItem.itemId = String(value);
      currentItem.itemName = selectedItem ? selectedItem.name : 'สินค้าไม่ทราบชื่อ';
      currentItem.unitPrice = selectedItem ? selectedItem.unitPrice : 0;
    } else if (field === 'quantity') {
      currentItem.quantity = Number(value);
    } else if (field === 'unitPrice') {
      currentItem.unitPrice = Number(value);
    }
    setCurrentPO(prev => ({ ...prev, items: updatedItems }));
  };

  const addItemToPO = () => {
    const defaultItem = inventoryItems.length > 0 ? inventoryItems[0] : null;
    const newItem: POItemForm = { 
        itemId: defaultItem ? defaultItem.id : '', 
        itemName: defaultItem ? defaultItem.name : 'สินค้าไม่ทราบชื่อ',
        quantity: 1, 
        unitPrice: defaultItem ? defaultItem.unitPrice : 0 
    };
    setCurrentPO(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItemFromPO = (index: number) => {
    setCurrentPO(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async () => {
    const poDataToSubmit = {
      ...currentPO,
      items: currentPO.items, 
      totalAmount: calculateTotalAmount(currentPO.items),
    };

    if (editingPOId) {
      updatePurchaseOrder({ ...poDataToSubmit, id: editingPOId, poNumber: (currentPO as PurchaseOrder).poNumber } as PurchaseOrder);
    } else {
      addPurchaseOrder(poDataToSubmit as Omit<PurchaseOrder, 'id' | 'poNumber'>);
    }
    await fetchPOs();
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบใบสั่งซื้อนี้?')) {
      deletePurchaseOrder(id);
      await fetchPOs();
    }
  };

  const handleExportPOs = () => {
    const dataToExport = purchaseOrders.flatMap(po => 
        po.items.map(item => ({
            'เลขที่ PO': po.poNumber,
            'ซัพพลายเออร์': po.supplier,
            'วันที่สั่งซื้อ': new Date(po.orderDate).toLocaleDateString('th-TH'),
            'วันที่คาดว่าจะได้รับ': po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString('th-TH') : '',
            'รหัสสินค้า': item.itemId,
            'ชื่อสินค้า': item.itemName,
            'จำนวน': item.quantity,
            'ราคาต่อหน่วย': item.unitPrice,
            'ยอดรวมรายการ': item.quantity * item.unitPrice,
            'ยอดรวม PO': po.totalAmount,
            'สถานะ': PO_STATUSES_TH[po.status as keyof typeof PO_STATUSES_TH] || po.status,
            'หมายเหตุ': po.notes || '',
        }))
    );
    exportToCsv('purchase_orders_data', dataToExport);
  };

  const poColumns = [
    { header: 'เลขที่ PO', accessor: 'poNumber' },
    { header: 'ซัพพลายเออร์', accessor: 'supplier' },
    { header: 'วันที่สั่งซื้อ', accessor: (item: PurchaseOrder) => new Date(item.orderDate).toLocaleDateString('th-TH') },
    { header: 'ยอดรวม (บาท)', accessor: (item: PurchaseOrder) => `฿${item.totalAmount.toFixed(2)}`, className: 'text-right' },
    { header: 'สถานะ', accessor: (item: PurchaseOrder) => <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ PO_STATUSES_COLORS[item.status] || 'bg-gray-100 text-gray-800' }`}>{PO_STATUSES_TH[item.status as keyof typeof PO_STATUSES_TH] || item.status}</span> },
    { header: 'การดำเนินการ', accessor: (item: PurchaseOrder) => (
      <div className="space-x-2">
        <Button variant="ghost" size="sm" onClick={() => handleOpenModal(item)} title="แก้ไข PO"><PencilIcon className="h-4 w-4"/></Button>
        {user?.role === UserRole.ADMIN && (
            <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} title="ลบ PO"><TrashIcon className="h-4 w-4 text-red-500"/></Button>
        )}
      </div>
    )},
  ];
  
  const PO_STATUSES_COLORS: Record<PurchaseOrder['status'], string> = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Approved: 'bg-blue-100 text-blue-800',
    Processing: 'bg-indigo-100 text-indigo-800',
    Shipped: 'bg-purple-100 text-purple-800',
    Completed: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800',
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <Card 
        title="ใบสั่งซื้อ (Purchase Orders)"
        actions={
            <div className="flex space-x-2">
                <Button onClick={handleExportPOs} variant="secondary" leftIcon={<ArrowDownTrayIcon className="h-5 w-5"/>}>ส่งออก CSV</Button>
                <Button onClick={() => handleOpenModal()} leftIcon={<PlusIcon className="h-5 w-5"/>}>สร้าง PO</Button>
            </div>
        }
      >
        <Table 
            columns={poColumns.map(col => ({
                ...col,
                accessor: typeof col.accessor === 'string' ? col.accessor as keyof PurchaseOrder : col.accessor as (item: PurchaseOrder) => React.ReactNode,
            }))} 
            data={purchaseOrders} 
            isLoading={isLoading}
            emptyMessage="ไม่พบข้อมูลใบสั่งซื้อ"
        />
      </Card>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingPOId ? `แก้ไข PO #${(currentPO as PurchaseOrder).poNumber}` : 'สร้างใบสั่งซื้อใหม่'} size="xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <Input label="ชื่อซัพพลายเออร์" name="supplier" value={currentPO.supplier} onChange={handleChange} required />
            <Input label="วันที่สั่งซื้อ" name="orderDate" type="date" value={currentPO.orderDate.split('T')[0]} onChange={handleChange} required />
            <Input label="วันที่คาดว่าจะได้รับ (ถ้ามี)" name="expectedDeliveryDate" type="date" value={currentPO.expectedDeliveryDate?.split('T')[0] || ''} onChange={handleChange} />
            <Select label="สถานะ" name="status" value={currentPO.status} onChange={handleChange} options={PO_STATUSES_OPTIONS} required />
        </div>

        <h4 className="text-md font-semibold mt-6 mb-2">รายการสินค้า</h4>
        {currentPO.items.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 mb-2 p-3 border rounded-md items-center">
            <div className="col-span-5">
              <Select 
                label={`สินค้า ${index+1}`} 
                value={item.itemId} 
                onChange={(e) => handleItemChange(index, 'itemId', e.target.value)} 
                options={inventoryItems.map(invItem => ({value: invItem.id, label: `${invItem.name} (SKU: ${invItem.sku})`}))} 
                placeholder="เลือกสินค้า"
                wrapperClassName="mb-0"
              />
            </div>
            <div className="col-span-2">
                 <Input label="จำนวน" type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))} min="1" wrapperClassName="mb-0"/>
            </div>
            <div className="col-span-2">
                <Input label="ราคาต่อหน่วย (บาท)" type="number" value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))} step="0.01" min="0" wrapperClassName="mb-0"/>
            </div>
            <div className="col-span-2">
                 <Input label="ยอดรวมย่อย (บาท)" type="text" value={`฿${(item.quantity * item.unitPrice).toFixed(2)}`} disabled wrapperClassName="mb-0"/>
            </div>
            <div className="col-span-1 flex items-end pb-1">
              <Button variant="danger" size="sm" onClick={() => removeItemFromPO(index)} className="mt-auto" title="ลบรายการสินค้านี้"><TrashIcon className="h-4 w-4"/></Button>
            </div>
          </div>
        ))}
        <Button variant="secondary" size="sm" onClick={addItemToPO} leftIcon={<PlusIcon className="h-4 w-4"/>} className="my-2">เพิ่มรายการสินค้า</Button>
        
        <div className="text-right font-semibold text-lg mt-4">
            ยอดรวมทั้งหมด: ฿{calculateTotalAmount(currentPO.items).toFixed(2)}
        </div>

        <Textarea label="หมายเหตุ (ถ้ามี)" name="notes" value={currentPO.notes || ''} onChange={handleChange} className="mt-4"/>

        <div className="mt-8 flex justify-end space-x-2">
          <Button variant="secondary" onClick={handleCloseModal}>ยกเลิก</Button>
          <Button onClick={handleSubmit}>{editingPOId ? 'บันทึกการเปลี่ยนแปลง' : 'สร้าง PO'}</Button>
        </div>
      </Modal>
    </div>
  );
};
