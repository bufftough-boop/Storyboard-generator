import React, { useState, useEffect, useCallback } from 'react';

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
}

export interface Shot {
    id: string;
    number: number;
    duration: number; // in seconds
    title: string; // The prompt/description
    cameraAngle?: string;
    imageUrl?: string;
    lastGeneratedPrompt?: string;
    isGenerating?: boolean;
}

export interface Storyboard {
    id: string;
    name: string;
    shots: Shot[];
}

export interface Project {
    id: string;
    name: string;
    storyboards: Storyboard[];
    activeStoryboardId: string;
    aspectRatio: '16:9' | '9:16' | '4:3' | '3:4' | '1:1';
}

// ==========================================
// 2. MOCK AI SERVICE
// ==========================================

const generateShotSketch = async (prompt: string, aspectRatio: string): Promise<string> => {
    // Simulating an API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Returns a random architecture/sketch image from Unsplash
    // In a real app, this is where you'd call Gemini/OpenAI
    return `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop&t=${Date.now()}`;
};

// ==========================================
// 3. SUB-COMPONENTS
// ==========================================

// --- Confirm Dialog ---
const ConfirmDialog: React.FC<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}> = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">Delete</button>
                </div>
            </div>
        </div>
    );
};

// --- Animatic Player ---
const AnimaticPlayer: React.FC<{
    shots: Shot[];
    aspectRatio: string;
    onClose: () => void;
}> = ({ shots, aspectRatio, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    useEffect(() => {
        if (!isPlaying) return;
        const shotDuration = (shots[currentIndex]?.duration || 2) * 1000;
        const timer = setTimeout(() => {
            if (currentIndex < shots.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                setIsPlaying(false);
            }
        }, shotDuration);
        return () => clearTimeout(timer);
    }, [currentIndex, isPlaying, shots]);

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
            <div className="relative w-full max-w-5xl px-8" style={{ aspectRatio: aspectRatio.replace(':', '/') }}>
                {shots[currentIndex]?.imageUrl ? (
                    <img src={shots[currentIndex].imageUrl} className="w-full h-full object-contain" alt="Animatic" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
                        <p className="text-2xl">{shots[currentIndex]?.title || 'No Image'}</p>
                    </div>
                )}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 text-white">
                    <button onClick={() => setCurrentIndex(0)} className="hover:text-blue-400"><span className="material-symbols-outlined">skip_previous</span></button>
                    <button onClick={() => setIsPlaying(!isPlaying)}><span className="material-symbols-outlined text-4xl">{isPlaying ? 'pause_circle' : 'play_circle'}</span></button>
                    <button onClick={onClose} className="hover:text-red-500"><span className="material-symbols-outlined">close</span></button>
                </div>
            </div>
            <div className="mt-4 text-white font-mono text-sm">Shot {currentIndex + 1} / {shots.length} • {shots[currentIndex]?.duration}s</div>
        </div>
    );
};

// --- Shot Card ---
const ShotCard: React.FC<{
    shot: Shot;
    aspectRatio: string;
    onClick: () => void;
    onDelete: () => void;
    onRegenerate: () => void;
}> = ({ shot, aspectRatio, onClick, onDelete, onRegenerate }) => {
    const ratioStyle = { aspectRatio: aspectRatio.replace(':', '/') };
    return (
        <div onClick={onClick} className="group relative bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all cursor-pointer overflow-hidden">
            <div className="w-full bg-slate-100 dark:bg-slate-900 relative" style={ratioStyle}>
                {shot.imageUrl ? (
                    <img src={shot.imageUrl} alt={shot.title} className="w-full h-full object-cover grayscale contrast-125" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                        {shot.isGenerating ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">image</span>}
                    </div>
                )}
                <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded backdrop-blur-sm">{shot.duration}s</div>
            </div>
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">Shot {shot.number}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); onRegenerate(); }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500" title="Regenerate Image"><span className="material-symbols-outlined text-sm">refresh</span></button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded text-red-500" title="Delete Shot"><span className="material-symbols-outlined text-sm">delete</span></button>
                    </div>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">{shot.title || <span className="italic text-slate-400">No description...</span>}</p>
                {shot.cameraAngle && <span className="inline-block mt-2 text-[10px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded">{shot.cameraAngle}</span>}
            </div>
        </div>
    );
};

// --- Shot Editor Sidebar ---
const ShotEditor: React.FC<{
    shot: Shot;
    index: number;
    isSelected: boolean;
    onUpdate: (id: string, updates: Partial<Shot>) => void;
    onDelete: (id: string) => void;
    onClick: () => void;
    onRegenerate: (id: string) => void;
    onDragStart: (index: number) => void;
    onDrop: (index: number) => void;
}> = ({ shot, index, isSelected, onUpdate, onDelete, onClick, onRegenerate, onDragStart, onDrop }) => {
    return (
        <div 
            draggable
            onDragStart={() => onDragStart(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(index)}
            onClick={onClick}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${isSelected ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-500 ring-1 ring-blue-500' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300'}`}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-300 cursor-move text-sm">drag_indicator</span>
                    <span className="font-bold text-xs text-slate-500">#{shot.number}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onDelete(shot.id); }} className="text-slate-400 hover:text-red-500"><span className="material-symbols-outlined text-sm">close</span></button>
            </div>
            <textarea 
                className="w-full text-sm bg-transparent border-0 p-0 focus:ring-0 text-slate-700 dark:text-slate-300 resize-none mb-3"
                rows={3}
                placeholder="Describe the shot..."
                value={shot.title}
                onChange={(e) => onUpdate(shot.id, { title: e.target.value })}
            />
            <div className="flex gap-2">
                <select 
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs py-1 px-2"
                    value={shot.cameraAngle}
                    onChange={(e) => onUpdate(shot.id, { cameraAngle: e.target.value })}
                >
                    <option value="Wide Shot">Wide Shot</option>
                    <option value="Medium Shot">Medium Shot</option>
                    <option value="Close Up">Close Up</option>
                    <option value="Extreme Close Up">Extreme Close Up</option>
                </select>
                <input 
                    type="number" 
                    step="0.5"
                    className="w-16 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs py-1 px-2"
                    value={shot.duration}
                    onChange={(e) => onUpdate(shot.id, { duration: parseFloat(e.target.value) })}
                />
                <button 
                    onClick={(e) => { e.stopPropagation(); onRegenerate(shot.id); }}
                    className={`p-1 rounded border border-slate-200 dark:border-slate-700 ${shot.isGenerating ? 'animate-pulse bg-blue-100' : 'hover:bg-slate-100'}`}
                >
                     <span className="material-symbols-outlined text-sm">auto_awesome</span>
                </button>
            </div>
        </div>
    );
};

// ==========================================
// 4. MAIN APP COMPONENT
// ==========================================

// --- Default Data ---
const DEFAULT_SHOTS: Shot[] = [
    {
        id: '1',
        number: 1,
        duration: 3.5,
        title: 'Wide establishing shot of a dense, misty forest at midnight.',
        cameraAngle: 'Wide Shot',
        imageUrl: '', 
        lastGeneratedPrompt: ''
    },
    {
        id: '2',
        number: 2,
        duration: 2.0,
        title: 'Extreme close-up of a young woman’s eye. Her pupil dilates.',
        cameraAngle: 'Extreme Close Up',
        imageUrl: '',
        lastGeneratedPrompt: ''
    },
    {
        id: '3',
        number: 3,
        duration: 4.5,
        title: 'Medium shot from behind the woman as she stands before an old archway.',
        cameraAngle: 'Medium Shot',
        imageUrl: '',
        lastGeneratedPrompt: ''
    }
];

const DEFAULT_STORYBOARDS: Storyboard[] = [
    { id: 'sb-1', name: 'The Encounter', shots: DEFAULT_SHOTS }
];

const DEFAULT_PROJECTS: Project[] = [
    { id: 'p-1', name: 'The Midnight Discovery', storyboards: DEFAULT_STORYBOARDS, activeStoryboardId: 'sb-1', aspectRatio: '16:9' }
];

const STORAGE_KEY = 'sb_projects_v13';
const USER_STORAGE_KEY = 'sb_user';

export default function App() {
    // Inject Material Symbols stylesheet dynamically
    useEffect(() => {
        if (!document.getElementById('material-symbols')) {
            const link = document.createElement('link');
            link.id = 'material-symbols';
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';
            document.head.appendChild(link);
        }
    }, []);

    const [user, setUser] = useState<User | null>(null);
    
    // Initialize projects from localStorage if available
    const [projects, setProjects] = useState<Project[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        try {
            return saved ? JSON.parse(saved) : DEFAULT_PROJECTS;
        } catch (e) {
            console.error('Failed to load projects from storage', e);
            return DEFAULT_PROJECTS;
        }
    });

    const [activeProjectId, setActiveProjectId] = useState<string>('p-1');
    const [isPlayerOpen, setIsPlayerOpen] = useState(false);
    const [selectedShotId, setSelectedShotId] = useState<string | null>('1');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [storageError, setStorageError] = useState<string | null>(null);
    const [draggedShotIndex, setDraggedShotIndex] = useState<number | null>(null);
    const [hasInitialGenerated, setHasInitialGenerated] = useState(false);
    
    // Delete Confirmation State
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        type: 'project' | 'storyboard' | null;
        id: string | null;
        name: string;
    }>({ isOpen: false, type: null, id: null, name: '' });

    // Cleanup old versions and Persist login state
    useEffect(() => {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('sb_projects_v') && key !== STORAGE_KEY) {
                    localStorage.removeItem(key);
                }
            });
        } catch (e) {
            console.warn('Could not cleanup old storage versions', e);
        }

        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        if (storedUser) setUser(JSON.parse(storedUser));
        
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setIsDarkMode(true);
        }
    }, []);

    // Apply Dark Mode
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    // Auto-save logic
    useEffect(() => {
        const saveTimeout = setTimeout(() => {
            try {
                const serialized = JSON.stringify(projects);
                localStorage.setItem(STORAGE_KEY, serialized);
                setLastSaved(new Date());
                setStorageError(null);
            } catch (e: any) {
                console.error('Failed to save to localStorage:', e);
                if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                    setStorageError('Browser storage is full. Try deleting old shots.');
                } else {
                    setStorageError('Could not save your changes.');
                }
            }
        }, 1500);

        return () => clearTimeout(saveTimeout);
    }, [projects]);

    // Derived State
    const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
    const activeStoryboard = activeProject.storyboards.find(sb => sb.id === activeProject.activeStoryboardId) || activeProject.storyboards[0];
    const shots = activeStoryboard.shots;

    const updateProjects = (newProjects: Project[]) => {
        setProjects(newProjects);
    };

    const updateShot = (shotId: string, updates: Partial<Shot>) => {
        setProjects(prevProjects => {
            return prevProjects.map(p => {
                if (p.id === activeProjectId) {
                    return {
                        ...p,
                        storyboards: p.storyboards.map(sb => {
                            if (sb.id === p.activeStoryboardId) {
                                return {
                                    ...sb,
                                    shots: sb.shots.map(s => s.id === shotId ? { ...s, ...updates } : s)
                                };
                            }
                            return sb;
                        })
                    };
                }
                return p;
            });
        });
    };

    const forceRegenerate = useCallback(async (shotId: string) => {
        const currentShots = activeProject.storyboards.find(sb => sb.id === activeProject.activeStoryboardId)?.shots || [];
        const shot = currentShots.find(s => s.id === shotId);
        if (!shot) return;
        
        const promptText = shot.title.trim();
        if (!promptText) return;
        
        const cameraInstruction = shot.cameraAngle ? `Camera Angle: ${shot.cameraAngle}. ` : '';
        const finalPrompt = `${cameraInstruction}${promptText}`;

        updateShot(shotId, { isGenerating: true, imageUrl: undefined });
        const generatedImage = await generateShotSketch(finalPrompt, activeProject.aspectRatio);
        updateShot(shotId, { 
            isGenerating: false, 
            imageUrl: generatedImage || undefined,
            lastGeneratedPrompt: promptText
        });
    }, [activeProject, activeProjectId]); // Added dependencies for useCallback

    // Initial generation effect
    useEffect(() => {
        if (user && !hasInitialGenerated && shots.length > 0) {
            setHasInitialGenerated(true);
            shots.forEach(shot => {
                if (!shot.imageUrl && !shot.isGenerating && shot.title) {
                    forceRegenerate(shot.id);
                }
            });
        }
    }, [user, hasInitialGenerated, shots, forceRegenerate]);

    // Handlers
    const handleLogin = () => {
        const mockUser: User = {
            id: 'u-123',
            name: 'Demo User',
            email: 'user@example.com',
            avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=2b7cee&color=fff'
        };
        setUser(mockUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem(USER_STORAGE_KEY);
    };

    const handleNewProject = () => {
        const newProject: Project = {
            id: `p-${Date.now()}`,
            name: 'New Project',
            storyboards: [{ id: `sb-${Date.now()}`, name: 'Main Storyboard', shots: [] }],
            activeStoryboardId: `sb-${Date.now()}`,
            aspectRatio: '16:9'
        };
        updateProjects([...projects, newProject]);
        setActiveProjectId(newProject.id);
    };

    const requestDeleteProject = (projectId: string, projectName: string) => {
        if (projects.length <= 1) return;
        setDeleteConfirmation({
            isOpen: true,
            type: 'project',
            id: projectId,
            name: projectName
        });
    };

    const requestDeleteStoryboard = (storyboardId: string, storyboardName: string) => {
        if (activeProject.storyboards.length <= 1) return;
        setDeleteConfirmation({
            isOpen: true,
            type: 'storyboard',
            id: storyboardId,
            name: storyboardName
        });
    };

    const executeDelete = () => {
        const { type, id } = deleteConfirmation;

        if (type === 'project' && id) {
             const remaining = projects.filter(p => p.id !== id);
             setProjects(remaining);
             if (activeProjectId === id) {
                 setActiveProjectId(remaining[0].id);
             }
        } else if (type === 'storyboard' && id) {
            const remainingStoryboards = activeProject.storyboards.filter(sb => sb.id !== id);
            if (remainingStoryboards.length > 0) {
                const updatedProject = {
                    ...activeProject,
                    storyboards: remainingStoryboards,
                    activeStoryboardId: activeProject.activeStoryboardId === id ? remainingStoryboards[0].id : activeProject.activeStoryboardId
                };
                updateProjects(projects.map(p => p.id === activeProjectId ? updatedProject : p));
            }
        }
        setDeleteConfirmation({ isOpen: false, type: null, id: null, name: '' });
    };

    const handleExport = () => {
        const exportWindow = window.open('', '_blank');
        if (!exportWindow) return;
        const ratio = activeProject.aspectRatio.replace(':', '/');
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${activeProject.name} - ${activeStoryboard.name} - Export</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                    body { font-family: 'Inter', sans-serif; padding: 40px; max-width: 1000px; margin: 0 auto; color: #1e293b; }
                    h1 { margin-bottom: 5px; font-size: 24px; }
                    h2 { margin-top: 0; font-size: 16px; color: #64748b; font-weight: normal; margin-bottom: 40px; }
                    .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 40px; }
                    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 40px 30px; }
                    .shot-card { break-inside: avoid; page-break-inside: avoid; }
                    .image-container { 
                        width: 100%; 
                        aspect-ratio: ${ratio}; 
                        background: #f1f5f9; 
                        border: 1px solid #e2e8f0; 
                        border-radius: 8px; 
                        overflow: hidden; 
                        margin-bottom: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    img { width: 100%; height: 100%; object-fit: cover; filter: grayscale(100%) contrast(1.5) brightness(1.1); }
                    .placeholder { color: #94a3b8; font-size: 12px; }
                    .shot-meta { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
                    .shot-number { font-weight: 700; font-size: 14px; color: #0f172a; }
                    .shot-duration { font-size: 12px; color: #64748b; font-weight: 600; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
                    .shot-desc { font-size: 13px; line-height: 1.5; color: #334155; }
                    .shot-angle { font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 600; margin-top: 2px; }
                    @media print { body { padding: 0; } .header { margin-bottom: 20px; } button { display: none; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${activeProject.name}</h1>
                    <h2>${activeStoryboard.name} • ${shots.length} Shots • Exported on ${new Date().toLocaleDateString()}</h2>
                </div>
                <div class="grid">
                    ${shots.map(shot => `
                        <div class="shot-card">
                            <div class="image-container">
                                ${shot.imageUrl 
                                    ? `<img src="${shot.imageUrl}" />` 
                                    : `<div class="placeholder">No Sketch</div>`
                                }
                            </div>
                            <div class="shot-meta">
                                <div class="shot-number">Shot ${String(shot.number).padStart(2, '0')}</div>
                                <div class="shot-duration">${shot.duration}s</div>
                            </div>
                            <div class="shot-desc">${shot.title}</div>
                            ${shot.cameraAngle ? `<div class="shot-angle">${shot.cameraAngle}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
                <script>
                    window.onload = () => { setTimeout(() => window.print(), 500); }
                </script>
            </body>
            </html>
        `;
        exportWindow.document.write(htmlContent);
        exportWindow.document.close();
    };

    const handleAddShot = () => {
        const newShotNumber = shots.length + 1;
        const newShot: Shot = {
            id: `shot-${Date.now()}`,
            number: newShotNumber,
            duration: 2.0,
            title: '',
            cameraAngle: 'Wide Shot',
            imageUrl: ''
        };
        const updatedStoryboard = { ...activeStoryboard, shots: [...shots, newShot] };
        const updatedProject = {
            ...activeProject,
            storyboards: activeProject.storyboards.map(sb => sb.id === activeStoryboard.id ? updatedStoryboard : sb)
        };
        updateProjects(projects.map(p => p.id === activeProjectId ? updatedProject : p));
        setSelectedShotId(newShot.id);
    };

    const deleteShot = (shotId: string) => {
        const remainingShots = shots.filter(s => s.id !== shotId).map((s, i) => ({ ...s, number: i + 1 }));
        const updatedStoryboard = { ...activeStoryboard, shots: remainingShots };
        const updatedProject = {
            ...activeProject,
            storyboards: activeProject.storyboards.map(sb => sb.id === activeStoryboard.id ? updatedStoryboard : sb)
        };
        updateProjects(projects.map(p => p.id === activeProjectId ? updatedProject : p));
    };

    const handleMoveShot = (fromIndex: number, toIndex: number) => {
        if (fromIndex === toIndex) return;
        const newShots = [...shots];
        const [movedShot] = newShots.splice(fromIndex, 1);
        newShots.splice(toIndex, 0, movedShot);
        const updatedShots = newShots.map((s, i) => ({ ...s, number: i + 1 }));
        const updatedStoryboard = { ...activeStoryboard, shots: updatedShots };
        const updatedProject = {
            ...activeProject,
            storyboards: activeProject.storyboards.map(sb => sb.id === activeStoryboard.id ? updatedStoryboard : sb)
        };
        updateProjects(projects.map(p => p.id === activeProjectId ? updatedProject : p));
    };

    const totalShots = shots.length;

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
                <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-center max-w-md w-full">
                    <div className="mb-6 flex justify-center text-blue-600">
                        <span className="material-symbols-outlined text-6xl">movie_edit</span>
                    </div>
                    <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Welcome to StoryBoard AI</h1>
                    <p className="text-slate-500 mb-8">Create professional animatics and storyboards with the power of generative AI.</p>
                    <button 
                        onClick={handleLogin}
                        className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition-all shadow-sm"
                    >
                        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                        Sign in with Google (Demo)
                    </button>
                    <p className="mt-4 text-xs text-slate-400">By signing in, you agree to save your changes locally.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900">
            <div className="flex h-12 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 bg-white dark:bg-slate-900 z-30 flex-shrink-0">
                <div className="flex items-center h-full">
                    <div className="flex items-center gap-2 pr-4 mr-2 border-r border-slate-200 dark:border-slate-800 text-blue-600">
                        <span className="material-symbols-outlined text-2xl font-bold">movie_edit</span>
                    </div>
                    <nav className="flex items-center h-full gap-1 overflow-x-auto no-scrollbar">
                        {projects.map(project => (
                             <div 
                                key={project.id}
                                onClick={() => setActiveProjectId(project.id)}
                                className={`group flex items-center h-full border-b-2 px-2 transition-all cursor-pointer ${
                                    activeProjectId === project.id 
                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/10' 
                                    : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                <span className={`px-2 text-sm font-semibold whitespace-nowrap ${
                                    activeProjectId === project.id ? 'text-blue-600' : 'text-slate-500 dark:text-slate-400'
                                }`}>
                                    Film: {project.name}
                                </span>
                                {activeProjectId === project.id && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); requestDeleteProject(project.id, project.name); }}
                                        className="p-1 text-blue-600/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                    </button>
                                )}
                            </div>
                        ))}
                        <button onClick={handleNewProject} className="ml-2 flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-bold transition-all whitespace-nowrap text-slate-600 dark:text-slate-300">
                            <span className="material-symbols-outlined text-sm">add</span>
                            New Film
                        </button>
                    </nav>
                </div>
                <div className="flex items-center gap-2">
                    {storageError && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold animate-pulse">
                            <span className="material-symbols-outlined text-sm">storage</span>
                            Storage Full
                        </div>
                    )}
                    <button 
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center mr-2"
                    >
                        <span className="material-symbols-outlined">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
                    </button>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                        <img src={user.avatar} alt="User" className="w-5 h-5 rounded-full" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{user.name}</span>
                        <button onClick={handleLogout} className="ml-2 text-xs text-slate-400 hover:text-red-500">Sign Out</button>
                    </div>
                </div>
            </div>

            <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900 z-20 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                            <input 
                                className="bg-transparent border-none p-0 text-lg font-bold focus:ring-0 w-auto min-w-[150px] dark:text-white" 
                                type="text" 
                                value={activeProject.name}
                                onChange={(e) => {
                                    const updated = { ...activeProject, name: e.target.value };
                                    updateProjects(projects.map(p => p.id === activeProjectId ? updated : p));
                                }}
                            />
                            <span className="material-symbols-outlined text-slate-400 text-sm cursor-pointer hover:text-blue-600">edit</span>
                            <select
                                value={activeProject.aspectRatio}
                                onChange={(e) => {
                                    const updated = { ...activeProject, aspectRatio: e.target.value as any };
                                    updateProjects(projects.map(p => p.id === activeProjectId ? updated : p));
                                }}
                                className="ml-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold focus:ring-blue-600 focus:border-blue-600 text-slate-700 dark:text-slate-300 outline-none"
                            >
                                <option value="16:9">16:9 Widescreen</option>
                                <option value="9:16">9:16 Portrait</option>
                                <option value="4:3">4:3 Standard</option>
                                <option value="3:4">3:4 Vertical</option>
                                <option value="1:1">1:1 Square</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setIsPlayerOpen(true)}
                        className="group flex items-center gap-2.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/25 transition-all active:scale-[0.98]"
                    >
                        <span className="material-symbols-outlined text-[22px] fill-1 transition-transform group-hover:scale-110">play_circle</span>
                        Play Animatic
                    </button>
                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-semibold transition-all text-slate-700 dark:text-slate-200"
                    >
                        <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                        Export
                    </button>
                </div>
            </header>

            <div className="flex items-center px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-10 overflow-x-auto no-scrollbar flex-shrink-0">
                <div className="flex items-center gap-1 h-full">
                    {activeProject.storyboards.map(sb => (
                         <div 
                            key={sb.id}
                            onClick={() => {
                                const updated = { ...activeProject, activeStoryboardId: sb.id };
                                updateProjects(projects.map(p => p.id === activeProjectId ? updated : p));
                            }}
                            className={`flex items-center gap-2 px-4 h-full cursor-pointer border-b-2 transition-all ${
                                activeStoryboard.id === sb.id 
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/10 text-blue-600' 
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border-transparent'
                            }`}
                        >
                            <span className="text-xs font-bold whitespace-nowrap">{sb.name}</span>
                            {activeProject.storyboards.length > 1 && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); requestDeleteStoryboard(sb.id, sb.name); }}
                                    className="hover:bg-blue-600/20 rounded-full p-0.5 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[10px]">close</span>
                                </button>
                            )}
                        </div>
                    ))}
                    <button 
                        onClick={() => {
                            const newSb: Storyboard = { id: `sb-${Date.now()}`, name: `Storyboard ${activeProject.storyboards.length + 1}`, shots: [] };
                            const updated = { ...activeProject, storyboards: [...activeProject.storyboards, newSb], activeStoryboardId: newSb.id };
                            updateProjects(projects.map(p => p.id === activeProjectId ? updated : p));
                        }}
                        className="flex items-center justify-center w-8 h-8 ml-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <aside className="w-[400px] flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="p-4 flex flex-col gap-2 flex-shrink-0 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Film Scenes</h3>
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500">DRAFT 2.0</span>
                        </div>
                        <button 
                            onClick={handleAddShot}
                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-lg text-sm font-bold transition-all"
                        >
                            <span className="material-symbols-outlined text-sm">add</span>
                            New Shot
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 space-y-3">
                        {shots.map((shot, index) => (
                            <ShotEditor 
                                key={shot.id} 
                                shot={shot} 
                                index={index}
                                isSelected={selectedShotId === shot.id}
                                onUpdate={updateShot}
                                onDelete={deleteShot}
                                onClick={() => setSelectedShotId(shot.id)}
                                onRegenerate={forceRegenerate}
                                onDragStart={(idx) => setDraggedShotIndex(idx)}
                                onDrop={(idx) => {
                                    if (draggedShotIndex !== null) {
                                        handleMoveShot(draggedShotIndex, idx);
                                    }
                                    setDraggedShotIndex(null);
                                }}
                            />
                        ))}
                        {shots.length === 0 && (
                            <div className="text-center p-4 text-slate-400 text-sm">
                                No shots yet. Click "New Shot" to start.
                            </div>
                        )}
                    </div>
                </aside>

                <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-900 p-8 relative">
                    <div className="max-w-6xl mx-auto space-y-8">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{activeStoryboard.name}: {activeProject.name}</h2>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">
                                    Pencil sketch phase • {totalShots} shots total • {lastSaved ? `Saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Unsaved'}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-400">
                                    <span className="material-symbols-outlined text-xl">grid_view</span>
                                </button>
                                <button className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-400">
                                    <span className="material-symbols-outlined text-xl">reorder</span>
                                </button>
                            </div>
                        </div>

                        {storageError && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
                                <span className="material-symbols-outlined">error</span>
                                <div className="flex-1 text-sm font-semibold">{storageError}</div>
                                <button onClick={() => setStorageError(null)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded">
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
                            {shots.map(shot => (
                                <ShotCard 
                                    key={shot.id} 
                                    shot={shot} 
                                    aspectRatio={activeProject.aspectRatio}
                                    onClick={() => setSelectedShotId(shot.id)}
                                    onDelete={() => deleteShot(shot.id)}
                                    onRegenerate={() => forceRegenerate(shot.id)}
                                />
                            ))}
                            <div onClick={handleAddShot} className="group relative flex flex-col gap-3">
                                <div className="w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-600/50 hover:bg-blue-600/5 cursor-pointer transition-all" style={{ aspectRatio: activeProject.aspectRatio.replace(':', '/') }}>
                                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                                        <span className="material-symbols-outlined text-2xl">add</span>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">Add New Shot</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {isPlayerOpen && <AnimaticPlayer shots={shots} aspectRatio={activeProject.aspectRatio} onClose={() => setIsPlayerOpen(false)} />}
            <ConfirmDialog 
                isOpen={deleteConfirmation.isOpen} 
                title={`Delete ${deleteConfirmation.type === 'project' ? 'Film' : 'Storyboard'}`} 
                message={`Are you sure you want to delete "${deleteConfirmation.name}"? This action cannot be undone.`} 
                onConfirm={executeDelete} 
                onCancel={() => setDeleteConfirmation({ isOpen: false, type: null, id: null, name: '' })} 
            />
        </div>
    );
}
