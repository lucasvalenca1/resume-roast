'use client';

import { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';

const loadingMessages = [
  'Reading your resume...',
  'Analyzing your experience...',
  'Checking for buzzwords...',
  'Evaluating your skills...',
  'Reviewing formatting choices...',
  'Preparing the roast...'
];

export function LoadingRoast() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % (loadingMessages?.length ?? 1));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="relative">
        <Flame className="w-20 h-20 text-orange-500 animate-pulse" />
        <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl animate-pulse" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-2">
        Roasting Your Resume
      </h2>
      <p className="text-gray-600 animate-pulse">
        {loadingMessages?.[messageIndex] ?? 'Processing...'}
      </p>
      <div className="flex gap-2 mt-6">
        {[0, 1, 2]?.map?.((i) => (
          <div
            key={i}
            className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        )) ?? []}
      </div>
    </div>
  );
}
