'use client';

import React from 'react';
import { TranslationDictionary } from '../../lib/i18n';
import { UserRole } from '../../types';
import { ShieldAlert, CheckCircle2, Lock } from 'lucide-react';

interface CommercialFloorGuardProps {
  t: TranslationDictionary;
  userRole: UserRole;
  currentMargin: number; // e.g. 0.12 for 12%
  floorMargin: number; // e.g. 0.15 for 15%
  isOwnerApproved: boolean;
  onApprove?: () => void;
  onRevoke?: () => void;
}

export const CommercialFloorGuard: React.FC<CommercialFloorGuardProps> = ({
  t,
  userRole,
  currentMargin,
  floorMargin,
  isOwnerApproved,
  onApprove,
  onRevoke,
}) => {
  const isOwner = userRole === 'OWNER';
  const isViolated = currentMargin < floorMargin;

  if (!isViolated && !isOwnerApproved) {
    return null;
  }

  return (
    <div
      className={`rounded-[10px] border p-4 mb-6 transition-all ${
        isOwnerApproved
          ? 'bg-emerald-500/[0.08] dark:bg-emerald-500/[0.12] border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
          : 'bg-rose-500/[0.08] dark:bg-rose-500/[0.12] border-rose-500/30 text-rose-950 dark:text-rose-200 shadow-sm'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-[7px] flex items-center justify-center shrink-0 ${
              isOwnerApproved
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                : 'bg-rose-500/20 text-rose-700 dark:text-rose-400'
            }`}
          >
            {isOwnerApproved ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <ShieldAlert className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs">
                {isOwnerApproved ? t.ownerApprovedNotice : t.ownerFloorViolated}
              </span>
              <span
                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-[7px] border ${
                  isOwnerApproved
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-300'
                }`}
              >
                Floor: {(floorMargin * 100).toFixed(0)}% | Current:{' '}
                {(currentMargin * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              {isOwnerApproved
                ? 'An Organization Owner has authorized pricing below the baseline margin floor for this quote.'
                : 'Project Managers cannot save or issue a quote below the organization floor without explicit Owner approval.'}
            </p>
          </div>
        </div>

        <div>
          {isOwner ? (
            isOwnerApproved ? (
              <button
                onClick={onRevoke}
                className="px-3 py-1.5 bg-white dark:bg-[#181818] border border-black/[0.08] dark:border-white/[0.08] hover:bg-black/[0.02] dark:hover:bg-white/[0.04] text-neutral-800 dark:text-neutral-200 font-semibold text-xs rounded-[7px] transition-colors cursor-pointer"
              >
                Revoke Approval
              </button>
            ) : (
              <button
                onClick={onApprove}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-[7px] shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t.approveBelowFloor}</span>
              </button>
            )
          ) : (
            !isOwnerApproved && (
              <div className="flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-400 font-semibold bg-rose-500/10 px-3 py-1.5 rounded-[7px] border border-rose-500/20 font-mono">
                <Lock className="w-3.5 h-3.5" />
                <span>{t.ownerApprovalRequired}</span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
