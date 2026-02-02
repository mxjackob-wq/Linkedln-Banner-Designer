import React from 'react';
import BannerCanvas from '../BannerCanvas';

const CanvasWorkspace = (props) => {
    return (
        <div className="flex-1 bg-slate-100 overflow-hidden relative flex items-center justify-center p-8">
            {/* Detailed grid pattern for professional look */}
            <div className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}>
            </div>

            <div className="relative transition-transform duration-200 ease-out flex flex-col gap-4"
                style={{ transform: `scale(${props.zoom / 100})` }}>
                <BannerCanvas {...props} />
                <button className="self-center flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100">
                    <span>+ Add Page</span>
                </button>
            </div>
        </div>
    );
};

export default CanvasWorkspace;
