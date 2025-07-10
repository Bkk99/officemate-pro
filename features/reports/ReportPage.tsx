import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MONTH_OPTIONS, YEAR_OPTIONS, DEPARTMENTS, LEAVE_TYPES_TH, PO_STATUSES_TH, DOCUMENT_TYPES_TH, CASH_ADVANCE_STATUS_TH, DOCUMENT_STATUSES_TH, EMPLOYEE_STATUSES_TH } from '../../constants';
import { getAllEmployees, getAllInventoryItems, getAllPurchaseOrders, getAllLeaveRequests } from '../../services/api';
import { Employee, PurchaseOrder, LeaveRequest, InventoryItem, LeaveType, POStatusKey, EmployeeStatusKey } from '../../types';

const COLORS = ['#FB6F92', '#ff85a1', '#ff99b9', '#ffb3ce', '#ffcce2', '#6b7280', '#9ca3af', '#d1d5db'];
const PIE_COLORS: { [key: string]: string } = {
    'Pending': '#facc15', // yellow-400
    'Approved': '#3b82f6', // blue-500
    'Processing': '#8b5cf6', // violet-500
    'Shipped': '#a855f7', // purple-500
    'Completed': '#22c55e', // green-500
    'Cancelled': '#ef4444', // red-500
    'Rejected': '#ef4444', // red-500
    'Draft': '#9ca3af', // gray-400
    'Sent': '#60a5fa', // blue-400
    'Paid': '#4ade80', // green-400
    'Overdue': '#f59e0b', // amber-500
    'Active': '#22c55e',
    'Inactive': '#ef4444',
    'On Leave': '#facc15',
    ...Object.keys(LEAVE_TYPES_TH).reduce((acc, key, index) => ({ ...acc, [LEAVE_TYPES_TH[key as LeaveType]]: COLORS[index % COLORS.length] }), {}),
};


export const ReportPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [empData, invData, poData, leaveData] = await Promise.all([
                getAllEmployees(),
                getAllInventoryItems(),
                getAllPurchaseOrders(),
                getAllLeaveRequests(),
            ]);
            setEmployees(empData);
            setInventory(invData);
            setPurchaseOrders(poData);
            setLeaveRequests(leaveData);
        } catch (error) {
            console.error("Failed to fetch report data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const employeeByDeptData = useMemo(() => {
        return DEPARTMENTS.map(dept => ({
            name: dept,
            จำนวน: employees.filter(e => e.department === dept).length,
        })).filter(d => d.จำนวน > 0);
    }, [employees]);

    const employeeByStatusData = useMemo(() => {
        const statuses = Object.keys(EMPLOYEE_STATUSES_TH) as EmployeeStatusKey[];
        return statuses.map(status => ({
            name: EMPLOYEE_STATUSES_TH[status],
            value: employees.filter(e => e.status === status).length,
        })).filter(d => d.value > 0);
    }, [employees]);

    const poByStatusData = useMemo(() => {
        const statuses = Object.keys(PO_STATUSES_TH) as POStatusKey[];
        return statuses.map(status => ({
            name: PO_STATUSES_TH[status],
            value: purchaseOrders.filter(po => po.status === status).length,
        })).filter(d => d.value > 0);
    }, [purchaseOrders]);
    
    const leaveByTypeData = useMemo(() => {
        const types = Object.keys(LEAVE_TYPES_TH) as LeaveType[];
        return types.map(type => ({
            name: LEAVE_TYPES_TH[type],
            value: leaveRequests.filter(lr => lr.leaveType === type).reduce((sum, lr) => sum + (lr.durationInDays || 0), 0)
        })).filter(d => d.value > 0);
    }, [leaveRequests]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
    }

    return (
        <div className="space-y-6">
            <Card title="ภาพรวมรายงาน">
                <p className="text-gray-600">สรุปข้อมูลสำคัญในรูปแบบกราฟและตาราง</p>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="จำนวนพนักงานตามแผนก">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={employeeByDeptData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-25} textAnchor="end" height={50} />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="จำนวน" fill="#FB6F92" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="สถานะพนักงาน">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={employeeByStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {employeeByStatusData.map((entry, index) => (
                                    <Cell key={`cell-emp-status-${index}`} fill={PIE_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card title="สถานะใบสั่งซื้อ (PO)">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={poByStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {poByStatusData.map((entry, index) => (
                                    <Cell key={`cell-po-status-${index}`} fill={PIE_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
                 <Card title="จำนวนวันลาตามประเภท">
                    <ResponsiveContainer width="100%" height={300}>
                         <BarChart data={leaveByTypeData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" allowDecimals={false} />
                            <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }}/>
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" name="จำนวนวัน" fill="#ff99b9" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
};
