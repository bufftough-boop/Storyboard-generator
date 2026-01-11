import React, { useState, useEffect } from 'react';
import { Shot } from '../types';

interface ShotCardProps {
    shot: Shot;
    aspectRatio: string;
    onClick: () => void;
    onDelete: () => void;
    onRegenerate: () => void;
}

export const ShotCard: React.FC<ShotCardProps> = ({ shot, aspectRatio, onClick, onDelete, onRegenerate }) => {
    const [imgError, setImgError] = useState(false);

    // Reset error state if url changes
    useEffect(() => {
        setImgError(false);
    }, [shot.imageUrl]);
    
    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!shot.imageUrl) return;

        const link = document.createElement('a');
        link.href = shot.imageUrl;
        link.download = `shot-${String(shot.number).padStart(2, '0')}-${shot.title.slice(0, 20).replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Filter to make generated images look like high-contrast pencil sketches on warm paper
    // Increased contrast and slight blur to mimic graphite texture
    const sketchFilter = 'grayscale(100%) contrast(150%) brightness(105%) sepia(20%)';

    return (
        <div className="group relative flex flex-col gap-3">
            <div 
                className="w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all relative cursor-pointer bg-[#fcfaf7] dark:bg-slate-900"
                style={{ aspectRatio: aspectRatio.replace(':', '/') }}
                onClick={onClick}
            >
                {shot.isGenerating ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 animate-pulse">
                        <span className="material-symbols-outlined text-4xl animate-spin">edit_note</span>
                        <span className="text-xs font-bold mt-2 uppercase tracking-widest">Sketching...</span>
                    </div>
                ) : shot.imageUrl && !imgError ? (
                    <img 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        style={{ filter: sketchFilter }}
                        src={shot.imageUrl} 
                        alt={shot.title} 
                        onError={() => setImgError(true)}
                        referrerPolicy="no-referrer"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400">
                        <span className="material-symbols-outlined text-4xl">draw</span>
                    </div>
                )}

                <div className="absolute top-3 left-3 px-2 py-1 bg-slate-900/50 backdrop-blur-md text-white text-[10px] font-bold rounded">
                    Shot {String(shot.number).padStart(2, '0')}
                </div>
                <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded">
                    {shot.duration}s
                </div>
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                </div>
            </div>

            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 leading-tight">{shot.title || "Untitled Shot"}</h4>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">{shot.cameraAngle}</p>
                </div>
                <div className="relative group/menu">
                    <button className="material-symbols-outlined text-slate-400 text-lg hover:text-primary cursor-pointer">
                        more_vert
                    </button>
                    <div className="absolute right-0 top-full hidden group-hover/menu:block hover:block z-10 w-36 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onRegenerate(); }}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 font-semibold"
                        >
                            <span className="material-symbols-outlined text-sm">auto_fix_high</span> Re-sketch
                        </button>
                        <button 
                            onClick={handleDownload}
                            disabled={!shot.imageUrl}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-sm">download</span> Download
                        </button>
                        <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 font-semibold"
                        >
                            <span className="material-symbols-outlined text-sm">delete</span> Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};