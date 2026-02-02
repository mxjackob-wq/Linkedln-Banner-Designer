import React from 'react';
import KitManager from '../../KitManager';

const BrandPanel = ({ onApplyBrandKit }) => {
    return (
        <div className="p-4 space-y-6">
            <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-800">Saved Kits</h2>
                <p className="text-sm text-slate-500">Manage brand assets and personal details</p>
            </div>
            <KitManager onApply={onApplyBrandKit} />
        </div>
    );
};

export default BrandPanel;
