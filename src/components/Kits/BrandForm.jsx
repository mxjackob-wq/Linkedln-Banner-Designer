import React, { useRef } from 'react';
import { Upload, Trash2 } from 'lucide-react';

const BrandForm = ({ kit, onUpdate }) => {
    const fileInputRef = useRef(null);

    const handleColorChange = (index, value) => {
        const newColors = [...(kit.colors || [])];
        newColors[index] = value;
        onUpdate({ colors: newColors });
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onUpdate({ logo: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    // Ensure we have at least 3 color slots
    const colors = kit.colors || ['#000000', '#ffffff', '#808080'];

    return (
        <div className="space-y-4">
            {/* Brand Name */}
            <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Brand Name</label>
                <input
                    type="text"
                    value={kit.name || ''}
                    onChange={(e) => onUpdate({ name: e.target.value })}
                    placeholder="My Company Brand"
                    className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
            </div>

            {/* Colors */}
            <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Brand Colors</label>
                <div className="flex gap-2">
                    {colors.map((color, idx) => (
                        <div key={idx} className="flex flex-col gap-1 w-full">
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => handleColorChange(idx, e.target.value)}
                                className="w-full h-8 rounded cursor-pointer"
                            />
                            <span className="text-[10px] text-slate-400 text-center uppercase">{color}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Logo Upload */}
            <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Logo</label>
                <div className="flex items-center gap-3">
                    {kit.logo ? (
                        <div className="w-12 h-12 relative group rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                            <img src={kit.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                            <button
                                onClick={() => onUpdate({ logo: null })}
                                className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-12 h-12 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-slate-50 transition-colors"
                        >
                            <Upload size={16} className="text-slate-400" />
                        </button>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                    />
                    <div className="flex flex-col">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm font-medium text-slate-600 hover:text-indigo-600 text-left"
                        >
                            {kit.logo ? 'Change Logo' : 'Upload Logo'}
                        </button>
                        <span className="text-xs text-slate-400">
                            PNG or SVG recommended
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandForm;
