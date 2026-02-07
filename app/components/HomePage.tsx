'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface HomePageProps {
  onCreateBouquet: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onCreateBouquet }) => {
  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden magical-gradient">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 text-center px-4"
      >
        <motion.h1 
          className="font-dancing text-6xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-rose-gold via-white to-rose-gold drop-shadow-lg mb-6"
          animate={{ 
            textShadow: [
              "0 0 10px rgba(183, 110, 121, 0.5)",
              "0 0 20px rgba(183, 110, 121, 0.8)",
              "0 0 10px rgba(183, 110, 121, 0.5)"
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          Happy Rose Day
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-lg md:text-xl text-ethereal-pink/80 font-poppins mb-12 max-w-md mx-auto"
        >
          Create a magical bouquet that blooms forever for your special someone.
        </motion.p>

        <motion.button
          onClick={onCreateBouquet}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative px-8 py-4 bg-gradient-to-r from-burgundy to-purple rounded-full font-poppins text-white font-semibold shadow-lg hover:shadow-rose-gold/50 transition-all duration-300 flex items-center gap-2 mx-auto"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Sparkles className="w-5 h-5 animate-pulse" />
            Create Bouquet
          </span>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-gold to-burgundy opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.button>
      </motion.div>
      
      {/* Decorative Elements will be added via ParticleSystem later */}
    </div>
  );
};

export default HomePage;
