
import React, { useState, useEffect, useCallback } from 'react';
import { CalendarEvent, User } from '../../types';
import { MOCK_CALENDAR_EVENTS, MOCK_USERS, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from '../../services/mockData';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner } from '../../components/ui/Spinner';

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

const initialEventState: Omit<CalendarEvent, 'id'> = {
  title: '', start: new Date().toISOString().slice(0,16), end: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0,16), attendees: [], description: '', isAllDay: false
};

export const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [users, setUsers] = useState<User[]>(MOCK_USERS); 
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Omit<CalendarEvent, 'id'> | CalendarEvent>(initialEventState);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    setEvents(MOCK_CALENDAR_EVENTS);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleOpenModal = (event?: CalendarEvent) => {
    if (event) {
      setCurrentEvent({...event, start: event.start.slice(0,16), end: event.end.slice(0,16) });
      setEditingEventId(event.id);
    } else {
      const defaultStartTime = new Date();
      defaultStartTime.setMinutes(Math.ceil(defaultStartTime.getMinutes() / 30) * 30); 
      const defaultEndTime = new Date(defaultStartTime.getTime() + 60 * 60 * 1000); 
      
      setCurrentEvent({...initialEventState, start: defaultStartTime.toISOString().slice(0,16), end: defaultEndTime.toISOString().slice(0,16), attendees: user ? [{employeeId: user.id, employeeName: user.name}] : [] });
      setEditingEventId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentEvent(initialEventState);
    setEditingEventId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (e.target instanceof HTMLInputElement && e.target.type === 'checkbox') {
      const checkedValue = e.target.checked; // Store in variable before using in callback
      setCurrentEvent(prev => ({ ...prev, [name]: checkedValue }));
    } else {
      setCurrentEvent(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleAttendeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
    const selectedAttendees = users.filter(u => selectedIds.includes(u.id)).map(u => ({ employeeId: u.id, employeeName: u.name }));
    setCurrentEvent(prev => ({ ...prev, attendees: selectedAttendees }));
  };

  const handleSubmit = async () => {
    const eventData: CalendarEvent = {
        ...(currentEvent as CalendarEvent), 
        id: editingEventId || `evt${Date.now()}`, 
        start: new Date(currentEvent.start).toISOString(),
        end: new Date(currentEvent.end).toISOString(),
    };

    if (editingEventId) {
      updateCalendarEvent(eventData);
    } else {
      addCalendarEvent(eventData as Omit<CalendarEvent, 'id'>); 
    }
    await fetchEvents();
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบกิจกรรมนี้?')) {
      deleteCalendarEvent(id);
      await fetchEvents();
    }
  };
  
  const sortedEvents = [...events].sort((a,b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  if (isLoading) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <Card 
        title="ปฏิทินองค์กรและงานที่ต้องทำ"
        actions={<Button onClick={() => handleOpenModal()} leftIcon={<PlusIcon className="h-5 w-5"/>}>เพิ่มกิจกรรม/งาน</Button>}
      >
        {sortedEvents.length === 0 && !isLoading && (
            <p className="text-gray-500 text-center py-4">ไม่พบกิจกรรมหรืองานที่กำหนดไว้</p>
        )}
        <div className="space-y-4">
            {sortedEvents.map(event => (
                <div key={event.id} className="bg-secondary-50 p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-semibold text-primary-700">{event.title}</h3>
                            <p className="text-sm text-gray-600">
                                {new Date(event.start).toLocaleString('th-TH', {dateStyle: 'medium', timeStyle: 'short'})} - 
                                {new Date(event.end).toLocaleString('th-TH', {timeStyle: 'short'})}
                                {event.isAllDay && " (ทั้งวัน)"}
                            </p>
                            {event.description && <p className="text-sm text-gray-500 mt-1">{event.description}</p>}
                            {event.attendees.length > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                    ผู้เข้าร่วม: {event.attendees.map(a => a.employeeName).join(', ')}
                                </p>
                            )}
                        </div>
                        <div className="flex space-x-2 flex-shrink-0">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenModal(event)} title="แก้ไข"><PencilIcon className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(event.id)} title="ลบ"><TrashIcon className="h-4 w-4 text-red-500"/></Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingEventId ? 'แก้ไขกิจกรรม/งาน' : 'เพิ่มกิจกรรม/งานใหม่'} size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="ชื่อกิจกรรม/งาน" name="title" value={currentEvent.title} onChange={handleChange} required wrapperClassName="md:col-span-2"/>
            <Input label="เวลาเริ่มต้น" name="start" type="datetime-local" value={currentEvent.start} onChange={handleChange} required />
            <Input label="เวลาสิ้นสุด" name="end" type="datetime-local" value={currentEvent.end} onChange={handleChange} required />
        </div>
        <div className="mt-4">
            <label htmlFor="isAllDay" className="flex items-center">
                <input type="checkbox" id="isAllDay" name="isAllDay" checked={currentEvent.isAllDay || false} onChange={handleChange} className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                <span className="ml-2 text-sm text-gray-700">กิจกรรมทั้งวัน</span>
            </label>
        </div>
        <div className="mt-4">
            <label htmlFor="attendees" className="block text-sm font-medium text-gray-700 mb-1">ผู้เข้าร่วม</label>
            <select 
                id="attendees" 
                name="attendees" 
                multiple 
                value={currentEvent.attendees.map(a => a.employeeId)} 
                onChange={handleAttendeeChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md h-32"
            >
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
        </div>
        <Textarea label="คำอธิบาย (ถ้ามี)" name="description" value={currentEvent.description || ''} onChange={handleChange} className="mt-4"/>
        
        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="secondary" onClick={handleCloseModal}>ยกเลิก</Button>
          <Button onClick={handleSubmit}>{editingEventId ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มกิจกรรม'}</Button>
        </div>
      </Modal>
    </div>
  );
};
