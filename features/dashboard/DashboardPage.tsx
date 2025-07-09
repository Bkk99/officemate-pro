// src/features/dashboard/DashboardPage.tsx

import React from 'react';

export const DashboardPage: React.FC = () => {
  return (
    <div style={{ padding: '2rem', background: 'lightblue' }}>
      <h1>Dashboard Page is Rendering!</h1>
      <p>ถ้าคุณเห็นข้อความนี้ แสดงว่าการ Routing และ Layout ทำงานถูกต้อง</p>
    </div>
  );
};

// ถ้ามี default export ให้ใช้ตัวนี้แทน
// const DashboardPage: React.FC = () => { ... };
// export default DashboardPage;
