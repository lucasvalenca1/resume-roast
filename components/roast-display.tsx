'use client';

import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Download, Share2 } from 'lucide-react';
import { Button } from './ui/button';

interface RoastSection {
  title: string;
  content: string;
  score?: number;
  issues?: string[];
  suggestions?: string[];
}

interface RoastDisplayProps {
  roastData: {
    id: string;
    filename: string;
    roastType: string;
    content: string;
    sections?: RoastSection[];
    scores?: {
      overall: number;
      formatting: number;
      content: number;
      experience: number;
      skills: number;
    };
  };
}

export function RoastDisplay({ roastData }: RoastDisplayProps) {
  const handleShare = async () => {
    if (navigator?.share) {
      try {
        await navigator?.share?.({
          title: 'My Resume Roast',
          text: 'Check out my resume roast!',
          url: window?.location?.href ?? ''
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const getScoreColor = (score?: number): string => {
    const safeScore = score ?? 0;
    if (safeScore >= 80) return 'text-green-600';
    if (safeScore >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score?: number) => {
    const safeScore = score ?? 0;
    if (safeScore >= 70) return <TrendingUp className="w-5 h-5" />;
    return <TrendingDown className="w-5 h-5" />;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-8 text-white mb-8 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Resume Roast</h1>
            <p className="text-orange-100">{roastData?.filename ?? 'Resume'}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-orange-100 mb-1">Roast Style</p>
            <p className="text-xl font-bold">{roastData?.roastType ?? 'Standard'}</p>
          </div>
        </div>
        {roastData?.scores?.overall !== undefined && (
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Overall Score</span>
              <div className="flex items-center gap-2">
                <span className="text-4xl font-bold">{roastData?.scores?.overall ?? 0}</span>
                <span className="text-2xl">/100</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-8">
        <Button
          onClick={handleShare}
          variant="outline"
          className="flex-1 border-orange-500 text-orange-600 hover:bg-orange-50"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>

      {/* Overall Roast */}
      <div className="bg-white rounded-xl p-8 shadow-lg mb-8 border-2 border-orange-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-orange-500" />
          The Roast
        </h2>
        <div className="prose prose-lg max-w-none text-gray-700">
          <p className="whitespace-pre-wrap leading-relaxed">{roastData?.content ?? 'No roast content available.'}</p>
        </div>
      </div>

      {/* Detailed Scores */}
      {roastData?.scores && (
        <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Score Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(roastData?.scores ?? {})?.map?.(([key, value]) => {
              if (key === 'overall') return null;
              return (
                <div key={key} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900 capitalize">
                      {key?.replace?.('_', ' ') ?? key}
                    </span>
                    <div className={`flex items-center gap-2 font-bold ${getScoreColor(value as number)}`}>
                      {getScoreIcon(value as number)}
                      <span>{value ?? 0}/100</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        (value as number) >= 80
                          ? 'bg-green-500'
                          : (value as number) >= 60
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${value ?? 0}%` }}
                    />
                  </div>
                </div>
              );
            }) ?? []}
          </div>
        </div>
      )}

      {/* Section Analysis */}
      {roastData?.sections && roastData?.sections?.length > 0 && (
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Section Analysis</h2>
          <div className="space-y-6">
            {roastData?.sections?.map?.((section, index) => (
              <div key={index} className="border-l-4 border-orange-500 pl-6 py-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{section?.title ?? 'Section'}</h3>
                  {section?.score !== undefined && (
                    <div className={`flex items-center gap-2 font-bold ${getScoreColor(section?.score)}`}>
                      {getScoreIcon(section?.score)}
                      <span>{section?.score ?? 0}/100</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-700 mb-4">{section?.content ?? ''}</p>
                {section?.issues && section?.issues?.length > 0 && (
                  <div className="bg-red-50 rounded-lg p-4 mb-3">
                    <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Issues Found
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-red-700">
                      {section?.issues?.map?.((issue, i) => (
                        <li key={i}>{issue}</li>
                      )) ?? []}
                    </ul>
                  </div>
                )}
                {section?.suggestions && section?.suggestions?.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Suggestions
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-green-700">
                      {section?.suggestions?.map?.((suggestion, i) => (
                        <li key={i}>{suggestion}</li>
                      )) ?? []}
                    </ul>
                  </div>
                )}
              </div>
            )) ?? []}
          </div>
        </div>
      )}
    </div>
  );
}
