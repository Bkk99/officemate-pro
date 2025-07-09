
import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { Spinner } from './Spinner';
import { exportToCsv } from '../../utils/export';
import { parseCsvFile } from '../../utils/export';

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => Promise<{success: boolean; message: string}>;
  headerMapping: Record<string, string>;
  templateFilename: string;
  modalTitle: string;
}

export const ImportCsvModal: React.FC<ImportCsvModalProps> = ({ isOpen, onClose, onImport, headerMapping, templateFilename, modalTitle }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<{success: boolean; message: string} | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setImportResult(null);
    }
  };

  const handleDownloadTemplate = () => {
    // We only need the headers for the template file, so we pass an empty object.
    // The export function is adapted to handle this to generate a header-only file.
    exportToCsv(templateFilename, [{}], headerMapping);
  };

  const handleImportClick = async () => {
    if (!file) {
      setImportResult({ success: false, message: 'กรุณาเลือกไฟล์ CSV ก่อน' });
      return;
    }
    setIsLoading(true);
    setImportResult(null);
    try {
      const parsedData = await parseCsvFile(file);
      const result = await onImport(parsedData);
      setImportResult(result);
      if (result.success) {
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if(fileInput) fileInput.value = "";
          setFile(null); // Clear file state on success
      }
    } catch (error: any) {
      console.error("Import process failed:", error);
      setImportResult({ success: false, message: `เกิดข้อผิดพลาดในการประมวลผลไฟล์: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClose = () => {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if(fileInput) fileInput.value = "";
    setFile(null);
    setImportResult(null);
    setIsLoading(false);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={modalTitle}>
        <div className="space-y-4">
            <p className="text-sm text-gray-600">ดาวน์โหลดเทมเพลตเพื่อดูรูปแบบข้อมูลที่ถูกต้อง จากนั้นกรอกข้อมูลและนำเข้าไฟล์</p>
            <Button variant="secondary" onClick={handleDownloadTemplate}>ดาวน์โหลดเทมเพลต CSV</Button>
            
            <Input 
                type="file" 
                label="เลือกไฟล์ CSV ที่จะนำเข้า" 
                accept=".csv"
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />

            {importResult && (
                <div className={`p-3 rounded-md text-sm ${importResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {importResult.message}
                </div>
            )}
        </div>
        
        <div className="mt-6 flex justify-end space-x-2">
            <Button variant="secondary" onClick={handleClose}>ปิด</Button>
            <Button onClick={handleImportClick} disabled={isLoading || !file}>
                {isLoading ? <><Spinner size="sm" color="text-white"/> กำลังนำเข้า...</> : 'นำเข้าข้อมูล'}
            </Button>
        </div>
    </Modal>
  );
};