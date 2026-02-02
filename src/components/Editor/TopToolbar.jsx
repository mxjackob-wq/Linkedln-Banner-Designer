import React from 'react';
import { ArrowLeft, Undo, Redo, Download, Share2, Users } from 'lucide-react';

const TopToolbar = ({ fileName, onFileNameChange, onDownload, onBack }) => {
    return (
        <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-20">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
                    <ArrowLeft size={20} />
                </button>

                <div className="flex items-center gap-4">
                    <div className="h-8 w-[1px] bg-slate-200"></div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-600">File</span>

                        <span className="text-slate-300">|</span>
                        <span className="text-sm text-slate-500">Auto-saved</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg" title="Undo">
                        <Undo size={18} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg" title="Redo">
                        <Redo size={18} />
                    </button>
                </div>
            </div>

            <div className="flex-1 max-w-lg mx-8">
                <input
                    type="text"
                    value={fileName}
                    onChange={(e) => onFileNameChange(e.target.value)}
                    className="w-full text-center font-medium text-slate-700 hover:border-slate-300 border border-transparent rounded px-2 py-1 focus:border-blue-500 focus:outline-none transition-all"
                />
            </div>

            <div className="flex items-center gap-3">


                <button className="p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium text-sm flex items-center gap-2">
                    <Share2 size={16} />
                    Share
                </button>



                <button
                    onClick={onDownload}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center gap-2 shadow-sm"
                >
                    <Download size={16} />
                    Download
                </button>
            </div>
        </div>
    );
};

export default TopToolbar;
