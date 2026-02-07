'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import HomePage from './components/HomePage';
import BouquetCreator from './components/BouquetCreator';
import ParticleSystem from './components/ParticleSystem';

export default function Home() {
  const [view, setView] = useState<'home' | 'create'>('home');
  const [showMessage, setShowMessage] = useState(false);

  const handleCreateBouquet = () => {
    setView('create');
  };

  const handleBouquetComplete = () => {
    setShowMessage(true);
  };

  return (
    <main className="relative w-full h-screen bg-dark-bg overflow-hidden">
      {/* Global Particle System */}
      <ParticleSystem type="firefly" count={30} />
      
      {/* View Transition */}
      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-10"
          >
            <HomePage onCreateBouquet={handleCreateBouquet} />
          </motion.div>
        )}

        {view === 'create' && (
          <motion.div
            key="create"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-10"
          >
            {/* Falling petals specific to bouquet creation */}
            <ParticleSystem type="petal" count={20} />
            <BouquetCreator onComplete={handleBouquetComplete} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Special Message Popup */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-black/40 backdrop-blur-md border border-rose-500/30 p-8 rounded-2xl max-w-md w-full text-center shadow-[0_0_50px_rgba(225,29,72,0.3)] pointer-events-auto relative overflow-hidden">
              {/* Decorative corner accents */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-rose-400 rounded-tl-2xl opacity-50" />
              <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-rose-400 rounded-tr-2xl opacity-50" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-rose-400 rounded-bl-2xl opacity-50" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-rose-400 rounded-br-2xl opacity-50" />
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="font-dancing text-4xl text-rose-500 mb-6 drop-shadow-md">
                   For Someone Special 🌹
                </h2>
                <p className="font-poppins text-lg text-rose-100/90 leading-relaxed mb-8 italic">
                  "Just like these roses, my love for you grows more beautiful every single day. You are the most precious flower in my garden of life."
                </p>
                <p className="font-dancing text-2xl text-rose-400 mb-8">
                  Happy Rose Day!
                </p>
                
                <div className="flex gap-4 justify-center">
                  <button 
                    onClick={() => setShowMessage(false)}
                    className="px-6 py-2 rounded-full border border-rose-500/50 text-rose-300 hover:bg-rose-500/10 hover:text-white transition-colors text-sm"
                  >
                    Keep Viewing
                  </button>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 rounded-full bg-rose-600 text-white hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-all hover:scale-105 text-sm"
                  >
                    Send Another
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
