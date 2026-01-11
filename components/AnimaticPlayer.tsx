import React, { useEffect, useState } from 'react';
import { Shot } from '../types';

interface AnimaticPlayerProps {
    shots: Shot[];
    aspectRatio: string;
    onClose: () => void;
}

export const AnimaticPlayer: React.FC<AnimaticPlayerProps> = ({ shots, aspectRatio, onClose }) => {
    const [currentShotIndex, setCurrentShotIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [elapsedTime, setElapsedTime] = useState(0);

    const currentShot = shots[currentShotIndex];
    const totalDuration = shots.reduce((acc, s) => acc + s.duration, 0);
    
    // Calculate start time of current shot
    const currentShotStartTime = shots.slice(0, currentShotIndex).reduce((acc, s) => acc + s.duration, 0);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isPlaying) {
            const tick = 100; // 100ms updates
            interval = setInterval(() => {
                setElapsedTime(prev => {
                    const nextTime = prev + (tick / 1000);
                    
                    // Check if we need to advance shot
                    const shotEndTime = currentShotStartTime + currentShot.duration;
                    
                    if (nextTime >= shotEndTime) {
                        if (currentShotIndex < shots.length - 1) {
                            setCurrentShotIndex(currentShotIndex + 1);
                        } else {
                            setIsPlaying(false); // End of sequence
                            return prev; // Stop at end
                        }
                    }
                    return nextTime;
                });
            }, tick);
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentShotIndex, currentShot, currentShotStartTime, shots.length]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const progressPercent = Math.min((elapsedTime / totalDuration) * 100, 100);

    // Calculate dynamic dimensions to force aspect ratio within viewport
    const ratioString = aspectRatio.replace(':', '/');
    const containerStyle = {
        aspectRatio: ratioString,
        width: `min(85vw, 85vh * (${ratioString}))`,
        height: `min(85vh, 85vw / (${ratioString}))`,
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center font-display">
            <main className="relative w-full h-full flex items-center justify-center p-0">
                <div 
                    className="relative flex items-center justify-center shadow-2xl bg-slate-900 border border-white/10"
                    style={containerStyle}
                >
                    {currentShot?.imageUrl ? (
                        <img 
                            src={currentShot.imageUrl} 
                            alt={currentShot.title} 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
                            <span className="material-symbols-outlined text-6xl mb-4">image_not_supported</span>
                            <span className="text-xl">No Image Generated</span>
                        </div>
                    )}
                    
                    <div className="absolute top-6 left-6 opacity-50 hover:opacity-100 transition-opacity text-white bg-black/40 backdrop-blur-md p-4 rounded-xl max-w-[80%]">
                        <span className="text-[12px] tracking-[0.2em] font-medium uppercase block mb-1">Shot {String(currentShot.number).padStart(2, '0')}</span>
                        <h2 className="text-xl font-bold line-clamp-2">{currentShot.title}</h2>
                    </div>
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-black/90 to-transparent transition-opacity hover:opacity-100 opacity-0 md:opacity-100 pointer-events-none hover:pointer-events-auto">
                <div className="max-w-4xl mx-auto flex items-center gap-10 pointer-events-auto">
                    <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="flex items-center justify-center size-10 text-white/70 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-4xl">
                            {isPlaying ? 'pause' : 'play_arrow'}
                        </span>
                    </button>
                    
                    <div className="flex-1 flex flex-col gap-3 group">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-mono text-white/40">{formatTime(elapsedTime)}</span>
                            <span className="text-[10px] font-mono text-white/40">{formatTime(totalDuration)}</span>
                        </div>
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-white transition-all duration-200 ease-linear"
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                    </div>

                    <button 
                        onClick={onClose}
                        className="flex items-center gap-2 px-4 py-2 text-white/40 hover:text-white transition-all group"
                    >
                        <span className="text-[10px] font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">Exit Player</span>
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                </div>
            </footer>
        </div>
    );
};