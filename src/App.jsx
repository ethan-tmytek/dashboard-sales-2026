import React, { useState, useMemo } from 'react';
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
  Activity
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

  // 計算每個產品的總銷量
  const dataWithTotals = useMemo(() => {
    return rawData.map(item => ({
      ...item,
      total: item["2022"] + item["2023"] + item["2024"] + item["2025"] + item["2026"]
    })).sort((a, b) => b.total - a.total);
  }, []);

  // 轉換成年度數據
  const yearlyStats = useMemo(() => {
    const years = ["2022", "2023", "2024", "2025", "2026"];
    return years.map(year => {
      const yearSum = rawData.reduce((acc, curr) => acc + (curr[year] || 0), 0);
      return { year, total: yearSum };
    });
  }, []);

  const overallTotal = dataWithTotals.reduce((acc, curr) => acc + curr.total, 0);
  const topProduct = dataWithTotals[0];

  // 獲取銷量最高的年份
  const peakYear = useMemo(() => {
    return [...yearlyStats].sort((a, b) => b.total - a.total)[0];
  }, [yearlyStats]);

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
              銷貨產品歷年數據分析
            </h1>
            <p className="text-slate-500 text-sm mt-2 flex items-center gap-2">
              <Calendar size={14} /> 數據範圍: 2022 - 2026 年度銷售趨勢統計
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <Layers size={24} />
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full uppercase tracking-wider">累積總量</span>
            </div>
            <h3 className="text-4xl font-black text-slate-800 relative z-10">{overallTotal.toLocaleString()}</h3>
            <p className="text-slate-500 text-sm mt-2 font-medium">全系列產品總銷售單位</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                <Package size={24} />
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-wider">熱銷冠軍</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800 truncate relative z-10" title={topProduct.name}>{topProduct.name}</h3>
            <p className="text-slate-500 text-sm mt-2 font-medium">累計銷量突破 {topProduct.total} 台</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                <TrendingUp size={24} />
              </div>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full uppercase tracking-wider">高峰年度</span>
            </div>
            <h3 className="text-4xl font-black text-slate-800 relative z-10">{peakYear.year}</h3>
            <p className="text-slate-500 text-sm mt-2 font-medium">單年銷售額達到 {peakYear.total} 台</p>
          </div>
        </div>

        {view === 'charts' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in zoom-in duration-500">
            {/* Chart 1: Bar Chart Ranking */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-8">
                <h4 className="font-bold text-lg flex items-center gap-2">
                  <ArrowUpRight size={20} className="text-blue-500" /> 
                  產品累積銷量排行 (Top 10)
                </h4>
              </div>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataWithTotals.slice(0, 10)} layout="vertical" margin={{ left: 40, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}
                    />
                    <Bar dataKey="total" fill="#3B82F6" radius={[0, 8, 8, 0]} barSize={24} name="總銷量">
                      {dataWithTotals.slice(0, 10).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#2563EB' : '#3B82F6'} fillOpacity={1 - (index * 0.05)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Area Trend */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-8">
                <h4 className="font-bold text-lg flex items-center gap-2">
                  <Activity size={20} className="text-emerald-500" /> 
                  年度銷量波動趨勢
                </h4>
              </div>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={yearlyStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="total" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" name="年度總銷量" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Pie Chart Market Share */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold text-lg mb-8 flex items-center gap-2">
                <PieIcon size={20} className="text-purple-500" /> 
                關鍵產品組合占比 (Top 5)
              </h4>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dataWithTotals.slice(0, 5)}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={8}
                      dataKey="total"
                      animationBegin={0}
                      animationDuration={1500}
                    >
                      {dataWithTotals.slice(0, 5).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Product Comparison */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold text-lg mb-8 flex items-center gap-2">
                <Layers size={20} className="text-orange-500" /> 
                旗艦系列成長路徑對比
              </h4>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yearlyStats.map(y => {
                    const year = y.year;
                    return {
                      year,
                      "28G BBox One": rawData.find(d => d.name === "28G BBox One")[year],
                      "UDBox 5G Dual": rawData.find(d => d.name === "UDBox 5G Dual")[year],
                      "Dev Kit": rawData.find(d => d.name === "Dev Kit")[year]
                    }
                  })}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                    <Legend iconType="rect" wrapperStyle={{ paddingTop: '20px' }}/>
                    <Line type="monotone" dataKey="28G BBox One" stroke="#3B82F6" strokeWidth={4} dot={{ r: 6, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="UDBox 5G Dual" stroke="#10B981" strokeWidth={4} dot={{ r: 6, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }} />
                    <Line type="monotone" dataKey="Dev Kit" stroke="#F59E0B" strokeWidth={4} dot={{ r: 6, fill: '#F59E0B', strokeWidth: 2, stroke: '#fff' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          /* Table View */
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
                    <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">2026</th>
                    <th className="px-8 py-5 text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50/50 text-center">累積加總</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {dataWithTotals.map((item, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-8 py-4 text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{item.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 text-center font-medium">{item["2022"] || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 text-center font-medium">{item["2023"] || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 text-center font-medium">{item["2024"] || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 text-center font-medium">{item["2025"] || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 text-center font-medium">{item["2026"] || '-'}</td>
                      <td className="px-8 py-4 text-sm font-black text-blue-600 bg-blue-50/20 text-center">{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <footer className="mt-16 pb-8 text-center text-slate-400 text-sm font-medium">
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="h-px bg-slate-200 w-12" />
            <p>© 2026 銷售策略決策支援系統</p>
            <div className="h-px bg-slate-200 w-12" />
          </div>
          <p className="opacity-75 tracking-wide uppercase text-[10px]">內部數據機密資料 · 未經授權禁止複製</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
