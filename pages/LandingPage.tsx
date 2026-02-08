
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BusinessCardData } from '../types';
import { downloadVCard } from '../components/VCardGenerator';
import { ChevronLeft, User, AlertCircle } from 'lucide-react';
import { useLanguage } from '../App';
import { translations } from '../translations';

interface Props {
  cards: BusinessCardData[];
  onLog: (log: any) => void;
}

const LandingPage: React.FC<Props> = ({ cards, onLog }) => {
  const { lang } = useLanguage();
  const t = translations[lang];
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const [card, setCard] = useState<BusinessCardData | null>(null);
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    const foundCard = cards.find(c => c.id === cardId);
    if (foundCard) {
      setCard(foundCard);
      onLog({
        id: Math.random().toString(36).substr(2, 9),
        cardId: foundCard.id,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      });
    } else if (cardId === 'preview') {
      setCard({
        id: 'preview',
        name: '曹洌',
        company: '中国银行股份有限公司上海市分行',
        department: '金融市场部',
        title: '金融市场部总经理',
        mobile: '13701866709',
        workPhone: '021-50375208',
        email: 'cliejrscb_sh@bank-of-china.com',
        postcode: '200120',
        address: '上海浦东新区银城中路200号中银大厦1401室',
        website: 'www.boc.cn',
      });
    }
  }, [cardId, cards, onLog]);

  const handleSave = () => {
    if (card) {
      downloadVCard(card);
      const isWechat = /MicroMessenger/i.test(navigator.userAgent);
      if (isWechat) {
        setShowTip(true);
        setTimeout(() => setShowTip(false), 5000);
      }
    }
  };

  if (!card) return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center text-gray-500">
      Loading...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#111] text-white flex flex-col font-sans select-none">
      <div className="px-4 py-4 flex items-center bg-[#111] border-b border-white/5 sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="text-white active:opacity-50 transition-opacity">
          <ChevronLeft size={28} />
        </button>
        <div className="flex-1 text-center pr-8">
          <h1 className="text-lg font-medium">{t.details}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-6 pt-10 pb-6 flex items-center gap-6">
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
            {card.logoUrl ? (
              <img src={card.logoUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={40} className="text-gray-400" />
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <h2 className="text-[22px] font-bold truncate">{`${card.name}_${card.company}`}</h2>
          </div>
        </div>

        <div className="py-12 flex justify-center border-b border-white/5 bg-[#1a1a1a]/30">
          <span className="text-gray-500 text-[15px] font-medium tracking-wide">
            {`${card.department} / ${card.title}`}
          </span>
        </div>

        <div className="mt-2">
          <InfoRow label={t.mobile} value={card.mobile} />
          <InfoRow label={t.workPhone} value={card.workPhone} />
          <InfoRow label={t.email} value={card.email} />
          <InfoRow label={t.address} value={card.address} multiLine />
          <InfoRow label={t.organization} value={card.company} />
          <InfoRow label={t.proxy} value="" />
          <InfoRow label={t.website} value={card.website} />
          <InfoRow label={t.photoUrl} value="" />
          <InfoRow label={t.birthday} value="" />
          <InfoRow label={t.remark} value="" />
        </div>
      </div>

      {showTip && (
        <div className="fixed top-20 left-4 right-4 bg-black/80 border border-white/10 p-4 rounded-xl z-50 flex items-start gap-3 shadow-2xl animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="text-[#07C160] shrink-0" size={20} />
          <p className="text-sm text-gray-200">{t.wechatTip}</p>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-[#111] border-t border-white/5">
        <button 
          onClick={handleSave}
          className="w-full bg-[#07C160] text-white py-3.5 rounded-lg text-lg font-bold active:opacity-70 transition-all transform active:scale-[0.98] shadow-lg"
        >
          {t.save}
        </button>
      </div>
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value: string; multiLine?: boolean }> = ({ label, value, multiLine }) => (
  <div className="flex items-start px-6 py-5 border-b border-white/5 active:bg-white/5 transition-colors">
    <div className="w-28 shrink-0 text-gray-500 text-[16px]">
      {label}
    </div>
    <div className={`flex-1 text-[16px] text-gray-300 leading-snug ${multiLine ? 'break-all' : 'truncate'}`}>
      {value || ''}
    </div>
  </div>
);

export default LandingPage;
