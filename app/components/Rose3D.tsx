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
        duration: 4, // Slower animation
        delay: delay, 
        ease: [0.34, 1.56, 0.64, 1]
      }
    }
  };

  const MotionMesh = motion.mesh as any;
  const MotionGroup = motion.group as any;

  // Generate random leaves along the stem
  const leaves = useMemo(() => {
    const leafCount = Math.floor(Math.random() * 2) + 1; // 1 or 2 leaves per stem
    const items = [];
    for (let i = 0; i < leafCount; i++) {
        // Position along the curve (0.2 to 0.8)
        const t = 0.3 + (Math.random() * 0.4); 
        const point = curve.getPoint(t);
        const tangent = curve.getTangent(t);
        
        // Random rotation around the stem
        const angle = Math.random() * Math.PI * 2;
        
        // Create a leaf geometry (simple plane or flattened cone)
        // We'll use a simple cone scaled to look like a leaf
        
        items.push({
            id: i,
            point,
            tangent,
            angle,
            scale: scale * (0.8 + Math.random() * 0.4),
            delay: delay + (t * 2) // Grow as stem reaches this point
        });
    }
    return items;
  }, [curve, scale, delay]);

  return (
    <group>
      {/* Stem growing from origin (assumes curve starts at 0,0,0) */}
      <MotionMesh 
        geometry={stemGeo} 
        position={[startPoint.x, startPoint.y, startPoint.z]}
        initial="hidden"
        animate="visible"
        variants={stemVariants}
      >
        <meshStandardMaterial color="#1b4332" roughness={0.8} transparent opacity={1} />
      </MotionMesh>

      {/* Leaves */}
      {leaves.map((leaf, i) => {
         // Calculate orientation for leaf
         // We want it perpendicular to stem tangent
         const up = new THREE.Vector3(0, 1, 0);
         const stemQuat = new THREE.Quaternion().setFromUnitVectors(up, leaf.tangent);
         
         // Rotate around stem
         const leafRot = new THREE.Euler(0, leaf.angle, Math.PI / 3); // Tilt out 60 degrees
         const leafQuat = new THREE.Quaternion().setFromEuler(leafRot);
         
         // Combine rotations
         const finalQuat = stemQuat.multiply(leafQuat);
         const finalEuler = new THREE.Euler().setFromQuaternion(finalQuat);

         return (
            <MotionMesh
                key={`leaf-${i}`}
                position={[leaf.point.x, leaf.point.y, leaf.point.z]}
                rotation={finalEuler}
                initial={{ scale: 0 }}
                animate={{ scale: leaf.scale }}
                transition={{ duration: 1, delay: leaf.delay }}
            >
                <coneGeometry args={[0.03 * scale, 0.15 * scale, 4]} />
                <meshStandardMaterial color="#2d6a4f" side={THREE.DoubleSide} />
            </MotionMesh>
         );
      })}

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
