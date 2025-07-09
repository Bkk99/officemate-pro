// ในไฟล์ src/components/Layout.tsx

// ... (ส่วน import และ ProtectedRoute ไม่ต้องแก้) ...

// ⭐️⭐️⭐️ แก้ไข MainLayout ทั้งหมดให้เป็นแบบนี้ ⭐️⭐️⭐️
export const MainLayout: React.FC = () => {
  
  // เราจะไม่ใช้ logic ใดๆ ทั้งสิ้นในตอนนี้
  
  return (
    <div style={{ border: '10px solid red', padding: '2rem', minHeight: '100vh' }}>
      <h1>THIS IS THE MAIN LAYOUT</h1>
      <p>ถ้าคุณเห็นกรอบสีแดงนี้ แสดงว่า MainLayout ถูก Render แล้ว</p>

      <main style={{ border: '5px solid blue', padding: '1rem', marginTop: '1rem' }}>
        <h2>The Outlet is below this line:</h2>
        
        {/* Outlet จะ render DashboardPage ที่เป็นกล่องสีฟ้า */}
        <Outlet /> 

      </main>
    </div>
  );
};
