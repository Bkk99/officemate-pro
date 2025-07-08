// features/payroll/payrollCalculations.ts
import { Employee, Payslip, PayslipItem, PayrollComponent } from '../../types';
import { 
    MOCK_TAX_BRACKETS_SIMPLIFIED, SOCIAL_SECURITY_RATE, SOCIAL_SECURITY_CAP_MONTHLY_SALARY, 
    SOCIAL_SECURITY_MIN_MONTHLY_SALARY, STANDARD_DEDUCTION_ANNUAL, PERSONAL_ALLOWANCE_ANNUAL 
} from '../../constants';
import { getPayrollComponents } from '../../services/api';

/**
 * Generates a payslip for a given employee for a specific period.
 * This is a pure function that performs all payroll calculations.
 * @param employee - The full employee object.
 * @param month - The month of the payroll run (1-12).
 * @param year - The year of the payroll run.
 * @param runId - The ID of the parent payroll run.
 * @param existingPayslipData - Optional data from a previously generated or partially edited payslip.
 * @returns A fully calculated Payslip object.
 */
export const generatePayslipForEmployee = async (
    employee: Employee, 
    month: number, 
    year: number, 
    runId: string, 
    existingPayslipData?: Partial<Payslip>
): Promise<Payslip> => {
    const payrollComponents = await getPayrollComponents();
    const baseSalary = employee.baseSalary || 0;

    // Start with recurring allowances and add any one-time allowances for this run
    const allowances: PayslipItem[] = (employee.recurringAllowances || []).map(a => ({ name: a.name, amount: a.amount, payrollComponentId: a.payrollComponentId }));
    if(existingPayslipData?._tempOneTimeAllowances) {
        allowances.push(...existingPayslipData._tempOneTimeAllowances);
    }

    // Calculate overtime pay if applicable
    const overtimePay = (existingPayslipData?.overtimeHours || 0) * (existingPayslipData?.overtimeRate || 0);
    if (overtimePay > 0) {
        allowances.push({ name: 'ค่าล่วงเวลา (OT)', amount: overtimePay, payrollComponentId: 'comp_ot' });
    }

    // Calculate total gross pay
    const grossPay = baseSalary + allowances.reduce((sum, a) => sum + a.amount, 0);

    // --- Deductions ---
    // Social Security
    const cappedSalaryForSsf = Math.max(SOCIAL_SECURITY_MIN_MONTHLY_SALARY, Math.min(baseSalary, SOCIAL_SECURITY_CAP_MONTHLY_SALARY));
    const socialSecurityDeduction = cappedSalaryForSsf * SOCIAL_SECURITY_RATE;
    
    // Provident Fund
    const providentFundDeduction = baseSalary * ((employee.providentFundRateEmployee || 0) / 100);

    // Tax Calculation
    const taxableAllowancesValue = allowances.reduce((sum, allowance) => {
        const component = payrollComponents.find(c => c.id === allowance.payrollComponentId);
        // Default to taxable if component is not found or isTaxable is not explicitly false
        return (component?.isTaxable !== false) ? sum + allowance.amount : sum;
    }, 0);
    
    const annualTaxableIncome = ((baseSalary + taxableAllowancesValue) * 12) - STANDARD_DEDUCTION_ANNUAL - PERSONAL_ALLOWANCE_ANNUAL - (socialSecurityDeduction * 12) - (providentFundDeduction * 12);
    let annualTax = 0;
    if (annualTaxableIncome > 0) {
        for (const bracket of MOCK_TAX_BRACKETS_SIMPLIFIED) {
            if (annualTaxableIncome > bracket.minIncome) {
                const incomeInBracket = Math.min(annualTaxableIncome, bracket.maxIncome || Infinity) - bracket.minIncome;
                annualTax += incomeInBracket * bracket.rate;
            }
        }
    }
    const taxDeduction = annualTax > 0 ? annualTax / 12 : 0;
    
    // Start with recurring deductions and add any one-time deductions
    const otherDeductions: PayslipItem[] = (employee.recurringDeductions || []).map(d => ({ name: d.name, amount: d.amount, payrollComponentId: d.payrollComponentId }));
    if(existingPayslipData?._tempOneTimeDeductions) {
        otherDeductions.push(...existingPayslipData._tempOneTimeDeductions);
    }

    // Sum up all deductions
    const totalDeductions = taxDeduction + socialSecurityDeduction + providentFundDeduction + otherDeductions.reduce((sum, d) => sum + d.amount, 0);
    
    // Calculate final net pay
    const netPay = grossPay - totalDeductions;

    const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    return {
        id: existingPayslipData?.id || generateId('ps'),
        payrollRunId: runId,
        employeeId: employee.id,
        employeeName: employee.name,
        employeeCode: employee.employeeCode,
        employeeDepartment: employee.department,
        employeePosition: employee.position,
        employeeTaxId: employee.taxId,
        employeeSsn: employee.socialSecurityNumber,
        employeeJoiningDate: employee.hireDate,
        payPeriod: `${new Date(year, month - 1).toLocaleString('th-TH', { month: 'long' })} ${year + 543}`,
        baseSalary,
        overtimeHours: existingPayslipData?.overtimeHours,
        overtimeRate: existingPayslipData?.overtimeRate,
        overtimePay,
        allowances,
        grossPay,
        taxDeduction: parseFloat(taxDeduction.toFixed(2)),
        socialSecurityDeduction: parseFloat(socialSecurityDeduction.toFixed(2)),
        providentFundDeduction: parseFloat(providentFundDeduction.toFixed(2)),
        otherDeductions,
        totalDeductions: parseFloat(totalDeductions.toFixed(2)),
        netPay: parseFloat(netPay.toFixed(2)),
        bankName: employee.bankName,
        bankAccountNumber: employee.bankAccountNumber,
    };
};
