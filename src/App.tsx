import React, { useState } from 'react';
import { motion } from 'motion/react';
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
  AlertCircle
} from 'lucide-react';

// Mock Data
const INSPECTION_POINTS = [
  { id: 1, title: '文档属性比对', desc: '检查创建时间、最后修改时间、作者、最后保存者等元数据。', icon: <Clock className="w-6 h-6 text-blue-500" /> },
  { id: 2, title: '内容相似度分析', desc: '基于自然语言处理，深度比对正文段落、表格、图片的相似度。', icon: <FileSearch className="w-6 h-6 text-indigo-500" /> },
  { id: 3, title: '隐藏水印检测', desc: '提取文档中可能存在的不可见数字水印或特征码。', icon: <Fingerprint className="w-6 h-6 text-purple-500" /> },
  { id: 4, title: '机器特征识别', desc: '识别生成文档的计算机MAC地址、硬盘序列号等硬件特征。', icon: <Cpu className="w-6 h-6 text-emerald-500" /> },
];

const NEWS_ITEMS = [
  { id: 1, date: '2026-03-02', title: '系统升级公告：新增PDF文档深度解析算法，提升比对精度', type: '公告' },
  { id: 2, date: '2026-02-28', title: '如何利用多版本比对功能快速定位合同条款变更？', type: '指南' },
  { id: 3, date: '2026-02-15', title: '研发文档版本混乱？一键查重帮你找出最新有效版本', type: '案例' },
  { id: 4, date: '2026-01-20', title: '关于优化大文件（>50MB）比对速度的更新说明', type: '更新' },
];

const HISTORY_ITEMS = [
  { id: 'CMP-20260301-01', name: '《产品需求文档(PRD)》V2与V3版本比对', date: '2026-03-01 14:30', status: '已完成', similarity: '82%', files: 2 },
  { id: 'CMP-20260225-03', name: '年度采购合同修订版审查', date: '2026-02-25 09:15', status: '有差异', similarity: '95%', files: 2 },
  { id: 'CMP-20260220-02', name: 'Q1季度财务报表多部门汇总核对', date: '2026-02-20 16:45', status: '已完成', similarity: '45%', files: 5 },
];

export default function App() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<Array<{id: string, name: string, size: number}>>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    const validFiles: Array<{id: string, name: string, size: number}> = [];

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
      });
    }

    setFiles([...files, ...validFiles]);
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

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <FileSearch className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">多版本文件比对系统</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-indigo-600 font-medium">首页</a>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero / Upload Section */}
        <section>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">新建比对任务</h1>
            <p className="text-slate-500 mt-1">上传多个版本的文件或不同投标人的标书，系统将自动进行深度雷同性分析。</p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
          </motion.div>

          {/* Error Message */}
          {errorMsg && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{errorMsg}</p>
            </motion.div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  已选文件 ({files.length}/{MAX_FILES})
                </h3>
                <span className="text-sm text-slate-500">
                  总大小: {formatSize(files.reduce((acc, f) => acc + f.size, 0))} / 500 MB
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {files.map(file => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg group hover:border-indigo-200 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <File className="w-5 h-5 text-slate-400 shrink-0" />
                      <div className="truncate">
                        <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{formatSize(file.size)}</p>
                      </div>
                    </div>
                    <button onClick={() => removeFile(file.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2">
                  <FileSearch className="w-4 h-4" />
                  开始深度比对
                </button>
              </div>
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
                        <th className="py-3 px-4 font-medium whitespace-nowrap">最高相似度</th>
                        <th className="py-3 px-4 font-medium whitespace-nowrap">状态</th>
                        <th className="py-3 px-4 font-medium text-right whitespace-nowrap">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {HISTORY_ITEMS.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 min-w-[200px]">
                            <div className="font-medium text-slate-800">{item.name}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{item.id}</div>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600 whitespace-nowrap">{item.date}</td>
                          <td className="py-3 px-4 text-sm text-slate-600 whitespace-nowrap">{item.files} 份</td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${parseInt(item.similarity) > 50 ? 'text-red-600' : 'text-slate-600'}`}>
                              {item.similarity}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                              item.status === '有差异' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
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
      </main>
    </div>
  );
}
