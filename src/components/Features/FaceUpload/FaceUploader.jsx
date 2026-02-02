import React, { useState, useRef, useEffect } from 'react';
import { Upload, User, Loader2, RefreshCw, Sliders, AlertCircle, X, Zap } from 'lucide-react';
import { upscaleImage } from '../../../utils/geminiUpscaler';

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const VALID_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const PROCESSING_TIMEOUT = 30000; // 30 seconds

const FaceUploader = ({ onFaceConfigChange, faceConfig }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedImage, setProcessedImage] = useState(faceConfig?.image || null);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(0);
    const [isUpscaling, setIsUpscaling] = useState(false);
    const fileInputRef = useRef(null);

    // Cleanup memory on unmount
    useEffect(() => {
        return () => {
            if (processedImage && processedImage.startsWith('blob:')) {
                URL.revokeObjectURL(processedImage);
            }
        };
    }, [processedImage]);

    const validateImage = (file) => {
        if (!VALID_TYPES.includes(file.type)) {
            throw new Error('Invalid file type. Please upload JPG, PNG, or WebP.');
        }
        if (file.size > MAX_FILE_SIZE) {
            throw new Error('File too large. Maximum size is 10MB.');
        }
        return true;
    };

    const processWithTimeout = (promise) => {
        return Promise.race([
            promise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Processing timeout. Server might be busy.')),
                    PROCESSING_TIMEOUT)
            )
        ]);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Reset state
        setError(null);
        setIsProcessing(true);
        setProgress(10); // Started

        try {
            // 1. Validation
            validateImage(file);

            // 2. Lazy Load Library (Prevents main bundle crash)
            let removeBackground;
            try {
                const module = await import("@imgly/background-removal");
                // Handle different export structures (ESM vs CJS/Webpack)
                removeBackground = module.default || module;

                if (typeof removeBackground !== 'function') {
                    console.log("imgly module exports:", Object.keys(module));
                    if (module.removeBackground) removeBackground = module.removeBackground;
                }

                if (typeof removeBackground !== 'function') {
                    throw new Error(`Library loaded but function not found. Type: ${typeof removeBackground}`);
                }

            } catch (loadError) {
                console.error("Failed to load background removal library:", loadError);
                throw new Error("Failed to load AI models. Check your connection.");
            }

            setProgress(30); // Library loaded

            // 3. Process Image
            const config = {
                progress: (key, current, total) => {
                    // Map internal progress to our 30-90 range
                    const percent = Math.round((current / total) * 60) + 30;
                    setProgress(percent);
                },
                debug: false
            };

            const blob = await processWithTimeout(removeBackground(file, config));

            // 4. Success handling
            const url = URL.createObjectURL(blob);
            setProcessedImage(url);
            onFaceConfigChange({ ...faceConfig, image: url });
            setProgress(100);

        } catch (err) {
            console.error("Face processing error:", err);
            setError(err.message || "Failed to process image.");
        } finally {
            setIsProcessing(false);
            if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
        }
    };

    const handleUpdateConfig = (key, value) => {
        const newConfig = { ...faceConfig, [key]: parseFloat(value) };
        onFaceConfigChange(newConfig);
    };

    const handleClear = () => {
        if (processedImage && processedImage.startsWith('blob:')) {
            URL.revokeObjectURL(processedImage);
        }
        setProcessedImage(null);
        onFaceConfigChange({ ...faceConfig, image: null });
        setError(null);
    };

    const handleUpscale = async () => {
        if (!processedImage) return;
        setIsUpscaling(true);
        try {
            // Fetch blob from current URL
            const response = await fetch(processedImage);
            const blob = await response.blob();

            const result = await upscaleImage(blob);
            if (result.success) {
                console.log("Upscale Result:", result.text);
                alert("Upscale Request Sent! Check Console for 'Nano Banana' response.");
            } else {
                alert("Upscale Failed: " + result.error);
            }
        } catch (e) {
            console.error(e);
            alert("Upscale Error");
        } finally {
            setIsUpscaling(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <User size={20} className="text-purple-600" />
                    Face Cam
                </div>
                {processedImage && (
                    <button
                        onClick={handleClear}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title="Remove Face"
                    >
                        <X size={16} />
                    </button>
                )}
            </h3>

            <div className="space-y-4">
                {/* Upload Area */}
                {!processedImage && !isProcessing && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all text-slate-600 gap-3 group"
                    >
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                            <Upload size={20} className="text-purple-600" />
                        </div>
                        <div className="text-center">
                            <span className="text-sm font-semibold text-slate-700 block">Upload Portrait</span>
                            <span className="text-[10px] text-slate-400">JPG, PNG (Max 10MB)</span>
                        </div>
                    </button>
                )}

                <input
                    type="file"
                    accept="image/jpeg, image/png, image/webp"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />

                {/* Error State */}
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-start gap-2">
                        <AlertCircle size={14} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Processing State */}
                {isProcessing && (
                    <div className="p-6 border border-slate-100 rounded-xl flex flex-col items-center justify-center text-center bg-slate-50">
                        <Loader2 size={24} className="text-purple-600 animate-spin mb-3" />
                        <p className="text-sm font-medium text-slate-700">Processing...</p>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div
                                className="bg-purple-600 h-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-2">AI is removing the background</p>
                    </div>
                )}

                {/* Result & Controls */}
                {processedImage && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        {/* Preview */}
                        <div className="relative bg-slate-100 rounded-lg overflow-hidden border border-slate-200 h-32 flex items-center justify-center">
                            <div
                                className="absolute inset-0 opacity-20"
                                style={{
                                    backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                                    backgroundSize: '10px 10px'
                                }}
                            />
                            <img
                                src={processedImage}
                                alt="Processed Face"
                                className="h-full object-contain relative z-10"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm hover:bg-white text-slate-600 rounded-lg shadow-sm"
                                title="Change Image"
                            >
                                <RefreshCw size={14} />
                            </button>
                        </div>

                        {/* Controls */}
                        <div className="space-y-4 pt-2 border-t border-slate-100">

                            {/* Position Presets */}
                            <div>
                                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                                    Quick Position
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => handleUpdateConfig('x', 100)}
                                        className="py-1.5 px-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                                    >
                                        Left
                                    </button>
                                    <button
                                        onClick={() => handleUpdateConfig('x', 700)}
                                        className="py-1.5 px-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                                    >
                                        Center
                                    </button>
                                    <button
                                        onClick={() => handleUpdateConfig('x', 1300)}
                                        className="py-1.5 px-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                                    >
                                        Right
                                    </button>
                                </div>
                            </div>

                            {/* Image Enhancement */}
                            <div>
                                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                                    <span>AI Enhancement</span>
                                    {faceConfig.filters?.isEnhanced && (
                                        <span className="text-purple-600 text-[9px] bg-purple-50 px-1.5 py-0.5 rounded-full">Active</span>
                                    )}
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => {
                                            const isActive = faceConfig.filters?.isEnhanced;
                                            const newFilters = isActive ?
                                                { contrast: 1, saturation: 1, brightness: 1, isEnhanced: false } :
                                                { contrast: 1.15, saturation: 1.15, brightness: 1.05, isEnhanced: true };
                                            onFaceConfigChange({ ...faceConfig, filters: newFilters });
                                        }}
                                        className={`py-2 px-3 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-2
                                            ${faceConfig.filters?.isEnhanced
                                                ? 'bg-purple-600 text-white shadow-purple-200 shadow-sm'
                                                : 'bg-white border border-slate-200 text-slate-600 hover:border-purple-300 hover:text-purple-600'}`
                                        }
                                    >
                                        <Sliders size={14} />
                                        {faceConfig.filters?.isEnhanced ? 'Reset' : 'Cinematic'}
                                    </button>

                                    <button
                                        onClick={handleUpscale}
                                        disabled={isUpscaling}
                                        className="py-2 px-3 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-200 shadow-sm hover:from-amber-600 hover:to-orange-600 disabled:opacity-50"
                                        title="Use Nano Banana to Upscale"
                                    >
                                        {isUpscaling ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                                        8K Upscale
                                    </button>
                                </div>
                                <p className="text-[9px] text-slate-400 mt-1.5 leading-relaxed">
                                    Cinematic applies filters. 8K Upscale uses Nano Banana (API).
                                </p>
                            </div>

                            <div className="space-y-4 border-t border-slate-100 pt-3">
                                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    Fine Tune
                                </label>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-600">Scale</span>
                                        <span className="text-slate-400">{Math.round((faceConfig.scale || 1) * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.2"
                                        max="2.5"
                                        step="0.05"
                                        value={faceConfig.scale || 1}
                                        onChange={(e) => handleUpdateConfig('scale', e.target.value)}
                                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-600">Horizontal Flip</span>
                                    </div>
                                    <div className="flex bg-slate-100 rounded-lg p-0.5">
                                        <button
                                            onClick={() => handleUpdateConfig('flip', 1)}
                                            className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${(!faceConfig.flip || faceConfig.flip === 1) ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
                                        >
                                            Original
                                        </button>
                                        <button
                                            onClick={() => handleUpdateConfig('flip', -1)}
                                            className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${faceConfig.flip === -1 ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
                                        >
                                            Flipped
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FaceUploader;
