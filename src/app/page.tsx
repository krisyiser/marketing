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
  Calendar,
  Clock,
  Rocket,
  ArrowRight,
  Save,
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

interface CampaignItem {
  id: string;
  fileId: string;
  fileName: string;
  copy: string;
  platform: string;
  date: string;
  time: string;
  status: 'pending' | 'published' | 'error';
}

// --- Components ---

function DriveExplorer({ folderId, onSync, isPlanning }: { folderId: string; onSync: (files: DriveFile[]) => void; isPlanning: boolean }) {
  const [driveData, setDriveData] = useState<any>(null);
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFolder(folderId);
  }, [folderId, loadFolder]);

  const handleSyncClick = () => {
    if (!driveData?.posts) return;
    onSync(driveData.posts);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-8 shadow-2xl flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
            <HardDrive className="text-blue-400 h-6 w-6" />
          </div>
          <div>
            <h3 className="font-black text-white text-xl tracking-tight uppercase tracking-[0.05em]">Repositorio de Medios</h3>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">Imágenes detectadas en Google Drive</p>
          </div>
        </div>
        
        <button onClick={handleSyncClick} disabled={isPlanning || isLoading || !driveData?.posts} className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white text-[11px] font-black uppercase rounded-[1.5rem] shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-30 tracking-widest">
            {isPlanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
            {isPlanning ? 'Armando Campaña...' : 'Generar Campaña del Mes'}
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4 animate-pulse">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-[10px] text-neutral-600 font-black uppercase tracking-widest">Escaneando contenido...</p>
        </div>
      ) : driveData?.posts ? (
        <div className="flex items-center gap-4 p-5 bg-neutral-950 rounded-2xl border border-neutral-800">
           <div className="p-3 bg-emerald-500/10 rounded-xl">
             <LayoutGrid className="h-5 w-5 text-emerald-400" />
           </div>
           <div>
             <p className="text-white text-sm font-black">{driveData.posts.length} Posteos Disponibles</p>
             <p className="text-[9px] text-neutral-500 uppercase font-black">Listos para ser calendarizados automáticamente</p>
           </div>
        </div>
      ) : (
        <div className="py-10 text-center text-neutral-600 text-xs italic">Carga una carpeta para empezar.</div>
      )}
    </div>
  );
}

export default function Home() {
  const [pages, setPages] = useState<PageConfig[]>([]);
  const [selectedPage, setSelectedPage] = useState<PageConfig | null>(null);
  const [campaign, setCampaign] = useState<CampaignItem[]>([]);
  const [isPlanning, setIsPlanning] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPublishingCampaign, setIsPublishingCampaign] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);

  const [templates, setTemplates] = useState<string[]>([]);
  const [newTemplate, setNewTemplate] = useState("");

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

  // Load existing campaign drafts
  useEffect(() => {
    if (selectedPage) {
      setTemplates(selectedPage.templates || []);
      fetch(`/api/pages/drafts?pageId=${selectedPage.id}`)
        .then(res => res.json())
        .then(data => {
            const drafts = data.drafts || [];
            // Map legacy drafts to new CampaignItem format if needed
            setCampaign(drafts.map((d: any) => ({
                id: d.id + '-' + Math.random(),
                fileId: d.id,
                fileName: d.name || 'Post',
                copy: d.copy,
                platform: 'Facebook',
                date: d.date || new Date().toISOString().split('T')[0],
                time: d.time || "09:00",
                status: 'pending'
            })));
        });
    }
  }, [selectedPage]);

  const handleSyncCampaign = async (posts: DriveFile[]) => {
    if (!selectedPage || templates.length === 0) return;
    setIsPlanning(true);
    
    const today = new Date();
    const newCampaign: CampaignItem[] = posts.map((post, index) => {
        const postDate = new Date(today);
        postDate.setDate(today.getDate() + index); // One daily
        
        const templateIndex = index % templates.length;
        
        return {
            id: post.id + '-' + Date.now(),
            fileId: post.id,
            fileName: post.name,
            copy: templates[templateIndex],
            platform: 'Facebook',
            date: postDate.toISOString().split('T')[0],
            time: "09:00",
            status: 'pending'
        };
    });

    setCampaign(newCampaign);
    
    // Auto-save drafts
    await fetch("/api/pages/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
          pageId: selectedPage.id, 
          drafts: newCampaign.map(c => ({ id: c.fileId, name: c.fileName, copy: c.copy, date: c.date, time: c.time })) 
      }),
    });

    setIsPlanning(false);
  };

  const handleUpdateItem = (id: string, updates: Partial<CampaignItem>) => {
    const updated = campaign.map(item => item.id === id ? { ...item, ...updates } : item);
    setCampaign(updated);
  };

  const handleLaunchCampaign = async () => {
    if (!selectedPage || campaign.length === 0) return;
    setIsPublishingCampaign(true);
    setPublishProgress(0);

    const pending = campaign.filter(c => c.status === 'pending');
    let completed = 0;

    for (const item of pending) {
        try {
            await fetch("/api/publish", { 
                method: "POST", 
                headers: { "Content-Type": "application/json" }, 
                body: JSON.stringify({
                  pageId: selectedPage.id, 
                  platform: item.platform, 
                  message: item.copy, 
                  imageUrl: `${window.location.origin}/api/drive/image/${item.fileId}`
                })
            });
            handleUpdateItem(item.id, { status: 'published' });
        } catch (err) {
            handleUpdateItem(item.id, { status: 'error' });
        }
        completed++;
        setPublishProgress((completed / pending.length) * 100);
    }
    
    setIsPublishingCampaign(false);
  };

  const currentMonthName = new Date().toLocaleString('es-ES', { month: 'long' }).toUpperCase();

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
      <nav className={`w-full md:w-80 bg-neutral-900 border-r border-neutral-800 p-8 flex flex-col gap-10 h-screen sticky top-0 transition-all z-40 ${isSidebarOpen ? 'fixed inset-0' : 'hidden md:flex'}`}>
        <div className="hidden md:flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
            <Sparkles className="h-7 w-7 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">SociMation</h1>
        </div>
        
        <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-1">
          <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] px-4">Selección de Marca</p>
          {pages.map(p => (
            <button key={p.id} onClick={() => { setSelectedPage(p); setIsSidebarOpen(false); }} 
              className={`flex items-center gap-4 p-5 rounded-3xl transition-all text-sm font-black group ${selectedPage?.id === p.id ? 'bg-indigo-600 text-white shadow-2xl' : 'text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300'}`}>
              <div className={`p-2 rounded-xl transition-colors ${selectedPage?.id === p.id ? 'bg-white/20' : 'bg-neutral-800 group-hover:bg-neutral-700'}`}>
                <ImageIcon className="h-4 w-4" />
              </div>
              <span className="truncate">{p.name}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 p-4 sm:p-10 lg:p-12 overflow-y-auto bg-neutral-950">
        {selectedPage ? (
          <div className="max-w-7xl mx-auto flex flex-col gap-12 animate-in fade-in slide-in-from-right-10 duration-700 pb-20">
            
            {/* Header / Brand Status */}
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 bg-neutral-900 border border-neutral-800 p-10 sm:p-14 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 select-none pointer-events-none">
                    <Calendar className="h-64 w-64" />
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase rounded-full border border-emerald-500/20 tracking-widest">{currentMonthName} • CAMPANA ACTIVA</span>
                    </div>
                    <h2 className="text-5xl sm:text-7xl font-black text-white tracking-tighter mix-blend-difference">{selectedPage.name}</h2>
                    <p className="text-neutral-500 mt-6 text-lg font-medium max-w-xl">Generador de contenido sistemático. Acomodamos tu mes completo basado en tus 20 reglas de copy universales.</p>
                </div>
                
                <div className="relative z-10 w-full xl:w-auto">
                    <button onClick={handleLaunchCampaign} disabled={isPublishingCampaign || campaign.length === 0} className="w-full xl:w-80 h-24 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] flex flex-col items-center justify-center gap-1 shadow-[0_20px_50px_rgba(79,70,229,0.3)] group transition-all active:scale-95 disabled:opacity-20 overflow-hidden relative">
                        {isPublishingCampaign && (
                            <div className="absolute inset-0 bg-indigo-400 origin-left transition-all duration-300 ease-out z-0" style={{ width: `${publishProgress}%` }} />
                        )}
                        <div className="relative z-10 flex items-center gap-3 font-black uppercase text-xs tracking-widest">
                             {isPublishingCampaign ? <Loader2 className="h-5 w-5 animate-spin" /> : <Rocket className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                             {isPublishingCampaign ? 'Sincronizando...' : 'Publicar Campaña Mes'}
                        </div>
                        <span className="relative z-10 text-[9px] font-bold text-indigo-200 uppercase tracking-[0.2em]">{campaign.length} Posteos Programados</span>
                    </button>
                </div>
            </header>

            {/* Step 1: Media Sync */}
            <DriveExplorer 
                folderId={selectedPage.driveFolderId || ""} 
                isPlanning={isPlanning}
                onSync={handleSyncCampaign}
            />

            {/* Step 2: Full Month Queue */}
            <div className="flex flex-col gap-8">
               <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight">Cronograma de Posteos</h3>
                    <p className="text-[10px] text-neutral-500 font-black uppercase tracking-[0.3em] mt-2 italic">Basado en rotación de copys 1 a 20</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="px-5 py-3 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-neutral-500" />
                        <span className="text-[11px] font-black text-white">{campaign.length} Días cubiertos</span>
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 gap-6">
                    {campaign.map((item, idx) => (
                        <div key={item.id} className={`group relative bg-neutral-900 border border-neutral-800 hover:border-indigo-500/50 rounded-[2.5rem] flex flex-col lg:flex-row shadow-xl transition-all overflow-hidden ${item.status === 'published' ? 'opacity-50 grayscale' : ''}`}>
                            <div className="absolute top-6 right-6 z-20">
                                {item.status === 'published' ? (
                                    <div className="bg-emerald-500 text-black px-4 py-1.5 rounded-xl flex items-center gap-2 font-black text-[10px] uppercase shadow-lg">
                                        <CheckCircle className="h-3.5 w-3.5" />
                                        Publicado
                                    </div>
                                ) : (
                                    <span className="bg-neutral-950/80 backdrop-blur-md text-neutral-500 px-4 py-1.5 rounded-xl font-black text-[10px] uppercase border border-neutral-800">Día {idx + 1}</span>
                                )}
                            </div>
                            
                            {/* Image Thumbnail */}
                            <div className="w-full lg:w-72 h-72 relative shrink-0">
                                <img src={`/api/drive/image/${item.fileId}`} alt="Post" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                                <div className="absolute bottom-6 left-6 flex flex-col gap-1">
                                    <p className="text-[9px] text-white/50 font-black uppercase tracking-widest">{item.fileName}</p>
                                    <p className="text-white font-black text-sm uppercase">Selección Visual {idx + 1}</p>
                                </div>
                            </div>
                            
                            {/* Editor Area */}
                            <div className="flex-1 p-8 sm:p-10 flex flex-col gap-6 justify-center">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2 ml-1">
                                            <Calendar className="h-3 w-3 text-indigo-400" />
                                            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Fecha de Lanzamiento</span>
                                        </div>
                                        <input type="date" value={item.date} onChange={e => handleUpdateItem(item.id, { date: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 text-xs text-white font-bold outline-none focus:border-indigo-500 transition-all cursor-pointer" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2 ml-1">
                                            <Clock className="h-3 w-3 text-indigo-400" />
                                            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Hora de Programación</span>
                                        </div>
                                        <input type="time" value={item.time} onChange={e => handleUpdateItem(item.id, { time: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 text-xs text-white font-bold outline-none focus:border-indigo-500 transition-all cursor-pointer" />
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 ml-1">
                                        <FileText className="h-3 w-3 text-emerald-400" />
                                        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Copy Asignado (Rotación #{ (idx % templates.length) + 1 })</span>
                                    </div>
                                    <textarea value={item.copy} onChange={e => handleUpdateItem(item.id, { copy: e.target.value })} rows={3} className="w-full bg-neutral-950/50 border border-neutral-800 rounded-2xl p-5 text-sm text-neutral-300 leading-relaxed outline-none focus:border-indigo-500/30 transition-all resize-none custom-scrollbar font-medium" />
                                </div>
                            </div>
                            
                            {/* Individual Action (Maybe for one-off republish) */}
                            <div className="p-8 border-t lg:border-t-0 lg:border-l border-neutral-800 flex items-center justify-center bg-black/20">
                                <button onClick={() => { handleLaunchCampaign(); /* Should implement single launch if needed */ }} className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-500 hover:text-white hover:bg-neutral-800 transition-all group-hover:scale-110">
                                    <ArrowRight className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {campaign.length === 0 && (
                        <div className="py-40 text-center flex flex-col items-center gap-8 opacity-20 border-2 border-dashed border-neutral-800 rounded-[4rem]">
                            <Sparkles className="h-20 w-20" />
                            <div className="max-w-md">
                                <p className="text-2xl font-black text-white uppercase tracking-widest">Campaña Vacía</p>
                                <p className="text-sm font-medium mt-2 leading-relaxed">Sincroniza tu Google Drive para que el sistema acomode automáticamente tu mes de contenidos basado en tu librería de copys.</p>
                            </div>
                        </div>
                    )}
               </div>
            </div>

            {/* Manage Copys (Simplified & Moved Down) */}
            <section className="bg-neutral-900 border border-neutral-800 rounded-[3rem] p-10 sm:p-14 shadow-2xl flex flex-col gap-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h4 className="text-3xl font-black text-white uppercase tracking-tight">Gestor de Copys Maestros</h4>
                        <p className="text-[10px] text-neutral-500 font-black uppercase tracking-[0.2em] mt-2">Estos son los textos que se rotarán automáticamente en tu calendario</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((t, idx) => (
                        <div key={idx} className="group p-6 bg-neutral-950 border border-neutral-800 rounded-3xl hover:border-indigo-500/50 transition-all relative">
                            <span className="absolute top-4 right-4 text-[9px] font-black text-neutral-800">#{idx + 1}</span>
                            <p className="text-[11px] text-neutral-400 leading-relaxed font-medium line-clamp-4">{t}</p>
                            <button onClick={() => {
                                const updated = templates.filter((_, i) => i !== idx);
                                setTemplates(updated);
                                // Persist
                                fetch("/api/pages/update-config", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ pageId: selectedPage.id, templates: updated }),
                                });
                            }} className="absolute inset-0 bg-red-600 text-white font-black uppercase text-[10px] tracking-widest flex items-center justify-center rounded-3xl opacity-0 group-hover:opacity-100 transition-all">
                                <Trash2 className="h-4 w-4 mr-2" /> Eliminar Plantilla
                            </button>
                        </div>
                    ))}
                    <button onClick={() => {
                         const promptVal = prompt("Nuevo Copy Maestro:");
                         if (promptVal) {
                            const updated = [...templates, promptVal];
                            setTemplates(updated);
                            fetch("/api/pages/update-config", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ pageId: selectedPage.id, templates: updated }),
                            });
                         }
                    }} className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed border-neutral-800 rounded-3xl text-neutral-600 hover:text-indigo-400 hover:border-indigo-500/50 transition-all">
                        <Plus className="h-10 w-10" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Añadir Copy Universal</span>
                    </button>
                </div>
            </section>
          </div>
        ) : (
          <div className="min-h-[80vh] flex flex-col items-center justify-center gap-8 animate-pulse text-neutral-800">
            <Loader2 className="h-16 w-16 animate-spin" />
            <p className="font-black uppercase tracking-[0.5em] text-sm italic">Sincronizando Módulos de Campaña...</p>
          </div>
        )}
      </main>
    </div>
  );
}
