import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';
import { VerificationStatus } from '../../types/product';

interface VerificationBadgeProps {
  status: VerificationStatus;
  score: number;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status,
  score,
  showScore = true,
  size = 'md',
}) => {
  if (status === 'VERIFIED') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/90 rounded-full shadow-xs ${
          size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-sm px-3.5 py-1.5' : 'text-xs px-2.5 py-1'
        }`}
        title="Verified facts backed by OEM documentation and authorized merchant credentials"
      >
        <ShieldCheck className={size === 'sm' ? 'w-3.5 h-3.5 text-emerald-600' : 'w-4 h-4 text-emerald-600'} />
        <span>Verified Evidence</span>
        {showScore && (
          <span className="bg-emerald-600 text-white rounded-full px-1.5 py-0.2 text-[10px] font-bold">
            {score}%
          </span>
        )}
      </div>
    );
  }

  if (status === 'CAUTION') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 font-semibold text-amber-900 bg-amber-50 border border-amber-300 rounded-full shadow-xs ${
          size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-sm px-3.5 py-1.5' : 'text-xs px-2.5 py-1'
        }`}
        title="Unverified merchant or partial evidence claims require user caution"
      >
        <AlertTriangle className={size === 'sm' ? 'w-3.5 h-3.5 text-amber-600' : 'w-4 h-4 text-amber-600'} />
        <span>Review Required</span>
        {showScore && (
          <span className="bg-amber-600 text-white rounded-full px-1.5 py-0.2 text-[10px] font-bold">
            {score}%
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 font-semibold text-rose-800 bg-rose-50 border border-rose-200 rounded-full shadow-xs ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-sm px-3.5 py-1.5' : 'text-xs px-2.5 py-1'
      }`}
      title="Unverified seller or mismatch against official OEM specification"
    >
      <ShieldAlert className={size === 'sm' ? 'w-3.5 h-3.5 text-rose-600' : 'w-4 h-4 text-rose-600'} />
      <span>Unverified Match</span>
      {showScore && (
        <span className="bg-rose-600 text-white rounded-full px-1.5 py-0.2 text-[10px] font-bold">
          {score}%
        </span>
      )}
    </div>
  );
};
