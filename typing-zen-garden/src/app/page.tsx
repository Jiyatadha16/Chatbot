'use client';

import { useState } from 'react';
import TypingGarden from '@/components/TypingGarden';

interface TypingStats {
  wpm: number;
  accuracy: number;
  keyIntervals: number[];
}

export default function Home() {
  const [stats, setStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 0,
    keyIntervals: [],
  });

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-white">
          Typing Zen Garden
        </h1>
        
        <div className="mb-8 text-center text-gray-600 dark:text-gray-300">
          <p className="text-lg mb-4">Find your flow in the garden of keystrokes</p>
          <div className="flex justify-center gap-8">
            <div className="stats">
              <div className="font-mono text-2xl">{stats.wpm}</div>
              <div className="text-sm">WPM</div>
            </div>
            <div className="stats">
              <div className="font-mono text-2xl">{stats.accuracy.toFixed(1)}%</div>
              <div className="text-sm">Accuracy</div>
            </div>
          </div>
        </div>

        <TypingGarden onStatsUpdate={setStats} />
      </div>
    </main>
  );
}