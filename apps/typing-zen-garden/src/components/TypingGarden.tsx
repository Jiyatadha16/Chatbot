'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './TypingGarden.module.css';
import ParticleCanvas from './ParticleCanvas';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface TypingStats {
  wpm: number;
  accuracy: number;
  keyIntervals: number[];
}

interface TypingGardenProps {
  onStatsUpdate?: (stats: TypingStats) => void;
}

const PARTICLE_COLORS = ['#64b5f6', '#81c784', '#ba68c8', '#ffb74d'];
const KEY_INTERVAL_HISTORY = 10;

export default function TypingGarden({ onStatsUpdate }: TypingGardenProps) {
  const [text, setText] = useState('');
  const [particles, setParticles] = useState<Particle[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [useServerInference, setUseServerInference] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const lastKeyTime = useRef<number>(Date.now());
  const keyIntervals = useRef<number[]>([]);
  const totalKeystrokes = useRef(0);
  const correctKeystrokes = useRef(0);
  
  const spawnParticles = useCallback((x: number, y: number) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 5; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = Math.random() * 2 + 1;
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  const playKeypressSound = useCallback(() => {
    if (!soundEnabled) return;
    // Simple tone using Web Audio API
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    oscillator.stop(audioCtx.currentTime + 0.1);
  }, [soundEnabled]);

  const handleKeyPress = useCallback(async (e: React.KeyboardEvent) => {
    const now = Date.now();
    const interval = now - lastKeyTime.current;
    lastKeyTime.current = now;
    
    if (interval > 0) {
      keyIntervals.current = [
        ...keyIntervals.current.slice(-KEY_INTERVAL_HISTORY + 1),
        interval,
      ];
    }

    totalKeystrokes.current++;
    // Simple accuracy measure - could be improved
    if (e.key.length === 1) {
      correctKeystrokes.current++;
    }

    const rect = editorRef.current?.getBoundingClientRect();
    if (rect) {
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      spawnParticles(x, y);
    }

    playKeypressSound();

    if (useServerInference) {
      try {
        const events = keyIntervals.current.map((interval, index) => ({
          char: text[text.length - keyIntervals.current.length + index] || '',
          timestamp: Date.now() - (keyIntervals.current.slice(index + 1).reduce((a, b) => a + b, 0))
        }));

        const response = await fetch('/api/infer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            events,
            mode: 'server'
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          // Adjust particles based on server inference
          if (data.particleHint) {
            const { size, speed, color } = data.particleHint;
            const rect = editorRef.current?.getBoundingClientRect();
            if (rect) {
              const x = rect.left + rect.width / 2;
              const y = rect.top + rect.height / 2;
              const newParticles = Array.from({ length: Math.floor(size * 2) }).map(() => {
                const angle = Math.random() * Math.PI * 2;
                return {
                  x,
                  y,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  life: 1.0,
                  color
                };
              });
              setParticles(prev => [...prev, ...newParticles]);
            }
          }
        }
      } catch (error) {
        console.error('Server inference failed:', error);
      }
    }

    // Calculate and report stats
    const wpm = calculateWPM(keyIntervals.current);
    const accuracy = (correctKeystrokes.current / totalKeystrokes.current) * 100;
    
    onStatsUpdate?.({
      wpm,
      accuracy,
      keyIntervals: keyIntervals.current,
    });
  }, [text, useServerInference, spawnParticles, playKeypressSound, onStatsUpdate]);

  // Prefetch the API route
  useEffect(() => {
    if (useServerInference) {
      void fetch('/api/infer');
    }
  }, [useServerInference]);

  return (
    <div className={`${styles.container} ${isDarkTheme ? styles.dark : ''} ${focusMode ? styles.focus : ''}`}>
      <ParticleCanvas
        width={800}
        height={600}
        particles={particles}
        onParticleUpdate={setParticles}
      />
      
      <div className={styles.controls}>
        <label className={styles.control}>
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
          />
          Sound
        </label>
        
        <label className={styles.control}>
          <input
            type="checkbox"
            checked={focusMode}
            onChange={(e) => setFocusMode(e.target.checked)}
          />
          Focus Mode
        </label>
        
        <label className={styles.control}>
          <input
            type="checkbox"
            checked={isDarkTheme}
            onChange={(e) => setIsDarkTheme(e.target.checked)}
          />
          Dark Theme
        </label>
        
        <label className={styles.control}>
          <input
            type="checkbox"
            checked={useServerInference}
            onChange={(e) => setUseServerInference(e.target.checked)}
          />
          Use Server Inference
        </label>
      </div>

      <div
        ref={editorRef}
        className={styles.editor}
        contentEditable
        onInput={(e) => setText(e.currentTarget.textContent || '')}
        onKeyDown={handleKeyPress}
        role="textbox"
        aria-label="Typing area"
        tabIndex={0}
      />
    </div>
  );
}

function calculateWPM(intervals: number[]): number {
  if (intervals.length === 0) return 0;
  const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  // Assuming average word length of 5 characters
  return Math.round((60000 / averageInterval) * (1/5));
}