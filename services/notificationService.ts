import { ChatMessage, PayrollRunStatus } from '../types';
import { getSetting, saveSetting } from './api';

// --- Chat Notification System (Local Dispatch) ---
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

  const systemMessage: ChatMessage = {
    id: `sysmsg-payroll-${Date.now()}`,
    roomId: 'general', // Or broadcast to all rooms
    senderId: 'system-payroll', 
    senderName: 'ระบบบัญชีเงินเดือน',
    timestamp,
    text: messageText,
  };
  dispatchChatNotification(systemMessage);
};

// --- Global Scrolling Announcement System (Using services/api.ts -> Supabase) ---
type AnnouncementListener = (announcement: string | null) => void;
const announcementListeners: AnnouncementListener[] = [];

export const getGlobalAnnouncement = async (): Promise<string | null> => {
  try {
    const value = await getSetting('global_announcement');
    // Set a default if null/undefined is returned from db for the first time
    return value !== null && value !== undefined ? value : "ยินดีต้อนรับสู่ Officemate Pro! ระบบเชื่อมต่อกับฐานข้อมูลแล้ว";
  } catch (error) {
    console.error("Failed to get global announcement:", error);
    return null;
  }
};

export const setGlobalAnnouncement = async (text: string | null): Promise<void> => {
  try {
    await saveSetting('global_announcement', text);
    announcementListeners.forEach(listener => listener(text));
  } catch(error) {
      console.error("Failed to set global announcement:", error);
  }
};

export const subscribeToGlobalAnnouncement = (listener: AnnouncementListener): (() => void) => {
  announcementListeners.push(listener);
  // Initial fetch
  getGlobalAnnouncement().then(value => listener(value));

  return () => {
    const index = announcementListeners.indexOf(listener);
    if (index > -1) {
      announcementListeners.splice(index, 1);
    }
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