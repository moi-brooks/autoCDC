import React, { useState } from 'react';
import { Globe, Send, Loader2, FileText, ChevronRight, Layout, Edit3, Save, Download, RefreshCw } from 'lucide-react';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error crawling:', error);
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
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Cahier_des_Charges_${data.metadata.title.replace(/\s+/g, '_')}.${format === 'md' ? 'md' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <FileText className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">AutoCdC</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold mb-4 text-slate-900">
            Generate your <span className="text-blue-600">Cahier des Charges</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Analyze any URL and refine the generated specifications.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto mb-16">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Globe className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
              className="block w-full pl-11 pr-32 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {loading ? 'Analyzing...' : 'Generate'}
            </button>
          </div>
        </form>

        {data && data.cdc && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{data.metadata.title}</h3>
                <p className="text-slate-500 font-mono text-sm">{data.metadata.url}</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => downloadExport('md')}
                  className="flex items-center gap-2 border border-slate-200 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  <Download className="w-4 h-4" /> Markdown
                </button>
                <button 
                  onClick={() => downloadExport('pdf')}
                  className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors"
                >
                  <FileText className="w-4 h-4" /> Export PDF
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                {Object.entries(data.cdc).map(([title, content]: [string, any], index) => (
                  <section key={index} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 text-blue-500" />
                        {title}
                      </h4>
                      {editingSection === title ? (
                        <button onClick={() => handleSave(title)} className="text-blue-600 flex items-center gap-1 text-sm font-bold">
                          <Save className="w-4 h-4" /> Save
                        </button>
                      ) : (
                        <button onClick={() => handleEdit(title, content)} className="text-slate-400 hover:text-blue-600 transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="p-6 text-slate-600 leading-relaxed">
                      {editingSection === title ? (
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full h-64 p-4 font-mono text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      ) : (
                        typeof content === 'string' ? (
                          <p className="whitespace-pre-wrap">{content}</p>
                        ) : (
                          <pre className="text-xs bg-slate-900 text-slate-300 p-4 rounded-lg overflow-x-auto font-mono">
                            {JSON.stringify(content, null, 2)}
                          </pre>
                        )
                      )}
                    </div>
                  </section>
                ))}
              </div>

              <div className="space-y-6 sticky top-24 h-fit">
                <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg shadow-blue-200">
                  <h4 className="font-bold mb-4 flex items-center gap-2">
                    <Layout className="w-5 h-5" />
                    Sections
                  </h4>
                  <ul className="text-sm space-y-2 opacity-90">
                    {Object.keys(data.cdc).map((k) => (
                      <li key={k} className="hover:translate-x-1 transition-transform cursor-pointer line-clamp-1 border-l-2 border-transparent hover:border-white pl-2">
                        {k}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-slate-400" />
                    Regenerate
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">Need a different perspective? Regenerate the entire document.</p>
                  <button 
                    onClick={handleSubmit}
                    className="w-full py-2 border border-blue-600 text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-colors text-sm"
                  >
                    Regenerate All
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
