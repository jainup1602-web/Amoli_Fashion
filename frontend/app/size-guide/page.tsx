'use client';

import { useState } from 'react';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { motion, AnimatePresence } from 'framer-motion';

// Basic tabs for Rings, Necklaces, Bangles
const tabs = [
  { id: 'rings', label: 'Ring Size' },
  { id: 'necklaces', label: 'Necklace Length' },
  { id: 'bangles', label: 'Bangle Size' },
];

export default function SizeGuidePage() {
  const [activeTab, setActiveTab] = useState('rings');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFCF0' }}>
      {/* Header */}
      <div className="pt-16 pb-8 md:pt-24 md:pb-12 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-playfair tracking-wide text-[#1A1A1A] mb-4">Size Guide</h1>
          <p className="text-sm md:text-base text-gray-500 font-light max-w-2xl mx-auto">
            Find your perfect fit with our comprehensive jewelry sizing guides.
          </p>
        </motion.div>
      </div>

      <div className="container-custom pb-20">
        <Breadcrumb items={[{ label: 'Size Guide' }]} />

        <div className="max-w-4xl mx-auto mt-8">
          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="pb-4 px-2 relative text-xs sm:text-sm md:text-base tracking-[0.1em] uppercase font-elegant transition-colors"
                style={{ color: activeTab === tab.id ? '#1A1A1A' : '#9ca3af', fontWeight: activeTab === tab.id ? 500 : 400 }}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-[2px]"
                    style={{ backgroundColor: '#1A1A1A' }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-8 md:p-10 overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === 'rings' && (
                <motion.div
                  key="rings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl sm:text-2xl font-playfair mb-4 sm:mb-6 text-[#1A1A1A]">Ring Size Guide</h2>
                  <p className="text-sm sm:text-base text-gray-600 font-light mb-6 sm:mb-8 leading-relaxed">
                    The most accurate way to determine your ring size is by measuring the inside diameter of a ring that fits you well, or by measuring the circumference of your finger using a flexible measuring tape.
                  </p>
                  
                  <div className="overflow-x-auto border border-gray-100 rounded-lg">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead className="bg-gray-50">
                        <tr className="border-b border-gray-100">
                          <th className="py-4 px-4 text-xs tracking-widest uppercase font-medium text-gray-500">Indian Size</th>
                          <th className="py-4 px-4 text-xs tracking-widest uppercase font-medium text-gray-500">US Size</th>
                          <th className="py-4 px-4 text-xs tracking-widest uppercase font-medium text-gray-500">Diameter (mm)</th>
                          <th className="py-4 px-4 text-xs tracking-widest uppercase font-medium text-gray-500">Circumference (mm)</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {[
                          { in: '6', us: '3.5', d: '14.5', c: '45.5' },
                          { in: '8', us: '4.5', d: '15.3', c: '48.0' },
                          { in: '10', us: '5.5', d: '16.1', c: '50.6' },
                          { in: '12', us: '6', d: '16.5', c: '51.8' },
                          { in: '14', us: '7', d: '17.3', c: '54.4' },
                          { in: '16', us: '8', d: '18.1', c: '56.9' },
                          { in: '18', us: '9', d: '18.9', c: '59.5' },
                          { in: '20', us: '10', d: '19.8', c: '62.1' },
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4 font-medium text-[#1A1A1A]">{row.in}</td>
                            <td className="py-4 px-4 text-gray-600">{row.us}</td>
                            <td className="py-4 px-4 text-gray-600">{row.d}</td>
                            <td className="py-4 px-4 text-gray-600">{row.c}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 'necklaces' && (
                <motion.div
                  key="necklaces"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl sm:text-2xl font-playfair mb-4 sm:mb-6 text-[#1A1A1A]">Necklace Length Guide</h2>
                  <p className="text-sm sm:text-base text-gray-600 font-light mb-6 sm:mb-8 leading-relaxed">
                    Necklace lengths vary depending on the style and how you want it to sit on your chest. Use this guide to find the perfect drop length for your neck shape and outfit.
                  </p>
                  
                  <div className="overflow-x-auto border border-gray-100 rounded-lg">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead className="bg-gray-50">
                        <tr className="border-b border-gray-100">
                          <th className="py-4 px-4 text-xs tracking-widest uppercase font-medium text-gray-500">Length (Inches)</th>
                          <th className="py-4 px-4 text-xs tracking-widest uppercase font-medium text-gray-500">Length (cm)</th>
                          <th className="py-4 px-4 text-xs tracking-widest uppercase font-medium text-gray-500">Style Name</th>
                          <th className="py-4 px-4 text-xs tracking-widest uppercase font-medium text-gray-500">Where it falls</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {[
                          { in: '14"', cm: '35 cm', n: 'Collar', f: 'Tightly around the neck' },
                          { in: '16"', cm: '40 cm', n: 'Choker', f: 'At the base of the neck' },
                          { in: '18"', cm: '45 cm', n: 'Princess', f: 'On the collarbone' },
                          { in: '20"', cm: '50 cm', n: 'Matinee', f: 'Between collarbone and bust' },
                          { in: '24"', cm: '60 cm', n: 'Opera', f: 'On or just below the bust' },
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4 font-medium text-[#1A1A1A]">{row.in}</td>
                            <td className="py-4 px-4 text-gray-600">{row.cm}</td>
                            <td className="py-4 px-4 text-[#1A1A1A] font-medium">{row.n}</td>
                            <td className="py-4 px-4 text-gray-600">{row.f}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 'bangles' && (
                <motion.div
                  key="bangles"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl sm:text-2xl font-playfair mb-4 sm:mb-6 text-[#1A1A1A]">Bangle & Bracelet Size Guide</h2>
                  <p className="text-sm sm:text-base text-gray-600 font-light mb-6 sm:mb-8 leading-relaxed">
                    To find your true bangle size, tuck your thumb into your palm (as if you are putting on a bangle) and measure the widest part of your hand using a flexible tape measure or string.
                  </p>
                  
                  <div className="overflow-x-auto border border-gray-100 rounded-lg">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead className="bg-gray-50">
                        <tr className="border-b border-gray-100">
                          <th className="py-4 px-4 text-xs tracking-widest uppercase font-medium text-gray-500">Indian Size</th>
                          <th className="py-4 px-4 text-xs tracking-widest uppercase font-medium text-gray-500">Inner Diameter (Inches)</th>
                          <th className="py-4 px-4 text-xs tracking-widest uppercase font-medium text-gray-500">Inner Diameter (mm)</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {[
                          { in: '2-2', inch: '2.12"', mm: '54.0 mm' },
                          { in: '2-4', inch: '2.25"', mm: '57.0 mm' },
                          { in: '2-6', inch: '2.37"', mm: '60.3 mm' },
                          { in: '2-8', inch: '2.50"', mm: '63.5 mm' },
                          { in: '2-10', inch: '2.62"', mm: '66.7 mm' },
                          { in: '2-12', inch: '2.75"', mm: '69.8 mm' },
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4 font-medium text-[#1A1A1A]">{row.in}</td>
                            <td className="py-4 px-4 text-gray-600">{row.inch}</td>
                            <td className="py-4 px-4 text-gray-600">{row.mm}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
