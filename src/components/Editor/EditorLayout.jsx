import React, { useState } from 'react';
import LeftSidebar from './LeftSidebar';
import TopToolbar from './TopToolbar';
import RightPanel from './RightPanel';
import BottomToolbar from './BottomToolbar';
import CanvasWorkspace from './CanvasWorkspace';

// Sidebar Panels
import DesignPanel from './Sidebar/DesignPanel';
import ElementsPanel from './Sidebar/ElementsPanel';
import TextPanel from './Sidebar/TextPanel';
import BrandPanel from './Sidebar/BrandPanel';
import UploadsPanel from './Sidebar/UploadsPanel';
import LayersPanel from './Sidebar/LayersPanel';

import { templates } from '../../data/templates';

const EditorLayout = ({
    selectedProfession,
    activeTemplate,
    setActiveTemplate,
    textConfig,
    setTextConfig,
    bgImage,
    setBgImage,
    overlayOpacity,
    setOverlayOpacity,
    customPalette,
    setCustomPalette,
    customLogo,
    setCustomLogo,
    badges,
    setBadges,
    faceConfig,
    setFaceConfig,
    onBack,
    onDownload,
    handleCritique,
    taglines,
    onApplyKit
}) => {
    const [activeTab, setActiveTab] = useState('design');
    const [fileName, setFileName] = useState('My Untitled LinkedIn banner');
    const [zoom, setZoom] = useState(67);

    // New Generic Elements State (Text, Shapes, etc.)
    const [elements, setElements] = useState([]);
    const [selectedElementIds, setSelectedElementIds] = useState([]);

    // Grid System State
    const [showGrid, setShowGrid] = useState(false);
    const [snapToGrid, setSnapToGrid] = useState(false);

    // Delete Key Listener
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementIds.length > 0) {
                // Prevent deletion if user is typing in an input/textarea
                const tagName = document.activeElement?.tagName?.toLowerCase();
                if (tagName === 'input' || tagName === 'textarea' || document.activeElement?.isContentEditable) {
                    return;
                }

                handleDeleteSelectedElements();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedElementIds]);

    // Selection Helpers
    const handleSelectElement = (id, shiftKey = false) => {
        if (id === null) {
            setSelectedElementIds([]);
            return;
        }

        if (shiftKey) {
            // Toggle selection
            setSelectedElementIds(prev =>
                prev.includes(id)
                    ? prev.filter(eid => eid !== id)
                    : [...prev, id]
            );
        } else {
            // Replace selection
            setSelectedElementIds([id]);
        }
    };

    // Element Helpers
    const handleAddElement = (element) => {
        const newElement = {
            id: Date.now().toString(),
            x: 100,
            y: 100,
            rotation: 0,
            scale: 1,
            zIndex: elements.length + 1,
            ...element
        };
        setElements(prev => [...prev, newElement]);
        setSelectedElementIds([newElement.id]);
    };

    const handleUpdateElement = (id, updates) => {
        setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
    };

    const handleDeleteElement = (id) => {
        setElements(prev => prev.filter(el => el.id !== id));
        setSelectedElementIds(prev => prev.filter(eid => eid !== id));
    };

    const handleDeleteSelectedElements = () => {
        setElements(prev => prev.filter(el => !selectedElementIds.includes(el.id)));
        setSelectedElementIds([]);
    };

    // Grouping Helpers
    const handleGroupElements = () => {
        if (selectedElementIds.length < 2) return;

        // Get selected elements (full copies)
        const selectedEls = elements.filter(el => selectedElementIds.includes(el.id));

        // Calculate bounding box
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        selectedEls.forEach(el => {
            const w = el.width || 100;
            const h = el.height || 100;
            minX = Math.min(minX, el.x);
            minY = Math.min(minY, el.y);
            maxX = Math.max(maxX, el.x + w);
            maxY = Math.max(maxY, el.y + h);
        });

        // Create group element with full copies of children
        const groupId = `group-${Date.now()}`;
        const group = {
            id: groupId,
            type: 'group',
            name: `Group ${elements.filter(el => el.type === 'group').length + 1}`,
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
            rotation: 0,
            scale: 1,
            // Store full element copies with relative positions for ungrouping
            childElements: selectedEls.map(el => ({
                ...el,
                relX: el.x - minX,
                relY: el.y - minY
            }))
        };

        // Remove selected elements and add group
        setElements(prev => [
            ...prev.filter(el => !selectedElementIds.includes(el.id)),
            group
        ]);
        setSelectedElementIds([groupId]);
    };

    const handleUngroupElements = () => {
        if (selectedElementIds.length !== 1) return;

        const groupId = selectedElementIds[0];
        const group = elements.find(el => el.id === groupId);

        if (!group || group.type !== 'group' || !group.childElements) return;

        // Restore children with their absolute positions (group position + relative position)
        const restoredChildren = group.childElements.map(child => ({
            ...child,
            x: group.x + child.relX,
            y: group.y + child.relY,
            relX: undefined,
            relY: undefined
        }));

        // Remove group and add restored children
        setElements(prev => [
            ...prev.filter(el => el.id !== groupId),
            ...restoredChildren
        ]);
        setSelectedElementIds(restoredChildren.map(el => el.id));
    };

    // Layer ordering functions
    const handleBringToFront = (id) => {
        setElements(prev => {
            const index = prev.findIndex(el => el.id === id);
            if (index === -1 || index === prev.length - 1) return prev;
            const newElements = [...prev];
            const [element] = newElements.splice(index, 1);
            newElements.push(element);
            return newElements;
        });
    };

    const handleSendToBack = (id) => {
        setElements(prev => {
            const index = prev.findIndex(el => el.id === id);
            if (index === -1 || index === 0) return prev;
            const newElements = [...prev];
            const [element] = newElements.splice(index, 1);
            newElements.unshift(element);
            return newElements;
        });
    };

    const handleMoveForward = (id) => {
        setElements(prev => {
            const index = prev.findIndex(el => el.id === id);
            if (index === -1 || index === prev.length - 1) return prev;
            const newElements = [...prev];
            [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
            return newElements;
        });
    };

    const handleMoveBackward = (id) => {
        setElements(prev => {
            const index = prev.findIndex(el => el.id === id);
            if (index === -1 || index === 0) return prev;
            const newElements = [...prev];
            [newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]];
            return newElements;
        });
    };

    const handleUpdateBadgePos = (id, x, y) => {
        setBadges(prev => prev.map(b => b.id === id ? { ...b, x, y } : b));
    };



    const handleRegenerateBg = () => {
        // ... existing logic placeholder
    };

    const renderSidebarContent = () => {
        switch (activeTab) {
            case 'design':
                return (
                    <DesignPanel
                        templates={templates}
                        activeTemplate={activeTemplate}
                        setActiveTemplate={setActiveTemplate}
                        selectedProfession={selectedProfession}
                        onApplyPalette={setCustomPalette}
                    />
                );
            case 'elements':
                return (
                    <ElementsPanel
                        onAddElement={handleAddElement}
                    />
                );
            case 'layers':
                return (
                    <LayersPanel
                        elements={elements}
                        setElements={setElements}
                        selectedElementIds={selectedElementIds}
                        onSelectElement={handleSelectElement}
                        onGroupElements={handleGroupElements}
                        onUngroupElements={handleUngroupElements}
                        onDeleteSelected={handleDeleteSelectedElements}
                    />
                );
            case 'text':
                return (
                    <TextPanel
                        textConfig={textConfig}
                        setTextConfig={setTextConfig}
                        taglines={taglines}
                        onAddElement={handleAddElement}
                    />
                );
            case 'brand':
                return (
                    <BrandPanel
                        onApplyBrandKit={onApplyKit}
                    />
                );
            case 'uploads':
                return (
                    <UploadsPanel
                        faceConfig={faceConfig}
                        setFaceConfig={setFaceConfig}
                        bgImage={bgImage}
                        setBgImage={setBgImage}
                        overlayOpacity={overlayOpacity}
                        setOverlayOpacity={setOverlayOpacity}
                        selectedProfession={selectedProfession}
                    />
                );
            default:
                return <div className="p-4">Select a tab</div>;
        }
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-100">
            <TopToolbar
                fileName={fileName}
                onFileNameChange={setFileName}
                onBack={onBack}
                onDownload={onDownload}
            />

            <div className="flex flex-1 overflow-hidden">
                <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab}>
                    {renderSidebarContent()}
                </LeftSidebar>

                <main className="flex-1 flex flex-col relative min-w-0">
                    <CanvasWorkspace
                        zoom={zoom}
                        profession={selectedProfession}
                        template={activeTemplate}
                        customText={textConfig}
                        imageUrl={bgImage}
                        overlayOpacity={overlayOpacity}
                        customPalette={customPalette}
                        customLogo={customLogo}
                        badges={badges}
                        onUpdateBadgePosition={handleUpdateBadgePos}
                        faceConfig={faceConfig}
                        onUpdateFaceConfig={setFaceConfig}

                        // New Props
                        elements={elements}
                        selectedElementIds={selectedElementIds}
                        onSelectElement={handleSelectElement}
                        onUpdateElement={handleUpdateElement}

                        // Grid Props
                        showGrid={showGrid}
                        snapToGrid={snapToGrid}
                    />
                    <BottomToolbar
                        zoom={zoom}
                        setZoom={setZoom}
                        showGrid={showGrid}
                        setShowGrid={setShowGrid}
                        snapToGrid={snapToGrid}
                        setSnapToGrid={setSnapToGrid}
                    />
                </main>

                <RightPanel
                    selectedElement={selectedElementIds.length === 1 ? elements.find(el => el.id === selectedElementIds[0]) : null}
                    selectedCount={selectedElementIds.length}
                    onUpdateElement={(updates) => selectedElementIds.length === 1 && handleUpdateElement(selectedElementIds[0], updates)}
                    onDeleteElement={handleDeleteSelectedElements}
                    onBringToFront={() => selectedElementIds.length === 1 && handleBringToFront(selectedElementIds[0])}
                    onSendToBack={() => selectedElementIds.length === 1 && handleSendToBack(selectedElementIds[0])}
                    onMoveForward={() => selectedElementIds.length === 1 && handleMoveForward(selectedElementIds[0])}
                    onMoveBackward={() => selectedElementIds.length === 1 && handleMoveBackward(selectedElementIds[0])}
                    onGroupElements={handleGroupElements}
                    onUngroupElements={handleUngroupElements}
                />
            </div>
        </div>
    );
};

export default EditorLayout;
