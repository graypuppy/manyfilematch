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
  Image,
  ShieldAlert,
  Plus,
  PlayCircle,
  Loader2,
  Circle,
  ArrowRight,
  Download,
  ChevronDown,
  FolderOpen,
  ScanText,
  Table,
  PenTool,
  Quote
} from 'lucide-react';

// Configuration Constants
const ALL_CHECK_TYPES = ['资信标比对', '技术标比对', '经济标比对', '文件设备特征比对'];
const ALL_CREDIT_ITEMS = ['法人名称', '法定代表人', '盖章重复', '手机号', '邮箱', '电子证照', '图片文字', '引用内容', '地址', '人员重复', '文件属性'];
const ALL_TECH_ITEMS = ['全文语句雷同比对',  'Word属性查重', '图片查重', '图片文字OCR查重', '表格文字查重', '敏感信息查重', '签章查重', '引用内容查重'];
const ALL_ECONOMIC_ITEMS = ['清单错误一致性比对', '清单内容查重', '项目总价规律性比对', '分部分项报价规律比对', '措施项目规律比对', '其他项目规律比对', '计价锁号比对'];
const ALL_DEVICE_ITEMS = ['计算机名比对', '计算机用户名比对', '文件操作来源比对', '文件创建码比对', 'MAC地址比对', 'CPU序列号比对', '文件生成锁号比对', '硬盘序列号比对', '主板序列号比对', '机器特征码比对'];

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
  { id: 3, date: '2026-02-15', title: '如何将你的多份投标文件进行版本管理，比对重复度', type: '案例' },
  { id: 4, date: '2026-01-20', title: '关于优化大文件（>50MB）比对速度的更新说明', type: '更新' },
];

const HISTORY_ITEMS = [
  { id: 'CMP-20260301-01', name: '《产品需求文档(PRD)》比对项目', date: '2026-03-01 14:30', status: '已完成', risk: '中风险', files: 2 },
  { id: 'CMP-20260228-02', name: '《产品需求文档(PRD)》比对项目', date: '2026-02-28 10:00', status: '已完成', risk: '高风险', files: 2 },
  { id: 'CMP-20260225-03', name: '年度采购合同审查', date: '2026-02-25 09:15', status: '检查中', risk: '-', files: 2 },
  { id: 'CMP-20260220-02', name: 'Q1季度财务报表核对', date: '2026-02-20 16:45', status: '已完成', risk: '低风险', files: 5 },
  { id: 'CMP-20260215-01', name: 'Q1季度财务报表核对', date: '2026-02-15 14:20', status: '已完成', risk: '中风险', files: 4 },
];

const DEFAULT_TEMPLATES = [
  {
    id: 'tpl-1',
    name: '全面深度检查',
    desc: '包含所有资信、技术、经济及设备特征检查，适用于最终定标前审查。',
    config: {
      types: ALL_CHECK_TYPES,
      credit: ALL_CREDIT_ITEMS,
      tech: ALL_TECH_ITEMS,
      economic: ALL_ECONOMIC_ITEMS,
      device: ALL_DEVICE_ITEMS,
      threshold: 30,
      filterBiddingDoc: true,
      enableAI: true
    }
  },
  {
    id: 'tpl-2',
    name: '快速资信初审',
    desc: '仅检查资信标和设备特征，适用于初步筛选阶段。',
    config: {
      types: ['资信标比对', '文件设备特征比对'],
      credit: ['法人名称', '法定代表人', '手机号', '电子证照'],
      tech: [],
      economic: [],
      device: ['MAC地址比对', '计算机名比对'],
      threshold: 50,
      filterBiddingDoc: false,
      enableAI: false
    }
  },
  {
    id: 'tpl-3',
    name: '技术标防串标专查',
    desc: '重点比对技术标内容雷同及设备特征，适用于技术方案评审。',
    config: {
      types: ['技术标比对', '文件设备特征比对'],
      credit: [],
      tech: ALL_TECH_ITEMS,
      economic: [],
      device: ALL_DEVICE_ITEMS,
      threshold: 20,
      filterBiddingDoc: true,
      enableAI: true
    }
  }
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
  // Mock risk data for the overview
  const riskData = {
    credit: 3,
    tech: 12,
    economic: 2,
    device: 4
  };
  const totalRisks = Object.values(riskData).reduce((a, b) => a + b, 0);
  const riskLevel = totalRisks > 10 ? '高风险' : totalRisks > 5 ? '中风险' : '低风险';
  const riskColor = totalRisks > 10 ? 'text-red-600' : totalRisks > 5 ? 'text-amber-600' : 'text-emerald-600';
  const riskCircleColor = totalRisks > 10 ? 'text-red-500' : totalRisks > 5 ? 'text-amber-500' : 'text-emerald-500';
  const riskPercentage = Math.min(100, totalRisks * 4); // Just a mock calculation
  const strokeDashoffset = 175.9 - (175.9 * riskPercentage) / 100;

  const [currentPage, setCurrentPage] = useState<'home' | 'project' | 'comparing' | 'report' | 'history' | 'rules'>('home');
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Templates State
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [activeTemplateId, setActiveTemplateId] = useState<string>('tpl-1');
  const [pdfPreviewState, setPdfPreviewState] = useState<{
    isOpen: boolean;
    fileName: string;
    value: string;
    type: string;
    contentType?: 'text' | 'image' | 'table';
    duplicates?: { fileName: string; value: string }[];
  } | null>(null);
  
  // Project Page State
  const [projectName, setProjectName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Report States
  const [reportTab, setReportTab] = useState<'overview' | 'credit' | 'tech' | 'economic' | 'device'>('overview');
  const [techFileA, setTechFileA] = useState<string>('');
  const [techFileB, setTechFileB] = useState<string>('');
  const [activeDuplicateId, setActiveDuplicateId] = useState<number | null>(null);
  const [activeTechItem, setActiveTechItem] = useState<any>(null);
  const pdfARef = useRef<HTMLDivElement>(null);
  const pdfBRef = useRef<HTMLDivElement>(null);

  // Config State
  const [selectedCheckTypes, setSelectedCheckTypes] = useState<string[]>(ALL_CHECK_TYPES);
  const [selectedCreditItems, setSelectedCreditItems] = useState<string[]>(ALL_CREDIT_ITEMS);
  const [selectedTechItems, setSelectedTechItems] = useState<string[]>(ALL_TECH_ITEMS);
  const [selectedEconomicItems, setSelectedEconomicItems] = useState<string[]>(ALL_ECONOMIC_ITEMS);
  const [selectedDeviceItems, setSelectedDeviceItems] = useState<string[]>(ALL_DEVICE_ITEMS);
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
  const [expandedProjects, setExpandedProjects] = useState<string[]>([HISTORY_ITEMS[0].name]);

  const [compareLogs, setCompareLogs] = useState<{id: number, time: string, text: string, type: string}[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Template Editor State
  const [isTemplateEditorOpen, setIsTemplateEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleNewTemplate = () => {
    setEditingTemplate({
      id: `tpl-${Date.now()}`,
      name: '新规模板',
      desc: '请编辑模板描述',
      config: {
        types: [],
        credit: [],
        tech: [],
        economic: [],
        device: [],
        threshold: 30,
        filterBiddingDoc: false,
        enableAI: false
      }
    });
    setIsTemplateEditorOpen(true);
  };

  const handleEditTemplate = (tpl: any) => {
    setEditingTemplate(JSON.parse(JSON.stringify(tpl))); // Deep copy
    setIsTemplateEditorOpen(true);
  };

  const handleDeleteTemplate = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteTemplate = () => {
    if (deleteConfirmId) {
      setTemplates(prev => prev.filter(t => t.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate) return;
    
    setTemplates(prev => {
      const exists = prev.find(t => t.id === editingTemplate.id);
      if (exists) {
        return prev.map(t => t.id === editingTemplate.id ? editingTemplate : t);
      } else {
        return [...prev, editingTemplate];
      }
    });
    setIsTemplateEditorOpen(false);
    setEditingTemplate(null);
  };

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [compareLogs]);

  const applyTemplate = (tplId: string) => {
    const tpl = templates.find(t => t.id === tplId);
    if (tpl) {
      setActiveTemplateId(tplId);
      setSelectedCheckTypes(tpl.config.types);
      setSelectedCreditItems(tpl.config.credit);
      setSelectedTechItems(tpl.config.tech);
      setSelectedEconomicItems(tpl.config.economic);
      setSelectedDeviceItems(tpl.config.device);
      setThreshold(tpl.config.threshold);
      setFilterBiddingDoc(tpl.config.filterBiddingDoc);
      setEnableAI(tpl.config.enableAI);
    }
  };

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
  const activeFiles = files.filter(f => f.status === '已完成' || f.status === '比对中');
  const comparingFiles = activeFiles.length > 0 ? activeFiles : [
    { id: 'f1', name: '投标文件A.pdf', size: 1024 * 1024 * 2, status: '已完成' },
    { id: 'f2', name: '投标文件B.pdf', size: 1024 * 1024 * 3, status: '已完成' }
  ] as FileItem[];
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

  const handleTechItemClick = (item: any) => {
    // If it's a risk item, open the PDF preview modal
    if (item.status === 'fail' || item.status === 'info' || item.status === 'pass') {
       const currentFileName = item.fileName || comparingFiles[0].name;
       
       // Mock finding duplicates
       let duplicates = undefined;
       if (item.status === 'fail') {
         // Find other files that are not the current one
         const otherFiles = comparingFiles.filter(f => f.name !== currentFileName);
         if (otherFiles.length > 0) {
           duplicates = [{
             fileName: otherFiles[0].name,
             value: item.name || item.keyword
           }];
         }
       }

       // Determine content type
       let contentType: 'text' | 'image' | 'table' = 'text';
       if (item.type === 'image' || item.type === 'ocr' || item.type === 'signature') {
         contentType = 'image';
       } else if (item.type === 'table') {
         contentType = 'table';
       }

       setPdfPreviewState({
        isOpen: true,
        fileName: currentFileName,
        value: item.name || item.keyword,
        type: item.type === 'image' ? '图片查重' : item.type === 'ocr' ? 'OCR查重' : item.type === 'signature' ? '签章查重' : item.type === 'table' ? '表格查重' : item.type,
        contentType: contentType,
        duplicates: duplicates
      });
    }
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

  const mockEconomicData = [
    { 
      id: 1, 
      type: '清单错误一致性比对', 
      desc: '发现多处非标准清单特征描述错误完全一致', 
      files: comparingFiles.slice(0, 2).map(f => f.name), 
      riskLevel: '高风险',
      evidence: [
        { code: '010101003001', name: '挖土方', detail: '项目特征描述中将"挖土方"错误拼写为"挖土放"，两份文件该处拼写错误完全一致。' },
        { code: '010501001001', name: '垫层', detail: '厚度描述"150mm厚C15素混凝土"中，"素"字缺失，两份文件均描述为"150mm厚C15混凝土"。' }
      ]
    },
    { 
      id: 2, 
      type: '项目总价规律性比对', 
      desc: '投标总价呈明显规律性等差递减', 
      files: comparingFiles.slice(0, 3).map(f => f.name), 
      riskLevel: '中风险',
      evidence: [
        { file: comparingFiles[0]?.name || '文件A', value: '15,000,000.00 元' },
        { file: comparingFiles[1]?.name || '文件B', value: '14,950,000.00 元 (差额: -50,000)' },
        { file: comparingFiles[2]?.name || '文件C', value: '14,900,000.00 元 (差额: -50,000)' }
      ]
    },
    { 
      id: 3, 
      type: '计价锁号比对', 
      desc: '提取到完全相同的广联达计价软件加密锁号', 
      files: [comparingFiles[0]?.name, comparingFiles[2]?.name].filter(Boolean), 
      riskLevel: '高风险',
      evidence: [
        { key: '加密锁硬件ID', value: '8A9B-2C3D-4E5F-6G7H' },
        { key: '最后保存时间', value: '2026-02-28 14:30:22' }
      ]
    },
  ];

  const mockDeviceData = [
    { 
      id: 1, 
      type: 'MAC地址比对', 
      desc: '发现相同的物理网卡MAC地址',
      files: comparingFiles.slice(0, 2).map(f => f.name), 
      riskLevel: '高风险',
      evidence: [
        { key: '网卡1 MAC', value: '00:1A:2B:3C:4D:5E' },
        { key: '网卡2 MAC', value: '00:1A:2B:3C:4D:5F' }
      ]
    },
    { 
      id: 2, 
      type: '计算机名比对', 
      desc: '文档最后保存的计算机名称完全一致',
      files: comparingFiles.slice(0, 2).map(f => f.name), 
      riskLevel: '高风险',
      evidence: [
        { key: 'Computer Name', value: 'DESKTOP-8F9A2B' },
        { key: 'OS Version', value: 'Windows 11 Pro 23H2' }
      ]
    },
    { 
      id: 3, 
      type: '文件属性比对', 
      desc: '文档的创建者和最后修改者信息高度重合',
      files: [comparingFiles[1]?.name, comparingFiles[2]?.name].filter(Boolean), 
      riskLevel: '中风险',
      evidence: [
        { key: 'Author (创建者)', value: '张三 (zhangsan@company.com)' },
        { key: 'LastSavedBy (最后保存者)', value: '李四 (lisi@company.com)' },
        { key: 'TotalEditingTime', value: '452 分钟' }
      ]
    },
  ];

  const mockTechDetails = {
    docProps: {
      title: '文档属性检查',
      desc: '检查文档元数据，包括作者、修改人、创建时间等',
      items: [
        { key: 'Author', label: '文档作者 (Author)', values: comparingFiles.map((f, i) => ({ file: f.name, value: i === 1 ? '张三' : (i === 2 ? '张三' : `User_${i}`), status: (i === 1 || i === 2) ? 'fail' : 'pass' })) },
        { key: 'LastModifiedBy', label: '最后修改人', values: comparingFiles.map((f, i) => ({ file: f.name, value: i === 0 ? '李四' : (i === 2 ? '李四' : `Admin_${i}`), status: (i === 0 || i === 2) ? 'fail' : 'pass' })) },
        { key: 'Company', label: '公司名称', values: comparingFiles.map(f => ({ file: f.name, value: 'Unknown', status: 'pass' })) },
        { key: 'Template', label: '使用模板', values: comparingFiles.map((f, i) => ({ file: f.name, value: 'Normal.dotm', status: 'pass' })) },
        { key: 'CreateTime', label: '创建时间', values: comparingFiles.map((f, i) => ({ file: f.name, value: '2023-10-27 10:00:00', status: 'pass' })) },
        { key: 'TotalEditTime', label: '总编辑时间', values: comparingFiles.map((f, i) => ({ file: f.name, value: `${100 + i * 20} 分钟`, status: 'pass' })) },
      ]
    },
    images: {
      title: '图片查重',
      desc: '提取文档内所有图片进行指纹比对',
      items: [
        { id: 1, type: 'image', name: '施工现场平面布置图', context: '第三章 施工组织设计 - 3.1 现场布置', status: 'pass', desc: '未发现重复图片', similarity: '0%', page: 12, rect: { x: 100, y: 200, w: 400, h: 300 }, fileName: comparingFiles[0]?.name },
        { id: 2, type: 'image', name: '系统架构拓扑图', context: '第四章 技术方案 - 4.2 系统架构', status: 'fail', desc: '在[文件A]和[文件C]中发现完全一致的图片', similarity: '100%', evidence: 'MD5: a1b2c3d4...', page: 45, rect: { x: 50, y: 100, w: 500, h: 400 }, fileName: comparingFiles[0]?.name },
        { id: 3, type: 'image', name: '企业资质证书扫描件', context: '附件一 资质证明文件', status: 'pass', desc: '未发现重复图片', similarity: '0%', page: 88, rect: { x: 100, y: 100, w: 400, h: 600 }, fileName: comparingFiles[0]?.name },
      ]
    },
    ocr: {
      title: '图片文字OCR查重',
      desc: '识别图片中的文字内容进行比对',
      items: [
        { id: 4, type: 'ocr', name: '流程图文字', context: '第五章 实施流程 - 流程图文字内容', status: 'fail', desc: '发现高度相似的流程描述文字', similarity: '98%', page: 52, content: '项目启动 -> 需求分析 -> 系统设计 -> 开发实施 -> 测试验收', fileName: comparingFiles[0]?.name },
        { id: 5, type: 'ocr', name: '截图文字', context: '第六章 界面展示 - 系统截图', status: 'pass', desc: '图片文字内容无异常重复', similarity: '15%', page: 63, content: '系统登录界面...', fileName: comparingFiles[0]?.name }
      ]
    },
    table: {
      title: '表格文字查重',
      desc: '提取文档中的表格数据进行比对',
      items: [
        { id: 6, type: 'table', name: '人员配置表', context: '第七章 项目团队 - 7.1 人员配置', status: 'fail', desc: '表格内容与历史项目高度雷同', similarity: '100%', page: 71, content: '项目经理: 张三; 技术总监: 李四...', fileName: comparingFiles[0]?.name },
        { id: 7, type: 'table', name: '设备参数表', context: '第八章 设备清单 - 8.2 参数指标', status: 'pass', desc: '表格数据正常', similarity: '5%', page: 85, content: '服务器: CPU 64核, 内存 512G...', fileName: comparingFiles[0]?.name }
      ]
    },
    signature: {
      title: '签章查重',
      desc: '检测电子签章的有效性及重复使用情况',
      items: [
        { id: 8, type: 'signature', name: '法人章', context: '签署页 - 法人代表签字', status: 'fail', desc: '发现同一签章在不同文档中位置完全一致（疑似PS）', similarity: '100%', page: 99, rect: { x: 400, y: 700, w: 100, h: 50 }, fileName: comparingFiles[0]?.name },
        { id: 9, type: 'signature', name: '公章', context: '签署页 - 公司公章', status: 'pass', desc: '签章特征正常', similarity: '0%', page: 99, rect: { x: 350, y: 650, w: 150, h: 150 }, fileName: comparingFiles[0]?.name }
      ]
    },
    citation: {
      title: '引用内容查重',
      desc: '检测文档引用的标准、规范等内容',
      items: [
        { id: 10, type: 'citation', name: '国家标准引用', context: '第二章 编制依据', status: 'pass', desc: '引用标准规范准确', similarity: '0%', page: 5, content: 'GB/T 12345-2023 信息安全技术...', fileName: comparingFiles[0]?.name },
        { id: 11, type: 'citation', name: '行业案例引用', context: '第九章 类似案例', status: 'fail', desc: '案例描述与[文件B]完全一致', similarity: '100%', page: 92, content: '某市智慧城市建设项目...', fileName: comparingFiles[0]?.name }
      ]
    },
    sensitive: {
      title: '敏感信息检测',
      desc: '扫描文档内是否包含敏感关键词或隐私信息',
      items: [
        { id: 12, type: 'sensitive', keyword: '内部绝密', count: 0, status: 'pass', desc: '未发现敏感词', page: 0, fileName: comparingFiles[0]?.name },
        { id: 13, type: 'sensitive', keyword: '联系方式', count: 12, status: 'info', desc: '发现12处手机号，格式正常', page: 15, locations: [15, 22, 33], fileName: comparingFiles[0]?.name },
        { id: 14, type: 'sensitive', keyword: '身份证号', count: 5, status: 'info', desc: '发现5处身份证号，格式正常', page: 18, locations: [18, 45], fileName: comparingFiles[0]?.name },
        { id: 15, type: 'sensitive', keyword: '标底金额', count: 0, status: 'pass', desc: '未发现标底相关信息', page: 0, fileName: comparingFiles[0]?.name },
      ]
    }
  };

  const getDuplicateDetails = (colIndex: number, value: string, currentFileId: string) => {
    const duplicates = mockCreditData
      .filter(d => d.id !== currentFileId && d.values[colIndex] === value)
      .map(d => d.name);
    return duplicates;
  };

  const isCreditValueDuplicate = (colIndex: number, value: string) => {
    const allValues = mockCreditData.map(d => d.values[colIndex]);
    return allValues.filter(v => v === value).length > 1;
  };

  const handleDuplicateClick = (dup: any) => {
    setActiveDuplicateId(dup.id);
    setTimeout(() => {
      if (pdfARef.current) {
        const el = pdfARef.current.querySelector(`[data-line="${dup.lineA}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      if (pdfBRef.current) {
        const el = pdfBRef.current.querySelector(`[data-line="${dup.lineB}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const renderMockPdfPage = (fileId: string, ref: any, isFileA: boolean) => {
    return (
      <div className="flex-1 bg-white overflow-y-auto shadow-inner p-8 text-sm leading-relaxed font-serif text-slate-700 relative border border-slate-200 rounded-b-lg" ref={ref}>
        {/* Tech Item Highlight Overlay */}
        {activeTechItem && activeTechItem.page && (
          <div 
            className="absolute left-0 right-0 bg-yellow-100/30 pointer-events-none transition-all duration-300" 
            style={{ 
              top: `${activeTechItem.page * 28}px`, 
              height: '300px',
              zIndex: 0
            }}
          >
             {/* Page Highlight */}
          </div>
        )}

        {/* Rect Highlight for Images/Signatures */}
        {activeTechItem && activeTechItem.rect && (
          <div 
            className="absolute border-2 border-red-500 bg-red-500/10 z-10 flex items-center justify-center shadow-lg animate-pulse"
            style={{
              top: `${activeTechItem.rect.y}px`,
              left: `${activeTechItem.rect.x}px`,
              width: `${activeTechItem.rect.w}px`,
              height: `${activeTechItem.rect.h}px`,
            }}
          >
            <span className="bg-red-500 text-white text-[10px] px-1 rounded absolute -top-5 left-0 whitespace-nowrap">
              {activeTechItem.name}
            </span>
          </div>
        )}

        {Array.from({ length: 120 }).map((_, i) => {
          const dup = mockDuplicates.find(d => (isFileA ? d.lineA : d.lineB) === i);
          const isActive = dup && activeDuplicateId === dup.id;
          
          // Check if this line is part of activeTechItem context
          const isTechItemContext = activeTechItem && activeTechItem.page && Math.abs(activeTechItem.page - i) < 5;

          return (
            <div 
              key={i} 
              data-line={i} 
              className={`py-1 px-2 rounded transition-colors relative z-1 ${
                isActive ? 'bg-red-200 text-red-900 font-medium shadow-sm' : 
                dup ? 'bg-red-50 text-red-800 cursor-pointer hover:bg-red-100' : 
                isTechItemContext ? 'bg-blue-50/50' : ''
              }`}
              onClick={() => dup && handleDuplicateClick(dup)}
            >
              <span className="text-slate-300 mr-2 select-none text-xs w-6 inline-block text-right">{i + 1}</span>
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
      if (type === '文件设备特征比对') setSelectedDeviceItems([]);
    } else {
      setSelectedCheckTypes(prev => [...prev, type]);
      if (type === '资信标比对') setSelectedCreditItems(ALL_CREDIT_ITEMS);
      if (type === '技术标比对') setSelectedTechItems(ALL_TECH_ITEMS);
      if (type === '经济标比对') setSelectedEconomicItems(ALL_ECONOMIC_ITEMS);
      if (type === '文件设备特征比对') setSelectedDeviceItems(ALL_DEVICE_ITEMS);
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

  const renderPreviewPdf = (fileName: string, value: string, type: string, isDuplicate: boolean = false, contentType: 'text' | 'image' | 'table' = 'text') => (
    <div className="bg-white shadow-lg w-full min-h-full p-12 text-slate-800 relative">
      {/* Mock PDF Header */}
      <div className="border-b-2 border-slate-800 pb-4 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold font-serif mb-2">投标文件</h1>
          <p className="text-sm text-slate-500">项目编号: HDHMMI4PT</p>
        </div>
        <div className="text-right">
          <p className="font-serif font-bold text-lg">{isDuplicate ? '副本' : '正本'}</p>
          <p className="text-sm text-slate-500">{fileName}</p>
        </div>
      </div>

      {/* Mock Content */}
      <div className="space-y-6 font-serif text-base leading-loose text-justify">
        {contentType === 'text' && (
          <>
            <p>
              <span className="font-bold">一、投标函</span>
            </p>
            <p>
              致：<span className="font-bold">某某招标代理有限公司</span>
            </p>
            <p className="indent-8">
              根据贵方为 <span className="font-bold">某某工程项目</span> 招标文件的要求，签字代表 <span className={`font-bold underline decoration-blue-500 decoration-2 underline-offset-4 px-1 ${isDuplicate ? 'bg-red-50 decoration-red-500' : 'bg-blue-50'}`}>{value}</span>（全名、职务）经正式授权并代表投标人 <span className="font-bold underline decoration-blue-500 decoration-2 underline-offset-4 bg-blue-50 px-1">{fileName.replace('.docx', '').replace('.pdf', '')}</span>（投标人名称）提交下述文件正本一份，副本四份。
            </p>
          </>
        )}

        {contentType === 'image' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="font-bold text-lg flex items-center gap-2">
                <Image className="w-5 h-5 text-indigo-500" />
                【检测到的图片/签章内容】
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">指纹比对技术: pHash + SIFT</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className={`w-1 h-3 rounded-full ${isDuplicate ? 'bg-red-400' : 'bg-blue-400'} opacity-${i * 10 + 20}`}></div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className={`relative border-4 rounded-xl shadow-2xl overflow-hidden transition-all duration-500 ${isDuplicate ? 'border-red-500 ring-4 ring-red-100' : 'border-blue-500 ring-4 ring-blue-100'}`}>
              <img 
                src={type.includes('签章') 
                  ? "https://picsum.photos/seed/seal/600/600" 
                  : "https://picsum.photos/seed/diagram/1200/800"} 
                alt="Detected Content" 
                className={`w-full h-auto transition-all duration-700 ${isDuplicate ? 'sepia-[0.3] contrast-125' : 'grayscale-[0.1]'}`}
                referrerPolicy="no-referrer"
              />
              
              {/* Overlay for "Seal" or "Diagram" */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`px-8 py-4 rounded-xl font-black text-3xl uppercase tracking-[0.2em] border-[6px] shadow-2xl backdrop-blur-sm transition-transform duration-700 ${
                  isDuplicate 
                    ? 'bg-red-50/90 text-red-600 border-red-600 rotate-12 scale-110' 
                    : 'bg-blue-50/90 text-blue-600 border-blue-600 -rotate-12'
                }`}>
                  {type.includes('签章') ? '电子签章' : '技术图纸'}
                </div>
              </div>

              {/* Duplicate Warning Badge */}
              {isDuplicate && (
                <div className="absolute top-6 right-6 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-black shadow-xl animate-bounce flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  发现高度重合图片 (100%)
                </div>
              )}

              {/* Scanline Animation */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent h-20 w-full top-[-100px] animate-[scan_3s_linear_infinite] pointer-events-none"></div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">特征哈希值</div>
                <div className="font-mono text-xs truncate">SHA256: {Math.random().toString(16).substring(2, 15).toUpperCase()}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">提取位置</div>
                <div className="font-mono text-xs">Page {Math.floor(Math.random() * 50) + 1}, Offset: {Math.floor(Math.random() * 1000)}px</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">检测状态</div>
                <div className={`font-bold text-xs ${isDuplicate ? 'text-red-600' : 'text-emerald-600'}`}>
                  {isDuplicate ? '● 存在重复风险' : '● 校验通过'}
                </div>
              </div>
            </div>
          </div>
        )}

        {contentType === 'table' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="font-bold text-lg flex items-center gap-2">
                <Table className="w-5 h-5 text-emerald-500" />
                【检测到的表格数据矩阵】
              </p>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold">结构相似度: 100%</span>
            </div>

            <div className={`border-2 rounded-xl shadow-xl overflow-hidden transition-all duration-500 ${isDuplicate ? 'border-red-400 ring-4 ring-red-50' : 'border-emerald-400 ring-4 ring-emerald-50'}`}>
              <table className="w-full text-sm border-collapse bg-white">
                <thead>
                  <tr className={isDuplicate ? 'bg-red-100 text-red-900' : 'bg-emerald-100 text-emerald-900'}>
                    <th className="border border-slate-200 p-3 font-bold">序号</th>
                    <th className="border border-slate-200 p-3 font-bold">人员姓名</th>
                    <th className="border border-slate-200 p-3 font-bold">岗位名称</th>
                    <th className="border border-slate-200 p-3 font-bold">证书编号</th>
                    <th className="border border-slate-200 p-3 font-bold">社保缴纳状态</th>
                    <th className="border border-slate-200 p-3 font-bold">备注</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <tr key={i} className={`transition-colors ${isDuplicate ? 'hover:bg-red-50' : 'hover:bg-emerald-50'}`}>
                      <td className="border border-slate-200 p-3 text-center text-slate-400">{i}</td>
                      <td className={`border border-slate-200 p-3 font-bold ${isDuplicate ? 'text-red-700 bg-red-50/30' : 'text-slate-800'}`}>
                        {i === 1 ? '张建国' : i === 2 ? '王志强' : `核心成员_${i}`}
                      </td>
                      <td className="border border-slate-200 p-3 text-slate-600">
                        {i === 1 ? '项目经理' : i === 2 ? '技术负责人' : '高级工程师'}
                      </td>
                      <td className={`border border-slate-200 p-3 font-mono text-xs ${isDuplicate ? 'text-red-700 font-bold bg-red-50/30' : 'text-slate-500'}`}>
                        {i === 1 ? '京建安B(2021)0123456' : `CERT-NO-2024-00${i}`}
                      </td>
                      <td className="border border-slate-200 p-3 text-center text-emerald-600 font-bold">已缴纳</td>
                      <td className="border border-slate-200 p-3 text-slate-400 text-xs">符合招标要求</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={`p-4 rounded-xl border-2 flex items-start gap-4 ${isDuplicate ? 'bg-red-50 border-red-200 text-red-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
              <div className={`p-2 rounded-lg ${isDuplicate ? 'bg-red-100' : 'bg-emerald-100'}`}>
                <FileSearch className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold mb-1">智能比对结论</p>
                <p className="text-sm opacity-90">
                  {isDuplicate 
                    ? "系统检测到该表格的人员名单、证书编号及排列顺序与历史库中的 [2023-XX项目] 投标文件高度一致。建议重点核查人员社保真实性及是否存在挂证行为。" 
                    : "表格数据结构完整，未在历史库或本次其他投标文件中发现高度相似的表格矩阵。"}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className={`my-8 p-6 border rounded-lg ${isDuplicate ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
          <h4 className="font-bold text-center mb-4 text-slate-700">关键信息摘要</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">检测点</span>
              <span className="font-medium">{type}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">检测值</span>
              <span className={`font-bold truncate max-w-[150px] ${isDuplicate ? 'text-red-600' : 'text-blue-600'}`}>{value}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">所在页码</span>
              <span className="font-medium">第 {Math.floor(Math.random() * 20) + 1} 页</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">检测类型</span>
              <span className="font-medium uppercase">{contentType}</span>
            </div>
          </div>
        </div>

        {contentType === 'text' && (
          <>
            <p className="indent-8">
              据此函，签字代表宣布同意如下：
            </p>
            <p className="indent-8">
              1. 投标人将按招标文件的规定履行合同责任和义务。
            </p>
            <p className="indent-8">
              2. 投标人已详细审查全部招标文件，包括修改文件（如有的话）以及全部参考资料和有关附件。我们完全理解并同意放弃对这方面有不明及误解的权利。
            </p>
            <p className="indent-8">
              3. 本投标有效期为自开标日起 90 个日历日。
            </p>
            <p className="indent-8">
              4. 如果在规定的开标时间后，投标人撤回投标或在收到中标通知书后，无正当理由拒签合同协议书或不提交履约担保，其投标保证金将被贵方没收。
            </p>
            <p className="indent-8">
              5. 投标人同意提供按照贵方可能要求的与其投标有关的一切数据或资料，完全理解贵方不一定要接受最低价的投标或收到的任何投标。
            </p>
            <p className="indent-8">
              6. 与本投标有关的一切正式往来通讯请寄：
            </p>
            <div className="pl-8 space-y-2 text-sm text-slate-600 mt-4">
              <p>地址：XX省XX市XX区XX路XX号</p>
              <p>电话：13800138000</p>
              <p>传真：010-12345678</p>
              <p>电子邮箱：example@email.com</p>
            </div>
          </>
        )}
      </div>
      
      {/* Page Number */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-slate-400 text-sm">
        - {Math.floor(Math.random() * 5) + 1} -
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('home')}>
            <div className="bg-indigo-600 p-2 rounded-lg">
              <FileSearch className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">多版本文件比对系统</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className={`font-medium transition-colors ${currentPage === 'home' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`} onClick={() => setCurrentPage('home')}>首页</a>
            <a href="#" className={`font-medium transition-colors ${currentPage === 'history' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`} onClick={() => setCurrentPage('history')}>历史记录</a>
            <a href="#" className={`font-medium transition-colors ${currentPage === 'rules' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`} onClick={() => setCurrentPage('rules')}>规则配置</a>
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

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                                    'bg-slate-50 text-slate-700 border border-slate-200'
                                  }`}>
                                    {item.status === '检查中' && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
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

          {currentPage === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-slate-900">历史记录</h1>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" placeholder="搜索项目或记录..." className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {Object.entries(
                  historyItems.reduce((acc, item) => {
                    if (!acc[item.name]) acc[item.name] = [];
                    acc[item.name].push(item);
                    return acc;
                  }, {} as Record<string, typeof historyItems>)
                ).map(([projectName, records]) => (
                  <div key={projectName} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div 
                      className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => setExpandedProjects(prev => prev.includes(projectName) ? prev.filter(p => p !== projectName) : [...prev, projectName])}
                    >
                      <div className="flex items-center gap-3">
                        {expandedProjects.includes(projectName) ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                        <FolderOpen className="w-5 h-5 text-indigo-500" />
                        <h2 className="text-lg font-semibold text-slate-800">{projectName}</h2>
                        <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">{(records as typeof historyItems).length} 次检查</span>
                      </div>
                      <div className="text-sm text-slate-500">
                        最近检查: {(records as typeof historyItems)[0].date}
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {expandedProjects.includes(projectName) && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-6">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="text-xs text-slate-500 border-b border-slate-100">
                                  <th className="pb-3 font-medium">检查编号</th>
                                  <th className="pb-3 font-medium">检查时间</th>
                                  <th className="pb-3 font-medium">文件数</th>
                                  <th className="pb-3 font-medium">风险评估</th>
                                  <th className="pb-3 font-medium">状态</th>
                                  <th className="pb-3 font-medium text-right">操作</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {(records as typeof historyItems).map(record => (
                                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-3 text-sm font-medium text-slate-700">{record.id}</td>
                                    <td className="py-3 text-sm text-slate-500">{record.date}</td>
                                    <td className="py-3 text-sm text-slate-500">{record.files} 份</td>
                                    <td className="py-3">
                                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                                        record.risk === '-' ? 'bg-slate-50 text-slate-500 border border-slate-200' :
                                        record.risk === '高风险' ? 'bg-red-50 text-red-700 border border-red-200' :
                                        record.risk === '中风险' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      }`}>
                                        {record.risk}
                                      </span>
                                    </td>
                                    <td className="py-3">
                                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                                        record.status === '检查中' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                        record.status === '已完成' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                        'bg-slate-50 text-slate-700 border border-slate-200'
                                      }`}>
                                        {record.status === '检查中' && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                                        {record.status}
                                      </span>
                                    </td>
                                    <td className="py-3 text-right">
                                      <button 
                                        onClick={() => setCurrentPage('report')}
                                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                                      >
                                        查看详情
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {currentPage === 'rules' && (
            <motion.div
              key="rules"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-[1200px] mx-auto py-8 px-4"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Settings className="w-6 h-6 text-indigo-600" />
                    规则模板配置
                  </h1>
                  <p className="text-slate-500 mt-1">管理和预设比对规则模板，以便在创建项目时快速应用。</p>
                </div>
                <button 
                  onClick={handleNewTemplate}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  新建模板
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(tpl => (
                  <div key={tpl.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-slate-100 bg-slate-50">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-800 text-lg">{tpl.name}</h3>
                        {tpl.id === 'tpl-1' && (
                          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded whitespace-nowrap">默认</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2">{tpl.desc}</p>
                    </div>
                    <div className="p-5 flex-1">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">包含检查项</h4>
                      <div className="flex flex-wrap gap-2">
                        {tpl.config.types.map(type => (
                          <span key={type} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md border border-slate-200">
                            {type}
                          </span>
                        ))}
                        {tpl.config.types.length === 0 && (
                          <span className="text-sm text-slate-400 italic">未选择任何检查项</span>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-slate-500 mb-1">相似度阈值</div>
                          <div className="font-medium text-slate-700">{tpl.config.threshold}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">AI 深度分析</div>
                          <div className="font-medium text-slate-700">{tpl.config.enableAI ? '已开启' : '未开启'}</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                      <button onClick={(e) => { e.stopPropagation(); handleEditTemplate(tpl); }} className="text-sm text-slate-600 hover:text-indigo-600 font-medium transition-colors">编辑</button>
                      {tpl.id !== 'tpl-1' && (
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(tpl.id); }} className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors">删除</button>
                      )}
                    </div>
                  </div>
                ))}
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
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-800 border-l-4 border-indigo-500 pl-2">检查类型</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-500">应用规则模板:</span>
                          <select 
                            value={activeTemplateId}
                            onChange={(e) => applyTemplate(e.target.value)}
                            className="text-sm border border-slate-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white text-slate-700 font-medium shadow-sm cursor-pointer"
                          >
                            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                          </select>
                        </div>
                      </div>
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

                    {/* 文件设备特征比对项 */}
                    <div className={`transition-opacity duration-200 ${selectedCheckTypes.includes('文件设备特征比对') ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                      <h3 className="text-sm font-semibold text-slate-800 mb-4 border-l-4 border-purple-500 pl-2">文件设备特征比对项</h3>
                      <div className="flex flex-wrap gap-x-6 gap-y-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                        {ALL_DEVICE_ITEMS.map(item => (
                          <label key={item} className="flex items-center gap-2 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              checked={selectedDeviceItems.includes(item)}
                              onChange={() => handleItemToggle(item, selectedDeviceItems, setSelectedDeviceItems, '文件设备特征比对')}
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
              className="max-w-[1600px] mx-auto py-8 px-4"
            >
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col">
                {/* Header */}
                <div className="p-8 text-center border-b border-slate-100 bg-slate-50 relative overflow-hidden">
                  {!comparingProgress.isFinished && (
                    <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
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
                <div className="bg-slate-900 p-4 h-48 overflow-y-auto font-mono text-xs text-emerald-400 flex flex-col gap-1.5 rounded-b-2xl">
                  {compareLogs.map(log => (
                    <div key={log.id} className={`${log.type === 'success' ? 'text-emerald-300 font-bold' : log.type === 'warning' ? 'text-amber-400' : 'text-emerald-500/80'}`}>
                      <span className="text-slate-500 mr-2">[{log.time}]</span>
                      {log.text}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
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
              <div className="flex gap-6 border-b border-slate-200 mb-6 overflow-x-auto hide-scrollbar">
                <button 
                  className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${reportTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                  onClick={() => setReportTab('overview')}
                >
                  结果概览
                </button>
                <button 
                  className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${reportTab === 'credit' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                  onClick={() => setReportTab('credit')}
                >
                  资信标比对
                </button>
                <button 
                  className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${reportTab === 'tech' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                  onClick={() => setReportTab('tech')}
                >
                  技术标比对
                </button>
                <button 
                  className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${reportTab === 'economic' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                  onClick={() => setReportTab('economic')}
                >
                  经济标比对
                </button>
                <button 
                  className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${reportTab === 'device' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                  onClick={() => setReportTab('device')}
                >
                  文件设备特征比对
                </button>
              </div>

              {/* Overview Tab */}
              {reportTab === 'overview' && (
                <div className="space-y-6">
                  {/* Project Info Summary */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-xl font-bold text-slate-900">{projectName || '某工程项目招标文件比对'}</h2>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                            第 {historyItems.length + 1} 次比对
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date().toLocaleString()}
                          </span>
                          <span>项目编号: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-xs text-slate-500 font-medium mb-1">综合风险评级</div>
                          <div className={`text-2xl font-black ${riskColor} leading-none`}>{riskLevel}</div>
                        </div>
                        <div className="relative w-16 h-16 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="175.9" strokeDashoffset={strokeDashoffset} className={riskCircleColor} />
                          </svg>
                          <span className="absolute text-sm font-bold text-slate-700">{Math.round(riskPercentage)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div 
                      onClick={() => setReportTab('credit')}
                      className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                          <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">资信标风险</h3>
                      </div>
                      <div className="text-3xl font-black text-slate-900 mb-1">{riskData.credit} <span className="text-sm font-medium text-slate-500">处</span></div>
                      <p className="text-xs text-slate-500 mt-auto">涉及法人、联系方式等信息重复</p>
                    </div>
                    <div 
                      onClick={() => setReportTab('tech')}
                      className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col cursor-pointer hover:shadow-md hover:border-emerald-200 transition-all group"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                          <FileSearch className="w-5 h-5 text-emerald-600" />
                        </div>
                        <h3 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">技术标风险</h3>
                      </div>
                      <div className="text-3xl font-black text-slate-900 mb-1">{riskData.tech} <span className="text-sm font-medium text-slate-500">处</span></div>
                      <p className="text-xs text-slate-500 mt-auto">最高段落相似度达 100%</p>
                    </div>
                    <div 
                      onClick={() => setReportTab('economic')}
                      className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col cursor-pointer hover:shadow-md hover:border-amber-200 transition-all group"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors">
                          <Fingerprint className="w-5 h-5 text-amber-600" />
                        </div>
                        <h3 className="font-bold text-slate-800 group-hover:text-amber-700 transition-colors">经济标风险</h3>
                      </div>
                      <div className="text-3xl font-black text-slate-900 mb-1">{riskData.economic} <span className="text-sm font-medium text-slate-500">处</span></div>
                      <p className="text-xs text-slate-500 mt-auto">发现计价锁号一致及规律性报价</p>
                    </div>
                    <div 
                      onClick={() => setReportTab('device')}
                      className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col cursor-pointer hover:shadow-md hover:border-purple-200 transition-all group"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                          <Cpu className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="font-bold text-slate-800 group-hover:text-purple-700 transition-colors">设备特征风险</h3>
                      </div>
                      <div className="text-3xl font-black text-slate-900 mb-1">{riskData.device} <span className="text-sm font-medium text-slate-500">处</span></div>
                      <p className="text-xs text-slate-500 mt-auto">存在相同MAC地址及计算机名</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-500"/> 高风险项汇总</h3>
                    </div>
                    <div className="p-0">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
                            <th className="py-3 px-5 font-medium">风险类型</th>
                            <th className="py-3 px-5 font-medium">风险描述</th>
                            <th className="py-3 px-5 font-medium">涉及文件</th>
                            <th className="py-3 px-5 font-medium text-right">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-5">
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">设备特征 - MAC地址</span>
                            </td>
                            <td className="py-4 px-5 text-sm text-slate-700 font-medium">发现完全相同的 MAC 地址 (00:1A:2B:3C:4D:5E)</td>
                            <td className="py-4 px-5 text-sm text-slate-500">{comparingFiles.slice(0, 2).map(f => f.name).join(', ')}</td>
                            <td className="py-4 px-5 text-right">
                              <button onClick={() => setReportTab('device')} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">查看详情</button>
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-5">
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">技术标 - 语句雷同</span>
                            </td>
                            <td className="py-4 px-5 text-sm text-slate-700 font-medium">安全保证措施章节存在 100% 相似段落</td>
                            <td className="py-4 px-5 text-sm text-slate-500">{comparingFiles.slice(0, 2).map(f => f.name).join(', ')}</td>
                            <td className="py-4 px-5 text-right">
                              <button onClick={() => setReportTab('tech')} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">查看详情</button>
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-5">
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">经济标 - 计价锁号</span>
                            </td>
                            <td className="py-4 px-5 text-sm text-slate-700 font-medium">提取到相同的广联达计价软件加密锁号</td>
                            <td className="py-4 px-5 text-sm text-slate-500">{[comparingFiles[0]?.name, comparingFiles[2]?.name].filter(Boolean).join(', ')}</td>
                            <td className="py-4 px-5 text-right">
                              <button onClick={() => setReportTab('economic')} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">查看详情</button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Credit Tab */}
              {reportTab === 'credit' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><Clock className="w-5 h-5 text-blue-500"/> 资信标特征矩阵</h3>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span className="w-3 h-3 bg-red-100 border border-red-300 rounded-sm inline-block"></span> 标红代表存在重复风险 (多份文件信息一致)
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600">
                          <th className="py-4 px-5 font-bold border-r border-slate-200 w-64 bg-slate-100">文件名称 \ 检测点</th>
                          {creditItems.map(item => (
                            <th key={item} className="py-4 px-5 font-bold border-r border-slate-200 whitespace-nowrap">{item}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {mockCreditData.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-5 font-medium text-slate-800 border-r border-slate-200 bg-slate-50/50">{row.name}</td>
                            {row.values.map((val, colIdx) => {
                              const isDup = isCreditValueDuplicate(colIdx, val);
                              const duplicates = isDup ? getDuplicateDetails(colIdx, val, row.id) : [];
                              return (
                                <td 
                                  key={colIdx} 
                                  onClick={() => {
                                    const duplicates = mockCreditData
                                      .filter(d => d.values[colIdx] === val && d.name !== row.name)
                                      .map(d => ({ fileName: d.name, value: val }));

                                    setPdfPreviewState({
                                      isOpen: true,
                                      fileName: row.name,
                                      value: val,
                                      type: creditItems[colIdx],
                                      contentType: 'text',
                                      duplicates: isDup ? duplicates : undefined
                                    });
                                  }}
                                  className={`py-4 px-5 text-sm border-r border-slate-200 relative group cursor-pointer hover:bg-blue-50 transition-colors ${isDup ? 'bg-red-50 text-red-700 font-bold' : 'text-slate-600'}`}
                                >
                                  {isDup && <AlertTriangle className="w-4 h-4 inline mr-1.5 text-red-500" />}
                                  {val}
                                  {isDup && (
                                    <div className="absolute z-50 hidden group-hover:block bg-slate-800 text-white text-xs rounded p-2 shadow-lg -top-10 left-0 whitespace-nowrap">
                                      <div className="font-bold mb-1">重复预警</div>
                                      <div>与以下文件内容完全一致:</div>
                                      <div className="text-slate-300 mt-0.5">{duplicates.join(', ')}</div>
                                      <div className="absolute -bottom-1 left-4 w-2 h-2 bg-slate-800 transform rotate-45"></div>
                                    </div>
                                  )}
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
                <div className="space-y-8">
                  {/* Section 1: Document Properties Matrix */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-500"/> 
                        文档属性深度比对
                      </h3>
                      <span className="text-xs text-slate-500 bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
                        共检查 {mockTechDetails.docProps.items.length} 项属性
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                            <th className="py-3 px-6 font-medium w-48">属性名称</th>
                            {comparingFiles.map((f, i) => (
                              <th key={f.id} className="py-3 px-6 font-medium border-l border-slate-100">
                                {f.name}
                              </th>
                            ))}
                            <th className="py-3 px-6 font-medium border-l border-slate-100 w-32 text-center">状态</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {mockTechDetails.docProps.items.map((item, idx) => {
                             const isFail = item.values.some(v => v.status === 'fail');
                             return (
                              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="py-4 px-6 font-medium text-slate-700">{item.label}</td>
                                {item.values.map((v, vIdx) => (
                                  <td key={vIdx} className={`py-4 px-6 text-sm border-l border-slate-100 ${v.status === 'fail' ? 'bg-red-50/30 text-red-700 font-medium' : 'text-slate-600'}`}>
                                    {v.value}
                                  </td>
                                ))}
                                <td className="py-4 px-6 border-l border-slate-100 text-center">
                                  {isFail ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      异常
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      正常
                                    </span>
                                  )}
                                </td>
                              </tr>
                             );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Section 2: Content Consistency Checks (Cards) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[
                      { key: 'images', icon: Image, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100' },
                      { key: 'ocr', icon: ScanText, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
                      { key: 'table', icon: Table, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                      { key: 'signature', icon: PenTool, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
                      { key: 'citation', icon: Quote, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
                      { key: 'sensitive', icon: ShieldAlert, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' }
                    ].map(({ key, icon: Icon, color, bg, border }) => {
                      const section = mockTechDetails[key as keyof typeof mockTechDetails];
                      if (!section) return null;
                      const failCount = section.items.filter((i: any) => i.status === 'fail').length;
                      
                      return (
                        <div key={key} className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
                          <div className={`p-4 border-b border-slate-100 flex justify-between items-center ${bg} bg-opacity-30`}>
                            <div className="flex items-center gap-2">
                              <div className={`p-2 rounded-lg bg-white shadow-sm ${color}`}>
                                <Icon className="w-5 h-5"/>
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-800">{section.title}</h3>
                                <p className="text-xs text-slate-500">{section.desc}</p>
                              </div>
                            </div>
                            {failCount > 0 && (
                              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                                {failCount} 处异常
                              </span>
                            )}
                          </div>
                          <div className="p-4 space-y-3 flex-1">
                            {section.items.map((item: any) => (
                              <div 
                                key={item.id || item.keyword} 
                                onClick={() => handleTechItemClick(item)}
                                className={`group p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md relative overflow-hidden ${
                                  item.status === 'fail' ? 'border-red-200 bg-red-50/50 hover:bg-red-50' : 
                                  item.status === 'info' ? 'border-amber-200 bg-amber-50/50 hover:bg-amber-50' :
                                  'border-slate-100 bg-slate-50/50 hover:bg-white'
                                }`}
                              >
                                <div className="flex justify-between items-start relative z-10">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className={`font-bold text-sm truncate ${item.status === 'fail' ? 'text-red-700' : 'text-slate-700'}`}>
                                        {item.name || item.keyword}
                                      </span>
                                      {item.status === 'fail' && <AlertTriangle className="w-3 h-3 text-red-500" />}
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2">{item.desc}</p>
                                    {item.context && (
                                      <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                                        <Search className="w-3 h-3" /> {item.context}
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-3 flex flex-col items-end gap-2">
                                     {item.status === 'fail' ? (
                                      <span className="text-[10px] font-bold text-red-600 bg-white px-2 py-1 rounded-full border border-red-100 shadow-sm">
                                        查看比对
                                      </span>
                                    ) : (
                                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full border shadow-sm bg-white ${
                                        item.status === 'info' ? 'text-amber-600 border-amber-100' : 'text-emerald-600 border-emerald-100'
                                      }`}>
                                        {item.status === 'info' ? '关注' : '正常'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Section 3: Text Comparison (Existing) */}
                  <div className="flex h-[600px] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-col">
                     <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <FileSearch className="w-5 h-5 text-emerald-500"/> 
                        文本内容深度查重
                      </h3>
                      <span className="text-xs text-slate-500">
                        发现 {mockDuplicates.length} 处高度相似段落
                      </span>
                    </div>
                    <div className="flex-1 flex overflow-hidden">
                      {/* Left: Duplicates List */}
                      <div className="w-80 border-r border-slate-200 bg-slate-50 flex flex-col">
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                          {mockDuplicates.map(dup => (
                            <button 
                              key={dup.id}
                              onClick={() => handleDuplicateClick(dup)}
                              className={`w-full text-left p-4 rounded-xl border transition-all ${activeDuplicateId === dup.id ? 'bg-indigo-50 border-indigo-300 shadow-sm ring-1 ring-indigo-500/20' : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-sm'}`}
                            >
                              <div className="font-bold text-sm text-slate-800 mb-2">{dup.title}</div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500">相似度</span>
                                <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">{dup.similarity}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Right: PDF Views */}
                      <div className="flex-1 flex bg-slate-200 p-5 gap-5 overflow-hidden">
                        {/* File A */}
                        <div className="flex-1 flex flex-col shadow-sm rounded-lg overflow-hidden">
                          <div className="bg-white border-b border-slate-200 p-2 flex items-center">
                            <select 
                              value={techFileA} 
                              onChange={e => setTechFileA(e.target.value)}
                              className="w-full p-2 rounded bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                              {comparingFiles.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                            </select>
                          </div>
                          {renderMockPdfPage(techFileA, pdfARef, true)}
                        </div>
                        
                        {/* File B */}
                        <div className="flex-1 flex flex-col shadow-sm rounded-lg overflow-hidden">
                          <div className="bg-white border-b border-slate-200 p-2 flex items-center">
                            <select 
                              value={techFileB} 
                              onChange={e => setTechFileB(e.target.value)}
                              className="w-full p-2 rounded bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                              {comparingFiles.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                            </select>
                          </div>
                          {renderMockPdfPage(techFileB, pdfBRef, false)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Economic Tab */}
              {reportTab === 'economic' && (
                <div className="space-y-4">
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-slate-800 flex items-center gap-2"><Fingerprint className="w-5 h-5 text-amber-500"/> 经济标异常分析</h3>
                      <p className="text-sm text-slate-500 mt-1">深度比对工程量清单、报价明细及计价软件底层特征，共发现 {mockEconomicData.length} 处异常。</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {mockEconomicData.map((item) => (
                      <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-bold text-slate-800 text-lg">{item.type}</h4>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                item.riskLevel === '高风险' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                              }`}>
                                {item.riskLevel}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600">{item.desc}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-slate-500 mb-1">涉及文件 ({item.files.length})</div>
                            <div className="flex flex-col items-end gap-1">
                              {item.files.map((f, idx) => (
                                <span key={idx} className="text-sm font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{f}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="p-5 bg-white">
                          <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">详细比对依据</h5>
                          <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                            <table className="w-full text-left text-sm">
                              <tbody className="divide-y divide-slate-200">
                                {item.evidence.map((ev: any, idx) => (
                                  <tr key={idx} className="hover:bg-slate-100/50 transition-colors">
                                    <td className="py-3 px-4 font-medium text-slate-700 w-1/3 border-r border-slate-200 bg-slate-50/50">
                                      {ev.code ? <span className="font-mono text-indigo-600 mr-2">{ev.code}</span> : null}
                                      {ev.name || ev.key || ev.file}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600 font-mono text-xs">
                                      {ev.detail || ev.value}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Device Tab */}
              {reportTab === 'device' && (
                <div className="space-y-4">
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-slate-800 flex items-center gap-2"><Cpu className="w-5 h-5 text-purple-500"/> 文件设备特征追踪</h3>
                      <p className="text-sm text-slate-500 mt-1">提取文档底层元数据及硬件特征码，共发现 {mockDeviceData.length} 处高度重合特征。</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {mockDeviceData.map((item) => (
                      <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-bold text-slate-800 text-lg">{item.type}</h4>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                item.riskLevel === '高风险' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                              }`}>
                                {item.riskLevel}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600">{item.desc}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-slate-500 mb-1">涉及文件 ({item.files.length})</div>
                            <div className="flex flex-col items-end gap-1">
                              {item.files.map((f, idx) => (
                                <span key={idx} className="text-sm font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{f}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="p-5 bg-white">
                          <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">提取到的相同特征值</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {item.evidence.map((ev: any, idx) => (
                              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col justify-center">
                                <span className="text-xs text-slate-500 mb-1">{ev.key}</span>
                                <span className="font-mono text-sm font-bold text-slate-800">{ev.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">确认删除模板？</h3>
              <p className="text-sm text-slate-500">
                此操作无法撤销，删除后将无法恢复该模板配置。
              </p>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors"
              >
                取消
              </button>
              <button 
                onClick={confirmDeleteTemplate}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 shadow-sm transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Editor Modal */}
      {isTemplateEditorOpen && editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">
                {templates.some(t => t.id === editingTemplate.id) ? '编辑模板' : '新建模板'}
              </h2>
              <button onClick={() => setIsTemplateEditorOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">模板名称</label>
                  <input 
                    type="text" 
                    value={editingTemplate.name}
                    onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    placeholder="请输入模板名称"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">模板描述</label>
                  <textarea 
                    value={editingTemplate.desc}
                    onChange={e => setEditingTemplate({...editingTemplate, desc: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none h-20 resize-none"
                    placeholder="请输入模板描述"
                  />
                </div>
              </div>

              {/* Check Types */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">包含检查项</label>
                <div className="flex flex-wrap gap-3">
                  {ALL_CHECK_TYPES.map(type => (
                    <label key={type} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                      editingTemplate.config.types.includes(type) 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}>
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={editingTemplate.config.types.includes(type)}
                        onChange={() => {
                          const newTypes = editingTemplate.config.types.includes(type)
                            ? editingTemplate.config.types.filter((t: string) => t !== type)
                            : [...editingTemplate.config.types, type];
                          setEditingTemplate({
                            ...editingTemplate,
                            config: { ...editingTemplate.config, types: newTypes }
                          });
                        }}
                      />
                      <span className="text-sm font-medium">{type}</span>
                      {editingTemplate.config.types.includes(type) && <Check className="w-4 h-4" />}
                    </label>
                  ))}
                </div>
              </div>

              {/* Detailed Check Items */}
              {editingTemplate.config.types.length > 0 && (
                <div className="space-y-4 border-t border-slate-100 pt-4">
                  <label className="block text-sm font-medium text-slate-700">具体检查点配置</label>
                  
                  {editingTemplate.config.types.includes('资信标比对') && (
                    <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
                      <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Clock className="w-3 h-3" /> 资信标检查点
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {ALL_CREDIT_ITEMS.map(item => (
                          <label key={item} className={`text-xs px-2 py-1 rounded border cursor-pointer transition-colors ${
                            editingTemplate.config.credit.includes(item)
                              ? 'bg-blue-100 border-blue-200 text-blue-700'
                              : 'bg-white border-slate-200 text-slate-500 hover:border-blue-200'
                          }`}>
                            <input 
                              type="checkbox" 
                              className="hidden"
                              checked={editingTemplate.config.credit.includes(item)}
                              onChange={() => {
                                const newItems = editingTemplate.config.credit.includes(item)
                                  ? editingTemplate.config.credit.filter((i: string) => i !== item)
                                  : [...editingTemplate.config.credit, item];
                                setEditingTemplate({
                                  ...editingTemplate,
                                  config: { ...editingTemplate.config, credit: newItems }
                                });
                              }}
                            />
                            {item}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {editingTemplate.config.types.includes('技术标比对') && (
                    <div className="bg-emerald-50/50 rounded-lg p-4 border border-emerald-100">
                      <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <FileSearch className="w-3 h-3" /> 技术标检查点
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {ALL_TECH_ITEMS.map(item => (
                          <label key={item} className={`text-xs px-2 py-1 rounded border cursor-pointer transition-colors ${
                            editingTemplate.config.tech.includes(item)
                              ? 'bg-emerald-100 border-emerald-200 text-emerald-700'
                              : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-200'
                          }`}>
                            <input 
                              type="checkbox" 
                              className="hidden"
                              checked={editingTemplate.config.tech.includes(item)}
                              onChange={() => {
                                const newItems = editingTemplate.config.tech.includes(item)
                                  ? editingTemplate.config.tech.filter((i: string) => i !== item)
                                  : [...editingTemplate.config.tech, item];
                                setEditingTemplate({
                                  ...editingTemplate,
                                  config: { ...editingTemplate.config, tech: newItems }
                                });
                              }}
                            />
                            {item}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {editingTemplate.config.types.includes('经济标比对') && (
                    <div className="bg-amber-50/50 rounded-lg p-4 border border-amber-100">
                      <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Fingerprint className="w-3 h-3" /> 经济标检查点
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {ALL_ECONOMIC_ITEMS.map(item => (
                          <label key={item} className={`text-xs px-2 py-1 rounded border cursor-pointer transition-colors ${
                            editingTemplate.config.economic.includes(item)
                              ? 'bg-amber-100 border-amber-200 text-amber-700'
                              : 'bg-white border-slate-200 text-slate-500 hover:border-amber-200'
                          }`}>
                            <input 
                              type="checkbox" 
                              className="hidden"
                              checked={editingTemplate.config.economic.includes(item)}
                              onChange={() => {
                                const newItems = editingTemplate.config.economic.includes(item)
                                  ? editingTemplate.config.economic.filter((i: string) => i !== item)
                                  : [...editingTemplate.config.economic, item];
                                setEditingTemplate({
                                  ...editingTemplate,
                                  config: { ...editingTemplate.config, economic: newItems }
                                });
                              }}
                            />
                            {item}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {editingTemplate.config.types.includes('文件设备特征比对') && (
                    <div className="bg-purple-50/50 rounded-lg p-4 border border-purple-100">
                      <div className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Cpu className="w-3 h-3" /> 设备特征检查点
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {ALL_DEVICE_ITEMS.map(item => (
                          <label key={item} className={`text-xs px-2 py-1 rounded border cursor-pointer transition-colors ${
                            editingTemplate.config.device.includes(item)
                              ? 'bg-purple-100 border-purple-200 text-purple-700'
                              : 'bg-white border-slate-200 text-slate-500 hover:border-purple-200'
                          }`}>
                            <input 
                              type="checkbox" 
                              className="hidden"
                              checked={editingTemplate.config.device.includes(item)}
                              onChange={() => {
                                const newItems = editingTemplate.config.device.includes(item)
                                  ? editingTemplate.config.device.filter((i: string) => i !== item)
                                  : [...editingTemplate.config.device, item];
                                setEditingTemplate({
                                  ...editingTemplate,
                                  config: { ...editingTemplate.config, device: newItems }
                                });
                              }}
                            />
                            {item}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Threshold & AI */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    相似度阈值 ({editingTemplate.config.threshold}%)
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    step="5"
                    value={editingTemplate.config.threshold}
                    onChange={e => setEditingTemplate({
                      ...editingTemplate,
                      config: { ...editingTemplate.config, threshold: parseInt(e.target.value) }
                    })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>宽松 (0%)</span>
                    <span>严格 (100%)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <div className="font-medium text-slate-700">AI 深度分析</div>
                    <div className="text-xs text-slate-500">启用大模型进行语义理解</div>
                  </div>
                  <button 
                    onClick={() => setEditingTemplate({
                      ...editingTemplate,
                      config: { ...editingTemplate.config, enableAI: !editingTemplate.config.enableAI }
                    })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      editingTemplate.config.enableAI ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      editingTemplate.config.enableAI ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsTemplateEditorOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleSaveTemplate}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-sm transition-colors"
              >
                保存配置
              </button>
            </div>
          </div>
        </div>
      )}
      {/* PDF Preview Modal */}
      {pdfPreviewState && pdfPreviewState.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{pdfPreviewState.fileName}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="bg-slate-200 px-2 py-0.5 rounded text-xs font-medium text-slate-700">{pdfPreviewState.type}</span>
                    <span>检测值: <span className="font-bold text-slate-800">{pdfPreviewState.value}</span></span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setPdfPreviewState(null)} 
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-slate-100 p-8 flex justify-center">
              {pdfPreviewState.duplicates && pdfPreviewState.duplicates.length > 0 ? (
                <div className="flex gap-8 w-full max-w-[1600px]">
                  {/* Original File */}
                  <div className="flex-1 min-w-0">
                    <div className="mb-2 font-bold text-slate-700 flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs border border-blue-200">当前文件</span>
                      {pdfPreviewState.fileName}
                    </div>
                    {renderPreviewPdf(pdfPreviewState.fileName, pdfPreviewState.value, pdfPreviewState.type, false, pdfPreviewState.contentType)}
                  </div>
                  
                  {/* Duplicate File (First one for now) */}
                  <div className="flex-1 min-w-0">
                    <div className="mb-2 font-bold text-slate-700 flex items-center gap-2">
                      <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs border border-red-200">重复文件</span>
                      {pdfPreviewState.duplicates[0].fileName}
                    </div>
                    {renderPreviewPdf(pdfPreviewState.duplicates[0].fileName, pdfPreviewState.duplicates[0].value, pdfPreviewState.type, true, pdfPreviewState.contentType)}
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-3xl">
                   {renderPreviewPdf(pdfPreviewState.fileName, pdfPreviewState.value, pdfPreviewState.type, false, pdfPreviewState.contentType)}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
