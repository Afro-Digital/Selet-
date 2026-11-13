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
      className={`rounded-2xl border p-4 mb-6 transition-all ${
        isOwnerApproved
          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
          : 'bg-rose-50 border-rose-300 text-rose-950 shadow-sm'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isOwnerApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}
          >
            {isOwnerApproved ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <ShieldAlert className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">
                {isOwnerApproved ? t.ownerApprovedNotice : t.ownerFloorViolated}
              </span>
              <span
                className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                  isOwnerApproved
                    ? 'bg-emerald-200/70 text-emerald-800'
                    : 'bg-rose-200 text-rose-800'
                }`}
              >
                Floor: {(floorMargin * 100).toFixed(0)}% | Current:{' '}
                {(currentMargin * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
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
                className="px-3.5 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Revoke Approval
              </button>
            ) : (
              <button
                onClick={onApprove}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.approveBelowFloor}</span>
              </button>
            )
          ) : (
            !isOwnerApproved && (
              <div className="flex items-center gap-1.5 text-xs text-rose-700 font-semibold bg-rose-100/70 px-3 py-1.5 rounded-lg border border-rose-200">
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
