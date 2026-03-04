import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UploadCloud, 
  FileText, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  History, 
  Bell, 
  Settings, 
  User,
  ChevronRight,
  FileSearch,
  Fingerprint,
  Cpu,
  X,
  File,
  AlertCircle,
  ArrowLeft,
  Edit2,
  Check,
  Plus,
  PlayCircle,
  Loader2,
  Circle,
  ArrowRight,
  Download
} from 'lucide-react';

// Configuration Constants
const ALL_CHECK_TYPES = ['资信标比对', '技术标比对', '经济标比对', '文件设备特征比对'];
const ALL_CREDIT_ITEMS = ['法人名称', '法定代表人', '盖章重复', '手机号', '邮箱', '电子证照', '图片文字', '引用内容', '地址', '人员重复', '文件属性'];
const ALL_TECH_ITEMS = ['全文语句', '过滤招标文件', 'Word属性', '图片比对', '图片文字', '表格文字', '敏感信息', '签章', '引用内容'];
const ALL_ECONOMIC_ITEMS = ['清单内容比对'];

// Mock Data
const INSPECTION_POINTS = [
  { id: 1, title: '资信标比对', desc: '深度比对法人名称、法定代表人、盖章重复、联系方式及电子证照等关键资信信息。', icon: <Clock className="w-6 h-6 text-blue-500" /> },
  { id: 2, title: '技术标比对', desc: '基于自然语言处理，比对全文语句、表格文字、图片内容及敏感信息，支持过滤招标文件。', icon: <FileSearch className="w-6 h-6 text-emerald-500" /> },
  { id: 3, title: '经济标比对', desc: '精准提取并比对工程量清单、报价明细等核心经济数据。', icon: <Fingerprint className="w-6 h-6 text-amber-500" /> },
  { id: 4, title: '文件设备特征比对', desc: '识别生成文档的计算机MAC地址、硬盘序列号及Word属性等底层硬件特征。', icon: <Cpu className="w-6 h-6 text-purple-500" /> },
];

const NEWS_ITEMS = [
  { id: 1, date: '2026-03-02', title: '系统升级公告：新增PDF文档深度解析算法，提升比对精度', type: '公告' },
  { id: 2, date: '2026-02-28', title: '如何利用多版本比对功能快速定位合同条款变更？', type: '指南' },
  { id: 3, date: '2026-02-15', title: '研发文档版本混乱？一键比对帮你找出最新有效版本', type: '案例' },
  { id: 4, date: '2026-01-20', title: '关于优化大文件（>50MB）比对速度的更新说明', type: '更新' },
];

const HISTORY_ITEMS = [
  { id: 'CMP-20260301-01', name: '《产品需求文档(PRD)》V2与V3版本比对', date: '2026-03-01 14:30', status: '已完成', risk: '中风险', files: 2 },
  { id: 'CMP-20260225-03', name: '年度采购合同修订版审查', date: '2026-02-25 09:15', status: '有差异', risk: '高风险', files: 2 },
  { id: 'CMP-20260220-02', name: 'Q1季度财务报表多部门汇总核对', date: '2026-02-20 16:45', status: '已完成', risk: '低风险', files: 5 },
];

type FileItem = { 
  id: string; 
  name: string; 
  size: number; 
  status: '未比对' | '比对中' | '已完成';
  risks?: {
    credit: number;
    tech: number;
    economic: number;
    device: number;
  }
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'project' | 'comparing' | 'report'>('home');
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Project Page State
  const [projectName, setProjectName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Report States
  const [reportTab, setReportTab] = useState<'credit' | 'tech'>('credit');
  const [techFileA, setTechFileA] = useState<string>('');
  const [techFileB, setTechFileB] = useState<string>('');
  const [activeDuplicateId, setActiveDuplicateId] = useState<number | null>(null);
  const pdfARef = useRef<HTMLDivElement>(null);
  const pdfBRef = useRef<HTMLDivElement>(null);

  // Config State
  const [selectedCheckTypes, setSelectedCheckTypes] = useState<string[]>(ALL_CHECK_TYPES);
  const [selectedCreditItems, setSelectedCreditItems] = useState<string[]>(ALL_CREDIT_ITEMS);
  const [selectedTechItems, setSelectedTechItems] = useState<string[]>(ALL_TECH_ITEMS);
  const [selectedEconomicItems, setSelectedEconomicItems] = useState<string[]>(ALL_ECONOMIC_ITEMS);
  const [threshold, setThreshold] = useState(30);
  const [filterBiddingDoc, setFilterBiddingDoc] = useState(true);
  const [biddingDocFile, setBiddingDocFile] = useState<{id: string, name: string, size: number} | null>(null);
  const [biddingDocError, setBiddingDocError] = useState<string | null>(null);
  const [enableAI, setEnableAI] = useState(true);

  // Purchase & Comparing State
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedSku, setSelectedSku] = useState<'month' | 'once'>('month');
  const [comparingProgress, setComparingProgress] = useState<{
    currentTypeIndex: number;
    currentItemIndex: number;
    completedItems: string[];
    isFinished: boolean;
  }>({
    currentTypeIndex: 0,
    currentItemIndex: 0,
    completedItems: [],
    isFinished: false
  });

  // History State
  const [historyItems, setHistoryItems] = useState(HISTORY_ITEMS);

  const [compareLogs, setCompareLogs] = useState<{id: number, time: string, text: string, type: string}[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [compareLogs]);

  const getTasks = () => {
    const tasks = [];
    if (selectedCheckTypes.includes('资信标比对') && selectedCreditItems.length > 0) {
      tasks.push({ type: '资信标比对', items: selectedCreditItems });
    }
    if (selectedCheckTypes.includes('技术标比对') && selectedTechItems.length > 0) {
      tasks.push({ type: '技术标比对', items: selectedTechItems });
    }
    if (selectedCheckTypes.includes('经济标比对') && selectedEconomicItems.length > 0) {
      tasks.push({ type: '经济标比对', items: selectedEconomicItems });
    }
    if (selectedCheckTypes.includes('文件设备特征比对')) {
      tasks.push({ type: '文件设备特征比对', items: ['底层硬件特征提取', 'MAC地址比对', '硬盘序列号比对'] });
    }
    return tasks;
  };

  // Report Mock Data & Helpers
  const comparingFiles = files.filter(f => f.status === '已完成' || f.status === '比对中');
  const creditItems = selectedCreditItems.length > 0 ? selectedCreditItems : ['法定代表人', '项目经理', '联系电话', '投标总价'];

  useEffect(() => {
    if (currentPage === 'report' && comparingFiles.length >= 2) {
      if (!techFileA) setTechFileA(comparingFiles[0].id);
      if (!techFileB) setTechFileB(comparingFiles[1].id);
    }
  }, [currentPage, comparingFiles]);

  const mockDuplicates = [
    { id: 1, title: '施工组织设计-3.1节', similarity: '98%', lineA: 15, lineB: 18, text: '本工程基础采用旋挖钻孔灌注桩，桩径为800mm，桩长约25m...' },
    { id: 2, title: '安全保证措施-5.2节', similarity: '100%', lineA: 42, lineB: 42, text: '建立健全安全生产责任制，项目经理为第一责任人，全面负责现场安全管理...' },
    { id: 3, title: '质量控制标准-附录', similarity: '95%', lineA: 85, lineB: 90, text: '严格执行GB50300-2013建筑工程施工质量验收统一标准，确保工程合格率100%...' },
  ];

  const handleDuplicateClick = (dup: any) => {
    setActiveDuplicateId(dup.id);
    const elA = pdfARef.current?.querySelector(`[data-line="${dup.lineA}"]`);
    const elB = pdfBRef.current?.querySelector(`[data-line="${dup.lineB}"]`);
    elA?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    elB?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const mockCreditData = comparingFiles.map((f, i) => ({
    id: f.id,
    name: f.name,
    values: creditItems.map((item, j) => {
      if (item === '联系电话') return i % 2 === 0 ? '13812345678' : '13987654321';
      if (item === '项目经理') return i === 0 || i === 2 ? '张建国' : '李伟';
      if (item === '法定代表人') return i === 1 || i === 3 ? '王大拿' : '赵四';
      if (item === '投标总价') return `${(1500 + i * 10).toLocaleString()} 万元`;
      return `合规数据 ${i}-${j}`;
    })
  }));

  const isCreditValueDuplicate = (colIndex: number, value: string) => {
    const allValues = mockCreditData.map(d => d.values[colIndex]);
    return allValues.filter(v => v === value).length > 1;
  };

  const renderMockPdfPage = (fileId: string, ref: any, isFileA: boolean) => {
    return (
      <div className="flex-1 bg-white overflow-y-auto shadow-inner p-8 text-sm leading-relaxed font-serif text-slate-700 relative border border-slate-200 rounded-b-lg" ref={ref}>
        {Array.from({ length: 120 }).map((_, i) => {
          const dup = mockDuplicates.find(d => (isFileA ? d.lineA : d.lineB) === i);
          const isActive = dup && activeDuplicateId === dup.id;
          return (
            <div 
              key={i} 
              data-line={i} 
              className={`py-1 px-2 rounded transition-colors ${isActive ? 'bg-red-200 text-red-900 font-medium shadow-sm' : dup ? 'bg-red-50 text-red-800 cursor-pointer hover:bg-red-100' : ''}`}
              onClick={() => dup && handleDuplicateClick(dup)}
            >
              {dup ? dup.text : `第 ${i + 1} 行：本项目严格按照国家标准执行，确保工程质量和安全进度符合招标文件要求，特此声明...`}
            </div>
          );
        })}
      </div>
    );
  };

  useEffect(() => {
    if (currentPage === 'comparing') {
      const tasks = getTasks();
      if (tasks.length === 0) {
        setComparingProgress(prev => ({ ...prev, isFinished: true }));
        return;
      }

      let typeIdx = 0;
      let itemIdx = 0;
      const completed: string[] = [];
      const comparingFiles = files.filter(f => f.status === '比对中' || f.status === '已完成');
      
      let logId = 0;
      const addLog = (text: string, type: string = 'info') => {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
        setCompareLogs(prev => [...prev, { id: logId++, time: timeStr, text, type }]);
      };

      setCompareLogs([]);
      addLog(`[System] 初始化多版本比对引擎 v2.0...`);
      addLog(`[System] 加载 ${comparingFiles.length} 份待比对文件...`);
      addLog(`[System] 分配计算资源，准备执行深度交叉解析...`);

      const interval = setInterval(() => {
        const currentTaskGroup = tasks[typeIdx];
        
        if (itemIdx < currentTaskGroup.items.length) {
          const currentItem = currentTaskGroup.items[itemIdx];
          completed.push(`${currentTaskGroup.type}-${currentItem}`);
          
          const file1 = comparingFiles[Math.floor(Math.random() * comparingFiles.length)]?.name || '文件A';
          let file2 = comparingFiles[Math.floor(Math.random() * comparingFiles.length)]?.name || '文件B';
          while (file1 === file2 && comparingFiles.length > 1) {
             file2 = comparingFiles[Math.floor(Math.random() * comparingFiles.length)]?.name || '文件B';
          }
          
          const actions = [
            `[${currentTaskGroup.type}] 正在提取 ${file1} 的 [${currentItem}] 特征向量...`,
            `[${currentTaskGroup.type}] 交叉比对: ${file1} <=> ${file2} (${currentItem})`,
            `[${currentTaskGroup.type}] 深度分析 ${file1} 与 ${file2} 的 ${currentItem} 相似度...`,
            `[${currentTaskGroup.type}] 正在构建 ${currentItem} 关联图谱...`
          ];
          addLog(actions[Math.floor(Math.random() * actions.length)]);

          itemIdx++;
          setComparingProgress({
            currentTypeIndex: typeIdx,
            currentItemIndex: itemIdx,
            completedItems: [...completed],
            isFinished: false
          });
        } else {
          addLog(`[Success] ✅ 完成 ${currentTaskGroup.type} 所有检测项。`, 'success');
          typeIdx++;
          itemIdx = 0;
          if (typeIdx >= tasks.length) {
            clearInterval(interval);
            addLog(`[System] 🎉 所有比对任务执行完毕，正在汇总风险点并生成报告...`, 'success');
            setComparingProgress({
              currentTypeIndex: typeIdx,
              currentItemIndex: itemIdx,
              completedItems: [...completed],
              isFinished: true
            });
            
            setFiles(prev => prev.map(f => f.status === '比对中' ? { 
              ...f, 
              status: '已完成',
              risks: {
                credit: selectedCheckTypes.includes('资信标比对') ? Math.floor(Math.random() * 3) : 0,
                tech: selectedCheckTypes.includes('技术标比对') ? Math.floor(Math.random() * 5) : 0,
                economic: selectedCheckTypes.includes('经济标比对') ? Math.floor(Math.random() * 2) : 0,
                device: selectedCheckTypes.includes('文件设备特征比对') ? Math.floor(Math.random() * 2) : 0
              }
            } : f));

            setHistoryItems(prev => {
              if (prev.length === 0) return prev;
              const newItems = [...prev];
              const risks = ['高风险', '中风险', '低风险'];
              newItems[0] = {
                ...newItems[0],
                status: '已完成',
                risk: risks[Math.floor(Math.random() * risks.length)],
              };
              return newItems;
            });

            setTimeout(() => {
              setCurrentPage('report');
            }, 2000);
          } else {
            addLog(`[System] 开始执行 ${tasks[typeIdx].type}...`);
            setComparingProgress({
              currentTypeIndex: typeIdx,
              currentItemIndex: itemIdx,
              completedItems: [...completed],
              isFinished: false
            });
          }
        }
      }, 600);

      return () => clearInterval(interval);
    }
  }, [currentPage]);

  const handleCheckTypeToggle = (type: string) => {
    const isChecked = selectedCheckTypes.includes(type);
    if (isChecked) {
      setSelectedCheckTypes(prev => prev.filter(t => t !== type));
      if (type === '资信标比对') setSelectedCreditItems([]);
      if (type === '技术标比对') setSelectedTechItems([]);
      if (type === '经济标比对') setSelectedEconomicItems([]);
    } else {
      setSelectedCheckTypes(prev => [...prev, type]);
      if (type === '资信标比对') setSelectedCreditItems(ALL_CREDIT_ITEMS);
      if (type === '技术标比对') setSelectedTechItems(ALL_TECH_ITEMS);
      if (type === '经济标比对') setSelectedEconomicItems(ALL_ECONOMIC_ITEMS);
    }
  };

  const handleItemToggle = (
    item: string, 
    selectedItems: string[], 
    setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>,
    parentType: string
  ) => {
    const isChecked = selectedItems.includes(item);
    let newSelectedItems;
    if (isChecked) {
      newSelectedItems = selectedItems.filter(i => i !== item);
    } else {
      newSelectedItems = [...selectedItems, item];
    }
    setSelectedItems(newSelectedItems);

    if (newSelectedItems.length === 0) {
      setSelectedCheckTypes(prev => prev.filter(t => t !== parentType));
    } else if (!selectedCheckTypes.includes(parentType)) {
      setSelectedCheckTypes(prev => [...prev, parentType]);
    }
  };

  const handleBiddingDocInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBiddingDocError(null);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 100 * 1024 * 1024) {
        setBiddingDocError('招标文件大小不能超过 100MB');
        return;
      }
      setBiddingDocFile({
        id: Math.random().toString(36).substring(7),
        name: file.name,
        size: file.size
      });
    }
    e.target.value = '';
  };

  const removeBiddingDoc = () => {
    setBiddingDocFile(null);
    setBiddingDocError(null);
  };

  const MAX_FILES = 8;
  const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500MB

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const processFiles = (newFiles: FileList | File[]) => {
    setErrorMsg(null);
    const currentTotalSize = files.reduce((acc, f) => acc + f.size, 0);
    let newTotalSize = currentTotalSize;
    const validFiles: FileItem[] = [];

    const fileArray = Array.from(newFiles);

    if (files.length + fileArray.length > MAX_FILES) {
      setErrorMsg(`最多只能上传 ${MAX_FILES} 个文件`);
      return;
    }

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      newTotalSize += file.size;
      if (newTotalSize > MAX_TOTAL_SIZE) {
        setErrorMsg(`总文件大小不能超过 500MB`);
        return;
      }
      validFiles.push({
        id: Math.random().toString(36).substring(7),
        name: file.name,
        size: file.size,
        status: '未比对'
      });
    }

    const updatedFiles = [...files, ...validFiles];
    setFiles(updatedFiles);

    // If coming from home page, set project name and navigate
    if (currentPage === 'home' && validFiles.length > 0) {
      const defaultName = `${validFiles[0].name}等${updatedFiles.length}份文件`;
      setProjectName(defaultName);
      setCurrentPage('project');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    e.target.value = '';
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
    setErrorMsg(null);
  };

  const handleStartComparisonClick = () => {
    if (files.length < 2) {
      setErrorMsg('至少需要2个文件才能进行比对');
      return;
    }
    setShowPurchaseModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPurchaseModal(false);
    
    setFiles(files.map(f => f.status === '未比对' ? { 
      ...f, 
      status: '比对中',
      risks: { credit: 0, tech: 0, economic: 0, device: 0 }
    } : f));

    // Add to history
    const newHistoryItem = {
      id: `CMP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`,
      name: projectName || '未命名项目',
      date: new Date().toLocaleString('zh-CN', { hour12: false }).slice(0, 16),
      status: '检查中',
      risk: '-',
      files: files.filter(f => f.status === '未比对' || f.status === '比对中').length
    };
    setHistoryItems(prev => [newHistoryItem, ...prev]);

    setComparingProgress({
      currentTypeIndex: 0,
      currentItemIndex: 0,
      completedItems: [],
      isFinished: false
    });

    setCurrentPage('comparing');
  };

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('home')}>
            <div className="bg-indigo-600 p-2 rounded-lg">
              <FileSearch className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">多版本文件比对系统</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className={`font-medium transition-colors ${currentPage === 'home' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`} onClick={() => setCurrentPage('home')}>首页</a>
            <a href="#" className="text-slate-500 hover:text-slate-900 transition-colors">历史记录</a>
            <a href="#" className="text-slate-500 hover:text-slate-900 transition-colors">规则配置</a>
            <a href="#" className="text-slate-500 hover:text-slate-900 transition-colors">数据分析</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Hero / Upload Section */}
              <section>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-slate-900">新建比对任务</h1>
                  <p className="text-slate-500 mt-1">上传多个版本的文件，系统将自动进行深度重复性分析。</p>
                </div>
                
                <div 
                  className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ease-in-out ${
                    isDragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                    <UploadCloud className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">点击或拖拽文件到此处上传</h3>
                  <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                    支持 .doc, .docx, .pdf, 清单文件, 非加密投标文件。最多支持上传 8 个文件，总大小不超过 500MB。
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <label className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer">
                      选择文件
                      <input type="file" multiple className="hidden" onChange={handleFileInput} accept=".doc,.docx,.pdf,.xls,.xlsx,.xml" />
                    </label>
                    <button className="bg-white border border-slate-300 text-slate-700 px-6 py-2.5 rounded-lg font-medium hover:bg-slate-50 transition-colors shadow-sm">
                      导入项目文件夹
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {errorMsg && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{errorMsg}</p>
                  </motion.div>
                )}
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Inspection Points & History */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Inspection Points */}
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        系统检查点
                      </h2>
                      <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center">
                        查看全部规则 <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {INSPECTION_POINTS.map((point) => (
                        <div key={point.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-4">
                            <div className="p-2 bg-slate-50 rounded-lg shrink-0">
                              {point.icon}
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-800 mb-1">{point.title}</h3>
                              <p className="text-sm text-slate-500 leading-relaxed">{point.desc}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* History Section */}
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <History className="w-5 h-5 text-slate-500" />
                        历史检查项目
                      </h2>
                      <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center">
                        查看更多 <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                              <th className="py-3 px-4 font-medium whitespace-nowrap">项目编号/名称</th>
                              <th className="py-3 px-4 font-medium whitespace-nowrap">检查时间</th>
                              <th className="py-3 px-4 font-medium whitespace-nowrap">文件数</th>
                              <th className="py-3 px-4 font-medium whitespace-nowrap">风险评估</th>
                              <th className="py-3 px-4 font-medium whitespace-nowrap">状态</th>
                              <th className="py-3 px-4 font-medium text-right whitespace-nowrap">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {historyItems.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-3 px-4 min-w-[200px]">
                                  <div className="font-medium text-slate-800">{item.name}</div>
                                  <div className="text-xs text-slate-400 mt-0.5">{item.id}</div>
                                </td>
                                <td className="py-3 px-4 text-sm text-slate-600 whitespace-nowrap">{item.date}</td>
                                <td className="py-3 px-4 text-sm text-slate-600 whitespace-nowrap">{item.files} 份</td>
                                <td className="py-3 px-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                                    item.risk === '-' ? 'bg-slate-50 text-slate-500 border border-slate-200' :
                                    item.risk === '高风险' ? 'bg-red-50 text-red-700 border border-red-200' :
                                    item.risk === '中风险' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                    'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  }`}>
                                    {item.risk}
                                  </span>
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                                    item.status === '检查中' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                    item.status === '已完成' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                    item.status === '有差异' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                    'bg-slate-50 text-slate-700 border border-slate-200'
                                  }`}>
                                    {item.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right whitespace-nowrap">
                                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">查看报告</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Right Column: News & Announcements */}
                <div className="space-y-6">
                  <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-indigo-500" />
                        系统公告与指南
                      </h2>
                    </div>
                    <div className="space-y-4">
                      {NEWS_ITEMS.map((news) => (
                        <a key={news.id} href="#" className="block group">
                          <div className="flex items-start gap-3">
                            <span className={`shrink-0 mt-0.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                              news.type === '公告' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                              news.type === '更新' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                              news.type === '指南' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                              'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {news.type}
                            </span>
                            <div>
                              <h4 className="text-sm font-medium text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                                {news.title}
                              </h4>
                              <p className="text-xs text-slate-400 mt-1.5">{news.date}</p>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                    <button className="w-full mt-5 py-2 text-sm text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors font-medium">
                      查看更多资讯
                    </button>
                  </section>

                  {/* Quick Stats or Info Card */}
                  <section className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl shadow-md p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
                    <div className="relative z-10">
                      <h3 className="font-semibold text-lg mb-2">本月比对统计</h3>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-indigo-100 text-sm">累计比对文件</p>
                          <p className="text-3xl font-bold mt-1">1,284</p>
                        </div>
                        <div>
                          <p className="text-indigo-100 text-sm">发现差异项目</p>
                          <p className="text-3xl font-bold mt-1">12</p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </motion.div>
          )}

          {currentPage === 'project' && (
            <motion.div 
              key="project"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Project Header */}
              <div className="flex items-center gap-4 mb-8">
                <button 
                  onClick={() => setCurrentPage('home')}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex-1 flex items-center gap-3">
                  {isEditingName ? (
                    <div className="flex items-center gap-2 w-full max-w-md">
                      <input
                        ref={nameInputRef}
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="flex-1 text-2xl font-bold text-slate-900 bg-white border border-indigo-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                        onBlur={() => setIsEditingName(false)}
                      />
                      <button onClick={() => setIsEditingName(false)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md">
                        <Check className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 group">
                      <h1 className="text-2xl font-bold text-slate-900">{projectName}</h1>
                      <button 
                        onClick={() => setIsEditingName(true)}
                        className="p-1.5 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {/* 1. File List */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-500" />
                        待比对文件
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        共 {files.length} 份文件，总大小 {formatSize(files.reduce((acc, f) => acc + f.size, 0))}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm cursor-pointer flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        添加文件
                        <input type="file" multiple className="hidden" onChange={handleFileInput} accept=".doc,.docx,.pdf,.xls,.xlsx,.xml" />
                      </label>
                      <button 
                        onClick={handleStartComparisonClick}
                        disabled={files.length < 2 || files.every(f => f.status === '比对中')}
                        className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PlayCircle className="w-4 h-4" />
                        开始比对
                      </button>
                    </div>
                  </div>
                  
                  {errorMsg && (
                    <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {errorMsg}
                    </div>
                  )}

                  <div className="p-2">
                    {files.length === 0 ? (
                      <div className="text-center py-12">
                        <File className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">暂无文件，请点击上方按钮添加</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {files.map(file => (
                          <div key={file.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg group transition-colors">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <File className="w-5 h-5 text-slate-400 shrink-0" />
                              <div className="truncate">
                                <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{formatSize(file.size)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 shrink-0 pl-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                                file.status === '已完成' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                file.status === '比对中' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}>
                                {file.status === '比对中' && <Loader2 className="w-3 h-3 animate-spin" />}
                                {file.status}
                              </span>
                              <button 
                                onClick={() => removeFile(file.id)} 
                                disabled={file.status === '比对中'}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all disabled:opacity-0"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Configuration */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-lg font-bold text-slate-800">比对规则配置</h2>
                  </div>
                  <div className="p-6 space-y-8">
                    {/* 检查类型 */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800 mb-4 border-l-4 border-indigo-500 pl-2">检查类型</h3>
                      <div className="flex flex-wrap gap-6">
                        {ALL_CHECK_TYPES.map(type => (
                          <label key={type} className="flex items-center gap-2.5 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                              <input 
                                type="checkbox" 
                                className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-md checked:bg-indigo-600 checked:border-indigo-600 transition-colors cursor-pointer"
                                checked={selectedCheckTypes.includes(type)}
                                onChange={() => handleCheckTypeToggle(type)}
                              />
                              <Check className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* 资信标比对项 */}
                    <div className={`transition-opacity duration-200 ${selectedCheckTypes.includes('资信标比对') ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                      <h3 className="text-sm font-semibold text-slate-800 mb-4 border-l-4 border-blue-500 pl-2">资信标比对项</h3>
                      <div className="flex flex-wrap gap-x-6 gap-y-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                        {ALL_CREDIT_ITEMS.map(item => (
                          <label key={item} className="flex items-center gap-2 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              checked={selectedCreditItems.includes(item)}
                              onChange={() => handleItemToggle(item, selectedCreditItems, setSelectedCreditItems, '资信标比对')}
                            />
                            <span className="text-sm text-slate-600 group-hover:text-slate-900">{item}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* 技术标比对项 */}
                    <div className={`transition-opacity duration-200 ${selectedCheckTypes.includes('技术标比对') ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                      <h3 className="text-sm font-semibold text-slate-800 mb-4 border-l-4 border-emerald-500 pl-2">技术标比对项</h3>
                      <div className="flex flex-wrap gap-x-6 gap-y-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                        {ALL_TECH_ITEMS.map(item => (
                          <label key={item} className="flex items-center gap-2 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              checked={selectedTechItems.includes(item)}
                              onChange={() => handleItemToggle(item, selectedTechItems, setSelectedTechItems, '技术标比对')}
                            />
                            <span className="text-sm text-slate-600 group-hover:text-slate-900">{item}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* 经济标比对项 */}
                    <div className={`transition-opacity duration-200 ${selectedCheckTypes.includes('经济标比对') ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                      <h3 className="text-sm font-semibold text-slate-800 mb-4 border-l-4 border-amber-500 pl-2">经济标比对项</h3>
                      <div className="flex flex-wrap gap-x-6 gap-y-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                        {ALL_ECONOMIC_ITEMS.map(item => (
                          <label key={item} className="flex items-center gap-2 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              checked={selectedEconomicItems.includes(item)}
                              onChange={() => handleItemToggle(item, selectedEconomicItems, setSelectedEconomicItems, '经济标比对')}
                            />
                            <span className="text-sm text-slate-600 group-hover:text-slate-900">{item}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* 高级配置 */}
                    <div className="pt-6 border-t border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-800 mb-5 border-l-4 border-purple-500 pl-2">高级配置</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="bg-slate-50 p-5 rounded-lg border border-slate-100">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-slate-700">技术标内容比对阈值</span>
                            <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{threshold}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="10" 
                            max="100" 
                            value={threshold} 
                            onChange={(e) => setThreshold(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                          <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                            <span>10%</span>
                            <span>100%</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-4 bg-slate-50 p-5 rounded-lg border border-slate-100">
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                              <input 
                                type="checkbox" 
                                className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-md checked:bg-indigo-600 checked:border-indigo-600 transition-colors cursor-pointer"
                                checked={filterBiddingDoc}
                                onChange={(e) => setFilterBiddingDoc(e.target.checked)}
                              />
                              <Check className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">过滤招标文件内容</span>
                          </label>
                          
                          {filterBiddingDoc && (
                            <div className="pl-8">
                              {biddingDocFile ? (
                                <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg group">
                                  <div className="flex items-center gap-3 overflow-hidden">
                                    <File className="w-4 h-4 text-indigo-500 shrink-0" />
                                    <div className="truncate">
                                      <p className="text-sm font-medium text-slate-700 truncate">{biddingDocFile.name}</p>
                                      <p className="text-xs text-slate-400 mt-0.5">{formatSize(biddingDocFile.size)}</p>
                                    </div>
                                  </div>
                                  <button onClick={removeBiddingDoc} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all">
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors cursor-pointer bg-white">
                                  <div className="flex flex-col items-center gap-2">
                                    <UploadCloud className="w-5 h-5 text-slate-400" />
                                    <span className="text-sm text-slate-600 font-medium">点击上传招标文件</span>
                                    <span className="text-xs text-slate-400">支持单文件，最大 100MB</span>
                                  </div>
                                  <input type="file" className="hidden" onChange={handleBiddingDocInput} accept=".doc,.docx,.pdf" />
                                </label>
                              )}
                              {biddingDocError && (
                                <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {biddingDocError}
                                </p>
                              )}
                            </div>
                          )}

                          <label className="flex items-center gap-3 cursor-pointer group mt-2">
                            <div className="relative flex items-center justify-center">
                              <input 
                                type="checkbox" 
                                className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-md checked:bg-indigo-600 checked:border-indigo-600 transition-colors cursor-pointer"
                                checked={enableAI}
                                onChange={(e) => setEnableAI(e.target.checked)}
                              />
                              <Check className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">启用AI深度分析</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Records */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <History className="w-5 h-5 text-slate-500" />
                      比对记录
                    </h2>
                  </div>
                  <div className="p-0 overflow-x-auto">
                    {files.filter(f => f.status !== '未比对').length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-sm text-slate-500">暂无比对记录</p>
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
                            <th className="py-3 px-4 font-medium whitespace-nowrap">文件名</th>
                            <th className="py-3 px-4 font-medium whitespace-nowrap text-center">资信标风险点</th>
                            <th className="py-3 px-4 font-medium whitespace-nowrap text-center">技术标风险点</th>
                            <th className="py-3 px-4 font-medium whitespace-nowrap text-center">经济标风险点</th>
                            <th className="py-3 px-4 font-medium whitespace-nowrap text-center">设备特征风险点</th>
                            <th className="py-3 px-4 font-medium whitespace-nowrap text-center">状态</th>
                            <th className="py-3 px-4 font-medium text-right whitespace-nowrap">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {files.filter(f => f.status !== '未比对').map(file => (
                            <tr key={file.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3 px-4">
                                <div className="text-sm font-medium text-slate-700 max-w-[200px] truncate" title={file.name}>
                                  {file.name}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center">
                                {file.status === '比对中' || !file.risks ? <span className="text-slate-400">-</span> : (
                                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${file.risks.credit > 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>{file.risks.credit}</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center">
                                {file.status === '比对中' || !file.risks ? <span className="text-slate-400">-</span> : (
                                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${file.risks.tech > 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>{file.risks.tech}</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center">
                                {file.status === '比对中' || !file.risks ? <span className="text-slate-400">-</span> : (
                                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${file.risks.economic > 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>{file.risks.economic}</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center">
                                {file.status === '比对中' || !file.risks ? <span className="text-slate-400">-</span> : (
                                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${file.risks.device > 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>{file.risks.device}</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                  file.status === '已完成' ? 'bg-emerald-50 text-emerald-700' :
                                  file.status === '比对中' ? 'bg-blue-50 text-blue-700' :
                                  'bg-slate-100 text-slate-600'
                                }`}>
                                  {file.status === '比对中' && <Loader2 className="w-3 h-3 animate-spin" />}
                                  {file.status === '比对中' ? '检查中' : file.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                <button 
                                  disabled={file.status === '比对中'}
                                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  查看详情
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentPage === 'comparing' && (
            <motion.div
              key="comparing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl mx-auto py-8 px-4"
            >
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col">
                {/* Header */}
                <div className="p-8 text-center border-b border-slate-100 bg-slate-50 relative overflow-hidden">
                  {!comparingProgress.isFinished && (
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                      <motion.div 
                        className="absolute top-0 left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                      />
                    </div>
                  )}
                  <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4 shadow-inner">
                      {comparingProgress.isFinished ? <Check className="w-8 h-8" /> : <Loader2 className="w-8 h-8 animate-spin" />}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      {comparingProgress.isFinished ? '比对完成' : '正在进行多版本文件深度比对...'}
                    </h2>
                    <p className="text-slate-500 mt-2">
                      {comparingProgress.isFinished ? '已完成所有检查项，发现潜在风险点。' : 'AI 引擎正在进行交叉比对与特征提取，请耐心等待。'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row border-b border-slate-100">
                  {/* Left: Files */}
                  <div className="lg:w-1/3 p-6 border-r border-slate-100 bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-500" />
                      参与比对文件 ({files.filter(f => f.status === '比对中' || f.status === '已完成').length})
                    </h3>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      {files.filter(f => f.status === '比对中' || f.status === '已完成').map(f => (
                        <div key={f.id} className="p-3 bg-white border border-slate-200 rounded-lg flex items-center gap-3 relative overflow-hidden shadow-sm">
                          {!comparingProgress.isFinished && (
                            <motion.div 
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent w-[200%]" 
                              animate={{ x: ['-100%', '100%'] }} 
                              transition={{ repeat: Infinity, duration: 2 + Math.random(), ease: "linear", delay: Math.random() }} 
                            />
                          )}
                          <div className="p-2 bg-indigo-50 rounded text-indigo-600 shrink-0 relative z-10">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-slate-700 truncate relative z-10" title={f.name}>{f.name}</span>
                          {comparingProgress.isFinished && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto shrink-0 relative z-10" />}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Check Items */}
                  <div className="lg:w-2/3 p-6">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      检测点进度
                    </h3>
                    <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                      {getTasks().map((taskGroup, tIdx) => {
                        const isGroupActive = tIdx === comparingProgress.currentTypeIndex && !comparingProgress.isFinished;
                        const isGroupDone = tIdx < comparingProgress.currentTypeIndex || comparingProgress.isFinished;
                        const isGroupPending = tIdx > comparingProgress.currentTypeIndex;

                        return (
                          <div key={taskGroup.type} className={`transition-opacity duration-500 ${isGroupPending ? 'opacity-40' : 'opacity-100'}`}>
                            <h4 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-3">
                              {isGroupDone ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : 
                               isGroupActive ? <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" /> : 
                               <Circle className="w-4 h-4 text-slate-300" />}
                              {taskGroup.type}
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pl-6">
                              {taskGroup.items.map((item, iIdx) => {
                                const itemKey = `${taskGroup.type}-${item}`;
                                const isItemDone = comparingProgress.completedItems.includes(itemKey);
                                const isItemActive = isGroupActive && iIdx === comparingProgress.currentItemIndex;
                                
                                return (
                                  <div key={item} className={`flex items-center gap-2 p-2 rounded-md text-xs transition-colors duration-300 ${
                                    isItemDone ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                    isItemActive ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm' :
                                    'bg-slate-50 text-slate-500 border border-slate-100'
                                  }`}>
                                    {isItemDone ? <Check className="w-3 h-3" /> : 
                                     isItemActive ? <Loader2 className="w-3 h-3 animate-spin" /> : 
                                     <div className="w-3 h-3 rounded-full border-2 border-slate-200" />}
                                    <span className="truncate" title={item}>{item}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom: Terminal Logs */}
                <div className="bg-slate-900 p-4 h-48 overflow-y-auto font-mono text-xs text-emerald-400 flex flex-col gap-1.5">
                  {compareLogs.map(log => (
                    <div key={log.id} className={`${log.type === 'success' ? 'text-emerald-300 font-bold' : log.type === 'warning' ? 'text-amber-400' : 'text-emerald-500/80'}`}>
                      <span className="text-slate-500 mr-2">[{log.time}]</span>
                      {log.text}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>

                {/* Footer Action */}
                {comparingProgress.isFinished && (
                  <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
                    <button 
                      onClick={() => setCurrentPage('report')}
                      className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                      查看详细比对报告 <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {currentPage === 'report' && (
            <motion.div
              key="report"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Report Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <button onClick={() => setCurrentPage('project')} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <h1 className="text-2xl font-bold text-slate-900">比对结果概览</h1>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm font-medium shadow-sm">
                    <Download className="w-4 h-4" /> 导出报告
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-4 border-b border-slate-200 mb-6">
                <button 
                  className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${reportTab === 'credit' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setReportTab('credit')}
                >
                  资信标比对结果
                </button>
                <button 
                  className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${reportTab === 'tech' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setReportTab('tech')}
                >
                  技术标内容比对
                </button>
              </div>

              {/* Credit Tab */}
              {reportTab === 'credit' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-indigo-500"/> 资信标特征矩阵</h3>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span className="w-3 h-3 bg-red-100 border border-red-300 rounded-sm inline-block"></span> 标红代表存在重复风险 (多份文件信息一致)
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600">
                          <th className="py-3 px-4 font-medium border-r border-slate-200 w-48 bg-slate-100">文件名称 \ 检测点</th>
                          {creditItems.map(item => (
                            <th key={item} className="py-3 px-4 font-medium border-r border-slate-200">{item}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {mockCreditData.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 font-medium text-slate-800 border-r border-slate-200 bg-slate-50/50">{row.name}</td>
                            {row.values.map((val, colIdx) => {
                              const isDup = isCreditValueDuplicate(colIdx, val);
                              return (
                                <td key={colIdx} className={`py-3 px-4 text-sm border-r border-slate-200 ${isDup ? 'bg-red-50 text-red-700 font-medium' : 'text-slate-600'}`}>
                                  {isDup && <AlertTriangle className="w-3 h-3 inline mr-1 text-red-500" />}
                                  {val}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tech Tab */}
              {reportTab === 'tech' && (
                <div className="flex h-[700px] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  {/* Left: Duplicates List */}
                  <div className="w-72 border-r border-slate-200 bg-slate-50 flex flex-col">
                    <div className="p-4 border-b border-slate-200 bg-white">
                      <h3 className="font-bold text-slate-800">发现的重复点 ({mockDuplicates.length})</h3>
                      <p className="text-xs text-slate-500 mt-1">点击列表可定位至文档对应位置</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                      {mockDuplicates.map(dup => (
                        <button 
                          key={dup.id}
                          onClick={() => handleDuplicateClick(dup)}
                          className={`w-full text-left p-3 rounded-lg border transition-all ${activeDuplicateId === dup.id ? 'bg-indigo-50 border-indigo-300 shadow-sm' : 'bg-white border-slate-200 hover:border-indigo-200'}`}
                        >
                          <div className="font-bold text-sm text-slate-800 mb-1">{dup.title}</div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">相似度</span>
                            <span className="font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">{dup.similarity}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right: PDF Views */}
                  <div className="flex-1 flex bg-slate-200 p-4 gap-4 overflow-hidden">
                    {/* File A */}
                    <div className="flex-1 flex flex-col">
                      <select 
                        value={techFileA} 
                        onChange={e => setTechFileA(e.target.value)}
                        className="p-2 rounded-t-lg border border-slate-300 bg-white text-sm font-medium shadow-sm border-b-0 focus:outline-none"
                      >
                        {comparingFiles.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                      {renderMockPdfPage(techFileA, pdfARef, true)}
                    </div>
                    
                    {/* File B */}
                    <div className="flex-1 flex flex-col">
                      <select 
                        value={techFileB} 
                        onChange={e => setTechFileB(e.target.value)}
                        className="p-2 rounded-t-lg border border-slate-300 bg-white text-sm font-medium shadow-sm border-b-0 focus:outline-none"
                      >
                        {comparingFiles.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                      {renderMockPdfPage(techFileB, pdfBRef, false)}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-[800px] rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-medium text-slate-800">充值</h3>
              <button onClick={() => setShowPurchaseModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 bg-[#F5F8FF] flex-1">
              {/* Blue Bar */}
              <div className="bg-[#6B9DF8] text-white px-4 py-2.5 rounded-t-lg flex justify-between items-center">
                <span className="font-medium">请选择购买方案</span>
                <div className="text-sm opacity-90 space-x-3">
                  <a href="#" className="hover:underline">对公转账</a>
                  <span>|</span>
                  <a href="#" className="hover:underline">充值记录</a>
                  <span>|</span>
                  <a href="#" className="hover:underline">优惠券</a>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-b-lg border border-t-0 border-slate-200 shadow-sm space-y-6">
                {/* Product Info */}
                <div className="flex items-start gap-4">
                  <span className="text-slate-600 mt-1 whitespace-nowrap">购买商品：</span>
                  <div className="flex gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-serif text-2xl font-bold">
                      T
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg">多版本文件比对-高级套餐</h4>
                      <p className="text-sm text-slate-500 mt-1">支持资信标、技术标、经济标及底层设备特征的深度比对分析</p>
                    </div>
                  </div>
                </div>
                
                {/* SKUs */}
                <div className="flex items-start gap-4">
                  <span className="text-slate-600 mt-2 whitespace-nowrap">选择套餐：</span>
                  <div className="flex gap-4 flex-1">
                    {/* Month SKU */}
                    <div 
                      className={`relative flex-1 border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedSku === 'month' ? 'border-blue-600 bg-blue-50/30' : 'border-slate-200 hover:border-blue-300'}`}
                      onClick={() => setSelectedSku('month')}
                    >
                      {selectedSku === 'month' && (
                        <div className="absolute top-0 right-0 bg-blue-600 text-white rounded-bl-lg rounded-tr-sm p-0.5">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                      <div className="font-bold text-lg text-slate-800">包月套餐</div>
                      <div className="text-xs text-slate-500 mt-1">30天内不限次比对</div>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-blue-600">¥299</span>
                        <span className="text-sm text-slate-400 line-through">¥399</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">约9.9元/天</div>
                    </div>
                    
                    {/* Once SKU */}
                    <div 
                      className={`relative flex-1 border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedSku === 'once' ? 'border-blue-600 bg-blue-50/30' : 'border-slate-200 hover:border-blue-300'}`}
                      onClick={() => setSelectedSku('once')}
                    >
                      {selectedSku === 'once' && (
                        <div className="absolute top-0 right-0 bg-blue-600 text-white rounded-bl-lg rounded-tr-sm p-0.5">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                      <div className="font-bold text-lg text-slate-800">单次套餐</div>
                      <div className="text-xs text-slate-500 mt-1">单次项目比对</div>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-blue-600">¥20</span>
                        <span className="text-sm text-slate-400 line-through">¥30</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">20元/次</div>
                    </div>
                  </div>
                </div>
                
                {/* Promo */}
                <div className="flex items-center gap-4">
                  <span className="text-slate-600 whitespace-nowrap">使用优惠：</span>
                  <select className="border border-slate-300 rounded px-3 py-1.5 text-sm w-48 outline-none focus:border-blue-500">
                    <option>暂无优惠券</option>
                  </select>
                  <a href="#" className="text-blue-600 text-sm hover:underline ml-2">输入优惠码</a>
                </div>
              </div>
              
              {/* Payment Area */}
              <div className="bg-white mt-4 p-6 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center">
                <div className="flex gap-6 items-center">
                  {/* QR Code Placeholder */}
                  <div className="w-32 h-32 border border-slate-200 rounded p-1 relative group bg-white">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=simulate_payment" alt="QR Code" className="w-full h-full opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/80">
                      <button onClick={handlePaymentSuccess} className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded shadow-sm hover:bg-blue-700">
                        模拟支付成功
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-600 flex items-baseline gap-2">
                      需支付: <span className="text-3xl font-bold text-[#D97706]">¥{selectedSku === 'month' ? '299' : '20'}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-sm text-slate-700">
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      微信支付
                    </div>
                  </div>
                </div>
                <a href="#" className="text-slate-500 text-sm hover:text-slate-800 flex items-center">
                  我要对公转账 <ChevronRight className="w-4 h-4" />
                </a>
              </div>
              
              <div className="mt-4 text-xs text-slate-400 text-center">
                支付即代表你同意 <a href="#" className="text-blue-500 hover:underline">《用户协议》</a> 及 <a href="#" className="text-blue-500 hover:underline">《隐私协议》</a> ，购买后不支持7天无理由退货
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
