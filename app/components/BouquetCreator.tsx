'use client';

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Environment, OrbitControls, Loader } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { Rose3D } from './Rose3D';

interface BouquetCreatorProps {
  onComplete: () => void;
}

// Camera Rig for transitions
const CameraRig = ({ step, onTransitionEnd }: { step: string, onTransitionEnd: () => void }) => {
  const { camera } = useThree();
  const vec = new THREE.Vector3();
  const transitionRef = useRef(true);

  useEffect(() => {
    if (step === 'complete') transitionRef.current = true;
  }, [step]);

  useFrame((state) => {
    if (step === 'complete' && transitionRef.current) {
      // Smoothly transition to top view
      // Zoom out more: Increase Y from 18 -> 24 (further out), Z from 0.1 -> 0.1
      vec.set(0, 24, 0.1); 
      state.camera.position.lerp(vec, 0.02);
      state.camera.lookAt(0, 0, 0);
      
      if (state.camera.position.distanceTo(vec) < 0.5) {
        transitionRef.current = false;
        onTransitionEnd();
      }
    }
  });
  return null;
};

const BouquetCreator: React.FC<BouquetCreatorProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'growing' | 'blooming' | 'complete'>('growing');
  const [controlsEnabled, setControlsEnabled] = useState(true);

  // Generate 800 Roses Configuration for a fuller top view
  const allRoses = useMemo(() => {
    const temp = [];
    const count = 800; 
    
    // Golden angle for spiral distribution
    const phi = Math.PI * (3 - Math.sqrt(5)); 

    for (let i = 0; i < count; i++) {
        // Distribute points on a sphere/dome surface
        // Adjust distribution to pack more at the top (y closer to 1)
        const t = i / (count - 1);
        const y = 1 - t * 0.95; // Go slightly lower to fill the base better (0.05 to 1)
        const radius = Math.sqrt(1 - y * y);
        const theta = phi * i;

        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;
        
        // Scale positions to make a bouquet size
        // Start point is clustered at bottom center
        const start = new THREE.Vector3(0, -4, 0); // Start lower to give more stem length
        
        // End points fan out
        // Reduce spread to pack them tighter
        const spread = 5.5; 
        const height = 1 + Math.random() * 2; // Varied height
        
        const endX = x * spread;
        const endY = y * spread + height; // Lift up
        const endZ = z * spread;
        const end = new THREE.Vector3(endX, endY, endZ);

        // Control point for curvature (bezier)
        // Midpoint pushed outward
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        const bulge = 1.6; // Less bulge to keep stems tighter together
        mid.x *= bulge;
        mid.z *= bulge;
        
        // Create curve
        const curve = new THREE.CatmullRomCurve3([start, mid, end]);
        
        // High quality scale boost (20x mother instruction interpreted as making them grander)
        // Adjusted from 1.5 to 0.75 (2x smaller)
        const qualityMultiplier = 0.75;

        temp.push({
            id: i,
            curve,
            // Randomize delay for organic growth
            delay: Math.random() * 3.0, // Slightly longer duration for more roses 
            // Varied scales
            scale: (0.025 + Math.random() * 0.025) * (1 + y * 0.2) * qualityMultiplier,
            color: Math.random() > 0.6 ? "#ff4d6d" : "#d00000" // Mix of red and pink
        });
    }
    return temp;
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(typeof window !== 'undefined' && window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const roses = useMemo(() => {
      if (isMobile) {
          // Mobile Logic:
          // Use exactly 100 roses
          // Reduced scale compared to the previous 3.5x multiplier to make them "smaller" but still visible
          return allRoses.slice(0, 100).map(rose => ({
              ...rose,
              scale: rose.scale * 1.5 // Reduced from 3.5 to 1.5
          }));
      }
      return allRoses;
  }, [allRoses, isMobile]);

  useEffect(() => {
    // Sequence logic
    const growTimer = setTimeout(() => setStep('blooming'), 2500); // Start blooming after growth starts
    const bloomTimer = setTimeout(() => {
      setStep('complete');
      // Trigger completion callback after transition
      setTimeout(onComplete, 4000);
    }, 6000);

    return () => {
      clearTimeout(growTimer);
      clearTimeout(bloomTimer);
    };
  }, [onComplete]);

  return (
    <div className="w-full h-screen bg-transparent relative">
      <Loader />
      {/* 3D Scene */}
      <Canvas shadows={false} dpr={[1, 1]} performance={{ min: 0.5 }}>
        <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[0, 6, 8]} fov={50} />
            
            <CameraRig step={step} onTransitionEnd={() => {}} />
            
            <OrbitControls 
            enableZoom={true} 
            enablePan={false} 
            maxPolarAngle={Math.PI / 1.5} 
            autoRotate={step === 'complete'}
            autoRotateSpeed={0.5}
            minDistance={4}
            maxDistance={20}
            enabled={true}
            />
            
            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={1.5} 
              castShadow={false}
              shadow-mapSize={[512, 512]} // Reduced shadow map size for performance
            />
            <pointLight position={[-10, 5, -10]} intensity={0.8} color="#ff4d6d" />
            <spotLight position={[0, 10, 0]} intensity={1} angle={0.5} penumbra={1} />

            {/* Environment */}
            <Environment preset="city" />
            <fog attach="fog" args={['#fce7f3', 8, 30]} />

            {/* The Bouquet */}
            <group position={[0, -1, 0]}>
            {roses.map((rose) => (
                <Rose3D 
                    key={rose.id}
                    curve={rose.curve}
                    delay={rose.delay}
                    scale={rose.scale}
                    color={rose.color}
                    isBlooming={step === 'blooming' || step === 'complete'}
                />
            ))}
            </group>
            
            {/* Ground/Vase Base (Optional) */}
            <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[5, 32]} />
                <meshStandardMaterial color="#fce7f3" opacity={0.3} transparent />
            </mesh>
        </Suspense>
      </Canvas>

      {/* UI Overlay for Status */}
      <div className="absolute bottom-10 left-0 w-full text-center pointer-events-none z-10 flex flex-col items-center gap-4">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-2"
        >
          <p className="text-3xl font-dancing text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]">
            {step === 'growing' && "Growing with love..."}
            {step === 'blooming' && "Blooming for you..."}
            {step === 'complete' && "Happy Rose Day!"}
          </p>
          {step === 'complete' && (
             <p className="text-sm text-gray-400 font-poppins">Use your mouse to explore the bouquet</p>
          )}
        </motion.div>

        {step === 'complete' && (
            <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pointer-events-auto px-6 py-2 border border-rose-500 text-rose-500 rounded-full hover:bg-rose-500 hover:text-white transition-colors font-poppins text-sm"
                onClick={() => window.location.reload()}
            >
                Create Another
            </motion.button>
        )}
      </div>
    </div>
  );
};

export default BouquetCreator;
