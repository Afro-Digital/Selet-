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
        return 'bg-emerald-950/70 border-emerald-700/60 text-emerald-400';
      case 'SAAS':
        return 'bg-indigo-950/70 border-indigo-700/60 text-indigo-400';
      case 'MOBILE_APP':
        return 'bg-cyan-950/70 border-cyan-700/60 text-cyan-400';
      case 'LANDING_PAGE':
        return 'bg-amber-950/70 border-amber-700/60 text-amber-400';
      case 'INTERNAL_TOOL':
        return 'bg-purple-950/70 border-purple-700/60 text-purple-400';
      case 'MAINTENANCE':
        return 'bg-rose-950/70 border-rose-700/60 text-rose-400';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🚀</span> {t.starterTemplates}
            </h3>
            <p className="text-xs text-amber-400/90 mt-1 flex items-center gap-1.5">
              <span>ℹ️</span> {t.exampleHoursDisclaimer}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 text-xl leading-none rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 overflow-y-auto">
          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-slate-950/60 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 transition-all duration-150 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getCategoryBadgeColor(
                      tmpl.templateCategory,
                    )}`}
                  >
                    {tmpl.templateCategory.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-semibold text-indigo-400">
                    ~{tmpl.totalExampleHours} hrs
                  </span>
                </div>
                <h4 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                  {tmpl.name}
                </h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                  {tmpl.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span>
                  {tmpl.modulesCount} modules • {tmpl.featuresCount} features
                </span>
                <button
                  onClick={() => {
                    onSelectTemplate(tmpl.id);
                    onClose();
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3 py-1.5 rounded-lg text-xs shadow-sm transition-colors"
                >
                  {t.loadTemplate}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};
