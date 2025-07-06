
import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { FingerprintScannerSettings, TimeLog, Employee } from '../../types';
import { getFingerprintScannerSettings, saveFingerprintScannerSettings, MOCK_EMPLOYEES, addTimeLog } from '../../services/mockData'; 
import { useAuth } from '../../contexts/AuthContext';

const WifiIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.75 18.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
);
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Sync From Scanner
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
);

const ArrowUpOnSquareIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Sync To Scanner
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25" />
    </svg>
);


export const FingerprintScannerSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<FingerprintScannerSettings>({ 
    ipAddress: '', 
    port: '', 
    lastSyncStatus: 'Unknown', 
    lastSyncToScannerStatus: 'Unknown' 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncingFrom, setIsSyncingFrom] = useState(false);
  const [syncFromMessage, setSyncFromMessage] = useState<string | null>(null);
  const [isSyncingTo, setIsSyncingTo] = useState(false);
  const [syncToMessage, setSyncToMessage] = useState<string | null>(null);


  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    const savedSettings = await getFingerprintScannerSettings();
    if (savedSettings) {
      setSettings(prev => ({...prev, ...savedSettings}));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSyncFromMessage(null);
    setSyncToMessage(null);
    const settingsToSave = { ...settings, lastSyncStatus: settings.lastSyncStatus || 'Unknown', lastSyncToScannerStatus: settings.lastSyncToScannerStatus || 'Unknown' };
    await saveFingerprintScannerSettings(settingsToSave);
    await new Promise(resolve => setTimeout(resolve, 700)); 
    setIsSaving(false);
    alert("บันทึกการตั้งค่าเครื่องสแกนนิ้วเรียบร้อยแล้ว");
  };

  const handleSimulateSyncFromScanner = async () => {
    if (!settings.ipAddress || !settings.port) {
        alert("กรุณาระบุ IP Address และ Port ก่อนทำการซิงค์");
        return;
    }
    setIsSyncingFrom(true);
    setSyncFromMessage("กำลังซิงค์ข้อมูลจากเครื่องสแกน (จำลอง)...");
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    try {
        const mockRawScannerData = [
            { scannerUserId: "FP001", timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), type: "clock-in" },
            { scannerUserId: "FP002", timestamp: new Date(Date.now() - 7.5 * 60 * 60 * 1000).toISOString(), type: "clock-in" },
            { scannerUserId: "FP001", timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), type: "clock-out" },
            { scannerUserId: "FP003", timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), type: "clock-in" },
            { scannerUserId: "FP003", timestamp: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString(), type: "clock-out" },
            { scannerUserId: "FP999", timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), type: "clock-in" },
        ];

        let logsAddedCount = 0;
        let unknownScans = 0;
        const employeeTimestamps: Record<string, { clockIn?: string, clockOut?: string}> = {};

        for (const rawLog of mockRawScannerData) {
            const employee = MOCK_EMPLOYEES.find(emp => emp.fingerprintScannerId === rawLog.scannerUserId);
            if (employee) {
                if (!employeeTimestamps[employee.id]) employeeTimestamps[employee.id] = {};
                if(rawLog.type === "clock-in" && !employeeTimestamps[employee.id].clockIn) {
                    employeeTimestamps[employee.id].clockIn = rawLog.timestamp;
                } else if (rawLog.type === "clock-out") {
                    employeeTimestamps[employee.id].clockOut = rawLog.timestamp;
                }
            } else {
                unknownScans++;
            }
        }
        
        for (const empId in employeeTimestamps) {
            const empData = employeeTimestamps[empId];
            const employee = MOCK_EMPLOYEES.find(e => e.id === empId);
            if(employee && empData.clockIn){
                 addTimeLog({
                    employeeId: employee.id,
                    employeeName: employee.name,
                    clockIn: empData.clockIn,
                    clockOut: empData.clockOut,
                    notes: `ซิงค์จากเครื่องสแกนนิ้ว (จำลอง) IP: ${settings.ipAddress}`,
                    source: 'Scanner',
                });
                logsAddedCount++;
            }
        }

        const successMsg = `ซิงค์ข้อมูลจากเครื่องสำเร็จ! เพิ่ม ${logsAddedCount} รายการ. ${unknownScans > 0 ? `ไม่พบ ${unknownScans} รหัสสแกน.` : ''}`;
        setSyncFromMessage(successMsg);
        const newSettings = { ...settings, lastSyncStatus: 'Success' as const, lastSyncTime: new Date().toISOString() };
        setSettings(newSettings);
        await saveFingerprintScannerSettings(newSettings);

    } catch (error) {
        console.error("Mock Sync From Scanner Error:", error);
        setSyncFromMessage("การซิงค์ข้อมูลจากเครื่องล้มเหลว (จำลอง).");
        const newSettings = { ...settings, lastSyncStatus: 'Failed' as const, lastSyncTime: new Date().toISOString() };
        setSettings(newSettings);
        await saveFingerprintScannerSettings(newSettings);
    }
    setIsSyncingFrom(false);
  };

  const handleSimulateSyncToScanner = async () => {
    if (!settings.ipAddress || !settings.port) {
        alert("กรุณาระบุ IP Address และ Port ก่อนทำการซิงค์");
        return;
    }
    setIsSyncingTo(true);
    setSyncToMessage("กำลังซิงค์ข้อมูลพนักงานไปยังเครื่องสแกน (จำลอง)...");

    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay & processing
    try {
        const employeesToSync = MOCK_EMPLOYEES.filter(emp => emp.status === 'Active' && emp.fingerprintScannerId);
        const payload = employeesToSync.map(emp => ({
            scannerId: emp.fingerprintScannerId,
            name: emp.name,
            employeeCode: emp.employeeCode,
            // Potentially other fields: cardNo, privileges etc.
        }));

        console.log("Simulated Payload to Scanner:", payload); // Log what would be sent
        
        // Simulate some results
        const employeesSyncedCount = Math.floor(Math.random() * payload.length) + 1; // Simulate some success
        const employeesFailedCount = payload.length - employeesSyncedCount;

        const successMsg = `จำลองการซิงค์ไปยังเครื่องสแกน: ${employeesSyncedCount} พนักงานสำเร็จ, ${employeesFailedCount > 0 ? `${employeesFailedCount} ล้มเหลว.` : 'ทั้งหมดสำเร็จ.' }`;
        setSyncToMessage(successMsg);
        const newSettings = { ...settings, lastSyncToScannerStatus: 'Success' as const, lastSyncToScannerTime: new Date().toISOString() };
        setSettings(newSettings);
        await saveFingerprintScannerSettings(newSettings);

    } catch (error) {
        console.error("Mock Sync To Scanner Error:", error);
        setSyncToMessage("การซิงค์ข้อมูลไปยังเครื่องล้มเหลว (จำลอง).");
        const newSettings = { ...settings, lastSyncToScannerStatus: 'Failed' as const, lastSyncToScannerTime: new Date().toISOString() };
        setSettings(newSettings);
        await saveFingerprintScannerSettings(newSettings);
    }
    setIsSyncingTo(false);
  };


  if (isLoading) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <Card title="ตั้งค่าการเชื่อมต่อเครื่องสแกนลายนิ้วมือ (HIP TIME)">
        <p className="text-sm text-gray-600 mb-4">
          ตั้งค่า IP Address และ Port ของ Bridge Application หรือเครื่องสแกนนิ้ว. การซิงค์จะช่วยให้ข้อมูลพนักงานและข้อมูลการลงเวลาระหว่างระบบนี้กับเครื่องสแกนตรงกัน.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="IP Address (ของ Bridge/Scanner)"
            name="ipAddress"
            value={settings.ipAddress}
            onChange={handleChange}
            placeholder="เช่น 192.168.1.200"
            disabled={isSaving || isSyncingFrom || isSyncingTo}
          />
          <Input
            label="Port (ของ Bridge/Scanner)"
            name="port"
            type="text" 
            value={settings.port}
            onChange={handleChange}
            placeholder="เช่น 4370"
            disabled={isSaving || isSyncingFrom || isSyncingTo}
          />
          <Input
            label="Device ID (ถ้ามี)"
            name="deviceId"
            value={settings.deviceId || ''}
            onChange={handleChange}
            placeholder="เช่น 1 (ถ้ามีหลายเครื่อง)"
            disabled={isSaving || isSyncingFrom || isSyncingTo}
          />
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={handleSaveSettings} disabled={isSaving || isSyncingFrom || isSyncingTo} leftIcon={isSaving ? <Spinner size="sm" color="text-white"/> : <WifiIcon className="h-5 w-5"/>}>
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
          </Button>
           <Button onClick={handleSimulateSyncFromScanner} variant="secondary" disabled={isSyncingFrom || isSyncingTo || isSaving} leftIcon={<ArrowPathIcon className={`h-5 w-5 ${isSyncingFrom ? 'animate-spin' : ''}`}/>}>
                {isSyncingFrom ? 'ดึงข้อมูล...' : 'ดึงข้อมูลจากเครื่อง (จำลอง)'}
            </Button>
            <Button onClick={handleSimulateSyncToScanner} variant="secondary" disabled={isSyncingTo || isSyncingFrom || isSaving} leftIcon={<ArrowUpOnSquareIcon className={`h-5 w-5 ${isSyncingTo ? 'animate-spin' : ''}`}/>}>
                {isSyncingTo ? 'ส่งข้อมูล...' : 'ส่งข้อมูลไปเครื่อง (จำลอง)'}
            </Button>
        </div>
        
        {syncFromMessage && (
          <div className={`mt-4 p-3 rounded-md text-sm ${settings.lastSyncStatus === 'Success' ? 'bg-green-50 text-green-700' : settings.lastSyncStatus === 'Failed' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
            <strong>สถานะ (ดึงข้อมูล):</strong> {syncFromMessage}
          </div>
        )}
        {settings.lastSyncTime && (
            <p className="text-xs text-gray-500 mt-1">
                ดึงข้อมูลครั้งล่าสุด: {new Date(settings.lastSyncTime).toLocaleString('th-TH')} - สถานะ: {settings.lastSyncStatus}
            </p>
        )}

        {syncToMessage && (
          <div className={`mt-4 p-3 rounded-md text-sm ${settings.lastSyncToScannerStatus === 'Success' ? 'bg-green-50 text-green-700' : settings.lastSyncToScannerStatus === 'Failed' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
            <strong>สถานะ (ส่งข้อมูล):</strong> {syncToMessage}
          </div>
        )}
        {settings.lastSyncToScannerTime && (
            <p className="text-xs text-gray-500 mt-1">
                ส่งข้อมูลครั้งล่าสุด: {new Date(settings.lastSyncToScannerTime).toLocaleString('th-TH')} - สถานะ: {settings.lastSyncToScannerStatus}
            </p>
        )}
      </Card>

      <Card title="คำแนะนำการใช้งาน">
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>ตรวจสอบให้แน่ใจว่า Bridge Application (ถ้ามี) หรือเครื่องสแกนนิ้วเปิดใช้งานและเชื่อมต่อกับเครือข่าย.</li>
            <li>IP Address และ Port ต้องตรงกับที่ตั้งค่าไว้บน Bridge หรือเครื่องสแกน.</li>
            <li>ในหน้า "จัดการพนักงาน", กำหนด "รหัสเครื่องสแกนนิ้ว" ให้กับพนักงานแต่ละคนให้ตรงกับ ID ที่ใช้ในเครื่องสแกน.</li>
            <li><strong>ดึงข้อมูลจากเครื่อง:</strong> นำเข้ารายการลงเวลาจากเครื่องสแกนนิ้วเข้าสู่ระบบ Officemate Pro.</li>
            <li><strong>ส่งข้อมูลไปเครื่อง:</strong> อัปเดต/เพิ่มข้อมูลพนักงาน (เช่น ชื่อ, รหัส) จาก Officemate Pro ไปยังเครื่องสแกนนิ้ว.</li>
        </ul>
      </Card>
    </div>
  );
};