
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../../types';
import { MOCK_USERS, addUserAccount, updateUserAccount, deleteUserAccount } from '../../services/mockData'; 
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Table } from '../../components/ui/Table';
import { DEPARTMENTS } from '../../constants'; 
import { useAuth } from '../../contexts/AuthContext';
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

const initialUserState: Omit<User, 'id'> & { password?: string } = {
  username: '', password: '', name: '', role: UserRole.STAFF, department: ''
};

const USER_ROLES_TH: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'ผู้ดูแลระบบ (Admin)',
    [UserRole.MANAGER]: 'ผู้จัดการ (Manager)',
    [UserRole.STAFF]: 'พนักงาน (Staff)',
}
const USER_ROLES_OPTIONS = Object.values(UserRole).map(role => ({ value: role, label: USER_ROLES_TH[role] }));
const DEPARTMENT_OPTIONS = DEPARTMENTS.map(dep => ({value: dep, label: dep}));


export const UserManagementPage: React.FC = () => {
  const { user: adminUser, updateUserContext } = useAuth(); 
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUserForm, setCurrentUserForm] = useState<Omit<User, 'id'> | User & { password?: string }>(initialUserState);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    setUsers(MOCK_USERS);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenModal = (userToEdit?: User) => {
    if (userToEdit) {
      setCurrentUserForm({...userToEdit, password: '' }); 
      setEditingUserId(userToEdit.id);
    } else {
      setCurrentUserForm(initialUserState);
      setEditingUserId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUserForm(initialUserState);
    setEditingUserId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentUserForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const { password, ...userData } = currentUserForm as User & { password?: string };
    
    if (editingUserId) {
      const updatedUser = password ? { ...userData, password } : userData;
      updateUserAccount(updatedUser as User);
       if (adminUser && adminUser.id === editingUserId) { 
        updateUserContext(updatedUser as User);
      }
    } else {
      if (!password) {
          alert("รหัสผ่านจำเป็นสำหรับผู้ใช้ใหม่"); 
          return;
      }
      addUserAccount({ ...userData, password } as Omit<User, 'id'> & { password?: string});
    }
    await fetchUsers();
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    if (adminUser && id === adminUser.id) {
        alert("คุณไม่สามารถลบบัญชีของตนเองได้");
        return;
    }
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีผู้ใช้นี้?')) {
      deleteUserAccount(id);
      await fetchUsers();
    }
  };
  
  const userColumns = [
    { header: 'ชื่อผู้ใช้', accessor: 'username' },
    { header: 'ชื่อ-นามสกุล', accessor: 'name' },
    { header: 'บทบาท', accessor: (item: User) => USER_ROLES_TH[item.role] || item.role },
    { header: 'แผนก', accessor: (item: User) => item.department || 'N/A' },
    { header: 'การดำเนินการ', accessor: (item: User) => (
      <div className="space-x-2">
        <Button variant="ghost" size="sm" onClick={() => handleOpenModal(item)} title="แก้ไขผู้ใช้"><PencilIcon className="h-4 w-4"/></Button>
        {adminUser && item.id !== adminUser.id && ( 
            <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} title="ลบผู้ใช้"><TrashIcon className="h-4 w-4 text-red-500"/></Button>
        )}
      </div>
    )},
  ];

  if (isLoading) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <Card 
        title="จัดการบัญชีผู้ใช้งาน"
        actions={<Button onClick={() => handleOpenModal()} leftIcon={<PlusIcon className="h-5 w-5"/>}>สร้างผู้ใช้</Button>}
      >
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

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingUserId ? 'แก้ไขบัญชีผู้ใช้' : 'สร้างบัญชีผู้ใช้ใหม่'} size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="ชื่อผู้ใช้ (Username)" name="username" value={currentUserForm.username} onChange={handleChange} required />
            <Input label="ชื่อ-นามสกุล" name="name" value={currentUserForm.name} onChange={handleChange} required />
            <Input 
              label={editingUserId ? "รหัสผ่านใหม่ (เว้นว่างถ้าไม่ต้องการเปลี่ยน)" : "รหัสผ่าน"}
              name="password" 
              type="password" 
              value={(currentUserForm as User & { password?: string }).password || ''} 
              onChange={handleChange} 
              required={!editingUserId}
            />
            <Select label="บทบาท" name="role" value={currentUserForm.role} onChange={handleChange} options={USER_ROLES_OPTIONS} required />
            {(currentUserForm.role === UserRole.MANAGER || currentUserForm.role === UserRole.STAFF) && (
                 <Select label="แผนก (ถ้ามีสำหรับพนักงาน)" name="department" value={currentUserForm.department || ''} onChange={handleChange} options={DEPARTMENT_OPTIONS} placeholder="เลือกแผนก"/>
            )}
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="secondary" onClick={handleCloseModal}>ยกเลิก</Button>
          <Button onClick={handleSubmit}>{editingUserId ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างผู้ใช้'}</Button>
        </div>
      </Modal>
    </div>
  );
};
