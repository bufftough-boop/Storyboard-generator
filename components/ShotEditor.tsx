import React, { useRef, useEffect, useState } from 'react';
import { Shot } from '../types';

interface ShotEditorProps {
    shot: Shot;
    index: number;
    isSelected: boolean;
    onUpdate: (id: string, updates: Partial<Shot>) => void;
    onDelete: (id: string) => void;
    onClick: () => void;
    onRegenerate: (id: string) => void;
    onDragStart: (index: number) => void;
    onDrop: (index: number) => void;
}

const CAMERA_ANGLES = [
    "Wide Shot",
    "Medium Shot",
    "Close Up",
    "Extreme Close Up",
    "Low Angle",
    "High Angle",
    "Over The Shoulder",
    "Point of View (POV)",
    "Dutch Angle",
    "Bird's Eye View"
];

export const ShotEditor: React.FC<ShotEditorProps> = ({ 
    shot, 
    index, 
    isSelected, 
    onUpdate, 
    onDelete, 
    onClick, 
    onRegenerate,
    onDragStart,
    onDrop
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isOver, setIsOver] = useState(false);

    const adjustHeight = () => {
        const el = textareaRef.current;
        if (el) {
            el.style.height = 'auto';
            el.style.height = el.scrollHeight + 'px';
        }
    };

    useEffect(() => {
        adjustHeight();
        const timer = setTimeout(adjustHeight, 100);
        return () => clearTimeout(timer);
    }, [shot.title]);

    const handleDragStart = (e: React.DragEvent) => {
        onDragStart(index);
        // Set drag image/effect
        e.dataTransfer.effectAllowed = 'move';
        // Add a class for visual feedback during dragging
        (e.currentTarget as HTMLElement).style.opacity = '0.4';
    };

    const handleDragEnd = (e: React.DragEvent) => {
        (e.currentTarget as HTMLElement).style.opacity = '1';
        setIsOver(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsOver(true);
    };

    const handleDragLeave = () => {
        setIsOver(false);
    };

    const handleDropEvent = (e: React.DragEvent) => {
        e.preventDefault();
        setIsOver(false);
        onDrop(index);
    };

    return (
        <div 
            onClick={onClick}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDropEvent}
            className={`group flex flex-col gap-3 px-3 py-3 rounded-lg border cursor-pointer transition-all ${
                isSelected 
                ? 'bg-primary/5 border-primary/30' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 border-transparent'
            } ${isOver ? 'border-t-2 border-t-primary mt-[-2px]' : ''}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Drag Handle */}
                    <span 
                        className="material-symbols-outlined text-slate-300 dark:text-slate-600 cursor-grab active:cursor-grabbing hover:text-slate-500 transition-colors"
                        title="Drag to reorder"
                    >
                        drag_indicator
                    </span>

                    <div className={`px-2 h-6 flex items-center justify-center rounded text-[10px] font-bold whitespace-nowrap ${
                        isSelected ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                        #{String(shot.number).padStart(2, '0')}
                    </div>
                    
                    {/* Metadata Row */}
                    <div className="flex items-center gap-2">
                        {/* Duration Input */}
                        <div className="flex items-center gap-1 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded px-2 h-6" title="Duration (seconds)">
                            <span className="material-symbols-outlined text-slate-400 text-[14px]">timer</span>
                            <input 
                                className="w-12 h-full p-0 text-[11px] font-bold border-none bg-transparent text-center focus:ring-0 text-slate-700 dark:text-slate-300" 
                                type="number" 
                                step="0.1" 
                                value={shot.duration}
                                onChange={(e) => onUpdate(shot.id, { duration: parseFloat(e.target.value) })}
                                onClick={(e) => e.stopPropagation()} 
                            />
                            <span className="text-[10px] text-slate-400 font-medium">sec</span>
                        </div>

                        {/* Camera Angle Dropdown */}
                        <div className="flex items-center gap-1 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded pl-1.5 h-6">
                            <span className="material-symbols-outlined text-slate-400 text-[14px]">videocam</span>
                            <select
                                className="h-full py-0 pl-1 pr-6 text-[10px] font-bold uppercase tracking-wide border-none bg-transparent focus:ring-0 text-slate-600 dark:text-slate-300 cursor-pointer max-w-[120px]"
                                value={shot.cameraAngle || ""}
                                onChange={(e) => onUpdate(shot.id, { cameraAngle: e.target.value })}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <option value="" disabled>Angle</option>
                                {CAMERA_ANGLES.map(angle => (
                                    <option key={angle} value={angle}>{angle}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(shot.id); }}
                    className="material-symbols-outlined text-slate-400 hover:text-red-500 transition-colors text-lg opacity-0 group-hover:opacity-100"
                >
                    delete
                </button>
            </div>

            <div className="relative">
                 <textarea 
                    ref={textareaRef}
                    className="w-full text-sm font-semibold bg-transparent border-b border-slate-200 dark:border-slate-700 py-2 pr-8 focus:ring-0 focus:border-primary text-slate-700 dark:text-slate-300 placeholder-slate-400 resize-none overflow-hidden min-h-[38px] leading-relaxed"
                    placeholder="Shot Description..."
                    value={shot.title}
                    rows={1}
                    onChange={(e) => {
                        onUpdate(shot.id, { title: e.target.value });
                    }}
                />
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRegenerate(shot.id);
                    }}
                    className="absolute right-0 top-1.5 p-1 text-slate-400 hover:text-primary transition-colors bg-transparent"
                    title="Update Sketch"
                >
                    <span className="material-symbols-outlined text-lg">autorenew</span>
                </button>
            </div>
        </div>
    );
};