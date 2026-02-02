import { Search, Square, Circle, Triangle, Heart, Image as ImageIcon, Video, Music, Minus, Activity, GitBranch } from 'lucide-react';


const CategoryButton = ({ icon: Icon, label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-2 p-2 hover:bg-slate-50 rounded-lg transition-colors">
        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
            <Icon size={20} />
        </div>
        <span className="text-[10px] text-slate-600 font-medium">{label}</span>
    </button>
);

const ElementsPanel = ({ onAddElement }) => {
    return (
        <div className="p-4 space-y-6">
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                    type="text"
                    placeholder="Search elements..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            <div>
                <h3 className="font-bold text-slate-800 mb-3 text-sm">Shapes & Lines</h3>
                <div className="grid grid-cols-4 gap-2">
                    <CategoryButton
                        onClick={() => onAddElement({
                            type: 'polygon',
                            points: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }],
                            fill: '#64748b',
                            stroke: '#475569',
                            strokeWidth: 2
                        })}
                        icon={Square}
                        label="Square"
                    />
                    <CategoryButton onClick={() => onAddElement({ type: 'circle', width: 100, height: 100, fill: '#64748b' })} icon={Circle} label="Circle" />
                    <CategoryButton
                        onClick={() => onAddElement({
                            type: 'polygon',
                            points: [{ x: 50, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }],
                            fill: '#64748b',
                            stroke: '#475569',
                            strokeWidth: 2
                        })}
                        icon={Triangle}
                        label="Triangle"
                    />
                    <CategoryButton onClick={() => onAddElement({ type: 'line', points: [{ x: 0, y: 0 }, { x: 200, y: 0 }], stroke: '#64748b', strokeWidth: 4 })} icon={Minus} label="Line" />
                    <CategoryButton onClick={() => onAddElement({ type: 'line', lineType: 'spline', points: [{ x: 0, y: 0 }, { x: 100, y: 50 }, { x: 200, y: 0 }], stroke: '#64748b', strokeWidth: 4 })} icon={Activity} label="Spline" />
                    <CategoryButton onClick={() => onAddElement({ type: 'line', lineType: 'ortho', points: [{ x: 0, y: 0 }, { x: 200, y: 100 }], stroke: '#64748b', strokeWidth: 4 })} icon={GitBranch} label="Ortho" />
                </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
                <CategoryButton
                    onClick={() => onAddElement({
                        type: 'image',
                        src: 'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
                        width: 300,
                        height: 200
                    })}
                    icon={ImageIcon}
                    label="Photos"
                />
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl text-white text-center">
                <h3 className="font-bold text-sm mb-1">Generate Image</h3>
                <p className="text-[10px] opacity-90 mb-3">Describe what you want to see</p>
                <button className="w-full py-1.5 bg-white text-purple-600 text-xs font-bold rounded shadow hover:bg-purple-50 transition-colors">
                    Try AI Generator
                </button>
            </div>



            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm">Recently Used</h3>
                    <button className="text-xs text-blue-600">See all</button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="aspect-square bg-slate-100 rounded-lg hover:bg-slate-200 cursor-pointer"></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ElementsPanel;
