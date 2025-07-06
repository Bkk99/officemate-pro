import { ChatMessage, PayrollRunStatus } from '../types';
import { CHAT_ROOMS_SAMPLE } from '../constants'; // To know all room IDs

// --- Chat Notification System ---
type ChatNotificationListener = (message: ChatMessage) => void;
const chatListeners: ChatNotificationListener[] = [];

export const subscribeToChatNotifications = (listener: ChatNotificationListener): (() => void) => {
  chatListeners.push(listener);
  return () => { // Unsubscribe function
    const index = chatListeners.indexOf(listener);
    if (index > -1) {
      chatListeners.splice(index, 1);
    }
  };
};

export const dispatchChatNotification = (message: ChatMessage): void => {
  chatListeners.forEach(listener => listener(message));
};

export const dispatchPayrollStatusNotification = (runPeriod: string, status: PayrollRunStatus): void => {
  const timestamp = new Date().toISOString();
  let messageText = '';

  if (status === PayrollRunStatus.APPROVED) {
    messageText = `ระบบบัญชีเงินเดือน: รอบการจ่ายเงินเดือน ${runPeriod} ได้รับการอนุมัติแล้ว`;
  } else if (status === PayrollRunStatus.PAID) {
    messageText = `ระบบบัญชีเงินเดือน: รอบการจ่ายเงินเดือน ${runPeriod} ได้ทำการจ่ายแล้ว`;
  } else {
    return; 
  }

  CHAT_ROOMS_SAMPLE.forEach(room => {
    const systemMessage: ChatMessage = {
      id: `sysmsg-payroll-${room.id}-${Date.now()}`,
      roomId: room.id,
      senderId: 'system-payroll', 
      senderName: 'ระบบบัญชีเงินเดือน',
      timestamp,
      text: messageText,
    };
    dispatchChatNotification(systemMessage);
  });
};

// --- Global Scrolling Announcement System ---
let currentGlobalAnnouncement: string | null = localStorage.getItem('officemate-global-announcement');
type AnnouncementListener = (announcement: string | null) => void;
const announcementListeners: AnnouncementListener[] = [];

export const getGlobalAnnouncement = (): string | null => {
  return localStorage.getItem('officemate-global-announcement');
};

export const setGlobalAnnouncement = (text: string | null): void => {
  currentGlobalAnnouncement = text; 
  if (text === null || text.trim() === "") {
    localStorage.removeItem('officemate-global-announcement');
    currentGlobalAnnouncement = null; 
  } else {
    localStorage.setItem('officemate-global-announcement', text);
  }
  announcementListeners.forEach(listener => listener(currentGlobalAnnouncement));
};

export const subscribeToGlobalAnnouncement = (listener: AnnouncementListener): (() => void) => {
  announcementListeners.push(listener);
  listener(localStorage.getItem('officemate-global-announcement'));
  
  const storageEventListener = (event: StorageEvent) => {
    if (event.key === 'officemate-global-announcement') {
      const newValue = event.newValue;
      currentGlobalAnnouncement = newValue; 
      listener(newValue);
    }
  };
  window.addEventListener('storage', storageEventListener);

  return () => {
    const index = announcementListeners.indexOf(listener);
    if (index > -1) {
      announcementListeners.splice(index, 1);
    }
    window.removeEventListener('storage', storageEventListener);
  };
};

// --- Global Chat Unread Count System ---
let globalChatUnreadCount = 0;
type GlobalChatUnreadCountListener = (count: number) => void;
const globalChatUnreadCountListeners: GlobalChatUnreadCountListener[] = [];

export const updateGlobalChatUnreadCount = (count: number): void => {
  globalChatUnreadCount = count;
  globalChatUnreadCountListeners.forEach(listener => listener(globalChatUnreadCount));
};

export const subscribeToGlobalChatUnreadCount = (listener: GlobalChatUnreadCountListener): (() => void) => {
  globalChatUnreadCountListeners.push(listener);
  // Immediately notify with current value
  listener(globalChatUnreadCount);
  
  return () => {
    const index = globalChatUnreadCountListeners.indexOf(listener);
    if (index > -1) {
      globalChatUnreadCountListeners.splice(index, 1);
    }
  };
};
