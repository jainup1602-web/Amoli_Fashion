'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Shield, BarChart2, Settings } from 'lucide-react';

const COOKIE_KEY = 'amoli_cookie_consent';

type ConsentState = {
  necessary: boolean;
  analytics: boolean;
  preferences: boolean;
};

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<ConsentState>({
    necessary: true,
    analytics: false,
    preferences: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem(COOKIE_KEY);
    if (!saved) {
      // Small delay so page loads first
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const save = (c: ConsentState) => {
    localStorage.setItem(COOKIE_KEY, JSON.stringify({ ...c, timestamp: Date.now() }));
    setVisible(false);
  };

  const acceptAll = () => save({ necessary: true, analytics: true, preferences: true });
  const rejectAll = () => save({ necessary: true, analytics: false, preferences: false });
  const saveCustom = () => save(consent);

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop blur on mobile */}
          {showDetails && (
            <motion.div
              className="fixed inset-0 bg-black/20 z-[998] sm:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowDetails(false)}
            />
          )}

          <motion.div
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[420px] z-[999]"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          >
            <div className="bg-white shadow-2xl border border-gray-100 overflow-hidden" style={{ borderRadius: '2px' }}>
              {/* Top accent line */}
              <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #B76E79, #d4a0a8)' }} />

              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full" style={{ backgroundColor: '#FDF0F2' }}>
                      <Cookie className="h-4 w-4" style={{ color: '#B76E79' }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 tracking-wide">Cookie Preferences</p>
                      <p className="text-[10px] tracking-[0.15em] uppercase text-gray-400 font-elegant">Amoli Fashion Jewellery</p>
                    </div>
                  </div>
                  <button onClick={rejectAll} className="text-gray-300 hover:text-gray-500 transition-colors p-1">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-500 leading-relaxed mb-4">
                  We use cookies to enhance your browsing experience, personalise content, and analyse our traffic. Your privacy matters to us.
                </p>

                {/* Expandable details */}
                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden mb-4"
                    >
                      <div className="space-y-2.5 border border-gray-100 p-3 bg-gray-50">
                        {/* Necessary */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Shield className="h-3.5 w-3.5 text-green-500" />
                            <div>
                              <p className="text-xs font-medium text-gray-800">Necessary</p>
                              <p className="text-[10px] text-gray-400">Required for the site to function</p>
                            </div>
                          </div>
                          <div className="w-8 h-4 rounded-full flex items-center px-0.5" style={{ backgroundColor: '#B76E79' }}>
                            <div className="w-3 h-3 bg-white rounded-full ml-auto" />
                          </div>
                        </div>

                        {/* Analytics */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <BarChart2 className="h-3.5 w-3.5 text-blue-400" />
                            <div>
                              <p className="text-xs font-medium text-gray-800">Analytics</p>
                              <p className="text-[10px] text-gray-400">Help us improve our website</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setConsent(p => ({ ...p, analytics: !p.analytics }))}
                            className="w-8 h-4 rounded-full flex items-center px-0.5 transition-colors"
                            style={{ backgroundColor: consent.analytics ? '#B76E79' : '#d1d5db' }}
                          >
                            <div className={`w-3 h-3 bg-white rounded-full transition-transform ${consent.analytics ? 'ml-auto' : ''}`} />
                          </button>
                        </div>

                        {/* Preferences */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Settings className="h-3.5 w-3.5 text-purple-400" />
                            <div>
                              <p className="text-xs font-medium text-gray-800">Preferences</p>
                              <p className="text-[10px] text-gray-400">Remember your settings</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setConsent(p => ({ ...p, preferences: !p.preferences }))}
                            className="w-8 h-4 rounded-full flex items-center px-0.5 transition-colors"
                            style={{ backgroundColor: consent.preferences ? '#B76E79' : '#d1d5db' }}
                          >
                            <div className={`w-3 h-3 bg-white rounded-full transition-transform ${consent.preferences ? 'ml-auto' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={acceptAll}
                    className="flex-1 py-2 text-white text-xs font-semibold tracking-[0.1em] uppercase transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#B76E79' }}
                  >
                    Accept All
                  </button>
                  <button
                    onClick={rejectAll}
                    className="flex-1 py-2 text-gray-600 text-xs font-semibold tracking-[0.1em] uppercase border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    Reject All
                  </button>
                  {showDetails ? (
                    <button
                      onClick={saveCustom}
                      className="flex-1 py-2 text-xs font-semibold tracking-[0.1em] uppercase border transition-colors"
                      style={{ borderColor: '#B76E79', color: '#B76E79' }}
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowDetails(true)}
                      className="flex-shrink-0 py-2 px-3 text-xs text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2"
                    >
                      Manage
                    </button>
                  )}
                </div>

                {/* Privacy link */}
                <p className="text-[10px] text-gray-300 text-center mt-3">
                  By continuing, you agree to our{' '}
                  <a href="/privacy" className="underline hover:text-gray-500 transition-colors">Privacy Policy</a>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
