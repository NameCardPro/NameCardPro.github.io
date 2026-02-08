
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BusinessCardData } from '../types';
import { QRCodeCanvas } from 'qrcode.react';
import { extractContactInfo } from '../services/geminiService';
import { Scan, Save, Plus, BarChart3, Loader2, Share2, Printer, Languages, Image as ImageIcon, Download } from 'lucide-react';
import { useLanguage } from '../App';
import { translations } from '../translations';
import { toPng } from 'html-to-image';

interface Props {
  onSave: (card: BusinessCardData) => void;
  cards: BusinessCardData[];
}

const CreatorPage: React.FC<Props> = ({ onSave, cards }) => {
  const { lang, setLang } = useLanguage();
  const t = translations[lang];
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  
  const [formData, setFormData] = useState<Partial<BusinessCardData>>({
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
    logoUrl: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, logoUrl: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      const extracted = await extractContactInfo(base64);
      if (extracted) {
        setFormData(prev => ({ ...prev, ...extracted }));
      }
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadImage = async () => {
    if (previewRef.current === null) return;
    
    setDownloading(true);
    try {
      const dataUrl = await toPng(previewRef.current, { 
        pixelRatio: 3,
        backgroundColor: '#ffffff',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });
      const link = document.createElement('a');
      link.download = `BusinessCard_${formData.name || 'Export'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('oops, something went wrong!', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = Math.random().toString(36).substr(2, 9);
    const newCard: BusinessCardData = {
      ...formData as BusinessCardData,
      id: newId,
    };
    onSave(newCard);
    setFormData(prev => ({ ...prev, id: newId }));
    alert(t.savedAlert);
  };

  const currentCardUrl = formData.id 
    ? `${window.location.origin}/#/view/${formData.id}`
    : `${window.location.origin}/#/view/preview`;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 bg-[#A11D21] rounded flex items-center justify-center text-white">
              <Plus size={20} />
            </div>
            {t.creatorTitle}
          </h1>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              className="flex items-center gap-1.5 text-gray-600 hover:text-[#A11D21] font-medium px-3 py-1.5 rounded-full border border-gray-200 transition-colors"
            >
              <Languages size={18} />
              {t.lang}
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-[#A11D21] font-medium"
            >
              <BarChart3 size={20} />
              {t.analytics}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 lg:flex gap-8 items-start mt-4">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">{t.contactInfo}</h2>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="text-sm font-semibold border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm"
              >
                <ImageIcon size={18} />
                {t.uploadLogo}
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="text-sm font-semibold bg-[#A11D21] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-[#80171a] transition-all shadow-md"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Scan size={18} />}
                {t.scanAI}
              </button>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
            <input type="file" ref={logoInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t.name}</label>
                <input name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-gray-50 border border-transparent focus:border-[#A11D21] rounded-lg px-4 py-3 text-sm outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t.jobTitle}</label>
                <input name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-gray-50 border border-transparent focus:border-[#A11D21] rounded-lg px-4 py-3 text-sm outline-none transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t.company}</label>
                <input name="company" value={formData.company} onChange={handleInputChange} className="w-full bg-gray-50 border border-transparent focus:border-[#A11D21] rounded-lg px-4 py-3 text-sm outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t.department}</label>
                <input name="department" value={formData.department} onChange={handleInputChange} className="w-full bg-gray-50 border border-transparent focus:border-[#A11D21] rounded-lg px-4 py-3 text-sm outline-none transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t.mobile}</label>
                <input name="mobile" value={formData.mobile} onChange={handleInputChange} className="w-full bg-gray-50 border border-transparent focus:border-[#A11D21] rounded-lg px-4 py-3 text-sm outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t.workPhone}</label>
                <input name="workPhone" value={formData.workPhone} onChange={handleInputChange} className="w-full bg-gray-50 border border-transparent focus:border-[#A11D21] rounded-lg px-4 py-3 text-sm outline-none transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t.email}</label>
                <input name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-gray-50 border border-transparent focus:border-[#A11D21] rounded-lg px-4 py-3 text-sm outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t.website}</label>
                <input name="website" value={formData.website} onChange={handleInputChange} className="w-full bg-gray-50 border border-transparent focus:border-[#A11D21] rounded-lg px-4 py-3 text-sm outline-none transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t.postcode}</label>
                <input name="postcode" value={formData.postcode} onChange={handleInputChange} className="w-full bg-gray-50 border border-transparent focus:border-[#A11D21] rounded-lg px-4 py-3 text-sm outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t.address}</label>
                <input name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-gray-50 border border-transparent focus:border-[#A11D21] rounded-lg px-4 py-3 text-sm outline-none transition-all" />
              </div>
            </div>

            <button type="submit" className="w-full bg-black text-white py-4 rounded-lg font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 mt-4 shadow-lg">
              <Save size={20} />
              {t.generate}
            </button>
          </form>
        </div>

        <div className="w-full lg:w-[420px] mt-8 lg:mt-0">
          <div className="sticky top-28">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 px-2">
              <div className="w-1.5 h-4 bg-[#A11D21] rounded-full"></div>
              {t.previewTitle}
            </h3>
            
            <div 
              ref={previewRef}
              className="bg-white shadow-2xl overflow-hidden flex flex-col relative" 
              style={{ width: '100%', aspectRatio: '9/18', maxHeight: '820px' }}
            >
              <div className="flex-1 px-7 pt-12 pb-7 flex flex-col relative bg-white overflow-hidden">
                <div className="flex justify-start items-center mb-8">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Logo" className="h-12 w-auto object-contain" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-[#A11D21] flex items-center justify-center text-white font-bold text-base leading-none shadow-sm">
                        BOC
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-bold tracking-tight text-gray-900 leading-none">中国银行</span>
                        <span className="text-[7px] font-medium text-gray-400 tracking-[0.2em] mt-0.5 uppercase">Bank of China</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-12 mt-2">
                  <h1 className="text-[28px] font-bold text-black mb-6 tracking-[0.25em] leading-tight">{formData.name || '姓名'}</h1>
                  <div className="flex gap-4">
                    <div className="w-[4px] bg-[#A11D21] h-12 rounded-full"></div>
                    <div className="flex flex-col justify-center space-y-0.5 text-[#666] font-medium">
                      <div className="text-[15px] leading-tight">{formData.department || '部门名称'}</div>
                      <div className="text-[15px] leading-tight">{formData.title || '职务名称'}</div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-[22px] font-bold text-gray-900 mb-2 leading-tight">{formData.company || '公司全称'}</h2>
                  <p className="text-[#666] text-[15px] leading-relaxed">
                    {formData.address || '办公地址'}
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex flex-col">
                    <span className="text-[14px] font-bold text-[#A11D21] mb-1 tracking-wide">手机 / MP</span>
                    <span className="text-[15px] font-medium text-[#666] tabular-nums leading-none">{formData.mobile}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-bold text-[#A11D21] mb-1 tracking-wide">工作电话 / TEL</span>
                    <span className="text-[15px] font-medium text-[#666] tabular-nums leading-none">{formData.workPhone}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-bold text-[#A11D21] mb-1 tracking-wide">邮箱 / MAIL</span>
                    <span className="text-[15px] font-medium text-[#666] break-all leading-tight">{formData.email}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-bold text-[#A11D21] mb-1 tracking-wide">邮编 / POST</span>
                    <span className="text-[15px] font-medium text-[#666] tabular-nums leading-none">{formData.postcode}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 w-full mt-4 mb-4"></div>

                <div className="mt-auto flex flex-col items-center pb-8">
                  <div className="p-1 bg-white border border-gray-100 shadow-sm mb-3">
                    <QRCodeCanvas value={currentCardUrl} size={110} level="H" />
                  </div>
                  <div className="text-[12px] font-medium text-[#999] tracking-[0.15em] whitespace-nowrap">
                    {t.scanInstruction}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-6">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => window.print()}
                  className="bg-white border border-gray-200 text-gray-800 py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                >
                  <Printer size={16} /> {t.print}
                </button>
                <button 
                  onClick={() => alert('已准备分享链接: ' + currentCardUrl)}
                  className="bg-white border border-gray-200 text-gray-800 py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                >
                  <Share2 size={16} /> {t.share}
                </button>
              </div>
              <button 
                onClick={handleDownloadImage}
                disabled={downloading}
                className="w-full bg-[#A11D21] text-white py-3.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#80171a] transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
              >
                {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                {t.downloadHD}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreatorPage;
