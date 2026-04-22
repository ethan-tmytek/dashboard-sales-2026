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
  Activity,
  Archive,
  Cpu,
  Calculator,
  TrendingDown,
  Plus
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

// 庫存靜態數據
const inventoryData = {
  "28G BBox One": 22,
  "28G BBox Lite": 41,
  "Dev Kit": 21
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

const App = () => {
  const [view, setView] = useState('charts');

  // 數據整理：全量（含 2026）
  const dataWithTotalsFull = useMemo(() => {
    return rawData.map(item => ({
      ...item,
      total: item["2022"] + item["2023"] + item["2024"] + item["2025"] + item["2026"]
    })).sort((a, b) => b.total - a.total);
  }, []);

  // 數據整理：圖表用（2022-2025）
  const dataWithTotalsCharts = useMemo(() => {
    return rawData.map(item => ({
      ...item,
      total: item["2022"] + item["2023"] + item["2024"] + item["2025"]
    })).sort((a, b) => b.total - a.total);
  }, []);

  const yearlyStatsCharts = useMemo(() => {
    const years = ["2022", "2023", "2024", "2025"];
    return years.map(year => {
      const yearSum = rawData.reduce((acc, curr) => acc + (curr[year] || 0), 0);
      return { year, total: yearSum };
    });
  }, []);

  // 計算圖表分析分頁需要的 Top 5 產品
  const top5Products = useMemo(() => dataWithTotalsCharts.slice(0, 5), [dataWithTotalsCharts]);
  const top5Names = useMemo(() => top5Products.map(p => p.name), [top5Products]);

  // 生成 Top 5 線圖數據
  const top5TrendData = useMemo(() => {
    return ["2022", "2023", "2024", "2025"].map(year => {
      const entry = { year };
      top5Names.forEach(name => {
        const product = rawData.find(d => d.name === name);
        entry[name] = product ? product[year] : 0;
      });
      return entry;
    });
  }, [top5Names]);

  const chartOverallTotal = dataWithTotalsCharts.reduce((acc, curr) => acc + curr.total, 0);
  const chartTopProduct = dataWithTotalsCharts[0];
  const chartPeakYear = useMemo(() => [...yearlyStatsCharts].sort((a, b) => b.total - a.total)[0], [yearlyStatsCharts]);

  // AWMF-0162 用量預測邏輯
  const forecastResults = useMemo(() => {
    const targetProducts = ["28G BBox One", "28G BBox Lite", "Dev Kit"];
    const chipConfig = {
      "28G BBox One": 4,
      "28G BBox Lite": 1,
      "Dev Kit": 1
    };

    return targetProducts.map(pName => {
      const productData = rawData.find(d => d.name === pName);
      const pastTotal = productData["2022"] + productData["2023"] + productData["2024"] + productData["2025"];
      const annualAvg = pastTotal / 4;
      const futureNeed3Years = Math.ceil(annualAvg * 3);
      const inventory = inventoryData[pName] || 0;
      const productionTarget = Math.max(0, futureNeed3Years - inventory);
      const chipsPerUnit = chipConfig[pName];
      const chipsNeeded = productionTarget * chipsPerUnit;

      return {
        name: pName,
        annualAvg: annualAvg.toFixed(1),
        futureNeed: futureNeed3Years,
        inventory: inventory,
        productionTarget: productionTarget,
        chipsPerUnit: chipsPerUnit,
        chipsNeeded: chipsNeeded
      };
    });
  }, []);

  const totalChipsBase = forecastResults.reduce((acc, curr) => acc + curr.chipsNeeded, 0);
  const repairBuffer = Math.ceil(totalChipsBase * 0.2);
  const grandTotalChips = totalChipsBase + repairBuffer;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-3 tracking-tight">
              <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
                <BarChart3 size={24} />
              </div>
              銷售與資產決策系統
            </h1>
            <p className="text-slate-500 text-sm mt-2 flex items-center gap-2">
              <Calendar size={14} /> 數據分析範圍: 2022 - 2028 | 包含庫存與未來預測
            </p>
          </div>
          
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-1">
            {[
              { id: 'charts', label: '圖表分析', icon: <PieIcon size={16} /> },
              { id: 'table', label: '詳細數據', icon: <TableIcon size={16} /> },
              { id: 'inventory', label: '庫存分析', icon: <Archive size={16} /> },
              { id: 'forecast', label: '用量預測', icon: <Cpu size={16} /> },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${view === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </header>

        {view === 'charts' && (
          <div className="animate-in fade-in zoom-in duration-500">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><Layers size={24} /></div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full uppercase">累積總量 (22-25)</span>
                </div>
                <h3 className="text-4xl font-black text-slate-800">{chartOverallTotal.toLocaleString()}</h3>
                <p className="text-slate-500 text-sm mt-2 font-medium">指定期間內總銷售單位</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><Package size={24} /></div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase">分析期冠軍</span>
                </div>
                <h3 className="text-2xl font-black text-slate-800 truncate" title={chartTopProduct.name}>{chartTopProduct.name}</h3>
                <p className="text-slate-500 text-sm mt-2 font-medium">銷量累計最高產品</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-amber-50 rounded-2xl text-amber-600"><TrendingUp size={24} /></div>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full uppercase">高峰年度</span>
                </div>
                <h3 className="text-4xl font-black text-slate-800">{chartPeakYear.year}</h3>
                <p className="text-slate-500 text-sm mt-2 font-medium">單年銷售紀錄最高峰</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Chart 1: Ranking */}
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h4 className="font-bold text-lg mb-8 flex items-center gap-2 text-slate-800">
                  <ArrowUpRight size={20} className="text-blue-500" /> 
                  產品累積銷量排行 (2022-2025)
                </h4>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataWithTotalsCharts.slice(0, 10)} layout="vertical" margin={{ left: 40, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                      <Bar dataKey="total" fill="#3B82F6" radius={[0, 8, 8, 0]} barSize={20} name="總銷量" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Trend */}
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h4 className="font-bold text-lg mb-8 flex items-center gap-2 text-slate-800">
                  <Activity size={20} className="text-emerald-500" /> 
                  年度銷量成長趨勢 (2022-2025)
                </h4>
                <div className="h-[350px]">
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
                      <Area type="monotone" dataKey="total" stroke="#10B981" strokeWidth={4} fill="url(#colorTotal)" name="年度總銷量" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3: Market Share (NEW) */}
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h4 className="font-bold text-lg mb-8 flex items-center gap-2 text-slate-800">
                  <PieIcon size={20} className="text-purple-500" /> 
                  關鍵產品組合佔比 (2022-2025)
                </h4>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={top5Products}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="total"
                      >
                        {top5Products.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 4: Top 5 Comparison (NEW) */}
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h4 className="font-bold text-lg mb-8 flex items-center gap-2 text-slate-800">
                  <TrendingUp size={20} className="text-orange-500" /> 
                  熱銷 Top 5 產品歷年成長對比
                </h4>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={top5TrendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                      <Legend iconType="rect" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      {top5Names.map((name, index) => (
                        <Line 
                          key={name}
                          type="monotone" 
                          dataKey={name} 
                          stroke={COLORS[index % COLORS.length]} 
                          strokeWidth={3} 
                          dot={{ r: 4, strokeWidth: 2 }} 
                          activeDot={{ r: 6 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'table' && (
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
                    <th className="px-6 py-5 text-xs font-bold text-blue-500 uppercase tracking-widest text-center bg-blue-50/20">2026 (錄入中)</th>
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

        {view === 'inventory' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-right duration-500">
            {Object.entries(inventoryData).map(([name, count]) => (
              <div key={name} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg hover:shadow-2xl transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 text-slate-50 group-hover:text-blue-50 transition-colors">
                  <Archive size={80} />
                </div>
                <div className="relative z-10">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full uppercase tracking-widest">現有庫存</span>
                  <h3 className="text-2xl font-black text-slate-800 mt-4 mb-1">{name}</h3>
                  <p className="text-slate-400 text-sm font-medium mb-6">N+G 庫存水位</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black text-slate-900">{count}</span>
                    <span className="text-xl font-bold text-slate-400">台</span>
                  </div>
                  <div className="mt-8 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(100, count * 2)}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'forecast' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
            {/* Forecast Calculation Table */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h4 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Calculator className="text-blue-600" /> AWMF-0162 需求預測模型
                  </h4>
                  <p className="text-slate-500 text-sm mt-1">基準：2022-2025 年度平均銷售量推估未來三年需求</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                    <TrendingUp size={16} /> 預測週期: 2026-2028
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/30">
                      <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">產品類別</th>
                      <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">歷史年均 (22-25)</th>
                      <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">未來 3 年需求</th>
                      <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">當前庫存</th>
                      <th className="px-6 py-5 text-xs font-bold text-blue-600 uppercase tracking-widest text-center bg-blue-50/30">預計生產量</th>
                      <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">晶片配比</th>
                      <th className="px-8 py-5 text-xs font-bold text-blue-700 uppercase tracking-widest text-center bg-blue-50/50">晶片需求數</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {forecastResults.map((res, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6 font-bold text-slate-800">{res.name}</td>
                        <td className="px-6 py-6 text-center text-slate-600 font-medium">{res.annualAvg} 台 / 年</td>
                        <td className="px-6 py-6 text-center text-slate-600 font-bold">{res.futureNeed} 台</td>
                        <td className="px-6 py-6 text-center text-amber-600 font-bold">{res.inventory} 台</td>
                        <td className="px-6 py-6 text-center text-blue-600 font-black bg-blue-50/20">{res.productionTarget} 台</td>
                        <td className="px-6 py-6 text-center text-slate-400 text-xs font-bold">{res.chipsPerUnit} 顆 / 台</td>
                        <td className="px-8 py-6 text-center text-blue-800 font-black bg-blue-50/40">{res.chipsNeeded.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Final Total Calculation Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
              <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-20 transform translate-x-10 -translate-y-10">
                  <Cpu size={200} />
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                    <Archive className="text-blue-200" /> AWMF-0162 總採購計劃
                  </h3>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-white/20">
                      <span className="text-blue-100 font-medium">再生產所需晶片基準量</span>
                      <span className="text-2xl font-bold">{totalChipsBase.toLocaleString()} 顆</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-white/20">
                      <div className="flex flex-col">
                        <span className="text-blue-100 font-medium">維修備品 (Buffer)</span>
                        <span className="text-[10px] text-blue-200 uppercase tracking-tighter">額外加成 20%</span>
                      </div>
                      <span className="text-2xl font-bold text-emerald-300">+{repairBuffer.toLocaleString()} 顆</span>
                    </div>
                    <div className="flex justify-between items-center pt-4">
                      <span className="text-xl font-black uppercase tracking-widest">最終總需求量</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-black text-white drop-shadow-lg">{grandTotalChips.toLocaleString()}</span>
                        <span className="text-xl font-bold text-blue-200">顆</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl flex flex-col justify-center">
                <div className="mb-6 p-4 bg-amber-50 rounded-2xl">
                  <p className="text-amber-800 text-sm font-bold flex items-center gap-2">
                    <TrendingDown size={18} /> 庫存抵扣策略
                  </p>
                  <p className="text-amber-600 text-xs mt-1">系統已自動從未來 3 年需求中優先消耗當前庫存，減少不必要的過度生產。</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-slate-600">
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                    <span className="text-sm font-medium">BBox One: 4 Chips/ea</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-600">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-medium">BBox Lite: 1 Chip/ea</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-600">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="text-sm font-medium">Dev Kit: 1 Chip/ea</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-8 pb-8 text-center text-slate-400 text-sm font-medium">
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="h-px bg-slate-200 w-12" />
            <p>© 2026 銷售與資產決策支援系統</p>
            <div className="h-px bg-slate-200 w-12" />
          </div>
          <p className="opacity-75 tracking-wide uppercase text-[10px]">內部數據 · AWMF-0162 預測基於 22-25 平均值外推</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
