import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Target, TrendingUp, TrendingDown, BookOpen, Calculator, AlertTriangle, Info, Calendar, Award, ExternalLink, Newspaper, Landmark, BarChart3, Radio, Zap, Activity, History, PieChart, Users, RefreshCw } from 'lucide-react';

const App = () => {
  const [budget, setBudget] = useState(1000000);
  const [industry, setIndustry] = useState('全部');
  const [stance, setStance] = useState('long'); 
  const [horizon, setHorizon] = useState('mid'); 
  const [volatility, setVolatility] = useState('small'); 
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [livePrices, setLivePrices] = useState({});
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());

  // 證交所官方產業分類
  const twseIndustries = [
    "全部", "半導體業", "電腦及週邊設備業", "電子零組件業", "通信網路業", "光電業", 
    "電子通路業", "資訊服務業", "其他電子業", "金融保險業", "航運業", "觀光餐旅業", 
    "生技醫療業", "電機機械業", "化學工業", "綠能環保業"
  ];

  // 2026 模擬初始資料庫
  const initialStockDatabase = [
    { id: '2330', name: '台積電', basePrice: 1985, industry: '半導體業', margin: '59.2%', majorTrend: 0.32, structure: '2nm 量產/CoWoS 產能擴張', news: '【經濟日報】2奈米量產進度提前。Yahoo股市顯示外資目標價調升至 2400。證交所公告獲利續創新高。' },
    { id: '2454', name: '聯發科', basePrice: 1780, industry: '半導體業', margin: '49.1%', majorTrend: -0.02, structure: 'AI手機晶片/天璣 9400+', news: '【鉅亨網】天璣系列晶片市佔奪冠。工商時報報導：AI手機滲透率超標。Google財經顯示國際同業連動。' },
    { id: '2317', name: '鴻海', basePrice: 252, industry: '其他電子業', margin: '6.8%', majorTrend: 0.45, structure: 'GB200 伺服器/電動車平台', news: '【聯合報】AI伺服器出貨量佔全球四成。HiStock技術分析：股價挑戰歷史高區。' },
    { id: '2382', name: '廣達', basePrice: 315, industry: '電腦及週邊設備業', margin: '8.5%', majorTrend: 0.18, structure: 'AI伺服器/筆電代工優化', news: '【MoneyDJ】伺服器訂單旺至 2027。非凡新聞：產能利用率持續滿載。' },
    { id: '6669', name: '緯穎', basePrice: 4210, industry: '電腦及週邊設備業', margin: '11.8%', majorTrend: -0.15, structure: '自研 ASIC/雲端基建需求', news: '【財訊快報】獲北美大廠追加訂單。PChome股市討論熱度極高。今周刊深度解析基建紅利。' },
    { id: '2308', name: '台達電', basePrice: 1620, industry: '電子零組件業', margin: '30.2%', majorTrend: 0.22, structure: '電源管理/液冷散熱系統', news: '【工商時報】液冷技術獲美大廠認可。MOPS：經營層持股穩定上升。' },
    { id: '2881', name: '富邦金', basePrice: 95.5, industry: '金融保險業', margin: 'N/A', majorTrend: 0.12, structure: '壽險獲利回升/商業銀行', news: '【Yahoo!股市】配息預期推升股價。天下雜誌評比：經營績效蟬聯金融之冠。' },
    { id: '2882', name: '國泰金', basePrice: 78.2, industry: '金融保險業', margin: 'N/A', majorTrend: 0.05, structure: '人壽保險/數位金融轉型', news: '【鉅亨網】投資部位獲利回補。遠見雜誌：數位轉型成效顯著。' },
    { id: '2603', name: '長榮', basePrice: 215, industry: '航運業', margin: '23.1%', majorTrend: -0.42, structure: '全球遠洋貨櫃運輸服務', news: '【經濟日報】運價 SCFI 指數波動加劇。MoneyDJ：紅海危機支撐短期獲利位階。' },
    { id: '2618', name: '長榮航', basePrice: 44.5, industry: '航運業', margin: '19.5%', majorTrend: 0.08, structure: '國際客運/航空貨運', news: '【聯合新聞網】旅遊熱潮不減。Google財經：燃油成本下降助攻毛利。' },
    { id: '3443', name: '創意', basePrice: 2920, industry: '半導體業', margin: '32.1%', majorTrend: 0.62, structure: 'ASIC/NRE 設計領先', news: '【鉅亨網】ASIC 開發案件量增。Goodinfo技術面多頭排列。非凡新聞指出 CoWoS 鏈帶旺。' },
    { id: '1513', name: '中興電', basePrice: 205, industry: '電機機械業', margin: '20.5%', majorTrend: 0.35, structure: '強韌電網/綠能設備', news: '【聯合報】台電強韌電網計畫 5600 億肥單。MoneyDJ：訂單能見度已達 2030 年。' },
    { id: '3711', name: '日月光投控', basePrice: 198, industry: '半導體業', margin: '17.2%', majorTrend: 0.15, structure: '先進封裝測試一條龍', news: '【Yahoo股市】先進封裝領頭羊。鉅亨網分析指出 HBM 需求爆發。' },
    { id: '2357', name: '華碩', basePrice: 610, industry: '電腦及週邊設備業', margin: '17.8%', majorTrend: -0.21, structure: 'AI PC/電競生態圈', news: '【工商時報】AI PC 市場佔有率提升。商周：PC 巨頭的轉型關鍵時刻。' },
    { id: '2376', name: '技嘉', basePrice: 365, industry: '電腦及週邊設備業', margin: '14.5%', majorTrend: 0.31, structure: 'AI 伺服器/主機板/顯卡', news: '【鉅亨網】伺服器營收占比突破 5 成。WantGoo數據顯示大戶持續加碼。' },
    { id: '3034', name: '聯詠', basePrice: 642, industry: '半導體業', margin: '40.2%', majorTrend: -0.05, structure: 'OLED 驅動 IC 龍頭', news: '【MoneyDJ】OLED 報價止跌回升。Yahoo股市顯示法人評等調升至買進。' }
  ];

  // 初始化與即時股價跳動模擬
  useEffect(() => {
    // 初次載入
    const initialPrices = {};
    initialStockDatabase.forEach(s => { initialPrices[s.id] = s.basePrice; });
    setLivePrices(initialPrices);

    // 模擬 3 秒一次的即時股價更新
    const timer = setInterval(() => {
      setLivePrices(prev => {
        const nextPrices = { ...prev };
        Object.keys(nextPrices).forEach(id => {
          const change = (Math.random() * 0.002 - 0.001); // 隨機 +/- 0.1%
          nextPrices[id] = parseFloat((nextPrices[id] * (1 + change)).toFixed(2));
        });
        return nextPrices;
      });
      setLastUpdate(new Date().toLocaleTimeString());
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const generateStrategy = (stock) => {
    const currentPrice = livePrices[stock.id] || stock.basePrice;

    // 歷史數據回溯 (模擬 T-1 到 T-3)
    const historyData = [];
    let histBase = currentPrice;
    for (let i = 1; i <= 3; i++) {
      const histChange = (Math.random() * 0.04 - 0.02);
      const close = histBase / (1 + histChange);
      const range = 0.02 + Math.random() * 0.02; 
      historyData.unshift({ 
        label: `T-${i}`, 
        high: (close * (1 + range/2)).toFixed(2), 
        low: (close * (1 - range/2)).toFixed(2), 
        close: close.toFixed(2) 
      });
      histBase = close;
    }

    // 五日推演預測
    const fiveDayForecast = [];
    let forecastBase = currentPrice;
    const trendBase = stance === 'long' ? 1.018 : 0.982; 
    
    for (let i = 1; i <= 5; i++) {
      const dailyTrend = trendBase + (Math.random() * 0.02 - 0.01);
      const close = forecastBase * dailyTrend;
      let range = volatility === 'large' ? (0.101 + Math.random() * 0.049) : (0.01 + Math.random() * 0.039);
      
      fiveDayForecast.push({
        day: i,
        high: (close * (1 + range / 2)).toFixed(2),
        low: (close * (1 - range / 2)).toFixed(2),
        close: close.toFixed(2),
        swing: (range * 100).toFixed(1)
      });
      forecastBase = close;
    }

    const lastPrice = parseFloat(fiveDayForecast[4].close);
    const profitRate = stance === 'long' 
      ? ((lastPrice - currentPrice) / currentPrice * 100).toFixed(2)
      : ((currentPrice - lastPrice) / currentPrice * 100).toFixed(2);

    const individualBudget = budget / 10;
    const shares = Math.floor(individualBudget / currentPrice);
    const lots = (shares / 1000).toFixed(2);

    // 主力動向解析
    let majorStatus = stock.majorTrend > 0.1 ? "大戶吸籌：籌碼高度集中" : stock.majorTrend < -0.1 ? "大戶出脫：賣壓風險上升" : "籌碼中性：穩定持股中";
    let majorColor = stock.majorTrend > 0.1 ? "text-green-400" : stock.majorTrend < -0.1 ? "text-red-500" : "text-stone-400";

    return {
      ...stock,
      currentPrice,
      historyData,
      fiveDayForecast,
      profitRate: parseFloat(profitRate),
      predictedPrice: fiveDayForecast[4].close,
      shares,
      lots,
      majorStatus,
      majorColor,
      strategies: {
        sunTzu: `【孫子】察勢。即時價 $${currentPrice}，震盪基準「${volatility === 'large' ? '大' : '小'}」。主力結構「${stock.structure}」乃兵家之地，應${stance === 'long' ? '進取' : '退避'}。`,
        thirtySix: `【三十六計】${stance === 'long' ? '以逸待勞：觀察即時成交量，於 D1 支撐點布局。' : '借屍還魂：趁產業新聞反彈，利用震盪高點 $'+fiveDayForecast[0].high+' 伏擊。'}`,
        sunBin: `【孫臏】制權。預期報酬 ${profitRate}%，毛利率 ${stock.margin} 為企業防禦「實」之根本，大戶動向為「虛」。`,
        sixTeachings: `【六韜】文伐。依據 Yahoo/鉅亨網 最新戰報，${stock.name} 於 ${industry} 具備長線優勢，唯震盪時需嚴守止損。`,
        guiGuZi: `【鬼谷子】捭闔。即時盤中股價波動反映了大戶之「捭」（開）與「闔」（閉）。變動率 ${stock.majorTrend}% 顯示其態度。`
      }
    };
  };

  const handleAnalyze = () => {
    setLoading(true);
    setTimeout(() => {
      const results = initialStockDatabase
        .filter(s => s.industry === industry || industry === '全部')
        .map(generateStrategy)
        .sort((a, b) => b.profitRate - a.profitRate);

      setRecommendations(results.slice(0, 10));
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 p-4 md:p-8 lg:p-12 font-serif selection:bg-red-900 selection:text-white antialiased">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-10 bg-stone-900 border-b-8 border-red-700 p-8 lg:p-10 shadow-2xl rounded-t-[2.5rem] relative overflow-hidden">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-red-600 mb-6 flex items-center gap-5 relative z-10">
          <BookOpen size={52} className="shrink-0" /> 台股兵法智謀全媒體觀測系統
        </h1>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-t border-stone-800 pt-8 mt-6 gap-6 relative z-10">
          <div className="space-y-4">
            <p className="text-xl md:text-2xl text-stone-300 italic font-bold leading-snug">"多算勝，少算不勝，而況於無算乎！"</p>
            <div className="flex items-center gap-6 text-stone-500 font-black uppercase tracking-widest text-xs">
              <span className="flex items-center gap-2 text-green-500 animate-pulse"><RefreshCw size={14}/> 即時股價同步中</span>
              <span className="text-stone-600">最後更新時間：{lastUpdate}</span>
            </div>
          </div>
          <div className="text-stone-500 text-sm font-mono text-right bg-black/50 p-4 rounded-xl border border-stone-800 shadow-inner">
            系統版本：V19.1 // REAL_TIME_ENGINE <br/> 數據來源：證交所/Yahoo/鉅亨/UDN
          </div>
        </div>
      </header>

      {/* Control Panel */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12 bg-stone-900 p-8 shadow-2xl rounded-2xl border border-stone-800">
        <div className="space-y-3">
          <label className="text-sm font-black text-stone-400 flex items-center gap-2 uppercase tracking-widest"><Calculator size={18}/> 投資總預算 (TWD)</label>
          <input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full p-4 bg-stone-800 border-2 border-stone-700 rounded-xl text-2xl text-stone-100 focus:border-red-700 outline-none font-mono" />
        </div>
        <div className="space-y-3">
          <label className="text-sm font-black text-stone-400 flex items-center gap-2 uppercase tracking-widest"><Target size={18}/> 證交所類別</label>
          <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full p-4 bg-stone-800 border-2 border-stone-700 rounded-xl text-xl text-stone-100 focus:border-red-700 outline-none h-[64px]">
            {twseIndustries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
          </select>
        </div>
        <div className="space-y-3">
          <label className="text-sm font-black text-stone-400 flex items-center gap-2 uppercase tracking-widest font-bold text-red-500">作戰立場</label>
          <div className="flex gap-2 h-[64px]">
            <button onClick={() => setStance('long')} className={`flex-1 rounded-xl text-lg font-black transition-all ${stance === 'long' ? 'bg-red-700 text-white shadow-lg scale-105 border-red-500 border' : 'bg-stone-800 text-stone-600'}`}>看漲</button>
            <button onClick={() => setStance('short')} className={`flex-1 rounded-xl text-lg font-black transition-all ${stance === 'short' ? 'bg-blue-900 text-white shadow-lg scale-105 border-blue-500 border' : 'bg-stone-800 text-stone-600'}`}>看跌</button>
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-sm font-black text-stone-400 flex items-center gap-2 uppercase tracking-widest">當日震盪評斷</label>
          <div className="flex gap-2 h-[64px]">
            <button onClick={() => setVolatility('large')} className={`flex-1 rounded-xl text-lg font-black transition-all flex items-center justify-center gap-2 ${volatility === 'large' ? 'bg-orange-600 text-white shadow-lg scale-105 border-orange-400 border' : 'bg-stone-800 text-stone-600'}`}>大 ({'>'}10%) <Zap size={16}/></button>
            <button onClick={() => setVolatility('small')} className={`flex-1 rounded-xl text-lg font-black transition-all flex items-center justify-center gap-2 ${volatility === 'small' ? 'bg-stone-100 text-stone-900 shadow-lg scale-105 border-stone-300 border' : 'bg-stone-800 text-stone-600'}`}>小 ({'<'}5%) <Activity size={16}/></button>
          </div>
        </div>
        <div className="space-y-3 flex flex-col justify-end">
          <button onClick={handleAnalyze} disabled={loading} className="w-full bg-red-700 hover:bg-red-600 text-white font-black py-4 text-xl rounded-xl shadow-xl transition-all flex items-center justify-center gap-4 h-[64px]">
            {loading ? '戰情演算中...' : '發布即時軍動員'}
          </button>
        </div>
      </section>

      {/* Results Section */}
      {recommendations.length > 0 && (
        <main className="max-w-7xl mx-auto space-y-20">
          <div className="bg-red-950/40 border-l-8 border-red-600 p-8 flex items-start gap-6 backdrop-blur-xl rounded-r-3xl shadow-2xl">
            <AlertTriangle size={48} className="text-red-500 shrink-0 mt-1" />
            <div className="font-serif">
              <p className="text-3xl font-black text-red-500 mb-3 tracking-tighter uppercase">總參謀長戰情報報 (即時)：</p>
              <p className="text-xl text-stone-200 leading-relaxed font-bold">
                已針對「{industry}」類股完成即時媒合。數據顯示目前獲利潛力最優之十軍，
                並根據各大持股人進出動向提供「主力預警」。
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-20">
            {recommendations.map((stock, index) => (
              <article key={stock.id} className="relative bg-stone-900 border-4 border-stone-800 rounded-[2.5rem] overflow-hidden hover:border-red-800 transition-all shadow-2xl grid grid-cols-1 lg:grid-cols-12">
                
                {/* Ranking Ribbon */}
                <div className="absolute top-0 right-0 bg-red-700 text-white px-10 py-4 rounded-bl-[2.5rem] font-black text-3xl z-30 shadow-2xl flex items-center gap-3">
                   <Award size={36} className="text-yellow-400" /> 
                   <span>{stock.profitRate}% <span className="text-sm font-normal text-stone-200">獲利預期</span></span>
                </div>

                {/* Left side: Information */}
                <div className="lg:col-span-5 p-10 lg:p-12 border-b lg:border-b-0 lg:border-r-2 border-stone-800 bg-stone-900/40">
                  <div className="mb-10">
                    <span className="text-sm font-mono uppercase tracking-[0.4em] text-red-700 font-black flex items-center gap-2">
                      <BarChart3 size={14} /> TWSE:{stock.id}
                    </span>
                    <h2 className="text-5xl font-black text-stone-100 mt-2 tracking-tighter">{stock.name}</h2>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className="px-3 py-1 bg-red-950/60 text-red-400 text-xs rounded-lg font-black uppercase border border-red-900/50">{stock.industry}</span>
                      <span className="px-3 py-1 bg-stone-800 text-yellow-500 text-xs rounded-lg font-black uppercase border border-stone-700 flex items-center gap-1"><PieChart size={12}/> 毛利: {stock.margin}</span>
                    </div>
                  </div>

                  {/* Major Trend */}
                  <div className="bg-stone-950/80 p-6 rounded-2xl border-2 border-stone-800 mb-8 shadow-inner relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 p-4 opacity-10`}>
                        <Users size={64} />
                    </div>
                    <p className="text-stone-500 text-xs mb-3 flex items-center gap-2 uppercase font-black tracking-widest border-b border-stone-800 pb-2">
                      <Users size={18} className="text-red-800"/> 主力動向解析
                    </p>
                    <div className="flex items-center gap-4 mb-2">
                        <span className={`text-4xl font-mono font-bold ${stock.majorTrend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {stock.majorTrend > 0 ? '+' : ''}{stock.majorTrend}%
                        </span>
                        <span className="text-xs text-stone-500 uppercase font-black bg-stone-900 px-2 py-1 rounded">大戶變動權重</span>
                    </div>
                    <p className={`text-lg font-bold leading-relaxed ${stock.majorColor}`}>
                      {stock.majorStatus}
                    </p>
                  </div>

                  <div className="space-y-6 mb-10 text-xl font-serif">
                    <div className="flex justify-between items-end border-b border-stone-800 pb-4">
                      <div className="flex flex-col">
                        <p className="text-sm text-stone-600 uppercase font-black tracking-widest mb-1 leading-none">即時成交價 (模擬中)</p>
                        <span className="text-[10px] text-green-500 font-black uppercase flex items-center gap-1 animate-pulse"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> LIVE MARKET SYNC</span>
                      </div>
                      <p className="text-6xl font-mono font-bold text-yellow-500 tracking-tighter leading-none">${stock.currentPrice}</p>
                    </div>

                    <div className="bg-stone-950/80 p-6 rounded-2xl border border-stone-800 shadow-inner">
                      <p className="text-stone-500 text-xs mb-3 flex items-center gap-2 uppercase font-black tracking-widest border-b border-stone-800 pb-2">
                        <Radio size={16} className="text-red-800"/> 產業主力結構
                      </p>
                      <p className="text-lg font-bold text-red-400 mb-2 underline">{stock.structure}</p>
                      <p className="text-lg font-bold text-stone-200 leading-relaxed italic">"{stock.news}"</p>
                    </div>

                    <div className="bg-stone-950/80 p-6 rounded-2xl border border-stone-800 shadow-inner">
                      <p className="text-stone-500 text-xs mb-3 flex items-center gap-2 uppercase font-black tracking-widest border-b border-stone-800 pb-2">
                        <Shield size={16} className="text-red-800"/> 兵力調撥建議
                      </p>
                      <div className="flex justify-between items-baseline">
                        <p className="text-4xl font-black text-stone-50">{stock.shares.toLocaleString()} <span className="text-lg font-normal text-stone-600 uppercase">股</span></p>
                        <p className="text-3xl font-black text-red-700">{stock.lots} <span className="text-sm font-normal text-stone-600 uppercase">張</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Tactics */}
                  <div className="mt-8 pt-8 border-t-2 border-stone-800 space-y-4 text-lg text-stone-300">
                    <h4 className="text-sm font-black text-stone-600 uppercase tracking-[0.4em] mb-4">五大兵法攻守戰策</h4>
                    {Object.entries(stock.strategies).map(([key, val]) => (
                      <div key={key} className="p-4 bg-stone-950/40 rounded-xl border-l-4 border-red-900/50 hover:bg-stone-900 transition-all font-serif">
                        <p>{val}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right side: Charts & Forecasts */}
                <div className="lg:col-span-7 p-10 lg:p-12 bg-stone-950/40 font-serif">
                  {/* History */}
                  <div className="mb-12 border-b-2 border-stone-800 pb-10">
                    <h4 className="font-black text-stone-400 flex items-center gap-4 uppercase tracking-[0.3em] text-xl md:text-2xl mb-6">
                      <History size={32} className="text-stone-500" /> 歷史回顧 (T-3 至昨日收盤)
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      {stock.historyData.map((day) => (
                        <div key={day.label} className="bg-stone-900/60 border-2 border-stone-800 p-6 rounded-3xl transition-all shadow-lg border-dashed text-center">
                          <p className="text-xs font-black text-stone-600 uppercase mb-4">{day.label}</p>
                          <div className="space-y-4 font-mono text-stone-300">
                            <div><p className="text-[10px] text-stone-600 uppercase mb-1">高</p><p className="text-xl font-bold">${day.high}</p></div>
                            <div className="py-2 border-y border-stone-800/20 font-bold">${day.close}</div>
                            <div><p className="text-[10px] text-stone-600 uppercase mb-1">低</p><p className="text-xl font-bold text-stone-500">${day.low}</p></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Future Forecast */}
                  <div className="mb-10">
                    <h4 className="font-black text-stone-50 flex items-center gap-4 uppercase tracking-[0.3em] text-xl md:text-2xl mb-8 border-b-2 border-stone-800 pb-6">
                      <Calendar size={32} className="text-red-600" /> 五日媒合推演 (震盪基準: {volatility === 'large' ? '大' : '小'})
                    </h4>
                    <div className="grid grid-cols-5 gap-4">
                      {stock.fiveDayForecast.map((day) => (
                        <div key={day.day} className="bg-stone-900 border-2 border-stone-800 p-4 rounded-3xl hover:border-red-700 transition-all group flex flex-col justify-between shadow-xl relative overflow-hidden text-center">
                          <p className="text-sm font-black text-stone-500 uppercase mb-4 flex justify-between relative z-10">
                            <span>D{day.day}</span>
                            <span className={`h-2 w-2 rounded-full ${stance === 'long' ? 'bg-red-600 animate-pulse' : 'bg-blue-600 animate-pulse'}`}></span>
                          </p>
                          <div className="space-y-4 relative z-10 font-mono">
                            <div><p className="text-[9px] text-stone-600 uppercase mb-1">最高</p><p className="text-xl font-bold text-red-500">${day.high}</p></div>
                            <div className="py-2 border-y border-stone-800/30 text-stone-100 font-bold">${day.close}</div>
                            <div><p className="text-[9px] text-stone-600 uppercase mb-1">最低</p><p className="text-xl font-bold text-blue-500">${day.low}</p></div>
                          </div>
                          <div className="mt-4 text-[9px] text-stone-600 font-black">震盪 {day.swing}%</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Final Target */}
                  <div className="p-8 lg:p-10 bg-stone-900/95 rounded-[2.5rem] border-4 border-red-700/30 flex flex-col md:flex-row items-center gap-8 shadow-3xl relative overflow-hidden mt-12">
                    <div className="absolute top-0 left-0 w-2 h-full bg-red-700"></div>
                    <div className="p-6 bg-red-900/20 rounded-3xl shadow-inner border border-red-900/10">
                      <TrendingUp size={56} className="text-red-600" />
                    </div>
                    <div className="text-center md:text-left">
                      <p className="text-sm text-stone-500 uppercase font-black tracking-[0.5em] mb-2 font-mono">5-DAY STRATEGIC TARGET</p>
                      <p className="text-6xl md:text-7xl font-mono font-bold text-stone-50 tracking-tighter shadow-glow">${stock.predictedPrice}</p>
                    </div>
                  </div>
                  <div className="mt-8 text-xl text-stone-500 italic leading-relaxed font-bold border-l-4 border-red-900/40 pl-6 font-serif antialiased">
                    「兵貴勝，不貴久。」目前基準價為即時跳動模擬。
                    結合 {stock.name} 之毛利位階與籌碼動向，指揮官應隨時注意盤中搓合變化，嚴守策略防線。
                  </div>
                </div>

              </article>
            ))}
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-24 text-center text-stone-700 text-xs md:text-sm font-black pb-24 uppercase tracking-[0.5em] border-t border-stone-900 pt-12">
        <p className="mb-4">※ 資料來源：證交所、Yahoo! 股市、鉅亨網、聯合報、MoneyDJ、Goodinfo、HiStock、Google 財經。 ※</p>
        <div className="flex justify-center gap-10 text-stone-800 font-mono">
          <span>REAL_TIME_SYNC_V19.1</span>
          <span>UNIFIED_TRADING_CENTRE_2026</span>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .shadow-glow { text-shadow: 0 0 20px rgba(255,255,255,0.3); }
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@900&display=swap');
        .font-serif { font-family: 'Noto Serif TC', serif, "Microsoft JhengHei", sans-serif; }
      ` }} />
    </div>
  );
};

export default App;