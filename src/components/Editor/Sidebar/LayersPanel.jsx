import React from 'react';
import { Layers, ArrowUp, ArrowDown, Trash2, Group, Ungroup, FolderOpen } from 'lucide-react';

const LayersPanel = ({
    elements,
    setElements,
    selectedElementIds = [],
    onSelectElement,
    onGroupElements,
    onUngroupElements,
    onDeleteSelected
}) => {

    const [editingId, setEditingId] = React.useState(null);
    const [tempName, setTempName] = React.useState('');

    const handleMoveUp = (e, index) => {
        e.stopPropagation();
        if (index === elements.length - 1) return;

        const newElements = [...elements];
        const temp = newElements[index];
        newElements[index] = newElements[index + 1];
        newElements[index + 1] = temp;
        setElements(newElements);
    };

    const handleMoveDown = (e, index) => {
        e.stopPropagation();
        if (index === 0) return;

        const newElements = [...elements];
        const temp = newElements[index];
        newElements[index] = newElements[index - 1];
        newElements[index - 1] = temp;
        setElements(newElements);
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        setElements(elements.filter(el => el.id !== id));
        if (selectedElementIds.includes(id)) onSelectElement(null);
    };

    const startEditing = (e, el) => {
        e.stopPropagation();
        setEditingId(el.id);
        setTempName(el.name || (el.type === 'text' ? (el.text || 'Text Layer') : el.type.charAt(0).toUpperCase() + el.type.slice(1)));
    };

    const saveName = (id) => {
        setElements(elements.map(el => el.id === id ? { ...el, name: tempName } : el));
        setEditingId(null);
    };

    const handleKeyDown = (e, id) => {
        if (e.key === 'Enter') {
            saveName(id);
        } else if (e.key === 'Escape') {
            setEditingId(null);
        }
    };

    const handleLayerClick = (e, el) => {
        if (editingId) return;
        // Pass shiftKey to enable multi-select
        onSelectElement(el.id, e.shiftKey);
    };

    // Check if a single group is selected (for ungroup button)
    const canUngroup = selectedElementIds.length === 1 &&
        elements.find(el => el.id === selectedElementIds[0])?.type === 'group';

    // We render in reverse order so top layers appear at top of list
    const reversedElements = [...elements].reverse();

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-100">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Layers size={18} />
                        Layers
                    </h3>
                    <span className="text-xs text-slate-400">{elements.length} items</span>
                </div>

                {/* Multi-select action buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={onGroupElements}
                        disabled={selectedElementIds.length < 2}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 
                            hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 
                            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-slate-200 disabled:hover:text-slate-500
                            transition-all"
                        title="Group selected elements (select 2+ items)"
                    >
                        <Group size={14} />
                        Group
                    </button>
                    <button
                        onClick={onUngroupElements}
                        disabled={!canUngroup}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 
                            hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 
                            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-slate-200 disabled:hover:text-slate-500
                            transition-all"
                        title="Ungroup selected group"
                    >
                        <Ungroup size={14} />
                        Ungroup
                    </button>
                    {selectedElementIds.length > 0 && (
                        <button
                            onClick={onDeleteSelected}
                            className="px-3 py-2 text-xs font-medium rounded-lg border border-red-200 text-red-500
                                hover:bg-red-50 hover:border-red-300 
                                transition-all"
                            title={`Delete ${selectedElementIds.length} selected`}
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>

                {/* Selection count indicator */}
                {selectedElementIds.length > 1 && (
                    <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {selectedElementIds.length} elements selected — Shift+click to toggle
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {elements.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                        No elements on canvas
                    </div>
                ) : (
                    reversedElements.map((el, revIndex) => {
                        // Calculate actual index in original array
                        const index = elements.length - 1 - revIndex;
                        const isSelected = selectedElementIds.includes(el.id);
                        const isEditing = editingId === el.id;
                        const isGroup = el.type === 'group';

                        // Determine display name
                        let displayName = el.name;
                        if (!displayName) {
                            if (el.type === 'text') {
                                displayName = el.text || 'Text Layer';
                            } else if (el.type === 'group') {
                                displayName = `Group (${el.childElements?.length || 0})`;
                            } else {
                                displayName = el.type.charAt(0).toUpperCase() + el.type.slice(1);
                            }
                        }

                        return (
                            <div
                                key={el.id}
                                onClick={(e) => handleLayerClick(e, el)}
                                className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer group
                                    ${isSelected
                                        ? 'bg-blue-50 border-blue-500 shadow-sm'
                                        : 'bg-white border-slate-200 hover:border-blue-300'}`}
                            >
                                <div className="flex items-center gap-3 overflow-hidden flex-1">
                                    <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0
                                        ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                        {isGroup ? <FolderOpen size={16} /> : <Layers size={16} />}
                                    </div>
                                    <div className="flex flex-col truncate flex-1">
                                        {isEditing ? (
                                            <input
                                                autoFocus
                                                type="text"
                                                value={tempName}
                                                onChange={(e) => setTempName(e.target.value)}
                                                onBlur={() => saveName(el.id)}
                                                onKeyDown={(e) => handleKeyDown(e, el.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-sm font-medium border border-blue-300 rounded px-1 py-0.5 outline-none w-full"
                                            />
                                        ) : (
                                            <span
                                                onDoubleClick={(e) => startEditing(e, el)}
                                                className={`text-sm font-medium truncate ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}
                                                title="Double click to rename"
                                            >
                                                {displayName}
                                            </span>
                                        )}
                                        <span className="text-[10px] text-slate-400">
                                            {el.type}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                    <button
                                        onClick={(e) => handleMoveUp(e, index)}
                                        disabled={index === elements.length - 1}
                                        className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 disabled:opacity-30"
                                        title="Bring Forward"
                                    >
                                        <ArrowUp size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => handleMoveDown(e, index)}
                                        disabled={index === 0}
                                        className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 disabled:opacity-30"
                                        title="Send Backward"
                                    >
                                        <ArrowDown size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(e, el.id)}
                                        className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500"
                                        title="Delete"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default LayersPanel;
