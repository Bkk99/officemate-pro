
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { useAuth } from '../../contexts/AuthContext';
import { ChatMessage, ChatRoom, UserRole } from '../../types';
import { CHAT_ROOMS_SAMPLE, DEPARTMENTS, AI_ASSISTANT_ROOM_ID, SparklesIcon } from '../../constants';
import { addChatMessage, getChatMessages } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import { subscribeToChatNotifications, updateGlobalChatUnreadCount } from '../../services/notificationService';

// Icons
const PaperAirplaneIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.95.579h1.844a.75.75 0 00.659-.326l.291-.437A15.002 15.002 0 0110.5 7.5c.809 0 1.605.109 2.373.322l.29.437a.75.75 0 00.66.326h1.843a.75.75 0 00.95-.58l1.413-4.948a.75.75 0 00-.826-.95L10.5 6.434 3.105 2.289z" />
    <path d="M3.762 10.322a.75.75 0 00-.916.655l-.46 3.836a.75.75 0 00.93.817l3.937-1.077a.75.75 0 00.52-.52l1.077-3.937a.75.75 0 00-.818-.93l-3.835.46a.75.75 0 00-.656.916zM16.238 10.322a.75.75 0 00.916.655l.46 3.836a.75.75 0 00-.93.817l-3.937-1.077a.75.75 0 00-.52-.52l-1.077-3.937a.75.75 0 00.818-.93l3.835.46a.75.75 0 00.656.916z" />
  </svg>
);

const ChatBubbleLeftEllipsisIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props} >
    <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 011.75 16.521V8.25a5.25 5.25 0 015.25-5.25h7.5a5.25 5.25 0 015.25 5.25v8.271a6.707 6.707 0 01-3.054 5.123A5.98 5.98 0 0116.5 22.5H8.25a5.98 5.98 0 01-2.13-.398A6.723 6.723 0 014.804 21.644zM6 9a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75A.75.75 0 016 9zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H6.75z" clipRule="evenodd" />
  </svg>
);

const GroupChatIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.056 3 12s4.03 8.25 9 8.25Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.125 12.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.875 12.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" />
    </svg>
);

const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

const HR_ANNOUNCEMENT_ROOM_ID = CHAT_ROOMS_SAMPLE.find(r => r.name === 'ประกาศจากฝ่ายบุคคล')?.id || 'hr-announcements';
const AI_SENDER_ID = 'ai-assistant';

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [chatRooms] = useState<(typeof CHAT_ROOMS_SAMPLE)>(CHAT_ROOMS_SAMPLE); 
  const [activeRoomId, setActiveRoomId] = useState<string>(chatRooms[0].id);
  const [messages, setMessages] = useState<{ [roomId: string]: ChatMessage[] }>({});
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiChat, setAiChat] = useState<Chat | null>(null);

  const [unreadRoomIds, setUnreadRoomIds] = useState<Set<string>>(new Set());
  const [toastInfo, setToastInfo] = useState<{ message: string, roomId: string, roomName: string } | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const activeRoomName = chatRooms.find(r => r.id === activeRoomId)?.name || 'แชท';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeRoomId, isAiThinking]);

  useEffect(() => {
    if (toastInfo && toastTimeoutRef.current === null) {
      toastTimeoutRef.current = window.setTimeout(() => {
        setToastInfo(null);
        toastTimeoutRef.current = null;
      }, 5000); 
    }
    return () => { 
        if(toastTimeoutRef.current !== null) {
            clearTimeout(toastTimeoutRef.current);
            toastTimeoutRef.current = null;
        }
    };
  }, [toastInfo]);
  
  const mapMessagesToGeminiHistory = (msgs: ChatMessage[]) => {
    return msgs.map(msg => ({
        role: msg.senderId === AI_SENDER_ID ? 'model' : 'user',
        parts: [{ text: msg.text || '' }]
    })).filter(msg => msg.parts[0].text.trim() !== '');
  };
  
  const fetchMessagesForRoom = async (roomId: string) => {
    const fetchedMessages = await getChatMessages(roomId);
    setMessages(prev => ({...prev, [roomId]: fetchedMessages}));
  }

  useEffect(() => {
    if (!messages[activeRoomId]) {
      fetchMessagesForRoom(activeRoomId);
    }
  }, [activeRoomId, messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    const userMessageText = newMessage.trim();
    
    const message: Omit<ChatMessage, 'id'> = {
      roomId: activeRoomId,
      senderId: user.id,
      senderName: user.name,
      timestamp: new Date().toISOString(),
      text: userMessageText,
    };
    
    setNewMessage('');
    const sentMessage = await addChatMessage(message);
    setMessages(prev => ({...prev, [activeRoomId]: [...(prev[activeRoomId] || []), sentMessage]}));

    if (activeRoomId === AI_ASSISTANT_ROOM_ID && aiChat) {
      setIsAiThinking(true);
      try {
        const result = await aiChat.sendMessageStream({ message: userMessageText });
        let aiResponseText = '';
        let aiMessage: ChatMessage | null = null;

        for await (const chunk of result) {
            aiResponseText += chunk.text;
            if (!aiMessage) {
                const newAiMessage: Omit<ChatMessage, 'id'> = {
                    roomId: AI_ASSISTANT_ROOM_ID,
                    senderId: AI_SENDER_ID,
                    senderName: 'AI Assistant',
                    timestamp: new Date().toISOString(),
                    text: aiResponseText,
                };
                // Temporarily add to state for UI update
                 aiMessage = { ...newAiMessage, id: `temp-ai-${Date.now()}`};
                setMessages(prev => ({...prev, [activeRoomId]: [...(prev[activeRoomId] || []), aiMessage as ChatMessage] }));
            } else {
                 setMessages(prev => {
                    const roomMessages = prev[activeRoomId] || [];
                    return {...prev, [activeRoomId]: roomMessages.map(m => m.id === aiMessage?.id ? {...m, text: aiResponseText} : m)}
                });
            }
        }
        if(aiMessage) {
           // Replace temp message with final one from DB
           const { id: tempId, ...messageToSave } = aiMessage;
           const finalAiMessage = await addChatMessage(messageToSave);
           setMessages(prev => ({...prev, [activeRoomId]: prev[activeRoomId].map(m => m.id === aiMessage!.id ? finalAiMessage : m)}));
        }
      } catch (error) {
        console.error("Gemini API error:", error);
        const errorMsg = {
          roomId: AI_ASSISTANT_ROOM_ID, senderId: AI_SENDER_ID, senderName: 'AI Assistant',
          timestamp: new Date().toISOString(), text: 'ขออภัยค่ะ เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI กรุณาลองใหม่อีกครั้ง'
        };
        const finalErrorMsg = await addChatMessage(errorMsg);
        setMessages(prev => ({...prev, [activeRoomId]: [...(prev[activeRoomId] || []), finalErrorMsg]}));
      } finally {
        setIsAiThinking(false);
      }
    }
  };

  const handleRoomSelect = (roomId: string) => {
    setActiveRoomId(roomId);
    if (roomId === AI_ASSISTANT_ROOM_ID && !aiChat && process.env.API_KEY) {
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const currentHistory = messages[roomId] || [];
            const geminiHistory = mapMessagesToGeminiHistory(currentHistory);
            const chat = ai.chats.create({
                model: 'gemini-2.5-flash-preview-04-17',
                history: geminiHistory,
                config: {
                    systemInstruction: "You are a helpful office assistant for a company called 'Officemate Pro'. Be friendly, concise, and professional. Answer questions related to general office tasks, productivity, and professional communication in Thai or English as the user prefers."
                }
            });
            setAiChat(chat);
        } catch (e) {
            console.error("Failed to initialize Gemini AI Chat:", e);
            const errorMsg = { roomId, senderId: AI_SENDER_ID, senderName: 'AI Assistant', text: 'ไม่สามารถเริ่มต้นเซสชันกับ AI ได้ กรุณาตรวจสอบการตั้งค่า API Key', timestamp: new Date().toISOString() };
            addChatMessage(errorMsg).then(finalMsg => setMessages(prev => ({...prev, [roomId]: [...(prev[roomId] || []), finalMsg] })));
        }
    }
    setUnreadRoomIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(roomId);
        return newSet;
    });
    setToastInfo(null); 
    if(toastTimeoutRef.current !== null) {
        clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (activeRoomId === AI_ASSISTANT_ROOM_ID) {
      handleRoomSelect(AI_ASSISTANT_ROOM_ID);
    }
  }, []);

  const handleToastClick = (roomId: string) => {
    handleRoomSelect(roomId);
  };


  if (!user) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)] relative">
        {toastInfo && (
            <div 
                className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-2 w-auto max-w-md z-50 p-3 bg-primary-600 text-white rounded-md shadow-lg cursor-pointer hover:bg-primary-700 transition-colors"
                onClick={() => handleToastClick(toastInfo.roomId)}
                role="alert"
                aria-live="assertive"
            >
                <div className="flex items-center justify-between">
                    <span className="text-sm">{toastInfo.message}</span>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setToastInfo(null); if(toastTimeoutRef.current !== null) clearTimeout(toastTimeoutRef.current); toastTimeoutRef.current = null;}} 
                        className="ml-2 text-primary-200 hover:text-white"
                        aria-label="ปิดการแจ้งเตือน"
                    >
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>
        )}

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/3 md:w-1/4 bg-secondary-50 border-r border-secondary-200 p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold text-secondary-700 mb-4">ห้องสนทนา</h2>
          <ul className="space-y-1">
            {chatRooms.map((room) => {
              const Icon = room.icon || ChatBubbleLeftEllipsisIcon;
              return (
              <li key={room.id}>
                <button
                  onClick={() => handleRoomSelect(room.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center justify-between ${
                    activeRoomId === room.id ? 'bg-primary-200 text-primary-700' : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <Icon className={`h-5 w-5 flex-shrink-0 ${room.id === AI_ASSISTANT_ROOM_ID ? 'text-purple-500' : ''}`} />
                    <span className="truncate">{room.name}</span>
                  </div>
                  {unreadRoomIds.has(room.id) && (
                    <span className="h-2.5 w-2.5 bg-red-500 rounded-full flex-shrink-0" title="ข้อความใหม่"></span>
                  )}
                </button>
              </li>
            )})}
          </ul>
        </div>

        <div className="flex-1 flex flex-col bg-white">
          <header className="bg-white border-b border-gray-200 p-4">
            <h2 className="text-xl font-semibold text-gray-800">{activeRoomName}</h2>
          </header>

          {(messages[activeRoomId] || []).length > 0 || (isAiThinking && activeRoomId === AI_ASSISTANT_ROOM_ID) ? (
            <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-gray-50">
                {(messages[activeRoomId] || []).map((msg) => {
                    const isUser = msg.senderId === user.id;
                    const isAi = msg.senderId === AI_SENDER_ID;
                    const isSystem = msg.senderId.startsWith('system-');
                    return (
                        <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${
                                isUser ? 'bg-primary-500 text-white' :
                                isAi ? 'bg-purple-100 text-purple-800' :
                                isSystem ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                                'bg-secondary-200 text-secondary-800'
                            }`}>
                            {(!isUser) && <p className="text-xs font-semibold mb-0.5">{msg.senderName}</p> }
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            <p className={`text-xs mt-1 ${
                                isUser ? 'text-primary-200' : 
                                isAi ? 'text-purple-600' :
                                isSystem ? 'text-blue-600' : 'text-secondary-500'
                                } text-right`}>
                                {new Date(msg.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            </div>
                        </div>
                    )
                })}
                {isAiThinking && activeRoomId === AI_ASSISTANT_ROOM_ID && (
                    <div className="flex justify-start">
                        <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow bg-purple-100 text-purple-800">
                            <p className="text-xs font-semibold mb-0.5">AI Assistant</p>
                            <div className="flex items-center space-x-1.5 py-1.5">
                                <span className="h-2 w-2 bg-purple-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-purple-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-purple-400 rounded-full animate-pulse"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-primary-50">
                <GroupChatIcon className="w-20 h-20 text-primary-400 mb-6" />
                <h3 className="text-xl font-semibold text-primary-600 mb-2">แชทภายในองค์กร</h3>
                <p className="text-secondary-500">เลือกห้องสนทนาจากด้านซ้าย หรือเริ่มการสนทนาใหม่</p>
            </div>
          )}

          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={activeRoomId === AI_ASSISTANT_ROOM_ID ? 'สอบถาม AI Assistant...' : `ข้อความถึง #${activeRoomName}...`}
                rows={1}
                className="flex-1 resize-none !mb-0"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                aria-label={`พิมพ์ข้อความในห้อง ${activeRoomName}`}
                disabled={isAiThinking && activeRoomId === AI_ASSISTANT_ROOM_ID}
              />
              <Button onClick={handleSendMessage} disabled={!newMessage.trim() || (isAiThinking && activeRoomId === AI_ASSISTANT_ROOM_ID)} aria-label="ส่งข้อความ">
                <PaperAirplaneIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
