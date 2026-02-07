'use client';

import React, { useEffect, useRef } from 'react';

interface ParticleSystemProps {
  type: 'firefly' | 'petal';
  count: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  hue?: number; // For petals
  rotation?: number;
  rotationSpeed?: number;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ type, count }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    const particles: Particle[] = [];
    
    for (let i = 0; i < count; i++) {
      particles.push(createParticle(canvas.width, canvas.height, type));
    }

    // Animation loop
    let animationFrameId: number;
    let lastTime = 0;
    const fpsInterval = 1000 / 30; // Cap at 30 FPS for performance

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = time - lastTime;
      if (elapsed < fpsInterval) return;

      lastTime = time - (elapsed % fpsInterval);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, index) => {
        // Update position
        p.x += p.vx;
        p.y += p.vy;

        if (type === 'firefly') {
          // Floating motion for fireflies
          p.vx += (Math.random() - 0.5) * 0.05;
          p.vy += (Math.random() - 0.5) * 0.05;
          
          // Limit velocity
          const maxVel = 0.5;
          p.vx = Math.max(-maxVel, Math.min(maxVel, p.vx));
          p.vy = Math.max(-maxVel, Math.min(maxVel, p.vy));
          
          // Twinkle
          p.alpha += (Math.random() - 0.5) * 0.05;
          p.alpha = Math.max(0.2, Math.min(0.8, p.alpha));
        } else {
          // Petal physics
          p.rotation = (p.rotation || 0) + (p.rotationSpeed || 0);
          p.x += Math.sin(p.y * 0.01) * 0.5; // Sway
        }

        // Wrap around screen or reset
        if (p.x < -50) p.x = canvas.width + 50;
        if (p.x > canvas.width + 50) p.x = -50;
        
        if (type === 'firefly') {
          if (p.y < -50) p.y = canvas.height + 50;
          if (p.y > canvas.height + 50) p.y = -50;
        } else {
          // Reset petals to top if they fall off bottom
          if (p.y > canvas.height + 50) {
            p.y = -50;
            p.x = Math.random() * canvas.width;
          }
        }

        // Draw
        ctx.save();
        ctx.globalAlpha = p.alpha;
        
        if (type === 'firefly') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = '#fff';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#fff';
          ctx.fill();
        } else {
          // Draw Petal
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation || 0);
          ctx.beginPath();
          // Simple petal shape
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(p.size / 2, -p.size / 2, p.size, 0, 0, p.size);
          ctx.bezierCurveTo(-p.size, 0, -p.size / 2, -p.size / 2, 0, 0);
          ctx.fillStyle = `hsl(${p.hue}, 70%, 60%)`;
          ctx.fill();
        }
        
        ctx.restore();
      });
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [count, type]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-0"
    />
  );
};

function createParticle(w: number, h: number, type: 'firefly' | 'petal'): Particle {
  if (type === 'firefly') {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      alpha: Math.random() * 0.5 + 0.3,
    };
  } else {
    return {
      x: Math.random() * w,
      y: Math.random() * h - h, // Start above or random
      vx: (Math.random() - 0.5) * 1,
      vy: Math.random() * 1 + 1, // Fall down
      size: Math.random() * 10 + 5,
      alpha: Math.random() * 0.3 + 0.7,
      hue: 330 + Math.random() * 30, // Pink/Red range
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05
    };
  }
}

export default ParticleSystem;
