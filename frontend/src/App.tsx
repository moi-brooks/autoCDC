import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, Send, Loader2, FileText, ChevronRight, Layout, 
  Edit3, Save, Download, RefreshCw, Layers, Target, 
  Users, Activity, Code, Database, Clock, CreditCard, 
  Package, AlertTriangle, Shield, Check, X, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Icons Mapping ---
const SECTION_ICONS: Record<string, any> = {
  "Contexte & Objectifs": Target,
  "Description du besoin": Users,
  "Analyse de l’existant": Search,
  "Périmètre fonctionnel": Layers,
  "Acteurs et rôles": Users,
  "Cas d’utilisation": Activity,
  "Exigences fonctionnelles": Code,
  "Exigences non fonctionnelles": Shield,
  "Architecture technique proposée": Layers,
  "Modèle de données préliminaire": Database,
  "API endpoints proposés": Globe,
  "Planning estimatif": Clock,
  "Estimation budgétaire": CreditCard,
  "Livrables": Package,
  "Risques & hypothèses": AlertTriangle,
};

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [data, setData] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const steps = [
    "Crawling the website...",
    "Extracting metadata...",
    "Analyzing features...",
    "Generating professional CdC..."
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((s) => (s < steps.length - 1 ? s + 1 : s));
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setData(null);
    try {
      const response = await fetch('http://localhost:8000/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const result = await response.json();
      setData(result);
      const firstSection = Object.keys(result.cdc)[0];
      setActiveSection(firstSection);
    } catch (error) {
      console.error('Error crawling:', error);
      alert("Failed to analyze the URL. Please check your backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (section: string, content: any) => {
    setEditingSection(section);
    setEditValue(typeof content === 'string' ? content : JSON.stringify(content, null, 2));
  };

  const handleSave = (section: string) => {
    const updatedCdc = { ...data.cdc };
    try {
      updatedCdc[section] = editValue.startsWith('{') || editValue.startsWith('[') 
        ? JSON.parse(editValue) 
        : editValue;
      setData({ ...data, cdc: updatedCdc });
      setEditingSection(null);
    } catch (e) {
      alert("Invalid JSON format for this section.");
    }
  };

  const downloadExport = async (format: 'pdf' | 'md') => {
    try {
      const response = await fetch(`http://localhost:8000/export/${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata: data.metadata, cdc: data.cdc }),
      });
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `Cahier_des_Charges_${data.metadata.title.replace(/\s+/g, '_')}.${format === 'md' ? 'md' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setShowExportMenu(false);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
              <FileText className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">AutoCdC</h1>
            <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-md border border-slate-200">v1.0</span>
          </div>

          <div className="flex items-center gap-4">
            {data && (
              <div className="relative">
                <button 
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-slate-800 transition-all shadow-md shadow-slate-200 active:scale-95"
                >
                  <Download className="w-4 h-4" /> Export
                </button>
                <AnimatePresence>
                  {showExportMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 p-1"
                    >
                      <button onClick={() => downloadExport('md')} className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-3">
                        <FileText className="w-4 h-4 text-blue-500" /> Markdown (.md)
                      </button>
                      <button onClick={() => downloadExport('pdf')} className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-3">
                        <FileText className="w-4 h-4 text-red-500" /> Adobe PDF (.pdf)
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            <button className="text-slate-400 hover:text-slate-600 p-2">
              <RefreshCw className="w-5 h-5" onClick={() => window.location.reload()} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col max-w-[1600px] mx-auto w-full px-6 py-8 h-[calc(100vh-73px)]">
        {!data && !loading ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto text-center"
          >
            <div className="mb-8 p-4 bg-blue-50 rounded-3xl ring-8 ring-blue-50/50">
              <Globe className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-5xl font-extrabold mb-6 tracking-tight text-slate-900">
              Transform any <span className="text-blue-600">URL</span> into a <br />professional specification.
            </h2>
            <p className="text-xl text-slate-500 mb-12 leading-relaxed">
              Analyze landing pages, SaaS apps, or portals to generate a complete 
              Cahier des Charges in seconds using AI.
            </p>
            
            <form onSubmit={handleSubmit} className="w-full relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-slate-400" />
                </div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/project"
                  required
                  className="block w-full pl-14 pr-44 py-5 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-xl"
                />
                <button
                  type="submit"
                  className="absolute right-2.5 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-blue-200"
                >
                  <Send className="w-5 h-5" /> Generate
                </button>
              </div>
            </form>
            
            <div className="mt-12 flex gap-8 text-sm font-medium text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div> Powered by Llama 3.3
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div> 15 Detailed Sections
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div> MD & PDF Export
              </div>
            </div>
          </motion.div>
        ) : loading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative mb-12">
              <div className="w-24 h-24 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-pulse" />
                </div>
              </div>
            </div>
            <motion.p 
              key={loadingStep}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-slate-800"
            >
              {steps[loadingStep]}
            </motion.p>
            <p className="text-slate-400 mt-2 font-medium">This usually takes about 30-45 seconds.</p>
          </div>
        ) : (
          <div className="flex-1 flex gap-8 overflow-hidden min-h-0">
            {/* Sidebar Navigation */}
            <aside className="w-72 flex flex-col gap-6 overflow-y-auto pr-2 pb-8 scrollbar-hide">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm shrink-0">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">
                    {data.metadata.title.charAt(0)}
                  </div>
                  <h3 className="font-bold text-slate-900 truncate" title={data.metadata.title}>
                    {data.metadata.title}
                  </h3>
                </div>
                <p className="text-[11px] font-mono text-slate-400 truncate opacity-70 mb-4">{data.metadata.url}</p>
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-full"></div>
                </div>
              </div>

              <nav className="flex flex-col gap-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">Sections (15)</p>
                {Object.keys(data.cdc).map((sectionTitle) => {
                  const Icon = SECTION_ICONS[sectionTitle] || FileText;
                  const isActive = activeSection === sectionTitle;
                  return (
                    <button
                      key={sectionTitle}
                      onClick={() => setActiveSection(sectionTitle)}
                      className={cn(
                        "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left relative",
                        isActive 
                          ? "bg-blue-600 text-white shadow-md shadow-blue-200 font-semibold" 
                          : "text-slate-600 hover:bg-white hover:shadow-sm hover:text-slate-900"
                      )}
                    >
                      <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-400 group-hover:text-blue-500")} />
                      <span className="text-sm truncate">{sectionTitle}</span>
                      {isActive && (
                        <motion.div 
                          layoutId="activeTab"
                          className="absolute left-0 w-1 h-6 bg-white rounded-full ml-1"
                        />
                      )}
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
              <AnimatePresence mode="wait">
                {activeSection && (
                  <motion.div 
                    key={activeSection}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex-1 flex flex-col overflow-hidden"
                  >
                    {/* Section Header */}
                    <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-sm z-10">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                          {React.createElement(SECTION_ICONS[activeSection] || FileText, { className: "w-6 h-6" })}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">{activeSection}</h2>
                          <p className="text-xs text-slate-500">Auto-generated by AutoCdC Intelligence</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {editingSection === activeSection ? (
                          <>
                            <button 
                              onClick={() => setEditingSection(null)}
                              className="px-4 py-2 rounded-lg font-semibold text-slate-500 hover:bg-slate-100 transition-colors flex items-center gap-2"
                            >
                              <X className="w-4 h-4" /> Cancel
                            </button>
                            <button 
                              onClick={() => handleSave(activeSection)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md shadow-blue-100 active:scale-95"
                            >
                              <Check className="w-4 h-4" /> Save Changes
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => handleEdit(activeSection, data.cdc[activeSection])}
                            className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Edit Section"
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                      {editingSection === activeSection ? (
                        <div className="h-full flex flex-col gap-4">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Editor Mode</p>
                          <textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 w-full p-6 font-mono text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none resize-none shadow-inner leading-relaxed"
                            placeholder="Type your refined requirements here..."
                          />
                        </div>
                      ) : (
                        <div className="max-w-4xl prose prose-slate">
                          {typeof data.cdc[activeSection] === 'string' ? (
                            <div className="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap">
                              {data.cdc[activeSection]}
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <pre className="text-sm bg-slate-900 text-slate-300 p-6 rounded-2xl overflow-x-auto font-mono shadow-2xl border border-slate-700">
                                {JSON.stringify(data.cdc[activeSection], null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Bottom Context Nav */}
              <div className="px-8 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-400 font-medium">
                <div className="flex items-center gap-4">
                  <span>Sections Completed: 15 / 15</span>
                  <div className="w-32 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-full"></div>
                  </div>
                </div>
                <div>Last update: Just now</div>
              </div>
            </main>
          </div>
        )}
      </div>
      
      {/* Toast Notification Placeholder */}
      <div className="fixed bottom-8 right-8 pointer-events-none z-[100]">
        <AnimatePresence>
          {/* We could add toasts here */}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
