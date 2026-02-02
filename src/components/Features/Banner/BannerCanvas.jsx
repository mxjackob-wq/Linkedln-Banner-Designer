import React, { useEffect, useRef, useState } from 'react';
import { User, Mail, Globe, MapPin, BadgeCheck, Award, Star, Zap, ThumbsUp, Heart, Briefcase } from 'lucide-react';

// Icon Map for Badges
const ICON_MAP = {
    'verified': BadgeCheck,
    'award': Award,
    'star': Star,
    'zap': Zap,
    'thumbsup': ThumbsUp,
    'heart': Heart,
    'global': Globe,
    'pro': Briefcase
};

const BannerCanvas = ({
    profession,
    template,
    customText,
    imageUrl,
    overlayOpacity = 0.5,
    customPalette,
    customLogo,
    badges = [], // Array of { id, type, x, y, scale }
    onUpdateBadgePosition, // Callback to update parent state
    faceConfig, // { image, x, y, scale, flip }
    onUpdateFaceConfig,
    // New Props
    elements = [],
    selectedElementId,
    onSelectElement,
    onUpdateElement
}) => {
    const canvasRef = useRef(null);

    // Drag State
    const [draggingItem, setDraggingItem] = useState(null); // { type: 'badge' | 'face' | 'element', id: string | null }
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    // { x, y, w, h }

    // Constants
    const WIDTH = 1584;
    const HEIGHT = 396;

    // Use custom palette if available, otherwise fall back to profession defaults
    const colors = customPalette || (profession ? profession.colorPalette : ['#4f46e5', '#3b82f6', '#f0f0f0']);

    // Image Loading State
    const [loadedImage, setLoadedImage] = useState(null);

    // Load Image Effect (Runs only when URL changes)
    useEffect(() => {
        if (!imageUrl) {
            setLoadedImage(null);
            return;
        }

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageUrl;
        img.onload = () => {
            setLoadedImage(img);
        };
        img.onerror = () => {
            setLoadedImage(null);
        };
    }, [imageUrl]);

    // Helper refs to avoid dependency loops if inside effect
    const drawTemplateRef = useRef(null);
    const drawTextRef = useRef(null);

    // Update refs with current functions
    useEffect(() => {
        drawTemplateRef.current = drawTemplate;
        drawTextRef.current = drawText;
    }); // Always update

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // ... (rest of drawing logic)

        // Use refs or local functions inside


        // Clear canvas
        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        const drawContent = () => {
            // 1. Draw Background
            if (loadedImage) {
                // Draw pre-loaded image
                const img = loadedImage;
                const scale = Math.max(WIDTH / img.width, HEIGHT / img.height);
                const x = (WIDTH / 2) - (img.width / 2) * scale;
                const y = (HEIGHT / 2) - (img.height / 2) * scale;
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

                // Overlay & Content
                applyOverlay();
                drawTemplateData();
                drawLogoAndText();
                drawFace();
                drawBadges();
                drawElements();
            } else {
                fillBackground();
                drawTemplateData();
                drawLogoAndText();
                drawFace();
                drawBadges();
                drawElements();
            }
        };

        const fillBackground = () => {
            ctx.fillStyle = colors[2] || '#f0f0f0';
            ctx.fillRect(0, 0, WIDTH, HEIGHT);
        };

        const applyOverlay = () => {
            ctx.fillStyle = `rgba(0, 0, 0, ${overlayOpacity})`;
            ctx.fillRect(0, 0, WIDTH, HEIGHT);
        };

        const drawTemplateData = () => {
            if (template && profession) {
                // Call the hoisted/ref function
                drawTemplateRef.current(ctx, template, colors);
            }
        };

        const drawTextData = () => {
            drawTextRef.current(ctx, profession, customText, template);
        };

        const drawLogoAndText = () => {
            // ... existing logo logic ...
            if (customLogo) {
                const logo = new Image();
                logo.src = customLogo;
                logo.onload = () => {
                    // Position logo top right
                    const logoSize = 64;
                    const padding = 32;
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(WIDTH - padding - logoSize / 2, padding + logoSize / 2, logoSize / 2, 0, Math.PI * 2, true);
                    ctx.closePath();
                    ctx.clip();
                    ctx.drawImage(logo, WIDTH - padding - logoSize, padding, logoSize, logoSize);
                    ctx.restore();
                    drawTextData();
                };
                logo.onerror = () => {
                    drawTextData();
                }
            } else {
                drawTextData();
            }
        };

        const drawFace = () => {
            if (faceConfig && faceConfig.image) {
                const img = new Image();
                img.src = faceConfig.image;
                img.onload = () => {
                    ctx.save();

                    // Apply Cinematic Filters (simulated 8k enhance)
                    if (faceConfig.filters) {
                        const { contrast = 1, saturation = 1, brightness = 1 } = faceConfig.filters;
                        ctx.filter = `contrast(${contrast}) saturate(${saturation}) brightness(${brightness})`;
                    }

                    // Transform
                    const w = img.width * (faceConfig.scale || 1);
                    const h = img.height * (faceConfig.scale || 1);
                    const x = faceConfig.x || 1000;
                    const y = faceConfig.y || 100;

                    // Update rect for hit testing (deferred to avoid loop, using callback ref pattern or just mutable ref if strict mode triggers loops)
                    // For now, setting state in render loop is bad. 
                    // Better to calculate on drag start, OR use a ref for the rect.
                    // But we can't easily get dimensions outside onload.
                    // Let's store in a ref that persists across renders but doesn't trigger them.
                    faceRectRef.current = { x, y, w, h };

                    ctx.translate(x + w / 2, y + h / 2); // Move to center of image
                    ctx.scale(faceConfig.flip || 1, 1); // Apply Flip
                    ctx.drawImage(img, -w / 2, -h / 2, w, h); // Draw centered

                    ctx.restore();
                };
            } else {
                faceRectRef.current = null;
            }
        };

        const drawBadges = () => {
            // ... existing
            badges.forEach(badge => {
                const Icon = ICON_MAP[badge.type];
                ctx.save();
                ctx.translate(badge.x, badge.y);
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = 'rgba(0,0,0,0.2)';
                ctx.shadowBlur = 5;
                ctx.beginPath();
                ctx.arc(0, 0, 24, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = colors[0] || '#000';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = 'bold 20px Inter, sans-serif';
                let char = '?';
                if (badge.type === 'verified') char = '✓';
                if (badge.type === 'award') char = '🏆';
                if (badge.type === 'star') char = '★';
                if (badge.type === 'zap') char = '⚡';
                if (badge.type === 'thumbsup') char = '👍';
                if (badge.type === 'heart') char = '❤';
                if (badge.type === 'global') char = '🌎';
                if (badge.type === 'pro') char = '💼';
                ctx.fillText(char, 0, 2);
                ctx.restore();
            });
        };

        // NEW: Draw Generic Elements
        const drawElements = () => {
            elements.forEach(el => {
                ctx.save();
                ctx.translate(el.x, el.y);
                ctx.rotate((el.rotation || 0) * Math.PI / 180);
                ctx.scale(el.scale || 1, el.scale || 1);

                if (el.selected || el.id === selectedElementId) {
                    // Draw selection border
                    ctx.strokeStyle = '#2563eb';
                    ctx.lineWidth = 2;
                    // Bounding box approximation need to be based on element type
                }

                if (el.type === 'text') {
                    ctx.font = `${el.fontWeight || 'normal'} ${el.fontSize || 24}px "${el.fontFamily || 'Inter'}", sans-serif`;
                    ctx.fillStyle = el.color || '#000000';
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'top';
                    ctx.fillText(el.text, 0, 0);

                    // Selection Box for Text
                    if (el.id === selectedElementId) {
                        const metrics = ctx.measureText(el.text);
                        ctx.strokeRect(-5, -5, metrics.width + 10, (el.fontSize || 24) + 10);
                    }
                } else if (el.type === 'rect') {
                    ctx.fillStyle = el.fill || '#e2e8f0';
                    ctx.fillRect(0, 0, el.width || 100, el.height || 100);
                    if (el.id === selectedElementId) ctx.strokeRect(-2, -2, (el.width || 100) + 4, (el.height || 100) + 4);
                } else if (el.type === 'circle') {
                    ctx.fillStyle = el.fill || '#e2e8f0';
                    ctx.beginPath();
                    ctx.arc(50, 50, 50, 0, Math.PI * 2);
                    ctx.fill();
                    if (el.id === selectedElementId) {
                        ctx.strokeStyle = '#2563eb';
                        ctx.stroke();
                    }
                } else if (el.type === 'line') {
                    ctx.strokeStyle = el.stroke || '#000';
                    ctx.lineWidth = el.strokeWidth || 4;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(el.width || 100, 0);
                    ctx.stroke();
                    if (el.id === selectedElementId) ctx.strokeRect(-5, -5, (el.width || 100) + 10, 10);
                } else if (el.type === 'polygon' && el.points && el.points.length > 0) {
                    ctx.fillStyle = el.fill || '#e2e8f0';
                    ctx.beginPath();
                    ctx.moveTo(el.points[0].x, el.points[0].y);
                    for (let i = 1; i < el.points.length; i++) {
                        ctx.lineTo(el.points[i].x, el.points[i].y);
                    }
                    ctx.closePath();
                    ctx.fill();

                    if (el.stroke) {
                        ctx.strokeStyle = el.stroke;
                        ctx.lineWidth = el.strokeWidth || 2;
                        ctx.stroke();
                    }

                    if (el.selected || el.id === selectedElementId) {
                        ctx.strokeStyle = '#2563eb';
                        ctx.lineWidth = 1;
                        ctx.stroke();

                        // Draw vertex handles
                        ctx.fillStyle = '#2563eb';
                        el.points.forEach(p => {
                            ctx.beginPath();
                            ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
                            ctx.fill();
                        });
                    }
                }

                ctx.restore();
            });
        };

        drawContent();

    }, [profession, template, customText, loadedImage, overlayOpacity, customPalette, customLogo, badges, faceConfig, elements, selectedElementId, colors]);

    // Use ref for rect to avoid re-render loops
    const faceRectRef = useRef(null);

    // Mouse Event Handlers for Dragging
    const getMousePos = (evt) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (evt.clientX - rect.left) * scaleX,
            y: (evt.clientY - rect.top) * scaleY
        };
    };

    const handleMouseDown = (e) => {
        const pos = getMousePos(e);
        let clickedAny = false;

        // 0. Check New Elements (Topmost)
        // Reverse iterate to click top items first
        for (let i = elements.length - 1; i >= 0; i--) {
            const el = elements[i];
            // Simple hit detection (bounding boxes)
            let hit = false;
            if (el.type === 'text') {
                // Approx text hit
                if (pos.x >= el.x && pos.x <= el.x + 200 && pos.y >= el.y && pos.y <= el.y + 50) hit = true;
            } else if (el.type === 'rect') {
                if (pos.x >= el.x && pos.x <= el.x + (el.width || 100) && pos.y >= el.y && pos.y <= el.y + (el.height || 100)) hit = true;
            } else {
                if (pos.x >= el.x && pos.x <= el.x + 100 && pos.y >= el.y && pos.y <= el.y + 100) hit = true;
            }

            // Polygon Hit Test (Vertex & Body)
            if (el.type === 'polygon' && (el.selected || el.id === selectedElementId)) {
                // 1. Check Vertex Click
                for (let j = 0; j < el.points.length; j++) {
                    const p = el.points[j];
                    const dist = Math.sqrt(Math.pow(pos.x - (el.x + p.x), 2) + Math.pow(pos.y - (el.y + p.y), 2));
                    if (dist < 10) { // Hit radius for vertex
                        setDraggingItem({ type: 'vertex', id: el.id, pointIndex: j });
                        setDragOffset({ x: 0, y: 0 }); // offset not needed for vertex direct set
                        if (onSelectElement) onSelectElement(el.id);
                        clickedAny = true;
                        return;
                    }
                }
            }

            if (el.type === 'polygon') {
                // Ray casting for polygon body hit test
                // const polyPoints = el.points.map(p => ({ x: el.x + p.x, y: el.y + p.y }));
                // Simplified: Bounding box for now, actual raycast is expensive in loop if many points
                // Better: Check bounding box first
                const minX = Math.min(...el.points.map(p => p.x)) + el.x;
                const maxX = Math.max(...el.points.map(p => p.x)) + el.x;
                const minY = Math.min(...el.points.map(p => p.y)) + el.y;
                const maxY = Math.max(...el.points.map(p => p.y)) + el.y;

                if (pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY) {
                    // Refined check: ray casting could go here if needed
                    hit = true;
                } else {
                    hit = false;
                }
            }

            if (hit) {
                setDraggingItem({ type: 'element', id: el.id });
                setDragOffset({ x: pos.x - el.x, y: pos.y - el.y });
                if (onSelectElement) onSelectElement(el.id);
                clickedAny = true;
                return;
            }
        }

        if (clickedAny) return;

        // If we didn't click an element, check other items BEFORE deselecting
        let clickedOther = false;


        // 1. Check Badges collision (reverse order)
        for (let i = badges.length - 1; i >= 0; i--) {
            const b = badges[i];
            const dist = Math.sqrt(Math.pow(pos.x - b.x, 2) + Math.pow(pos.y - b.y, 2));
            if (dist < 30) {
                setDraggingItem({ type: 'badge', id: b.id });
                setDragOffset({ x: pos.x - b.x, y: pos.y - b.y });
                clickedOther = true;
                return;
            }
        }

        if (faceRectRef.current) {
            const { x, y, w, h } = faceRectRef.current;
            if (pos.x >= x && pos.x <= x + w && pos.y >= y && pos.y <= y + h) {
                setDraggingItem({ type: 'face' });
                setDragOffset({ x: pos.x - x, y: pos.y - y });
                clickedOther = true;
                return;
            }
        }

        // Only deselect if we haven't clicked *any* interactive item
        if (!clickedAny && !clickedOther && onSelectElement) {
            onSelectElement(null);
        }
    };

    const handleMouseMove = (e) => {
        const pos = getMousePos(e);

        // Cursor logic
        let hover = false;
        // Check face hover
        if (faceRectRef.current) {
            const { x, y, w, h } = faceRectRef.current;
            if (pos.x >= x && pos.x <= x + w && pos.y >= y && pos.y <= y + h) hover = true;
        }
        // Check badge hover
        for (let b of badges) {
            const dist = Math.sqrt(Math.pow(pos.x - b.x, 2) + Math.pow(pos.y - b.y, 2));
            if (dist < 30) hover = true;
        }
        // Check element hover
        for (let el of elements) {
            if (pos.x >= el.x && pos.x <= el.x + 100 && pos.y >= el.y && pos.y <= el.y + 50) hover = true;
        }


        if (canvasRef.current) {
            canvasRef.current.style.cursor = draggingItem ? 'grabbing' : (hover ? 'move' : 'default');
        }


        if (!draggingItem) return;

        if (draggingItem.type === 'badge' && onUpdateBadgePosition) {
            onUpdateBadgePosition(draggingItem.id, pos.x - dragOffset.x, pos.y - dragOffset.y);
        } else if (draggingItem.type === 'face' && onUpdateFaceConfig) {
            onUpdateFaceConfig({ ...faceConfig, x: pos.x - dragOffset.x, y: pos.y - dragOffset.y });
        } else if (draggingItem.type === 'element' && onUpdateElement) {
            onUpdateElement(draggingItem.id, { x: pos.x - dragOffset.x, y: pos.y - dragOffset.y });
        } else if (draggingItem.type === 'vertex' && onUpdateElement) {
            // Find element
            const el = elements.find(e => e.id === draggingItem.id);
            if (el) {
                // Update specific point
                // Local coordinate = (MousePos - ElementPos) - Rotation... NO rotation support for vertex editing yet simplicity
                // We need to update the point in the existing array
                const newPoints = [...el.points];
                const pIndex = draggingItem.pointIndex;
                // Calculate local relative to shape origin
                newPoints[pIndex] = {
                    x: pos.x - el.x,
                    y: pos.y - el.y
                };
                onUpdateElement(draggingItem.id, { points: newPoints });
            }
        }
    };

    const handleMouseUp = () => {
        setDraggingItem(null);
    };

    // Helper functions (Moved up for scope access)
    const drawTemplate = (ctx, template, palette) => {
        // Based on src/data/templates.js
        if (template.style === 'modern') {
            ctx.fillStyle = palette[0];
            ctx.globalAlpha = 0.9;
            ctx.beginPath();
            ctx.moveTo(WIDTH * 0.4, 0);
            ctx.lineTo(WIDTH * 0.5, HEIGHT);
            ctx.lineTo(0, HEIGHT);
            ctx.lineTo(0, 0);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        } else if (template.style === 'bold') {
            ctx.fillStyle = palette[0];
            ctx.fillRect(0, HEIGHT * 0.75, WIDTH, HEIGHT * 0.25);
        } else if (template.style === 'clean') {
            const gradient = ctx.createLinearGradient(0, 0, WIDTH * 0.5, 0);
            gradient.addColorStop(0, palette[0]);
            gradient.addColorStop(1, "transparent");
            ctx.fillStyle = gradient;
            ctx.globalAlpha = 0.8;
            ctx.fillRect(0, 0, WIDTH, HEIGHT);
            ctx.globalAlpha = 1.0;
        } else if (template.style === 'minimal') {
            ctx.fillStyle = palette[0];
            ctx.fillRect(WIDTH - 20, 0, 20, HEIGHT);
        } else if (template.style === 'grid') {
            ctx.fillStyle = palette[1];
            ctx.globalAlpha = 0.2;
            ctx.fillRect(WIDTH / 3, 0, 2, HEIGHT);
            ctx.fillRect(2 * WIDTH / 3, 0, 2, HEIGHT);
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = palette[0];
            ctx.globalAlpha = 0.9;
            ctx.fillRect(0, HEIGHT - 80, WIDTH, 80);
            ctx.globalAlpha = 1.0;
        }
    };

    const drawText = (ctx, profession, customText, template) => {
        const layout = template?.layout || { textPosition: 'left' };
        let x = 50;
        let align = 'left';
        let yoffset = 0;

        if (layout.textPosition === 'center' || layout.textPosition === 'center-big') {
            x = WIDTH / 2;
            align = 'center';
            if (template.style === 'clean') yoffset = -20;
        } else if (layout.textPosition === 'right') {
            x = WIDTH - 50;
            align = 'right';
        } else if (layout.textPosition === 'overlay-bottom') {
            x = WIDTH / 2;
            align = 'center';
            yoffset = HEIGHT / 2 - 40;
        }

        ctx.textAlign = align;
        ctx.textBaseline = 'middle';
        ctx.fillStyle = customText?.color || '#ffffff';
        const fontSize = template.style === 'bold' ? 100 : 64;
        ctx.font = `bold ${fontSize}px "${customText?.font || 'Inter'}", sans-serif`;
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 4;

        const titleText = customText?.title || profession?.label || 'Your Profession';
        ctx.fillText(titleText, x, 140 + yoffset);

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#f0f0f0';
        ctx.font = `32px "${customText?.font || 'Inter'}", sans-serif`;
        const taglineText = customText?.tagline || profession?.defaultTagline || 'Your Tagline Here';
        ctx.fillText(taglineText, x, 210 + yoffset);

        if (template.style !== 'minimal') {
            ctx.font = `20px "${customText?.font || 'Inter'}", sans-serif`;
            ctx.fillStyle = '#cbd5e1';
            ctx.fillText("www.linkedin.com/in/yourname", x, 260 + yoffset);
        }
    };

    return (
        <div className="w-full overflow-hidden rounded-lg shadow-lg border border-slate-200 bg-white">
            {/* Canvas scales with width, h-auto maintains aspect ratio */}
            <canvas
                ref={canvasRef}
                id="banner-canvas"
                width={WIDTH}
                height={HEIGHT}
                className="w-full h-auto block cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            />
        </div>
    );
};



export default BannerCanvas;
