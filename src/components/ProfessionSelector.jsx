import React, { useState } from 'react';
import {
    Palette, Code, TrendingUp, BookOpen, Briefcase,
    Film, Camera, Home, DollarSign, Heart, Zap, Book,
    Search, Plus
} from 'lucide-react';
import { professions } from '../data/professions';

const iconMap = {
    'palette': Palette,
    'code': Code,
    'trending-up': TrendingUp,
    'book-open': BookOpen,
    'briefcase': Briefcase,
    'film': Film,
    'camera': Camera,
    'home': Home,
    'dollar-sign': DollarSign,
    'heart': Heart,
    'zap': Zap,
    'book': Book
};

const ProfessionSelector = ({ onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = ['All', ...new Set(professions.map(p => p.category))];

    const filteredProfessions = professions.filter(p => {
        const matchesSearch = p.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="w-full max-w-6xl mx-auto p-6">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-800 mb-3">What's your profession?</h2>
                <p className="text-slate-500 text-lg">Select your field to generate a tailored LinkedIn banner</p>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center">
                <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap
                ${activeCategory === category
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search professions..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {/* Blank Design Option */}
                <button
                    onClick={() => onSelect({
                        id: 'blank',
                        label: 'Blank Design',
                        keywords: [],
                        category: 'General',
                        colorPalette: ['#000000', '#000000', '#ffffff'], // White background
                        defaultTagline: '',
                        icon: 'file-plus'
                    })}
                    className="group flex flex-col items-center p-6 bg-white rounded-xl border-2 border-dashed border-blue-300 hover:border-blue-600 hover:bg-blue-50 transition-all duration-200 text-left cursor-pointer"
                >
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                        <Plus size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Start from Scratch</h3>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Blank Canvas</span>
                    <p className="text-sm text-slate-400 text-center">Design entirely from a blank slate</p>
                </button>

                {filteredProfessions.map(profession => {
                    const Icon = iconMap[profession.icon] || Briefcase;
                    return (
                        <button
                            key={profession.id}
                            onClick={() => onSelect(profession)}
                            className="group flex flex-col items-center p-6 bg-white rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all duration-200 text-left"
                        >
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                                style={{ backgroundColor: `${profession.colorPalette[1]}20`, color: profession.colorPalette[1] }}
                            >
                                <Icon size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-1">{profession.label}</h3>
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{profession.category}</span>
                            <p className="text-sm text-slate-400 text-center line-clamp-2">{profession.defaultTagline}</p>
                        </button>
                    );
                })}

                {/* Custom Option */}
                <button
                    onClick={() => onSelect({ id: 'custom', label: 'Custom Profession', category: 'General', colorPalette: ['#333', '#666', '#999'], defaultTagline: 'My Professional Tagline' })}
                    className="group flex flex-col items-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 hover:border-blue-500 hover:bg-white transition-all duration-200"
                >
                    <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mb-4 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        <Plus size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Other</h3>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Custom</span>
                    <p className="text-sm text-slate-400 text-center">Create for a different role</p>
                </button>
            </div>
        </div>
    );
};

export default ProfessionSelector;
