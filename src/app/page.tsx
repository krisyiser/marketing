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
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
      {files.map(img => (
        <button key={img.id} onClick={() => onSelectImage(img)} 
          className="flex flex-col items-center gap-2 p-2 bg-neutral-950/40 rounded-xl border border-neutral-800 hover:border-indigo-500 hover:bg-indigo-500/5 transition-all group relative">
          <div className="w-full aspect-square rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800">
            <img src={getImageUrl(img.id)} alt={img.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          </div>
          <span className="text-[10px] text-neutral-500 truncate w-full px-1">{img.name}</span>
        </button>
      ))}
      {files.length === 0 && <div className="col-span-full py-20 text-center text-neutral-600 italic text-sm">No hay imágenes en esta sección.</div>}
    </div>
  );

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-2xl">
            <HardDrive className="text-blue-400 h-5 w-5" />
          </div>
          <h3 className="font-bold text-white text-lg">Contenido en Drive</h3>
        </div>
        <div className="flex gap-2">
            <button onClick={onSync} disabled={isPlanning || isLoading} className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase rounded-xl border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all">
                {isPlanning ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                {isPlanning ? 'Analizando Todo...' : 'Sincronizar Mes'}
            </button>
            <button onClick={() => loadFolder(folderId)} className="p-2 hover:bg-neutral-800 rounded-xl transition-colors">
              <RefreshCw className={`h-4 w-4 text-neutral-500 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
            </button>
        </div>
      </div>

      <div className="flex p-1 bg-neutral-950 rounded-2xl gap-1">
        <button onClick={() => { setActiveTab('posts'); (window as any)._activeTab = 'posts'; }} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'posts' ? 'bg-neutral-800 text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-300'}`}>
          <LayoutGrid className="h-3.5 w-3.5" />
          Posts (1:1 / 4:3)
        </button>
        <button onClick={() => { setActiveTab('stories'); (window as any)._activeTab = 'stories'; }} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'stories' ? 'bg-neutral-800 text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-300'}`}>
          <History className="h-3.5 w-3.5" />
          Historias
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-xs text-neutral-500 font-medium">Escaneando carpetas de marketing...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs flex items-center gap-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : (
        driveData && renderGrid((activeTab === 'posts' ? driveData.posts : activeTab === 'stories' ? driveData.stories : driveData.genericImages) || [])
      )}
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
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans flex selection:bg-indigo-500/30">
      {/* Sidebar */}
      <nav className="w-72 bg-neutral-900/50 backdrop-blur-xl border-r border-neutral-800 p-8 flex flex-col gap-10 h-screen sticky top-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 rounded-2xl">
            <Sparkles className="h-6 w-6 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tighter">SociMation</h1>
        </div>
        
        <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar">
          <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] px-3 mb-2">Brands</p>
          {pages.map(p => (
            <button key={p.id} onClick={() => handleSelectPage(p)} 
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all text-sm font-bold group ${selectedPage?.id === p.id ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'text-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-300'}`}>
              <div className={`p-2 rounded-xl transition-colors ${selectedPage?.id === p.id ? 'bg-indigo-500/20' : 'bg-neutral-800 group-hover:bg-neutral-700'}`}>
                <ImageIcon className="h-4 w-4" />
              </div>
              <span className="truncate">{p.name}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 p-10 overflow-y-auto">
        {selectedPage ? (
          <div className="max-w-6xl mx-auto flex flex-col gap-10 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-neutral-900/40 p-8 md:p-10 rounded-[3rem] border border-neutral-800 shadow-2xl gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase rounded-full border border-indigo-500/20">{selectedPage.category}</span>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase rounded-full border border-emerald-500/20">Active</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">{selectedPage.name}</h2>
              </div>
              
              {/* COPY LIBRARIAN UI */}
              <div className="flex-1 w-full bg-neutral-950/50 p-6 rounded-3xl border border-neutral-800/50 flex flex-col gap-4">
                 <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Librería de Copys Maestros</p>
                    <span className="text-[10px] text-neutral-600 font-bold">{templates.length} Plantillas</span>
                 </div>
                 
                 <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {templates.map((t, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-neutral-900/50 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-colors group">
                        <p className="text-[10px] text-neutral-400 truncate flex-1 leading-relaxed">{t}</p>
                        <button onClick={() => removeTemplate(idx)} className="p-1.5 hover:bg-red-500/10 hover:text-red-500 text-neutral-600 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {templates.length === 0 && <p className="py-4 text-center text-[10px] text-neutral-600 italic">No hay plantillas guardadas aún.</p>}
                 </div>

                 <div className="flex gap-2">
                    <input value={newTemplate} onChange={e => setNewTemplate(e.target.value)} placeholder="Añadir nuevo copy universal..." className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-[10px] outline-none focus:border-indigo-500 transition-all" />
                    <button onClick={addTemplate} className="p-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all">
                      <Plus className="h-4 w-4" />
                    </button>
                 </div>
              </div>
            </header>

            <div className="grid lg:grid-cols-5 gap-10">
              <div className="lg:col-span-3">
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

              <div className="lg:col-span-2 flex flex-col gap-6">
                {selectedImage ? (
                  <div className="bg-indigo-500/10 border-2 border-indigo-500/30 rounded-3xl p-6 flex flex-col gap-6 animate-in zoom-in duration-300">
                    <img src={`/api/drive/image/${selectedImage.id}`} alt="Selected" className="w-full aspect-video object-cover rounded-2xl shadow-2xl border border-indigo-500/20" />
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-2">
                        <select value={platform} onChange={e => setPlatform(e.target.value)} className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs flex-1 text-white font-bold outline-none">
                          <option>Facebook</option>
                          <option>Instagram</option>
                        </select>
                        <select value={format} onChange={e => setFormat(e.target.value)} className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs flex-1 text-white font-bold outline-none">
                          <option>Post (1:1)</option>
                          <option>Post (4:3)</option>
                          <option>Story</option>
                        </select>
                      </div>
                      <button onClick={handleGenerate} disabled={isGenerating}
                        className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 py-4 rounded-2xl font-black text-white flex items-center justify-center gap-3 transition-all shadow-[0_15px_30px_rgba(99,102,241,0.2)]">
                        {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                        {isGenerating ? "Analizando para seleccionar..." : "Seleccionar el mejor copy"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-neutral-900/50 border-2 border-dashed border-neutral-800 rounded-3xl p-10 flex flex-col items-center justify-center text-center gap-4 text-neutral-600">
                    <ImageIcon className="h-10 w-10 opacity-20" />
                    <p className="text-sm font-medium">Selecciona una imagen de Drive<br/>para empezar la magia.</p>
                  </div>
                )}

                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl flex flex-col gap-4 min-h-[300px]">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Copi Maestro Seleccionado</label>
                    {output && <span className="text-[10px] text-emerald-500 font-black">Validado por IA</span>}
                  </div>
                  <textarea value={output} onChange={e => setOutput(e.target.value)} 
                    placeholder="La IA seleccionará el mejor texto de tu librería basándose en el contenido de la imagen..." 
                    className="w-full flex-1 bg-transparent text-sm leading-relaxed text-neutral-300 outline-none resize-none custom-scrollbar" />
                  
                  {output && (
                    <div className="pt-6 border-t border-neutral-800 flex flex-col gap-3">
                      <button onClick={handlePublish} disabled={isPublishing} 
                        className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 py-4 rounded-2xl font-black text-white flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(59,130,246,0.2)] transition-all">
                        {isPublishing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                        {isPublishing ? "Publicando..." : "Lanzar Publicación"}
                      </button>
                      {publishStatus && (
                        <div className={`p-4 rounded-2xl text-[10px] font-black text-center uppercase tracking-widest animate-in fade-in zoom-in ${publishStatus.startsWith('Error') ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                          {publishStatus}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* MASTER PLANNER TABLE */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-[3rem] p-10 shadow-2xl animate-in slide-in-from-bottom duration-700">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-emerald-500/10 rounded-2xl">
                    <LayoutGrid className="h-6 w-6 text-emerald-400" />
                   </div>
                   <h3 className="text-2xl font-black text-white uppercase tracking-tight">Planificador Maestro</h3>
                </div>
                <div className="flex gap-4 items-center">
                  <span className="text-xs text-neutral-500">Borradores generados: {drafts.length}</span>
                  <button className="bg-neutral-800 px-6 py-3 rounded-2xl text-[10px] font-black uppercase text-neutral-300 hover:text-white transition-all">Exportar PDF</button>
                </div>
              </div>

              <div className="space-y-4">
                 {drafts.map(d => (
                    <div key={d.id} className="flex gap-6 p-6 bg-neutral-950 rounded-3xl border border-neutral-800 hover:border-indigo-500/50 transition-all group">
                       <img src={`/api/drive/image/${d.id}`} className="w-24 h-24 rounded-2xl object-cover border border-neutral-800 shadow-lg" alt="Thumbnail" />
                       <div className="flex-1 flex flex-col justify-between pt-2">
                          <div className="flex justify-between items-center mb-2">
                             <p className="text-[10px] font-black text-neutral-600 uppercase">Sugerencia de post</p>
                             <input type="date" defaultValue={d.date} onChange={(e) => {
                               const updated = drafts.map(item => item.id === d.id ? { ...item, date: e.target.value } : item);
                               setDrafts(updated);
                               fetch("/api/pages/drafts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pageId: selectedPage.id, drafts: updated }) });
                             }} className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1 text-[10px] font-bold text-white outline-none focus:border-indigo-500" />
                          </div>
                          <textarea className="w-full bg-transparent text-sm text-neutral-300 focus:text-white outline-none resize-none custom-scrollbar" rows={3} defaultValue={d.copy} 
                            onBlur={(e) => {
                              const updated = drafts.map(item => item.id === d.id ? { ...item, copy: e.target.value } : item);
                              setDrafts(updated);
                              fetch("/api/pages/drafts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pageId: selectedPage.id, drafts: updated }) });
                            }}
                          />
                       </div>
                       <div className="w-48 flex flex-col justify-between items-end pb-2">
                          <span className={`px-3 py-1 text-[10px] font-black rounded-lg ${d.type === 'posts' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-pink-500/10 text-pink-400'}`}>
                             {d.type === 'posts' ? 'Post (1:1 / 4:3)' : 'Historias'}
                          </span>
                          <button onClick={() => { setOutput(d.copy); setSelectedImage({ id: d.id, name: d.name, mimeType: 'image/jpeg' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-3 bg-neutral-900 rounded-xl text-neutral-500 hover:text-white transition-all shadow-md">
                             <Send className="h-4 w-4" />
                          </button>
                       </div>
                    </div>
                 ))}
                 {drafts.length === 0 && (
                    <div className="py-24 text-center text-neutral-700 italic border-2 border-dashed border-neutral-800 rounded-[3rem] flex flex-col items-center gap-4">
                       <Sparkles className="h-10 w-10 opacity-10" />
                       <p className="text-sm font-bold uppercase tracking-widest opacity-40">No hay borradores programados aún.<br/>Sincroniza la carpeta para empezar.</p>
                    </div>
                 )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center py-20 animate-pulse">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          </div>
        )}
      </main>
    </div>
  );
}
