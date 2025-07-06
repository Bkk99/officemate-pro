
import React from 'react';
import { Employee } from '../../types';
import { COMPANY_LOGO_URL_MOCK, APP_NAME } from '../../constants';

interface IdCardPreviewProps {
  employee: Employee | null;
  issueDate: Date;
  expiryDate: Date;
  orientation?: 'horizontal' | 'vertical';
  side?: 'front' | 'back';
}

const IdCardPreview: React.FC<IdCardPreviewProps> = ({ 
  employee, 
  issueDate, 
  expiryDate, 
  orientation = 'horizontal', 
  side = 'front' 
}) => {
  if (!employee) {
    const placeholderClasses = orientation === 'horizontal' 
      ? "w-[337.5px] h-[212.5px]" // approx 85.6mm x 53.98mm
      : "w-[212.5px] h-[337.5px]"; // approx 53.98mm x 85.6mm

    return (
      <div 
        className={`${placeholderClasses} border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 text-gray-400`}
        aria-label="ส่วนแสดงตัวอย่างบัตรพนักงาน"
      >
        เลือกพนักงานเพื่อดูตัวอย่างบัตร
      </div>
    );
  }

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const commonCardStyles = "bg-white shadow-xl rounded-lg overflow-hidden border border-gray-300 p-3 font-sans flex flex-col";
  const cardDimensions = orientation === 'horizontal' 
    ? "w-[337.5px] h-[212.5px]" // approx 85.6mm x 53.98mm at 96 DPI
    : "w-[212.5px] h-[337.5px]"; // approx 53.98mm x 85.6mm at 96 DPI

  // Front Card Content
  const FrontCardHorizontal: React.FC = () => (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <img src={COMPANY_LOGO_URL_MOCK} alt="Company Logo" className="h-10 w-auto" onError={(e) => e.currentTarget.style.display = 'none'} />
        <div className="text-right">
            <h2 id="card-title" className="text-sm font-bold text-primary-700">{APP_NAME}</h2>
            <p className="text-[8px] text-gray-500">STAFF IDENTIFICATION CARD</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-grow flex items-center">
        <div className="w-1/3 flex-shrink-0">
          <img 
            src={employee.profileImageUrl || `https://picsum.photos/seed/${employee.id}/100/120`} 
            alt={`${employee.name}'s photo`} 
            className="w-full h-auto object-cover rounded border border-gray-200 aspect-[3/4]"
            onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.nameEn || employee.name)}&background=fbe9f7&color=c0397f&size=100`;
                target.alt = employee.name;
            }}
          />
        </div>
        <div className="w-2/3 pl-2.5 text-[10px] leading-tight space-y-0.5">
          <p className="text-sm font-semibold text-gray-800 truncate" title={employee.name}>{employee.name}</p>
          <p className="text-xs text-gray-600 truncate" title={employee.nameEn || ''}>{employee.nameEn || '-'}</p>
          <hr className="my-1 border-gray-200"/>
          <p><strong className="text-gray-500">ID:</strong> <span className="text-gray-700">{employee.employeeCode || employee.id}</span></p>
          <p><strong className="text-gray-500">ตำแหน่ง:</strong> <span className="text-gray-700">{employee.position}</span></p>
          <p><strong className="text-gray-500">แผนก:</strong> <span className="text-gray-700">{employee.department}</span></p>
        </div>
      </div>

      {/* Footer / Extra Info */}
      <div className="text-[9px] mt-1 pt-1 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-x-2">
            <p><strong className="text-gray-500">Passport No:</strong> <span className="text-gray-700">{employee.passportNumber || '-'}</span></p>
            <p><strong className="text-gray-500">Passport Exp:</strong> <span className="text-gray-700">{employee.passportExpiryDate ? formatDate(employee.passportExpiryDate) : '-'}</span></p>
            <p><strong className="text-gray-500">Issue Date:</strong> <span className="text-gray-700">{formatDate(issueDate)}</span></p>
            <p><strong className="text-gray-500">Expiry Date:</strong> <span className="text-gray-700">{formatDate(expiryDate)}</span></p>
        </div>
      </div>
      <div className="mt-auto h-2.5 bg-gray-700 w-full opacity-75" role="img" aria-label="แถบข้อมูลสำหรับสแกน"></div>
    </>
  );

  const FrontCardVertical: React.FC = () => (
    <>
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-2">
        <img src={COMPANY_LOGO_URL_MOCK} alt="Company Logo" className="h-12 w-auto mb-1" onError={(e) => e.currentTarget.style.display = 'none'} />
        <h2 id="card-title" className="text-base font-bold text-primary-700 leading-tight">{APP_NAME}</h2>
        <p className="text-[9px] text-gray-500">STAFF IDENTIFICATION CARD</p>
      </div>
      
      {/* Body */}
      <div className="flex flex-col items-center text-center mb-2">
        <img 
          src={employee.profileImageUrl || `https://picsum.photos/seed/${employee.id}/120/150`} 
          alt={`${employee.name}'s photo`} 
          className="w-28 h-36 object-cover rounded border-2 border-primary-300 shadow-md mb-2"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.nameEn || employee.name)}&background=fbe9f7&color=c0397f&size=120`;
            target.alt = employee.name;
        }}
        />
        <p className="text-lg font-semibold text-gray-800 leading-tight" title={employee.name}>{employee.name}</p>
        <p className="text-sm text-gray-600 leading-tight" title={employee.nameEn || ''}>{employee.nameEn || '-'}</p>
      </div>

      <div className="text-[10px] leading-snug space-y-0.5 text-center mb-2">
        <p><strong className="text-gray-500">ID:</strong> <span className="text-gray-700">{employee.employeeCode || employee.id}</span></p>
        <p><strong className="text-gray-500">ตำแหน่ง:</strong> <span className="text-gray-700">{employee.position}</span></p>
        <p><strong className="text-gray-500">แผนก:</strong> <span className="text-gray-700">{employee.department}</span></p>
      </div>
      
      {/* Footer / Extra Info */}
      <div className="text-[9px] mt-auto pt-1 border-t border-gray-200">
        <p><strong className="text-gray-500">Passport:</strong> <span className="text-gray-700">{employee.passportNumber || '-'} (Exp: {employee.passportExpiryDate ? formatDate(employee.passportExpiryDate) : '-'})</span></p>
        <div className="flex justify-between">
            <p><strong className="text-gray-500">Issue:</strong> <span className="text-gray-700">{formatDate(issueDate)}</span></p>
            <p><strong className="text-gray-500">Expiry:</strong> <span className="text-gray-700">{formatDate(expiryDate)}</span></p>
        </div>
      </div>
      <div className="h-3 bg-gray-700 w-full opacity-75 mt-1" role="img" aria-label="แถบข้อมูลสำหรับสแกน"></div>
    </>
  );

  // Back Card Content
  const BackCard: React.FC = () => (
    <div className={`flex flex-col h-full justify-between items-center text-center p-3 ${orientation === 'vertical' ? 'pt-6 pb-4' : 'pt-4 pb-2'}`}>
        <div>
            <h3 className={`font-semibold text-gray-700 ${orientation === 'vertical' ? 'text-sm mb-2' : 'text-xs mb-1'}`}>เงื่อนไขการใช้บัตร</h3>
            <ol className={`list-decimal list-inside text-left ${orientation === 'vertical' ? 'text-[9px]' : 'text-[8px]'} text-gray-600 space-y-0.5 leading-tight`}>
                <li>บัตรนี้เป็นทรัพย์สินของบริษัท {APP_NAME}</li>
                <li>บัตรนี้ใช้สำหรับยืนยันตัวตนพนักงานภายในพื้นที่ของบริษัทเท่านั้น</li>
                <li>กรณีบัตรสูญหาย โปรดแจ้งฝ่ายบุคคลทันที</li>
                <li>กรุณาคืนบัตรนี้เมื่อพ้นสภาพการเป็นพนักงาน</li>
            </ol>
        </div>
        
        <div className="w-full">
            {orientation === 'horizontal' && (
                 <div className="h-5 bg-gray-400 w-full my-2 opacity-50" role="img" aria-label="แถบแม่เหล็กจำลอง"></div>
            )}
            <p className={`text-gray-500 ${orientation === 'vertical' ? 'text-[8px]' : 'text-[7px]'} `}>
                หากพบบัตรนี้ กรุณาส่งคืน: ฝ่ายบุคคล {APP_NAME}
            </p>
            <p className={`text-gray-500 ${orientation === 'vertical' ? 'text-[8px]' : 'text-[7px]'}`}>
                โทรศัพท์: (เบอร์โทรศัพท์บริษัท)
            </p>
        </div>
    </div>
  );


  return (
    <div 
        id="employee-id-card-preview" 
        className={`${commonCardStyles} ${cardDimensions}`}
        style={{ fontFamily: "'Tahoma', 'Sarabun', 'sans-serif'" }} // Sarabun is a common Thai gov font
        aria-labelledby="card-title"
    >
      {side === 'front' ? (
        orientation === 'horizontal' ? <FrontCardHorizontal /> : <FrontCardVertical />
      ) : (
        <BackCard />
      )}
    </div>
  );
};

export default IdCardPreview;
