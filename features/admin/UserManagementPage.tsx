import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../../types';
import { getAllUserProfiles } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { DEPARTMENTS } from '../../constants'; 
import { useAuth } from '../../contexts/AuthContext';
import { Spinner } from '../../components/ui/Spinner';
import { exportToCsv } from '../../utils/export';

const ArrowDownTrayIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1.25-7.75A.75.75 0 0010 9.5v2.25H7.75a.75.75 0 000 1.5H10v2.25a.75.75 0 001.5 0V13.5h2.25a.75.75 0 000-1.5H11.5V9.5zM10 2a.75.75 0 01.75.75v3.558c1.95.36 3.635 1.493 4.81 3.207a.75.75 0 01-1.12.99C13.551 8.89 11.853 8 10 8s-3.551.89-4.44 2.515a.75.75 0 01-1.12-.99A6.479 6.479 0 019.25 6.308V2.75A.75.75 0 0110 2z" clipRule="evenodd" />
    </svg>
  );

const USER_ROLES_TH: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'ผู้ดูแลระบบ (Admin)',
    [UserRole.MANAGER]: 'ผู้จัดการ (Manager)',
    [UserRole.STAFF]: 'พนักงาน (Staff)',
}

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const userProfiles = await getAllUserProfiles();
      setUsers(userProfiles || []);
    } catch (error) {
      console.error("Failed to fetch user profiles:", error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);


  const handleExportUsers = () => {
    const dataToExport = users.map(u => ({
        'ID': u.id,
        'ชื่อผู้ใช้ (อีเมล)': u.username,
        'ชื่อ-นามสกุล': u.name,
        'บทบาท': USER_ROLES_TH[u.role] || u.role,
        'แผนก': u.department || 'N/A',
    }));
    exportToCsv('user_accounts_data', dataToExport);
  };
  
  const userColumns = [
    { header: 'ชื่อ-นามสกุล', accessor: 'name' },
    { header: 'อีเมล', accessor: 'username' },
    { header: 'บทบาท', accessor: (item: User) => USER_ROLES_TH[item.role] || item.role },
    { header: 'แผนก', accessor: (item: User) => item.department || 'N/A' },
  ];

  if (isLoading) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <Card 
        title="จัดการบัญชีผู้ใช้งาน"
        actions={
            <div className="flex space-x-2">
                 <Button onClick={handleExportUsers} variant="secondary" leftIcon={<ArrowDownTrayIcon className="h-5 w-5"/>}>ส่งออก CSV</Button>
            </div>
        }
      >
        <div className="p-4 mb-4 bg-blue-50 border-l-4 border-blue-400 text-blue-700">
          <p className="font-bold">หมายเหตุด้านความปลอดภัย</p>
          <p className="text-sm">หน้านี้แสดงรายชื่อผู้ใช้จากฐานข้อมูลของคุณ เพื่อความปลอดภัยสูงสุด การสร้าง, แก้ไข, และลบบัญชีผู้ใช้ควรดำเนินการผ่าน Supabase Dashboard โดยตรง (ในส่วน Authentication &gt; Users และตาราง `profiles`)</p>
        </div>
        <Table 
            columns={userColumns.map(col => ({
                ...col,
                accessor: typeof col.accessor === 'string' ? col.accessor as keyof User : col.accessor as (item: User) => React.ReactNode,
            }))} 
            data={users} 
            isLoading={isLoading}
            emptyMessage="ไม่พบข้อมูลผู้ใช้งาน"
        />
      </Card>
    </div>
  );
};