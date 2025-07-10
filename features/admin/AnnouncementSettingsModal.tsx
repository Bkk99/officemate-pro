import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import { AnnouncementSettingsModalProps }
from '../../types';
import { getGlobalAnnouncement, setGlobalAnnouncement } from '../../services/notificationService';

export const AnnouncementSettingsModal: React.FC<AnnouncementSettingsModalProps> = ({ isOpen, onClose }) => {
  const [announcementText, setAnnouncementText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const currentAnnouncement = getGlobalAnnouncement();
      setAnnouncementText(currentAnnouncement || '');
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    setGlobalAnnouncement(announcementText.trim() === '' ? null : announcementText.trim());
    onClose();
  };

  const handleClear = () => {
    setGlobalAnnouncement(null);
    setAnnouncementText('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ตั้งค่าประกาศส่วนหัวแบบเลื่อน">
      {isLoading ? (
        <p>กำลังโหลด...</p>
      ) : (
        <>
          <Textarea
            label="ข้อความประกาศ"
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            placeholder="พิมพ์ข้อความประกาศที่นี่..."
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            หากปล่อยว่างและบันทึก หรือกด "ล้างประกาศ" แถบประกาศจะถูกซ่อน
          </p>
        </>
      )}
      <div className="mt-6 flex justify-end space-x-2">
        <Button variant="danger" onClick={handleClear} disabled={isLoading}>
          ล้างประกาศ
        </Button>
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          ยกเลิก
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          บันทึกประกาศ
        </Button>
      </div>
    </Modal>
  );
};
