// components/ConfidenceRing.tsx
import React from 'react';

interface ConfidenceRingProps {
  score: number; // e.g., 0.87
}

export default function ConfidenceRing({ score }: ConfidenceRingProps) {
  const percent = Math.round(score * 100);
  const ringColor =
    percent >= 85 ? 'text-green-500' :
    percent >= 60 ? 'text-yellow-500' :
    'text-red-500';

  return (
    <div className="p-4 rounded-2xl bg-white shadow flex flex-col items-center justify-center">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full rotate-[-90deg]">
          <circle cx="50%" cy="50%" r="40%" stroke="#e5e7eb" strokeWidth="10" fill="none" />
          <circle
            cx="50%" cy="50%" r="40%"
            stroke="currentColor"
            strokeWidth="10"
            fill="none"
            className={ringColor}
            strokeDasharray="251"
            strokeDashoffset={251 - (251 * percent / 100)}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xl font-semibold">
          {percent}%
        </div>
      </div>
      <div className="mt-2 text-sm text-gray-600">Explanation Confidence</div>
    </div>
  );
}
