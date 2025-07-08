
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MONTH_OPTIONS, YEAR_OPTIONS, DEPARTMENTS, LEAVE_TYPES_TH, PO_STATUSES_TH, DOCUMENT_TYPES_TH, CASH_ADVANCE_STATUS_TH, DOCUMENT_STATUSES_TH, EMPLOYEE_STATUSES_TH } from '../../constants';
import { MOCK_EMPLOYEES, MOCK_STOCK_TRANSACTIONS, MOCK_PURCHASE_ORDERS, MOCK_DOCUMENTS, MOCK_LEAVE_REQUESTS, MOCK_CASH_ADVANCE_REQUESTS, MOCK_INVENTORY_ITEMS } from '../../services/mockData';
import { Employee, StockTransaction, PurchaseOrder, Document, LeaveRequest, CashAdvanceRequest, InventoryItem, LeaveType, DocumentType, CashAdvanceRequestStatus, POStatusKey, EmployeeStatusKey, DocumentStatusKey } from '../../types';


const COLORS = ['#FB6F92', '#ff85a1', '#ff99b9', '#ffb3ce', '#ffcce2', '#6b7280', '#9ca3af', '#d1d5db'];
const PIE_COLORS = {
    'Pending': '#facc15', // yellow-400
    'Approved': '#3b82f6', // blue-500
    'Processing': '#8b5cf6', // violet-500
    'Shipped': '#a855f7', // purple-500,
    'Completed': '#22c55e', // green-500,
    'Paid': '#22c55e', // green-500,
    'Draft': '#9ca3af', // gray-400
    'Sent': '#60a5fa', // blue-400
    'Overdue': '#f97316', // orange-500
    'Rejected': '#ef4444', // red-500
    'Cancelled': '#6b7280', // gray-500
    'Active': '#22c55e',
    'Inactive': '#ef4444',
    'On Leave': '#facc15'
};


// Individual Report Components
const EmployeeReportComponent = ({ data }: { data: any }) => (
    <Card title="รายงานสรุปพนักงาน">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h4 className="font-semibold text-gray-700">จำนวนพนักงานตามแผนก</h4>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data.byDepartment} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" allowDecimals={false} />
                        <YAxis type="category" dataKey="name" width={80} tick={{fontSize: 10}}/>
                        <Tooltip />
                        <Bar dataKey="count" name="จำนวน" fill={COLORS[0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div>
                <h4 className="font-semibold text-gray-700">สัดส่วนพนักงานตามสถานะ</h4>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie data={data.byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                             {data.byStatus.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name as keyof typeof PIE_COLORS] || COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(value, name) => [value, EMPLOYEE_STATUSES_TH[name as EmployeeStatusKey]]} />
                        <Legend formatter={(value) => EMPLOYEE_STATUSES_TH[value as EmployeeStatusKey]} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    </Card>
);

const InventoryReportComponent = ({ data, title }: { data: any, title: string }) => (
    <Card title={title}>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-center">
            <div className="p-2 bg-green-50 rounded-lg"><p className="text-sm text-green-700">มูลค่ารับเข้า</p><p className="font-bold text-green-800">฿{data.valueIn.toLocaleString()}</p></div>
            <div className="p-2 bg-red-50 rounded-lg"><p className="text-sm text-red-700">มูลค่าเบิกออก</p><p className="font-bold text-red-800">฿{data.valueOut.toLocaleString()}</p></div>
            <div className="p-2 bg-green-50 rounded-lg"><p className="text-sm text-green-700">จำนวนรับเข้า</p><p className="font-bold text-green-800">{data.quantityIn.toLocaleString()} ชิ้น</p></div>
            <div className="p-2 bg-red-50 rounded-lg"><p className="text-sm text-red-700">จำนวนเบิกออก</p><p className="font-bold text-red-800">{data.quantityOut.toLocaleString()} ชิ้น</p></div>
        </div>
        <h4 className="font-semibold text-gray-700 mt-6">5 อันดับสินค้าเคลื่อนไหวสูงสุด (จำนวนชิ้น)</h4>
        <ResponsiveContainer width="100%" height={250}>
             <BarChart data={data.topMovers} margin={{ top: 5, right: 20, left: 0, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} tick={{fontSize: 10}} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="in" name="รับเข้า" stackId="a" fill="#10B981" />
                <Bar dataKey="out" name="เบิกออก" stackId="a" fill="#EF4444" />
            </BarChart>
        </ResponsiveContainer>
    </Card>
);

const PurchaseOrderReportComponent = ({ data }: { data: any }) => (
    <Card title="รายงานใบสั่งซื้อ (PO)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <h4 className="font-semibold text-gray-700">สรุปข้อมูล PO</h4>
                <div className="space-y-2 mt-2 text-sm">
                    <p className="flex justify-between"><span>จำนวน PO ทั้งหมด:</span> <span className="font-semibold">{data.totalPOs.toLocaleString()}</span></p>
                    <p className="flex justify-between"><span>มูลค่ารวม:</span> <span className="font-semibold">฿{data.totalValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></p>
                    <p className="flex justify-between"><span>มูลค่าเฉลี่ยต่อ PO:</span> <span className="font-semibold">฿{data.averageValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></p>
                </div>
            </div>
             <div>
                <h4 className="font-semibold text-gray-700">สัดส่วน PO ตามสถานะ</h4>
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie data={data.byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} label>
                            {data.byStatus.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name as keyof typeof PIE_COLORS] || COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(value, name) => [value, PO_STATUSES_TH[name as POStatusKey]]}/>
                        <Legend formatter={(value) => PO_STATUSES_TH[value as POStatusKey]} iconSize={10} wrapperStyle={{fontSize: '12px'}}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    </Card>
);

const DocumentReportComponent = ({ data }: { data: any }) => (
    <Card title="รายงานเอกสาร">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h4 className="font-semibold text-gray-700">จำนวนเอกสารตามประเภท</h4>
                 <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.byType} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{fontSize: 12}} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" name="จำนวน" fill={COLORS[1]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div>
                <h4 className="font-semibold text-gray-700">มูลค่าใบแจ้งหนี้ตามสถานะ</h4>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.invoiceValueByStatus} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tickFormatter={(value) => DOCUMENT_STATUSES_TH[value as DocumentStatusKey]} tick={{fontSize: 12}} />
                        <YAxis tickFormatter={(val) => `฿${(val/1000)}k`} />
                        <Tooltip formatter={(value, name) => [`฿${Number(value).toLocaleString()}`, DOCUMENT_STATUSES_TH[name as DocumentStatusKey]]} />
                        <Bar dataKey="value" name="มูลค่า">
                            {data.invoiceValueByStatus.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name as keyof typeof PIE_COLORS] || COLORS[index % COLORS.length]} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </Card>
);

const LeaveReportComponent = ({ data }: { data: any }) => (
    <Card title="รายงานการลา">
        <p className="mb-4 text-sm">รวมทั้งหมด <span className="font-bold">{data.totalDays.toLocaleString()}</span> วันลา จาก <span className="font-bold">{data.totalRequests.toLocaleString()}</span> คำขอ</p>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h4 className="font-semibold text-gray-700">จำนวนวันลาตามประเภท</h4>
                <ResponsiveContainer width="100%" height={200}>
                     <BarChart data={data.byType} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tickFormatter={(val) => LEAVE_TYPES_TH[val as LeaveType]} tick={{fontSize: 10}}/>
                        <YAxis allowDecimals={false}/>
                        <Tooltip formatter={(value, name) => [value, LEAVE_TYPES_TH[name as LeaveType]]}/>
                        <Bar dataKey="days" name="จำนวนวัน" fill={COLORS[2]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
             <div>
                <h4 className="font-semibold text-gray-700">จำนวนวันลาตามแผนก</h4>
                 <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.byDepartment} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{fontSize: 10}} />
                        <YAxis allowDecimals={false}/>
                        <Tooltip />
                        <Bar dataKey="days" name="จำนวนวัน" fill={COLORS[3]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </Card>
);

const CashAdvanceReportComponent = ({ data }: { data: any }) => (
    <Card title="รายงานการเบิกเงินล่วงหน้า">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <h4 className="font-semibold text-gray-700">สรุปข้อมูลการเบิกเงิน</h4>
                <div className="space-y-2 mt-2 text-sm">
                    <p className="flex justify-between"><span>จำนวนคำขอทั้งหมด:</span> <span className="font-semibold">{data.totalRequests.toLocaleString()}</span></p>
                    <p className="flex justify-between"><span>ยอดขอเบิกรวม:</span> <span className="font-semibold">฿{data.totalAmountRequested.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></p>
                    <p className="flex justify-between"><span>ยอดอนุมัติรวม:</span> <span className="font-semibold">฿{data.totalAmountApproved.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></p>
                </div>
            </div>
             <div>
                <h4 className="font-semibold text-gray-700">สัดส่วนตามสถานะ</h4>
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie data={data.byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                            {data.byStatus.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name as keyof typeof PIE_COLORS] || COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(value, name) => [value, CASH_ADVANCE_STATUS_TH[name as CashAdvanceRequestStatus]]}/>
                        <Legend formatter={(value) => CASH_ADVANCE_STATUS_TH[value as CashAdvanceRequestStatus]} iconSize={10} wrapperStyle={{fontSize: '12px'}}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    </Card>
);


export const ReportPage: React.FC = () => {
    const [reportType, setReportType] = useState('monthly');
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [isLoading, setIsLoading] = useState(true);
    const [reportData, setReportData] = useState<any>(null);

    const generateAllReports = useCallback(async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        const isAnnual = reportType === 'annual';
        const startDate = isAnnual ? new Date(year, 0, 1) : new Date(year, month - 1, 1);
        const endDate = isAnnual ? new Date(year, 11, 31, 23, 59, 59) : new Date(year, month, 0, 23, 59, 59);

        // --- Data Filtering ---
        const stockTransactions = MOCK_STOCK_TRANSACTIONS.filter(t => new Date(t.date) >= startDate && new Date(t.date) <= endDate);
        const purchaseOrders = MOCK_PURCHASE_ORDERS.filter(t => new Date(t.orderDate) >= startDate && new Date(t.orderDate) <= endDate);
        const documents = MOCK_DOCUMENTS.filter(t => new Date(t.date) >= startDate && new Date(t.date) <= endDate);
        const leaveRequests = MOCK_LEAVE_REQUESTS.filter(t => new Date(t.startDate) >= startDate && new Date(t.startDate) <= endDate);
        const cashAdvanceRequests = MOCK_CASH_ADVANCE_REQUESTS.filter(t => new Date(t.requestDate) >= startDate && new Date(t.requestDate) <= endDate);

        // --- Report Generation ---
        const employeeReport = {
            byDepartment: DEPARTMENTS.map(dep => ({ name: dep, count: MOCK_EMPLOYEES.filter(e => e.department === dep).length })).filter(d => d.count > 0),
            byStatus: (Object.keys(EMPLOYEE_STATUSES_TH) as EmployeeStatusKey[]).map(status => ({ name: status, value: MOCK_EMPLOYEES.filter(e => e.status === status).length })).filter(s => s.value > 0),
        };

        const generateInventorySubReport = (category?: 'อุปกรณ์ IT' | 'ทั่วไป') => {
            const relevantItems = category === 'ทั่วไป' ? MOCK_INVENTORY_ITEMS.filter(i => i.category !== 'อุปกรณ์ IT') :
                                category === 'อุปกรณ์ IT' ? MOCK_INVENTORY_ITEMS.filter(i => i.category === 'อุปกรณ์ IT') :
                                MOCK_INVENTORY_ITEMS;
            const relevantItemIds = new Set(relevantItems.map(i => i.id));
            const relevantTransactions = stockTransactions.filter(t => relevantItemIds.has(t.itemId));
            
            const moverCounts: { [key: string]: { name: string; in: number; out: number } } = {};
            relevantTransactions.forEach(t => {
                if (!moverCounts[t.itemId]) moverCounts[t.itemId] = { name: t.itemName, in: 0, out: 0 };
                if (t.type === 'IN') moverCounts[t.itemId].in += t.quantity;
                else moverCounts[t.itemId].out += t.quantity;
            });

            return {
                valueIn: relevantTransactions.filter(t => t.type === 'IN').reduce((sum, t) => sum + (t.quantity * (MOCK_INVENTORY_ITEMS.find(i=>i.id===t.itemId)?.unitPrice || 0)), 0),
                valueOut: relevantTransactions.filter(t => t.type === 'OUT').reduce((sum, t) => sum + (t.quantity * (MOCK_INVENTORY_ITEMS.find(i=>i.id===t.itemId)?.unitPrice || 0)), 0),
                quantityIn: relevantTransactions.filter(t => t.type === 'IN').reduce((sum, t) => sum + t.quantity, 0),
                quantityOut: relevantTransactions.filter(t => t.type === 'OUT').reduce((sum, t) => sum + t.quantity, 0),
                topMovers: Object.values(moverCounts).sort((a, b) => (b.in + b.out) - (a.in + a.out)).slice(0, 5),
            };
        };

        const poReport = {
            totalPOs: purchaseOrders.length,
            totalValue: purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0),
            averageValue: purchaseOrders.length > 0 ? purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0) / purchaseOrders.length : 0,
            byStatus: (Object.keys(PO_STATUSES_TH) as POStatusKey[]).map(status => ({name: status, value: purchaseOrders.filter(po => po.status === status).length})).filter(s => s.value > 0),
        };
        
        const documentReport = {
            byType: (Object.keys(DOCUMENT_TYPES_TH) as DocumentType[]).map(type => ({name: DOCUMENT_TYPES_TH[type], count: documents.filter(d => d.type === type).length})),
            invoiceValueByStatus: (Object.keys(DOCUMENT_STATUSES_TH) as DocumentStatusKey[]).map(status => ({name: status, value: documents.filter(d => d.type === 'Invoice' && d.status === status).reduce((sum, d) => sum + (d.amount || 0), 0)})).filter(s => s.value > 0),
        };

        const leaveReport = {
            totalRequests: leaveRequests.length,
            totalDays: leaveRequests.reduce((sum, r) => sum + (r.durationInDays || 0), 0),
            byType: (Object.keys(LEAVE_TYPES_TH) as LeaveType[]).map(type => ({ name: type, days: leaveRequests.filter(r => r.leaveType === type).reduce((sum, r) => sum + (r.durationInDays || 0), 0)})).filter(t => t.days > 0),
            byDepartment: DEPARTMENTS.map(dep => ({ name: dep, days: leaveRequests.filter(r => MOCK_EMPLOYEES.find(e=>e.id===r.employeeId)?.department === dep).reduce((sum, r) => sum + (r.durationInDays || 0), 0) })).filter(d => d.days > 0),
        };

        const cashAdvanceReport = {
            totalRequests: cashAdvanceRequests.length,
            totalAmountRequested: cashAdvanceRequests.reduce((sum, r) => sum + r.amount, 0),
            totalAmountApproved: cashAdvanceRequests.filter(r => r.status === 'Approved' || r.status === 'Paid').reduce((sum, r) => sum + r.amount, 0),
            byStatus: (Object.keys(CASH_ADVANCE_STATUS_TH) as CashAdvanceRequestStatus[]).map(status => ({name: status, value: cashAdvanceRequests.filter(r => r.status === status).length})).filter(s => s.value > 0),
        };

        setReportData({
            employeeReport,
            generalInventoryReport: generateInventorySubReport('ทั่วไป'),
            itInventoryReport: generateInventorySubReport('อุปกรณ์ IT'),
            poReport,
            documentReport,
            leaveReport,
            cashAdvanceReport
        });
        setIsLoading(false);
    }, [reportType, year, month]);

    useEffect(() => {
        generateAllReports();
    }, [generateAllReports]);

    const periodLabel = reportType === 'annual' 
        ? `สรุปประจำปี พ.ศ. ${year + 543}`
        : `สรุปประจำเดือน ${MONTH_OPTIONS.find(m => m.value === month)?.label} ${year + 543}`;

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-wrap items-end gap-4">
                    <Select
                        label="ประเภทรายงาน"
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        options={[{value: 'monthly', label: 'สรุปประจำเดือน'}, {value: 'annual', label: 'สรุปประจำปี'}]}
                        wrapperClassName="!mb-0"
                    />
                     <Select
                        label="ปี (พ.ศ.)"
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        options={YEAR_OPTIONS}
                        wrapperClassName="!mb-0"
                    />
                    {reportType === 'monthly' && (
                        <Select
                            label="เดือน"
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            options={MONTH_OPTIONS}
                            wrapperClassName="!mb-0"
                        />
                    )}
                </div>
            </Card>

            <h2 className="text-xl font-semibold text-gray-700">{periodLabel}</h2>

            {isLoading ? (
                <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
            ) : !reportData ? (
                 <p>ไม่สามารถสร้างรายงานได้</p>
            ) : (
                <div className="space-y-6">
                    <EmployeeReportComponent data={reportData.employeeReport} />
                    <InventoryReportComponent data={reportData.generalInventoryReport} title="รายงานสต็อกสินค้าทั่วไป" />
                    <InventoryReportComponent data={reportData.itInventoryReport} title="รายงานสต็อกอุปกรณ์ IT" />
                    <PurchaseOrderReportComponent data={reportData.poReport} />
                    <DocumentReportComponent data={reportData.documentReport} />
                    <LeaveReportComponent data={reportData.leaveReport} />
                    <CashAdvanceReportComponent data={reportData.cashAdvanceReport} />
                </div>
            )}
        </div>
    );
};