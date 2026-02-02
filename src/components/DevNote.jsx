import React, { useState, useEffect } from 'react';
import { X, Minimize2, Maximize2 } from 'lucide-react';

export default function DevNote() {
    // Only render in development mode
    if (!import.meta.env.DEV) {
        return null;
    }

    const [isVisible, setIsVisible] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false);
    const [note, setNote] = useState(() => {
        return sessionStorage.getItem('dev_note_content') || '';
    });

    useEffect(() => {
        sessionStorage.setItem('dev_note_content', note);
    }, [note]);

    if (!isVisible) return null;

    return (
        <div
            className={`fixed bottom-4 right-4 z-50 bg-yellow-100 border border-yellow-300 shadow-lg rounded-lg transition-all duration-300 ${isMinimized ? 'w-48 h-10' : 'w-80 h-64'
                }`}
        >
            <div className="flex items-center justify-between px-3 py-2 bg-yellow-200 rounded-t-lg border-b border-yellow-300 cursor-move">
                <span className="text-xs font-semibold text-yellow-800 uppercase tracking-wider">Dev Notes</span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="p-1 hover:bg-yellow-300 rounded text-yellow-800 transition-colors"
                        title={isMinimized ? "Expand" : "Minimize"}
                    >
                        {isMinimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-1 hover:bg-yellow-300 rounded text-yellow-800 transition-colors"
                        title="Close (Refresh to bring back)"
                    >
                        <X size={12} />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Type specific test notes here..."
                    className="w-full h-[calc(100%-2.5rem)] resize-none bg-yellow-50 p-3 text-sm text-gray-800 focus:outline-none focus:bg-white rounded-b-lg font-mono leading-relaxed"
                    spellCheck="false"
                />
            )}
        </div>
    );
}
