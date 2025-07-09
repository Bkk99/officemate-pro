// src/features/dashboard/DashboardPage.tsx
import React from 'react';

export const DashboardPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold">ยินดีต้อนรับกลับมา!</h1>
      <p className="text-gray-600">ภาพรวมพื้นที่ทำงานของคุณ</p>
      
      {/* ส่วนของการ์ดข้อมูล */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {/* Card 1: พนักงาน */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">พนักงานที่ใช้งานอยู่</h3>
          <p className="text-4xl font-bold mt-2 text-pink-500">52</p>
        </div>
        {/* Card 2: สินค้าในสต็อก */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">สินค้าในสต็อก</h3>
          <p className="text-4xl font-bold mt-2 text-green-500">1,280</p>
        </div>
        {/* ... ใส่ Card อื่นๆ ... */}
      </div>

      {/* ส่วนของกิจกรรมล่าสุด */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">กิจกรรมล่าสุด</h3>
        {/* ... รายการกิจกรรม ... */}
      </div>
    </div>
  );
};
