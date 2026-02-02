import React, { useState } from 'react';
import { Layout, Type, Image, Star, Grid, Layers } from 'lucide-react';

const SidebarTab = ({ icon: Icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center py-4 w-full transition-colors ${isActive ? 'text-blue-600 bg-white' : 'text-slate-400 hover:text-slate-200'
            }`}
    >
        <Icon size={24} />
        <span className="text-[10px] mt-1 font-medium">{label}</span>
    </button>
);

const LeftSidebar = ({ activeTab, setActiveTab, children }) => {
    return (
        <div className="flex h-full bg-slate-900 border-r border-slate-200">
            {/* Icon Navigation Column */}
            <div className="w-[72px] flex flex-col items-center py-4 border-r border-slate-800">
                <SidebarTab
                    icon={Layout}
                    label="Design"
                    isActive={activeTab === 'design'}
                    onClick={() => setActiveTab('design')}
                />
                <SidebarTab
                    icon={Grid}
                    label="Elements"
                    isActive={activeTab === 'elements'}
                    onClick={() => setActiveTab('elements')}
                />
                <SidebarTab
                    icon={Layers}
                    label="Layers"
                    isActive={activeTab === 'layers'}
                    onClick={() => setActiveTab('layers')}
                />
                <SidebarTab
                    icon={Type}
                    label="Text"
                    isActive={activeTab === 'text'}
                    onClick={() => setActiveTab('text')}
                />
                <SidebarTab
                    icon={Star}
                    label="Kits"
                    isActive={activeTab === 'brand'}
                    onClick={() => setActiveTab('brand')}
                />
                <SidebarTab
                    icon={Image}
                    label="Uploads"
                    isActive={activeTab === 'uploads'}
                    onClick={() => setActiveTab('uploads')}
                />
            </div>

            {/* Content Drawer */}
            <div className="w-80 bg-white h-full flex flex-col overflow-y-auto shadow-xl z-10 transition-all duration-300 ease-in-out"
                style={{ marginLeft: activeTab ? '0' : '-20rem' }}>
                {children}
            </div>
        </div>
    );
};

export default LeftSidebar;
