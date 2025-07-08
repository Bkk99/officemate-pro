
import React from 'react';
import { Document } from '../../types';
import { APP_NAME, COMPANY_ADDRESS_MOCK, COMPANY_LOGO_URL_MOCK, DOCUMENT_TYPES_TH } from '../../constants';

export interface DocumentViewProps {
  document: Document;
  companyName?: string;
  companyAddress?: string;
  companyLogoUrl?: string;
}

export const DocumentView: React.FC<DocumentViewProps> = ({
  document,
  companyName = APP_NAME,
  companyAddress = COMPANY_ADDRESS_MOCK,
  companyLogoUrl = COMPANY_LOGO_URL_MOCK,
}) => {
  if (!document) return <p>ไม่พบข้อมูลเอกสาร</p>;

  const docTitle = DOCUMENT_TYPES_TH[document.type];
  const isPaid = document.status === 'Paid';
  const isCancelled = document.status === 'Cancelled';
  
  return (
    <div id="document-view-content" className="bg-white p-8 shadow-lg rounded-lg max-w-4xl mx-auto font-sans relative print:shadow-none print:p-0">
      {(isPaid || isCancelled) && (
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-[-30deg] opacity-10 print:opacity-20 pointer-events-none`}>
          <span className={`text-7xl md:text-9xl font-bold border-4 p-4 rounded ${isPaid ? 'text-green-500 border-green-500' : 'text-red-500 border-red-500'}`}>
            {isPaid ? 'ชำระแล้ว' : 'ยกเลิก'}
          </span>
        </div>
      )}
      
      {/* Header */}
      <div className="flex justify-between items-start pb-4 mb-4 border-b-2 border-gray-300">
        <div className="flex items-center">
          {companyLogoUrl && <img src={companyLogoUrl} alt="Company Logo" className="h-20 w-auto mr-4 rounded print:h-16" onError={(e) => (e.currentTarget.style.display = 'none')} />}
          <div>
            <h1 className="text-3xl font-bold text-gray-800 print:text-2xl">{companyName}</h1>
            <p className="text-sm text-gray-500 print:text-xs whitespace-pre-line">{companyAddress}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-bold text-primary-600 print:text-3xl">{docTitle}</h2>
          <p className="text-md text-gray-600 print:text-sm">เลขที่: {document.docNumber}</p>
          <p className="text-md text-gray-600 print:text-sm">วันที่: {new Date(document.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-8">
        <h3 className="text-md font-semibold text-gray-500 mb-2">ลูกค้า:</h3>
        <div className="pl-4 text-gray-800">
            <p className="font-bold text-lg">{document.clientName}</p>
            {document.projectName && <p className="text-md">{document.projectName}</p>}
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-sm">
              <th className="p-3 font-semibold">#</th>
              <th className="p-3 font-semibold">รายการ</th>
              <th className="p-3 font-semibold text-right">จำนวน</th>
              <th className="p-3 font-semibold text-right">ราคาต่อหน่วย</th>
              <th className="p-3 font-semibold text-right">ยอดรวม</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="p-3">1</td>
              <td className="p-3">บริการตาม {docTitle} เลขที่ {document.docNumber}</td>
              <td className="p-3 text-right">1</td>
              <td className="p-3 text-right">{document.amount ? document.amount.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</td>
              <td className="p-3 text-right">{document.amount ? document.amount.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</td>
            </tr>
            {/* In a real app, you would map over document.items here */}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-12">
        <div className="w-full max-w-xs">
            <div className="flex justify-between text-md text-gray-700 py-2 border-b">
                <span>ยอดรวม</span>
                <span>{document.amount ? document.amount.toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 py-2">
                <span>ยอดสุทธิ</span>
                <span>฿ {document.amount ? document.amount.toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}</span>
            </div>
        </div>
      </div>
      
      {/* Footer / Signature */}
      <div className="flex justify-between items-end mt-16 pt-8 border-t">
         <div className="text-sm text-gray-500">
            ขอบคุณที่ใช้บริการ
         </div>
         <div className="text-center w-48">
            <div className="border-b border-gray-400 mb-1"></div>
            <p className="text-sm">(ผู้อนุมัติ)</p>
         </div>
      </div>
    </div>
  );
};
