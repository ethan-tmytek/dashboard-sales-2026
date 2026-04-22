import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Layers, 
  Table as TableIcon,
  PieChart as PieIcon,
  ArrowUpRight,
  Package,
  Calendar,
  Activity,
  Sparkles,
  Volume2,
  Loader2,
  ChevronRight
} from 'lucide-react';

const rawData = [
  { name: "26G BBox One", "2026": 0, "2025": 4, "2024": 2, "2023": 0, "2022": 0 },
  { name: "28G BBox One", "2026": 3, "2025": 29, "2024": 45, "2023": 55, "2022": 33 },
  { name: "39G BBox One", "2026": 0, "2025": 1, "2024": 4, "2023": 2, "2022": 1 },
  { name: "28G BBox Lite", "2026": 2, "2025": 16, "2024": 16, "2023": 24, "2022": 14 },
  { name: "39G BBox Lite", "2026": 0, "2025": 0, "2024": 0, "2023": 0, "2022": 3 },
  { name: "28G BBoard", "2026": 1, "2025": 3, "2024": 6, "2023": 6, "2022": 2 },
  { name: "39G BBoard", "2026": 0, "2025": 0, "2024": 0, "2023": 0, "2022": 2 },
  { name: "BBox 8x8 Duo", "2026": 8, "2025": 4, "2024": 0, "2023": 0, "2022": 0 },
  { name: "UDBox 5G Dual", "2026": 1, "2025": 23, "2024": 47, "2023": 37, "2022": 32 },
  { name: "UDBox 5G Single", "2026": 2, "2025": 17, "2024": 35, "2023": 34, "2022": 13 },
  { name: "UDM 0620", "2026": 4, "2025": 4, "2024": 15, "2023": 9, "2022": 0 },
  { name: "UDB 0630", "2026": 7, "2025": 37, "2024": 11, "2023": 0, "2022": 0 },
  { name: "28G RIS", "2026": 4, "2025": 9, "2024": 19, "2023": 0, "2022": 0 },
  { name: "4.7G RIS", "2026": 2, "2025": 9, "2024": 2, "2023": 0, "2022": 0 },
  { name: "3.5G RIS", "2026": 0, "2025": 2, "2024": 0, "2023": 0, "2022": 0 },
  { name: "Dev Kit", "2026": 4, "2025": 25, "2024": 44, "2023": 26, "2022": 2 },
  { name: "UD Kit", "2026": 2, "2025": 27, "2024": 17, "2023": 19, "2022": 0 }
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

const App = () => {
  const [view, setView] = useState('charts');
  const [aiInsight, setAiInsight] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const apiKey = "";

  // 1. 全量數據 (用於表格)
  const dataWithTotalsFull = useMemo(() => {
    return rawData.map(item => ({
      ...item,
      total: item["2022"] + item["2023"] + item["2024"] + item["2025"] + item["2026"]
    })).sort((a, b) => b.total - a.total);
  }, []);

  // 2. 圖表專用數據 (排除 2026)
  const dataWithTotalsCharts = useMemo(() => {
    return rawData.map(item => ({
      ...item,
      total: item["2022"] + item["2023"] + item["2024"] + item["2025"] // 不包含 2026
    })).sort((a, b) => b.total - a.total);
  }, []);

  // 3. 圖表專用年度統計 (排除 2026)
  const yearlyStatsCharts = useMemo(() => {
    const years = ["2022", "2023", "2024", "2025"]; // 排除 2026
    return years.map(year => {
      const yearSum = rawData.reduce((acc, curr) => acc + (curr[year] || 0), 0);
      return { year, total: yearSum };
    });
  }, []);

  // 摘要數值（以圖表分析的 2022-2025 為主，確保視圖一致性）
  const chartOverallTotal = dataWithTotalsCharts.reduce((acc, curr) => acc + curr.total, 0);
  const chartTopProduct = dataWithTotalsCharts[0];
  const chartPeakYear = useMemo(() => [...yearlyStatsCharts].sort((a, b) => b.total - a.total)[0], [yearlyStatsCharts]);

  const callGeminiWithRetry = async (prompt, systemInstruction = "", retries = 5) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined
          })
        });
        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text;
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  };

  const handleGenerateAiInsight = async () => {
    setIsLoadingAi(true);
    setAiInsight('');
    try {
      const dataSummary = dataWithTotalsCharts.map(d => `${d.name}: ${d.total}`).join(', ');
      const yearSummary = yearlyStatsCharts.map(y => `${y.year}年: ${y.total}`).join(', ');
      
      const prompt = `請分析以下 2022-2025 年的銷售數據（排除 2026 年）：
      產品銷量總計：${dataSummary}
      年度銷量趨勢：${yearSummary}
      請提供：
      1. 2022-2025 核心增長趨勢總結。
      2. 表現最突出的 2 個產品分析。
      3. 針對未來的策略建議。
      請使用專業繁體中文。`;

      const result = await callGeminiWithRetry(prompt, "你是一位資深商業數據分析師。");
      setAiInsight(result);
    } catch (err) {
      setAiInsight("抱歉，分析過程中發生錯誤。");
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSpeak = async () => {
    if (!aiInsight || isSpeaking) return;
    setIsSpeaking(true);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Say in a professional business tone: ${aiInsight}` }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } }
          }
        })
      });
      const result = await response.json();
      const pcmData = result.candidates[0].content.parts[0].inlineData.data;
      const mimeType = result.candidates[0].content.parts[0].inlineData.mimeType;
      const sampleRate = parseInt(mimeType.match(/rate=(\d+)/)?.[1] || "24000");

      const base64ToUint8Array = (base64) => {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
        return bytes;
      };

      const createWavHeader = (dataLength, sampleRate) => {
        const header = new ArrayBuffer(44);
        const view = new DataView(header);
        const writeString = (offset, string) => {
          for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
        };
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + dataLength, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, dataLength, true);
        return new Uint8Array(header);
      };

      const audioData = base64ToUint8Array(pcmData);
      const wavHeader = createWavHeader(audioData.length, sampleRate);
      const wavBlob = new Blob([wavHeader, audioData], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(wavBlob);
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsSpeaking(false);
      audio.play();
    } catch (err) {
      setIsSpeaking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <h1 className="text-3xl font-extrabold flex items-center gap-3 tracking-tight">
              <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
                <BarChart3 size={24} />
              </div>
              銷售數據決策看板
            </h1>
            <p className="text-slate-500 text-sm mt-2 flex items-center gap-2">
              <Calendar size={14} /> 圖表分析範圍: 2022 - 2025 | 詳細數據包含 2026
            </p>
          </div>
          
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex self-end md:self-auto transition-all hover:shadow-md">
            <button 
              onClick={() => setView('charts')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${view === 'charts' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 scale-105' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <PieIcon size={16} /> 圖表分析
            </button>
            <button 
              onClick={() => setView('table')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${view === 'table' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 scale-105' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <TableIcon size={16} /> 詳細數據
            </button>
          </div>
        </header>

        {/* AI Insight Section */}
        <div className="mb-10 animate-in fade-in slide-in-from-top duration-1000 delay-200">
          <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="text-yellow-300 fill-yellow-300" />
                    AI 智慧分析助手 (2022-2025)
                  </h2>
                  <p className="text-blue-100 mt-1 opacity-90">分析週期已鎖定為 2022 至 2025 年度</p>
                </div>
                <button 
                  onClick={handleGenerateAiInsight}
                  disabled={isLoadingAi}
                  className="bg-white text-blue-700 px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {isLoadingAi ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                  {isLoadingAi ? "分析中..." : "生成分析報告 ✨"}
                </button>
              </div>
              {aiInsight && (
                <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 animate-in zoom-in duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-sm font-medium text-blue-100 flex items-center gap-2 uppercase tracking-widest">Report Ready</div>
                    <button onClick={handleSpeak} disabled={isSpeaking} className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors flex items-center gap-2 text-sm font-bold">
                      {isSpeaking ? <Loader2 className="animate-spin" size={16} /> : <Volume2 size={16} />}
                      {isSpeaking ? "播報中..." : "播放摘要"}
                    </button>
                  </div>
                  <div className="text-lg leading-relaxed font-medium whitespace-pre-wrap text-white">{aiInsight}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards (基於圖表範圍 2022-2025) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><Layers size={24} /></div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full uppercase">累積總量 (22-25)</span>
            </div>
            <h3 className="text-4xl font-black text-slate-800">{chartOverallTotal.toLocaleString()}</h3>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><Package size={24} /></div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase">分析期冠軍</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800 truncate" title={chartTopProduct.name}>{chartTopProduct.name}</h3>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-50 rounded-2xl text-amber-600"><TrendingUp size={24} /></div>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full uppercase">高峰年度</span>
            </div>
            <h3 className="text-4xl font-black text-slate-800">{chartPeakYear.year}</h3>
          </div>
        </div>

        {view === 'charts' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in zoom-in duration-500">
            {/* Chart 1: Ranking */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h4 className="font-bold text-lg mb-8 flex items-center gap-2"><ArrowUpRight size={20} className="text-blue-500" /> 累積銷量排行 (2022-2025)</h4>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataWithTotalsCharts.slice(0, 10)} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                    <Bar dataKey="total" fill="#3B82F6" radius={[0, 8, 8, 0]} barSize={24} name="22-25 總量" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Trend */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h4 className="font-bold text-lg mb-8 flex items-center gap-2"><Activity size={20} className="text-emerald-500" /> 年度銷量趨勢 (2022-2025)</h4>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={yearlyStatsCharts}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                    <Area type="monotone" dataKey="total" stroke="#10B981" strokeWidth={4} fill="url(#colorTotal)" name="年度總量" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Market Share */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h4 className="font-bold text-lg mb-8 flex items-center gap-2"><PieIcon size={20} className="text-purple-500" /> 關鍵產品組合佔比 (2022-2025)</h4>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dataWithTotalsCharts.slice(0, 5)} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="total">
                      {dataWithTotalsCharts.slice(0, 5).map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />)}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Flagship Comparison */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h4 className="font-bold text-lg mb-8 flex items-center gap-2"><Layers size={20} className="text-orange-500" /> 旗艦系列成長對比 (2022-2025)</h4>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yearlyStatsCharts.map(y => ({
                    year: y.year,
                    "28G BBox One": rawData.find(d => d.name === "28G BBox One")[y.year],
                    "UDBox 5G Dual": rawData.find(d => d.name === "UDBox 5G Dual")[y.year],
                    "Dev Kit": rawData.find(d => d.name === "Dev Kit")[y.year]
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Legend iconType="rect" />
                    <Line type="monotone" dataKey="28G BBox One" stroke="#3B82F6" strokeWidth={4} dot={{ r: 6 }} />
                    <Line type="monotone" dataKey="UDBox 5G Dual" stroke="#10B981" strokeWidth={4} dot={{ r: 6 }} />
                    <Line type="monotone" dataKey="Dev Kit" stroke="#F59E0B" strokeWidth={4} dot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          /* Detailed Table View (包含 2026) */
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-500">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">產品名稱</th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">2022</th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">2023</th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">2024</th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">2025</th>
                    <th className="px-6 py-5 text-xs font-bold text-blue-500 uppercase tracking-widest text-center bg-blue-50/20">2026 (NEW)</th>
                    <th className="px-8 py-5 text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50/50 text-center">總累積 (含 26)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {dataWithTotalsFull.map((item, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-8 py-4 text-sm font-bold text-slate-700">{item.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 text-center">{item["2022"] || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 text-center">{item["2023"] || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 text-center">{item["2024"] || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 text-center">{item["2025"] || '-'}</td>
                      <td className="px-6 py-4 text-sm text-blue-600 text-center font-bold bg-blue-50/10">{item["2026"] || '-'}</td>
                      <td className="px-8 py-4 text-sm font-black text-blue-600 bg-blue-50/20 text-center">{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <footer className="mt-16 pb-8 text-center text-slate-400 text-sm font-medium">
          <p>© 2026 銷售決策支援系統 | AI 分析範圍僅限 2022-2025</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
