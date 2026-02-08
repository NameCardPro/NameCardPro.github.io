
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BusinessCardData, ScanLog } from '../types';
import { ChevronLeft, Users, MousePointer2, Calendar, Clock, Globe, Languages } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useLanguage } from '../App';
import { translations } from '../translations';

interface Props {
  cards: BusinessCardData[];
  logs: ScanLog[];
}

const DashboardPage: React.FC<Props> = ({ cards, logs }) => {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const t = translations[lang];

  const logsByDate = logs.reduce((acc: any, log) => {
    const date = new Date(log.timestamp).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(logsByDate).map(date => ({ date, scans: logsByDate[date] }));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-10">
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => navigate('/')} className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft size={24} className="text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">{t.analytics}</h1>
          </div>
          <button 
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            className="flex items-center gap-1.5 text-gray-600 font-medium px-4 py-1.5 rounded-full border border-gray-200"
          >
            <Languages size={18} />
            {t.lang}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label={t.totalCards} value={cards.length} icon={<Users className="text-blue-500" />} />
          <StatCard label={t.totalScans} value={logs.length} icon={<MousePointer2 className="text-green-500" />} />
          <StatCard label={t.conversion} value="100%" icon={<Globe className="text-purple-500" />} />
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border">
          <h2 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Calendar size={20} className="text-blue-500" />
            {t.timeline}
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} tick={{fill: '#999'}} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{fill: '#999'}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="scans" stroke="#2563eb" strokeWidth={4} dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border overflow-hidden">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Clock size={20} className="text-orange-500" />
              {t.recentActivity}
            </h2>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {logs.slice().reverse().map(log => (
                <div key={log.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-blue-600">
                    <Globe size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-gray-800">
                      {cards.find(c => c.id === log.cardId)?.name || 'Deleted Card'}
                    </div>
                    <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-5">
    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center shadow-inner">
      {/* Fix: Cast icon to React.ReactElement<any> to allow the 'size' prop when cloning Lucide icons */}
      {React.cloneElement(icon as React.ReactElement<any>, { size: 28 })}
    </div>
    <div>
      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-2xl font-black text-gray-900 tracking-tight">{value}</div>
    </div>
  </div>
);

export default DashboardPage;
