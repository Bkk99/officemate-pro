import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

// Information icon
const InformationCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
);

// Wrench icon
const WrenchScrewdriverIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-4.243-4.243l3.275-3.275a4.5 4.5 0 00-6.336 4.486c.046.58.297 1.193.766 1.743l-2.496 3.03" />
    </svg>
);

const ClipboardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
    </svg>
);


export const UserManagementPage: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const sqlFunction = `
create or replace function get_my_claim(claim text) returns jsonb as $$
  select coalesce(
    current_setting('request.jwt.claims', true)::jsonb ->> claim,
    (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata') ->> claim
  )::jsonb
$$ language sql stable;
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlFunction);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
          <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-800 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <InformationCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-bold">เกิดข้อผิดพลาดในการเข้าถึงข้อมูลผู้ใช้</h3>
                <div className="mt-2 text-md">
                  <p>ระบบไม่สามารถแสดงรายชื่อผู้ใช้งานได้เนื่องจากมีข้อผิดพลาดที่ฐานข้อมูล: <code className="bg-red-100 p-1 rounded-sm text-sm font-semibold">function get_my_claim(text) does not exist</code>.</p>
                  <p className="mt-1">ข้อผิดพลาดนี้มักเกิดจากการตั้งค่านโยบายความปลอดภัยระดับแถว (RLS) ในตาราง <code className="bg-red-100 p-1 rounded-sm text-sm">profiles</code> ที่อ้างอิงถึงฟังก์ชันที่ไม่มีอยู่จริง</p>
                </div>
              </div>
            </div>
          </div>
      </Card>
      
      <Card title="วิธีการแก้ไข">
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <WrenchScrewdriverIcon className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4 flex-grow">
                    <p className="text-lg font-semibold text-gray-800">เพิ่มฟังก์ชัน SQL ที่ขาดหายไป</p>
                    <p className="text-sm text-gray-600 mt-1">
                        เพื่อแก้ไขปัญหานี้ คุณต้องเพิ่มฟังก์ชัน SQL ที่จำเป็นลงในฐานข้อมูล Supabase ของคุณ
                    </p>
                    <ol className="list-decimal list-inside text-sm mt-3 space-y-2">
                        <li>ไปที่ <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-primary-600 font-semibold hover:underline">Supabase project dashboard</a> ของคุณ</li>
                        <li>ไปที่ส่วน "SQL Editor" ในเมนูด้านซ้าย</li>
                        <li>คลิก "New query" หรือ "+ New query"</li>
                        <li>คัดลอกโค้ด SQL ด้านล่างนี้และวางลงใน editor</li>
                        <li>กดปุ่ม "Run" เพื่อสร้างฟังก์ชัน</li>
                    </ol>
                    <div className="mt-4 p-3 bg-secondary-800 text-secondary-100 rounded-md font-mono text-xs overflow-x-auto relative">
                        <Button
                            variant="secondary"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={handleCopy}
                            leftIcon={<ClipboardIcon className="h-4 w-4" />}
                        >
                            {copied ? 'คัดลอกแล้ว!' : 'คัดลอก'}
                        </Button>
                        <pre><code>{sqlFunction}</code></pre>
                    </div>
                     <p className="text-sm text-gray-600 mt-3">
                        หลังจาก run script นี้แล้ว, รีเฟรชหน้านี้เพื่อลองอีกครั้ง หน้านี้อาจจะยังไม่แสดงตารางผู้ใช้ (เนื่องจากเราได้ทำการแก้ไขแอปเพื่อเลี่ยงปัญหา) แต่แอปพลิเคชันส่วนอื่นๆ ที่เคยมีปัญหาควรจะทำงานได้ตามปกติแล้ว
                    </p>
                </div>
            </div>
        </Card>
    </div>
  );
};
