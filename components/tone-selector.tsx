'use client';

import { Button } from './ui/button';
import { Smile, MessageSquare, Flame } from 'lucide-react';

type RoastTone = 'Humorous' | 'Constructive' | 'Brutal';

interface ToneSelectorProps {
  selectedTone: RoastTone;
  onToneSelect: (tone: RoastTone) => void;
}

const tones = [
  {
    value: 'Humorous' as RoastTone,
    label: 'Humorous',
    description: 'Funny and lighthearted critique',
    icon: Smile,
    color: 'blue'
  },
  {
    value: 'Constructive' as RoastTone,
    label: 'Constructive',
    description: 'Balanced feedback with tips',
    icon: MessageSquare,
    color: 'green'
  },
  {
    value: 'Brutal' as RoastTone,
    label: 'Brutal',
    description: 'No holds barred honest roast',
    icon: Flame,
    color: 'red'
  }
];

export function ToneSelector({ selectedTone, onToneSelect }: ToneSelectorProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
        Choose your roast style
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tones?.map?.((tone) => {
          const Icon = tone?.icon;
          const isSelected = selectedTone === tone?.value;
          
          return (
            <button
              key={tone?.value ?? ''}
              onClick={() => onToneSelect?.(tone?.value)}
              className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                isSelected
                  ? 'border-orange-500 bg-orange-50 shadow-lg scale-105'
                  : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    isSelected ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {Icon && <Icon className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{tone?.label ?? ''}</h4>
                  <p className="text-sm text-gray-600">{tone?.description ?? ''}</p>
                </div>
              </div>
            </button>
          );
        }) ?? []}
      </div>
    </div>
  );
}
