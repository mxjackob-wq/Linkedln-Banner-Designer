import React, { useState, useEffect } from 'react';
import ProfessionSelector from './components/ProfessionSelector';
import BannerCanvas from './components/BannerCanvas';
import TextEditor from './components/TextEditor';
import BackgroundEditor from './components/BackgroundEditor';
import LandingPage from './components/LandingPage';
import DesignCritique from './components/DesignCritique';
import ColorPaletteGen from './components/ColorPaletteGen';

import ProfileAnalyzer from './components/ProfileAnalyzer'; // New Import
import IndustryTips from './components/IndustryTips'; // New Import

import OnboardingTour from './components/OnboardingTour'; // New Import
import InspirationGallery from './components/InspirationGallery';
import ExportPanel from './components/ExportPanel'; // New Import
import EditorLayout from './components/Editor/EditorLayout'; // New Import
import AuthModal from './components/AuthModal';
import FaceUploader from './components/FaceUploader';
import { supabase } from './utils/supabaseClient';
import { templates } from './data/templates';
import { generateTaglines } from './utils/taglineGenerator';
import { searchImages } from './utils/imageService';
import { downloadBannerAsJPEG, downloadBannerAsPDF } from './utils/exportService';
import { saveToHistory, getHistory } from './utils/historyService';
import { analyzeDesignWithGemini } from './utils/geminiService';
import DevNote from './components/DevNote'; // New Import
import { History, ArrowLeft, Sparkles, User, LogOut } from 'lucide-react';

function App() {
  const [view, setView] = useState('landing');
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [activeTemplate, setActiveTemplate] = useState(templates[0]);
  const [taglines, setTaglines] = useState([]);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Auth State
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Critique State
  const [showCritique, setShowCritique] = useState(false);
  const [isCritiqueLoading, setIsCritiqueLoading] = useState(false);
  const [critiqueFeedback, setCritiqueFeedback] = useState(null);

  // Text Config
  const [textConfig, setTextConfig] = useState({
    title: '',
    tagline: '',
    font: 'Inter',
    color: '#1a1a1a'
  });

  const [bgImage, setBgImage] = useState(null);
  const [overlayOpacity, setOverlayOpacity] = useState(0.5);
  // Custom Styles
  const [customPalette, setCustomPalette] = useState(null);
  const [customLogo, setCustomLogo] = useState(null);
  const [badges, setBadges] = useState([]); // [{id, type, x, y}]
  // Face Cam State
  const [faceConfig, setFaceConfig] = useState({ image: null, x: 1000, y: 100, scale: 1, flip: 1 });

  const [historyItems, setHistoryItems] = useState([]);
  const [showHistory, setShowHistory] = useState(false);



  useEffect(() => {
    // History init
    setHistoryItems(getHistory());

    // Auth init
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkUser();

    // Auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleStart = () => {
    setView('generator');
  };

  const handleBackToHome = () => {
    setView('landing');
    setSelectedProfession(null);
    setBadges([]); // Reset badges
  };

  const handleProfessionSelect = async (profession) => {
    setSelectedProfession(profession);
    setIsLoading(true);
    setCustomPalette(null);
    setCustomLogo(null);
    setBadges([]);
    setFaceConfig({ image: null, x: 1000, y: 100, scale: 1, flip: 1 });

    // Handle "Blank Design" separately to avoid unnecessary API calls
    if (profession.id === 'blank') {
      setTaglines([]);
      setImages([]);
      setBgImage(null);

      const initialTextConfig = {
        title: '',
        tagline: '',
        font: 'Inter',
        color: '#1a1a1a'
      };
      setTextConfig(initialTextConfig);
      setOverlayOpacity(0); // No overlay needed for blank white bg usually

      setIsLoading(false);
      return;
    }

    try {
      const generatedTaglines = await generateTaglines(profession.label, profession.keywords);
      setTaglines(generatedTaglines);

      const fetchedImages = await searchImages(profession.keywords[0]);
      setImages(fetchedImages);
      const initialBg = fetchedImages[0]?.url;
      setBgImage(initialBg);

      const initialTextConfig = {
        title: profession.label,
        tagline: generatedTaglines[0] || profession.defaultTagline,
        font: 'Inter',
        color: '#1a1a1a'
      };
      setTextConfig(initialTextConfig);
      setOverlayOpacity(0.5);

      saveToHistory(profession, initialTextConfig, templates[0].id, initialBg);
      setHistoryItems(getHistory());

    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileAnalysis = async (result) => {
    // Construct a profession object from analysis
    const profession = {
      id: 'custom-ai',
      label: result.profession,
      keywords: [result.profession, ...result.skills],
      defaultTagline: result.tagline,
      colorPalette: ['#4f46e5', '#3b82f6', '#f0f0f0'] // Default, will be overridden by generated palettes probably
    };

    // Trigger selection flow
    await handleProfessionSelect(profession);

    // Override the tagline specifically with the one from Bio analysis as it's more personal
    setTextConfig(prev => ({ ...prev, tagline: result.tagline }));
  };

  const loadHistoryItem = (item) => {
    setSelectedProfession(item.profession);
    setTextConfig(item.textConfig);
    setBgImage(item.bgImage);
    const tmpl = templates.find(t => t.id === item.templateId) || templates[0];
    setActiveTemplate(tmpl);
    setShowHistory(false);
    setView('generator');
  };

  const handleTextUpdate = (newConfig) => {
    setTextConfig(newConfig);
  };

  const handleRegenerateBg = async () => {
    const fetchedImages = await searchImages(selectedProfession.keywords[Math.floor(Math.random() * selectedProfession.keywords.length)]);
    setBgImage(fetchedImages[Math.floor(Math.random() * fetchedImages.length)]?.url);
  };

  const handleDownload = (type) => {
    const filename = `LinkedIn_Banner_${selectedProfession.label.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
    if (type === 'pdf') {
      downloadBannerAsPDF('banner-canvas', `${filename}.pdf`);
    } else {
      downloadBannerAsJPEG('banner-canvas', `${filename}.jpg`);
    }
  };

  const handleCritique = async () => {
    setShowCritique(true);
    setIsCritiqueLoading(true);
    try {
      const canvas = document.getElementById('banner-canvas');
      if (!canvas) throw new Error("Canvas not found");
      const base64 = canvas.toDataURL('image/jpeg', 0.8);
      const feedback = await analyzeDesignWithGemini(base64);
      setCritiqueFeedback(feedback);
    } catch (error) {
      console.error("Critique failed:", error);
    } finally {
      setIsCritiqueLoading(false);
    }
  };

  const handleApplyPalette = (colors) => {
    setCustomPalette(colors);
  };

  const handleApplyKit = (kit) => {
    // Brand Kit Logic
    if (kit.type === 'brand') {
      if (kit.colors && kit.colors.length > 0) setCustomPalette(kit.colors);
      if (kit.logo) setCustomLogo(kit.logo);
      if (kit.font) setTextConfig(prev => ({ ...prev, font: kit.font }));
    }

    // Person Kit Logic
    if (kit.type === 'person') {
      setTextConfig(prev => ({
        ...prev,
        title: kit.name || prev.title,
        tagline: kit.title || prev.tagline
      }));
      if (kit.headshot) {
        setFaceConfig(prev => ({ ...prev, image: kit.headshot }));
      }
    }
  };

  const handleAddBadge = (type) => {
    // Add random small offset to avoid stacking perfectly
    setBadges(prev => [...prev, {
      id: Date.now(),
      type,
      x: 1400 - (Math.random() * 50), // Default to right side
      y: 50 + (Math.random() * 50)
    }]);
  };

  const handleUpdateBadgePos = (id, x, y) => {
    setBadges(prev => prev.map(b => b.id === id ? { ...b, x, y } : b));
  };

  const handleFaceUpdate = (newConfig) => {
    setFaceConfig(newConfig);
  };



  console.log("App Render:", { view, selectedProfession, user: !!user });

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <DevNote />

      {/* Onboarding Tour - Only show if in generator mode and not seen before */}
      {/* {view !== 'landing' && <OnboardingTour />} */}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <DesignCritique
        isOpen={showCritique}
        isLoading={isCritiqueLoading}
        feedback={critiqueFeedback}
        onClose={() => setShowCritique(false)}
      />

      {view !== 'landing' && !selectedProfession && (
        <header className="bg-white border-b border-slate-200 py-4 px-6 mb-8 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={handleBackToHome} className="text-slate-400 hover:text-slate-600">
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">in</span>
                BannerGen
              </h1>
            </div>

            <div className="flex gap-4">
              {historyItems.length > 0 && !selectedProfession && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium text-sm"
                >
                  <History size={18} />
                  Recent Banners
                </button>
              )}

              {selectedProfession && (
                <button
                  onClick={() => setSelectedProfession(null)}
                  className="text-sm text-slate-500 hover:text-slate-800"
                >
                  Change Profession
                </button>
              )}

              {/* Auth Buttons */}
              {user ? (
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-xs font-medium text-slate-700">{user.email}</span>
                  </div>
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      setHistoryItems([]); // Optional: clear history or keep it
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Sign Out"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors ml-2"
                >
                  <User size={16} />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {view === 'landing' ? (
        <LandingPage onStart={handleStart} />
      ) : (
        <>
          {!selectedProfession ? (
            <main className="p-4 max-w-[1600px] mx-auto">
              <div className="flex flex-col gap-8 max-w-4xl mx-auto">
                {showHistory && (
                  <div className="mb-8 animate-in slide-in-from-top-4 duration-300">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
                      <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Designs</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {historyItems.map(item => (
                          <button
                            key={item.id}
                            onClick={() => loadHistoryItem(item)}
                            className="text-left p-4 border border-slate-100 rounded-lg hover:border-blue-500 hover:shadow-md transition-all group"
                          >
                            <div className="font-semibold text-slate-800 group-hover:text-blue-600">{item.profession.label}</div>
                            <div className="text-xs text-slate-500 truncate">{item.textConfig.title}</div>
                            <div className="text-xs text-slate-400 mt-2">{new Date(item.date).toLocaleDateString()}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <ProfileAnalyzer onAnalysisComplete={handleProfileAnalysis} />
                <ProfessionSelector onSelect={handleProfessionSelect} />
              </div>
            </main>
          ) : (
            <EditorLayout
              selectedProfession={selectedProfession}
              activeTemplate={activeTemplate}
              setActiveTemplate={setActiveTemplate}
              textConfig={textConfig}
              setTextConfig={setTextConfig}
              bgImage={bgImage}
              setBgImage={setBgImage}
              overlayOpacity={overlayOpacity}
              setOverlayOpacity={setOverlayOpacity}
              customPalette={customPalette}
              setCustomPalette={setCustomPalette}
              customLogo={customLogo}
              setCustomLogo={setCustomLogo}
              badges={badges}
              setBadges={setBadges}
              faceConfig={faceConfig}
              setFaceConfig={setFaceConfig}
              onBack={handleBackToHome}
              onDownload={() => handleDownload('jpg')}
              handleCritique={handleCritique}
              taglines={taglines}
              onApplyKit={handleApplyKit}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
