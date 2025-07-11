
import React, { useState, useEffect, useCallback } from 'react';
import { Document, DocumentType, UserRole } from '../../types';
import { getDocuments, addDocument, updateDocument, deleteDocument } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Table } from '../../components/ui/Table';
import { DOCUMENT_TYPES_TH, DOCUMENT_TYPES_OPTIONS, DOCUMENT_STATUSES_OPTIONS, DOCUMENT_STATUSES_TH, APP_NAME, COMPANY_ADDRESS_MOCK, COMPANY_LOGO_URL_MOCK } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner } from '../../components/ui/Spinner';
import { exportToCsv } from '../../utils/export';
import { DocumentView } from './DocumentView';

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
  </svg>
);
const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
  </svg>
);
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25V4c.827-.05 1.66-.075 2.5-.075zM8.47 9.03a.75.75 0 00-1.084-1.03l-1.5 1.75a.75.75 0 101.084 1.03l1.5-1.75zm3.116-1.03a.75.75 0 00-1.084 1.03l1.5 1.75a.75.75 0 101.084-1.03l-1.5-1.75z" clipRule="evenodd" />
  </svg>
);
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
    <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.18l3.75-3.75a1.651 1.651 0 112.334 2.333L3.333 10l3.415 3.415a1.651 1.651 0 01-2.333 2.334l-3.75-3.75zM19.336 9.41a1.651 1.651 0 010 1.18l-3.75 3.75a1.651 1.651 0 11-2.333-2.333L16.667 10l-3.415-3.415a1.651 1.651 0 112.333-2.334l3.75 3.75z" clipRule="evenodd" />
  </svg>
);
const ArrowDownTrayIconDoc = (props: React.SVGProps<SVGSVGElement>) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1.25-7.75A.75.75 0 0010 9.5v2.25H7.75a.75.75 0 000 1.5H10v2.25a.75.75 0 001.5 0V13.5h2.25a.75.75 0 000-1.5H11.5V9.5zM10 2a.75.75 0 01.75.75v3.558c1.95.36 3.635 1.493 4.81 3.207a.75.75 0 01-1.12.99C13.551 8.89 11.853 8 10 8s-3.551.89-4.44 2.515a.75.75 0 01-1.12-.99A6.479 6.479 0 019.25 6.308V2.75A.75.75 0 0110 2z" clipRule="evenodd" />
  </svg>
);


const initialDocumentState: Omit<Document, 'id' | 'docNumber'> = {
  type: DocumentType.QUOTATION, clientName: '', projectName: '', date: new Date().toISOString().split('T')[0], amount: 0, status: 'Draft', pdfUrl: ''
};

const DOCUMENT_STATUSES_COLORS: Record<Document['status'], string> = {
    Draft: 'bg-gray-100 text-gray-800',
    Sent: 'bg-blue-100 text-blue-800',
    Paid: 'bg-green-100 text-green-800',
    Overdue: 'bg-yellow-100 text-yellow-800',
    Cancelled: 'bg-red-100 text-red-800',
};

export const DocumentPage: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<Omit<Document, 'id' | 'docNumber'> | Document>(initialDocumentState);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DocumentType>(DocumentType.QUOTATION);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [documentForView, setDocumentForView] = useState<Document | null>(null);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
        const docData = await getDocuments();
        setDocuments(docData);
    } catch(error) {
        console.error("Failed to fetch documents:", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleOpenModal = (doc?: Document) => {
    if (user?.role === UserRole.STAFF) return; // Staff cannot open modal
    if (doc) {
      setCurrentDocument(doc);
      setEditingDocId(doc.id);
    } else {
      setCurrentDocument({...initialDocumentState, type: activeTab, date: new Date().toISOString().split('T')[0]});
      setEditingDocId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentDocument(initialDocumentState);
    setEditingDocId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const numValue = name === 'amount' ? parseFloat(value) : value;
    setCurrentDocument(prev => ({ ...prev, [name]: numValue }));
  };

  const handleSubmit = async () => {
    if (user?.role === UserRole.STAFF) return;
    try {
        if (editingDocId) {
            await updateDocument(currentDocument as Document);
        } else {
            const docWithNumber = { ...currentDocument, docNumber: `${currentDocument.type.substring(0,2).toUpperCase()}-${Date.now()}`};
            await addDocument(docWithNumber as Omit<Document, 'id'>);
        }
        await fetchDocuments();
        handleCloseModal();
    } catch (error) {
        console.error("Failed to save document:", error);
        alert("เกิดข้อผิดพลาดในการบันทึกเอกสาร");
    }
  };

  const handleDelete = async (id: string) => {
    if (user?.role === UserRole.STAFF) return; // Staff cannot delete
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบเอกสารนี้?')) {
      await deleteDocument(id);
      await fetchDocuments();
    }
  };

  const handleViewDocument = (doc: Document) => {
    setDocumentForView(doc);
    setIsViewModalOpen(true);
  };

  const handlePrintDocument = () => {
    const printContents = document.getElementById('document-view-content')?.outerHTML;
    if (printContents && documentForView) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>พิมพ์เอกสาร - ${documentForView.docNumber}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <script>
                tailwind.config = {
                  theme: {
                    extend: {
                      colors: {
                        primary: {"50":"#fff5f7","100":"#ffeef2","200":"#fedde7","300":"#fecbd9","400":"#fdaac9","500":"#fc88b8","600":"#FB6F92","700":"#f4567f","800":"#e4426b","900":"#cc335c","950":"#a52346"},
                        secondary: {"50":"#f9fafb","100":"#f3f4f6","200":"#e5e7eb","300":"#d1d5db","400":"#9ca3af","500":"#6b7280","600":"#4b5563","700":"#374151","800":"#1f2937","900":"#111827","950":"#030712"}
                      }
                    }
                  }
                }
              </script>
              <style>
                body { background-color: #f9fafb; }
                .print\\:hidden { display: none !important; }
                @media print {
                  body { background-color: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; margin: 0; padding: 0;}
                  #document-view-content { page-break-inside: avoid; }
                }
              </style>
            </head>
            <body>
              ${printContents}
              <script type="text/javascript">
                setTimeout(() => {
                  window.print();
                  window.onafterprint = function() { window.close(); }
                }, 300);
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const handleExportDocuments = () => {
    if (user?.role === UserRole.STAFF) return; // Staff cannot export CSV
    const headerMapping = {
        docNumber: 'เลขที่เอกสาร',
        type: 'ประเภท',
        clientName: 'ชื่อลูกค้า',
        projectName: 'โครงการ',
        date: 'วันที่',
        amount: 'จำนวนเงิน',
        status: 'สถานะ',
        pdfUrl: 'ลิงก์ PDF',
    };
    const dataToExport = filteredDocuments.map(doc => ({
        docNumber: doc.docNumber,
        type: DOCUMENT_TYPES_TH[doc.type],
        clientName: doc.clientName,
        projectName: doc.projectName || '',
        date: new Date(doc.date).toLocaleDateString('th-TH'),
        amount: doc.amount || 0,
        status: DOCUMENT_STATUSES_TH[doc.status as keyof typeof DOCUMENT_STATUSES_TH] || doc.status,
        pdfUrl: doc.pdfUrl || '',
    }));
    exportToCsv(`${activeTab.toLowerCase()}_documents_data`, dataToExport, headerMapping);
  };


  const filteredDocuments = documents.filter(doc => doc.type === activeTab);
  const activeTabName = DOCUMENT_TYPES_TH[activeTab] || "เอกสาร";

  const docColumns = [
    { header: 'เลขที่เอกสาร', accessor: 'docNumber' },
    { header: 'ชื่อลูกค้า', accessor: 'clientName' },
    { header: 'โครงการ', accessor: 'projectName' },
    { header: 'วันที่', accessor: (item: Document) => new Date(item.date).toLocaleDateString('th-TH') },
    { header: 'จำนวนเงิน (บาท)', accessor: (item: Document) => item.amount ? `฿${item.amount.toFixed(2)}` : 'N/A', className: 'text-right' },
    { header: 'สถานะ', accessor: (item: Document) => <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ DOCUMENT_STATUSES_COLORS[item.status] || 'bg-gray-100 text-gray-800' }`}>{DOCUMENT_STATUSES_TH[item.status as keyof typeof DOCUMENT_STATUSES_TH] || item.status}</span>},
    { header: 'การดำเนินการ', accessor: (item: Document) => (
      <div className="space-x-1">
        <Button variant="ghost" size="sm" onClick={() => handleViewDocument(item)} title="ดูเอกสาร"><EyeIcon className="h-4 w-4 text-primary-600"/></Button>
        {user?.role !== UserRole.STAFF && (
          <>
            <Button variant="ghost" size="sm" onClick={() => handleOpenModal(item)} title="แก้ไขเอกสาร"><PencilIcon className="h-4 w-4"/></Button>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} title="ลบเอกสาร"><TrashIcon className="h-4 w-4 text-red-500"/></Button>
          </>
        )}
      </div>
    )},
  ];
  
  if (isLoading) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <Card>
        <div className="sm:flex sm:items-center sm:justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">จัดการ{activeTabName}</h2>
            <div className="mt-3 sm:mt-0 sm:ml-4 flex space-x-2">
                {user?.role !== UserRole.STAFF && (
                    <>
                        <Button onClick={handleExportDocuments} variant="secondary" leftIcon={<ArrowDownTrayIconDoc className="h-5 w-5"/>}>ส่งออก CSV ({activeTabName})</Button>
                        <Button onClick={() => handleOpenModal()} leftIcon={<PlusIcon className="h-5 w-5"/>}>
                            สร้าง{activeTabName}
                        </Button>
                    </>
                )}
            </div>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {DOCUMENT_TYPES_OPTIONS.map((docTypeOption) => (
              <button
                key={docTypeOption.value}
                onClick={() => setActiveTab(docTypeOption.value as DocumentType)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === docTypeOption.value
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {docTypeOption.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-6">
           <Table 
            columns={docColumns.map(col => ({
                ...col,
                accessor: typeof col.accessor === 'string' ? col.accessor as keyof Document : col.accessor as (item: Document) => React.ReactNode,
            }))} 
            data={filteredDocuments} 
            isLoading={isLoading}
            emptyMessage={`ไม่พบข้อมูล${activeTabName}`}
           />
        </div>
      </Card>

      {user?.role !== UserRole.STAFF && isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingDocId ? `แก้ไข${DOCUMENT_TYPES_TH[currentDocument.type]}` : `สร้าง${DOCUMENT_TYPES_TH[currentDocument.type]}ใหม่`} size="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="ประเภทเอกสาร" name="type" value={currentDocument.type} onChange={handleChange} options={DOCUMENT_TYPES_OPTIONS} required/>
              <Input label="ชื่อลูกค้า" name="clientName" value={currentDocument.clientName} onChange={handleChange} required />
              <Input label="ชื่อโครงการ (ถ้ามี)" name="projectName" value={currentDocument.projectName || ''} onChange={handleChange} />
              <Input label="วันที่" name="date" type="date" value={currentDocument.date.split('T')[0]} onChange={handleChange} required />
              { (currentDocument.type === DocumentType.INVOICE || currentDocument.type === DocumentType.QUOTATION) &&
                  <Input label="จำนวนเงิน (บาท)" name="amount" type="number" value={currentDocument.amount || 0} onChange={handleChange} step="0.01" min="0" />
              }
              <Select label="สถานะ" name="status" value={currentDocument.status} onChange={handleChange} options={DOCUMENT_STATUSES_OPTIONS} required />
          </div>
          <Textarea label="หมายเหตุ / เงื่อนไข (ถ้ามี)" name="notes" value={(currentDocument as any).notes || ''} onChange={handleChange} className="mt-4"/>

          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="secondary" onClick={handleCloseModal}>ยกเลิก</Button>
            <Button onClick={handleSubmit}>{editingDocId ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างเอกสาร'}</Button>
          </div>
        </Modal>
      )}

      {documentForView && (
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`ดูตัวอย่าง: ${DOCUMENT_TYPES_TH[documentForView.type]} #${documentForView.docNumber}`} size="xl">
            <DocumentView 
              document={documentForView}
              companyName={APP_NAME}
              companyAddress={COMPANY_ADDRESS_MOCK}
              companyLogoUrl={COMPANY_LOGO_URL_MOCK}
            />
            <div className="mt-6 flex justify-end space-x-2 print:hidden">
              <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>ปิด</Button>
              <Button onClick={handlePrintDocument}>พิมพ์</Button>
            </div>
        </Modal>
      )}
    </div>
  );
};
