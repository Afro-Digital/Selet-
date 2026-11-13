'use client';

import React from 'react';
import { TranslationDictionary } from '../../lib/i18n';

export interface TemplateCard {
  id: string;
  name: string;
  templateCategory: string;
  description: string;
  modulesCount: number;
  featuresCount: number;
  totalExampleHours: number;
}

interface TemplateSelectorModalProps {
  t: TranslationDictionary;
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
  templates: TemplateCard[];
}

export const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({
  t,
  isOpen,
  onClose,
  onSelectTemplate,
  templates,
}) => {
  if (!isOpen) return null;

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'E_COMMERCE':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400';
      case 'SAAS':
        return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-700 dark:text-indigo-400';
      case 'MOBILE_APP':
        return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-700 dark:text-cyan-400';
      case 'LANDING_PAGE':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400';
      case 'INTERNAL_TOOL':
        return 'bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-400';
      case 'MAINTENANCE':
        return 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400';
      default:
        return 'bg-black/[0.04] dark:bg-white/[0.06] border-black/[0.06] dark:border-white/[0.08] text-neutral-700 dark:text-neutral-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[6px] animate-fadeIn">
      <div className="bg-white dark:bg-[#141414] border border-black/[0.08] dark:border-white/[0.1] rounded-[14px] w-full max-w-4xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <span>🚀</span> {t.starterTemplates}
            </h3>
            <p className="text-xs font-mono text-amber-700 dark:text-amber-400 mt-1 flex items-center gap-1.5">
              <span>ℹ️</span> {t.exampleHoursDisclaimer}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-1 text-sm rounded-[7px] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 overflow-y-auto">
          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-black/[0.015] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.08] hover:border-black/[0.2] dark:hover:border-white/[0.2] rounded-[10px] p-4 transition-all duration-150 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-[7px] border ${getCategoryBadgeColor(
                      tmpl.templateCategory,
                    )}`}
                  >
                    {tmpl.templateCategory.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-semibold font-mono text-neutral-900 dark:text-neutral-100">
                    ~{tmpl.totalExampleHours} hrs
                  </span>
                </div>
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors text-sm">
                  {tmpl.name}
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-3 leading-relaxed">
                  {tmpl.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500">
                <span className="font-mono text-[11px]">
                  {tmpl.modulesCount} modules • {tmpl.featuresCount} features
                </span>
                <button
                  onClick={() => {
                    onSelectTemplate(tmpl.id);
                    onClose();
                  }}
                  className="bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-semibold px-3 py-1.5 rounded-[7px] text-xs shadow-sm transition-colors"
                >
                  {t.loadTemplate}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[7px] text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 border border-black/[0.08] dark:border-white/[0.08] hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};
