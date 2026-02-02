import React from 'react';
import { HelpCircle, Monitor, ZoomIn, ZoomOut, Grid, Magnet } from 'lucide-react';

const BottomToolbar = ({ zoom, setZoom, showGrid, setShowGrid, snapToGrid, setSnapToGrid }) => {
    const [tempZoom, setTempZoom] = React.useState(zoom.toString());

    React.useEffect(() => {
        setTempZoom(zoom.toString());
    }, [zoom]);

    const handleZoomChange = (e) => {
        const val = e.target.value;
        setTempZoom(val);
    };

    const handleZoomBlur = () => {
        let num = parseInt(tempZoom);
        if (isNaN(num)) {
            setTempZoom(zoom.toString()); // Revert
            return;
        }

        // Clamp
        num = Math.max(10, Math.min(500, num));
        setZoom(num);
        setTempZoom(num.toString());
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
        }
    };

    return (
        <div className="h-10 bg-white border-t border-slate-200 flex items-center justify-between px-4 z-20">
            <div className="flex items-center gap-4">
                <button className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1">
                    Notes
                </button>
                <div className="h-4 w-[1px] bg-slate-200"></div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowGrid(!showGrid)}
                        className={`p-1.5 rounded-md transition-colors ${showGrid ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
                        title="Toggle Grid"
                    >
                        <Grid size={16} />
                    </button>
                    <button
                        onClick={() => setSnapToGrid(!snapToGrid)}
                        className={`p-1.5 rounded-md transition-colors ${snapToGrid ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
                        title="Snap to Grid"
                    >
                        <Magnet size={16} />
                    </button>
                </div>
                <div className="h-4 w-[1px] bg-slate-200"></div>
                <span className="text-xs text-slate-400">Page 1 of 1</span>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-2 py-1 border border-slate-200">
                    <button onClick={() => setZoom(Math.max(10, zoom - 10))} className="p-0.5 text-slate-500 hover:text-slate-800"><ZoomOut size={14} /></button>
                    <div className="relative flex items-center justify-center w-12">
                        <input
                            type="text"
                            inputMode="numeric"
                            value={tempZoom}
                            onChange={handleZoomChange}
                            onBlur={handleZoomBlur}
                            onKeyDown={handleKeyDown}
                            className="w-full text-center text-xs font-medium bg-transparent border-none focus:outline-none focus:ring-0 appearance-none m-0 p-0"
                            style={{ MozAppearance: 'textfield' }} // Hide spinner in FF
                        />
                        <span className="absolute right-0 pointer-events-none text-xs text-transparent">%</span>
                    </div>
                    <span className="text-xs font-medium text-slate-500 -ml-3 pointer-events-none">%</span>
                    <button onClick={() => setZoom(Math.min(500, zoom + 10))} className="p-0.5 text-slate-500 hover:text-slate-800"><ZoomIn size={14} /></button>
                </div>

                <button className="text-slate-400 hover:text-slate-600" title="Full Screen">
                    <Monitor size={16} />
                </button>
                <button className="text-slate-400 hover:text-slate-600" title="Help">
                    <HelpCircle size={16} />
                </button>
            </div>
        </div>
    );
};

export default BottomToolbar;
