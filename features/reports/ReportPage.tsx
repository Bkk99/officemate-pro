
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MOCK_INVENTORY_ITEMS, MOCK_TIME_LOGS, MOCK_PURCHASE_ORDERS } from '../../services/mockData';
import { InventoryItem, TimeLog, PurchaseOrder } from '../../types';
import { Spinner } from '../../components/ui/Spinner';

const generateInventoryReportData = (items: InventoryItem[]) => {
  return items.slice(0, 10).map(item => ({
    name: item.name,
    quantity: item.quantity,
    value: item.quantity * item.unitPrice,
  })).sort((a,b) => b.quantity - a.quantity);
};

const generateWorkTimeReportData = (logs: TimeLog[]) => {
  const employeeHours: {[key: string]: number} = {};
  logs.forEach(log => {
    if (log.clockOut) {
      const durationMs = new Date(log.clockOut).getTime() - new Date(log.clockIn).getTime();
      const hours = durationMs / (1000 * 60 * 60);
      employeeHours[log.employeeName] = (employeeHours[log.employeeName] || 0) + hours;
    }
  });
  return Object.entries(employeeHours)
    .map(([name, hours]) => ({ name, hours: parseFloat(hours.toFixed(1)) }))
    .sort((a,b) => b.hours - a.hours)
    .slice(0,10); 
};

const generateSalesExpenseData = (orders: PurchaseOrder[]) => {
    const monthlyData: {[month: string]: { sales: number, expenses: number }} = {};
    // Using Thai month abbreviations
    const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

    orders.forEach(order => {
        const date = new Date(order.orderDate);
        const monthKey = `${months[date.getMonth()]} ${date.getFullYear() + 543}`; // Buddhist Era year
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { sales: 0, expenses: 0 };
        }
        monthlyData[monthKey].expenses += order.totalAmount;
        monthlyData[monthKey].sales += order.totalAmount * (1.5 + Math.random() * 0.5); 
    });
    
    return Object.entries(monthlyData).map(([month, data]) => ({
        month,
        sales: parseFloat(data.sales.toFixed(0)),
        expenses: parseFloat(data.expenses.toFixed(0))
    })).sort((a,b) => {
        // Custom sort for Thai month year strings
        const [aMon, aYr] = a.month.split(" ");
        const [bMon, bYr] = b.month.split(" ");
        const aDate = new Date(months.indexOf(aMon) + 1 + "/1/" + (parseInt(aYr) - 543) );
        const bDate = new Date(months.indexOf(bMon) + 1 + "/1/" + (parseInt(bYr) - 543) );
        return aDate.getTime() - bDate.getTime();
    }).slice(-6);
};


export const ReportPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  const inventoryReport = useMemo(() => generateInventoryReportData(MOCK_INVENTORY_ITEMS), []);
  const workTimeReport = useMemo(() => generateWorkTimeReportData(MOCK_TIME_LOGS), []);
  const salesExpenseReport = useMemo(() => generateSalesExpenseData(MOCK_PURCHASE_ORDERS), []);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-8">
      <Card title="รายงานสต็อกสินค้า">
        <p className="text-sm text-gray-600 mb-4">10 อันดับแรกของสินค้าตามจำนวนคงเหลือ</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={inventoryReport} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-30} textAnchor="end" height={70} interval={0} tick={{fontSize: 10}}/>
            <YAxis />
            <Tooltip formatter={(value: number) => `${value.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="quantity" fill="#FB6F92" name="จำนวน" /> 
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="รายงานชั่วโมงการทำงานของพนักงาน (10 อันดับแรก)">
        <p className="text-sm text-gray-600 mb-4">จำนวนชั่วโมงทั้งหมดที่พนักงานลงบันทึก (ข้อมูลตัวอย่าง)</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={workTimeReport} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number"/>
            <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 10}} />
            <Tooltip formatter={(value: number) => `${value} ชั่วโมง`} />
            <Legend />
            <Bar dataKey="hours" fill="#fc88b8" name="รวมชั่วโมง" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      
      <Card title="ยอดขายเทียบกับค่าใช้จ่ายรายเดือน (6 เดือนล่าสุด)">
        <p className="text-sm text-gray-600 mb-4">ภาพรวมยอดขายและค่าใช้จ่าย (ข้อมูลตัวอย่างจาก POs)</p>
         <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesExpenseReport} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{fontSize: 12}}/>
            <YAxis tickFormatter={(value) => `฿${(value/1000).toFixed(0)}พัน`} />
            <Tooltip formatter={(value: number) => `฿${value.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="sales" fill="#FB6F92" name="ยอดขาย" />
            <Bar dataKey="expenses" fill="#f4567f" name="ค่าใช้จ่าย" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};