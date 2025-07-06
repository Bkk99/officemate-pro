import React, { useState } from 'react'; // Added useState
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Link } from 'react-router-dom';
import { NAV_ITEMS, DEPARTMENTS } from '../../constants'; 
import { UserRole } from '../../types';
import { AnnouncementSettingsModal } from '../admin/AnnouncementSettingsModal'; // New Import
import { Button } from '../../components/ui/Button'; // New Import

// Icons for dashboard cards (simplified)
const UsersIconSolid = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.095a1.23 1.23 0 00.41-1.412A9.99 9.99 0 0010 12.75a9.99 9.99 0 00-6.535 1.743z" />
  </svg>
);
const ArchiveBoxIconSolid = (props: React.SVGProps<SVGSVGElement>) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 01.75.75v2.5a.75.75 0 01-.75.75h-2.541l.889 6.116A2.25 2.25 0 0113.35 16H6.65a2.25 2.25 0 01-2.248-2.634L5.29 8H2.75a.75.75 0 01-.75-.75v-2.5zm7.25.5a.75.75 0 00-1.5 0v1h1.5v-1zm2.5 0a.75.75 0 00-1.5 0v1h1.5v-1zM3.5 8h13V5.5H3.5V8zm3.15 1.492A.75.75 0 006 10.25v.5A.75.75 0 006.75 11.5h6.5a.75.75 0 00.75-.75v-.5a.75.75 0 00-.65-.758L10 11l-3.35-1.508z" clipRule="evenodd" />
  </svg>
);
const DocumentTextIconSolid = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V8.172a2 2 0 00-.586-1.414l-4.172-4.172A2 2 0 0011.828 2H4zm7.586 2.586L14 7.172V16a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1h6.172a1 1 0 01.707.293z" clipRule="evenodd" />
  </svg>
);
const CalendarDaysIconSolid = (props: React.SVGProps<SVGSVGElement>) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
  <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c0-.69.56-1.25 1.25-1.25H14c.69 0 1.25.56 1.25 1.25v6.5c0 .69-.56 1.25-1.25 1.25H6A1.25 1.25 0 014.75 14v-6.5z" clipRule="evenodd" />
</svg>
);

const MegaphoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 3.94.897 9.504a1.125 1.125 0 0 0-.527 1.437l4.385 7.8A1.125 1.125 0 0 0 5.85 19.5h12.3a1.125 1.125 0 0 0 .992-1.638l-4.385-7.8a1.125 1.125 0 0 0-1.96-.062L10.34 3.94Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9.75v.01M10.34 3.94v15.06M7.5 15.75H4.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.5h3.75" />
    </svg>
  );


const quickStats = [
  { title: 'พนักงานที่ใช้งานอยู่', value: '52', icon: UsersIconSolid, color: 'text-primary-500', bgColor: 'bg-primary-100' },
  { title: 'สินค้าในสต็อก', value: '1,280', icon: ArchiveBoxIconSolid, color: 'text-green-500', bgColor: 'bg-green-100' },
  { title: 'PO รอดำเนินการ', value: '12', icon: DocumentTextIconSolid, color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
  { title: 'การประชุมเร็วๆ นี้', value: '3', icon: CalendarDaysIconSolid, color: 'text-purple-500', bgColor: 'bg-purple-100' },
];

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);

  if (!user) return null;

  const accessibleNavItems = NAV_ITEMS.filter(
    item => item.allowedRoles.includes(user.role) && item.path !== '/dashboard' && !item.path.startsWith('/admin/') // Exclude settings from quick links here
  );

  const canManageAnnouncements = user.role === UserRole.ADMIN || 
                               (user.role === UserRole.MANAGER && user.department === DEPARTMENTS.find(d => d === "ฝ่ายบุคคล"));


  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap justify-between items-center">
            <div>
                <h1 className="text-2xl font-semibold text-gray-800">ยินดีต้อนรับกลับ, {user.name}!</h1>
                <p className="text-gray-600">ภาพรวมพื้นที่ทำงานของคุณ</p>
            </div>
            {canManageAnnouncements && (
                <Button 
                    variant="secondary" 
                    onClick={() => setIsAnnouncementModalOpen(true)}
                    leftIcon={<MegaphoneIcon className="h-5 w-5"/>}
                    className="mt-2 sm:mt-0"
                >
                    ตั้งค่าประกาศส่วนหัว
                </Button>
            )}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <Card key={stat.title} className="!p-0">
            <div className={`p-5 flex items-center justify-between ${stat.bgColor}`}>
                <stat.icon className={`h-10 w-10 ${stat.color}`} />
                 <div className="text-right">
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                </div>
            </div>
          </Card>
        ))}
      </div>
      
      <Card title="ทางลัดเข้าใช้งาน">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {accessibleNavItems.map((item) => (
             !item.subItems && ( // Only show top-level items that are not parents of sub-menus
                <Link
                key={item.path}
                to={item.path}
                className="group flex flex-col items-center justify-center p-6 bg-secondary-50 hover:bg-primary-50 rounded-lg transition-colors border border-secondary-200 hover:border-primary-300"
                >
                <item.icon className="h-10 w-10 text-primary-600 mb-3 transition-transform group-hover:scale-110" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-primary-700">{item.name}</span>
                </Link>
            )
          ))}
        </div>
      </Card>

      <Card title="กิจกรรมล่าสุด (ตัวอย่าง)">
        <ul className="space-y-3">
          <li className="p-3 bg-secondary-50 rounded-md text-sm">ใบสั่งซื้อใหม่ #PO-2024-0078 ถูกสร้างขึ้น</li>
          <li className="p-3 bg-secondary-50 rounded-md text-sm">พนักงาน สมชาย ใจดี ลงเวลาเข้างาน 9:03 น.</li>
          <li className="p-3 bg-secondary-50 rounded-md text-sm">สินค้า "กระดาษ A4" ใกล้หมดสต็อก</li>
        </ul>
      </Card>
      
      {canManageAnnouncements && (
        <AnnouncementSettingsModal 
            isOpen={isAnnouncementModalOpen}
            onClose={() => setIsAnnouncementModalOpen(false)}
        />
      )}
    </div>
  );
};
