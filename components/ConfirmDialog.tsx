import React from 'react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-6 transform transition-all scale-100">
                <div className="flex items-center gap-3 mb-2 text-red-500">
                     <span className="material-symbols-outlined">warning</span>
                     <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed ml-9">
                    {message}
                </p>
                <div className="flex items-center justify-end gap-3">
                    <button 
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-sm transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};