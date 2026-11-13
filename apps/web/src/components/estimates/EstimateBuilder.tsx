'use client';

import React, { useState } from 'react';
import { TranslationDictionary } from '../../lib/i18n';
import { ProjectItem, ModuleItem, Feature, RoleOption, UserOption } from './types';
import { WbsSummaryBar } from './WbsSummaryBar';
import { FeatureRow } from './FeatureRow';
import { TemplateSelectorModal, TemplateCard } from './TemplateSelectorModal';

interface EstimateBuilderProps {
  t: TranslationDictionary;
  simulatedRole: 'OWNER' | 'PM' | 'DEVELOPER';
  currentUserId: string;
  roles: RoleOption[];
  users: UserOption[];
  initialProjects?: ProjectItem[];
}

export const EstimateBuilder: React.FC<EstimateBuilderProps> = ({
  t,
  simulatedRole,
  currentUserId,
  roles,
  users,
  initialProjects,
}) => {
  const isDeveloper = simulatedRole === 'DEVELOPER';

  // Starter templates dataset with example hours
  const starterTemplatesData: TemplateCard[] = [
    {
      id: 'tmpl-ecommerce',
      name: 'E-Commerce Platform (Web & Mobile)',
      templateCategory: 'E_COMMERCE',
      description:
        'Full-featured Ethiopian marketplace with Telebirr & Chapa payment integration [Example Hours - Adjust to Your Project Scope]',
      modulesCount: 3,
      featuresCount: 5,
      totalExampleHours: 254,
    },
    {
      id: 'tmpl-saas',
      name: 'B2B SaaS Application',
      templateCategory: 'SAAS',
      description:
        'Multi-tenant cloud platform with subscription billing, teams and audit log [Example Hours - Adjust to Your Project Scope]',
      modulesCount: 2,
      featuresCount: 2,
      totalExampleHours: 144,
    },
    {
      id: 'tmpl-mobile',
      name: 'Cross-Platform Mobile App',
      templateCategory: 'MOBILE_APP',
      description:
        'iOS & Android application with offline sync and push notifications [Example Hours - Adjust to Your Project Scope]',
      modulesCount: 1,
      featuresCount: 2,
      totalExampleHours: 114,
    },
    {
      id: 'tmpl-landing',
      name: 'Marketing Landing Page',
      templateCategory: 'LANDING_PAGE',
      description:
        'High-converting responsive landing page with contact form and analytics [Example Hours - Adjust to Your Project Scope]',
      modulesCount: 1,
      featuresCount: 1,
      totalExampleHours: 40,
    },
    {
      id: 'tmpl-internal',
      name: 'Internal Operations Tool',
      templateCategory: 'INTERNAL_TOOL',
      description:
        'Custom operations portal with CRUD data tables, CSV exports and workflows [Example Hours - Adjust to Your Project Scope]',
      modulesCount: 1,
      featuresCount: 1,
      totalExampleHours: 52,
    },
    {
      id: 'tmpl-maintenance',
      name: 'Support & Maintenance Retainer',
      templateCategory: 'MAINTENANCE',
      description:
        'Quarterly retainer for security patches, uptime monitoring and bug fixes [Example Hours - Adjust to Your Project Scope]',
      modulesCount: 1,
      featuresCount: 1,
      totalExampleHours: 44,
    },
  ];

  // Default initial project: E-Commerce Storefront
  const defaultInitialProject: ProjectItem = {
    id: 'proj-ecommerce-demo',
    name: 'Addis Artisan E-Commerce Marketplace',
    description: 'Bilingual Ethiopian handicraft & coffee e-commerce store with Telebirr',
    currency: 'ETB',
    isTemplate: false,
    modules: [
      {
        id: 'mod-storefront',
        projectId: 'proj-ecommerce-demo',
        name: 'Storefront & Product Catalog',
        description: 'Customer-facing catalog, search & filtering',
        orderIndex: 0,
        features: [
          {
            id: 'feat-catalog',
            moduleId: 'mod-storefront',
            name: 'Product Listing, Search & Category Filters',
            description: 'Facet search, Amharic search term stemming, pagination',
            method: 'THREE_POINT',
            assignedUserId: 'user-dev-1',
            assignedUserName: 'Dawit Developer',
            orderIndex: 0,
            roleHours: [
              {
                roleId: 'role-fe',
                roleName: 'Frontend Engineer',
                optimisticHours: 16,
                likelyHours: 24,
                pessimisticHours: 40,
                expectedHours: 25.3,
                defaultHourlyCostMinor: 45000,
              },
              {
                roleId: 'role-be',
                roleName: 'Backend Engineer',
                optimisticHours: 12,
                likelyHours: 20,
                pessimisticHours: 32,
                expectedHours: 20.7,
                defaultHourlyCostMinor: 50000,
              },
              {
                roleId: 'role-qa',
                roleName: 'QA Engineer',
                optimisticHours: 6,
                likelyHours: 8,
                pessimisticHours: 14,
                expectedHours: 8.7,
                defaultHourlyCostMinor: 35000,
              },
            ],
          },
          {
            id: 'feat-pdp',
            moduleId: 'mod-storefront',
            name: 'Product Detail & Multi-Angle Image Gallery',
            method: 'SINGLE_VALUE',
            assignedUserId: 'user-dev-2',
            assignedUserName: 'Hiwot Developer',
            orderIndex: 1,
            roleHours: [
              {
                roleId: 'role-fe',
                roleName: 'Frontend Engineer',
                singleHours: 16,
                expectedHours: 16,
                defaultHourlyCostMinor: 45000,
              },
              {
                roleId: 'role-be',
                roleName: 'Backend Engineer',
                singleHours: 8,
                expectedHours: 8,
                defaultHourlyCostMinor: 50000,
              },
              {
                roleId: 'role-qa',
                roleName: 'QA Engineer',
                singleHours: 4,
                expectedHours: 4,
                defaultHourlyCostMinor: 35000,
              },
            ],
          },
        ],
      },
      {
        id: 'mod-checkout',
        projectId: 'proj-ecommerce-demo',
        name: 'Cart & Payment Gateway (Telebirr / Chapa)',
        description: 'Secure checkout with local payment providers',
        orderIndex: 1,
        features: [
          {
            id: 'feat-cart',
            moduleId: 'mod-checkout',
            name: 'Cart State & Stock Reservation Lock',
            method: 'STORY_POINTS',
            assignedUserId: 'user-dev-1',
            assignedUserName: 'Dawit Developer',
            orderIndex: 0,
            roleHours: [
              {
                roleId: 'role-fe',
                roleName: 'Frontend Engineer',
                storyPoints: 3,
                expectedHours: 24,
                defaultHourlyCostMinor: 45000,
              },
              {
                roleId: 'role-be',
                roleName: 'Backend Engineer',
                storyPoints: 5,
                expectedHours: 40,
                defaultHourlyCostMinor: 50000,
              },
            ],
          },
          {
            id: 'feat-telebirr',
            moduleId: 'mod-checkout',
            name: 'Telebirr & Chapa Payment Webhooks & Settlement',
            method: 'THREE_POINT',
            assignedUserId: 'user-dev-2',
            assignedUserName: 'Hiwot Developer',
            orderIndex: 1,
            roleHours: [
              {
                roleId: 'role-be',
                roleName: 'Backend Engineer',
                optimisticHours: 20,
                likelyHours: 32,
                pessimisticHours: 56,
                expectedHours: 34,
                defaultHourlyCostMinor: 50000,
              },
              {
                roleId: 'role-fe',
                roleName: 'Frontend Engineer',
                optimisticHours: 12,
                likelyHours: 16,
                pessimisticHours: 28,
                expectedHours: 17.3,
                defaultHourlyCostMinor: 45000,
              },
            ],
          },
        ],
      },
    ],
  };

  const [projects, setProjects] = useState<ProjectItem[]>(
    initialProjects && initialProjects.length > 0 ? initialProjects : [defaultInitialProject],
  );
  const [activeProjectId, setActiveProjectId] = useState<string>(
    initialProjects && initialProjects.length > 0 && initialProjects[0]
      ? initialProjects[0].id
      : defaultInitialProject.id,
  );
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [newModuleName, setNewModuleName] = useState('');

  const activeProject =
    projects.find((p) => p.id === activeProjectId) ||
    (projects[0] as ProjectItem) ||
    defaultInitialProject;

  // Handle Loading a Template
  const handleSelectTemplate = (templateId: string) => {
    const tmplMeta = starterTemplatesData.find((t) => t.id === templateId);
    if (!tmplMeta) return;

    const newClonedProject: ProjectItem = {
      id: `proj-${Date.now()}`,
      name: `${tmplMeta.name} (Copy)`,
      description: tmplMeta.description
        .replace(/\[Example Hours - Adjust to Your Project Scope\]/g, '')
        .trim(),
      currency: 'ETB',
      isTemplate: false,
      templateCategory: tmplMeta.templateCategory,
      modules: [
        {
          id: `mod-1-${Date.now()}`,
          projectId: `proj-${Date.now()}`,
          name: `${tmplMeta.name} Core Module`,
          orderIndex: 0,
          features: [
            {
              id: `feat-1-${Date.now()}`,
              moduleId: `mod-1-${Date.now()}`,
              name: 'Core Feature 1',
              method: 'THREE_POINT',
              assignedUserId: 'user-dev-1',
              assignedUserName: 'Dawit Developer',
              orderIndex: 0,
              roleHours: [
                {
                  roleId: roles[0]?.id || 'role-fe',
                  roleName: roles[0]?.name || 'Frontend Engineer',
                  optimisticHours: 10,
                  likelyHours: 20,
                  pessimisticHours: 40,
                  expectedHours: 21.7,
                  defaultHourlyCostMinor: roles[0]?.defaultHourlyCostMinor || 45000,
                },
                {
                  roleId: roles[1]?.id || 'role-be',
                  roleName: roles[1]?.name || 'Backend Engineer',
                  optimisticHours: 16,
                  likelyHours: 24,
                  pessimisticHours: 48,
                  expectedHours: 26.7,
                  defaultHourlyCostMinor: roles[1]?.defaultHourlyCostMinor || 50000,
                },
              ],
            },
          ],
        },
      ],
    };

    setProjects([...projects, newClonedProject]);
    setActiveProjectId(newClonedProject.id);
  };

  // Add a new root Module
  const handleAddModule = () => {
    if (!newModuleName.trim() || isDeveloper) return;

    const newMod: ModuleItem = {
      id: `mod-${Date.now()}`,
      projectId: activeProject.id,
      name: newModuleName.trim(),
      orderIndex: activeProject.modules.length,
      features: [],
      children: [],
    };

    const updatedProject = {
      ...activeProject,
      modules: [...activeProject.modules, newMod],
    };

    setProjects(projects.map((p) => (p.id === activeProject.id ? updatedProject : p)));
    setNewModuleName('');
  };

  // Delete Module
  const handleDeleteModule = (moduleId: string) => {
    if (isDeveloper) return;
    const updatedProject = {
      ...activeProject,
      modules: activeProject.modules.filter((m) => m.id !== moduleId),
    };
    setProjects(projects.map((p) => (p.id === activeProject.id ? updatedProject : p)));
  };

  // Add Feature to Module
  const handleAddFeature = (moduleId: string) => {
    if (isDeveloper) return;

    const newFeat: Feature = {
      id: `feat-${Date.now()}`,
      moduleId,
      name: 'New Feature Task',
      method: 'THREE_POINT',
      assignedUserId: undefined,
      orderIndex: 99,
      roleHours: roles.map((r) => ({
        roleId: r.id,
        roleName: r.name,
        expectedHours: 0,
        defaultHourlyCostMinor: r.defaultHourlyCostMinor || 0,
      })),
    };

    const updatedModules = activeProject.modules.map((m) => {
      if (m.id === moduleId) {
        return { ...m, features: [...m.features, newFeat] };
      }
      return m;
    });

    const updatedProject = { ...activeProject, modules: updatedModules };
    setProjects(projects.map((p) => (p.id === activeProject.id ? updatedProject : p)));
  };

  // Update Feature
  const handleUpdateFeature = (updatedFeat: Feature) => {
    const updatedModules = activeProject.modules.map((m) => {
      if (m.id === updatedFeat.moduleId) {
        return {
          ...m,
          features: m.features.map((f) => (f.id === updatedFeat.id ? updatedFeat : f)),
        };
      }
      return m;
    });

    const updatedProject = { ...activeProject, modules: updatedModules };
    setProjects(projects.map((p) => (p.id === activeProject.id ? updatedProject : p)));
  };

  // Delete Feature
  const handleDeleteFeature = (featureId: string) => {
    if (isDeveloper) return;

    const updatedModules = activeProject.modules.map((m) => ({
      ...m,
      features: m.features.filter((f) => f.id !== featureId),
    }));

    const updatedProject = { ...activeProject, modules: updatedModules };
    setProjects(projects.map((p) => (p.id === activeProject.id ? updatedProject : p)));
  };

  return (
    <div>
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📐</span> {t.estimateBuilder}
          </h2>
          <p className="text-xs text-slate-400 mt-1">{t.wbsHierarchy}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Project Selector */}
          <select
            value={activeProject.id}
            onChange={(e) => setActiveProjectId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                📁 {p.name}
              </option>
            ))}
          </select>

          {/* Load Starter Template Modal Button */}
          {!isDeveloper && (
            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium px-3.5 py-2 rounded-lg text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <span>🚀</span> {t.starterTemplates}
            </button>
          )}
        </div>
      </div>

      {/* Sticky / Top Live WBS Summary Bar */}
      <WbsSummaryBar t={t} project={activeProject} roles={roles} simulatedRole={simulatedRole} />

      {/* Modules List (WBS Hierarchy) */}
      <div className="space-y-6">
        {activeProject.modules.map((module) => {
          const moduleTotalHours = module.features.reduce(
            (sum, f) => sum + f.roleHours.reduce((s, rh) => s + (rh.expectedHours || 0), 0),
            0,
          );

          return (
            <div
              key={module.id}
              className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm"
            >
              {/* Module Header */}
              <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-indigo-400 font-mono text-sm">📦</span>
                  <div>
                    <h3 className="font-semibold text-white text-base">{module.name}</h3>
                    {module.description && (
                      <p className="text-xs text-slate-400 mt-0.5">{module.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-indigo-300 bg-indigo-950/70 border border-indigo-800/60 rounded-lg px-2.5 py-1">
                    {Math.round(moduleTotalHours * 10) / 10} hrs
                  </span>

                  {!isDeveloper && (
                    <button
                      onClick={() => handleAddFeature(module.id)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1 rounded-lg border border-slate-700 transition-colors flex items-center gap-1"
                    >
                      <span>+</span> {t.addFeature}
                    </button>
                  )}

                  {!isDeveloper && (
                    <button
                      onClick={() => handleDeleteModule(module.id)}
                      className="text-slate-500 hover:text-rose-400 text-sm p-1 rounded transition-colors"
                      title={t.delete}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>

              {/* Module Features */}
              {module.features.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500 italic bg-slate-950/30 rounded-lg border border-dashed border-slate-800">
                  No features yet in this module. Click &quot;+ {t.addFeature}&quot; above.
                </div>
              ) : (
                module.features.map((feat) => (
                  <FeatureRow
                    key={feat.id}
                    t={t}
                    feature={feat}
                    roles={roles}
                    users={users}
                    simulatedRole={simulatedRole}
                    currentUserId={currentUserId}
                    onUpdateFeature={handleUpdateFeature}
                    onDeleteFeature={handleDeleteFeature}
                  />
                ))
              )}
            </div>
          );
        })}

        {/* Add New Module Input (Owner/PM only) */}
        {!isDeveloper && (
          <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-xl p-4 flex items-center gap-3">
            <input
              type="text"
              value={newModuleName}
              onChange={(e) => setNewModuleName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddModule()}
              placeholder={t.moduleName}
              className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500"
            />
            <button
              onClick={handleAddModule}
              disabled={!newModuleName.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg text-xs transition-colors"
            >
              + {t.addModule}
            </button>
          </div>
        )}
      </div>

      {/* Starter Templates Modal */}
      <TemplateSelectorModal
        t={t}
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        templates={starterTemplatesData}
      />
    </div>
  );
};
