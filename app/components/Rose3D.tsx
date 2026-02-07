'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion-3d';
import { OBJRose } from './OBJRose';

interface Rose3DProps {
  curve: THREE.CatmullRomCurve3;
  delay: number;
  scale?: number;
  color?: string;
  isBlooming: boolean;
}

export const Rose3D: React.FC<Rose3DProps> = ({ 
  curve, 
  delay, 
  scale = 1, 
  color = "#d00000",
  isBlooming 
}) => {
  // Create stem geometry from curve
  const stemGeo = useMemo(() => {
    // Ensure minimum stem thickness so it's visible even when flower is tiny
    const radius = Math.max(0.04 * scale, 0.005);
    // Reduced segments for performance optimization
    const radialSegments = 6; // Reduced from 8
    const tubularSegments = 12; // Reduced from 20
    const geo = new THREE.TubeGeometry(curve, tubularSegments, radius, radialSegments, false);
    // Translate geometry so the start point is at (0,0,0) for correct scaling
    const start = curve.getPoint(0);
    geo.translate(-start.x, -start.y, -start.z);
    return geo;
  }, [curve, scale]);

  const startPoint = curve.getPoint(0);

  // Calculate the end point and tangent for the flower head
  const endPoint = curve.getPoint(1);
  const tangent = curve.getTangent(1);
  
  // Quaternion to align flower with stem tangent
  const up = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(up, tangent);
  const euler = new THREE.Euler().setFromQuaternion(quaternion);

  // Animation Variants
  const stemVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 2, 
        delay: delay, 
        ease: [0.34, 1.56, 0.64, 1]
      }
    }
  };

  return (
    <group>
      {/* Stem growing from origin (assumes curve starts at 0,0,0) */}
      <motion.mesh 
        geometry={stemGeo} 
        position={[startPoint.x, startPoint.y, startPoint.z]}
        // @ts-ignore
        initial="hidden"
        animate="visible"
        variants={stemVariants}
      >
        <meshStandardMaterial color="#1b4332" roughness={0.8} transparent opacity={1} />
      </motion.mesh>

      {/* Flower Head */}
      <motion.group
        position={[endPoint.x, endPoint.y, endPoint.z]}
        rotation={euler}
      >
        <OBJRose 
          scale={scale} 
          color={color} 
          isBlooming={isBlooming} 
          delay={delay} 
        />
      </motion.group>
    </group>
  );
};
