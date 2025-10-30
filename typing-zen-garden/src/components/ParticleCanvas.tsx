'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface ParticleCanvasProps {
  width: number;
  height: number;
  particles: Particle[];
  onParticleUpdate: (particles: Particle[]) => void;
}

const ParticleCanvas = ({ width, height, particles, onParticleUpdate }: ParticleCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      const updatedParticles = particles.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.02;

        if (particle.life > 0) {
          ctx.beginPath();
          ctx.fillStyle = `${particle.color}${Math.floor(particle.life * 255).toString(16).padStart(2, '0')}`;
          ctx.arc(particle.x, particle.y, particle.life * 3, 0, Math.PI * 2);
          ctx.fill();
          return true;
        }
        return false;
      });

      onParticleUpdate(updatedParticles);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [width, height, particles, onParticleUpdate]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
};

export default ParticleCanvas;