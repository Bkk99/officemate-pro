
import React, { useState, useEffect, useCallback } from 'react';
import { ManagedUser, UserRole } from '../../types';
import { getManagedUsers, updateUserRole } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Table, TableColumn } from '../../components/ui/Table';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';

const UserRoleOptions = Object.values(UserRole).map(role => ({ value: role, label: role }));

const InformationCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
);

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const managedUsers = await getManagedUsers();
      setUsers(managedUsers);
    } catch (err: any) {
      console.error("Failed to fetch users:", err);
      if (err.message && (err.message.includes('function get_my_claim(text) does not exist') || err.message.includes('permission denied'))) {
         setError("เกิดข้อผิดพลาดฐานข้อมูล: อาจเกิดจากฟังก์ชัน 'get_my_claim' ไม่มีอยู่ หรือ RLS ไม่ถูกต้อง กรุณารันสคริปต์ 'database.sql' ที่ให้มาใน Supabase SQL Editor เพื่อแก้ไข");
      } else {
         setError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้ คุณอาจไม่มีสิทธิ์ที่จำเป็น');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const originalUsers = [...users];
    
    // Optimistic update
    setUsers(currentUsers =>
      currentUsers.map(u => (u.id === userId ? { ...u, role: newRole } : u))
    );

    try {
      await updateUserRole(userId, newRole);
    } catch (err) {
      console.error('Failed to update role:', err);
      alert('การอัปเดตสิทธิ์ล้มเหลว กำลังคืนค่าเดิม');
      // Revert on error
      setUsers(originalUsers);
    }
  };

  const columns: TableColumn<ManagedUser>[] = [
    { header: 'ชื่อเต็ม', accessor: (item) => item.full_name || '(ยังไม่ได้ตั้งค่า)' },
    { header: 'อีเมล', accessor: 'username' },
    { header: 'แผนก', accessor: (item) => item.department || '-' },
    {
      header: 'สิทธิ์การใช้งาน',
      accessor: (user) => (
        <Select
          value={user.role || ''}
          onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
          options={UserRoleOptions}
          wrapperClassName="!mb-0"
          aria-label={`Role for ${user.username}`}
        />
      ),
      className: 'w-48'
    },
     { header: 'อัปเดตล่าสุด', accessor: (item) => item.updated_at ? new Date(item.updated_at).toLocaleString('th-TH') : 'N/A' },
  ];

  if (error) {
    return (
        <Card title="เกิดข้อผิดพลาด">
            <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-800 rounded-md">
                 <div className="flex">
                    <div className="flex-shrink-0">
                        <InformationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-lg font-bold">ไม่สามารถโหลดหน้าจัดการผู้ใช้ได้</h3>
                        <p className="mt-2 text-md">{error}</p>
                    </div>
                 </div>
            </div>
        </Card>
    );
  }

  return (
    <Card title="จัดการผู้ใช้งานและสิทธิ์">
      <p className="text-sm text-gray-600 mb-4">
        ที่หน้านี้ คุณสามารถเปลี่ยนแปลงสิทธิ์การใช้งานของผู้ใช้แต่ละคนได้ ผู้ใช้ใหม่ที่ลงทะเบียนจะได้รับสิทธิ์ 'Staff' เป็นค่าเริ่มต้น
        หากต้องการเพิ่มผู้ใช้ใหม่ กรุณาใช้ระบบเชิญผู้ใช้ (Invite user) ใน Supabase Dashboard ของคุณ
      </p>
      <Table columns={columns} data={users} isLoading={isLoading} emptyMessage="ไม่พบข้อมูลผู้ใช้" />
    </Card>
  );
};
