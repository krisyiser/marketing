"use client";

import {
  Sparkles,
  Folder,
  Image as ImageIcon,
  FileText,
  Send,
  Loader2,
  HardDrive,
  ChevronRight,
  AlertCircle,
  Home as HomeIcon,
  RefreshCw,
  CheckCircle,
  LayoutGrid,
  History,
  Trash2,
  Plus,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";

// --- Types ---
interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webContentLink?: string;
}

interface PageConfig {
  id: string;
  name: string;
  slug: string;
  category: string;
  templates?: string[];
  driveFolderId: string | null;
}

// --- Components ---

function DriveExplorer({ folderId, onSelectImage, onSync, isPlanning }: { folderId: string; onSelectImage: (file: DriveFile) => void; onSync: () => void; isPlanning: boolean }) {
  const [driveData, setDriveData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'stories' | 'generic'>('posts');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadFolder = useCallback(async (id: string) => {
    if (!id) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/drive?folderId=${id}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDriveData(data);
      (window as any)._lastDriveData = data;
      if (data.posts && data.posts.length > 0) {
        setActiveTab('posts');
        (window as any)._activeTab = 'posts';
      } else if (data.stories && data.stories.length > 0) {
        setActiveTab('stories');
        (window as any)._activeTab = 'stories';
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFolder(folderId);
  }, [folderId, loadFolder]);

  const getImageUrl = (fileId: string) => `/api/drive/image/${fileId}`;

  const renderGrid = (files: DriveFile[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar p-1">
      {files.map(img => (
        <button key={img.id} onClick={() => onSelectImage(img)} 
          className="flex flex-col items-center gap-2 p-2 bg-neutral-900 border border-neutral-800 rounded-2xl hover:border-indigo-500 hover:bg-neutral-800 hover:-translate-y-1 hover:shadow-xl transition-all group relative">
          <div className="w-full aspect-square rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800">
            <img src={getImageUrl(img.id)} alt={img.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          </div>
          <span className="text-[9px] text-neutral-500 truncate w-full px-1 font-black uppercase tracking-tighter">{img.name}</span>
        </button>
      ))}
      {files.length === 0 && <div className="col-span-full py-20 text-center text-neutral-600 italic text-sm">No hay contenido visual aquí.</div>}
    </div>
  );

  return (
    <div className="bg-neutral-900/80 backdrop-blur-3xl border border-neutral-800 rounded-[2.5rem] p-6 shadow-2xl flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 rounded-2xl shadow-inner border border-blue-500/20">
            <HardDrive className="text-blue-400 h-5 w-5" />
          </div>
          <div>
            <h3 className="font-black text-white text-lg tracking-tight">Active Drive</h3>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Sincronizado con Google</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={onSync} disabled={isPlanning || isLoading} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-500 text-white text-[10px] font-black uppercase rounded-2xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50">
                {isPlanning ? <Loader2 className="h-4 w-4 animate-spin font-black" /> : <Sparkles className="h-4 w-4" />}
                {isPlanning ? 'Planning...' : 'Planificar Todo'}
            </button>
            <button onClick={() => loadFolder(folderId)} className="p-3 bg-neutral-800 hover:bg-neutral-700 rounded-2xl transition-all border border-neutral-700">
              <RefreshCw className={`h-4 w-4 text-neutral-400 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
            </button>
        </div>
      </div>

      <div className="flex p-1.5 bg-neutral-950 rounded-2xl gap-1.5 border border-neutral-800">
        <button onClick={() => { setActiveTab('posts'); (window as any)._activeTab = 'posts'; }} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 ${activeTab === 'posts' ? 'bg-neutral-800 text-white shadow-xl border border-neutral-700' : 'text-neutral-500 hover:text-neutral-300'}`}>
          <LayoutGrid className="h-3.5 w-3.5" />
          Wall Captions
        </button>
        <button onClick={() => { setActiveTab('stories'); (window as any)._activeTab = 'stories'; }} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 ${activeTab === 'stories' ? 'bg-neutral-800 text-white shadow-xl border border-neutral-700' : 'text-neutral-500 hover:text-neutral-300'}`}>
          <History className="h-3.5 w-3.5" />
          Stories
        </button>
      </div>

      <div className="relative">
        {isLoading && (
            <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4 rounded-3xl">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                <p className="text-[10px] text-white font-black uppercase tracking-widest animate-pulse">Syncing Library...</p>
            </div>
        )}
        {error ? (
            <div className="p-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-3xl text-sm flex items-center gap-4">
                <AlertCircle className="h-6 w-6 shrink-0" />
                <span className="font-semibold">{error}</span>
            </div>
        ) : (
            driveData && renderGrid((activeTab === 'posts' ? driveData.posts : activeTab === 'stories' ? driveData.stories : driveData.genericImages) || [])
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [pages, setPages] = useState<PageConfig[]>([]);
  const [selectedPage, setSelectedPage] = useState<PageConfig | null>(null);
  const [selectedImage, setSelectedImage] = useState<DriveFile | null>(null);
  const [platform, setPlatform] = useState("Facebook");
  const [format, setFormat] = useState("Post (1:1)");
  const [output, setOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [templates, setTemplates] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [newTemplate, setNewTemplate] = useState("");

  const [drafts, setDrafts] = useState<any[]>([]);
  const [isPlanning, setIsPlanning] = useState(false);

  // Load drafts and templates when page changes
  useEffect(() => {
    if (selectedPage) {
      setTemplates(selectedPage.templates || []);
      fetch(`/api/pages/drafts?pageId=${selectedPage.id}`)
        .then(res => res.json())
        .then(data => setDrafts(data.drafts || []));
    }
  }, [selectedPage]);

  useEffect(() => {
    fetch("/api/pages")
      .then(res => res.json())
      .then(data => {
        setPages(data.pages);
        if (data.pages.length > 0) {
          const firstPage = data.pages[0];
          setSelectedPage(firstPage);
          setTemplates(firstPage.templates || []);
        }
      });
  }, []);

  const handleUpdateTemplates = async (updated: string[]) => {
    if (!selectedPage) return;
    setIsSaving(true);
    try {
      await fetch("/api/pages/update-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: selectedPage.id,
          templates: updated
        }),
      });
      setPages(prev => prev.map(p => p.id === selectedPage.id ? { ...p, templates: updated } : p));
      setSelectedPage({ ...selectedPage, templates: updated });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const addTemplate = () => {
    if (!newTemplate.trim()) return;
    const updated = [...templates, newTemplate.trim()];
    setTemplates(updated);
    setNewTemplate("");
    handleUpdateTemplates(updated);
  };

  const removeTemplate = (index: number) => {
    const updated = templates.filter((_, i) => i !== index);
    setTemplates(updated);
    handleUpdateTemplates(updated);
  };

  const handleSelectPage = (p: PageConfig) => {
    setSelectedPage(p);
    setSelectedImage(null);
    setOutput("");
    setTemplates(p.templates || []);
    setIsSidebarOpen(false);
  };

  const handleGenerate = async () => {
    if (!selectedPage || !selectedImage) return;
    setIsGenerating(true);
    setOutput("");
    setPublishStatus(null);
    
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: `ELIGE EL MEJOR COPY DE ESTA LISTA BASÁNDOTE EN LA IMAGEN:\n\n${templates.join('\n---\n')}`, 
          platform, 
          format,
          selectedId: selectedImage.id,
          imageUrl: `${window.location.origin}/api/drive/image/${selectedImage.id}`
        }),
      });
      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setOutput(prev => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedPage || !output || !selectedImage) return;
    setIsPublishing(true);
    setPublishStatus(null);

    try {
      const res = await fetch("/api/publish", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({
          pageId: selectedPage.id, 
          platform, 
          message: output, 
          imageUrl: `${window.location.origin}/api/drive/image/${selectedImage.id}`
        })
      });
      const data = await res.json();
      if (data.success) setPublishStatus("¡Publicado en el muro con éxito! 🎉");
      else setPublishStatus(`Error: ${data.error}`);
    } catch (err: any) {
      setPublishStatus(`Error: ${err.message}`);
    } finally { setIsPublishing(false); }
  };

  const handleBatchGenerate = async (files: DriveFile[], category: 'posts' | 'stories') => {
    if (!selectedPage || files.length === 0) return;
    setIsPlanning(true);
    const finalDrafts: any[] = [];

    for (const file of files) {
      const fullPrompt = `ELIGE EL MEJOR COPY DE ESTA LISTA BASÁNDOTE EN LA IMAGEN:\n\n${templates.join('\n---\n')}`;

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: fullPrompt, platform, format, selectedId: file.id, imageUrl: `${window.location.origin}/api/drive/image/${file.id}` }),
        });
        
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
          setDrafts(prev => {
             const others = prev.filter(d => d.id !== file.id);
             return [...others, { id: file.id, name: file.name, copy: fullText, date: new Date().toISOString().split('T')[0], pageId: selectedPage.id, type: category }];
          });
        }
        finalDrafts.push({ id: file.id, name: file.name, copy: fullText, date: new Date().toISOString().split('T')[0], pageId: selectedPage.id, type: category });
      } catch (err) { console.error("Batch error:", err); }
    }

    await fetch("/api/pages/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId: selectedPage.id, drafts: finalDrafts }),
    });

    setIsPlanning(false);
  };

  return (
    <div className="min-h-screen bg-black text-neutral-200 font-sans flex flex-col md:flex-row selection:bg-indigo-500/30">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-6 bg-neutral-900 border-b border-neutral-800 sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-indigo-400" />
            <h1 className="text-xl font-black text-white tracking-tighter">SociMation</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-neutral-800 rounded-xl">
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <nav className={`w-full md:w-80 bg-neutral-900/90 backdrop-blur-3xl border-r border-neutral-800 p-8 flex flex-col gap-10 h-screen sticky top-0 transition-all z-40 ${isSidebarOpen ? 'fixed inset-0' : 'hidden md:flex'}`}>
        <div className="hidden md:flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
            <Sparkles className="h-7 w-7 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">SociMation</h1>
        </div>
        
        <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-1">
          <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] px-4">Managed Brands</p>
          {pages.map(p => (
            <button key={p.id} onClick={() => handleSelectPage(p)} 
              className={`flex items-center gap-4 p-5 rounded-3xl transition-all text-sm font-bold group ${selectedPage?.id === p.id ? 'bg-indigo-500 text-white shadow-2xl shadow-indigo-500/30' : 'text-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-300'}`}>
              <div className={`p-2.5 rounded-xl transition-colors ${selectedPage?.id === p.id ? 'bg-white/20' : 'bg-neutral-800 group-hover:bg-neutral-700'}`}>
                <ImageIcon className="h-4 w-4" />
              </div>
              <span className="truncate">{p.name}</span>
            </button>
          ))}
        </div>

        <div className="bg-neutral-950/50 p-6 rounded-[2rem] border border-neutral-800">
            <p className="text-[9px] text-neutral-600 font-black uppercase tracking-widest mb-3 text-center">Cloud Health</p>
            <div className="flex justify-between items-center bg-neutral-900 p-3 rounded-2xl border border-neutral-800">
                <span className="text-[10px] font-bold text-neutral-400">Netlify Build</span>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
            </div>
        </div>
      </nav>

      <main className="flex-1 p-4 sm:p-10 overflow-y-auto bg-neutral-950">
        {selectedPage ? (
          <div className="max-w-7xl mx-auto flex flex-col gap-10 animate-in fade-in slide-in-from-right-10 duration-700">
            
            {/* Header Section */}
            <header className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center bg-neutral-900 border border-neutral-800 rounded-[3rem] p-8 md:p-12 shadow-2xl gap-10">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-4 py-1.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase rounded-full border border-indigo-500/20 tracking-widest">{selectedPage.category}</span>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                </div>
                <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight break-words">{selectedPage.name}</h2>
                <p className="text-neutral-500 mt-4 text-sm font-medium">Librería maestra activa para selección contextual por Visión IA.</p>
              </div>
              
              {/* COPY LIBRARIAN UI */}
              <div className="w-full xl:w-[450px] bg-black/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-neutral-800 flex flex-col gap-6">
                 <div className="flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                        <FileText className="h-4 w-4 text-indigo-400" />
                        <p className="text-[11px] font-black text-white uppercase tracking-widest">Master Library</p>
                    </div>
                    <span className="px-3 py-1 bg-neutral-800 text-neutral-400 text-[9px] font-black rounded-lg border border-neutral-700">{templates.length} UNITS</span>
                 </div>
                 
                 <div className="flex flex-col gap-3 max-h-[160px] overflow-y-auto pr-3 custom-scrollbar">
                    {templates.map((t, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-4 bg-neutral-900 border border-neutral-800 rounded-2xl hover:border-neutral-600 transition-all group">
                        <div className="h-2 w-2 rounded-full bg-indigo-500/40 mt-1.5 shrink-0" />
                        <p className="text-[11px] text-neutral-300 leading-relaxed truncate-3-lines flex-1">{t}</p>
                        <button onClick={() => removeTemplate(idx)} className="p-2 hover:bg-red-500 hover:text-white text-neutral-600 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    {templates.length === 0 && <p className="py-6 text-center text-xs text-neutral-600 italic">No hay plantillas de copy autorizadas.</p>}
                 </div>

                 <div className="flex gap-3">
                    <input value={newTemplate} onChange={e => setNewTemplate(e.target.value)} placeholder="Regisrar nueva plantilla..." className="flex-1 bg-neutral-900 border border-neutral-800 rounded-2xl px-5 py-4 text-xs outline-none focus:border-indigo-500 transition-all placeholder:text-neutral-700 font-medium" />
                    <button onClick={addTemplate} className="p-4 bg-indigo-500 text-white rounded-2xl hover:bg-indigo-600 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">
                      <Plus className="h-5 w-5" />
                    </button>
                 </div>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Drive Column */}
              <div className="lg:col-span-12 xl:col-span-7">
                <DriveExplorer 
                   folderId={selectedPage.driveFolderId || ""} 
                   onSelectImage={setSelectedImage} 
                   isPlanning={isPlanning}
                   onSync={() => {
                     const data = (window as any)._lastDriveData;
                     const activeTab = (window as any)._activeTab || 'posts';
                     if (data) handleBatchGenerate(activeTab === 'posts' ? data.posts : data.stories, activeTab);
                   }}
                />
              </div>

              {/* Editor/AI Column */}
              <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-8">
                
                {/* Visual Preview Card */}
                {selectedImage ? (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
                    <div className="relative group overflow-hidden bg-black">
                        {/* Blurred background for nice aspect ratio handling */}
                        <img src={`/api/drive/image/${selectedImage.id}`} className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-30 scale-110" />
                        
                        <div className="relative p-6 flex items-center justify-center min-h-[400px]">
                            <img src={`/api/drive/image/${selectedImage.id}`} alt="Selected" className="max-w-full max-h-[500px] object-contain rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/5" />
                        </div>
                    </div>
                    
                    <div className="p-8 flex flex-col gap-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                             <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Network</p>
                             <select value={platform} onChange={e => setPlatform(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-xs text-white font-black outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer">
                                <option>Facebook</option>
                                <option>Instagram</option>
                             </select>
                        </div>
                        <div className="space-y-2">
                             <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Ratio / Type</p>
                             <select value={format} onChange={e => setFormat(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-xs text-white font-black outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer">
                                <option>Post (1:1)</option>
                                <option>Post (4:3)</option>
                                <option>Story (9:16)</option>
                             </select>
                        </div>
                      </div>
                      
                      <button onClick={handleGenerate} disabled={isGenerating}
                        className="w-full bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] disabled:opacity-30 py-5 rounded-[1.5rem] font-black text-white flex items-center justify-center gap-4 transition-all shadow-[0_15px_40px_rgba(99,102,241,0.3)]">
                        {isGenerating ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6" />}
                        <span className="uppercase tracking-widest text-[11px]">{isGenerating ? "Analyzing Content..." : "Autoselect Best Caption"}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-neutral-900 border-2 border-dashed border-neutral-800 rounded-[3rem] p-24 flex flex-col items-center justify-center text-center gap-6 group hover:border-neutral-700 transition-all">
                    <div className="p-6 bg-neutral-800/50 rounded-[2rem] border border-neutral-700 group-hover:scale-110 transition-transform">
                        <ImageIcon className="h-12 w-12 text-neutral-500" />
                    </div>
                    <div>
                        <p className="text-lg font-black text-white">No Visual Selected</p>
                        <p className="text-xs text-neutral-600 font-medium mt-2 leading-relaxed">Pick an asset from the explorer<br/>to begin the automation process.</p>
                    </div>
                  </div>
                )}

                {/* Output Card */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-10 shadow-2xl flex flex-col gap-6 min-h-[400px]">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                        <FileText className="h-4 w-4 text-emerald-400" />
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Final Post Payload</label>
                    </div>
                    {output && <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500 text-black text-[9px] font-black rounded-lg uppercase tracking-tighter">Verified Content</div>}
                  </div>
                  
                  <textarea value={output} onChange={e => setOutput(e.target.value)} 
                    placeholder="The AI curator will automatically extract and present the most relevant template from your master library here..." 
                    className="w-full flex-1 bg-neutral-950/30 border border-neutral-800/50 rounded-2xl p-6 text-[13px] leading-relaxed text-neutral-200 outline-none resize-none focus:border-indigo-500/30 transition-all custom-scrollbar font-medium" />
                  
                  {output && (
                    <div className="pt-6 border-t border-neutral-800 flex flex-col gap-4">
                      <button onClick={handlePublish} disabled={isPublishing} 
                        className="w-full bg-blue-500 hover:bg-blue-600 active:scale-[0.98] disabled:opacity-50 py-5 rounded-[1.5rem] font-black text-white flex items-center justify-center gap-4 shadow-[0_15px_40px_rgba(59,130,246,0.3)] transition-all">
                        {isPublishing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
                        <span className="uppercase tracking-widest text-[11px]">{isPublishing ? "Propagating..." : "Deploy to Digital Wall"}</span>
                      </button>
                      {publishStatus && (
                        <div className={`p-5 rounded-2xl text-[10px] font-black text-center uppercase tracking-[0.2em] animate-in fade-in zoom-in-95 border ${publishStatus.startsWith('Error') ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                          {publishStatus}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* MASTER PLANNER TABLE */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-[3.5rem] p-8 sm:p-12 shadow-2xl mb-10 overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div className="flex items-center gap-5">
                   <div className="p-4 bg-emerald-500/10 rounded-[1.5rem] border border-emerald-500/20">
                    <LayoutGrid className="h-8 w-8 text-emerald-400" />
                   </div>
                   <div>
                        <h3 className="text-3xl font-black text-white uppercase tracking-tight">Timeline Planner</h3>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.2em] mt-1">Scheduled Automation Queue</p>
                   </div>
                </div>
                <div className="flex gap-4 items-center w-full md:w-auto">
                  <div className="bg-black/40 px-6 py-4 rounded-2xl border border-neutral-800 flex-1 md:flex-none">
                    <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mr-3">Queue Size</span>
                    <span className="text-white font-black text-sm">{drafts.length}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                 {drafts.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(d => (
                    <div key={d.id} className="flex flex-col lg:flex-row gap-8 p-8 bg-neutral-950 border border-neutral-800 hover:border-indigo-500/40 rounded-[2.5rem] transition-all group relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-6">
                           <span className={`px-4 py-1.5 text-[9px] font-black rounded-lg uppercase tracking-widest border ${d.type === 'posts' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-pink-500/10 text-pink-400 border-pink-500/20'}`}>
                                {d.type === 'posts' ? 'Feed Post' : 'Story Content'}
                           </span>
                       </div>
                       
                       <img src={`/api/drive/image/${d.id}`} className="w-full lg:w-40 h-40 rounded-[2rem] object-cover border border-neutral-800 shadow-2xl group-hover:scale-105 transition-transform" alt="Thumbnail" />
                       
                       <div className="flex-1 flex flex-col gap-6 pt-2">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                             <div>
                                <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Automation Draft</p>
                                <p className="text-xs text-neutral-400 font-bold">{d.name}</p>
                             </div>
                             <input type="date" defaultValue={d.date} onChange={(e) => {
                               const updated = drafts.map(item => item.id === d.id ? { ...item, date: e.target.value } : item);
                               setDrafts(updated);
                               fetch("/api/pages/drafts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pageId: selectedPage.id, drafts: updated }) });
                             }} className="bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-3 text-[10px] font-black text-white outline-none focus:border-indigo-500 transition-all shadow-inner" />
                          </div>
                          
                          <textarea className="w-full bg-neutral-900/40 border border-neutral-800/50 rounded-2xl p-5 text-[13px] leading-relaxed text-neutral-400 focus:text-white outline-none resize-none custom-scrollbar font-medium" rows={3} defaultValue={d.copy} 
                            onBlur={(e) => {
                              const updated = drafts.map(item => item.id === d.id ? { ...item, copy: e.target.value } : item);
                              setDrafts(updated);
                              fetch("/api/pages/drafts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pageId: selectedPage.id, drafts: updated }) });
                            }}
                          />
                       </div>
                       
                       <div className="flex lg:flex-col justify-end lg:justify-between items-center gap-4 lg:py-4">
                          <button onClick={() => { setOutput(d.copy); setSelectedImage({ id: d.id, name: d.name, mimeType: 'image/jpeg' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex-1 lg:flex-none p-5 bg-indigo-500 text-white rounded-[1.5rem] hover:bg-indigo-600 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all w-full flex justify-center">
                             <Send className="h-5 w-5" />
                          </button>
                       </div>
                    </div>
                 ))}
                 {drafts.length === 0 && (
                    <div className="py-32 text-center text-neutral-700 italic border-2 border-dashed border-neutral-800 rounded-[3rem] flex flex-col items-center gap-6 opacity-30">
                       <Sparkles className="h-16 w-16" />
                       <p className="text-sm font-black uppercase tracking-[0.4em]">Chronology Empty<br/>Sync drive to populate queue</p>
                    </div>
                 )}
              </div>
            </div>
          </div>
        ) : (
          <div className="min-h-[80vh] flex flex-col items-center justify-center gap-8 animate-pulse text-neutral-800">
            <Loader2 className="h-16 w-16 animate-spin" />
            <p className="font-black uppercase tracking-[0.5em] text-sm italic">Initializing Neural Connection...</p>
          </div>
        )}
      </main>
    </div>
  );
}
