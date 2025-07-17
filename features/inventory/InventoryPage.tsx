

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { InventoryItem, StockTransaction, UserRole } from '../../types';
import { addInventoryItem, updateInventoryItem, deleteInventoryItem, addStockTransaction, getInventoryItemTransactions, getInventoryItems, getStockTransactions } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Table, TableColumn } from '../../components/ui/Table';
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
    <path d="M10.75 17.25a.75.75 0 001.5 0V8.636l2.955 3.129a.75.75 0 001.09-1.03l-4.25-4.5a.75.75 0 00-1.09 0l-4.25-4.5a.75.75 0 101.09 1.03l2.955-3.129v8.614z" />
    <path d="M3.5 7.25a.75.75 0 00-1.5 0v-2.5A2.75 2.75 0 014.75 2h10.5A2.75 2.75 0 0118 4.75v2.5a.75.75 0 00-1.5 0v-2.5c0-.69-.56-1.25-1.25-1.25H4.75c-.69 0-1.25-.56-1.25-1.25v2.5z" />
  </svg>
);
const ArrowDownTrayIconExport = (props: React.SVGProps<SVGSVGElement>) => ( // Renamed for clarity
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1.25-7.75A.75.75 0 0010 9.5v2.25H7.75a.75.75 0 000 1.5H10v2.25a.75.75 0 001.5 0V13.5h2.25a.75.75 0 000-1.5H11.5V9.5zM10 2a.75.75 0 01.75.75v3.558c1.95.36 3.635 1.493 4.81 3.207a.75.75 0 01-1.12.99C13.551 8.89 11.853 8 10 8s-3.551.89-4.44 2.515a.75.75 0 01-1.12-.99A6.479 6.479 0 019.25 6.308V2.75A.75.75 0 0110 2z" clipRule="evenodd" />
  </svg>
);


const initialItemState: Omit<InventoryItem, 'id' | 'lastUpdated'> = {
  name: '', sku: '', category: '', quantity: 0, unitPrice: 0, supplier: ''
};

export const InventoryPage: React.FC = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [allTransactions, setAllTransactions] = useState<StockTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<'in' | 'out'>('in');
  const [isLoading, setIsLoading] = useState(true);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [itemHistory, setItemHistory] = useState<StockTransaction[]>([]);

  const [currentItem, setCurrentItem] = useState<Omit<InventoryItem, 'id' | 'lastUpdated'> | InventoryItem>(initialItemState);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  
  const [stockTransaction, setStockTransaction] = useState<{itemId: string; itemName: string; type: 'IN' | 'OUT'; quantity: number; reason: string}>({ itemId: '', itemName: '', type: 'IN', quantity: 1, reason: STOCK_TRANSACTION_REASONS[0] });
  const [selectedItemForHistory, setSelectedItemForHistory] = useState<InventoryItem | null>(null);

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    try {
        const [items, transactions] = await Promise.all([
            getInventoryItems('General'),
            getStockTransactions()
        ]);

        const generalItemIds = new Set(items.map(item => item.id));

        setInventory(items);
        setAllTransactions(transactions.filter(t => generalItemIds.has(t.itemId)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
        console.error("Failed to fetch general inventory data:", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const inventorySummary = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTransactions = allTransactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    });

    const yearlyTransactions = allTransactions.filter(t => new Date(t.date).getFullYear() === currentYear);

    const monthlySummary = {
      totalIn: monthlyTransactions.filter(t => t.type === 'IN').reduce((sum, t) => sum + t.quantity, 0),
      totalOut: monthlyTransactions.filter(t => t.type === 'OUT').reduce((sum, t) => sum + t.quantity, 0),
      transactionCount: monthlyTransactions.length,
    };

    const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    const yearlyChartData = thaiMonths.map((month, index) => {
        const monthTransactions = yearlyTransactions.filter(t => new Date(t.date).getMonth() === index);
        return {
            name: month,
            'รับเข้า': monthTransactions.filter(t => t.type === 'IN').reduce((sum, t) => sum + t.quantity, 0),
            'เบิก/จ่าย': monthTransactions.filter(t => t.type === 'OUT').reduce((sum, t) => sum + t.quantity, 0),
        }
    });

    return { monthlySummary, yearlyChartData };

  }, [allTransactions]);

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
    const numValue = (name === 'quantity' || name === 'unitPrice') ? parseFloat(value) : value;
    setCurrentItem(prev => ({ ...prev, [name]: numValue }));
  };

  const handleItemSubmit = async () => {
    if (user?.role === UserRole.STAFF) return;
    try {
        if (editingItemId) {
            await updateInventoryItem(currentItem as InventoryItem);
        } else {
            await addInventoryItem({
                ...(currentItem as Omit<InventoryItem, 'id' | 'lastUpdated'>),
                lastUpdated: new Date().toISOString()
            });
        }
        await fetchInventory();
        handleCloseItemModal();
    } catch (error) {
        console.error("Failed to save inventory item:", error);
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูลสินค้า");
    }
  };

  const handleItemDelete = async (id: string) => {
    if (user?.role === UserRole.STAFF) return; // Staff cannot delete item
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้? (การดำเนินการนี้จะไม่ส่งผลต่อประวัติการทำธุรกรรม)')) {
      await deleteInventoryItem(id);
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
    try {
        await addStockTransaction({
            ...stockTransaction,
            date: new Date().toISOString(),
            employeeId: user.id,
            employeeName: user.name,
        });
        await fetchInventory(); 
        handleCloseStockModal();
    } catch (error) {
        console.error("Failed to add stock transaction:", error);
        alert("เกิดข้อผิดพลาดในการบันทึกธุรกรรม");
    }
  };

  const handleOpenHistoryModal = async (item: InventoryItem) => {
    setSelectedItemForHistory(item);
    setIsHistoryModalOpen(true);
    try {
        const history = await getInventoryItemTransactions(item.id);
        setItemHistory(history);
    } catch (error) {
        console.error(`Failed to get history for item ${item.id}`, error);
        setItemHistory([]);
    }
  };
  const handleCloseHistoryModal = () => {
    setSelectedItemForHistory(null);
    setIsHistoryModalOpen(false);
    setItemHistory([]);
  };

  const handleExportInventory = () => {
    if (user?.role === UserRole.STAFF) return; // Staff cannot export CSV
    
    const headerMapping = {
        sku: 'รหัสสินค้า (SKU)',
        name: 'ชื่อสินค้า',
        category: 'หมวดหมู่',
        quantity: 'จำนวนคงเหลือ',
        unitPrice: 'ราคาต่อหน่วย',
        supplier: 'ซัพพลายเออร์',
        lastUpdated: 'อัปเดตล่าสุด',
    };

    const dataToExport = inventory.map(item => ({
        sku: item.sku,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        supplier: item.supplier || '',
        lastUpdated: new Date(item.lastUpdated).toLocaleString('th-TH'),
    }));
    exportToCsv('general_inventory_data', dataToExport, headerMapping);
  };
  
  const handleExportTransactions = () => {
    const dataToExport = allTransactions
      .filter(t => (activeTab === 'in' ? t.type === 'IN' : t.type === 'OUT'))
      .map(t => ({
        date: new Date(t.date).toLocaleString('th-TH'),
        itemName: t.itemName,
        type: STOCK_TRANSACTION_TYPES_TH[t.type],
        quantity: t.quantity,
        reason: t.reason,
        employeeName: t.employeeName || '',
      }));
    
    if (dataToExport.length === 0) {
        alert("ไม่มีข้อมูลสำหรับส่งออกในแท็บนี้");
        return;
    }

    const headerMapping = {
        date: 'วันที่',
        itemName: 'ชื่อสินค้า',
        type: 'ประเภท',
        quantity: 'จำนวน',
        reason: 'เหตุผล',
        employeeName: 'ดำเนินการโดย',
    };

    const filename = `general_stock_transactions_${activeTab}_${new Date().toISOString().split('T')[0]}`;
    exportToCsv(filename, dataToExport, headerMapping);
  };


  const inventoryColumns: TableColumn<InventoryItem>[] = [
    { header: 'รหัสสินค้า (SKU)', accessor: 'sku' },
    { header: 'ชื่อสินค้า', accessor: 'name' },
    { header: 'หมวดหมู่', accessor: 'category' },
    { header: 'จำนวน', accessor: 'quantity', className: 'text-right' },
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
  
  const stockTransactionColumns: TableColumn<StockTransaction>[] = [
    { header: 'วันที่', accessor: (item: StockTransaction) => new Date(item.date).toLocaleString('th-TH') },
    { header: 'ประเภท', accessor: (item: StockTransaction) => <span className={`font-semibold ${item.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>{STOCK_TRANSACTION_TYPES_TH[item.type]}</span> },
    { header: 'จำนวน', accessor: 'quantity', className: 'text-right' },
    { header: 'เหตุผล', accessor: 'reason' },
    { header: 'โดย', accessor: 'employeeName' },
  ];
  
  const globalStockTransactionColumns: TableColumn<StockTransaction>[] = [
    { header: 'วันที่', accessor: (item: StockTransaction) => new Date(item.date).toLocaleString('th-TH') },
    { header: 'ชื่อสินค้า', accessor: 'itemName' },
    { header: 'ประเภท', accessor: (item: StockTransaction) => <span className={`font-semibold ${item.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>{STOCK_TRANSACTION_TYPES_TH[item.type]}</span> },
    { header: 'จำนวน', accessor: 'quantity', className: 'text-right' },
    { header: 'เหตุผล', accessor: 'reason' },
    { header: 'โดย', accessor: 'employeeName' },
  ];


  if (isLoading) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
       <Card title="สรุปภาพรวมสต็อกทั่วไป">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">สรุปประจำเดือนนี้</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                      <div className="p-4 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-700">รับเข้ารวม</p>
                          <p className="text-2xl font-bold text-green-800">{inventorySummary.monthlySummary.totalIn.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg">
                          <p className="text-sm text-red-700">เบิก/จ่ายรวม</p>
                          <p className="text-2xl font-bold text-red-800">{inventorySummary.monthlySummary.totalOut.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-700">จำนวนธุรกรรม</p>
                          <p className="text-2xl font-bold text-blue-800">{inventorySummary.monthlySummary.transactionCount.toLocaleString()}</p>
                      </div>
                  </div>
              </div>
              <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">ภาพรวมรายเดือน (ปีปัจจุบัน)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={inventorySummary.yearlyChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(value: number) => value.toLocaleString()}/>
                          <Legend wrapperStyle={{fontSize: "14px"}} />
                          <Bar dataKey="รับเข้า" fill="#10B981" />
                          <Bar dataKey="เบิก/จ่าย" fill="#EF4444" />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </Card>
      
      <Card 
        title="จัดการสต็อกทั่วไป"
        actions={
            <div className="flex space-x-2">
                {user?.role !== UserRole.STAFF && <Button onClick={handleExportInventory} variant="secondary" leftIcon={<ArrowDownTrayIconExport className="h-5 w-5"/>}>ส่งออก CSV</Button>}
                {user?.role !== UserRole.STAFF && <Button onClick={() => handleOpenItemModal()} leftIcon={<PlusIcon className="h-5 w-5"/>}>เพิ่มสินค้า</Button>}
            </div>
        }
      >
         <Table 
            columns={inventoryColumns} 
            data={inventory} 
            isLoading={isLoading} 
            emptyMessage="ไม่พบข้อมูลสินค้าในสต็อกทั่วไป"
        />
      </Card>

      <Card 
        title="ประวัติธุรกรรมสต็อกทั่วไปล่าสุด"
        actions={
            <Button onClick={handleExportTransactions} variant="secondary" leftIcon={<ArrowDownTrayIconExport className="h-5 w-5"/>}>
                ส่งออก CSV ({activeTab === 'in' ? 'รายการรับเข้า' : 'รายการเบิก/จ่าย'})
            </Button>
        }
      >
        <div className="border-b border-gray-200 mb-4">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                    onClick={() => setActiveTab('in')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'in'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                รายการรับเข้าทั้งหมด
                </button>
                <button
                    onClick={() => setActiveTab('out')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'out'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                รายการเบิก/จ่ายออกทั้งหมด
                </button>
            </nav>
        </div>
        
        <Table 
            columns={globalStockTransactionColumns} 
            data={allTransactions.filter(t => activeTab === 'in' ? t.type === 'IN' : t.type === 'OUT')} 
            isLoading={isLoading}
            emptyMessage={activeTab === 'in' ? "ไม่พบประวัติการรับเข้า" : "ไม่พบประวัติการเบิก/จ่ายออก"}
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
            columns={stockTransactionColumns} 
            data={itemHistory} 
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
