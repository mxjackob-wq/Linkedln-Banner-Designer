import React, { useRef } from 'react';
import { User, Briefcase, Upload, Trash2 } from 'lucide-react';

const PersonForm = ({ kit, onUpdate }) => {
    const fileInputRef = useRef(null);

    const handleHeadshotUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onUpdate({ headshot: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-4">
            {/* Name */}
            <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Full Name</label>
                <div className="relative">
                    <User className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <input
                        type="text"
                        value={kit.name || ''}
                        onChange={(e) => onUpdate({ name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full pl-9 p-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                </div>
            </div>

            {/* Title / Role */}
            <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Title / Role</label>
                <div className="relative">
                    <Briefcase className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <input
                        type="text"
                        value={kit.title || ''}
                        onChange={(e) => onUpdate({ title: e.target.value })}
                        placeholder="Senior Developer"
                        className="w-full pl-9 p-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                </div>
            </div>

            {/* Headshot Upload */}
            <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Headshot</label>
                <div className="flex items-center gap-3">
                    {kit.headshot ? (
                        <div className="w-16 h-16 relative group rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                            <img src={kit.headshot} alt="Headshot" className="w-full h-full object-cover" />
                            <button
                                onClick={() => onUpdate({ headshot: null })}
                                className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-16 h-16 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-full cursor-pointer hover:border-indigo-500 hover:bg-slate-50 transition-colors"
                        >
                            <Upload size={20} className="text-slate-400" />
                        </button>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleHeadshotUpload}
                    />
                    <div className="flex flex-col">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm font-medium text-slate-600 hover:text-indigo-600 text-left"
                        >
                            {kit.headshot ? 'Change Photo' : 'Upload Photo'}
                        </button>
                        <span className="text-xs text-slate-400">
                            Use a professional headshot
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonForm;
