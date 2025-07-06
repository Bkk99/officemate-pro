
import React from 'react';
import { PayslipViewProps } from '../../types';
import { APP_NAME, COMPANY_ADDRESS_MOCK, COMPANY_LOGO_URL_MOCK } from '../../constants';

const StatRow: React.FC<{ label: string; value?: string | number | null; className?: string; valueClassName?: string }> = ({ label, value, className, valueClassName }) => (
  <div className={`flex justify-between py-1.5 border-b border-dashed border-gray-200 ${className}`}>
    <span className="text-sm text-gray-600">{label}:</span>
    <span className={`text-sm text-gray-800 font-medium ${valueClassName}`}>{value || '-'}</span>
  </div>
);

const AmountRow: React.FC<{ label: string; amount?: number; isTotal?: boolean; className?: string; labelClassName?: string; amountClassName?: string }> = ({ label, amount, isTotal, className, labelClassName, amountClassName }) => (
  <div className={`flex justify-between py-1.5 ${isTotal ? 'font-semibold border-t border-gray-300' : ''} ${className}`}>
    <span className={`text-sm ${labelClassName || ''}`}>{label}</span>
    <span className={`text-sm ${amountClassName}`}>{amount !== undefined ? amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</span>
  </div>
);

export const PayslipView: React.FC<PayslipViewProps> = ({
  payslip,
  employee,
  companyName = APP_NAME,
  companyAddress = COMPANY_ADDRESS_MOCK,
  companyLogoUrl = COMPANY_LOGO_URL_MOCK,
  isPaid
}) => {
  if (!payslip) return <p>ไม่พบข้อมูลสลิปเงินเดือน</p>;

  const emp = employee || { 
      name: payslip.employeeName, 
      employeeCode: payslip.employeeCode, 
      department: payslip.employeeDepartment,
      position: payslip.employeePosition,
      taxId: payslip.employeeTaxId,
      socialSecurityNumber: payslip.employeeSsn,
      hireDate: payslip.employeeJoiningDate
    };


  return (
    <div className="bg-white p-6 md:p-8 shadow-lg rounded-lg max-w-2xl mx-auto font-sans relative print:shadow-none print:p-0">
      {isPaid && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-[-30deg] opacity-10 print:opacity-20 pointer-events-none">
          <span className="text-7xl md:text-9xl font-bold text-green-500 border-4 border-green-500 p-4 rounded">จ่ายแล้ว</span>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start pb-4 mb-4 border-b-2 border-primary-500">
        <div className="flex items-center mb-2 sm:mb-0">
          {companyLogoUrl && <img src={companyLogoUrl} alt="Company Logo" className="h-16 w-auto mr-4 rounded print:h-12 print:w-auto" onError={(e) => (e.currentTarget.style.display = 'none')} />}
          <div>
            <h1 className="text-2xl font-bold text-primary-700 print:text-xl">{companyName}</h1>
            <p className="text-xs text-gray-500 print:text-[10px]">{companyAddress}</p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <h2 className="text-xl font-semibold text-gray-700 print:text-lg">สลิปเงินเดือน</h2>
          <p className="text-sm text-gray-600 print:text-xs">สำหรับงวด: {payslip.payPeriod}</p>
          {payslip.paymentDate && <p className="text-xs text-gray-500 print:text-[10px]">วันที่จ่าย: {new Date(payslip.paymentDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>}
        </div>
      </div>

      {/* Employee Details */}
      <div className="mb-6">
        <h3 className="text-md font-semibold text-gray-700 mb-2">ข้อมูลพนักงาน</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <StatRow label="ชื่อ-นามสกุล" value={emp.name} />
          <StatRow label="รหัสพนักงาน" value={emp.employeeCode} />
          <StatRow label="แผนก" value={emp.department} />
          <StatRow label="ตำแหน่ง" value={emp.position} />
          {emp.hireDate && <StatRow label="วันที่เริ่มงาน" value={new Date(emp.hireDate).toLocaleDateString('th-TH')} />}
          <StatRow label="เลขประจำตัวผู้เสียภาษี" value={emp.taxId} />
          <StatRow label="เลขประกันสังคม" value={emp.socialSecurityNumber} />
        </div>
      </div>

      {/* Earnings & Deductions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 mb-6">
        {/* Earnings */}
        <div>
          <h3 className="text-md font-semibold text-gray-700 mb-2 border-b pb-1">รายการเงินได้</h3>
          <AmountRow label="เงินเดือนพื้นฐาน" amount={payslip.baseSalary} labelClassName="text-green-600" amountClassName="text-green-600" />
          {payslip.allowances.map((allowance, index) => (
            <AmountRow key={`allow-${index}`} label={allowance.name} amount={allowance.amount} labelClassName="text-green-600" amountClassName="text-green-600" />
          ))}
          {payslip.overtimePay && payslip.overtimePay > 0 && (
            <AmountRow label={`ค่าล่วงเวลา (${payslip.overtimeHours || 0} ชม. x ${payslip.overtimeRate || 0}/ชม.)`} amount={payslip.overtimePay} labelClassName="text-green-600" amountClassName="text-green-600" />
          )}
          <AmountRow label="รวมเงินได้" amount={payslip.grossPay} isTotal className="mt-1 pt-1" labelClassName="text-green-700 font-bold" amountClassName="text-green-700 font-bold" />
        </div>

        {/* Deductions */}
        <div>
          <h3 className="text-md font-semibold text-gray-700 mb-2 border-b pb-1">รายการหัก</h3>
          <AmountRow label="ภาษีเงินได้บุคคลธรรมดา" amount={payslip.taxDeduction} labelClassName="text-red-600" amountClassName="text-red-600" />
          <AmountRow label="ประกันสังคม" amount={payslip.socialSecurityDeduction} labelClassName="text-red-600" amountClassName="text-red-600" />
          <AmountRow label="กองทุนสำรองเลี้ยงชีพ" amount={payslip.providentFundDeduction} labelClassName="text-red-600" amountClassName="text-red-600" />
          {payslip.otherDeductions.map((deduction, index) => (
            <AmountRow key={`deduct-${index}`} label={deduction.name} amount={deduction.amount} labelClassName="text-red-600" amountClassName="text-red-600" />
          ))}
          <AmountRow label="รวมเงินหัก" amount={payslip.totalDeductions} isTotal className="mt-1 pt-1" labelClassName="text-red-700 font-bold" amountClassName="text-red-700 font-bold" />
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t-2 border-primary-500">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-bold text-gray-800">ยอดสุทธิที่จ่าย:</span>
          <span className="text-2xl font-bold text-primary-600">
            ฿ {payslip.netPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
      
      {(payslip.bankName || payslip.bankAccountNumber) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-600 mb-1">ข้อมูลการจ่ายเงิน</h3>
          <p className="text-xs text-gray-500">
            จ่ายเข้าบัญชี {payslip.bankName}, เลขที่บัญชี: {payslip.bankAccountNumber}
          </p>
        </div>
      )}

      <div className="mt-8 pt-4 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500">
          นี่คือสลิปเงินเดือนที่สร้างจากระบบคอมพิวเตอร์ ไม่จำเป็นต้องมีลายเซ็น
        </p>
      </div>
    </div>
  );
};
