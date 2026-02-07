'use client';

import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three-stdlib';
import { motion } from 'framer-motion-3d';

const MODEL_URL = 'https://happy358.github.io/Images/Model/red_rose3.obj';

interface OBJRoseProps {
  scale?: number;
  color?: string; // We can use this to vary the crimson slightly
  isBlooming: boolean;
  delay: number;
}

export const OBJRose: React.FC<OBJRoseProps> = ({ 
  scale = 1, 
  color = "crimson", 
  isBlooming,
  delay 
}) => {
  // Load the OBJ model
  const obj = useLoader(OBJLoader, MODEL_URL);

  // Clone the object to allow independent materials/instances
  const clonedObj = useMemo(() => {
    const clone = obj.clone();
    
    // Apply materials based on the snippet logic
    clone.traverse((child: any) => {
      if (child.isMesh) {
        // Base material
        const material = new THREE.MeshStandardMaterial({
          metalness: 0,
          roughness: 0.8,
          side: THREE.DoubleSide,
        });

        if (child.name === "rose") {
           material.color.set(color); // Use prop color
           material.emissive = new THREE.Color(color);
           material.emissiveIntensity = 0.2;
        } else if (child.name === "calyx") {
           material.color.set("#001a14");
        } else if (child.name === "leaf1" || child.name === "leaf2") {
           material.color.set("#00331b");
        }
        
        child.material = material;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Apply the specific rotation mentioned in the snippet
    // object.rotation.set(0, Math.PI / 1.7, 0);
    // We apply this to the group container or the object itself
    clone.rotation.set(0, Math.PI / 1.7, 0);

    return clone;
  }, [obj, color]);

  // Animation variants
  const variants = {
    hidden: { scale: 0 },
    visible: { 
      scale: 0.15 * scale, // The model might be huge, so we scale it down to fit our scene
      transition: { 
        duration: 2, 
        delay: delay + 1.2, // Sync with stem
        ease: [0.34, 1.56, 0.64, 1] 
      }
    }
  };

  return (
    <motion.primitive 
      object={clonedObj} 
      // @ts-ignore
      initial="hidden"
      animate={isBlooming ? "visible" : "hidden"}
      variants={variants}
    />
  );
};
