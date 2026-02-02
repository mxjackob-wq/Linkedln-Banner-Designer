import React, { useState, useEffect } from 'react';
import { Briefcase, User, Plus, Trash2, Edit2, CheckCircle, Save, ArrowLeft } from 'lucide-react';
import { saveKits, getKits } from '../utils/storageService';
import BrandForm from './Kits/BrandForm';
import PersonForm from './Kits/PersonForm';

const KitManager = ({ onApply }) => {
    const [kits, setKits] = useState([]);
    const [editingKit, setEditingKit] = useState(null); // The kit currently being edited (or new)
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setKits(getKits());
    }, []);

    const handleSaveKit = () => {
        if (!editingKit) return;

        let updatedKits;
        const existingIndex = kits.findIndex(k => k.id === editingKit.id);

        if (existingIndex >= 0) {
            updatedKits = [...kits];
            updatedKits[existingIndex] = editingKit;
        } else {
            updatedKits = [...kits, editingKit];
        }

        setKits(updatedKits);
        saveKits(updatedKits);
        setEditingKit(null); // Exit edit mode
    };

    const handleDeleteKit = (id, e) => {
        e.stopPropagation();
        const updatedKits = kits.filter(k => k.id !== id);
        setKits(updatedKits);
        saveKits(updatedKits);
        if (editingKit && editingKit.id === id) {
            setEditingKit(null);
        }
    };

    const handleStartNewKit = (type) => {
        setEditingKit({
            id: Date.now(),
            type,
            name: '',
            colors: ['#000000', '#ffffff', '#808080'], // Default for Brand
            font: 'Inter'
        });
        setIsSaved(false);
    };

    const handleUpdateEditingKit = (updates) => {
        setEditingKit(prev => ({ ...prev, ...updates }));
        setIsSaved(false);
    };

    // Render the List View
    if (!editingKit) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">Saved Kits</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleStartNewKit('brand')}
                            className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                            title="New Brand Kit"
                        >
                            <Plus size={16} /> <span className="text-xs font-medium ml-1">Brand</span>
                        </button>
                        <button
                            onClick={() => handleStartNewKit('person')}
                            className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                            title="New Person Kit"
                        >
                            <Plus size={16} /> <span className="text-xs font-medium ml-1">Person</span>
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    {kits.length === 0 && (
                        <p className="text-sm text-slate-400 text-center py-4">No saved kits yet.</p>
                    )}

                    {kits.map(kit => (
                        <div
                            key={kit.id}
                            className="group border border-slate-100 rounded-lg p-3 hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer relative"
                            onClick={() => setEditingKit(kit)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${kit.type === 'brand' ? 'bg-indigo-50 text-indigo-600' : 'bg-purple-50 text-purple-600'}`}>
                                        {kit.type === 'brand' ? <Briefcase size={20} /> : <User size={20} />}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-800">{kit.name || 'Untitled Kit'}</h4>
                                        <p className="text-xs text-slate-500 capitalize">{kit.type} Kit</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => onApply(kit)}
                                        className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-md"
                                        title="Apply to Design"
                                    >
                                        <CheckCircle size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteKit(kit.id, e)}
                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Render Editor View
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
                <button
                    onClick={() => setEditingKit(null)}
                    className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} className="text-slate-500" />
                </button>
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    {editingKit.type === 'brand' ? <Briefcase className="text-indigo-600" size={20} /> : <User className="text-purple-600" size={20} />}
                    {editingKit.id ? 'Edit Kit' : 'New Kit'}
                </h3>
            </div>

            {editingKit.type === 'brand' ? (
                <BrandForm kit={editingKit} onUpdate={handleUpdateEditingKit} />
            ) : (
                <PersonForm kit={editingKit} onUpdate={handleUpdateEditingKit} />
            )}

            <div className="flex gap-2 pt-4 mt-4 border-t border-slate-100">
                <button
                    onClick={handleSaveKit}
                    className="flex-1 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                    <Save size={16} /> Save Kit
                </button>
                <button
                    onClick={() => onApply(editingKit)}
                    className="flex-1 py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                >
                    Apply Now
                </button>
            </div>

        </div>
    );
};

export default KitManager;
