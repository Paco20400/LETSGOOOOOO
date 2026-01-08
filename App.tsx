
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from './firebase';
import { TabType } from './types';
import SchedulePage from './pages/SchedulePage';
import BookingsPage from './pages/BookingsPage';
import ExpensePage from './pages/ExpensePage';
import JournalPage from './pages/JournalPage';
import PlanningPage from './pages/PlanningPage';
import MembersPage from './pages/MembersPage';

interface WeatherData {
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy' | 'clear';
  temp: number;
  city: string;
}

const SETTINGS_DOC_ID = 'trip_settings';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('schedule');
  const [tripTitle, setTripTitle] = useState('載入中...');
  const [startDate, setStartDate] = useState('2024-12-20');
  const [endDate, setEndDate] = useState('2024-12-24');
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  
  // 天氣狀態
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  
  const titleInputRef = useRef<HTMLInputElement>(null);

  // 1. 【核心優化】即時同步旅程設定 (標題與日期)
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', SETTINGS_DOC_ID), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setTripTitle(data.tripTitle || '未命名冒險');
        setStartDate(data.startDate || '2024-12-20');
        setEndDate(data.endDate || '2024-12-24');
      } else {
        // 如果還沒有設定，建立一個初始值
        setDoc(doc(db, 'settings', SETTINGS_DOC_ID), {
          tripTitle: '北海道冬之夢',
          startDate: '2024-12-20',
          endDate: '2024-12-24'
        });
      }
      setIsSyncing(false);
    });
    return () => unsub();
  }, []);

  // 格式化日期顯示
  const formatDate = (dateStr: string) => dateStr.replace(/-/g, '.');

  // 計算總天數
  const calculateTotalDays = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
    const diffTime = Math.abs(e.getTime() - s.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 0;
  };

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // 獲取地理位置與天氣
  useEffect(() => {
    const fetchRealWeather = async (lat: number, lon: number) => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Based on the current real-time data for coordinates (${lat}, ${lon}), what is the current weather? 
        Return ONLY a JSON object with this exact structure: 
        {"condition": "sunny"|"cloudy"|"rainy"|"snowy"|"stormy"|"clear", "temp": number, "city": "string"}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                condition: { type: Type.STRING, enum: ['sunny', 'cloudy', 'rainy', 'snowy', 'stormy', 'clear'] },
                temp: { type: Type.NUMBER },
                city: { type: Type.STRING }
              },
              required: ["condition", "temp", "city"]
            }
          },
        });

        const data = JSON.parse(response.text || '{}');
        setWeather(data);
      } catch (error) {
        console.error("Failed to fetch weather:", error);
        setWeather({ condition: 'sunny', temp: 24, city: 'Taipei' });
      } finally {
        setWeatherLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchRealWeather(position.coords.latitude, position.coords.longitude);
        },
        () => {
          fetchRealWeather(25.033, 121.565); 
        }
      );
    } else {
      setWeatherLoading(false);
    }
  }, []);

  const handleTitleSubmit = async () => {
    const newTitle = tripTitle.trim() === '' ? '未命名冒險' : tripTitle;
    setTripTitle(newTitle);
    setIsEditingTitle(false);
    try {
      await updateDoc(doc(db, 'settings', SETTINGS_DOC_ID), { tripTitle: newTitle });
    } catch (e) {
      console.error("Sync Title Error:", e);
    }
  };

  const handleDatesSubmit = async () => {
    setIsEditingDates(false);
    try {
      await updateDoc(doc(db, 'settings', SETTINGS_DOC_ID), { 
        startDate, 
        endDate 
      });
    } catch (e) {
      console.error("Sync Dates Error:", e);
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return 'fa-sun text-yellow-500';
      case 'clear': return 'fa-moon text-indigo-400';
      case 'cloudy': return 'fa-cloud text-gray-400';
      case 'rainy': return 'fa-cloud-showers-heavy text-blue-400';
      case 'snowy': return 'fa-snowflake text-blue-200';
      case 'stormy': return 'fa-bolt text-yellow-600';
      default: return 'fa-cloud-sun text-island-accent';
    }
  };

  const renderContent = () => {
    if (isSyncing) return (
      <div className="flex flex-col items-center justify-center py-32 opacity-20">
        <i className="fa-solid fa-cloud fa-fade text-4xl mb-4"></i>
        <span className="text-[10px] font-black tracking-widest">CONNECTING CLOUD...</span>
      </div>
    );

    switch (activeTab) {
      case 'schedule': return <SchedulePage startDate={startDate} endDate={endDate} />;
      case 'bookings': return <BookingsPage />;
      case 'expense': return <ExpensePage />;
      case 'journal': return <JournalPage />;
      case 'planning': return <PlanningPage />;
      case 'members': return <MembersPage />;
      default: return <SchedulePage startDate={startDate} endDate={endDate} />;
    }
  };

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto relative flex flex-col">
      {/* Header */}
      <header className="pt-12 px-6 pb-2 sticky top-0 z-40 bg-island-bg/80 backdrop-blur-md">
        <div className="flex justify-between items-start">
          <div className="flex-1 mr-4">
            {/* 標題編輯區域 */}
            {isEditingTitle ? (
              <div className="animate-in zoom-in-95 duration-200">
                <input
                  ref={titleInputRef}
                  type="text"
                  value={tripTitle}
                  onChange={(e) => setTripTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                  className="text-2xl font-bold text-island-brown bg-white/50 border-b-2 border-dashed border-island-green w-full px-1 py-0 focus:outline-none rounded-t-lg transition-all"
                />
              </div>
            ) : (
              <div 
                className="group cursor-pointer"
                onClick={() => setIsEditingTitle(true)}
              >
                <h1 className="text-2xl font-black text-island-brown flex items-center gap-2 group-hover:text-island-green transition-colors tracking-tight">
                  <span className="text-island-green shrink-0">
                    <i className={`fa-solid ${isSyncing ? 'fa-circle-notch fa-spin' : 'fa-leaf'}`}></i>
                  </span>
                  <span className="truncate">{tripTitle}</span>
                  <i className="fa-solid fa-pen text-[10px] opacity-0 group-hover:opacity-30 transition-opacity"></i>
                </h1>
              </div>
            )}

            {/* 日期編輯區域 */}
            <div className="mt-1">
              {isEditingDates ? (
                <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-200" onBlur={handleDatesSubmit}>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="text-[10px] font-bold bg-white border border-island-sage/30 rounded-md p-1 outline-none"
                  />
                  <span className="text-island-brown/40 text-xs">~</span>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="text-[10px] font-bold bg-white border border-island-sage/30 rounded-md p-1 outline-none"
                  />
                  <button onClick={handleDatesSubmit} className="text-island-green">
                    <i className="fa-solid fa-circle-check text-sm"></i>
                  </button>
                </div>
              ) : (
                <div 
                  className="inline-flex items-center gap-2 cursor-pointer group hover:bg-island-sage/10 px-1 rounded transition-colors"
                  onClick={() => setIsEditingDates(true)}
                >
                  <div className="flex items-center">
                    <p className="text-sm font-bold text-island-brown/50 border-b border-dotted border-island-brown/20 group-hover:border-island-green group-hover:text-island-green transition-all">
                      {formatDate(startDate)} - {formatDate(endDate)}
                    </p>
                    <span className="ml-2 bg-island-green/10 text-island-green text-[9px] font-black px-2 py-0.5 rounded-full border border-island-green/20">
                      {calculateTotalDays(startDate, endDate)}日冒險
                    </span>
                  </div>
                  <i className="fa-solid fa-calendar text-[10px] opacity-0 group-hover:opacity-40 transition-opacity"></i>
                </div>
              )}
            </div>
          </div>
          
          {/* 天氣卡片 */}
          <div className="bg-white/95 p-2.5 rounded-2xl shadow-soft-block border border-island-sage/30 flex flex-col items-center justify-center min-w-[64px] hover:rotate-2 transition-all">
            {weatherLoading ? (
              <i className="fa-solid fa-circle-notch fa-spin text-island-sage text-lg"></i>
            ) : weather ? (
              <>
                <i className={`fa-solid ${getWeatherIcon(weather.condition)} text-xl mb-1`}></i>
                <div className="text-[10px] font-black text-island-brown">{weather.temp}°C</div>
                <div className="text-[8px] font-bold text-island-brown/30 truncate max-w-[50px] uppercase tracking-tighter">{weather.city}</div>
              </>
            ) : (
              <i className="fa-solid fa-cloud-sun text-island-accent text-lg"></i>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden px-4 pt-2">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-4 right-4 max-w-[calc(theme(maxWidth.md)-32px)] mx-auto z-50">
        <div className="bg-white/90 backdrop-blur-lg rounded-[32px] shadow-[0_15px_35px_-10px_rgba(0,0,0,0.1)] border border-white/60 px-4 py-3 flex justify-between items-center">
          <NavItem 
            icon="fa-calendar-check" 
            active={activeTab === 'schedule'} 
            onClick={() => setActiveTab('schedule')} 
            label="行程"
          />
          <NavItem 
            icon="fa-ticket-simple" 
            active={activeTab === 'bookings'} 
            onClick={() => setActiveTab('bookings')} 
            label="預訂"
          />
          <NavItem 
            icon="fa-receipt" 
            active={activeTab === 'expense'} 
            onClick={() => setActiveTab('expense')} 
            label="記帳"
          />
          <NavItem 
            icon="fa-images" 
            active={activeTab === 'journal'} 
            onClick={() => setActiveTab('journal')} 
            label="日誌"
          />
          <NavItem 
            icon="fa-check-double" 
            active={activeTab === 'planning'} 
            onClick={() => setActiveTab('planning')} 
            label="準備"
          />
          <NavItem 
            icon="fa-user-group" 
            active={activeTab === 'members'} 
            onClick={() => setActiveTab('members')} 
            label="成員"
          />
        </div>
      </nav>
    </div>
  );
};

interface NavItemProps {
  icon: string;
  active: boolean;
  onClick: () => void;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, active, onClick, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${active ? 'text-island-green scale-105' : 'text-island-brown/30'}`}
  >
    <div className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${active ? 'bg-island-green/10 shadow-inner' : 'hover:bg-island-bg'}`}>
      <i className={`fa-solid ${icon} text-lg`}></i>
    </div>
    <span className={`text-[10px] font-black transition-opacity ${active ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
  </button>
);

export default App;
